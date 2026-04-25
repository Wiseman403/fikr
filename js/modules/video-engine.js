/**
 * video-engine.js — Learning Stream Video Engine
 *
 * Implements the vertical scroll-snapping video feed:
 *   • IntersectionObserver for viewport-aware auto-play / pause
 *   • Dynamic rendering of video cards from a mock dataset
 *   • Engagement interactions (like, comment, share, Remix This)
 *   • Content sanitization of mock user comments
 *
 * @module video-engine
 */

import { sanitizeContent } from './safety.js';

// ─── Mock Data ────────────────────────────────────────────────────

/** Educational video content entries */
const VIDEOS = [
  {
    id: 1,
    title: 'Build Your First Robot! 🤖',
    creator: 'TechKidz Academy',
    creatorAvatar: '🤖',
    likes: 2400,
    comments: 186,
    shares: 340,
    category: 'STEM',
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    duration: '3:42',
  },
  {
    id: 2,
    title: 'Watercolor Galaxy Art 🎨',
    creator: 'ArtSpace Studio',
    creatorAvatar: '🎨',
    likes: 1800,
    comments: 124,
    shares: 256,
    category: 'Art',
    gradientStart: '#f093fb',
    gradientEnd: '#f5576c',
    duration: '5:15',
  },
  {
    id: 3,
    title: 'Fun Math Tricks ✨',
    creator: 'NumberNinja',
    creatorAvatar: '🧮',
    likes: 3200,
    comments: 210,
    shares: 445,
    category: 'Math',
    gradientStart: '#4facfe',
    gradientEnd: '#00f2fe',
    duration: '2:58',
  },
  {
    id: 4,
    title: 'Ocean Life Documentary 🐙',
    creator: 'WildWorld Explorer',
    creatorAvatar: '🌊',
    likes: 4100,
    comments: 312,
    shares: 567,
    category: 'Science',
    gradientStart: '#43e97b',
    gradientEnd: '#38f9d7',
    duration: '7:20',
  },
  {
    id: 5,
    title: 'Learn Guitar in 10 Minutes 🎸',
    creator: 'MusicMaster Pro',
    creatorAvatar: '🎵',
    likes: 1560,
    comments: 98,
    shares: 189,
    category: 'Music',
    gradientStart: '#fa709a',
    gradientEnd: '#fee140',
    duration: '10:00',
  },
  {
    id: 6,
    title: 'Space Exploration Facts 🚀',
    creator: 'CosmicKids',
    creatorAvatar: '🚀',
    likes: 5200,
    comments: 428,
    shares: 712,
    category: 'Science',
    gradientStart: '#a18cd1',
    gradientEnd: '#fbc2eb',
    duration: '6:33',
  },
];

/**
 * Mock comments with intentionally injected HTML.
 * The ContentSanitizer strips every tag before rendering.
 */
const MOCK_COMMENTS = [
  { user: 'CoolKid99',   avatar: '😎', text: 'This is <script>alert("hack")</script> awesome!' },
  { user: 'StarGazer',   avatar: '⭐', text: 'I love this <b>so much</b>!!' },
  { user: 'ArtFan42',    avatar: '🎨', text: 'Can you teach <img src=x onerror=alert(1)> more?' },
  { user: 'CodeWiz',     avatar: '💻', text: 'Super <marquee>cool</marquee> content 🎉' },
  { user: 'NatureLover', avatar: '🌿', text: 'Wow <a href="https://evil.com">amazing</a> video!' },
];

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Formats large numbers for display (e.g. 2400 → "2.4K").
 * @param {number} n
 * @returns {string}
 */
function formatCount(n) {
  return n >= 1000
    ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    : String(n);
}

/**
 * Returns `count` random comments from the mock pool.
 * @param {number} count
 * @returns {Array}
 */
function pickComments(count) {
  return [...MOCK_COMMENTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

// ─── DOM Builders ─────────────────────────────────────────────────

/**
 * Generates the full HTML for a single stream video item.
 * All user-generated comment text is run through `sanitizeContent`
 * before insertion to demonstrate the safety module.
 *
 * @param {Object} video
 * @returns {string} HTML string
 */
function buildVideoHTML(video) {
  const comments = pickComments(3);

  return `
    <div class="stream__item" data-video-id="${video.id}">
      <!-- Animated gradient background -->
      <div class="stream__video-bg"
           style="--gradient-start:${video.gradientStart};
                  --gradient-mid:${video.gradientEnd};
                  --gradient-end:${video.gradientStart};">
        <div class="stream__shapes">
          <span class="stream__shape stream__shape--1"></span>
          <span class="stream__shape stream__shape--2"></span>
          <span class="stream__shape stream__shape--3"></span>
        </div>
        <div class="stream__play-indicator">▶</div>
      </div>

      <!-- Duration badge -->
      <span class="stream__duration">${video.duration}</span>

      <!-- Video info overlay -->
      <div class="stream__info">
        <div class="stream__creator">
          <span class="stream__creator-avatar">${video.creatorAvatar}</span>
          <span class="stream__creator-name">${video.creator}</span>
        </div>
        <h3 class="stream__title">${video.title}</h3>
        <span class="stream__category">${video.category}</span>
      </div>

      <!-- Engagement action buttons -->
      <div class="stream__actions">
        <button class="stream__action-btn" data-action="like" data-video-id="${video.id}">
          <span class="stream__action-icon">❤️</span>
          <span class="stream__action-label">${formatCount(video.likes)}</span>
        </button>
        <button class="stream__action-btn" data-action="comment" data-video-id="${video.id}">
          <span class="stream__action-icon">💬</span>
          <span class="stream__action-label">${formatCount(video.comments)}</span>
        </button>
        <button class="stream__action-btn" data-action="share" data-video-id="${video.id}">
          <span class="stream__action-icon">🔗</span>
          <span class="stream__action-label">${formatCount(video.shares)}</span>
        </button>
        <button class="stream__action-btn stream__action-btn--remix"
                data-action="remix" data-video-id="${video.id}">
          <span class="stream__action-icon">🔄</span>
          <span class="stream__action-label">Remix</span>
        </button>
      </div>

      <!-- Slide-up comments panel (sanitized) -->
      <div class="stream__comments" id="comments-${video.id}">
        <div class="stream__comments-header">
          <span class="stream__comments-title">💬 Comments</span>
          <button class="stream__comments-close" data-close-comments="${video.id}">✕</button>
        </div>
        <div class="stream__comments-list">
          ${comments
            .map(
              (c) => `
            <div class="stream__comment">
              <span class="stream__comment-avatar">${c.avatar}</span>
              <div class="stream__comment-body">
                <span class="stream__comment-user">${c.user}</span>
                <p class="stream__comment-text">${sanitizeContent(c.text)}</p>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </div>`;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Initialises the Learning Stream video engine.
 *
 * Renders all video items into `container`, sets up an
 * IntersectionObserver to auto-activate/deactivate videos,
 * and delegates engagement button clicks.
 *
 * @param {HTMLElement} container - The `.stream` scroll container
 * @param {Object}      opts
 * @param {Function}   [opts.onRemix]  - Called with captured metadata
 * @param {Function}   [opts.onLike]   - Called with (video, isLiked)
 * @param {Function}   [opts.onShare]  - Called with video
 * @param {Object}     [opts.store]    - Reactive store instance
 * @returns {{ getVideos, getActiveVideo, destroy }}
 */
export function initVideoEngine(container, opts = {}) {
  // 1. Render all video cards
  container.innerHTML = VIDEOS.map(buildVideoHTML).join('');

  const items = container.querySelectorAll('.stream__item');

  // 2. IntersectionObserver — activates videos at ≥70% visibility
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = entry.target;
        if (entry.isIntersecting) {
          item.classList.add('stream__item--active');
          console.log(
            `[VideoEngine] ▶ Video ${item.dataset.videoId} entered viewport`
          );
        } else {
          item.classList.remove('stream__item--active');
          // Close any open comments when scrolling away
          const panel = item.querySelector('.stream__comments');
          if (panel) panel.classList.remove('stream__comments--open');
        }
      });
    },
    { root: container, threshold: 0.7 }
  );

  items.forEach((item) => observer.observe(item));

  // 3. Engagement click delegation
  container.addEventListener('click', (e) => {
    // Close-comments button
    const closeBtn = e.target.closest('[data-close-comments]');
    if (closeBtn) {
      const panel = document.getElementById(
        `comments-${closeBtn.dataset.closeComments}`
      );
      if (panel) panel.classList.remove('stream__comments--open');
      return;
    }

    // Action buttons (like / comment / share / remix)
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const videoId = parseInt(actionBtn.dataset.videoId, 10);
    const video = VIDEOS.find((v) => v.id === videoId);
    if (!video) return;

    switch (action) {
      case 'like':
        handleLike(actionBtn, video);
        break;
      case 'comment':
        toggleComments(videoId);
        break;
      case 'share':
        if (opts.onShare) opts.onShare(video);
        break;
      case 'remix':
        handleRemix(video);
        break;
    }
  });

  /* ── Like toggle ─────────────────────────────────────────── */
  function handleLike(btn, video) {
    const liked = btn.classList.toggle('stream__action-btn--liked');
    video.likes += liked ? 1 : -1;
    btn.querySelector('.stream__action-label').textContent = formatCount(
      video.likes
    );
    // Award points through reactive store
    if (liked && opts.store) opts.store.state.learningPoints += 5;
    if (opts.onLike) opts.onLike(video, liked);
  }

  /* ── Comments panel toggle ───────────────────────────────── */
  function toggleComments(videoId) {
    const panel = document.getElementById(`comments-${videoId}`);
    if (panel) panel.classList.toggle('stream__comments--open');
  }

  /* ── Remix — capture metadata ────────────────────────────── */
  function handleRemix(video) {
    const metadata = {
      id: video.id,
      title: video.title,
      creator: video.creator,
      category: video.category,
      duration: video.duration,
      capturedAt: new Date().toISOString(),
    };
    console.log('[VideoEngine] 🔄 Remix metadata captured:', metadata);
    if (opts.onRemix) opts.onRemix(metadata);
  }

  // Activate the first item by default
  if (items.length) items[0].classList.add('stream__item--active');

  // Public interface
  return {
    getVideos: () => [...VIDEOS],
    getActiveVideo() {
      const el = container.querySelector('.stream__item--active');
      if (!el) return null;
      return VIDEOS.find((v) => v.id === +el.dataset.videoId) || null;
    },
    destroy() {
      observer.disconnect();
    },
  };
}

/**
 * Renders compact stream preview cards for the dashboard widget.
 *
 * @param {HTMLElement} container - Preview container element
 * @param {number}      count    - Number of previews to show
 */
export function renderStreamPreview(container, count = 3) {
  container.innerHTML = VIDEOS.slice(0, count)
    .map(
      (v) => `
    <div class="stream-preview-item" data-preview-video="${v.id}">
      <div class="stream-preview-item__thumb"
           style="background:linear-gradient(135deg,${v.gradientStart},${v.gradientEnd});
                  background-size:200% 200%;">
        ${v.creatorAvatar}
      </div>
      <div class="stream-preview-item__info">
        <div class="stream-preview-item__title">${v.title}</div>
        <div class="stream-preview-item__meta">${v.creator} · ${formatCount(v.likes)} ❤️</div>
      </div>
    </div>`
    )
    .join('');
}
