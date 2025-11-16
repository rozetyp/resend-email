# Resend Pad - Architecture

## Overview

**Resend Pad** is a simple email utility with a lightweight Node.js proxy. 

**Key principle:** API keys are passed through, never stored or logged.

## Design Principles

### ✅ What It Does

1. **Frontend** (index.html) - User interface for composing emails
   - Accepts Resend API Key from user (password field)
   - Fetches verified domains from Resend API (via proxy)
   - Provides rich text editor (Pell)
   - Sends emails via proxy endpoint

2. **Backend** (api-proxy.js) - CORS proxy server
   - Proxies requests to Resend API
   - Handles CORS transparently
   - Serves static files (index.html)
   - Logs request metadata for debugging

### ❌ What It Does NOT Do

- **Does NOT store API keys** (used only in request headers)
- **Does NOT store email content** (passed through only)
- **Does NOT require user authentication** (no accounts needed)
- **Does NOT track users** (no analytics, no cookies)
- **Does NOT persist data** (stateless)

## Technical Architecture

```
┌──────────────────────────────────────────────────┐
│              Resend Pad Application              │
├──────────────────────────────────────────────────┤
│                                                  │
│  Frontend                                        │
│  ┌────────────────────────────────────────────┐  │
│  │ index.html (Single HTML file)              │  │
│  │ - HTML5 + Vanilla JS + Tailwind CSS        │  │
│  │ - Pell rich text editor                    │  │
│  │ - Form handling & validation               │  │
│  │ - Fetch API calls                          │  │
│  └────────────────────────────────────────────┘  │
│          │                                       │
│          │ HTTP/HTTPS                           │
│          ▼                                       │
│  Backend                                         │
│  ┌────────────────────────────────────────────┐  │
│  │ api-proxy.js (Node.js)                     │  │
│  │ - Simple HTTP server                       │  │
│  │ - Routes /api/* to Resend                  │  │
│  │ - Serves static files (index.html)         │  │
│  │ - CORS handling                            │  │
│  │ - Request logging                          │  │
│  └────────────────────────────────────────────┘  │
│          │                                       │
│          │ HTTPS (with Bearer token)            │
│          ▼                                       │
└──────────────────────────────────────────────────┘
                      │
                      │ HTTPS
                      ▼
         ┌─────────────────────────┐
         │   Resend API            │
         │ api.resend.com/emails   │
         │ api.resend.com/domains  │
         └─────────────────────────┘
```

## API Proxy Endpoints

### `POST /api/send`
Sends an email via Resend API

**Request:**
```javascript
{
  from: "sender@domain.com",
  to: ["recipient@example.com"],
  subject: "Email subject",
  html: "<p>Email body HTML</p>"
}
```

**Headers:**
```
Authorization: Bearer re_xxxxx
Content-Type: application/json
```

**Response:**
```javascript
{ id: "4477c96e-c260-4bb2-a316-7e57038fe54d" }
```

### `GET /api/domains`
Fetches user's verified domains

**Headers:**
```
Authorization: Bearer re_xxxxx
```

**Response:**
```javascript
{
  data: [
    { id: "1", name: "domain1.com", status: "verified" },
    { id: "2", name: "domain2.com", status: "verified" }
  ]
}
```

### `GET /` (Root)
Serves `index.html` - the frontend application

## Data Flow

### 1. User Opens App
```
Browser → Server → Serves index.html
```

### 2. User Loads Domains
```
Browser                           
  ├─ User enters API key
  ├─ User clicks "Load Domains"
  │
  └─→ POST http://localhost:3001/api/domains
      {Authorization: "Bearer re_xxxxx"}
      
      │→ api-proxy.js
         ├─ Reads Authorization header
         ├─ Logs request metadata
         │
         └─→ HTTPS https://api.resend.com/domains
             {Authorization: "Bearer re_xxxxx"}
             
             ←─ Response: [domain list]
        
        ←─ Returns response to browser
        
  ←─ Browser displays domains
```

### 3. User Sends Email
```
Browser
  ├─ User fills form
  ├─ User clicks "Send"
  │
  └─→ POST http://localhost:3001/api/send
      {
        from: "...",
        to: ["..."],
        subject: "...",
        html: "..."
      }
      {Authorization: "Bearer re_xxxxx"}
      
      │→ api-proxy.js
         ├─ Reads Authorization header
         ├─ Logs request metadata (no email content)
         │
         └─→ HTTPS https://api.resend.com/emails
             {Authorization: "Bearer re_xxxxx"}
             [email data]
             
             ←─ Response: {id: "..."}
        
        ←─ Returns response to browser
        
  ←─ Browser shows success with email ID
```

## Security Model

### API Key Handling

| Stage | Location | Safety |
|-------|----------|--------|
| **Input** | Password field in browser | ✅ Visible only to user |
| **Transit 1** | Browser → Proxy | ✅ HTTP Authorization header (localhost or HTTPS) |
| **Proxy** | Memory, not stored | ✅ Only read from headers, never persisted |
| **Transit 2** | Proxy → Resend | ✅ HTTPS with Authorization header |
| **Resend** | Resend systems | ✅ Resend's responsibility |
| **Logging** | Server logs | ⚠️ Only request metadata, no keys or email content |

### What Gets Logged

✅ Safe to log:
- Request path (`/api/send`, `/api/domains`)
- Request method (GET, POST)
- Response status code (200, 401, 429, etc.)
- Timestamp
- Hostname/region

❌ Never logged:
- Authorization header content
- Request body content
- Email addresses or subject
- Email HTML body

### CORS Handling

**Problem:** Resend API doesn't accept CORS requests from browsers

**Solution:** Proxy forwards requests server-to-server
- Browser calls proxy (same origin, no CORS needed)
- Proxy calls Resend (server-to-server, no CORS issues)
- Proxy returns response to browser (no CORS needed)

## Deployment Architecture

### Local Development
```bash
node api-proxy.js  # Starts on http://localhost:3001
# Open index.html in browser
# API URL auto-detects: http://localhost:3001
```

### Production (Railway)
```bash
# api-proxy.js runs on PORT (default 8080)
# Automatically detects production domain
# API URL: https://resendpad.up.railway.app
# index.html served from root /
```

### Environment Detection
```javascript
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : `${window.location.protocol}//${window.location.host}`;
```

## Deployment Options

### Railway (Recommended)
- Automatic deployment from GitHub
- Automatic HTTPS
- Automatic domain routing
- Auto-scales to handle load

**How to deploy:**
```bash
railway link         # Connect to project
railway up          # Deploy latest code
railway logs        # View logs
```

### Self-Hosted (Vercel, Netlify, own server)
- Clone repo
- Deploy: `npm install && node api-proxy.js`
- Requires Node.js 18+
- Auto-detects production domain

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
EXPOSE 3001
CMD ["node", "api-proxy.js"]
```

## Scaling Considerations

### Current Limitations
- Single server instance (no load balancing)
- No database (stateless)
- No caching (each request fresh)

### How to Scale
1. **Horizontally:** Deploy multiple instances behind load balancer (Railway handles this)
2. **Rate limiting:** Add middleware to prevent abuse
3. **Caching:** Add Redis for domain caching if needed
4. **Monitoring:** Use Railway dashboard to monitor request volume

## Future Additions (Low Priority)

### Could Add Without Major Changes
- ✅ Email templates (localStorage, client-side only)
- ✅ Send history (localStorage, browser-only)
- ✅ Keyboard shortcuts (client-side only)
- ✅ Dark mode toggle (localStorage preference)
- ✅ Multiple recipients (already supported)

### Should NOT Add (Avoid Complexity)
- ❌ User accounts (defeats purpose)
- ❌ Email history database (centralized storage)
- ❌ Shared templates (requires backend DB)
- ❌ Analytics (violates privacy principle)

## Philosophy

This app is built on a simple principle:

> **Minimal code, maximum trust.**

Why a proxy instead of 100% client-side?

1. **Browser can't handle CORS to Resend** - so proxy solves it
2. **Proxy is stateless** - no persistence, no tracking
3. **API key is passed through** - never stored or logged
4. **Transparent and auditable** - all code visible, simple logic
5. **Works everywhere** - same behavior locally or deployed

The proxy adds ONE level of indirection for technical reasons (CORS), but maintains the trust model: keys are never stored, never logged, never exposed beyond the request header.

---

**Resend Pad: The simplest, most trustworthy way to send emails with Resend.**

