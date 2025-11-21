# Resend Pad

A minimal email utility to send emails using your Resend API key.

**Send emails from your browser. No code, no accounts, no storage.**

## Overview

- **Browser-Based UI**: No installation. Open in any modern browser and start sending.
- **CORS Proxy**: Node.js backend handles API communication (Resend API doesn't accept browser requests directly).
- **API Key Privacy**: Your Resend API key is sent directly to Resend's API in request headers. Never stored, logged, or persisted on our servers.
- **Open Source**: Full source code visible. Self-host or audit the security yourself.
- **Deploy Anywhere**: Railway (easiest), Vercel, Netlify, or any server running Node.js.

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

1. **Paste your API key** into the form (stored only in browser memory)
2. **Load your verified domains** from Resend with "Load Domains" button (or enter From email manually)
3. **Enter recipient email and subject**
4. **Compose your email** using the Quill rich text editor with formatting toolbar
5. **Click Send** – your email is delivered via Resend immediately
6. **Use Reset** to clear all fields and start fresh (focus returns to editor for easy typing)

## Features

- **Rich Text Editor**: Format emails with bold, italic, underline, headings, lists, links, code blocks, and clean formatting using Quill.js
- **Domain Loader**: Fetch verified sender domains directly from your Resend account with one click
- **Reset Function**: Clear all form fields and editor content with Reset button that properly returns focus to editor
- **Batch Sending**: Reuse form values – just change the recipient email for each send
- **Clear Error Messages**: Know exactly why a send failed (invalid domain, auth errors, etc.)
- **Mobile Friendly**: Works on desktop, tablet, and mobile browsers
- **SEO Landing Page**: Dedicated page at `/landing.html` to drive organic search traffic  
- **No Account Required**: BYOK (Bring Your Own Key) – just paste your Resend API key

## Security

- **Your API key never leaves your control** – Sent directly to Resend's API in the Authorization header. We don't store, log, or persist it.
- **No email content is logged** – Email subject and body are forwarded to Resend and discarded. No database, no history, no backups.
- **No user accounts or tracking** – No sign-up, no login, no email collection, no analytics, no cookies.
- **Transparent & auditable** – Full source code on GitHub. Self-host if you want complete control.
- **Stateless design** – The proxy doesn't store anything. Restart the server and everything is cleared.

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

**New to Railway?** [Deploy to Railway with referral](https://railway.com?referralCode=CEnEQp) – both of us get $5 credit.

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
- Quill.js for rich text editing (replaced Pell for better reliability)
- SEO-optimized landing page with comprehensive meta tags
- Favicon (inline SVG)
- Google Site Verification for Search Console

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


