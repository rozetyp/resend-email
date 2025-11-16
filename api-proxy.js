// Minimal API proxy for Resend
// This allows the browser app to securely call Resend without exposing API key
// The API key is passed by the client, then proxied to Resend

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:3001';

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only proxy POST to /api/send and GET to /api/domains
  if (req.method === 'POST' && req.url === '/api/send') {
    handleSendEmail(req, res);
  } else if (req.method === 'GET' && req.url === '/api/domains') {
    handleGetDomains(req, res);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
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
      
      if (!apiKey) {
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
      
      const resendReq = https.request(options, (resendRes) => {
        let responseBody = '';
        
        resendRes.on('data', chunk => {
          responseBody += chunk;
        });
        
        resendRes.on('end', () => {
          res.writeHead(resendRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(responseBody);
        });
      });
      
      resendReq.on('error', (error) => {
        console.error('Resend API error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to contact Resend API' }));
      });
      
      resendReq.write(body);
      resendReq.end();
      
    } catch (error) {
      console.error('Parse error:', error);
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}

function handleGetDomains(req, res) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey) {
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
  
  const resendReq = https.request(options, (resendRes) => {
    let body = '';
    
    resendRes.on('data', chunk => {
      body += chunk;
    });
    
    resendRes.on('end', () => {
      res.writeHead(resendRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(body);
    });
  });
  
  resendReq.on('error', (error) => {
    console.error('Resend API error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Failed to contact Resend API' }));
  });
  
  resendReq.end();
}

server.listen(PORT, () => {
  console.log(`✓ API proxy running on ${API_URL}`);
  console.log(`  - POST /api/send (with Bearer token)`);
  console.log(`  - GET /api/domains (with Bearer token)`);
});
