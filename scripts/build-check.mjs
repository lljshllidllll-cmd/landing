import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const imageNames = ['0076','0091','0040','0067','0085','0112','0034','0055','0049','0094','0007','0004','0028','0025','0019','0046','0106','0013','0061','0100'];

for (const file of [
  'index.html',
  'styles.css',
  'script.js',
  'scripts/update-blog-posts.mjs',
  'public/data/blog-posts.json',
  '.github/workflows/pages.yml',
  'public/fonts/GmarketSans-Light.ttf',
  'public/fonts/GmarketSans-Medium.ttf',
  'public/fonts/GmarketSans-Bold.ttf'
  ,...imageNames.map((name) => `public/images/jungsan/cmj_${name}.jpg`)
]) {
  const info = await stat(resolve(file));
  if (!info.isFile() || info.size === 0) throw new Error(`${file} is missing or empty`);
}

const html = await readFile(resolve('index.html'), 'utf8');
const css = await readFile(resolve('styles.css'), 'utf8');
const js = await readFile(resolve('script.js'), 'utf8');
const blogData = JSON.parse(await readFile(resolve('public/data/blog-posts.json'), 'utf8'));
const pagesWorkflow = await readFile(resolve('.github/workflows/pages.yml'), 'utf8');

for (const token of ['<main', 'id="finder"', 'aria-live="polite"', 'tel:0319773690', 'space-viewer', 'photo-archive', 'id="archive-lightbox"', 'blog-post-grid', 'data-blog-feed']) {
  if (!html.includes(token)) throw new Error(`Required HTML contract missing: ${token}`);
}
if ((html.match(/class="blog-post"/g) || []).length !== 4) throw new Error('Exactly four latest blog post thumbnails are required');
if (!Array.isArray(blogData.posts) || blogData.posts.length !== 4) throw new Error('Generated blog data must contain exactly four posts');
for (const post of blogData.posts) {
  if (!post.title || !post.published || !post.url.startsWith('https://blog.naver.com/1986fitness3/') || !post.image.startsWith('https://blogthumb.pstatic.net/')) throw new Error('Generated blog data contains an invalid post');
}
for (const staleToken of ['id="reason"', 'href="#reason"', 'DATA REQUIRED', '초안에서 먼저', 'LANDING PAGE DRAFT', 'faq-list']) {
  if (html.includes(staleToken)) throw new Error(`Removed draft contract still present: ${staleToken}`);
}
for (const token of ['@font-face', 'prefers-reduced-motion', '.mobile-dock', '--gold:', '.space-selector', '.archive-lightbox']) {
  if (!css.includes(token)) throw new Error(`Required CSS contract missing: ${token}`);
}

new Function(js);
if (!js.includes('showModal()') || !js.includes("event.key === 'ArrowRight'")) throw new Error('Archive lightbox interaction contract missing');
if (!js.includes("fetch('public/data/blog-posts.json'") || !js.includes("dataset.feedState = 'current'")) throw new Error('Client-side blog feed hydration contract missing');
for (const token of ["cron: '23 * * * *'", 'npm run update:blog', 'actions/upload-pages-artifact@v4', 'actions/deploy-pages@v4']) {
  if (!pagesWorkflow.includes(token)) throw new Error(`Pages refresh workflow contract missing: ${token}`);
}
console.log('Build check passed: streamlined section flow, 20 Jungsan images, branch facts, interactions, font, accessibility and responsive contracts are present.');
