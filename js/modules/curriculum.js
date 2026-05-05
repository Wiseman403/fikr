/**
 * curriculum.js — Curriculum Path View Engine
 *
 * Self-contained module that renders the three drill-down views
 * (Years → Courses → Course Detail) and a content modal that hosts
 * six rich item types (scenario / topic / exercise / quiz / video /
 * project). All UI mutations route through this module so it can be
 * dropped into any host that supplies the four DOM containers below.
 *
 * Public factory: `initCurriculum(opts)` returns a controller with:
 *   • showYears()                 → render & switch to Years view
 *   • showCourses(yearId)
 *   • showCourseDetail(courseId)
 *   • openItem(itemId)
 *   • closeModal()
 *   • getCompletedIds()           → string[]
 *
 * @module curriculum
 */

import {
  YEARS, SUBJECTS, SUBJECT_FAMILIES, ITEM_TYPES, DIFFICULTIES, STATUSES,
  COURSES, ITEMS, getYear, getSubject, getCourse, getCoursesForYear,
  getItem, getItemsForCourse, COUNTS,
} from './curriculum-data.js';

// ─── Helpers ───────────────────────────────────────────────────────

/** Escape a string for safe insertion into an HTML attribute or text. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Determines the *effective* status of an item:
 *   • completed  → in `completedIds`
 *   • available  → first 3 items per course OR the next after a completed one
 *   • locked     → otherwise (encourages sequential progress)
 */
function resolveStatus(item, allItemsInCourse, completedIds) {
  if (completedIds.has(item.id)) return 'completed';
  const idx = allItemsInCourse.findIndex((i) => i.id === item.id);
  if (idx < 3) return 'available';
  // Available if the previous item is complete
  const prev = allItemsInCourse[idx - 1];
  return completedIds.has(prev.id) ? 'available' : 'locked';
}

/** Course progress percentage (0–100). */
function courseProgress(courseId, completedIds) {
  const items = getItemsForCourse(courseId);
  if (!items.length) return 0;
  const done = items.filter((i) => completedIds.has(i.id)).length;
  return Math.round((done / items.length) * 100);
}

/** Year completion summary — # courses started + completed. */
function yearProgress(yearId, completedIds) {
  const courses = getCoursesForYear(yearId);
  let started = 0, mastered = 0;
  courses.forEach((c) => {
    const pct = courseProgress(c.id, completedIds);
    if (pct > 0)   started++;
    if (pct === 100) mastered++;
  });
  return { started, mastered, total: courses.length };
}

/** Tiny event-delegation helper. */
function on(parent, eventName, selector, handler) {
  parent.addEventListener(eventName, (e) => {
    const el = e.target.closest(selector);
    if (el && parent.contains(el)) handler(e, el);
  });
}

// ═══════════════════════════════════════════════════════════════════
//  PUBLIC FACTORY
// ═══════════════════════════════════════════════════════════════════

/**
 * @param {Object} opts
 * @param {HTMLElement} opts.yearsContainer
 * @param {HTMLElement} opts.coursesContainer
 * @param {HTMLElement} opts.detailContainer
 * @param {HTMLElement} opts.modalOverlay   - empty `<div class="modal-overlay">`
 * @param {Function}    opts.switchView     - host's view-router (id => void)
 * @param {Function}   [opts.onEarnPoints]  - (amount, item) => void
 * @param {Function}   [opts.onShowToast]   - (type, title, msg) => void
 * @param {Function}   [opts.onMasterCourse]- (course) => void  -- fired when 100% done
 * @param {string[]}   [opts.completedIds]  - initial completion list (from persistence)
 * @param {Function}   [opts.onCompletedChange] - (string[]) => void  -- persistence hook
 */
export function initCurriculum(opts) {
  const {
    yearsContainer, coursesContainer, detailContainer, modalOverlay,
    switchView,
    onEarnPoints   = () => {},
    onShowToast    = () => {},
    onMasterCourse = () => {},
    onCompletedChange = () => {},
  } = opts;

  const completedIds = new Set(opts.completedIds || []);

  // ── State for the courses & detail views ────────────────────────
  let currentYearId    = null;
  let currentCourseId  = null;
  let courseFamilyFilter = 'all';
  let courseSearchQuery  = '';
  let detailTypeFilter   = 'all';
  let detailDifficulty   = 'all';
  let detailStatus       = 'all';
  let detailSearchQuery  = '';

  // ── Modal state — shared by openItem + wireExerciseAndQuiz ─────
  let modalAnsweredCorrectly = false;

  // ───────────────────────────────────────────────────────────────
  //  YEARS VIEW
  // ───────────────────────────────────────────────────────────────

  function renderYears() {
    yearsContainer.innerHTML = `
      <div class="curriculum">
        <div class="curriculum__header">
          <h2 class="curriculum__title">📘 My School Year</h2>
          <p class="curriculum__subtitle">
            Pick your grade — ${COUNTS.subjects} subjects · ${COUNTS.items.toLocaleString()} lessons
          </p>
        </div>
        <div class="curriculum__years-grid">
          ${YEARS.map((y, i) => {
            const p = yearProgress(y.id, completedIds);
            return `
              <button class="year-card" data-year-id="${y.id}"
                      style="--card-color:${y.color}; animation-delay:${i * 0.06}s;">
                <div class="year-card__bg"></div>
                <span class="year-card__emoji">${y.emoji}</span>
                <span class="year-card__label">${y.label}</span>
                <span class="year-card__age">Ages ${y.ageRange}</span>
                <div class="year-card__stats">
                  <span>📚 ${p.total} courses</span>
                  ${p.mastered ? `<span>🏆 ${p.mastered} mastered</span>` : ''}
                  ${p.started && !p.mastered ? `<span>⚡ ${p.started} in progress</span>` : ''}
                </div>
              </button>`;
          }).join('')}
        </div>
      </div>`;
  }

  on(yearsContainer, 'click', '.year-card', (_e, el) => {
    showCourses(el.dataset.yearId);
  });

  // ───────────────────────────────────────────────────────────────
  //  COURSES VIEW
  // ───────────────────────────────────────────────────────────────

  function renderCoursesShell() {
    if (!currentYearId) return;
    const year = getYear(currentYearId);
    coursesContainer.innerHTML = `
      <div class="curriculum">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <button class="breadcrumb__crumb" data-nav="years">📘 Years</button>
          <span class="breadcrumb__sep">›</span>
          <span class="breadcrumb__current">${esc(year.label)}</span>
        </nav>

        <div class="curriculum__header">
          <h2 class="curriculum__title">
            <span style="color:${year.color};">${year.emoji}</span>
            ${esc(year.label)} Courses
          </h2>
          <p class="curriculum__subtitle">Pick a subject to start learning · ages ${year.ageRange}</p>
        </div>

        <div class="curriculum__search">
          <span class="curriculum__search-icon">🔎</span>
          <input class="curriculum__search-input" id="courses-search-input"
                 type="search" placeholder="Search courses…"
                 value="${esc(courseSearchQuery)}" autocomplete="off">
        </div>

        <div class="curriculum__filters" id="courses-family-filters">
          ${SUBJECT_FAMILIES.map((f) => `
            <button class="curriculum__pill ${f.id === courseFamilyFilter ? 'curriculum__pill--active' : ''}"
                    data-family="${f.id}">
              <span>${f.emoji}</span><span>${f.label}</span>
            </button>`).join('')}
        </div>

        <div class="curriculum__courses-grid" id="courses-grid"></div>
        <p class="curriculum__empty" id="courses-empty" hidden>
          No courses match your search. Try a different keyword 🔍
        </p>
      </div>`;
    renderCoursesGrid();

    // Wire interactions
    coursesContainer.querySelector('#courses-search-input').addEventListener('input', (e) => {
      courseSearchQuery = e.target.value.trim().toLowerCase();
      renderCoursesGrid();
    });
  }

  function renderCoursesGrid() {
    const grid  = coursesContainer.querySelector('#courses-grid');
    const empty = coursesContainer.querySelector('#courses-empty');
    if (!grid) return;

    const courses = getCoursesForYear(currentYearId).filter((c) => {
      const subj = getSubject(c.subjectId);
      const matchFamily = courseFamilyFilter === 'all' || subj.family === courseFamilyFilter;
      const q = courseSearchQuery;
      const matchSearch = !q ||
        subj.name.toLowerCase().includes(q) ||
        subj.description.toLowerCase().includes(q);
      return matchFamily && matchSearch;
    });

    if (empty) empty.hidden = courses.length > 0;

    grid.innerHTML = courses.map((c, i) => {
      const subj = getSubject(c.subjectId);
      const pct  = courseProgress(c.id, completedIds);
      return `
        <button class="course-card" data-course-id="${c.id}"
                style="--card-color:${subj.color}; animation-delay:${i * 0.04}s;">
          <div class="course-card__header">
            <span class="course-card__emoji">${subj.emoji}</span>
            ${pct === 100 ? '<span class="course-card__badge">🏆 Mastered</span>' : ''}
          </div>
          <h3 class="course-card__name">${esc(subj.name)}</h3>
          <p class="course-card__desc">${esc(subj.description)}</p>
          <div class="course-card__footer">
            <div class="course-card__progress-bar">
              <div class="course-card__progress-fill" style="width:${pct}%"></div>
            </div>
            <span class="course-card__progress-label">${pct}% · ${c.lessonCount} lessons</span>
          </div>
        </button>`;
    }).join('');
  }

  on(coursesContainer, 'click', '[data-nav="years"]', () => showYears());
  on(coursesContainer, 'click', '.curriculum__pill[data-family]', (_e, el) => {
    courseFamilyFilter = el.dataset.family;
    renderCoursesShell();
  });
  on(coursesContainer, 'click', '.course-card', (_e, el) => {
    showCourseDetail(el.dataset.courseId);
  });

  // ───────────────────────────────────────────────────────────────
  //  COURSE DETAIL VIEW
  // ───────────────────────────────────────────────────────────────

  function renderCourseDetail() {
    if (!currentCourseId) return;
    const course = getCourse(currentCourseId);
    const subj   = getSubject(course.subjectId);
    const year   = getYear(course.yearId);
    const pct    = courseProgress(course.id, completedIds);
    const items  = getItemsForCourse(course.id);

    detailContainer.innerHTML = `
      <div class="curriculum">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <button class="breadcrumb__crumb" data-nav="years">📘 Years</button>
          <span class="breadcrumb__sep">›</span>
          <button class="breadcrumb__crumb" data-nav="courses">${esc(year.label)}</button>
          <span class="breadcrumb__sep">›</span>
          <span class="breadcrumb__current">${esc(subj.name)}</span>
        </nav>

        <div class="course-banner" style="--card-color:${subj.color};">
          <div class="course-banner__bg"></div>
          <div class="course-banner__main">
            <span class="course-banner__emoji">${subj.emoji}</span>
            <div class="course-banner__info">
              <h2 class="course-banner__title">${esc(subj.name)}</h2>
              <p class="course-banner__meta">${esc(year.label)} · Ages ${year.ageRange}</p>
              <p class="course-banner__desc">${esc(subj.description)}</p>
            </div>
          </div>
          <div class="course-banner__progress" aria-label="Course progress">
            <svg class="progress-ring" viewBox="0 0 60 60" width="60" height="60">
              <circle cx="30" cy="30" r="26" stroke="rgba(255,255,255,0.2)" stroke-width="6" fill="none"/>
              <circle cx="30" cy="30" r="26" stroke="${subj.color}" stroke-width="6" fill="none"
                      stroke-linecap="round" stroke-dasharray="${(pct / 100 * 163.36).toFixed(1)} 163.36"
                      transform="rotate(-90 30 30)"/>
            </svg>
            <span class="course-banner__pct">${pct}%</span>
          </div>
        </div>

        <div class="curriculum__search">
          <span class="curriculum__search-icon">🔎</span>
          <input class="curriculum__search-input" id="detail-search-input"
                 type="search" placeholder="Search lessons…"
                 value="${esc(detailSearchQuery)}" autocomplete="off">
        </div>

        <div class="curriculum__filters curriculum__filters--types" id="detail-type-filters">
          <button class="curriculum__pill ${detailTypeFilter === 'all' ? 'curriculum__pill--active' : ''}"
                  data-type="all">
            <span>✨</span><span>All</span>
          </button>
          ${ITEM_TYPES.map((t) => `
            <button class="curriculum__pill ${detailTypeFilter === t.id ? 'curriculum__pill--active' : ''}"
                    data-type="${t.id}" style="--pill-color:${t.color};">
              <span>${t.emoji}</span><span>${t.label}</span>
            </button>`).join('')}
        </div>

        <div class="curriculum__filters curriculum__filters--meta">
          <label class="curriculum__filter-group">
            <span class="curriculum__filter-label">Difficulty</span>
            <select class="curriculum__select" id="detail-difficulty">
              ${DIFFICULTIES.map((d) =>
                `<option value="${d.id}" ${d.id === detailDifficulty ? 'selected' : ''}>${d.label}</option>`).join('')}
            </select>
          </label>
          <label class="curriculum__filter-group">
            <span class="curriculum__filter-label">Status</span>
            <select class="curriculum__select" id="detail-status">
              ${STATUSES.map((s) =>
                `<option value="${s.id}" ${s.id === detailStatus ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="item-list" id="item-list"></div>
        <p class="curriculum__empty" id="items-empty" hidden>
          No lessons match these filters 🔍
        </p>
      </div>`;
    renderItemList(items);

    // Wire input handlers
    detailContainer.querySelector('#detail-search-input').addEventListener('input', (e) => {
      detailSearchQuery = e.target.value.trim().toLowerCase();
      renderItemList(items);
    });
    detailContainer.querySelector('#detail-difficulty').addEventListener('change', (e) => {
      detailDifficulty = e.target.value;
      renderItemList(items);
    });
    detailContainer.querySelector('#detail-status').addEventListener('change', (e) => {
      detailStatus = e.target.value;
      renderItemList(items);
    });
  }

  function renderItemList(items) {
    const list  = detailContainer.querySelector('#item-list');
    const empty = detailContainer.querySelector('#items-empty');
    if (!list) return;

    const filtered = items.filter((it) => {
      const status = resolveStatus(it, items, completedIds);
      const matchType   = detailTypeFilter === 'all'   || it.type === detailTypeFilter;
      const matchDiff   = detailDifficulty === 'all'   || it.difficulty === detailDifficulty;
      const matchStatus = detailStatus === 'all'       || status === detailStatus;
      const q = detailSearchQuery;
      const matchSearch = !q ||
        it.title.toLowerCase().includes(q) ||
        it.summary.toLowerCase().includes(q);
      return matchType && matchDiff && matchStatus && matchSearch;
    });

    if (empty) empty.hidden = filtered.length > 0;

    list.innerHTML = filtered.map((it, i) => {
      const status = resolveStatus(it, items, completedIds);
      const typeMeta = ITEM_TYPES.find((t) => t.id === it.type);
      const isLocked = status === 'locked';
      return `
        <button class="item-row item-row--${status}" data-item-id="${it.id}"
                ${isLocked ? 'disabled aria-disabled="true"' : ''}
                style="--type-color:${typeMeta.color}; animation-delay:${i * 0.03}s;">
          <span class="item-row__type-badge" style="background:${typeMeta.color}30;color:${typeMeta.color};">
            ${typeMeta.emoji} ${typeMeta.singular}
          </span>
          <div class="item-row__main">
            <span class="item-row__title">${esc(it.title)}</span>
            <span class="item-row__meta">
              ${capitalize(it.difficulty)} · ${esc(it.duration)}
            </span>
          </div>
          <span class="item-row__status">
            ${status === 'completed' ? '✅'
              : status === 'locked'  ? '🔒'
              : '▶'}
          </span>
        </button>`;
    }).join('');
  }

  on(detailContainer, 'click', '[data-nav="years"]',   () => showYears());
  on(detailContainer, 'click', '[data-nav="courses"]', () => showCourses(getCourse(currentCourseId).yearId));
  on(detailContainer, 'click', '.curriculum__pill[data-type]', (_e, el) => {
    detailTypeFilter = el.dataset.type;
    renderCourseDetail();
  });
  on(detailContainer, 'click', '.item-row', (_e, el) => {
    if (el.disabled) return;
    openItem(el.dataset.itemId);
  });

  // ───────────────────────────────────────────────────────────────
  //  CONTENT MODAL — type-specific renderers
  // ───────────────────────────────────────────────────────────────

  function openItem(itemId) {
    const item   = getItem(itemId);
    if (!item) return;
    const course = getCourse(item.courseId);
    const subj   = getSubject(course.subjectId);
    const typeMeta = ITEM_TYPES.find((t) => t.id === item.type);

    // Reset shared in-modal flags for this item
    modalAnsweredCorrectly = false;

    const renderTypeBody = () => {
      switch (item.type) {
        case 'scenario': return renderScenarioBody(item.content);
        case 'topic':    return renderTopicBody(item.content);
        case 'exercise': return renderExerciseBody(item.content);
        case 'quiz':     return renderQuizBody(item.content);
        case 'video':    return renderVideoBody(item.content);
        case 'project':  return renderProjectBody(item.content);
        default:         return '<p>Content unavailable.</p>';
      }
    };

    modalOverlay.innerHTML = `
      <div class="content-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
        <header class="content-modal__header">
          <span class="content-modal__type-badge" style="background:${typeMeta.color}30;color:${typeMeta.color};">
            ${typeMeta.emoji} ${typeMeta.singular}
          </span>
          <button class="content-modal__close" aria-label="Close">✕</button>
        </header>
        <h2 class="content-modal__title" id="modal-heading">${esc(item.title)}</h2>
        <p class="content-modal__meta">
          ${esc(subj.name)} · ${esc(course.title.split('·')[1].trim())} · ${esc(item.duration)} · ${capitalize(item.difficulty)}
        </p>
        <div class="content-modal__body" id="modal-body">${renderTypeBody()}</div>
        <footer class="content-modal__footer">
          <button class="btn btn--ghost" id="modal-cancel">Close</button>
          <button class="btn btn--primary" id="modal-complete">
            ${completedIds.has(item.id) ? '✅ Already completed' : 'Mark Complete'}
          </button>
        </footer>
      </div>`;
    showModal();

    // Close handlers
    modalOverlay.querySelector('.content-modal__close').addEventListener('click', closeModal);
    modalOverlay.querySelector('#modal-cancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', escClose, { once: true });

    // Wire type-specific interactions
    wireExerciseAndQuiz(item);

    // Mark Complete handler
    modalOverlay.querySelector('#modal-complete').addEventListener('click', () => {
      if (completedIds.has(item.id)) {
        closeModal();
        return;
      }
      // For exercise/quiz, require correct answers
      if ((item.type === 'exercise' || item.type === 'quiz') && !modalAnsweredCorrectly) {
        onShowToast('warning', 'Almost there!', 'Answer the questions correctly to mark this complete.');
        return;
      }
      markComplete(item);
      closeModal();
    });
  }

  function escClose(e) { if (e.key === 'Escape') closeModal(); }

  function wireExerciseAndQuiz(item) {
    if (item.type === 'exercise') {
      const checkBtn = modalOverlay.querySelector('#exercise-check');
      const result   = modalOverlay.querySelector('#exercise-result');
      if (!checkBtn) return;
      checkBtn.addEventListener('click', () => {
        const inputs = modalOverlay.querySelectorAll('.exercise__input');
        let correct = 0;
        item.content.questions.forEach((q, i) => {
          const got = (inputs[i].value || '').trim().toLowerCase();
          const ok  = got === q.answer.toLowerCase();
          inputs[i].classList.toggle('exercise__input--ok', ok);
          inputs[i].classList.toggle('exercise__input--bad', !ok && got.length > 0);
          if (ok) correct++;
        });
        const total = item.content.questions.length;
        const allRight = correct === total;
        result.textContent = allRight
          ? `🎉 Perfect — ${correct}/${total} correct!`
          : `${correct}/${total} correct. Try again or hit Mark Complete when ready.`;
        result.classList.toggle('exercise__result--success', allRight);
        // Quiz/exercise pass = require allRight to mark complete
        modalAnsweredCorrectly = allRight;
      });
    }
    if (item.type === 'quiz') {
      const checkBtn = modalOverlay.querySelector('#quiz-check');
      const result   = modalOverlay.querySelector('#quiz-result');
      if (!checkBtn) return;
      checkBtn.addEventListener('click', () => {
        let correct = 0;
        item.content.questions.forEach((q, qi) => {
          const radios = modalOverlay.querySelectorAll(`input[name="quiz-q-${qi}"]`);
          const sel = [...radios].findIndex((r) => r.checked);
          const ok = sel === q.answer;
          radios.forEach((r, ri) => {
            r.parentElement.classList.toggle('quiz__option--ok',  ri === q.answer);
            r.parentElement.classList.toggle('quiz__option--bad', ri === sel && !ok);
          });
          if (ok) correct++;
        });
        const total = item.content.questions.length;
        const allRight = correct === total;
        result.textContent = allRight
          ? `🎉 Perfect — ${correct}/${total} correct!`
          : `${correct}/${total} correct. Review answers above.`;
        result.classList.toggle('exercise__result--success', allRight);
        modalAnsweredCorrectly = allRight;
      });
    }
  }

  function markComplete(item) {
    completedIds.add(item.id);
    onCompletedChange([...completedIds]);

    const points = item.type === 'project' ? 60
                 : item.type === 'quiz'    ? 40
                 : item.type === 'exercise'? 30
                 : 20;
    onEarnPoints(points, item);
    onShowToast('success', `+${points} Points! ⭐`, `Completed: ${item.title}`);

    // Re-render detail to refresh row status & progress ring
    if (currentCourseId === item.courseId) renderCourseDetail();

    // Course mastery check
    const allItems = getItemsForCourse(item.courseId);
    const allDone  = allItems.every((it) => completedIds.has(it.id));
    if (allDone) {
      const course = getCourse(item.courseId);
      onMasterCourse(course);
      onShowToast('success', `🏆 Course Mastered!`, `${getSubject(course.subjectId).name} · ${getYear(course.yearId).label}`);
    }
  }

  // ─── Type-specific body renderers ──────────────────────────────

  function renderScenarioBody(content) {
    return `
      <div class="scenario">
        ${content.panels.map((p, i) => `
          <figure class="scenario__panel"
                  style="background:linear-gradient(135deg, ${p.bg[0]}, ${p.bg[1]});">
            <span class="scenario__panel-num">${i + 1}</span>
            <span class="scenario__panel-emoji">${p.emoji}</span>
            <div class="scenario__bubble">${esc(p.narration)}</div>
            <figcaption class="scenario__caption">${esc(p.caption)}</figcaption>
          </figure>`).join('')}
      </div>`;
  }

  function renderTopicBody(content) {
    return `
      <div class="topic">
        ${content.sections.map((s) => `
          <section class="topic__section">
            <h3 class="topic__heading">${esc(s.heading)}</h3>
            <p class="topic__body">${esc(s.body)}</p>
          </section>`).join('')}
      </div>`;
  }

  function renderExerciseBody(content) {
    return `
      <div class="exercise">
        <p class="exercise__intro">${esc(content.intro)}</p>
        <ol class="exercise__list">
          ${content.questions.map((q, i) => `
            <li class="exercise__q">
              <label class="exercise__label" for="ex-${i}">${esc(q.q)}</label>
              <input class="exercise__input" id="ex-${i}" type="text" autocomplete="off">
            </li>`).join('')}
        </ol>
        <div class="exercise__controls">
          <button class="btn btn--accent" id="exercise-check">Check Answers</button>
        </div>
        <p class="exercise__result" id="exercise-result"></p>
      </div>`;
  }

  function renderQuizBody(content) {
    return `
      <div class="exercise">
        <p class="exercise__intro">${esc(content.intro)}</p>
        ${content.questions.map((q, qi) => `
          <fieldset class="quiz__q">
            <legend class="exercise__label">${qi + 1}. ${esc(q.q)}</legend>
            ${q.options.map((opt, oi) => `
              <label class="quiz__option">
                <input type="radio" name="quiz-q-${qi}" value="${oi}">
                <span>${esc(opt)}</span>
              </label>`).join('')}
          </fieldset>`).join('')}
        <div class="exercise__controls">
          <button class="btn btn--accent" id="quiz-check">Check Answers</button>
        </div>
        <p class="exercise__result" id="quiz-result"></p>
      </div>`;
  }

  function renderVideoBody(content) {
    return `
      <div class="video">
        <div class="video__player"
             style="background:linear-gradient(135deg, ${content.bg[0]}, ${content.bg[1]});">
          <span class="video__play">▶</span>
          <span class="video__duration">${esc(content.duration)}</span>
        </div>
        <p class="video__desc">${esc(content.description)}</p>
      </div>`;
  }

  function renderProjectBody(content) {
    return `
      <div class="project">
        <p class="project__brief">${esc(content.brief)}</p>
        <h4 class="project__heading">Steps</h4>
        <ol class="project__steps">
          ${content.steps.map((s, i) => `
            <li class="project__step">
              <input type="checkbox" id="step-${i}" class="project__check">
              <label for="step-${i}">${esc(s)}</label>
            </li>`).join('')}
        </ol>
      </div>`;
  }

  // ─── Modal lifecycle ───────────────────────────────────────────

  function showModal() {
    modalOverlay.hidden = false;
    void modalOverlay.offsetHeight;
    modalOverlay.classList.add('modal-overlay--visible');
  }

  function closeModal() {
    modalOverlay.classList.remove('modal-overlay--visible');
    setTimeout(() => {
      modalOverlay.hidden = true;
      modalOverlay.innerHTML = '';
    }, 250);
    document.removeEventListener('keydown', escClose);
  }

  // ───────────────────────────────────────────────────────────────
  //  PUBLIC NAVIGATION HELPERS
  // ───────────────────────────────────────────────────────────────

  function showYears() {
    renderYears();
    switchView('years');
  }

  function showCourses(yearId) {
    currentYearId = yearId;
    courseSearchQuery = '';
    courseFamilyFilter = 'all';
    renderCoursesShell();
    switchView('courses');
  }

  function showCourseDetail(courseId) {
    currentCourseId = courseId;
    detailTypeFilter = 'all';
    detailDifficulty = 'all';
    detailStatus = 'all';
    detailSearchQuery = '';
    renderCourseDetail();
    switchView('course-detail');
  }

  // ───────────────────────────────────────────────────────────────
  //  CONTROLLER
  // ───────────────────────────────────────────────────────────────

  return {
    showYears,
    showCourses,
    showCourseDetail,
    openItem,
    closeModal,
    getCompletedIds: () => [...completedIds],
    /** Hydrate the completion set from external state (e.g. on settings reload). */
    hydrateCompletion(ids) {
      completedIds.clear();
      (ids || []).forEach((id) => completedIds.add(id));
    },
  };
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
