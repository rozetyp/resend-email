End-to-end testing

Quick manual/e2e tests for the Resend BYOK app.

Manual (UI):

- Start the server:

```bash
uvicorn app.main:app --reload
```

- Open `http://127.0.0.1:8000` and send a test email to an inbox you control.

Automated (script):

- Use the included script to post form data to the running server. This is useful for CI-style checks (but it actually sends email via Resend).

```bash
# set a real RESEND_API_KEY in .env or environment
python scripts/e2e_send.py --to you@example.com --subject "E2E test" --body "<p>hello</p>"
```

Notes:
- These tests perform real sends; don't point them at users without consent.
- For safe CI, mock Resend API responses using `requests-mock` or run isolated integration tests that stub external calls.
