# Resend Pad

A minimal email utility to send emails using your Resend API key.

**Simple. Trustworthy. Works everywhere.**

## Overview

- **Client-Side UI**: Single HTML file frontend
- **Lightweight Proxy**: Node.js proxy handles CORS (no API key exposure)
- **Trustworthy**: API key is only used in HTTP headers, never logged or stored
- **Open Source**: Full source code visible; audit the security yourself
- **Works Anywhere**: Deploy to Railway, Vercel, self-hosted, or local

## Quick Start

### Online (Railway Deployment)
```
Landing Page:  https://resendpad.up.railway.app/landing.html
Email Editor:  https://resendpad.up.railway.app/index.html
```

### Local Development
```bash
# Terminal 1: Start the API proxy
node api-proxy.js

# Terminal 2: Open the app in browser
# Landing page: http://localhost:3001/landing.html
# Email editor: http://localhost:3001/index.html
# Or open index.html directly (auto-detects localhost:3001)
```

## How It Works

1. **Paste your API key** into the form
2. **Load your verified domains** (optional - or enter manually)
3. **Compose your email** using the rich text editor
4. **Preview** before sending (optional)
5. **Send** - proxied through your local/deployed server to Resend API

## Features

- **WYSIWYG Editor**: Rich text formatting with Pell
- **Domain Loader**: Fetch verified domains from your Resend account
- **Batch Sending**: Keep form filled, just change recipient
- **Error Handling**: Clear error messages from Resend API
- **Responsive**: Works on desktop, tablet, and mobile
- **SEO Landing Page**: Dedicated landing page for organic traffic
- **BYOK Model**: Bring Your Own Key – no accounts required

## Security

- **API key never logged** – Used only in HTTP Authorization header
- **No data storage** – No databases, no caching, no analytics
- **No user accounts** – Just you and your key
- **Open source** – Check the code yourself
- **Proxy pattern** – CORS is handled server-side, not exposed to browser

## Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Resend account with an API key
- At least one verified domain in Resend (or manually entered verified domain)

## Getting Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Go to Settings → API Keys
4. Create a new API key with "Full Access" permissions
5. Copy and paste into Resend Pad

**Note:** "Sending Only" keys cannot list domains, but can send emails if you manually enter the From address.

## Verified Domain Setup

1. In Resend dashboard, go to Domains
2. Add a new domain and verify ownership (DNS records)
3. Once verified, you can use that domain in Resend Pad

## Deployment

### Railway (Recommended - Easiest)

```bash
# Already deployed and live at:
# https://resendpad.up.railway.app

# To redeploy after changes:
railway up
```

**How it works:**
- Railway runs `node api-proxy.js` on the default PORT
- Frontend files served from root `/`:
  - `index.html` (email editor)
  - `landing.html` (SEO landing page)
  - `sitemap.xml` and `robots.txt` (SEO metadata)
- API calls proxied through `/api/*` endpoints
- Auto-detects production domain and routes accordingly

### Self-Hosted (Vercel, Netlify, own server)

```bash
# 1. Clone repo
git clone https://github.com/rozetyp/resend-email.git
cd resend-email

# 2. Deploy with your provider
# Vercel/Netlify: Connect repo, auto-deploys
# Own server: npm install && node api-proxy.js

# 3. App auto-detects environment
# - Local: uses http://localhost:3001
# - Production: uses your deployed domain
```

### Local Development (No deployment)

```bash
# Just open index.html in your browser
# API calls will attempt localhost:3001
# Start proxy with: node api-proxy.js
```

## Technical Stack

**Frontend:**
- HTML5 + Vanilla JavaScript (no frameworks)
- Tailwind CSS (CDN) for styling
- Pell for rich text editing
- SEO-optimized landing page
- Favicon (inline SVG)

**Backend:**
- Node.js + native HTTP server
- Proxies requests to Resend API
- Serves static files (index.html, landing.html, sitemap.xml, robots.txt)
- Handles CORS automatically
- Auto-detects environment (localhost vs. production)

## How the Proxy Works

```
Browser                    Your Server (api-proxy.js)       Resend API
  │                              │                              │
  ├─ POST /api/send ────────────>│                              │
  │  (with Bearer token)         ├─ POST /emails ──────────────>│
  │                              │  (with your API key)         │
  │                              │<─ 200 OK ────────────────────┤
  │<─ 200 OK ─────────────────────┤                              │
  │                              │                              │
```

**Why a proxy?**
- Resend API doesn't support CORS from browsers
- Proxy handles CORS transparently
- API key is passed through, never exposed to browser
- All requests logged on server for debugging

## Privacy

This tool:
- ❌ Does NOT collect your personal data
- ❌ Does NOT log email content (only request status)
- ❌ Does NOT use analytics or trackers
- ✅ IS 100% open source
- ✅ CAN be self-hosted for complete privacy

**API Key Safety:**
- Your key is sent in HTTP headers only
- Never logged to disk in production
- Lost when container restarts (no persistence)
- You can rotate keys anytime in Resend dashboard

## License

Open source. Use freely.

## Support

Issues? Questions?
- [Open an issue on GitHub](https://github.com/rozetyp/resend-email/issues)
- Check the source code in `index.html` and `api-proxy.js`


