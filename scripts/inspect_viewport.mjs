import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = 'C:\\Users\\Christopher\\.gemini\\antigravity\\brain\\492d8184-a95a-4559-a807-d973da5b1309\\scratch';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getJson(url, retries = 12) {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          });
        });
        req.on('error', reject);
        req.setTimeout(1500, () => {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(400);
    }
  }
}

async function captureViewport(url, width, height, filename) {
  const userDataDir = `${OUT_DIR}\\edge_profile_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9244',
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    url,
  ]);

  await sleep(1800);
  const targets = await getJson('http://127.0.0.1:9244/json');
  const pageTarget = targets.find((t) => t.type === 'page' && (t.url.includes('localhost') || t.url.includes('127.0.0.1')));

  if (!pageTarget) {
    edge.kill();
    throw new Error('Could not find page target in headless browser');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await new Promise((r) => ws.addEventListener('open', r));
  await send('Page.enable');

  // If loading screen is active, trigger entry
  for (let i = 0; i < 20; i++) {
    const res = await send('Runtime.evaluate', {
      expression: `Boolean(document.getElementById('hud-click-prompt'))`,
    });
    if (res?.result?.value) {
      await send('Runtime.evaluate', {
        expression: `document.getElementById('hud-click-prompt').click()`,
      });
      await sleep(1800);
      break;
    }
    await sleep(200);
  }

  await sleep(1000);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = `${OUT_DIR}\\${filename}`;
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log(`Saved screenshot: ${outPath}`);

  ws.close();
  edge.kill();
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // Probe ports 5174 then 5173
  let targetUrl = 'http://localhost:5174/';
  try {
    await getJson('http://localhost:5174/', 2);
  } catch {
    targetUrl = 'http://localhost:5173/';
  }

  console.log(`Running visual verification against: ${targetUrl}`);
  await captureViewport(targetUrl, 1440, 900, 'verify_desktop_1440.png');
  await sleep(1000);
  await captureViewport(targetUrl, 390, 844, 'verify_mobile_390.png');
}

main().catch((err) => {
  console.error('Visual verification error:', err);
  process.exit(1);
});

