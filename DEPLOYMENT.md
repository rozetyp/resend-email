# Deployment Guide

## Local Development

```bash
# Terminal 1: Start the API proxy
node api-proxy.js

# Terminal 2: Serve the HTML
python3 -m http.server 9000
```

Then open `http://localhost:9000/index.html`

## Railway Deployment

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Connect your repo** (GitHub):
   - New Project → GitHub Repo
   - Select this repo

3. **Railway auto-detects `railway.json`** and starts the proxy

4. **Get your Railway URL** (looks like `your-app-xxxxx.railway.app`)

5. **Update your HTML file location:**
   - Host `index.html` on GitHub Pages or a static host
   - Or modify `railway.json` to serve both proxy + static files

6. **In your HTML**, the `API_URL` will auto-detect:
   - Local: `http://localhost:3001`
   - Railway: `https://your-app-xxxxx.railway.app`

## How It Works

```
Browser (index.html)
    ↓ (CORS-friendly)
API Proxy (api-proxy.js on Railway)
    ↓ (Server-to-server, no CORS issues)
Resend API (https://api.resend.com)
```

Your API key is sent from the browser to your proxy (same origin), then from your proxy to Resend. It never touches external servers.
