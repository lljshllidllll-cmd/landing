import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9300 + Math.floor(Math.random() * 300);
const profile = join(tmpdir(), `1986-jungsan-browser-qa-${port}`);
await mkdir(profile, { recursive: true });
const proc = spawn(chrome, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' });

const delay = (ms) => new Promise((done) => setTimeout(done, ms));
let endpoint;
for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    const pages = await fetch(`http://127.0.0.1:${port}/json`).then((res) => res.json());
    endpoint = pages.find((page) => page.type === 'page' && !page.url.startsWith('chrome-extension://'))?.webSocketDebuggerUrl;
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
const browserErrors = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry.level)) browserErrors.push(message.params.entry.text);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolveSend, reject) => {
  const requestId = ++id;
  pending.set(requestId, { resolve: resolveSend, reject });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:4174/' });
  await delay(1200);
  await send('Runtime.evaluate', { expression: `document.querySelectorAll('#news img').forEach((img) => img.loading = 'eager');` });
  await delay(900);
  await send('Runtime.evaluate', { expression: `document.querySelector('#news')?.scrollIntoView(); document.querySelectorAll('#news [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
  await delay(300);
  const desktopCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const desktopCapturePath = join(tmpdir(), '1986-jungsan-news-desktop.png');
  await writeFile(desktopCapturePath, Buffer.from(desktopCapture.data, 'base64'));
  const desktopGalleryPath = join(tmpdir(), '1986-jungsan-gallery-desktop.png');
  const desktopLightboxPath = join(tmpdir(), '1986-jungsan-lightbox-desktop.png');
  await send('Runtime.evaluate', { expression: `document.querySelector('.archive-head')?.scrollIntoView(); document.querySelectorAll('.space [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
  await delay(300);
  const desktopGalleryCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopGalleryPath, Buffer.from(desktopGalleryCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelectorAll('.archive-thumb')[15].click();` });
  await delay(250);
  const desktopLightboxCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopLightboxPath, Buffer.from(desktopLightboxCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelector('#archive-lightbox').close();` });
  const mobileCapturePath = join(tmpdir(), '1986-jungsan-news-mobile.png');
  const mobileBlogPath = join(tmpdir(), '1986-jungsan-blog-mobile.png');
  const mobileArchivePath = join(tmpdir(), '1986-jungsan-gallery-mobile.png');
  const mobileLightboxPath = join(tmpdir(), '1986-jungsan-lightbox-mobile.png');
  const results = [];
  for (const width of [320, 360, 390, 430]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://127.0.0.1:4174/' });
    await delay(1200);
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.photo-archive img, #news .news-card img').forEach((img) => img.loading = 'eager'); document.querySelectorAll('[data-space-image]')[5].click(); document.querySelector('[data-path="pt"]').click();`
    });
    await delay(500);
    await send('Runtime.evaluate', { expression: `document.querySelector('.archive-thumb').click(); document.querySelector('.lightbox-next').click();` });
    await delay(120);
    const evaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify((() => { const archive = [...document.querySelectorAll('.photo-archive img')]; const newsImages = [...document.querySelectorAll('#news .news-card img')]; const blogPosts = [...document.querySelectorAll('.blog-post')]; const blogPostImages = [...document.querySelectorAll('.blog-post img')]; const placeImage = document.querySelector('.news-place-preview img'); const placeFrame = document.querySelector('.news-place-preview')?.getBoundingClientRect(); const buttons = [...document.querySelectorAll('[data-space-image]')]; const lightbox = document.querySelector('#archive-lightbox'); return { href: location.href, title: document.title, width: innerWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, newsCount: document.querySelectorAll('main > #news.news').length, newsLinks: document.querySelectorAll('#news a[href]').length, newsImages: newsImages.length, newsImagesLoaded: newsImages.filter((img) => img.complete && img.naturalWidth > 0).length, blogFeedState: document.querySelector('[data-blog-feed]')?.dataset.feedState, blogPostCount: blogPosts.length, blogPostImagesLoaded: blogPostImages.filter((img) => img.complete && img.naturalWidth > 0).length, blogPostLinksDirect: blogPosts.every((item) => item.href.startsWith('https://blog.naver.com/1986fitness3/')) && new Set(blogPosts.map((item) => item.href)).size === 4, placePreviewLinked: !!document.querySelector('a[href*="1052772360"] .news-place-preview img'), placeImageIsNaver: placeImage?.currentSrc.includes('ldb-phinf.pstatic.net') && placeImage.naturalWidth === 1080 && placeImage.naturalHeight === 1080, placeFrameSquare: !!placeFrame && Math.abs(placeFrame.width - placeFrame.height) < 1, finderStandaloneCount: document.querySelectorAll('main > #finder.finder-standalone').length, finderIsLast: document.querySelector('main')?.lastElementChild?.id === 'finder', archiveCount: archive.length, imagesLoaded: archive.filter((img) => img.complete && img.naturalWidth > 0).length, lightboxOpen: lightbox.open, lightboxCounter: document.querySelector('.lightbox-counter')?.textContent, lightboxTitle: document.querySelector('#lightbox-title')?.textContent, selectorCount: buttons.length, cardioImage: buttons[1]?.dataset.spaceImage, selectorCounter: document.querySelector('.space-counter')?.textContent, selectorTitle: document.querySelector('.space-feature-title')?.textContent, finderButtons: document.querySelectorAll('[data-path]').length, finderCode: document.querySelector('.result-code')?.textContent, font: getComputedStyle(document.body).fontFamily }; })())`
    });
    const value = evaluation.result.value;
    const result = typeof value === 'string' ? JSON.parse(value) : value;
    const cleanupEvaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify({ removedSectionCount: document.querySelectorAll('#reason, .team, .faq').length, newsImmediatelyAfterMarquee: document.querySelector('.fact-marquee')?.nextElementSibling?.id === 'news', staleDraftCopy: /DATA REQUIRED|초안에서 먼저|LANDING PAGE DRAFT/.test(document.body.innerText) })`
    });
    Object.assign(result, JSON.parse(cleanupEvaluation.result.value));
    if (width === 390) {
      const mobileLightboxCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(mobileLightboxPath, Buffer.from(mobileLightboxCapture.data, 'base64'));
    }
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await delay(100);
    const escapeState = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify({ closed: !document.querySelector('#archive-lightbox').open, focusReturned: document.activeElement === document.querySelector('.archive-thumb') })` });
    Object.assign(result, JSON.parse(escapeState.result.value));
    results.push(result);
    if (width === 390) {
      await send('Runtime.evaluate', { expression: `document.querySelector('#news')?.scrollIntoView(); document.querySelectorAll('#news [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
      await delay(250);
      const mobileCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(mobileCapturePath, Buffer.from(mobileCapture.data, 'base64'));
      await send('Runtime.evaluate', { expression: `document.querySelector('.news-card-blog')?.scrollIntoView({ block: 'center' });` });
      await delay(250);
      const mobileBlogCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(mobileBlogPath, Buffer.from(mobileBlogCapture.data, 'base64'));
      await send('Runtime.evaluate', { expression: `document.querySelector('.archive-head')?.scrollIntoView(); document.querySelectorAll('.space [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
      await delay(250);
      const mobileArchiveCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(mobileArchivePath, Buffer.from(mobileArchiveCapture.data, 'base64'));
    }
  }
  await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*public/data/blog-posts.json*'] });
  await send('Page.navigate', { url: 'http://127.0.0.1:4174/' });
  await delay(700);
  const fallbackEvaluation = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `JSON.stringify({ state: document.querySelector('[data-blog-feed]')?.dataset.feedState, postCount: document.querySelectorAll('.blog-post').length, status: document.querySelector('[data-blog-feed-status]')?.textContent })`
  });
  const fallbackResult = JSON.parse(fallbackEvaluation.result.value);
  await send('Network.setBlockedURLs', { urls: [] });
  console.log(JSON.stringify(results, null, 2));
  console.log(`Blog feed fallback: ${JSON.stringify(fallbackResult)}`);
  console.log(`Desktop news capture: ${desktopCapturePath}`);
  console.log(`Desktop gallery capture: ${desktopGalleryPath}`);
  console.log(`Desktop lightbox capture: ${desktopLightboxPath}`);
  console.log(`Mobile news capture: ${mobileCapturePath}`);
  console.log(`Mobile blog capture: ${mobileBlogPath}`);
  console.log(`Mobile gallery capture: ${mobileArchivePath}`);
  console.log(`Mobile lightbox capture: ${mobileLightboxPath}`);
  console.log(`Browser errors/warnings: ${browserErrors.length}`);
  if (browserErrors.length) console.log(browserErrors.join('\n'));
  if (results.some((item) => item.overflow !== 0 || item.newsCount !== 1 || item.removedSectionCount !== 0 || !item.newsImmediatelyAfterMarquee || item.staleDraftCopy || item.newsLinks !== 7 || item.newsImages !== 6 || item.newsImagesLoaded !== 6 || item.blogFeedState !== 'current' || item.blogPostCount !== 4 || item.blogPostImagesLoaded !== 4 || !item.blogPostLinksDirect || !item.placePreviewLinked || !item.placeImageIsNaver || !item.placeFrameSquare || item.finderStandaloneCount !== 1 || !item.finderIsLast || item.archiveCount !== 20 || item.imagesLoaded !== 20 || !item.lightboxOpen || item.lightboxCounter !== '02 / 20' || item.lightboxTitle !== 'MATERIAL' || !item.closed || !item.focusReturned || item.cardioImage !== 'public/images/jungsan/cmj_0046.jpg' || item.selectorCounter !== '06 / 06' || item.finderCode !== 'PATH 03') || fallbackResult.state !== 'fallback' || fallbackResult.postCount !== 4 || !fallbackResult.status.includes('마지막으로 저장된') || browserErrors.length) process.exitCode = 1;
} finally {
  socket.close();
  proc.kill();
}
