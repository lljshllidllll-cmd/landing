import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const placeId = '1052772360';
const placeUrl = `https://map.naver.com/p/entry/place/${placeId}?placePath=%2Fphoto`;
const outputPath = resolve('public/data/place-photo.json');
const delay = (ms) => new Promise((done) => setTimeout(done, ms));

async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome',
    process.platform === 'win32' ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error('Chrome executable was not found');
}

function findFrame(tree) {
  if (tree.frame.url.includes(`pcmap.place.naver.com/place/${placeId}/photo`)) return tree;
  for (const child of tree.childFrames || []) {
    const found = findFrame(child);
    if (found) return found;
  }
  return null;
}

function validatePhoto(data) {
  return data?.placeId === placeId
    && typeof data.image === 'string'
    && data.image.startsWith('https://ldb-phinf.pstatic.net/')
    && /^\d{4}-\d{2}-\d{2}$/.test(data.published);
}

async function readLatestPhoto() {
  const chrome = await findChrome();
  const port = 9600 + Math.floor(Math.random() * 300);
  const profile = await mkdtemp(join(tmpdir(), '1986-place-photo-'));
  const proc = spawn(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore' });

  try {
    let endpoint;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try {
        const pages = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
        endpoint = pages.find((page) => page.type === 'page')?.webSocketDebuggerUrl;
        if (endpoint) break;
      } catch {}
      await delay(100);
    }
    if (!endpoint) throw new Error('Chrome DevTools endpoint unavailable');

    const socket = new WebSocket(endpoint);
    await new Promise((resolveOpen, reject) => {
      socket.addEventListener('open', resolveOpen, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    let id = 0;
    const pending = new Map();
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (!message.id || !pending.has(message.id)) return;
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    });
    const send = (method, params = {}) => new Promise((resolveSend, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve: resolveSend, reject });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: placeUrl });

    let photoUrl;
    for (let attempt = 0; attempt < 36; attempt += 1) {
      await delay(250);
      const { frameTree } = await send('Page.getFrameTree');
      const entryFrame = findFrame(frameTree);
      if (!entryFrame) continue;
      const { executionContextId } = await send('Page.createIsolatedWorld', {
        frameId: entryFrame.frame.id,
        worldName: '1986-place-photo-reader'
      });
      const evaluated = await send('Runtime.evaluate', {
        contextId: executionContextId,
        returnByValue: true,
        expression: `document.querySelector('img[alt="business_0"]')?.src`
      });
      if (evaluated.result.value) {
        photoUrl = evaluated.result.value;
        break;
      }
    }
    socket.close();
    if (!photoUrl) throw new Error('Latest Naver Place business photo was not found');

    const parsed = new URL(photoUrl);
    const image = parsed.hostname === 'search.pstatic.net' ? parsed.searchParams.get('src') : photoUrl;
    if (!image?.startsWith('https://ldb-phinf.pstatic.net/')) throw new Error(`Unexpected Naver Place photo URL: ${image}`);
    const dateMatch = image.match(/\/(\d{4})(\d{2})(\d{2})_/);
    if (!dateMatch) throw new Error(`Naver Place photo date was not found: ${image}`);

    return {
      placeId,
      source: placeUrl,
      generatedAt: new Date().toISOString(),
      published: `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`,
      image
    };
  } finally {
    proc.kill();
    await delay(500);
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

try {
  const data = await readLatestPhoto();
  if (!validatePhoto(data)) throw new Error('Generated Naver Place photo data is invalid');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Updated Naver Place photo from ${data.published}`);
} catch (error) {
  const fallback = JSON.parse(await readFile(outputPath, 'utf8').catch(() => 'null'));
  if (!validatePhoto(fallback)) throw error;
  console.warn(`Naver Place refresh skipped; keeping ${fallback.published}: ${error.message}`);
}
