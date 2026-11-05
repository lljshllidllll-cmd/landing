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
  const desktopHeroPath = join(tmpdir(), '1986-jungsan-hero-desktop.png');
  const desktopHeroCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopHeroPath, Buffer.from(desktopHeroCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelectorAll('#news img').forEach((img) => img.loading = 'eager');` });
  await delay(900);
  await send('Runtime.evaluate', { expression: `document.querySelector('#news')?.scrollIntoView(); document.querySelectorAll('#news [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
  await delay(300);
  const desktopCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const desktopCapturePath = join(tmpdir(), '1986-jungsan-news-desktop.png');
  await writeFile(desktopCapturePath, Buffer.from(desktopCapture.data, 'base64'));
  const desktopGalleryPath = join(tmpdir(), '1986-jungsan-gallery-desktop.png');
  const desktopLockerPath = join(tmpdir(), '1986-jungsan-locker-desktop.png');
  const desktopLightboxPath = join(tmpdir(), '1986-jungsan-lightbox-desktop.png');
  await send('Runtime.evaluate', { expression: `document.querySelector('.archive-head')?.scrollIntoView(); document.querySelectorAll('.space [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
  await delay(300);
  const desktopGalleryCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopGalleryPath, Buffer.from(desktopGalleryCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelectorAll('[data-space-image]')[3]?.click(); document.querySelector('.space-viewer')?.scrollIntoView({ block: 'center' });` });
  await delay(250);
  const desktopLockerCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopLockerPath, Buffer.from(desktopLockerCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelectorAll('.archive-thumb')[15].click();` });
  await delay(250);
  const desktopLightboxCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopLightboxPath, Buffer.from(desktopLightboxCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelector('#archive-lightbox').close();` });
  const desktopEquipmentPath = join(tmpdir(), '1986-jungsan-equipment-desktop.png');
  const desktopExperiencePath = join(tmpdir(), '1986-jungsan-experience-desktop.png');
  const desktopBodyProfilePath = join(tmpdir(), '1986-jungsan-body-profile-desktop.png');
  const desktopFaqPath = join(tmpdir(), '1986-jungsan-faq-desktop.png');
  for (const [selector, output] of [['#coaching', desktopEquipmentPath], ['#experience', desktopExperiencePath], ['.body-profile-showcase', desktopBodyProfilePath], ['#faq', desktopFaqPath]]) {
    await send('Runtime.evaluate', { expression: `document.querySelector('${selector}')?.scrollIntoView(); document.querySelectorAll('${selector} [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
    await delay(250);
    const sectionCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(output, Buffer.from(sectionCapture.data, 'base64'));
  }
  const desktopFacilityReviewPath = join(tmpdir(), '1986-jungsan-review-facility-desktop.png');
  const desktopReviewLightboxPath = join(tmpdir(), '1986-jungsan-review-lightbox-desktop.png');
  await send('Runtime.evaluate', { expression: `document.querySelectorAll('.facility-review-thumb img').forEach((img) => img.loading = 'eager'); document.querySelector('#experience')?.scrollIntoView(); document.querySelector('[data-review-tab="facility"]')?.click();` });
  await delay(250);
  const desktopFacilityReviewCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopFacilityReviewPath, Buffer.from(desktopFacilityReviewCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelector('[data-review-tab="pt"]')?.click(); document.querySelector('.pt-review-thumb')?.click();` });
  await delay(250);
  const desktopReviewLightboxCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(desktopReviewLightboxPath, Buffer.from(desktopReviewLightboxCapture.data, 'base64'));
  await send('Runtime.evaluate', { expression: `document.querySelector('#review-lightbox')?.close();` });
  const mobileCapturePath = join(tmpdir(), '1986-jungsan-news-mobile.png');
  const mobileBlogPath = join(tmpdir(), '1986-jungsan-blog-mobile.png');
  const mobileArchivePath = join(tmpdir(), '1986-jungsan-gallery-mobile.png');
  const mobileLockerPath = join(tmpdir(), '1986-jungsan-locker-mobile.png');
  const mobileLightboxPath = join(tmpdir(), '1986-jungsan-lightbox-mobile.png');
  const mobileExperiencePath = join(tmpdir(), '1986-jungsan-experience-mobile.png');
  const mobileBodyProfilePath = join(tmpdir(), '1986-jungsan-body-profile-mobile.png');
  const mobileFacilityReviewPath = join(tmpdir(), '1986-jungsan-review-facility-mobile.png');
  const mobileEquipmentPath = join(tmpdir(), '1986-jungsan-equipment-mobile.png');
  const mobileFaqPath = join(tmpdir(), '1986-jungsan-faq-mobile.png');
  const mobileHeroPath = join(tmpdir(), '1986-jungsan-hero-mobile.png');
  const results = [];
  for (const width of [320, 360, 390, 430]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://127.0.0.1:4174/' });
    await delay(1200);
    if (width === 390) {
      const mobileHeroCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(mobileHeroPath, Buffer.from(mobileHeroCapture.data, 'base64'));
    }
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.photo-archive img, #news .news-card img, .review-thumb img, .body-profile-slot img, .equipment-brand-logos img, .hero-logo-strip img').forEach((img) => img.loading = 'eager'); document.querySelectorAll('[data-space-image]')[5].click();`
    });
    await delay(500);
    await send('Runtime.evaluate', { expression: `document.querySelector('.archive-thumb').click(); document.querySelector('.lightbox-next').click();` });
    await delay(120);
    const evaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify((() => { const archive = [...document.querySelectorAll('.photo-archive img')]; const newsImages = [...document.querySelectorAll('#news .news-card img')]; const blogPosts = [...document.querySelectorAll('.blog-post')]; const blogPostImages = [...document.querySelectorAll('.blog-post img')]; const placeImage = document.querySelector('.news-place-preview img'); const placeFrame = document.querySelector('.news-place-preview')?.getBoundingClientRect(); const buttons = [...document.querySelectorAll('[data-space-image]')]; const lightbox = document.querySelector('#archive-lightbox'); const firstFaq = document.querySelector('.faq-list details'); firstFaq.open = true; return { href: location.href, title: document.title, width: innerWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, newsCount: document.querySelectorAll('main > #news.news').length, whyCount: document.querySelectorAll('main > #why.why').length, whyPrinciples: document.querySelectorAll('.why-principles > li').length, equipmentSlots: document.querySelectorAll('.equipment-photo-strip > figure').length, equipmentSlotsEmpty: document.querySelectorAll('.equipment-photo-strip img').length === 0, equipmentSpecs: document.querySelectorAll('.equipment-specs > article').length, experienceCount: document.querySelectorAll('main > #experience.experience').length, experiencePoints: document.querySelectorAll('.experience-points > li').length, bodyProfileSlots: document.querySelectorAll('.body-profile-slot').length, bodyProfileImages: document.querySelectorAll('.body-profile-slot img').length, bodyProfileHasControls: !!document.querySelector('.body-profile-prev') && !!document.querySelector('.body-profile-next'), faqCount: document.querySelectorAll('main > #faq.faq').length, faqItems: document.querySelectorAll('.faq-list details').length, faqOpens: firstFaq.open, faqIsLast: document.querySelector('main')?.lastElementChild?.id === 'faq', newsLinks: document.querySelectorAll('#news a[href]').length, newsImages: newsImages.length, newsImagesLoaded: newsImages.filter((img) => img.complete && img.naturalWidth > 0).length, blogFeedState: document.querySelector('[data-blog-feed]')?.dataset.feedState, blogPostCount: blogPosts.length, blogPostImagesLoaded: blogPostImages.filter((img) => img.complete && img.naturalWidth > 0).length, blogPostLinksDirect: blogPosts.every((item) => item.href.startsWith('https://blog.naver.com/1986fitness3/')) && new Set(blogPosts.map((item) => item.href)).size === 4, placeFeedState: placeImage?.dataset.placeState, placePreviewLinked: !!document.querySelector('a[href*="1052772360"] .news-place-preview img'), placeImageIsNaver: placeImage?.currentSrc.includes('ldb-phinf.pstatic.net') && placeImage.naturalWidth === placeImage.naturalHeight && placeImage.naturalWidth >= 400, placeFrameSquare: !!placeFrame && Math.abs(placeFrame.width - placeFrame.height) < 1, finderStandaloneCount: document.querySelectorAll('main > #finder.finder-standalone').length, archiveCount: archive.length, imagesLoaded: archive.filter((img) => img.complete && img.naturalWidth > 0).length, lightboxOpen: lightbox.open, lightboxCounter: document.querySelector('.lightbox-counter')?.textContent, lightboxTitle: document.querySelector('#lightbox-title')?.textContent, selectorCount: buttons.length, cardioImage: buttons[1]?.dataset.spaceImage, selectorCounter: document.querySelector('.space-counter')?.textContent, selectorTitle: document.querySelector('.space-feature-title')?.textContent, finderButtons: document.querySelectorAll('[data-path]').length, finderCode: document.querySelector('.result-code')?.textContent, font: getComputedStyle(document.body).fontFamily }; })())`
    });
    if (evaluation.exceptionDetails) throw new Error(evaluation.exceptionDetails.exception?.description || evaluation.exceptionDetails.text);
    const value = evaluation.result.value;
    const result = typeof value === 'string' ? JSON.parse(value) : value;
    const logoEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const logos = [...document.querySelectorAll('.equipment-brand-logos img')]; const heroLogos = [...document.querySelectorAll('.hero-logo-strip img')]; const strip = document.querySelector('.hero-logo-strip'); const actions = document.querySelector('.hero-actions'); return { equipmentLogoCount: logos.length, equipmentLogosLoaded: logos.filter((img) => img.complete && img.naturalWidth > 0).length, heroLogoCount: heroLogos.length, heroLogosLoaded: heroLogos.filter((img) => img.complete && img.naturalWidth > 0).length, heroLogosBelowAction: !!strip && !!actions && actions.compareDocumentPosition(strip) === Node.DOCUMENT_POSITION_FOLLOWING }; })())` });
    Object.assign(result, JSON.parse(logoEvaluation.result.value));
    const cleanupEvaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify({ removedSectionCount: document.querySelectorAll('#reason, .team').length, newsImmediatelyAfterMarquee: document.querySelector('.fact-marquee')?.nextElementSibling?.id === 'news', staleDraftCopy: /DATA REQUIRED|초안에서 먼저|LANDING PAGE DRAFT/.test(document.body.innerText) })`
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
    const spaceFrameBeforeEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const frame = document.querySelector('.space-feature')?.getBoundingClientRect(); return { width: Math.round(frame?.width || 0), height: Math.round(frame?.height || 0) }; })())` });
    const spaceFrameBefore = JSON.parse(spaceFrameBeforeEvaluation.result.value);
    await send('Runtime.evaluate', { expression: `document.querySelectorAll('[data-space-image]')[3]?.click();` });
    await delay(250);
    const spaceFrameAfterEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const frame = document.querySelector('.space-feature')?.getBoundingClientRect(); return { width: Math.round(frame?.width || 0), height: Math.round(frame?.height || 0), title: document.querySelector('.space-feature-title')?.textContent }; })())` });
    const spaceFrameAfter = JSON.parse(spaceFrameAfterEvaluation.result.value);
    Object.assign(result, { spaceFrameStableOnLocker: spaceFrameBefore.width === spaceFrameAfter.width && spaceFrameBefore.height === spaceFrameAfter.height, lockerFrameHeight: spaceFrameAfter.height, lockerTitle: spaceFrameAfter.title });
    await send('Runtime.evaluate', { expression: `document.querySelector('.archive-rail-next')?.click();` });
    await delay(500);
    const archiveRailEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const rail = document.querySelector('.photo-archive'); return { archiveRailHasOverflow: rail.scrollWidth > rail.clientWidth, archiveRailScrolls: rail.scrollLeft > 20, archiveRailScrollLeft: Math.round(rail.scrollLeft) }; })())` });
    Object.assign(result, JSON.parse(archiveRailEvaluation.result.value));
    const reviewStateEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const tabs = [...document.querySelectorAll('[data-review-tab]')]; const ptReviewImages = [...document.querySelectorAll('.pt-review-thumb img')]; const facilityReviewImages = [...document.querySelectorAll('.facility-review-thumb img')]; const ptDefaultActive = document.querySelector('[data-review-tab="pt"]')?.getAttribute('aria-selected') === 'true' && !document.querySelector('#review-panel-pt')?.hidden; document.querySelector('[data-review-tab="facility"]')?.click(); const facilitySwitches = document.querySelector('[data-review-tab="facility"]')?.getAttribute('aria-selected') === 'true' && !document.querySelector('#review-panel-facility')?.hidden && document.querySelector('#review-panel-pt')?.hidden; const firstFacilityReview = document.querySelector('.facility-review-thumb'); firstFacilityReview?.click(); document.querySelector('.review-lightbox-next')?.click(); const facilityReviewLightboxWorks = document.querySelector('#review-lightbox')?.open && document.querySelector('.review-lightbox-counter')?.textContent === '02 / 11'; document.querySelector('#review-lightbox')?.close(); return { reviewTabCount: tabs.length, ptReviewCount: ptReviewImages.length, ptReviewImagesLoaded: ptReviewImages.filter((img) => img.complete && img.naturalWidth > 0).length, facilityReviewCount: facilityReviewImages.length, facilityReviewImagesLoaded: facilityReviewImages.filter((img) => img.complete && img.naturalWidth > 0).length, ptDefaultActive, facilitySwitches, facilityReviewLightboxWorks, reviewLightboxClosed: !document.querySelector('#review-lightbox')?.open }; })())` });
    const reviewState = JSON.parse(reviewStateEvaluation.result.value);
    await delay(50);
    const facilityReviewFocusEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `document.activeElement === document.querySelector('.facility-review-thumb')` });
    reviewState.facilityReviewFocusReturned = facilityReviewFocusEvaluation.result.value;
    await send('Runtime.evaluate', { expression: `document.querySelector('[data-review-tab="pt"]')?.click(); const firstReview = document.querySelector('.pt-review-thumb'); firstReview?.click(); document.querySelector('.review-lightbox-next')?.click();` });
    const ptLightboxEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `document.querySelector('#review-lightbox')?.open && document.querySelector('.review-lightbox-counter')?.textContent === '02 / 22'` });
    reviewState.reviewLightboxWorks = ptLightboxEvaluation.result.value;
    await send('Runtime.evaluate', { expression: `document.querySelector('#review-lightbox')?.close();` });
    await delay(50);
    reviewState.reviewLightboxClosed = true;
    const reviewFocusEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `document.activeElement === document.querySelector('.pt-review-thumb')` });
    reviewState.reviewFocusReturned = reviewFocusEvaluation.result.value;
    await send('Runtime.evaluate', { expression: `document.querySelector('#review-panel-pt .review-rail-next')?.click()` });
    await delay(500);
    const reviewRailEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const rail = document.querySelector('.pt-review-rail'); const state = { railHasOverflow: rail.scrollWidth > rail.clientWidth, railScrolls: rail.scrollLeft > 20, railScrollLeft: Math.round(rail.scrollLeft) }; rail.scrollTo({ left: 0, behavior: 'auto' }); document.querySelector('[data-review-tab="facility"]')?.click(); const facilityRail = document.querySelector('.facility-review-rail'); return { ...state, facilityRailHasOverflow: facilityRail.scrollWidth > facilityRail.clientWidth }; })())` });
    Object.assign(reviewState, JSON.parse(reviewRailEvaluation.result.value));
    await delay(50);
    await send('Runtime.evaluate', { expression: `document.querySelector('#review-panel-facility .review-rail-next')?.click();` });
    await delay(500);
    const facilityRailScrollEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const rail = document.querySelector('.facility-review-rail'); const state = { facilityRailScrolls: rail.scrollLeft > 20, facilityRailScrollLeft: Math.round(rail.scrollLeft) }; rail.scrollTo({ left: 0, behavior: 'auto' }); return state; })())` });
    Object.assign(reviewState, JSON.parse(facilityRailScrollEvaluation.result.value));
    await send('Runtime.evaluate', { expression: `document.querySelector('.body-profile-next')?.click();` });
    await delay(500);
    const bodyProfileRailEvaluation = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify((() => { const rail = document.querySelector('.body-profile-rail'); return { bodyProfileRailHasOverflow: rail.scrollWidth > rail.clientWidth, bodyProfileRailScrolls: rail.scrollLeft > 20, bodyProfileRailScrollLeft: Math.round(rail.scrollLeft) }; })())` });
    Object.assign(reviewState, JSON.parse(bodyProfileRailEvaluation.result.value));
    Object.assign(result, reviewState);
    if (reviewState.reviewTabCount !== 2 || reviewState.ptReviewCount !== 22 || reviewState.ptReviewImagesLoaded !== 22 || reviewState.facilityReviewCount !== 11 || reviewState.facilityReviewImagesLoaded !== 11 || !reviewState.ptDefaultActive || !reviewState.facilitySwitches || !reviewState.facilityReviewLightboxWorks || !reviewState.facilityReviewFocusReturned || !reviewState.reviewLightboxWorks || !reviewState.reviewLightboxClosed || !reviewState.reviewFocusReturned || !reviewState.railHasOverflow || !reviewState.railScrolls || !reviewState.facilityRailHasOverflow || !reviewState.facilityRailScrolls || !reviewState.bodyProfileRailHasOverflow || !reviewState.bodyProfileRailScrolls) throw new Error(`Review interaction contract failed at ${width}px: ${JSON.stringify(reviewState)}`);
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
      await send('Runtime.evaluate', { expression: `document.querySelectorAll('[data-space-image]')[3]?.click(); document.querySelector('.space-viewer')?.scrollIntoView();` });
      await delay(250);
      const mobileLockerCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(mobileLockerPath, Buffer.from(mobileLockerCapture.data, 'base64'));
      for (const [selector, output] of [['#coaching', mobileEquipmentPath], ['#experience', mobileExperiencePath], ['.body-profile-showcase', mobileBodyProfilePath], ['#faq', mobileFaqPath]]) {
        await send('Runtime.evaluate', { expression: `document.querySelector('${selector}')?.scrollIntoView(); document.querySelectorAll('${selector} [data-reveal]').forEach((item) => item.classList.add('is-visible'));` });
        await delay(200);
        const sectionCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        await writeFile(output, Buffer.from(sectionCapture.data, 'base64'));
      }
      await send('Runtime.evaluate', { expression: `document.querySelector('#experience')?.scrollIntoView(); document.querySelector('[data-review-tab="facility"]')?.click();` });
      await delay(200);
      const mobileFacilityReviewCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(mobileFacilityReviewPath, Buffer.from(mobileFacilityReviewCapture.data, 'base64'));
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
  console.log(`Desktop hero capture: ${desktopHeroPath}`);
  console.log(`Desktop news capture: ${desktopCapturePath}`);
  console.log(`Desktop gallery capture: ${desktopGalleryPath}`);
  console.log(`Desktop locker capture: ${desktopLockerPath}`);
  console.log(`Desktop lightbox capture: ${desktopLightboxPath}`);
  console.log(`Desktop equipment capture: ${desktopEquipmentPath}`);
  console.log(`Desktop experience capture: ${desktopExperiencePath}`);
  console.log(`Desktop body profile capture: ${desktopBodyProfilePath}`);
  console.log(`Desktop facility review capture: ${desktopFacilityReviewPath}`);
  console.log(`Desktop review lightbox capture: ${desktopReviewLightboxPath}`);
  console.log(`Desktop FAQ capture: ${desktopFaqPath}`);
  console.log(`Mobile news capture: ${mobileCapturePath}`);
  console.log(`Mobile hero capture: ${mobileHeroPath}`);
  console.log(`Mobile blog capture: ${mobileBlogPath}`);
  console.log(`Mobile gallery capture: ${mobileArchivePath}`);
  console.log(`Mobile locker capture: ${mobileLockerPath}`);
  console.log(`Mobile lightbox capture: ${mobileLightboxPath}`);
  console.log(`Mobile equipment capture: ${mobileEquipmentPath}`);
  console.log(`Mobile experience capture: ${mobileExperiencePath}`);
  console.log(`Mobile body profile capture: ${mobileBodyProfilePath}`);
  console.log(`Mobile facility review capture: ${mobileFacilityReviewPath}`);
  console.log(`Mobile FAQ capture: ${mobileFaqPath}`);
  console.log(`Browser errors/warnings: ${browserErrors.length}`);
  if (browserErrors.length) console.log(browserErrors.join('\n'));
  if (results.some((item) => item.overflow !== 0 || item.newsCount !== 1 || item.whyCount !== 0 || item.whyPrinciples !== 0 || item.equipmentSlots !== 4 || !item.equipmentSlotsEmpty || item.equipmentSpecs !== 3 || item.equipmentLogoCount !== 4 || item.equipmentLogosLoaded !== 4 || item.heroLogoCount !== 3 || item.heroLogosLoaded !== 3 || !item.heroLogosBelowAction || item.experienceCount !== 1 || item.experiencePoints !== 11 || item.bodyProfileSlots !== 47 || item.bodyProfileImages !== 47 || !item.bodyProfileHasControls || item.faqCount !== 1 || item.faqItems !== 6 || !item.faqOpens || !item.faqIsLast || item.removedSectionCount !== 0 || !item.newsImmediatelyAfterMarquee || item.staleDraftCopy || item.newsLinks !== 7 || item.newsImages !== 6 || item.newsImagesLoaded !== 6 || item.blogFeedState !== 'current' || item.blogPostCount !== 4 || item.blogPostImagesLoaded !== 4 || !item.blogPostLinksDirect || item.placeFeedState !== 'current' || !item.placePreviewLinked || !item.placeImageIsNaver || !item.placeFrameSquare || item.finderStandaloneCount !== 0 || item.finderButtons !== 0 || item.archiveCount !== 20 || item.imagesLoaded !== 20 || !item.archiveRailHasOverflow || !item.archiveRailScrolls || !item.spaceFrameStableOnLocker || item.lockerFrameHeight !== 480 || item.lockerTitle !== '라커룸' || !item.lightboxOpen || item.lightboxCounter !== '02 / 20' || item.lightboxTitle !== 'MATERIAL' || !item.closed || !item.focusReturned || item.cardioImage !== 'public/images/jungsan/cmj_0046.jpg' || item.selectorCounter !== '06 / 06') || fallbackResult.state !== 'fallback' || fallbackResult.postCount !== 4 || !fallbackResult.status.includes('마지막으로 저장된') || browserErrors.length) process.exitCode = 1;
} finally {
  socket.close();
  proc.kill();
}
