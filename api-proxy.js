// Minimal API proxy for Resend + Static file server
// This allows the browser app to securely call Resend without exposing API key
// The API key is passed by the client, then proxied to Resend

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:3001';

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('[PREFLIGHT] Responding to OPTIONS request');
    res.writeHead(200);
    res.end();
    return;
  }

  // Route API calls
  if (req.method === 'POST' && req.url === '/api/send') {
    res.setHeader('Content-Type', 'application/json');
    handleSendEmail(req, res);
  } else if (req.method === 'GET' && req.url === '/api/domains') {
    res.setHeader('Content-Type', 'application/json');
    handleGetDomains(req, res);
  } else {
    // Serve static files (index.html for root)
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    // Security: prevent directory traversal
    const realPath = path.resolve(filePath);
    const baseDir = path.resolve(__dirname);
    
    if (!realPath.startsWith(baseDir)) {
      console.log('[SECURITY] Directory traversal attempt blocked:', req.url);
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log('[404] File not found:', filePath);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      
      // Set content type based on file extension
      let contentType = 'text/plain';
      if (filePath.endsWith('.html')) contentType = 'text/html';
      else if (filePath.endsWith('.css')) contentType = 'text/css';
      else if (filePath.endsWith('.js')) contentType = 'application/javascript';
      else if (filePath.endsWith('.json')) contentType = 'application/json';
      else if (filePath.endsWith('.xml')) contentType = 'application/xml';
      else if (filePath.endsWith('.txt')) contentType = 'text/plain';
      
      console.log('[SERVE] Serving file:', filePath, 'as', contentType);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
});

function handleSendEmail(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const apiKey = req.headers.authorization?.replace('Bearer ', '');
      
      console.log('[SEND] Request received');
      console.log('[SEND] API Key present:', !!apiKey);
      console.log('[SEND] Payload:', JSON.stringify(data));
      
      if (!apiKey) {
        console.log('[SEND] ERROR: Missing API key');
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Missing API key' }));
        return;
      }
      
      // Forward to Resend API
      const options = {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(body)
        }
      };
      
      console.log('[SEND] Forwarding to Resend API...');
      
      const resendReq = https.request(options, (resendRes) => {
        let responseBody = '';
        
        console.log('[SEND] Resend response status:', resendRes.statusCode);
        
        resendRes.on('data', chunk => {
          responseBody += chunk;
        });
        
        resendRes.on('end', () => {
          console.log('[SEND] Resend response body:', responseBody);
          res.writeHead(resendRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(responseBody);
        });
      });
      
      resendReq.on('error', (error) => {
        console.error('[SEND] ERROR: Resend request failed:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to contact Resend API', details: error.message }));
      });
      
      resendReq.write(body);
      resendReq.end();
      
    } catch (error) {
      console.error('[SEND] Parse error:', error.message);
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}

function handleGetDomains(req, res) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  console.log('[DOMAINS] Request received');
  console.log('[DOMAINS] API Key present:', !!apiKey);
  
  if (!apiKey) {
    console.log('[DOMAINS] ERROR: Missing API key');
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Missing API key' }));
    return;
  }
  
  const options = {
    hostname: 'api.resend.com',
    path: '/domains',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  };
  
  console.log('[DOMAINS] Forwarding to Resend API...');
  
  const resendReq = https.request(options, (resendRes) => {
    let body = '';
    
    console.log('[DOMAINS] Resend response status:', resendRes.statusCode);
    
    resendRes.on('data', chunk => {
      body += chunk;
    });
    
    resendRes.on('end', () => {
      console.log('[DOMAINS] Resend response body:', body);
      res.writeHead(resendRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(body);
    });
  });
  
  resendReq.on('error', (error) => {
    console.error('[DOMAINS] ERROR: Resend request failed:', error.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Failed to contact Resend API', details: error.message }));
  });
  
  resendReq.end();
}

server.listen(PORT, () => {
  console.log(`✓ API proxy running on ${API_URL}`);
  console.log(`  - POST /api/send (with Bearer token)`);
  console.log(`  - GET /api/domains (with Bearer token)`);
});
