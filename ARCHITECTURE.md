# Resend Pad - Architecture

## Overview

**Resend Pad** is a 100% client-side email utility. No backend. No server relay. Your API key stays in your browser.

## Design Principles

### ✅ What It Does

1. **Accepts Resend API Key** from user (password field, visible only in browser)
2. **Fetches Verified Domains** directly from Resend API (client-side)
3. **Composes Email** with rich text editor (Pell)
4. **Sends Email** directly from browser to `https://api.resend.com/emails`
5. **Shows Result** with email ID or error message

### ❌ What It Does NOT Do

- **Does NOT send API key to any server** (ours or third-party)
- **Does NOT store data** (no databases, no caches, no logs)
- **Does NOT track users** (no analytics, no cookies, no pixels)
- **Does NOT require authentication** (no accounts, no signup)
- **Does NOT persist data** (form clears on refresh)

## Technical Stack

```
┌─────────────────────────────────────┐
│         Resend Pad (index.html)     │
│  ┌─────────────────────────────┐    │
│  │   HTML5 + Vanilla JS + CSS  │    │
│  │  (No frameworks, no build)  │    │
│  └─────────────────────────────┘    │
│              │                       │
│              ├─→ Tailwind CSS (CDN)  │
│              ├─→ Pell Editor (CDN)   │
│              └─→ Resend API (CORS)   │
│                                      │
└─────────────────────────────────────┘
```

### Dependencies

- **Tailwind CSS** (CDN) - Styling
- **Pell** (CDN) - Rich text editor
- **Fetch API** (native) - HTTP calls
- **Nothing else** - No npm, no build step, no complexity

## API Calls (All Direct from Browser)

### 1. Load Verified Domains

```javascript
fetch('https://api.resend.com/domains', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
```

**Flow:** User enters API key → clicks "Load Domains" → browser calls Resend API → shows domain list → user selects domain

**Security:** API key used only in this request, never stored

### 2. Send Email

```javascript
fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: userEmail,
    to: [recipientEmail],
    subject: userSubject,
    html: userBody
  })
})
```

**Flow:** User fills form → clicks "Send Email" → browser validates → calls Resend API → shows result with email ID

**Security:** API key used only in this request, never sent to any other server

## User Experience

### 1. Open Page
- User opens `index.html` (from GitHub Pages, local file, or self-hosted URL)
- Page loads instantly (single HTML file, ~19KB)

### 2. Enter API Key
- User pastes Resend API key into password field
- Key stays in browser memory only

### 3. Load Domains (Optional)
- Click "Load Domains" button
- Browser fetches verified domains from Resend API
- Domains shown as clickable buttons
- Click to auto-populate "From" field

### 4. Fill Form
- From: verified email address
- To: recipient email
- Subject: email subject
- Body: rich text editor with formatting

### 5. Preview (Optional)
- Click "Preview" button
- See formatted email in modal

### 6. Send
- Click "Send Email" button
- Browser validates form
- Calls Resend API directly
- Shows success with email ID or error message

### 7. Try Again
- Form stays populated
- Can modify and resend
- Or reload page to clear

## Security Model

### API Key Handling

| Stage | Location | Safety |
|-------|----------|--------|
| **Input** | Password field in browser | ✅ Only visible to user |
| **Memory** | JavaScript variable | ✅ Lost when page closes |
| **API Call** | HTTPS direct to Resend | ✅ Encrypted in transit |
| **Logging** | Nowhere | ✅ Never logged |
| **Storage** | Nowhere | ✅ Never persisted |

### CORS Configuration

- All API calls go directly from browser to `https://api.resend.com`
- Resend API allows CORS for Bearer token auth
- No proxy or relay needed

### No Backend Required

This means:
- ✅ Nothing to deploy (no servers, no scaling, no downtime)
- ✅ Nothing to hack (no backend to compromise)
- ✅ Nothing to trust (only Resend, which users already trust)

## Deployment Options

### 1. GitHub Pages (Recommended)

```bash
# Already set up in this repo
# URL: https://rozetyp.github.io/resend-email/
```

**Pros:**
- Instant, free, always available
- Source code visible in repo
- Users can audit the code
- No backend complexity

### 2. Self-Hosted (Any Static Host)

```bash
# Netlify
netlify deploy --prod --dir .

# Vercel
vercel --prod

# S3
aws s3 cp index.html s3://your-bucket/

# Any web server
cp index.html /var/www/html/
```

**Pros:**
- Full control
- Can add custom domain
- Can add basic auth if desired

### 3. Local File

```bash
# Download index.html
# Open in browser: file:///path/to/index.html
# Works completely offline
```

**Pros:**
- Maximum privacy
- No network calls except to Resend

## Development

### No Build Step

```bash
# Just edit index.html
# Open in browser
# Test immediately
```

### Updating Pell or Tailwind

Edit the CDN links in `<head>`:

```html
<!-- Update version in CDN URL -->
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pell@1.0.2/dist/pell.min.css" />
```

### Adding Features

Edit JavaScript in `<script>` tag:

```javascript
// All code is in index.html
// No separate files needed
// Keep it minimal and focused
```

## Testing

### Manual Testing

1. Open `index.html` in browser
2. Enter valid Resend API key
3. Click "Load Domains" → verify domains appear
4. Fill form with test data
5. Click "Preview" → verify formatting
6. Click "Send Email" → verify success message with email ID
7. Check recipient inbox for email

### Automated Testing

Since this is client-side, testing is tricky. Use:

```bash
# Open in headless browser
# Use Puppeteer, Playwright, or similar
# Simulate form fills and clicks
# Verify success messages
```

## Maintenance

### Updates Needed When

- Resend API changes (rare)
- Pell API changes (rare)
- Tailwind classes change (rare)
- Browser compatibility issues (very rare)

### How to Update

1. Edit `index.html`
2. Test in browser
3. Commit to git
4. Push to GitHub
5. Changes live instantly on GitHub Pages

## Future Considerations

### Could Add (Without Backend)

- ✅ Multiple email recipients (CSV paste)
- ✅ Email templates (localStorage, user's browser)
- ✅ Scheduled sends (user's local scheduler)
- ✅ Dark mode toggle (localStorage preference)
- ✅ Keyboard shortcuts (all client-side)

### Should NOT Add (Would Require Backend)

- ❌ User accounts
- ❌ Email history
- ❌ Shared templates across users
- ❌ Team workspaces
- ❌ API to save/restore forms

**Philosophy:** Keep it minimal. One job, done well.

## Philosophy

This app exists because:

1. **Trust is paramount for API key tools**
   - Users need to verify their key is safe
   - Only way to prove this: no backend

2. **Simplicity is security**
   - Fewer moving parts = fewer things to break
   - Fewer things to exploit

3. **Utility apps should be boring**
   - Do one thing
   - Do it well
   - Get out of the way

4. **Users own their data**
   - Not us, not advertisers, not AI companies
   - Just the user and Resend

---

**Resend Pad: The simplest, most trustworthy way to send emails with Resend.**
