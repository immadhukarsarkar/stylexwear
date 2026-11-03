const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4'
};

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Parse URL & decode URI components
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);

  // ── API ROUTES ──
  if (pathname === '/api/save-products' && req.method === 'POST') {
    const data = await readJsonBody(req);
    if (data.code || data.products) {
      const code = data.code || `const PRODUCTS = ${JSON.stringify(data.products, null, 2)};\n`;
      fs.writeFileSync(path.join(ROOT, 'products.js'), code, 'utf8');
      
      try {
        const { atomicPush } = require('./git_atomic_push');
        atomicPush('Admin Console: update products catalog').catch(err => console.error('Auto-sync error:', err));
      } catch(e) {}

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: true, message: 'Products saved and synced to GitHub' }));
      return;
    }
  }

  if (pathname === '/api/upload-image' && req.method === 'POST') {
    const data = await readJsonBody(req);
    if (data.filename && data.base64) {
      const cleanName = Date.now() + '_' + path.basename(data.filename).replace(/[^a-zA-Z0-9._-]/g, '');
      const imgPath = path.join(ROOT, 'images', cleanName);
      const rawBase64 = data.base64.replace(/^data:image\/[a-z]+;base64,/, '');
      fs.writeFileSync(imgPath, Buffer.from(rawBase64, 'base64'));

      try {
        const { atomicPush } = require('./git_atomic_push');
        atomicPush(`Admin Console: upload image ${cleanName}`).catch(err => console.error('Auto-sync error:', err));
      } catch(e) {}

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: true, url: `images/${cleanName}` }));
      return;
    }
  }

  if (pathname === '/api/sync-github' && req.method === 'POST') {
    try {
      const { atomicPush } = require('./git_atomic_push');
      atomicPush('Manual admin sync').catch(err => console.error('Sync error:', err));
    } catch(e) {}
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(path.join(ROOT, pathname));
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    let filePathToServe = safePath;
    if (stats.isDirectory()) {
      filePathToServe = path.join(safePath, 'index.html');
    }

    fs.readFile(filePathToServe, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${pathname}`);
        return;
      }

      const ext = path.extname(filePathToServe).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': data.length,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(data);
    });
  });
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`====================================================`);
  console.log(`  StyleXWear Website Live on Local Server!`);
  console.log(`====================================================`);
  console.log(`  > Local PC:     http://localhost:${PORT}/`);
  console.log(`  > Mobile/LAN:   http://${localIP}:${PORT}/`);
  console.log(`====================================================`);
});
