const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function ghRequest(method, apiPath, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method: method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'StyleXWear-Agent',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function atomicPush(commitMessage = 'Update StyleXWear storefront and admin console') {
  console.log(`Starting Atomic Git Push to https://github.com/${OWNER}/${REPO}...`);

  // 1. Get current HEAD commit of main branch
  const refRes = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  if (refRes.status !== 200 || !refRes.data.object) {
    console.error('Failed to get HEAD commit:', refRes.data);
    return false;
  }
  const currentHeadCommitSha = refRes.data.object.sha;
  console.log(`Current HEAD commit: ${currentHeadCommitSha.slice(0, 7)}`);

  // 2. Get tree of current HEAD commit
  const commitRes = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/commits/${currentHeadCommitSha}`);
  if (commitRes.status !== 200 || !commitRes.data.tree) {
    console.error('Failed to get commit tree:', commitRes.data);
    return false;
  }
  const baseTreeSha = commitRes.data.tree.sha;
  console.log(`Base Tree SHA: ${baseTreeSha.slice(0, 7)}`);

  // 3. Scan local files
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
        if (stats.size > 20 * 1024 * 1024) continue;
        files.push({ full, relative });
      }
    }
  }
  scan(__dirname);

  // 4. Get remote tree recursive so we can compare blobs and only create blobs for new/modified files
  console.log('Fetching remote tree for diffing...');
  const treeRecRes = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/trees/${baseTreeSha}?recursive=1`);
  const remoteMap = new Map();
  if (treeRecRes.status === 200 && Array.isArray(treeRecRes.data.tree)) {
    treeRecRes.data.tree.forEach(item => {
      if (item.type === 'blob') {
        remoteMap.set(item.path, item.sha);
      }
    });
  }

  const treeEntries = [];
  let changedCount = 0;

  for (const f of files) {
    const buf = fs.readFileSync(f.full);
    const localSha = crypto.createHash('sha1')
      .update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf]))
      .digest('hex');

    const remoteSha = remoteMap.get(f.relative);

    if (remoteSha === localSha) {
      // Unchanged file: retain existing blob
      treeEntries.push({
        path: f.relative,
        mode: '100644',
        type: 'blob',
        sha: remoteSha
      });
    } else {
      // Changed or new file: upload blob
      console.log(`Uploading modified blob: ${f.relative}...`);
      const blobRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
        content: buf.toString('base64'),
        encoding: 'base64'
      });

      if (blobRes.status === 201 && blobRes.data.sha) {
        treeEntries.push({
          path: f.relative,
          mode: '100644',
          type: 'blob',
          sha: blobRes.data.sha
        });
        changedCount++;
      } else {
        console.error(`Failed to create blob for ${f.relative}:`, blobRes.data);
      }
    }
  }

  if (changedCount === 0) {
    console.log('No local files changed compared to remote repository.');
    return true;
  }

  console.log(`Changes detected: ${changedCount} files modified. Creating new Git tree with ${treeEntries.length} entries...`);

  // 5. Create new Git tree
  const newTreeRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
    tree: treeEntries
  });

  if (newTreeRes.status !== 201 || !newTreeRes.data.sha) {
    console.error('Failed to create tree:', newTreeRes.data);
    return false;
  }
  const newTreeSha = newTreeRes.data.sha;
  console.log(`New Tree created: ${newTreeSha.slice(0, 7)}`);

  // 6. Create single commit
  console.log(`Creating single atomic commit: "${commitMessage}"...`);
  const newCommitRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: commitMessage,
    tree: newTreeSha,
    parents: [currentHeadCommitSha]
  });

  if (newCommitRes.status !== 201 || !newCommitRes.data.sha) {
    console.error('Failed to create commit:', newCommitRes.data);
    return false;
  }
  const newCommitSha = newCommitRes.data.sha;
  console.log(`New Commit created: ${newCommitSha.slice(0, 7)}`);

  // 7. Update branch ref
  console.log(`Updating main branch to ${newCommitSha.slice(0, 7)}...`);
  const updateRefRes = await ghRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/main`, {
    sha: newCommitSha,
    force: true
  });

  if (updateRefRes.status === 200) {
    console.log(`\nSUCCESS! Branch main updated to ${newCommitSha.slice(0, 7)}`);
    console.log(`Triggered deployment on GitHub Pages & Vercel.`);
    return true;
  } else {
    console.error('Failed to update branch ref:', updateRefRes.data);
    return false;
  }
}

if (require.main === module) {
  const msg = process.argv.slice(2).join(' ') || 'Deploy StyleXWear admin console & typography updates';
  atomicPush(msg);
}

module.exports = { atomicPush };
