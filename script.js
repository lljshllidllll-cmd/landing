const blogPostGrid = document.querySelector('[data-blog-feed]');
const blogFeedStatus = document.querySelector('[data-blog-feed-status]');

function createBlogPost(post) {
  const link = document.createElement('a');
  link.className = 'blog-post';
  link.href = post.url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.setAttribute('aria-label', `${post.title} 게시물 열기`);

  const image = document.createElement('img');
  image.src = post.image;
  image.alt = `${post.title} 대표 이미지`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.referrerPolicy = 'no-referrer';

  const meta = document.createElement('span');
  const date = document.createElement('b');
  date.textContent = post.published.slice(5).replace('-', '.');
  const title = document.createElement('strong');
  title.textContent = post.title.replace(/^중산동\s*헬스장\s*[|ㅣI]?\s*/i, '');
  meta.append(date, title);
  link.append(image, meta);
  return link;
}

async function refreshBlogPosts() {
  if (!blogPostGrid) return;
  try {
    const response = await fetch('public/data/blog-posts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Blog feed data unavailable: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.posts) || data.posts.length !== 4) throw new Error('Blog feed data must contain four posts');
    const validPosts = data.posts.every((post) => post.title && post.published && post.url.startsWith('https://blog.naver.com/1986fitness3/') && post.image.startsWith('https://blogthumb.pstatic.net/'));
    if (!validPosts) throw new Error('Blog feed data contains an unexpected source');
    blogPostGrid.replaceChildren(...data.posts.map(createBlogPost));
    blogPostGrid.dataset.feedState = 'current';
  } catch {
    blogPostGrid.dataset.feedState = 'fallback';
    if (blogFeedStatus) blogFeedStatus.textContent = '자동 갱신에 실패해 마지막으로 저장된 최근 게시물을 표시하고 있습니다.';
  }
}

refreshBlogPosts();

const paths = {
  beginner: {
    code: 'PATH 01',
    title: '첫 운동을 낯설지 않게',
    copy: '생활 리듬과 운동 경험을 먼저 확인하고, 기구와 공간에 익숙해지는 순서로 시작합니다.',
    steps: [
      ['목표와 운동 경험 확인', '무엇을 바꾸고 싶은지 편하게 이야기합니다.'],
      ['공간과 기구 적응', '처음 사용할 기구와 기본 동선을 확인합니다.'],
      ['첫 루틴 방향 잡기', '혼자서도 이어갈 수 있는 시작점을 정합니다.']
    ]
  },
  routine: {
    code: 'PATH 02',
    title: '막힌 루틴에 이유를 더하기',
    copy: '현재 하고 있는 운동을 함께 살펴보고, 동작과 순서를 이해할 수 있는 반복 계획으로 정리합니다.',
    steps: [
      ['현재 루틴 확인', '자주 하는 운동과 막히는 지점을 먼저 정리합니다.'],
      ['움직임과 동작 체크', '불편하거나 확신이 없는 동작을 살펴봅니다.'],
      ['반복 계획 정리', '내가 혼자서도 실행할 수 있는 순서를 만듭니다.']
    ]
  },
  pt: {
    code: 'PATH 03',
    title: '목적에 맞는 코칭 찾기',
    copy: '원하는 변화와 현재 상태를 함께 확인한 뒤, 어떤 수업 방향과 코칭이 필요한지 살펴봅니다.',
    steps: [
      ['운동 목적 상담', '체력, 체형, 움직임 등 원하는 방향을 확인합니다.'],
      ['현재 움직임 체크', '목표와 연결되는 기본 움직임을 살펴봅니다.'],
      ['코칭 방향 안내', '중산점 코치 자료 확인 후 적합한 상담으로 연결합니다.']
    ]
  }
};

const pathButtons = [...document.querySelectorAll('[data-path]')];
const finderResult = document.querySelector('.finder-result');
const resultCode = document.querySelector('.result-code');
const resultTitle = document.querySelector('.result-title');
const resultCopy = document.querySelector('.result-copy');
const resultSteps = document.querySelector('.result-steps');

function renderPath(key) {
  const path = paths[key];
  resultCode.textContent = path.code;
  resultTitle.textContent = path.title;
  resultCopy.textContent = path.copy;
  resultSteps.innerHTML = path.steps.map((step, index) => `
    <li>
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${step[0]}</strong>
      <small>${step[1]}</small>
    </li>
  `).join('');
  finderResult.classList.remove('is-changing');
  void finderResult.offsetWidth;
  finderResult.classList.add('is-changing');
}

pathButtons.forEach((button) => {
  button.addEventListener('click', () => {
    pathButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderPath(button.dataset.path);
  });
});

const spaceButtons = [...document.querySelectorAll('[data-space-image]')];
const spaceFeature = document.querySelector('.space-feature');
const spaceImage = document.querySelector('#space-feature-image');
const spaceCounter = document.querySelector('.space-counter');
const spaceTitle = document.querySelector('.space-feature-title');
const spaceNote = document.querySelector('.space-feature-note');

spaceButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    spaceButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    spaceFeature.classList.add('is-changing');
    window.setTimeout(() => {
      spaceImage.src = button.dataset.spaceImage;
      spaceImage.alt = button.dataset.spaceAlt;
      spaceCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(spaceButtons.length).padStart(2, '0')}`;
      spaceTitle.textContent = button.dataset.spaceTitle;
      spaceNote.textContent = button.dataset.spaceNote;
      spaceFeature.classList.remove('is-changing');
    }, 180);
  });
});

const archiveThumbs = [...document.querySelectorAll('.archive-thumb')];
const archiveLightbox = document.querySelector('#archive-lightbox');
const lightboxImage = archiveLightbox.querySelector('.lightbox-image');
const lightboxCounter = archiveLightbox.querySelector('.lightbox-counter');
const lightboxTitle = archiveLightbox.querySelector('#lightbox-title');
const lightboxClose = archiveLightbox.querySelector('.lightbox-close');
const lightboxPrev = archiveLightbox.querySelector('.lightbox-prev');
const lightboxNext = archiveLightbox.querySelector('.lightbox-next');
let archiveIndex = 0;
let archiveTrigger = null;

function renderArchiveImage(index) {
  archiveIndex = (index + archiveThumbs.length) % archiveThumbs.length;
  const thumb = archiveThumbs[archiveIndex];
  const thumbImage = thumb.querySelector('img');
  lightboxImage.src = thumbImage.getAttribute('src');
  lightboxImage.alt = thumbImage.alt;
  lightboxCounter.textContent = `${String(archiveIndex + 1).padStart(2, '0')} / ${String(archiveThumbs.length).padStart(2, '0')}`;
  lightboxTitle.textContent = thumb.dataset.galleryTitle;
  lightboxImage.classList.remove('is-changing');
  void lightboxImage.offsetWidth;
  lightboxImage.classList.add('is-changing');
}

function openArchive(index, trigger) {
  archiveTrigger = trigger;
  renderArchiveImage(index);
  archiveLightbox.showModal();
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
}

archiveThumbs.forEach((thumb, index) => thumb.addEventListener('click', () => openArchive(index, thumb)));
lightboxPrev.addEventListener('click', () => renderArchiveImage(archiveIndex - 1));
lightboxNext.addEventListener('click', () => renderArchiveImage(archiveIndex + 1));
lightboxClose.addEventListener('click', () => archiveLightbox.close());
archiveLightbox.addEventListener('click', (event) => {
  if (event.target === archiveLightbox) archiveLightbox.close();
});
archiveLightbox.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  archiveTrigger?.focus();
});
document.addEventListener('keydown', (event) => {
  if (!archiveLightbox.open) return;
  if (event.key === 'ArrowLeft') renderArchiveImage(archiveIndex - 1);
  if (event.key === 'ArrowRight') renderArchiveImage(archiveIndex + 1);
});

const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.hidden = open;
  menuButton.querySelector('.sr-only').textContent = open ? '메뉴 열기' : '메뉴 닫기';
});
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = '메뉴 열기';
  mobileMenu.hidden = true;
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('[data-reveal]').forEach((item, index) => {
  item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
  revealObserver.observe(item);
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
}
