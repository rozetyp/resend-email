import os
import secrets
from dotenv import load_dotenv
from email.utils import parseaddr

import requests
from fastapi import FastAPI, Request, Form, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import base64

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
DEFAULT_FROM = os.getenv("DEFAULT_FROM", "")
ADMIN_USER = os.getenv("ADMIN_USER")
ADMIN_PASS = os.getenv("ADMIN_PASS")
REQUIRE_AUTH = os.getenv("REQUIRE_AUTH", "0").lower() in ("1", "true", "yes")

if not RESEND_API_KEY:
    raise RuntimeError("RESEND_API_KEY is not set")

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Simple in-memory cache for domains
DOMAINS_CACHE = {"data": [], "fetched_at": 0}
DOMAINS_TTL = 60  # seconds


def verify_basic(request: Request = None):
    """Verify HTTP Basic only when REQUIRE_AUTH is enabled.

    By default REQUIRE_AUTH is false so local testing does not require login.
    Set `REQUIRE_AUTH=1` in your `.env` to enable auth enforcement.
    This implementation reads the `Authorization` header directly to avoid
    triggering FastAPI's `HTTPBasic` dependency when auth is disabled.
    """
    if not REQUIRE_AUTH:
        return True

    # If auth is required, ensure credentials are configured
    if not (ADMIN_USER and ADMIN_PASS):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth required but ADMIN_USER/ADMIN_PASS not configured",
        )

    auth = None
    if request is not None:
        auth = request.headers.get("Authorization") or request.headers.get("authorization")

    if not auth or not auth.lower().startswith("basic "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )

    try:
        token = auth.split(" ", 1)[1].strip()
        decoded = base64.b64decode(token).decode("utf-8")
        username, password = decoded.split(":", 1)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Basic"},
        )

    correct_user = secrets.compare_digest(username, ADMIN_USER)
    correct_pass = secrets.compare_digest(password, ADMIN_PASS)
    if not (correct_user and correct_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True


def fetch_verified_domains(api_key: str = None):
    """Fetch verified domains from Resend API and cache results.

    Returns a list of domain strings (e.g. ['example.com']).
    If api_key is provided, uses it for the request; otherwise uses RESEND_API_KEY.
    Each key gets its own cache entry.
    """
    import time

    key = api_key or RESEND_API_KEY
    cache_key = f"domains_{hash(key)}"
    
    # Use separate cache for different keys
    if cache_key not in DOMAINS_CACHE:
        DOMAINS_CACHE[cache_key] = {"data": [], "fetched_at": 0, "error": None}
    
    cache = DOMAINS_CACHE[cache_key]
    now = time.time()
    
    if cache["data"] and now - cache["fetched_at"] < DOMAINS_TTL:
        return cache["data"]

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    try:
        resp = requests.get("https://api.resend.com/domains", headers=headers, timeout=5)
        # If the API returns a non-2xx status we capture the error message
        if resp.status_code != 200:
            try:
                err = resp.json()
                cache["error"] = err.get("message") or str(err)
            except Exception:
                cache["error"] = f"HTTP {resp.status_code}"
            return cache.get("data", [])
        payload = resp.json()
        # payload shape may vary; expect list under 'domains' or top-level list
        domains = []
        if isinstance(payload, dict):
            # common shape: {"domains": [{"domain":"example.com", ...}, ...]}
            items = payload.get("domains") or payload.get("data") or []
            for it in items:
                if isinstance(it, dict):
                    d = it.get("domain") or it.get("name")
                    if d:
                        domains.append(d)
        elif isinstance(payload, list):
            for it in payload:
                if isinstance(it, dict):
                    d = it.get("domain") or it.get("name")
                    if d:
                        domains.append(d)
        cache["data"] = domains
        cache["error"] = None
        cache["fetched_at"] = now
        return domains
    except Exception:
        # On any error, store a simple error marker and return last cached value (possibly empty)
        cache["error"] = "failed to fetch domains"
        return cache.get("data", [])


def is_domain_verified(from_email: str, domains: list[str]) -> bool:
    """Return True if the domain part of `from_email` is in the `domains` list.

    Uses `parseaddr` to extract the email address and compares domains case-insensitively.
    """
    try:
        addr = parseaddr(from_email)[1] or ""
        if "@" not in addr:
            return False
        domain = addr.split("@", 1)[1].lower()
        return any(domain == d.lower() for d in domains)
    except Exception:
        return False


@app.get("/", response_class=HTMLResponse)
async def index(request: Request, _auth=Depends(verify_basic)):
    domains = fetch_verified_domains()
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "default_from": DEFAULT_FROM,
            "domains": domains,
            "domains_error": DOMAINS_CACHE.get("error"),
        },
    )


@app.post("/send", response_class=HTMLResponse)
async def send_email(
    request: Request,
    from_email: str = Form(...),
    to_email: str = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    api_key: str = Form(default=""),
    _auth=Depends(verify_basic),
):
    error = None
    result = None

    # Use client-provided key if available, otherwise fall back to server key
    key_to_use = api_key.strip() if api_key else RESEND_API_KEY
    
    # very basic validation
    if not from_email or not to_email or not subject or not body:
        error = "All fields are required."
    elif not key_to_use:
        error = "API key is required. Paste your Resend API key in the field at the top."
    elif "@" not in parseaddr(from_email)[1] or "@" not in parseaddr(to_email)[1]:
        error = "Invalid from or to email address."
    else:
        # Server-side domain validation: ensure From's domain is verified in Resend
        # Use the provided key for domain validation if available
        domains = fetch_verified_domains(key_to_use if api_key else None)
        if domains:
            if not is_domain_verified(from_email, domains):
                error = (
                    "The From address domain is not verified in Resend. "
                    "Choose a verified domain or verify your domain in Resend."
                )
        # If domains couldn't be fetched (empty list), we allow send but do not validate
        if not error:
            try:
                payload = {
                    "from": from_email,
                    "to": [to_email],
                    "subject": subject,
                    "html": body,
                }

                headers = {
                    "Authorization": f"Bearer {key_to_use}",
                    "Content-Type": "application/json",
                }

                resp = requests.post(
                    "https://api.resend.com/emails", json=payload, headers=headers, timeout=10
                )
                resp.raise_for_status()
                result = resp.json()

            except Exception as e:
                error = f"Error sending email: {e}"

    domains = fetch_verified_domains(key_to_use if api_key else None)
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "default_from": from_email,
            "domains": domains,
            "domains_error": DOMAINS_CACHE.get("error"),
            "last_to": to_email,
            "last_subject": subject,
            "last_body": body,
            "error": error,
            "result": result,
        },
    )
