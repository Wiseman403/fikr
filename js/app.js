/**
 * app.js — Main Application Entry Point
 *
 * Orchestrates the entire Fikr application:
 *   • Reactive store initialisation (Proxy-based)
 *   • Sidebar navigation & view routing
 *   • Dashboard Bento Grid rendering
 *   • Learning Stream (lazy-initialised)
 *   • Creative Club hub with category filtering
 *   • Parental Gate integration
 *   • Toast notification system
 *
 * @module app
 */

import { createStore } from './modules/state.js';
import { initVideoEngine, renderStreamPreview } from './modules/video-engine.js';
import { initParentalGate } from './modules/safety.js';

// ═══════════════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════════════

/** Creative Clubs dataset */
const CLUBS = [
  { id: 1,  name: 'Code Wizards',     category: 'coding',  members: 1243, emoji: '🧙‍♂️', color: '#6D28D9', description: 'Learn to code with fun projects and challenges' },
  { id: 2,  name: 'Theater Stars',    category: 'theater', members: 876,  emoji: '🎭', color: '#EF4444', description: 'Acting, improv, and creative drama' },
  { id: 3,  name: 'Art Attack',       category: 'art',     members: 2100, emoji: '🎨', color: '#F59E0B', description: 'Drawing, painting, and digital art' },
  { id: 4,  name: 'Science Lab',      category: 'science', members: 1567, emoji: '🔬', color: '#10B981', description: 'Experiments and discoveries await' },
  { id: 5,  name: 'Book Worms',       category: 'reading', members: 934,  emoji: '📚', color: '#3B82F6', description: 'Reading adventures and book clubs' },
  { id: 6,  name: 'Music Makers',     category: 'music',   members: 1122, emoji: '🎵', color: '#EC4899', description: 'Create and share your music' },
  { id: 7,  name: 'Game Designers',   category: 'coding',  members: 1890, emoji: '🎮', color: '#8B5CF6', description: 'Design and build your own games' },
  { id: 8,  name: 'Nature Explorers', category: 'science', members: 756,  emoji: '🌿', color: '#059669', description: 'Discover the natural world around you' },
  { id: 9,  name: 'Film Crew',        category: 'art',     members: 643,  emoji: '🎬', color: '#F97316', description: 'Filmmaking and video production' },
  { id: 10, name: 'Dance Squad',      category: 'theater', members: 1345, emoji: '💃', color: '#D946EF', description: 'Dance styles from around the world' },
  { id: 11, name: 'Robotics Club',    category: 'coding',  members: 987,  emoji: '🤖', color: '#14B8A6', description: 'Build and program robots' },
  { id: 12, name: 'Poetry Corner',    category: 'reading', members: 432,  emoji: '✍️',  color: '#6366F1', description: 'Express yourself through poetry' },
];

/** Category filter definitions */
const CATEGORIES = [
  { id: 'all',     label: 'All Clubs',          emoji: '✨' },
  { id: 'coding',  label: 'Coding',             emoji: '💻' },
  { id: 'art',     label: 'Art & Design',        emoji: '🎨' },
  { id: 'science', label: 'Science',             emoji: '🔬' },
  { id: 'theater', label: 'Theater & Dance',     emoji: '🎭' },
  { id: 'music',   label: 'Music',               emoji: '🎵' },
  { id: 'reading', label: 'Reading & Writing',   emoji: '📖' },
];

/** Avatar emoji options for profile customisation */
const AVATAR_OPTIONS = [
  '🦊', '🐼', '🦁', '🐱', '🐶', '🦄', '🐸', '🦉',
  '🐨', '🐯', '🐵', '🦋', '🐙', '🦈', '🐬', '🦜', '🐝', '🐞',
];

/** Full badge collection — earned and locked */
const ALL_BADGES = [
  { emoji: '🏆', name: 'Champion',      desc: 'Completed 10 challenges',    earned: true  },
  { emoji: '⭐', name: 'Star Learner',  desc: 'Reached Level 10',           earned: true  },
  { emoji: '🎨', name: 'Artist',        desc: 'Created 5 art projects',     earned: true  },
  { emoji: '🔬', name: 'Scientist',     desc: 'Finished 10 science lessons', earned: true  },
  { emoji: '🎯', name: 'Sharpshooter',  desc: 'Perfect score on 3 quizzes', earned: true  },
  { emoji: '🌟', name: 'Rising Star',   desc: 'First 100 points',           earned: true  },
  { emoji: '🎵', name: 'Musician',      desc: 'Completed music basics',     earned: false },
  { emoji: '📐', name: 'Mathematician', desc: 'Solved 50 problems',         earned: false },
  { emoji: '🌍', name: 'Explorer',      desc: 'Visited all categories',     earned: false },
  { emoji: '🚀', name: 'Pioneer',       desc: 'Among the first 1000 users', earned: false },
  { emoji: '🎭', name: 'Performer',     desc: 'Published 3 theater videos', earned: false },
  { emoji: '📚', name: 'Bookworm',      desc: 'Read 20 articles',           earned: false },
  { emoji: '💡', name: 'Innovator',     desc: 'Remixed 10 videos',          earned: false },
  { emoji: '🤝', name: 'Team Player',   desc: 'Joined 5 clubs',             earned: false },
];

/** Mock user-created video content */
const MY_CREATIONS = [
  { id: 1, title: 'My Science Experiment',   gradientStart: '#667eea', gradientEnd: '#764ba2', views: 342, date: '2 days ago' },
  { id: 2, title: 'Theater Monologue',       gradientStart: '#f093fb', gradientEnd: '#f5576c', views: 128, date: '5 days ago' },
  { id: 3, title: 'How to Draw Animals',     gradientStart: '#4facfe', gradientEnd: '#00f2fe', views: 567, date: '1 week ago' },
  { id: 4, title: 'Math Magic Tricks',       gradientStart: '#43e97b', gradientEnd: '#38f9d7', views: 234, date: '2 weeks ago' },
  { id: 5, title: 'My Book Review',          gradientStart: '#fa709a', gradientEnd: '#fee140', views: 89,  date: '3 weeks ago' },
  { id: 6, title: 'Coding My First Game',    gradientStart: '#a18cd1', gradientEnd: '#fbc2eb', views: 445, date: '1 month ago' },
];

/** Level title mapping */
function getLevelTitle(level) {
  if (level >= 21) return 'Legend';
  if (level >= 16) return 'Master';
  if (level >= 11) return 'Creator';
  if (level >= 6)  return 'Explorer';
  return 'Beginner';
}

// ═══════════════════════════════════════════════════════════════════
//  FIKR APPLICATION CLASS
// ═══════════════════════════════════════════════════════════════════

class FikrApp {
  constructor() {
    /** Currently active view identifier */
    this.currentView = 'dashboard';
    /** Active club category filter */
    this.activeFilter = 'all';
    /** Active text search query (lowercased) */
    this.searchQuery = '';
    /** Video engine instance (lazy) */
    this.videoEngine = null;
    /** Parental gate controller */
    this.parentalGate = null;
    /** Whether profile/settings have been rendered */
    this.profileRendered = false;
    this.settingsRendered = false;

    this.init();
  }

  // ─── Bootstrap ────────────────────────────────────────────────

  init() {
    // 1. Reactive state store
    this.store = createStore({
      userName: 'Alex',
      userAvatar: '🦊',
      learningPoints: 2450,
      streak: 7,
      level: 12,
      badges: ['🏆', '⭐', '🎨', '🔬'],
      joinedClubIds: [],
    });

    // 2. Cache DOM references
    this.cacheDom();

    // 3. Bind store → UI
    this.setupReactiveBindings();

    // 4. Navigation
    this.initNavigation();

    // 5. Dashboard previews
    this.renderDashboardPreviews();

    // 6. Creative Clubs
    this.initClubs();

    // 7. Safety layer
    this.initSafetyLayer();

    // 8. Earn-points demo button
    this.initEarnPoints();

    // 9. Restore persisted settings (theme, toggles, etc.)
    this.loadSettings();

    // 10. Mobile sidebar toggle
    this.initMobileSidebar();

    // 11. Time-of-day greeting + dashboard interactivity
    this.initDashboardGreeting();
    this.initDashboardInteractions();

    // 12. Clubs search
    this.initClubsSearch();

    // 13. Keyboard shortcuts (1-5 for nav)
    this.initKeyboardShortcuts();

    console.log('[Fikr] ✨ Application initialised');
  }

  // ─── DOM Cache ────────────────────────────────────────────────

  cacheDom() {
    this.dom = {
      // Views
      views:           document.querySelectorAll('.view'),
      // Sidebar
      sidebar:          document.getElementById('sidebar'),
      navItems:        document.querySelectorAll('.sidebar__nav-item'),
      sidebarUsername:  document.getElementById('sidebar-username'),
      sidebarLevel:    document.getElementById('sidebar-level'),
      // Dashboard
      welcomeTitle:    document.querySelector('.card__welcome-title'),
      welcomeName:     document.getElementById('welcome-name'),
      welcomeStreak:   document.getElementById('welcome-streak'),
      profileAvatar:   document.getElementById('profile-avatar'),
      profileName:     document.getElementById('profile-name'),
      profileBadges:   document.getElementById('profile-badges'),
      pointsDisplay:   document.getElementById('points-display'),
      pointsProgress:  document.getElementById('points-progress'),
      pointsNext:      document.querySelector('.card__points-next'),
      streakDisplay:   document.getElementById('streak-display'),
      earnPointsBtn:   document.getElementById('earn-points-btn'),
      streamPreview:   document.getElementById('stream-preview'),
      clubsPreview:    document.getElementById('clubs-preview'),
      achievementsGrid:document.querySelector('.card__achievements-grid'),
      // Stream
      learningStream:  document.getElementById('learning-stream'),
      // Clubs
      clubFilters:     document.getElementById('club-filters'),
      clubsGrid:       document.getElementById('clubs-grid'),
      clubsEmpty:      document.getElementById('clubs-empty'),
      clubsSearchInput:document.getElementById('clubs-search-input'),
      clubsSearchClear:document.getElementById('clubs-search-clear'),
      // Profile Page
      profilePageAvatar:    document.getElementById('profile-page-avatar'),
      profilePageName:      document.getElementById('profile-page-name'),
      profilePageLevel:     document.getElementById('profile-page-level'),
      profilePageLevelText: document.getElementById('profile-page-level-text'),
      profilePagePoints:    document.getElementById('profile-page-points'),
      profilePageStreak:    document.getElementById('profile-page-streak'),
      profilePageVideos:    document.querySelector('#view-profile .profile__stats .profile__stat:nth-child(3) .profile__stat-value'),
      profilePageClubs:     document.querySelector('#view-profile .profile__stats .profile__stat:nth-child(4) .profile__stat-value'),
      profileBadgesGrid:    document.getElementById('profile-badges-grid'),
      profileCreationsGrid: document.getElementById('profile-creations-grid'),
      profileClubsList:     document.getElementById('profile-clubs-list'),
      // Settings Page
      avatarPicker:         document.getElementById('avatar-picker'),
      settingsAvatarDisplay:document.getElementById('settings-avatar-display'),
      settingsNameInput:    document.getElementById('settings-name-input'),
      // Parental Gate
      parentalOverlay: document.getElementById('parental-gate'),
      gateProblem:     document.getElementById('gate-problem'),
      gateAnswer:      document.getElementById('gate-answer'),
      gateFeedback:    document.getElementById('gate-feedback'),
      gateSubmit:      document.getElementById('gate-submit'),
      gateCancel:      document.getElementById('gate-cancel'),
      // Toast
      toastContainer:  document.getElementById('toast-container'),
    };
  }

  // ─── Reactive Bindings (Proxy → DOM) ──────────────────────────

  setupReactiveBindings() {
    const { state } = this.store;

    // Learning Points
    this.store.subscribe('learningPoints', (points) => {
      const formatted = points.toLocaleString();

      if (this.dom.pointsDisplay) {
        this.dom.pointsDisplay.textContent = formatted;
        // Trigger pop animation
        this.dom.pointsDisplay.classList.remove('card__points-value--animate');
        void this.dom.pointsDisplay.offsetHeight;
        this.dom.pointsDisplay.classList.add('card__points-value--animate');
      }

      // Progress toward next level (1 level = 1000 pts)
      const inLevel     = points % 1000;
      const pct         = (inLevel / 1000) * 100;
      const toNext      = 1000 - inLevel;
      const currentLevel = Math.floor(points / 1000) + 1;

      if (this.dom.pointsProgress) {
        this.dom.pointsProgress.style.width = `${pct}%`;
      }
      if (this.dom.pointsNext) {
        this.dom.pointsNext.textContent = `${toNext} points to Level ${currentLevel + 1}`;
      }
      if (currentLevel !== state.level) {
        state.level = currentLevel;
      }
    });

    // User name
    this.store.subscribe('userName', (name) => {
      if (this.dom.welcomeName)    this.dom.welcomeName.textContent = name;
      if (this.dom.profileName)    this.dom.profileName.textContent = name;
      if (this.dom.sidebarUsername) this.dom.sidebarUsername.textContent = name;
    });

    // Level
    this.store.subscribe('level', (level) => {
      if (this.dom.sidebarLevel) this.dom.sidebarLevel.textContent = `Level ${level}`;
    });

    // Streak
    this.store.subscribe('streak', (streak) => {
      if (this.dom.streakDisplay) this.dom.streakDisplay.textContent = streak;
      if (this.dom.welcomeStreak) this.dom.welcomeStreak.textContent = `${streak}-day`;
    });

    // Avatar — update dashboard card + profile page + settings page + sidebar
    this.store.subscribe('userAvatar', (avatar) => {
      if (this.dom.profileAvatar)          this.dom.profileAvatar.textContent = avatar;
      if (this.dom.profilePageAvatar)      this.dom.profilePageAvatar.textContent = avatar;
      if (this.dom.settingsAvatarDisplay)  this.dom.settingsAvatarDisplay.textContent = avatar;
      const sidebarAvatar = document.getElementById('sidebar-avatar');
      if (sidebarAvatar) sidebarAvatar.textContent = avatar;
    });

    // Badges — dashboard card
    this.store.subscribe('badges', (badges) => {
      if (this.dom.profileBadges) {
        this.dom.profileBadges.innerHTML = badges
          .map((b) => `<span>${b}</span>`)
          .join('');
      }
    });

    // Learning Points — profile page stats
    this.store.subscribe('learningPoints', (points) => {
      if (this.dom.profilePagePoints) {
        this.dom.profilePagePoints.textContent = points.toLocaleString();
      }
    });

    // User name — profile page
    this.store.subscribe('userName', (name) => {
      if (this.dom.profilePageName) this.dom.profilePageName.textContent = name;
    });

    // Streak — profile page
    this.store.subscribe('streak', (streak) => {
      if (this.dom.profilePageStreak) this.dom.profilePageStreak.textContent = streak;
    });

    // Level — profile page level badge and text
    this.store.subscribe('level', (level) => {
      if (this.dom.profilePageLevel) this.dom.profilePageLevel.textContent = level;
      if (this.dom.profilePageLevelText) {
        this.dom.profilePageLevelText.textContent = `Level ${level} · ${getLevelTitle(level)}`;
      }
    });

    // Joined clubs — keep profile stats + clubs list in sync
    this.store.subscribe('joinedClubIds', (ids) => {
      const count = (ids || []).length;
      if (this.dom.profilePageClubs) this.dom.profilePageClubs.textContent = count;
      if (this.profileRendered) this.renderProfileClubs();
    });

    // Static profile stat — videos count derived from MY_CREATIONS
    if (this.dom.profilePageVideos) {
      this.dom.profilePageVideos.textContent = MY_CREATIONS.length;
    }
  }

  // ─── Navigation & View Routing ────────────────────────────────

  initNavigation() {
    // Sidebar nav items
    this.dom.navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const view   = item.dataset.view;
        const action = item.dataset.action;
        if (view)                    this.switchView(view);
        else if (action === 'settings') this.handleSettingsClick();
      });
    });

    // In-page "See All / Explore" buttons
    document.querySelectorAll('[data-view]').forEach((btn) => {
      if (btn.classList.contains('sidebar__nav-item')) return;
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });
  }

  /**
   * Switches the visible view and updates sidebar active states.
   * The Learning Stream is lazy-initialised on first visit.
   */
  switchView(viewId) {
    if (this.currentView === viewId) return;
    this.currentView = viewId;

    // Toggle view visibility
    this.dom.views.forEach((v) => v.classList.remove('view--active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('view--active');

    // Update sidebar
    this.dom.navItems.forEach((item) => {
      item.classList.toggle('sidebar__nav-item--active', item.dataset.view === viewId);
    });

    // Lazy-init views on first visit
    if (viewId === 'stream'   && !this.videoEngine)      this.initStream();
    if (viewId === 'profile'  && !this.profileRendered)   this.renderProfile();
    if (viewId === 'settings' && !this.settingsRendered)  this.renderSettings();

    console.log(`[Fikr] 📄 View → ${viewId}`);
  }

  // ─── Settings (Parental Gate) ─────────────────────────────────

  async handleSettingsClick() {
    if (!this.parentalGate) return;

    const passed = await this.parentalGate.open();
    if (passed) {
      this.showToast('success', 'Access Granted', 'Welcome to Settings, parent! 👋');
      this.switchView('settings');
      // Update sidebar active state for settings
      this.dom.navItems.forEach((item) => {
        item.classList.toggle('sidebar__nav-item--active', item.dataset.action === 'settings');
      });
    }
  }

  // ─── Dashboard Previews ───────────────────────────────────────

  renderDashboardPreviews() {
    // Stream preview thumbnails
    if (this.dom.streamPreview) {
      renderStreamPreview(this.dom.streamPreview, 4);
      this.dom.streamPreview.addEventListener('click', () => this.switchView('stream'));
    }

    // Clubs preview list
    if (this.dom.clubsPreview) {
      this.dom.clubsPreview.innerHTML = CLUBS.slice(0, 4)
        .map(
          (c) => `
          <div class="club-preview-item">
            <span class="club-preview-item__emoji" style="background:${c.color}20;">${c.emoji}</span>
            <div class="club-preview-item__info">
              <div class="club-preview-item__name">${c.name}</div>
              <div class="club-preview-item__members">${c.members.toLocaleString()} members</div>
            </div>
          </div>`
        )
        .join('');
      this.dom.clubsPreview.addEventListener('click', () => this.switchView('clubs'));
    }
  }

  // ─── Learning Stream ──────────────────────────────────────────

  initStream() {
    if (!this.dom.learningStream) return;

    this.videoEngine = initVideoEngine(this.dom.learningStream, {
      store: this.store,
      onRemix: (meta) => {
        this.showToast('info', '🔄 Remix Studio Opening', `Remixing: ${meta.title} by ${meta.creator}`);
        this.store.state.learningPoints += 25;
        this.showToast('success', '+25 Points! 🎉', 'Creativity bonus for remixing!');
      },
      onLike: (video, liked) => {
        if (liked) this.showToast('success', '+5 Points! ⭐', `You liked "${video.title}"`);
      },
      onShare: (video) => {
        this.showToast('info', 'Shared! 🔗', `"${video.title}" link copied`);
      },
    });
  }

  // ─── Creative Clubs ───────────────────────────────────────────

  initClubs() {
    this.renderClubFilters();
    this.renderClubs('all');
  }

  /** Renders category filter pill buttons */
  renderClubFilters() {
    if (!this.dom.clubFilters) return;

    this.dom.clubFilters.innerHTML = CATEGORIES.map(
      (cat) => `
      <button class="clubs__filter-btn ${cat.id === 'all' ? 'clubs__filter-btn--active' : ''}"
              data-category="${cat.id}">
        <span>${cat.emoji}</span>
        <span>${cat.label}</span>
      </button>`
    ).join('');

    this.dom.clubFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.clubs__filter-btn');
      if (!btn) return;

      this.activeFilter = btn.dataset.category;

      // Update active pill
      this.dom.clubFilters
        .querySelectorAll('.clubs__filter-btn')
        .forEach((b) =>
          b.classList.toggle('clubs__filter-btn--active', b.dataset.category === this.activeFilter)
        );

      this.renderClubs(this.activeFilter);
    });
  }

  /**
   * Renders club cards filtered by the active category and search query.
   * @param {string} category - 'all' or a specific category id
   */
  renderClubs(category = this.activeFilter) {
    if (!this.dom.clubsGrid) return;

    const q = this.searchQuery;
    const filtered = CLUBS.filter((c) => {
      const matchCategory = category === 'all' || c.category === category;
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });

    if (this.dom.clubsEmpty) {
      this.dom.clubsEmpty.hidden = filtered.length > 0;
    }

    this.dom.clubsGrid.innerHTML = filtered
      .map(
        (club, i) => {
          const isJoined = (this.store.state.joinedClubIds || []).includes(club.id);
          const btnLabel = isJoined ? 'Joined ✓' : 'Join';
          return `
      <div class="clubs__card" style="animation-delay:${i * 0.05}s;">
        <div class="clubs__card-header"
             style="background:linear-gradient(135deg,${club.color}30,${club.color}10);">
          <span class="clubs__card-emoji">${club.emoji}</span>
        </div>
        <div class="clubs__card-body">
          <h3 class="clubs__card-name">${club.name}</h3>
          <p class="clubs__card-description">${club.description}</p>
          <div class="clubs__card-footer">
            <span class="clubs__card-members">👥 ${club.members.toLocaleString()}</span>
            <button class="btn ${isJoined ? 'btn--joined' : 'btn--primary'} clubs__card-join"
                    data-club-id="${club.id}"
                    data-joined="${isJoined}"
                    aria-pressed="${isJoined}">${btnLabel}</button>
          </div>
        </div>
      </div>`;
        }
      )
      .join('');

    // Join / Leave toggle handlers
    this.dom.clubsGrid.querySelectorAll('.clubs__card-join').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clubId = +btn.dataset.clubId;
        const club = CLUBS.find((c) => c.id === clubId);
        const wasJoined = btn.dataset.joined === 'true';
        const ids = [...(this.store.state.joinedClubIds || [])];

        if (wasJoined) {
          // LEAVE
          this.store.state.joinedClubIds = ids.filter((id) => id !== clubId);
          this.saveSettings();
          this.renderClubs();
          this.showToast('info', `Left ${club.emoji} ${club.name}`, 'You can rejoin anytime.');
        } else {
          // JOIN
          if (!ids.includes(clubId)) ids.push(clubId);
          this.store.state.joinedClubIds = ids;
          this.store.state.learningPoints += 50;
          this.saveSettings();
          this.renderClubs();
          this.showToast('success', `Joined ${club.emoji} ${club.name}!`, '+50 Learning Points earned!');
        }
      });

      // Hover hint: switch label to "Leave" on joined buttons
      btn.addEventListener('mouseenter', () => {
        if (btn.dataset.joined === 'true') btn.textContent = 'Leave';
      });
      btn.addEventListener('mouseleave', () => {
        if (btn.dataset.joined === 'true') btn.textContent = 'Joined ✓';
      });
    });
  }

  // ─── Clubs Search ─────────────────────────────────────────────

  initClubsSearch() {
    const input = this.dom.clubsSearchInput;
    const clear = this.dom.clubsSearchClear;
    if (!input) return;

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.searchQuery = input.value.trim().toLowerCase();
        if (clear) clear.hidden = !input.value;
        this.renderClubs();
      }, 120);
    });

    if (clear) {
      clear.addEventListener('click', () => {
        input.value = '';
        this.searchQuery = '';
        clear.hidden = true;
        this.renderClubs();
        input.focus();
      });
    }
  }

  // ─── Parental Gate Init ───────────────────────────────────────

  initSafetyLayer() {
    this.parentalGate = initParentalGate({
      overlay:   this.dom.parentalOverlay,
      problem:   this.dom.gateProblem,
      input:     this.dom.gateAnswer,
      feedback:  this.dom.gateFeedback,
      submitBtn: this.dom.gateSubmit,
      cancelBtn: this.dom.gateCancel,
    });
  }

  // ─── Earn Points Button ───────────────────────────────────────

  initEarnPoints() {
    if (!this.dom.earnPointsBtn) return;

    this.dom.earnPointsBtn.addEventListener('click', () => {
      const earned = Math.floor(Math.random() * 41) + 10; // 10–50
      this.store.state.learningPoints += earned;
      this.showToast('success', `+${earned} Points! ⭐`, 'Keep learning to earn more!');
    });
  }

  // ─── Profile View Rendering ───────────────────────────────────

  /**
   * Renders the full Profile page: badges grid, video creations,
   * and joined clubs list.
   */
  renderProfile() {
    // Badges grid
    if (this.dom.profileBadgesGrid) {
      this.dom.profileBadgesGrid.innerHTML = ALL_BADGES.map((badge, i) => `
        <div class="profile__badge ${badge.earned ? 'profile__badge--earned' : ''}"
             role="button" tabindex="0" data-badge-index="${i}"
             title="${badge.name}: ${badge.desc}">
          <span class="profile__badge-emoji">${badge.emoji}</span>
          <span class="profile__badge-name">${badge.name}</span>
          <span class="profile__badge-desc">${badge.desc}</span>
        </div>
      `).join('');

      // Click / keyboard reveal — same behaviour as dashboard achievements
      this.dom.profileBadgesGrid.addEventListener('click', (e) => {
        const tile = e.target.closest('[data-badge-index]');
        if (!tile) return;
        const badge = ALL_BADGES[+tile.dataset.badgeIndex];
        const status = badge.earned ? '🏆 Unlocked' : '🔒 Locked';
        this.showToast(
          badge.earned ? 'success' : 'info',
          `${badge.emoji} ${badge.name}`,
          `${status} · ${badge.desc}`
        );
      });
    }

    // Video creations grid
    if (this.dom.profileCreationsGrid) {
      this.dom.profileCreationsGrid.innerHTML = MY_CREATIONS.map((video) => `
        <div class="profile__creation">
          <div class="profile__creation-thumb"
               style="background:linear-gradient(135deg,${video.gradientStart},${video.gradientEnd});
                      background-size:200% 200%;">
            <span class="profile__creation-play">▶</span>
          </div>
          <div class="profile__creation-info">
            <span class="profile__creation-title">${video.title}</span>
            <span class="profile__creation-meta">👁 ${video.views} views · ${video.date}</span>
          </div>
        </div>
      `).join('');
    }

    // Joined clubs list (reactive)
    this.renderProfileClubs();

    this.profileRendered = true;
    console.log('[Fikr] 👤 Profile rendered');
  }

  /**
   * Renders the joined clubs list on the Profile page.
   * Shows an empty state with a CTA when no clubs are joined.
   */
  renderProfileClubs() {
    if (!this.dom.profileClubsList) return;

    const joinedIds = this.store.state.joinedClubIds || [];

    if (joinedIds.length === 0) {
      this.dom.profileClubsList.innerHTML = `
        <div class="profile__clubs-empty">
          <span class="profile__clubs-empty-emoji">🎨</span>
          <div>You haven't joined any clubs yet — find your tribe!</div>
          <button class="btn btn--primary profile__clubs-empty-cta" data-view="clubs">
            Browse Clubs →
          </button>
        </div>`;

      // Wire up the CTA navigation
      const cta = this.dom.profileClubsList.querySelector('[data-view="clubs"]');
      if (cta) cta.addEventListener('click', () => this.switchView('clubs'));
      return;
    }

    const joinedClubs = CLUBS.filter((c) => joinedIds.includes(c.id));
    this.dom.profileClubsList.innerHTML = joinedClubs.map((club) => `
      <div class="profile__club">
        <span class="profile__club-emoji" style="background:${club.color}20;">${club.emoji}</span>
        <div class="profile__club-info">
          <span class="profile__club-name">${club.name}</span>
          <span class="profile__club-members">${club.members.toLocaleString()} members</span>
        </div>
        <span class="profile__club-status">✅ Joined</span>
      </div>
    `).join('');
  }

  // ─── Settings View Rendering ──────────────────────────────────

  /**
   * Renders the Settings page: avatar picker grid, and wires up
   * all interactive controls (toggles, inputs, sign-out).
   */
  renderSettings() {
    // Avatar picker grid
    if (this.dom.avatarPicker) {
      this.dom.avatarPicker.innerHTML = AVATAR_OPTIONS.map((emoji) => `
        <button class="avatar-option ${emoji === this.store.state.userAvatar ? 'avatar-option--active' : ''}"
                data-avatar="${emoji}">
          ${emoji}
        </button>
      `).join('');
    }

    // Sync name input with current state
    if (this.dom.settingsNameInput) {
      this.dom.settingsNameInput.value = this.store.state.userName;
    }

    this.initSettingsInteractions();
    this.settingsRendered = true;
    console.log('[Fikr] ⚙️ Settings rendered');
  }

  /**
   * Wires up all Settings page interactions:
   *   - Avatar picker (click to select)
   *   - Name input (debounced update)
   *   - Toggle switches (on/off)
   *   - Content filter select
   *   - Sign out button
   */
  initSettingsInteractions() {
    // Avatar picker
    if (this.dom.avatarPicker) {
      this.dom.avatarPicker.addEventListener('click', (e) => {
        const option = e.target.closest('.avatar-option');
        if (!option) return;

        const emoji = option.dataset.avatar;
        this.store.state.userAvatar = emoji;

        // Update active state in picker
        this.dom.avatarPicker.querySelectorAll('.avatar-option').forEach((opt) => {
          opt.classList.toggle('avatar-option--active', opt.dataset.avatar === emoji);
        });

        this.saveSettings();
        this.showToast('success', 'Avatar Updated!', `You're now ${emoji}`);
      });
    }

    // Name input with debounce
    if (this.dom.settingsNameInput) {
      let debounceTimer;
      this.dom.settingsNameInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const newName = this.dom.settingsNameInput.value.trim() || 'Alex';
          this.store.state.userName = newName;
          this.saveSettings();
          this.showToast('success', 'Name Updated!', `Hello, ${newName}!`);
        }, 600);
      });
    }

    // Toggle switches — FUNCTIONAL
    document.querySelectorAll('.toggle__input[data-setting]').forEach((toggle) => {
      toggle.addEventListener('change', () => {
        const setting = toggle.dataset.setting;
        const isOn = toggle.checked;

        // Apply the actual behaviour
        switch (setting) {
          case 'darkMode':
            document.documentElement.setAttribute(
              'data-theme', isOn ? 'dark' : 'light'
            );
            break;
          case 'animations':
            document.body.classList.toggle('no-animations', !isOn);
            break;
        }

        const labels = {
          darkMode: 'Dark Mode', animations: 'Animations',
          notifyVideos: 'Video Notifications', notifyClubs: 'Club Notifications',
          notifyAchievements: 'Achievement Notifications',
        };
        this.saveSettings();
        this.showToast('info', `${labels[setting] || setting}`, `${isOn ? 'Enabled ✅' : 'Disabled ❌'}`);
      });
    });

    // Content filter select
    const filterSelect = document.getElementById('content-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        const label = filterSelect.options[filterSelect.selectedIndex].text;
        this.saveSettings();
        this.showToast('info', 'Content Filter Updated', `Set to: ${label}`);
      });
    }

    // Sign out — clear stored settings
    const signoutBtn = document.getElementById('settings-signout');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => {
        localStorage.removeItem('fikr_settings');
        this.showToast('info', 'Signed Out', 'Redirecting to homepage...');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
      });
    }

    // Reset to defaults — restore initial settings without signing out
    const resetBtn = document.getElementById('settings-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSettings());
    }
  }

  /**
   * Restores all toggles, theme, name, and avatar to their
   * out-of-the-box defaults. Joined clubs are preserved.
   */
  resetSettings() {
    const defaults = {
      userName:   'Alex',
      userAvatar: '🦊',
      toggles: {
        darkMode: true, animations: true,
        notifyVideos: true, notifyClubs: true, notifyAchievements: true,
      },
      contentFilter: 'moderate',
    };

    // Apply to state
    this.store.state.userName   = defaults.userName;
    this.store.state.userAvatar = defaults.userAvatar;

    // Sync UI inputs
    if (this.dom.settingsNameInput) this.dom.settingsNameInput.value = defaults.userName;
    if (this.dom.avatarPicker) {
      this.dom.avatarPicker.querySelectorAll('.avatar-option').forEach((opt) => {
        opt.classList.toggle('avatar-option--active', opt.dataset.avatar === defaults.userAvatar);
      });
    }

    // Sync toggles + apply behaviour
    Object.entries(defaults.toggles).forEach(([key, value]) => {
      const t = document.querySelector(`.toggle__input[data-setting="${key}"]`);
      if (t) t.checked = value;
      if (key === 'darkMode') {
        document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light');
      }
      if (key === 'animations') {
        document.body.classList.toggle('no-animations', !value);
      }
    });

    // Filter
    const filterEl = document.getElementById('content-filter');
    if (filterEl) filterEl.value = defaults.contentFilter;

    this.saveSettings();
    this.showToast('success', 'Settings Reset', 'All preferences restored to defaults.');
  }

  // ─── Settings Persistence (localStorage) ─────────────────────

  /**
   * Saves all user preferences to localStorage so they persist
   * across page reloads and sessions.
   */
  saveSettings() {
    const toggles = {};
    document.querySelectorAll('.toggle__input[data-setting]').forEach((t) => {
      toggles[t.dataset.setting] = t.checked;
    });

    const filterEl = document.getElementById('content-filter');

    const data = {
      userName:     this.store.state.userName,
      userAvatar:   this.store.state.userAvatar,
      joinedClubIds: this.store.state.joinedClubIds || [],
      toggles,
      contentFilter: filterEl ? filterEl.value : 'moderate',
    };

    try {
      localStorage.setItem('fikr_settings', JSON.stringify(data));
    } catch (e) {
      console.warn('[Fikr] Could not save settings:', e);
    }
  }

  /**
   * Restores persisted settings from localStorage on app boot.
   * Applies theme, animations mode, and syncs toggle states.
   */
  loadSettings() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem('fikr_settings'));
    } catch { /* ignore */ }

    if (!data) return;

    // Restore user profile
    if (data.userName)  this.store.state.userName  = data.userName;
    if (data.userAvatar) this.store.state.userAvatar = data.userAvatar;
    if (data.joinedClubIds) this.store.state.joinedClubIds = data.joinedClubIds;

    // Restore toggles and apply behaviour
    if (data.toggles) {
      Object.entries(data.toggles).forEach(([key, value]) => {
        const toggle = document.querySelector(`.toggle__input[data-setting="${key}"]`);
        if (toggle) toggle.checked = value;

        // Apply the actual effect
        if (key === 'darkMode') {
          document.documentElement.setAttribute(
            'data-theme', value ? 'dark' : 'light'
          );
        }
        if (key === 'animations' && !value) {
          document.body.classList.add('no-animations');
        }
      });
    }

    // Restore content filter
    if (data.contentFilter) {
      const filterEl = document.getElementById('content-filter');
      if (filterEl) filterEl.value = data.contentFilter;
    }

    // Re-render clubs grid with joined states
    this.renderClubs(this.activeFilter);

    console.log('[Fikr] 📦 Settings restored from localStorage');
  }

  // ─── Time-of-Day Greeting ────────────────────────────────────

  /**
   * Replaces the static "Welcome back" with a greeting that
   * adapts to morning / afternoon / evening / late-night.
   */
  initDashboardGreeting() {
    const titleEl = this.dom.welcomeTitle;
    if (!titleEl) return;
    const hour = new Date().getHours();
    const greeting =
      hour < 5  ? 'Burning the midnight oil,' :
      hour < 12 ? 'Good morning,' :
      hour < 17 ? 'Good afternoon,' :
      hour < 21 ? 'Good evening,' :
                  'Winding down,';
    const name = this.store.state.userName;
    titleEl.innerHTML = `${greeting} <span id="welcome-name">${name}</span>!`;
    // Re-cache the welcome name so reactive updates still find it
    this.dom.welcomeName = document.getElementById('welcome-name');
  }

  // ─── Dashboard Interactions (clickable achievements) ─────────

  /**
   * Makes dashboard achievement icons clickable, surfacing the
   * matching badge name/description as a toast.
   */
  initDashboardInteractions() {
    if (!this.dom.achievementsGrid) return;

    // Pair each .achievement element with its badge metadata by index
    const tiles = this.dom.achievementsGrid.querySelectorAll('.achievement');
    tiles.forEach((tile, i) => {
      const badge = ALL_BADGES[i];
      if (!badge) return;
      tile.style.cursor = 'pointer';
      tile.setAttribute('title', `${badge.name} — ${badge.desc}`);
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');

      const reveal = () => {
        const status = badge.earned ? '🏆 Unlocked' : '🔒 Locked';
        this.showToast(
          badge.earned ? 'success' : 'info',
          `${badge.emoji} ${badge.name}`,
          `${status} · ${badge.desc}`
        );
      };
      tile.addEventListener('click', reveal);
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reveal();
        }
      });
    });
  }

  // ─── Keyboard Shortcuts ─────────────────────────────────────

  /**
   * Wires up Alt+1..5 shortcuts to swap views, plus Esc to close
   * comments on the active stream item. Skipped when the user is
   * typing in an input/textarea.
   */
  initKeyboardShortcuts() {
    const map = { '1': 'dashboard', '2': 'stream', '3': 'clubs', '4': 'profile' };

    document.addEventListener('keydown', (e) => {
      // Don't intercept while typing
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      // Esc closes any open stream comments panel
      if (e.key === 'Escape') {
        document
          .querySelectorAll('.stream__comments--open')
          .forEach((p) => p.classList.remove('stream__comments--open'));
        return;
      }

      // Alt+number nav (Alt avoids clashing with browser shortcuts)
      if (e.altKey && map[e.key]) {
        e.preventDefault();
        this.switchView(map[e.key]);
      }
      // Alt+5 → settings (gated)
      if (e.altKey && e.key === '5') {
        e.preventDefault();
        this.handleSettingsClick();
      }
    });
  }

  // ─── Mobile Sidebar Toggle ──────────────────────────────────

  /**
   * Wires up the mobile hamburger menu button to open/close
   * the sidebar with an overlay.
   */
  initMobileSidebar() {
    const btn     = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = this.dom.sidebar;
    if (!btn || !overlay || !sidebar) return;

    const open  = () => {
      sidebar.classList.add('sidebar--open');
      overlay.classList.add('sidebar-overlay--visible');
      btn.textContent = '✕';
    };
    const close = () => {
      sidebar.classList.remove('sidebar--open');
      overlay.classList.remove('sidebar-overlay--visible');
      btn.textContent = '☰';
    };

    btn.addEventListener('click', () => {
      sidebar.classList.contains('sidebar--open') ? close() : open();
    });
    overlay.addEventListener('click', close);

    // Close sidebar when a nav item is clicked (mobile UX)
    this.dom.navItems.forEach((item) => {
      item.addEventListener('click', close);
    });
  }

  // ─── Toast Notification System ────────────────────────────────

  /**
   * Displays a transient toast notification.
   *
   * @param {'success'|'info'|'warning'} type
   * @param {string} title
   * @param {string} message
   * @param {number} duration - ms before auto-dismissal
   */
  showToast(type, title, message, duration = 3000) {
    if (!this.dom.toastContainer) return;

    const icons = { success: '✅', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || '📢'}</span>
      <div class="toast__content">
        <div class="toast__title">${title}</div>
        <div class="toast__message">${message}</div>
      </div>`;

    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--leaving');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  window.fikrApp = new FikrApp();
});
