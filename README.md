# Resend Pad

A minimal, 100% client-side utility to send emails using your Resend API key.

**No server. No backend. Your API key stays in your browser.**

## Overview

- **Pure Client-Side**: Single HTML file, no backend required
- **Trustworthy**: API key is never sent to our servers—only to Resend's API directly
- **Open Source**: Full source code visible; audit the security yourself
- **Standalone**: Works offline, can be hosted anywhere (GitHub Pages, S3, locally)
- **Minimal**: One job: compose and send emails with your Resend key

## Quick Start

### Option 1: Open Online (Easiest)
```
https://rozetyp.github.io/resend-email/index.html
```

### Option 2: Download & Run Locally
1. Download `index.html` from this repo
2. Open in your browser
3. Paste your Resend API key
4. Send emails

## How It Works

1. **Paste your API key** into the form (it stays in your browser)
2. **Select a verified domain** from Resend (or use "Load Domains" to fetch them)
3. **Compose your email** using the rich text editor
4. **Preview** the email before sending
5. **Send** directly from your browser to Resend's API

Your API key is **never** sent to our servers. It's used only to authenticate directly with Resend.

## Features

- **WYSIWYG Editor**: Rich text formatting with Pell
- **Domain Loader**: Fetch and auto-populate verified domains from your Resend account
- **Email Preview**: See exactly how your email will look
- **Direct API Call**: Sends to `https://api.resend.com/emails` from your browser
- **Error Handling**: Clear error messages from Resend's API
- **Responsive**: Works on desktop, tablet, and mobile

## Security

- **API key never logged** – Used only in your browser memory
- **No data storage** – No databases, no caching, no tracking
- **No user accounts** – Just you and your key
- **Open source** – Check the code yourself
- **CORS direct call** – Resend API is called directly from your browser

## Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Resend account with an API key
- At least one verified domain in Resend

## Getting Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Go to Settings → API Keys
4. Copy your API key (starts with `re_`)

## Verified Domain Setup

1. In Resend dashboard, go to Domains
2. Add a new domain and verify ownership (DNS records)
3. Once verified, you can use that domain in Resend Pad

## Deployment

### GitHub Pages (Recommended)
The repo is already set up for GitHub Pages. The `index.html` is served at:
```
https://rozetyp.github.io/resend-email/
```

### Self-Hosted
Download `index.html` and host it anywhere:
- Vercel, Netlify, S3
- Your own server
- Open it locally (works offline)

### Local Development
No server needed. Just open `index.html` in your browser.

## Technical Details

- **HTML5** + **Vanilla JavaScript** (no frameworks)
- **Tailwind CSS** for styling
- **Pell** for rich text editing
- **Fetch API** for direct CORS calls to Resend

## Privacy

This tool:
- ❌ Does NOT collect your data
- ❌ Does NOT log your emails
- ❌ Does NOT use analytics or trackers
- ❌ Does NOT store your API key
- ✅ IS 100% open source
- ✅ CAN be self-hosted

## License

Open source. Use freely.

## Support

Issues? Questions?
- [Open an issue on GitHub](https://github.com/rozetyp/resend-email/issues)
- Check the source code in `index.html`

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

