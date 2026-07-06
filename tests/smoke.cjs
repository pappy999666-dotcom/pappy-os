const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const appPort = 3460;
const pfpPort = 4161;
const whatsappPort = 4162;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pappy-smoke-'));

function jsonServer(port, routes) {
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const route = routes[`${req.method} ${req.url}`];
      res.setHeader('Content-Type', 'application/json');
      if (!route) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'missing route' }));
        return;
      }
      const parsed = body ? JSON.parse(body) : undefined;
      res.end(JSON.stringify(route(parsed, req.headers)));
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

async function waitForHealth() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${appPort}/api/health`);
      if (response.ok) return response.json();
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('server did not become healthy');
}

async function post(pathname, payload) {
  const response = await fetch(`http://127.0.0.1:${appPort}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal(response.ok, true, `${pathname} returned ${response.status}`);
  return response.json();
}

(async () => {
  const pfpServer = await jsonServer(pfpPort, {
    'POST /pair': (body, headers) => ({ pairingCode: 'PFP-1234', qrCode: 'mock-qr', phone: body.phone, owner: headers['x-pappy-owner'] }),
    'POST /profile-picture': (body, headers) => ({ message: 'pfp updated', detectedAspect: `${body.width}x${body.height}`, owner: headers['x-pappy-owner'] }),
  });
  const whatsappServer = await jsonServer(whatsappPort, {
    'GET /stats': (_body, headers) => ({ phone: '250700000000', status: 'connected', pairedAt: null, botName: 'verbose-fishstick', botAvatar: 'avatar', groupCount: 3, userCount: 9, commandsCount: 12, cpu: 2.1, memory: 151, owner: headers['x-pappy-owner'] }),
    'POST /pair': (body, headers) => ({ pairingCode: 'BOT-5678', status: 'pairing', phone: body.phone, owner: headers['x-pappy-owner'] }),
    'POST /action': (body, headers) => ({ status: body.action === 'logout' ? 'disconnected' : 'connected', message: `action:${body.action}`, owner: headers['x-pappy-owner'] }),
  });

  const app = spawn(process.execPath, ['dist/server.cjs'], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(appPort),
      PAPPY_DATA_DIR: dataDir,
      PFP_BOT_API_URL: `http://127.0.0.1:${pfpPort}`,
      PFP_BOT_API_TOKEN: 'pfp-token',
      PFP_BOT_OWNER_ID: 'pfp-owner',
      WHATSAPP_BOT_API_URL: `http://127.0.0.1:${whatsappPort}`,
      WHATSAPP_BOT_API_TOKEN: 'whatsapp-token',
      WHATSAPP_BOT_OWNER_ID: 'whatsapp-owner',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  app.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

  try {
    const health = await waitForHealth();
    assert.equal(health.success, true);
    assert.equal(health.bots.pfp, true);
    assert.equal(health.bots.whatsapp, true);

    const html = await fetch(`http://127.0.0.1:${appPort}/`);
    assert.equal(html.ok, true);
    assert.match(await html.text(), /<div id="root"><\/div>/);

    const pfpPair = await post('/api/pfp-bot/pair', { phone: '250788888888', method: 'code' });
    assert.equal(pfpPair.source, 'pappy-pfp');
    assert.equal(pfpPair.owner, 'pfp-owner');

    const pfpUpload = await post('/api/pfp-bot/upload-immediate', { phone: '250788888888', imageData: 'data:image/png;base64,AAAA', width: 640, height: 960 });
    assert.equal(pfpUpload.source, 'pappy-pfp');
    assert.equal(pfpUpload.owner, 'pfp-owner');

    const stats = await fetch(`http://127.0.0.1:${appPort}/api/whatsapp-bot/stats`).then((res) => res.json());
    assert.equal(stats.source, 'verbose-fishstick');
    assert.equal(stats.stats.owner, 'whatsapp-owner');

    const botPair = await post('/api/whatsapp-bot/pair', { phone: '250799999999' });
    assert.equal(botPair.source, 'verbose-fishstick');
    assert.equal(botPair.owner, 'whatsapp-owner');

    const action = await post('/api/whatsapp-bot/action', { action: 'restart' });
    assert.equal(action.source, 'verbose-fishstick');
    assert.equal(action.message, 'action:restart');

    assert.equal(fs.existsSync(path.join(dataDir, 'state.json')), true);
    console.log('smoke ok');
  } finally {
    app.kill('SIGTERM');
    pfpServer.close();
    whatsappServer.close();
    if (stderr) process.stderr.write(stderr);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
