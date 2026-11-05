const blogPostGrid = document.querySelector('[data-blog-feed]');
const blogFeedStatus = document.querySelector('[data-blog-feed-status]');
const placePhoto = document.querySelector('[data-place-photo]');
const placePhotoLabel = document.querySelector('[data-place-photo-label]');

async function refreshPlacePhoto() {
  if (!placePhoto) return;
  try {
    const response = await fetch('public/data/place-photo.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Place photo data unavailable: ${response.status}`);
    const data = await response.json();
    if (data.placeId !== '1052772360' || !data.image?.startsWith('https://ldb-phinf.pstatic.net/') || !/^\d{4}-\d{2}-\d{2}$/.test(data.published)) throw new Error('Place photo data contains an unexpected source');
    placePhoto.src = data.image;
    if (placePhotoLabel) placePhotoLabel.textContent = `LATEST PLACE PHOTO · ${data.published.slice(5).replace('-', '.')}`;
    placePhoto.dataset.placeState = 'current';
  } catch {
    placePhoto.dataset.placeState = 'fallback';
  }
}

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

refreshPlacePhoto();
refreshBlogPosts();

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
const archiveRail = document.querySelector('.photo-archive');
const archiveRailPrevious = document.querySelector('.archive-rail-prev');
const archiveRailNext = document.querySelector('.archive-rail-next');
const archiveLightbox = document.querySelector('#archive-lightbox');
const lightboxImage = archiveLightbox.querySelector('.lightbox-image');
const lightboxCounter = archiveLightbox.querySelector('.lightbox-counter');
const lightboxTitle = archiveLightbox.querySelector('#lightbox-title');
const lightboxClose = archiveLightbox.querySelector('.lightbox-close');
const lightboxPrev = archiveLightbox.querySelector('.lightbox-prev');
const lightboxNext = archiveLightbox.querySelector('.lightbox-next');
let archiveIndex = 0;
let archiveTrigger = null;
let archiveRailFrame;

function updateArchiveRailControls() {
  if (!archiveRail || !archiveRailPrevious || !archiveRailNext) return;
  const maxScroll = Math.max(0, archiveRail.scrollWidth - archiveRail.clientWidth);
  archiveRailPrevious.disabled = archiveRail.scrollLeft <= 4;
  archiveRailNext.disabled = archiveRail.scrollLeft >= maxScroll - 4;
}

function moveArchiveRail(direction) {
  const firstThumb = archiveRail?.querySelector('.archive-thumb');
  if (!archiveRail || !firstThumb) return;
  const railStyle = getComputedStyle(archiveRail);
  const gap = Number.parseFloat(railStyle.columnGap || railStyle.gap) || 0;
  archiveRail.scrollBy({
    left: direction * (firstThumb.getBoundingClientRect().width + gap),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

archiveRailPrevious?.addEventListener('click', () => moveArchiveRail(-1));
archiveRailNext?.addEventListener('click', () => moveArchiveRail(1));
archiveRail?.addEventListener('scroll', () => {
  cancelAnimationFrame(archiveRailFrame);
  archiveRailFrame = requestAnimationFrame(updateArchiveRailControls);
}, { passive: true });
requestAnimationFrame(updateArchiveRailControls);
window.addEventListener('resize', updateArchiveRailControls);

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

const reviewTabs = [...document.querySelectorAll('[data-review-tab]')];
const reviewPanels = [...document.querySelectorAll('.review-panel')];

function activateReviewTab(tab, moveFocus = false) {
  reviewTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  let activePanel = null;
  reviewPanels.forEach((panel) => {
    const selected = panel.id === tab.getAttribute('aria-controls');
    panel.hidden = !selected;
    if (selected) {
      activePanel = panel;
      panel.classList.remove('is-switching');
      void panel.offsetWidth;
      panel.classList.add('is-switching');
    }
  });
  const activeRail = activePanel?.querySelector('.review-image-rail');
  if (activeRail) requestAnimationFrame(() => updateReviewRailControls(activeRail));
  if (moveFocus) tab.focus();
}

reviewTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateReviewTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let targetIndex = index;
    if (event.key === 'ArrowLeft') targetIndex = (index - 1 + reviewTabs.length) % reviewTabs.length;
    if (event.key === 'ArrowRight') targetIndex = (index + 1) % reviewTabs.length;
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = reviewTabs.length - 1;
    activateReviewTab(reviewTabs[targetIndex], true);
  });
});

const reviewRails = [...document.querySelectorAll('.review-image-rail')];
const reviewRailFrames = new WeakMap();

function getReviewRailControls(reviewRail) {
  const panel = reviewRail.closest('.review-panel');
  return {
    previous: panel?.querySelector('.review-rail-prev'),
    next: panel?.querySelector('.review-rail-next'),
  };
}

function updateReviewRailControls(reviewRail) {
  if (!reviewRail) return;
  const { previous, next } = getReviewRailControls(reviewRail);
  if (!previous || !next) return;
  const maxScroll = Math.max(0, reviewRail.scrollWidth - reviewRail.clientWidth);
  previous.disabled = reviewRail.scrollLeft <= 4;
  next.disabled = reviewRail.scrollLeft >= maxScroll - 4;
}

function moveReviewRail(reviewRail, direction) {
  const firstCard = reviewRail?.querySelector('.review-thumb');
  if (!reviewRail || !firstCard) return;
  const railStyle = getComputedStyle(reviewRail);
  const gap = Number.parseFloat(railStyle.columnGap || railStyle.gap) || 0;
  const distance = firstCard.getBoundingClientRect().width + gap;
  reviewRail.scrollBy({
    left: direction * distance,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

reviewRails.forEach((reviewRail) => {
  const { previous, next } = getReviewRailControls(reviewRail);
  previous?.addEventListener('click', () => moveReviewRail(reviewRail, -1));
  next?.addEventListener('click', () => moveReviewRail(reviewRail, 1));
  reviewRail.addEventListener('scroll', () => {
    cancelAnimationFrame(reviewRailFrames.get(reviewRail));
    reviewRailFrames.set(reviewRail, requestAnimationFrame(() => updateReviewRailControls(reviewRail)));
  }, { passive: true });
  requestAnimationFrame(() => updateReviewRailControls(reviewRail));
});
window.addEventListener('resize', () => reviewRails.forEach(updateReviewRailControls));

const bodyProfileRail = document.querySelector('.body-profile-rail');
const bodyProfilePrevious = document.querySelector('.body-profile-prev');
const bodyProfileNext = document.querySelector('.body-profile-next');
let bodyProfileRailFrame;

function updateBodyProfileControls() {
  if (!bodyProfileRail || !bodyProfilePrevious || !bodyProfileNext) return;
  const maxScroll = Math.max(0, bodyProfileRail.scrollWidth - bodyProfileRail.clientWidth);
  bodyProfilePrevious.disabled = bodyProfileRail.scrollLeft <= 4;
  bodyProfileNext.disabled = bodyProfileRail.scrollLeft >= maxScroll - 4;
}

function moveBodyProfileRail(direction) {
  const firstSlot = bodyProfileRail?.querySelector('.body-profile-slot');
  if (!bodyProfileRail || !firstSlot) return;
  const railStyle = getComputedStyle(bodyProfileRail);
  const gap = Number.parseFloat(railStyle.columnGap || railStyle.gap) || 0;
  bodyProfileRail.scrollBy({
    left: direction * (firstSlot.getBoundingClientRect().width + gap),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

bodyProfilePrevious?.addEventListener('click', () => moveBodyProfileRail(-1));
bodyProfileNext?.addEventListener('click', () => moveBodyProfileRail(1));
bodyProfileRail?.addEventListener('scroll', () => {
  cancelAnimationFrame(bodyProfileRailFrame);
  bodyProfileRailFrame = requestAnimationFrame(updateBodyProfileControls);
}, { passive: true });
requestAnimationFrame(updateBodyProfileControls);
window.addEventListener('resize', updateBodyProfileControls);

const reviewThumbs = [...document.querySelectorAll('.review-thumb')];
const reviewLightbox = document.querySelector('#review-lightbox');
const reviewLightboxImage = reviewLightbox.querySelector('.review-lightbox-image');
const reviewLightboxCounter = reviewLightbox.querySelector('.review-lightbox-counter');
const reviewLightboxTitle = reviewLightbox.querySelector('#review-lightbox-title');
const reviewLightboxClose = reviewLightbox.querySelector('.review-lightbox-close');
const reviewLightboxPrev = reviewLightbox.querySelector('.review-lightbox-prev');
const reviewLightboxNext = reviewLightbox.querySelector('.review-lightbox-next');
let reviewIndex = 0;
let reviewTrigger = null;
let activeReviewThumbs = [];

function renderReviewImage(index) {
  if (!activeReviewThumbs.length) return;
  reviewIndex = (index + activeReviewThumbs.length) % activeReviewThumbs.length;
  const thumb = activeReviewThumbs[reviewIndex];
  const thumbImage = thumb.querySelector('img');
  reviewLightboxImage.src = thumbImage.getAttribute('src');
  reviewLightboxImage.alt = thumbImage.alt;
  reviewLightboxCounter.textContent = `${String(reviewIndex + 1).padStart(2, '0')} / ${String(activeReviewThumbs.length).padStart(2, '0')}`;
  reviewLightboxTitle.textContent = thumb.dataset.reviewTitle;
  reviewLightboxImage.classList.remove('is-changing');
  void reviewLightboxImage.offsetWidth;
  reviewLightboxImage.classList.add('is-changing');
}

function openReview(index, trigger) {
  reviewTrigger = trigger;
  activeReviewThumbs = [...trigger.closest('.review-panel').querySelectorAll('.review-thumb')];
  renderReviewImage(index);
  reviewLightbox.showModal();
  document.body.classList.add('lightbox-open');
  reviewLightboxClose.focus();
}

reviewThumbs.forEach((thumb) => thumb.addEventListener('click', () => {
  const panelThumbs = [...thumb.closest('.review-panel').querySelectorAll('.review-thumb')];
  openReview(panelThumbs.indexOf(thumb), thumb);
}));
reviewLightboxPrev.addEventListener('click', () => renderReviewImage(reviewIndex - 1));
reviewLightboxNext.addEventListener('click', () => renderReviewImage(reviewIndex + 1));
reviewLightboxClose.addEventListener('click', () => reviewLightbox.close());
reviewLightbox.addEventListener('click', (event) => {
  if (event.target === reviewLightbox) reviewLightbox.close();
});
reviewLightbox.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  reviewTrigger?.focus();
});
document.addEventListener('keydown', (event) => {
  if (!reviewLightbox.open) return;
  if (event.key === 'ArrowLeft') renderReviewImage(reviewIndex - 1);
  if (event.key === 'ArrowRight') renderReviewImage(reviewIndex + 1);
});

const faqMapThumb = document.querySelector('.faq-map-thumb');
const faqMapDialog = document.querySelector('#faq-map-dialog');
const faqMapClose = faqMapDialog.querySelector('.faq-map-close');
faqMapThumb.addEventListener('click', () => {
  faqMapDialog.showModal();
  document.body.classList.add('lightbox-open');
  faqMapClose.focus();
});
faqMapClose.addEventListener('click', () => faqMapDialog.close());
faqMapDialog.addEventListener('click', (event) => {
  if (event.target === faqMapDialog) faqMapDialog.close();
});
faqMapDialog.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  faqMapThumb.focus();
});

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
