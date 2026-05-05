/**
 * curriculum-data.js — Curriculum Data Source
 *
 * Self-contained dataset for the Fikr curriculum module:
 *   • YEARS      — 6 primary-school years (1st…6th)
 *   • SUBJECTS   — 9 subjects (Math, Science, History, Geography,
 *                  Arabic, French, English, Art, Music)
 *   • COURSES    — Cartesian product of YEARS × SUBJECTS (54 courses)
 *   • ITEMS      — ~10 items per course (≈540 total) of 6 types:
 *                  scenario · topic · exercise · quiz · video · project
 *
 * Data is generated programmatically from compact TEMPLATES so the
 * file stays small. To plug in real content, replace any of the
 * exported constants — the rest of the module only depends on the
 * shapes documented in JSDoc below.
 *
 * @module curriculum-data
 */

// ─── Type Definitions (JSDoc) ──────────────────────────────────────

/**
 * @typedef {Object} Year
 * @property {string} id          - Unique identifier (e.g. 'y3')
 * @property {string} label       - Display label (e.g. '3rd Year')
 * @property {string} ordinal     - Short ordinal (e.g. '3rd')
 * @property {string} ageRange    - Age range string (e.g. '8–9')
 * @property {string} emoji       - Decorative emoji
 * @property {string} color       - HEX accent colour
 *
 * @typedef {Object} Subject
 * @property {string} id          - Unique identifier (e.g. 'math')
 * @property {string} name        - Display name (e.g. 'Math')
 * @property {string} family      - Subject family ('sciences'|'languages'|'arts'|'humanities')
 * @property {string} emoji       - Decorative emoji
 * @property {string} color       - HEX accent colour
 * @property {string} description - Short tagline
 *
 * @typedef {Object} Course
 * @property {string} id          - `${subjectId}-${yearId}` (e.g. 'math-y3')
 * @property {string} yearId
 * @property {string} subjectId
 * @property {string} title       - Combined display title (e.g. 'Math · 3rd Year')
 * @property {number} lessonCount
 * @property {string} masterBadge - Emoji awarded on full completion
 *
 * @typedef {('scenario'|'topic'|'exercise'|'quiz'|'video'|'project')} ItemType
 * @typedef {('easy'|'medium'|'hard')} Difficulty
 * @typedef {('locked'|'available'|'completed')} Status
 *
 * @typedef {Object} Item
 * @property {string}     id
 * @property {string}     courseId
 * @property {ItemType}   type
 * @property {string}     title
 * @property {string}     summary
 * @property {string}     duration   - Display string (e.g. '5 min')
 * @property {Difficulty} difficulty
 * @property {Status}     status
 * @property {Object}     content    - Type-specific content payload
 */

// ─── 1. YEARS ──────────────────────────────────────────────────────

/** @type {Year[]} */
export const YEARS = [
  { id: 'y1', label: '1st Year', ordinal: '1st', ageRange: '6–7',  emoji: '1️⃣', color: '#F472B6' },
  { id: 'y2', label: '2nd Year', ordinal: '2nd', ageRange: '7–8',  emoji: '2️⃣', color: '#FB923C' },
  { id: 'y3', label: '3rd Year', ordinal: '3rd', ageRange: '8–9',  emoji: '3️⃣', color: '#FBBF24' },
  { id: 'y4', label: '4th Year', ordinal: '4th', ageRange: '9–10', emoji: '4️⃣', color: '#34D399' },
  { id: 'y5', label: '5th Year', ordinal: '5th', ageRange: '10–11',emoji: '5️⃣', color: '#60A5FA' },
  { id: 'y6', label: '6th Year', ordinal: '6th', ageRange: '11–12',emoji: '6️⃣', color: '#A78BFA' },
];

// ─── 2. SUBJECTS ───────────────────────────────────────────────────

/** @type {Subject[]} */
export const SUBJECTS = [
  { id: 'math',      name: 'Math',      family: 'sciences',   emoji: '🔢', color: '#6366F1', description: 'Numbers, shapes, and logical thinking' },
  { id: 'science',   name: 'Science',   family: 'sciences',   emoji: '🔬', color: '#10B981', description: 'Discover how the world works' },
  { id: 'history',   name: 'History',   family: 'humanities', emoji: '🏺', color: '#D97706', description: 'Stories from the past that shaped today' },
  { id: 'geography', name: 'Geography', family: 'humanities', emoji: '🌍', color: '#0EA5E9', description: 'Lands, oceans, and the people who live there' },
  { id: 'arabic',    name: 'Arabic',    family: 'languages',  emoji: '📜', color: '#059669', description: 'العربية — Read, write, and speak Arabic' },
  { id: 'french',    name: 'French',    family: 'languages',  emoji: '🥖', color: '#3B82F6', description: 'Bonjour ! Le monde francophone vous attend' },
  { id: 'english',   name: 'English',   family: 'languages',  emoji: '🔤', color: '#EF4444', description: 'Hello! A bridge to the global stage' },
  { id: 'art',       name: 'Art',       family: 'arts',       emoji: '🎨', color: '#EC4899', description: 'Express yourself through colour and form' },
  { id: 'music',     name: 'Music',     family: 'arts',       emoji: '🎵', color: '#A855F7', description: 'Rhythm, melody, and the joy of sound' },
];

/** Subject-family filter labels (for the courses view). */
export const SUBJECT_FAMILIES = [
  { id: 'all',        label: 'All Subjects', emoji: '✨' },
  { id: 'sciences',   label: 'Sciences',     emoji: '🧪' },
  { id: 'languages',  label: 'Languages',    emoji: '🗣️' },
  { id: 'humanities', label: 'Humanities',   emoji: '🏛️' },
  { id: 'arts',       label: 'Creative Arts',emoji: '🎭' },
];

// ─── 3. ITEM TYPE & FILTER METADATA ────────────────────────────────

export const ITEM_TYPES = [
  { id: 'scenario', label: 'Scenarios', singular: 'Scenario', emoji: '📖', color: '#A855F7' },
  { id: 'topic',    label: 'Topics',    singular: 'Topic',    emoji: '📚', color: '#3B82F6' },
  { id: 'exercise', label: 'Exercises', singular: 'Exercise', emoji: '✏️', color: '#F59E0B' },
  { id: 'quiz',     label: 'Quizzes',   singular: 'Quiz',     emoji: '❓', color: '#EC4899' },
  { id: 'video',    label: 'Videos',    singular: 'Video',    emoji: '🎬', color: '#EF4444' },
  { id: 'project',  label: 'Projects',  singular: 'Project',  emoji: '🛠️', color: '#10B981' },
];

export const DIFFICULTIES = [
  { id: 'all',    label: 'All Levels' },
  { id: 'easy',   label: 'Easy 🌱' },
  { id: 'medium', label: 'Medium ⚡' },
  { id: 'hard',   label: 'Hard 🔥' },
];

export const STATUSES = [
  { id: 'all',       label: 'Any Status' },
  { id: 'available', label: 'Available' },
  { id: 'completed', label: 'Completed' },
  { id: 'locked',    label: 'Locked' },
];

// ─── 4. CONTENT TEMPLATES ──────────────────────────────────────────
// Compact source-of-truth for realistic-feeling course content.
// Each subject has a pool of "chapter" titles per year — items
// derive their titles from these, keyed by year.

const CHAPTER_POOLS = {
  math: {
    y1: ['Counting to 20', 'Adding Small Numbers', 'Shapes Around Us', 'Bigger or Smaller', 'Money Basics'],
    y2: ['Adding to 100', 'Subtraction Stories', 'Telling Time', 'Even and Odd', 'Simple Patterns'],
    y3: ['Multiplication Tables', 'Fractions in Pizza', 'Measuring Length', 'Symmetry', 'Word Problems'],
    y4: ['Long Division', 'Decimals & Money', 'Perimeter & Area', 'Roman Numerals', 'Data & Graphs'],
    y5: ['Multiplying Fractions', 'Volume of Boxes', 'Negative Numbers', 'Equations', 'Probability'],
    y6: ['Algebra Basics', 'Geometry Proofs', 'Ratios & Percents', 'Statistics', 'Pre-Algebra Puzzles'],
  },
  science: {
    y1: ['Living vs Non-Living', 'Five Senses', 'Day and Night', 'Hot and Cold', 'Plant Parts'],
    y2: ['Animal Habitats', 'States of Matter', 'Weather Watchers', 'Healthy Foods', 'Magnets'],
    y3: ['Life Cycles', 'Solar System Tour', 'Sound Waves', 'Simple Machines', 'Rocks & Minerals'],
    y4: ['Ecosystems', 'Electricity Basics', 'Water Cycle', 'Forces & Motion', 'Human Body'],
    y5: ['Cells & Microscopes', 'Earth Layers', 'Energy Forms', 'Adaptations', 'Chemical Reactions'],
    y6: ['DNA & Heredity', 'Periodic Table', 'Climate Change', 'Newton\'s Laws', 'Biotechnology'],
  },
  history: {
    y1: ['My Family Tree', 'Long Ago', 'Famous Heroes', 'Old Tools', 'Holidays Around the World'],
    y2: ['Ancient Egypt Kids', 'First Cave Paintings', 'Vikings', 'Native Americans', 'The Wheel'],
    y3: ['Ancient Greece', 'Roman Builders', 'Silk Road Tales', 'Knights & Castles', 'Pyramids'],
    y4: ['Age of Exploration', 'Industrial Revolution', 'World Wars Overview', 'Civil Rights', 'Space Race'],
    y5: ['Renaissance', 'Empires of Africa', 'Maya & Inca', 'Enlightenment', 'Modern Inventions'],
    y6: ['World History Timeline', 'Causes of WWI', 'Cold War', 'Decolonisation', 'Digital Era'],
  },
  geography: {
    y1: ['My Neighbourhood', 'Continents Song', 'Land vs Water', 'Maps for Kids', 'Weather Where I Live'],
    y2: ['Mountains & Valleys', 'Rivers & Lakes', 'Compass Rose', 'Country Flags', 'Capital Cities'],
    y3: ['Africa Tour', 'Europe Tour', 'Climate Zones', 'Volcanoes', 'Reading Maps'],
    y4: ['Asia Tour', 'Americas Tour', 'Population Density', 'Natural Resources', 'Tourist Wonders'],
    y5: ['Tectonic Plates', 'Biomes of the World', 'GPS & Cartography', 'Migration', 'Globalisation'],
    y6: ['Geopolitics', 'Sustainable Cities', 'Oceans of the World', 'Demographics', 'Cartography Pro'],
  },
  arabic: {
    y1: ['Letters Aleph–Jeem', 'Vowel Marks', 'Family Words', 'Colours', 'Counting 1–10'],
    y2: ['Letters Daal–Saad', 'Days of the Week', 'Animals', 'Greetings', 'Simple Sentences'],
    y3: ['Full Alphabet', 'Singular & Plural', 'My School', 'Foods & Drinks', 'Short Stories'],
    y4: ['Verb Roots', 'Past & Present', 'Adjectives', 'Folk Tales', 'Letter Writing'],
    y5: ['Grammar Cases', 'Poetry Basics', 'News Articles', 'Idioms', 'Calligraphy'],
    y6: ['Classical Texts', 'Essay Writing', 'Debate Skills', 'Modern Literature', 'Public Speaking'],
  },
  french: {
    y1: ['Bonjour & Salut', 'Couleurs', 'Famille', 'Animaux', 'Chiffres 1–10'],
    y2: ['Jours & Mois', 'Vêtements', 'À l\'école', 'Aliments', 'Phrases Simples'],
    y3: ['Verbes en -ER', 'Mon corps', 'En ville', 'Saisons', 'Petits Contes'],
    y4: ['Passé Composé', 'Récits courts', 'Géographie de la France', 'Cuisine française', 'Lettres formelles'],
    y5: ['Subjonctif', 'Articles classiques', 'Cinéma français', 'Régionalismes', 'Rédaction'],
    y6: ['Grammaire avancée', 'Littérature', 'Débats', 'Francophonie', 'Examens DELF'],
  },
  english: {
    y1: ['ABC Song', 'Hello & Goodbye', 'Family Members', 'Colours & Shapes', 'Numbers 1–10'],
    y2: ['Days & Months', 'Clothes & Weather', 'Classroom Words', 'Food I Like', 'Short Sentences'],
    y3: ['Present Simple', 'Storytime', 'Animals & Habitats', 'My Hobbies', 'Reading Comics'],
    y4: ['Past Tense', 'Adventure Stories', 'World Cities', 'Letter Writing', 'Listening Skills'],
    y5: ['Future Tenses', 'Classic Children\'s Books', 'Public Speaking', 'Idioms', 'Creative Writing'],
    y6: ['Essay Structure', 'Shakespeare for Kids', 'Debate Club', 'Global English', 'Cambridge Prep'],
  },
  art: {
    y1: ['Primary Colours', 'Drawing Lines', 'Cut & Paste', 'Finger Painting', 'Stick Figures'],
    y2: ['Mixing Colours', 'Drawing Animals', 'Origami', 'Stamps & Prints', 'Self-Portraits'],
    y3: ['Watercolours', 'Perspective Basics', 'Sculpture in Clay', 'Illustration', 'Famous Painters'],
    y4: ['Acrylic Painting', 'Comic Strips', 'Mosaic Tiles', 'Mask Making', 'Renaissance Art'],
    y5: ['Digital Drawing', 'Photography 101', 'Mixed Media', 'Murals', 'Modern Art Movements'],
    y6: ['Animation Basics', '3D Modelling', 'Portfolio Building', 'Curating Exhibits', 'Art Critique'],
  },
  music: {
    y1: ['Loud & Soft', 'Fast & Slow', 'Singing Songs', 'Body Percussion', 'Music Family Tree'],
    y2: ['Instrument Sounds', 'Rhythms & Beats', 'Folk Songs', 'Solfège (Do-Re-Mi)', 'Chorus Basics'],
    y3: ['Reading Notes', 'Recorder', 'World Rhythms', 'Concert Etiquette', 'Composers'],
    y4: ['Major & Minor', 'Group Performance', 'Famous Symphonies', 'Music History', 'Songwriting'],
    y5: ['Chord Progressions', 'Improvisation', 'Genre Tour', 'Recording Basics', 'Music Theory'],
    y6: ['Composition', 'Conducting', 'Music Production', 'Concert Management', 'Sound Engineering'],
  },
};

// ─── 5. CONTENT FACTORIES (rich modal payloads) ────────────────────

/** Standard rotation of types we generate per course. */
const ITEM_TYPE_ROTATION = [
  'scenario', 'topic', 'exercise',
  'topic',    'video', 'exercise',
  'quiz',     'topic', 'project',
  'scenario',
];

const DIFFICULTY_ROTATION = ['easy', 'easy', 'medium', 'medium', 'hard', 'medium', 'medium', 'easy', 'hard', 'hard'];
const DURATION_ROTATION   = ['3 min', '6 min', '8 min', '5 min', '4 min', '10 min', '7 min', '5 min', '20 min', '4 min'];

/**
 * Builds a comic-style scenario payload from a chapter title.
 * Each scenario has 4 panels with bg gradient, character, narration.
 */
function buildScenario(title, subject) {
  return {
    panels: [
      { bg: ['#a78bfa','#f472b6'], emoji: '🤔', narration: `Meet our hero! Today they'll explore: ${title}.`, caption: 'A new adventure begins…' },
      { bg: ['#60a5fa','#34d399'], emoji: subject.emoji, narration: `"What if I learn ${subject.name.toLowerCase()} this way?"`, caption: 'A surprising discovery 👀' },
      { bg: ['#fbbf24','#fb923c'], emoji: '💡', narration: 'Idea sparks! They try a hands-on approach.', caption: 'Learning by doing.' },
      { bg: ['#10b981','#3b82f6'], emoji: '🏆', narration: 'Mission complete — knowledge unlocked!', caption: 'The end (for now).' },
    ],
  };
}

/** Topic explainer payload. */
function buildTopic(title, subject) {
  return {
    sections: [
      { heading: `What is ${title}?`,
        body: `In this lesson we explore ${title.toLowerCase()} — a key idea in ${subject.name.toLowerCase()}. Watch out for the highlighted boxes for the most important takeaways.` },
      { heading: 'Key Idea',
        body: `${subject.name} helps us understand the world. ${title} gives you a new tool to think with. We'll see examples, then try a small activity together.` },
      { heading: 'Try This',
        body: `Pause for a moment and think: where could you spot ${title.toLowerCase()} in real life? Discuss with a friend or family member, then move on to the related exercise.` },
    ],
  };
}

/** 3-step short-answer exercise payload. */
function buildExercise(title, subject) {
  // Subject-aware question stubs — generic but valid.
  const banks = {
    math:    [['What is 6 + 7?','13'], ['What is 4 × 9?','36'], ['Half of 30 is?','15']],
    science: [['Plants need ___ to make food (5 letters)','light'], ['Water freezes at __°C','0'], ['How many planets in our solar system?','8']],
    history: [['Pyramids are in ___','Egypt'], ['Romans built long ___','roads'], ['Vikings sailed in ___','longships']],
    geography:[['Largest ocean?','Pacific'], ['Continent with the Sahara?','Africa'], ['Capital of France?','Paris']],
    arabic:  [['Say "hello" in Arabic (English letters)','salam'], ['How many letters in the Arabic alphabet?','28'], ['The first letter is?','aleph']],
    french:  [['Translate "thank you" to French','merci'], ['Translate "hello"','bonjour'], ['Number 5 in French','cinq']],
    english: [['Past tense of "go"','went'], ['Plural of "child"','children'], ['Opposite of "happy"','sad']],
    art:     [['Mix red + yellow =','orange'], ['Mix blue + yellow =','green'], ['Primary colours? (3, comma-separated)','red,yellow,blue']],
    music:   [['How many notes in solfège (do-re-mi)?','7'], ['"Forte" means?','loud'], ['A guitar usually has __ strings','6']],
  };
  const pool = banks[subject.id] || banks.math;
  return {
    intro: `Solve ${pool.length} short questions about ${title}. Type your answer (case doesn't matter).`,
    questions: pool.map(([q, a]) => ({ q, answer: String(a).toLowerCase() })),
  };
}

/** 3-question multiple-choice quiz payload. */
function buildQuiz(title, subject) {
  return {
    intro: `Test what you know about ${title} (${subject.name}). Pick the best option.`,
    questions: [
      { q: `Which best describes "${title}"?`,
        options: ['A musical genre', 'A core idea in ' + subject.name, 'A type of food', 'A planet'], answer: 1 },
      { q: `Why study ${title.toLowerCase()}?`,
        options: ['To pass time', 'To grow your skills', 'It\'s required by aliens', 'No reason'], answer: 1 },
      { q: `Where might you USE ${title.toLowerCase()}?`,
        options: ['Only on Mars', 'Daily life and school', 'Never', 'In dreams only'], answer: 1 },
    ],
  };
}

/** Mock video payload (placeholder — no real video). */
function buildVideo(title, subject) {
  return {
    duration: '3:45',
    description: `A short ${subject.name.toLowerCase()} video about ${title}. Watch the animated explainer and pause anytime.`,
    bg: [subject.color, '#1E293B'],
  };
}

/** Project brief payload — checklist of steps. */
function buildProject(title, subject) {
  return {
    brief: `Create a small ${subject.name} project on the theme of "${title}". Work alone or with a friend!`,
    steps: [
      'Plan: write down 3 ideas, pick the best one.',
      'Build: gather materials and try a first version.',
      'Refine: ask a friend or family member for feedback.',
      'Share: present to the class or post to your Fikr profile.',
    ],
  };
}

const CONTENT_FACTORIES = {
  scenario: buildScenario,
  topic:    buildTopic,
  exercise: buildExercise,
  quiz:     buildQuiz,
  video:    buildVideo,
  project:  buildProject,
};

// ─── 6. COURSES & ITEMS GENERATION ─────────────────────────────────

/**
 * Stable hash → small int (so the dataset is deterministic across reloads).
 */
function stableInt(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

/** @type {Course[]} */
export const COURSES = [];
/** @type {Item[]} */
export const ITEMS = [];

YEARS.forEach((year) => {
  SUBJECTS.forEach((subject) => {
    const courseId = `${subject.id}-${year.id}`;
    const chapters = (CHAPTER_POOLS[subject.id] && CHAPTER_POOLS[subject.id][year.id]) || [];

    COURSES.push({
      id: courseId,
      yearId: year.id,
      subjectId: subject.id,
      title: `${subject.name} · ${year.label}`,
      lessonCount: ITEM_TYPE_ROTATION.length,
      masterBadge: subject.emoji,
    });

    // 10 items per course (rotation keeps a balanced type mix).
    ITEM_TYPE_ROTATION.forEach((type, idx) => {
      const chapter = chapters[idx % Math.max(chapters.length, 1)] || `${subject.name} ${idx + 1}`;
      const builder = CONTENT_FACTORIES[type];
      const itemId  = `${courseId}-${idx + 1}`;

      ITEMS.push({
        id: itemId,
        courseId,
        type,
        title: chapter,
        summary: `${ITEM_TYPES.find((t) => t.id === type).singular} · ${subject.name}`,
        duration: DURATION_ROTATION[idx],
        difficulty: DIFFICULTY_ROTATION[idx],
        // First 3 items of every course start unlocked; rest stay 'locked' until earlier ones are completed.
        // Locked logic is enforced at runtime by the curriculum module (see resolveStatus).
        status: 'available',
        content: builder(chapter, subject),
      });
    });
  });
});

// ─── 7. PUBLIC HELPERS ─────────────────────────────────────────────

export function getYear(id) {
  return YEARS.find((y) => y.id === id) || null;
}

export function getSubject(id) {
  return SUBJECTS.find((s) => s.id === id) || null;
}

export function getCourse(id) {
  return COURSES.find((c) => c.id === id) || null;
}

export function getCoursesForYear(yearId) {
  return COURSES.filter((c) => c.yearId === yearId);
}

export function getItem(id) {
  return ITEMS.find((i) => i.id === id) || null;
}

export function getItemsForCourse(courseId) {
  return ITEMS.filter((i) => i.courseId === courseId);
}

/** Total counts — convenient for dashboard tile / docs. */
export const COUNTS = {
  years:    YEARS.length,
  subjects: SUBJECTS.length,
  courses:  COURSES.length,
  items:    ITEMS.length,
};
