# Resend Pad

A minimal email utility to send emails using your Resend API key.

**Send emails from your browser. No code, no accounts, no storage.**

## Quick Start

### Online (Railway Deployment)
```
Landing Page:  https://resendpad.up.railway.app/landing.html
Email Editor:  https://resendpad.up.railway.app/index.html
```

### Local Development
```bash
node api-proxy.js
# Landing page: http://localhost:3001/landing.html
# Email editor: http://localhost:3001/index.html
```

## How It Works

1. **Paste your API key** into the form (stored only in browser memory)
2. **Load your verified domains** from Resend with "Load Domains" button (or enter From email manually)
3. **Add recipients** – comma-separated To/CC/BCC with live validation
4. **Compose your email** using the rich text editor with formatting toolbar
5. **Attach files** if needed – multiple files supported
6. **Click Send** – your email is delivered via Resend immediately
7. **Check Sent tab** – browse sent emails, see delivery status, click any row to read the full email body

## Features

- **Rich Text Editor**: Format emails with bold, italic, underline, headings, lists, links, code blocks via Quill.js
- **File Attachments**: Attach multiple files to your emails. Files are base64-encoded client-side and sent via Resend's API. Never touch our server.
- **Multiple Recipients**: Send to multiple To/CC/BCC addresses using comma-separated emails with inline validation
- **Sent Inbox**: Browse all sent emails with delivery status (delivered, bounced, opened, clicked). Click any row to read the full email body.
- **Domain Loader**: Fetch verified sender domains directly from your Resend account with one click
- **Reply Threading**: Paste email headers from Gmail's "Show original" to link replies to existing conversation threads (Gmail, Outlook, Apple Mail, Thunderbird compatible)
- **Mobile Friendly**: Works on desktop, tablet, and mobile browsers
- **No Account Required**: BYOK (Bring Your Own Key) – just paste your Resend API key

## Reply Threading

1. Open the original email in Gmail → **Show original**
2. Copy all text (Ctrl+A / Cmd+A)
3. In Resend Pad, click **Connect Thread** and paste
4. Form auto-fills To, Subject (with Re:), and threading headers (Message-ID, References)
5. Type your reply and send – appears in the same conversation thread

## Security & Privacy

- **Your API key never leaves your control** – sent directly to Resend's API in the Authorization header. Never stored, logged, or persisted on our servers.
- **No email content is logged** – email subject and body are forwarded to Resend and discarded. No database, no history, no backups.
- **No user accounts or tracking** – no sign-up, no login, no email collection, no analytics, no cookies.
- **Transparent & auditable** – full source code on GitHub. Self-host if you want complete control.
- **Stateless design** – the proxy doesn't store anything. Restart the server and everything is cleared.

**API Key Safety:**
- Your key is sent in HTTP headers only
- Never logged to disk in production
- Lost when container restarts (no persistence)
- You can rotate keys anytime in Resend dashboard

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
- API key is passed through, never stored or logged

## Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Resend account with an API key ([resend.com/api-keys](https://resend.com/api-keys))
- At least one verified domain in Resend

**Note:** "Sending Only" keys cannot list domains, but can send emails if you manually enter the From address.

## Deployment

### Railway (Recommended)
```bash
railway up
```
Railway runs `node api-proxy.js` on the default PORT, serves static files, proxies API calls through `/api/*`.

[Deploy to Railway](https://railway.com?referralCode=CEnEQp) – both of us get $5 credit.

### Self-Hosted
```bash
git clone https://github.com/rozetyp/resend-email.git
cd resend-email
node api-proxy.js
```

Works on Vercel, Netlify, or any Node.js server. Auto-detects environment.

## Technical Stack

**Frontend:** HTML5 + Vanilla JavaScript (no frameworks), Tailwind CSS (CDN), Quill.js rich text editor

**Backend:** Node.js + native HTTP server, proxies to Resend API, serves static files, handles CORS

## License

Open source. Use freely.

## Support

- [Open an issue on GitHub](https://github.com/rozetyp/resend-email/issues)
- Check the source code in `index.html` and `api-proxy.js`
