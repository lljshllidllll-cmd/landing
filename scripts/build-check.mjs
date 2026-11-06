import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const imageNames = ['0076','0091','0040','0067','0085','0112','0034','0055','0049','0094','0007','0004','0028','0025','0019','0046','0106','0013','0061','0100'];
const reviewImageNames = Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, '0'));
const facilityReviewImageNames = ['01','02','03','04','05','06','07','08','09','10','11'];
const bodyProfileImageNames = Array.from({ length: 51 }, (_, index) => String(index + 1).padStart(2, '0'));
const brandLogoNames = ['cybex-white','paramount-white','vility-white','hammer-strength-white'];
const heroLogoNames = ['1986-fitness.jpg','hygher.png','keeppay.jpg'];
const machineImageNames = ['high-row.jpg','hammer-row.jpg','dy-row.jpg','wide-pulldown.jpg','pullover.jpg','front-lat-pulldown.jpg','incline-press.jpg','decline-chest-press.jpg','bench-press.jpg','shoulder-press.jpg','cybex-leg-press.png','cybex-squat-press.png','vility-stairmill.png','lexco-treadmill.png'];

for (const file of [
  'index.html',
  'styles.css',
  'script.js',
  'scripts/update-blog-posts.mjs',
  'scripts/update-place-photo.mjs',
  'public/data/blog-posts.json',
  'public/data/place-photo.json',
  '.github/workflows/pages.yml',
  'public/fonts/GmarketSans-Light.ttf',
  'public/fonts/GmarketSans-Medium.ttf',
  'public/fonts/GmarketSans-Bold.ttf'
  ,...imageNames.map((name) => `public/images/jungsan/cmj_${name}.jpg`)
  ,...reviewImageNames.map((name) => `public/images/reviews/pt-review-${name}.jpg`)
  ,...facilityReviewImageNames.map((name) => `public/images/reviews/facility-review-${name}.png`)
  ,...bodyProfileImageNames.map((name) => `public/images/body-profile/body-profile-${name}.jpg`)
  ,...brandLogoNames.map((name) => `public/images/brands/${name}.png`)
  ,...heroLogoNames.map((name) => `public/images/hero-logos/${name}`)
  ,...machineImageNames.map((name) => `public/images/machines/${name}`)
]) {
  const info = await stat(resolve(file));
  if (!info.isFile() || info.size === 0) throw new Error(`${file} is missing or empty`);
}

const html = await readFile(resolve('index.html'), 'utf8');
const css = await readFile(resolve('styles.css'), 'utf8');
const js = await readFile(resolve('script.js'), 'utf8');
const blogData = JSON.parse(await readFile(resolve('public/data/blog-posts.json'), 'utf8'));
const placeData = JSON.parse(await readFile(resolve('public/data/place-photo.json'), 'utf8'));
const pagesWorkflow = await readFile(resolve('.github/workflows/pages.yml'), 'utf8');

for (const token of ['<main', 'tel:0319773690', 'equipment-showcase', 'equipment-photo-strip', 'equipment-specs', 'space-viewer', 'photo-archive', 'archive-rail-controls', 'archive-rail-prev', 'archive-rail-next', 'id="archive-lightbox"', 'id="experience"', 'review-tabs', 'review-panel-facility', 'review-panel-pt', 'review-image-rail', 'facility-review-rail', 'pt-review-rail', 'FACILITY MEMBER REVIEWS', '11 REVIEWS', 'review-rail-controls', 'id="review-lightbox"', '실제 회원님들의', '사용 후기로', '증명합니다.', 'body-profile-showcase', '바디프로필', '촬영 사례', 'id="faq"', 'faq-list', 'blog-post-grid', 'data-blog-feed']) {
  if (!html.includes(token)) throw new Error(`Required HTML contract missing: ${token}`);
}
if ((html.match(/class="review-thumb facility-review-thumb"/g) || []).length !== 11) throw new Error('Exactly eleven facility review screenshots are required');
if ((html.match(/class="review-thumb pt-review-thumb"/g) || []).length !== 22) throw new Error('Exactly twenty-two PT review screenshots are required');
const ptReviewOrder = [...html.matchAll(/class="review-thumb pt-review-thumb"[\s\S]*?<img src="public\/images\/reviews\/pt-review-(\d{2})\.jpg"/g)].map((match) => match[1]);
if (ptReviewOrder.length !== 22 || new Set(ptReviewOrder).size !== 22) throw new Error('PT review screenshots must appear exactly once');
if (ptReviewOrder[0] !== '17') throw new Error('The longest PT review must be shown first');
if ((html.match(/class="body-profile-slot"/g) || []).length !== 51) throw new Error('Exactly fifty-one body profile images are required');
const bodyProfileOrder = [...html.matchAll(/body-profile-(\d{2})\.jpg/g)].map((match) => match[1]);
if (bodyProfileOrder.length !== 51 || new Set(bodyProfileOrder).size !== 51) throw new Error('Body profile images must appear exactly once');
if (bodyProfileOrder[0] !== '17') throw new Error('The previous body profile image 17 must be shown first');
if ((html.match(/public\/images\/brands\//g) || []).length !== 4) throw new Error('Exactly four machine brand logos are required');
if ((html.match(/class="hero-logo-card /g) || []).length !== 3) throw new Error('Exactly three hero logos are required below the reservation action');
if (!html.includes('class="hero-logo-strip hero-beat beat-5"')) throw new Error('Hero logo strip must follow the reservation action');
for (const fact of ['경기도 고양시 일산동구 중산로 244', '월–일 24시간 운영', '매월 둘째 일요일 정기 휴무', '법정공휴일·대체공휴일 정상운영']) {
  if (!html.includes(fact)) throw new Error(`Verified branch fact missing: ${fact}`);
}
for (const heroToken of ['중산동 대표 헬스장', '1986피트니스', '상담예약 바로가기', 'href="https://map.naver.com/p/entry/place/1052772360?placePath=%2Fticket']) {
  if (!html.includes(heroToken)) throw new Error(`Required hero copy missing: ${heroToken}`);
}
for (const facilityFact of ['중산동 유일', '해머스트렝스', 'ISO 10종 보유', '싸이벡스, 파라마운트,', 'VILITY 머신 보유', '런닝머신 12대 · 천국의 계단 4대', '멀티렉 4대 · 최대 50kg 덤벨', '높은 층고와 통창', '쾌적한 뷰', '넓은 샤워장']) {
  if (!html.includes(facilityFact)) throw new Error(`Required facility fact missing: ${facilityFact}`);
}
for (const caption of ['해머스트렝스 ISO PULL LINE', '해머스트렝스 PUSH LINE', '싸이벡스 LEG LINE', 'CARDIO LINE']) {
  if (!html.includes(caption)) throw new Error(`Machine gallery caption is missing: ${caption}`);
}
for (const name of machineImageNames) {
  if (!html.includes(`public/images/machines/${name}`)) throw new Error(`Machine photo missing from gallery: ${name}`);
}
for (const staleHeroToken of ['등록보다 <i>어려운 건,</i>', '계속 오는 일.', '중산에서 운동이 이어지는 이유를 만듭니다.', '내 시작점 찾기']) {
  if (html.includes(staleHeroToken)) throw new Error(`Replaced hero copy still present: ${staleHeroToken}`);
}
if ((html.match(/class="blog-post"/g) || []).length !== 4) throw new Error('Exactly four latest blog post thumbnails are required');
if (!Array.isArray(blogData.posts) || blogData.posts.length !== 4) throw new Error('Generated blog data must contain exactly four posts');
for (const post of blogData.posts) {
  if (!post.title || !post.published || !post.url.startsWith('https://blog.naver.com/1986fitness3/') || !post.image.startsWith('https://blogthumb.pstatic.net/')) throw new Error('Generated blog data contains an invalid post');
}
if (placeData.placeId !== '1052772360' || !placeData.image?.startsWith('https://ldb-phinf.pstatic.net/') || !/^\d{4}-\d{2}-\d{2}$/.test(placeData.published)) throw new Error('Generated Naver Place photo data is invalid');
for (const staleToken of ['id="reason"', 'href="#reason"', 'id="why"', 'href="#why"', 'why-principles', '02 / WHY 1986', 'id="finder"', 'href="#finder"', 'START FINDER', 'data-path=', 'finder-result', 'DATA REQUIRED', '초안에서 먼저', 'LANDING PAGE DRAFT']) {
  if (html.includes(staleToken)) throw new Error(`Removed draft contract still present: ${staleToken}`);
}
for (const token of ['@font-face', 'prefers-reduced-motion', '.mobile-dock', '--gold:', '.equipment-photo-strip', '.equipment-specs', '.space-selector', '.archive-lightbox']) {
  if (!css.includes(token)) throw new Error(`Required CSS contract missing: ${token}`);
}

new Function(js);
if (!js.includes('showModal()') || !js.includes("event.key === 'ArrowRight'")) throw new Error('Archive lightbox interaction contract missing');
if (!js.includes("fetch('public/data/blog-posts.json'") || !js.includes("dataset.feedState = 'current'")) throw new Error('Client-side blog feed hydration contract missing');
if (!js.includes("fetch('public/data/place-photo.json'") || !js.includes("dataset.placeState = 'current'")) throw new Error('Client-side Naver Place photo hydration contract missing');
for (const token of ["cron: '23 15 * * *'", 'npm run update:content', 'actions/upload-pages-artifact@v4', 'actions/deploy-pages@v4']) {
  if (!pagesWorkflow.includes(token)) throw new Error(`Pages refresh workflow contract missing: ${token}`);
}
console.log('Build check passed: expanded section flow, 20 Jungsan images, verified branch facts, FAQ, interactions, font, accessibility and responsive contracts are present.');
