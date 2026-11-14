// Resend Pad server: static files from ./public plus a pass-through proxy to the Resend API.
// The proxy exists because Resend rejects browser (CORS) requests. The user's API key arrives
// in the Authorization header and is forwarded as-is. Nothing is stored, and nothing about
// the email (recipients, subject, body, headers) is ever logged.

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BODY_BYTES = 45 * 1024 * 1024; // Resend caps an email at 40MB after base64

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  const { pathname, search } = new URL(req.url, 'http://localhost');
  res.on('finish', () => {
    // Log the route shape only; email ids and query strings stay out of the logs.
    const route = pathname.startsWith('/api/email/') ? '/api/email/:id' : pathname;
    console.log(`${req.method} ${route} ${res.statusCode}`);
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (pathname.startsWith('/api/')) {
    const apiKey = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!apiKey) return sendJson(res, 401, { error: 'Missing API key' });

    if (req.method === 'POST' && pathname === '/api/send') {
      return readBody(req, res, body => forward(res, 'POST', '/emails', apiKey, body));
    }
    if (req.method === 'GET' && pathname === '/api/domains') {
      return forward(res, 'GET', '/domains', apiKey);
    }
    if (req.method === 'GET' && pathname === '/api/sent') {
      return forward(res, 'GET', `/emails${search}`, apiKey);
    }
    if (req.method === 'GET' && pathname.startsWith('/api/email/')) {
      const id = decodeSafe(pathname.slice('/api/email/'.length));
      if (!id) return sendJson(res, 400, { error: 'Missing email id' });
      return forward(res, 'GET', `/emails/${encodeURIComponent(id)}`, apiKey);
    }
    return sendJson(res, 404, { error: 'Not found' });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return sendText(res, 405, 'Method Not Allowed');
  serveStatic(pathname, res);
});

function serveStatic(pathname, res) {
  const decoded = decodeSafe(pathname);
  const filePath = path.resolve(PUBLIC_DIR, '.' + (decoded === '/' ? '/index.html' : decoded));
  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()];

  if (decoded === null || !filePath.startsWith(PUBLIC_DIR + path.sep) || !contentType) {
    return sendText(res, 404, '404 Not Found');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) return sendText(res, 404, '404 Not Found');
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Collect the request body as bytes (not strings) so multi-byte characters split
// across chunks are not corrupted.
function readBody(req, res, done) {
  const chunks = [];
  let size = 0;
  let aborted = false;
  req.on('data', chunk => {
    if (aborted) return;
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      aborted = true;
      sendJson(res, 413, { error: 'Request too large. Resend accepts up to 40MB per email.' });
      req.resume();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    if (!aborted) done(Buffer.concat(chunks));
  });
}

function forward(res, method, resendPath, apiKey, body) {
  const headers = { Authorization: `Bearer ${apiKey}` };
  if (body) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = body.length;
  }

  const upstream = https.request({ hostname: 'api.resend.com', path: resendPath, method, headers }, resendRes => {
    const chunks = [];
    resendRes.on('data', chunk => chunks.push(chunk));
    resendRes.on('end', () => {
      res.writeHead(resendRes.statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(Buffer.concat(chunks));
    });
  });

  upstream.on('error', error => {
    console.error(`Resend request failed: ${error.message}`);
    sendJson(res, 502, { error: 'Failed to contact Resend API' });
  });

  if (body) upstream.write(body);
  upstream.end();
}

function decodeSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function sendJson(res, status, obj) {
  if (res.headersSent) return;
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

server.listen(PORT, () => {
  console.log(`Resend Pad listening on port ${PORT}`);
});
