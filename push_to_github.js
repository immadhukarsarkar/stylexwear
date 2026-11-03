const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
const envPath = path.join(__dirname, '.env');
let TOKEN = process.env.GITHUB_TOKEN;
let REPO = process.env.GITHUB_REPO || 'stylexwear';
let OWNER = process.env.GITHUB_OWNER || 'immadhukarsarkar';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...vals] = trimmed.split('=');
    const val = vals.join('=').trim();
    if (key.trim() === 'GITHUB_TOKEN') TOKEN = val;
    if (key.trim() === 'GITHUB_REPO') REPO = val;
    if (key.trim() === 'GITHUB_OWNER') OWNER = val;
  });
}

if (!TOKEN) {
  console.error('Error: GITHUB_TOKEN not found in .env');
  process.exit(1);
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function syncAll() {
  console.log(`Syncing all files to GitHub (https://github.com/${OWNER}/${REPO})...`);

  const ignoreList = new Set([
    'node_modules',
    '.git',
    '.env',
    'package-lock.json',
    'server.ps1',
    'remove_bg.ps1'
  ]);

  const files = [];

  function scan(dir, rel = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      if (ignoreList.has(it.name)) continue;
      if (it.name.endsWith('.log') || it.name.endsWith('.bat')) continue;

      const full = path.join(dir, it.name);
      const relative = rel ? `${rel}/${it.name}` : it.name;

      if (it.isDirectory()) {
        if (it.name !== 'api' && it.name !== 'netlify') continue;
        scan(full, relative);
      } else {
        const stats = fs.statSync(full);
        if (stats.size > 15 * 1024 * 1024) continue;
        files.push({ full, relative });
      }
    }
  }

  scan(__dirname);

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const content = fs.readFileSync(f.full).toString('base64');

    const check = await makeRequest({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${f.relative}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'Antigravity-Agent',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const body = {
      message: `Auto-sync update: ${f.relative}`,
      content
    };

    if (check.status === 200 && check.data.sha) {
      body.sha = check.data.sha;
    }

    const upload = await makeRequest({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${f.relative}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'Antigravity-Agent',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, body);

    if (upload.status === 200 || upload.status === 201) {
      console.log(`[${i + 1}/${files.length}] Synced: ${f.relative}`);
    } else {
      console.error(`[${i + 1}/${files.length}] Failed: ${f.relative}`);
    }
  }

  console.log(`\nAll files synced successfully to https://github.com/${OWNER}/${REPO}`);
}

syncAll();
