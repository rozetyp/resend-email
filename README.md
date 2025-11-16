# Resend BYOK (minimal)

Tiny self-hosted mailer that uses your Resend API key to send emails from your verified domain.

Overview

- Server: FastAPI (`app/main.py`) exposes a small HTML form and a `/send` endpoint that calls Resend's HTTP API.
- UI: simple Jinja2 template at `app/templates/index.html` (From / To / Subject / Body).
- BYOK: you provide the Resend API key via environment variable `RESEND_API_KEY`.

Quick start (local)

1. Copy `.env.example` to `.env` and set `RESEND_API_KEY` and `DEFAULT_FROM`.

```bash
cp .env.example .env
# edit .env and set RESEND_API_KEY and DEFAULT_FROM
```

2. Install dependencies and run locally (preferably in a virtualenv):

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

3. Open `http://127.0.0.1:8000` and use the UI to send a test email.

Configuration (env vars)

- `RESEND_API_KEY` (required): your Resend API key, e.g. `re_...`.
- `DEFAULT_FROM` (optional): default From address, e.g. `Anton <no-reply@example.com>`.
- `REQUIRE_AUTH` (optional, default `0`): set to `1` to require HTTP Basic auth for the UI and `/send`.
- `ADMIN_USER` / `ADMIN_PASS` (optional): credentials used when `REQUIRE_AUTH=1`.

Testing & E2E

- Manual: start the server and use the web form; verify the recipient inbox.
- Scripted: a small script `scripts/e2e_send.py` posts to `/send` for quick automated checks (it performs real sends).

Example (scripted):

```bash
# ensure RESEND_API_KEY is set to a real key
python scripts/e2e_send.py --to you@example.com --subject "E2E test" --body "<p>hello</p>"
```

Notes about domains

- The app attempts to list verified domains from Resend and presents a small domain dropdown to populate the `From` field.
- The dropdown constructs addresses like `no-reply@yourdomain` or `Name <no-reply@yourdomain>` using the name part of `DEFAULT_FROM`.

Security & deployment notes

- This project is intended as a tiny internal tool. The `/send` endpoint triggers real email sends using your `RESEND_API_KEY`. If you deploy publicly, protect it.
- Recommended protections:
	- Set `REQUIRE_AUTH=1` and configure `ADMIN_USER`/`ADMIN_PASS`, or require an `X-API-KEY` token.
	- Add rate-limiting to prevent abuse.
	- Run behind an authenticated network or reverse proxy (Cloudflare/railway auth, or private network).
	- Log send attempts (avoid logging secrets) and monitor usage.

CI / safe testing

- For CI, mock the Resend API (use `requests-mock` or `responses`) and test the FastAPI handlers with `TestClient` to avoid sending real email.

Extending

- Replace raw HTTP calls with the official `resend` Python SDK if you prefer client helpers.
- Add saved templates, a domain selector that validates server-side, or multi-tenant BYOK in future iterations.

License / notes

- This is a tiny internal tool example — use at your own risk and do not commit real secrets to the repo.

