/**
 * safety.js — Safety Layer & Parental Gate
 *
 * Child-safety features for the Fikr platform:
 *   1. Parental Gate — A randomised math challenge modal that
 *      restricts access to sensitive areas (e.g. Settings).
 *   2. ContentSanitizer — Strips all HTML markup from user-generated
 *      content to prevent XSS and ensure safe rendering.
 *
 * @module safety
 */

// ─── Content Sanitizer ────────────────────────────────────────────

/**
 * Strips ALL HTML tags from an untrusted string, returning only
 * the visible text. Uses the browser's DOMParser to create an
 * inert document (no scripts execute, no resources load).
 *
 * @param {string} untrustedHTML - Raw HTML string to sanitize
 * @returns {string} Plain text with every tag removed
 *
 * @example
 *   sanitizeContent('<script>alert("xss")</script>Hello!')
 *   // → 'alert("xss")Hello!'
 *
 *   sanitizeContent('I <b>love</b> this <img src=x onerror=alert(1)>')
 *   // → 'I love this '
 */
export function sanitizeContent(untrustedHTML) {
  if (typeof untrustedHTML !== 'string') return '';

  // DOMParser creates a completely inert document — safe to use
  const parser = new DOMParser();
  const doc = parser.parseFromString(untrustedHTML, 'text/html');
  return doc.body.textContent || '';
}

// ─── Math Problem Generator ───────────────────────────────────────

/**
 * Generates a randomised math problem suitable for a parental gate.
 * Uses multiplication or addition with operands 2–10 so that the
 * answer is non-trivial for young children but easy for adults.
 *
 * @returns {{ question: string, answer: number }}
 */
export function generateMathProblem() {
  const operations = [
    { symbol: '×', fn: (a, b) => a * b },
    { symbol: '+', fn: (a, b) => a + b },
  ];

  const op = operations[Math.floor(Math.random() * operations.length)];
  const a = Math.floor(Math.random() * 9) + 2; // 2–10
  const b = Math.floor(Math.random() * 9) + 2; // 2–10

  return {
    question: `${a} ${op.symbol} ${b}`,
    answer: op.fn(a, b),
  };
}

// ─── Parental Gate Controller ─────────────────────────────────────

/**
 * Wires up the Parental Gate modal: opening with a fresh math
 * problem, validating the answer, and resolving/rejecting a
 * Promise so the caller can gate navigation.
 *
 * @param {Object}            els
 * @param {HTMLElement}       els.overlay   - `.modal-overlay` wrapper
 * @param {HTMLElement}       els.problem   - Element showing the equation
 * @param {HTMLInputElement}  els.input     - Number input for the answer
 * @param {HTMLElement}       els.feedback  - Feedback text element
 * @param {HTMLButtonElement} els.submitBtn - "Verify" button
 * @param {HTMLButtonElement} els.cancelBtn - "Cancel" button
 * @returns {{ open: () => Promise<boolean>, close: (passed?: boolean) => void }}
 */
export function initParentalGate(els) {
  let currentProblem = null;
  let resolveGate = null;

  /* ── Open ─────────────────────────────────────────────────── */
  function open() {
    return new Promise((resolve) => {
      resolveGate = resolve;
      currentProblem = generateMathProblem();

      // Populate UI
      els.problem.textContent = `${currentProblem.question} = ?`;
      els.input.value = '';
      els.feedback.textContent = '';
      els.feedback.className = 'modal__feedback';

      // Reveal with CSS transition
      els.overlay.hidden = false;
      void els.overlay.offsetHeight; // force reflow
      els.overlay.classList.add('modal-overlay--visible');

      // Auto-focus after transition starts
      setTimeout(() => els.input.focus(), 300);
    });
  }

  /* ── Close ────────────────────────────────────────────────── */
  function close(passed = false) {
    els.overlay.classList.remove('modal-overlay--visible');
    setTimeout(() => {
      els.overlay.hidden = true;
    }, 300);

    if (resolveGate) {
      resolveGate(passed);
      resolveGate = null;
    }
  }

  /* ── Validate ─────────────────────────────────────────────── */
  function validate() {
    const userAnswer = parseInt(els.input.value, 10);

    if (isNaN(userAnswer)) {
      els.feedback.textContent = 'Please enter a number 🔢';
      els.feedback.className = 'modal__feedback modal__feedback--error';
      return;
    }

    if (userAnswer === currentProblem.answer) {
      // Correct — grant access
      els.feedback.textContent = 'Correct! ✅ Access granted.';
      els.feedback.className = 'modal__feedback modal__feedback--success';
      setTimeout(() => close(true), 800);
    } else {
      // Wrong — show error and regenerate after a short delay
      els.feedback.textContent = 'Not quite! Try again 🤔';
      els.feedback.className = 'modal__feedback modal__feedback--error';
      els.input.value = '';
      els.input.focus();

      setTimeout(() => {
        currentProblem = generateMathProblem();
        els.problem.textContent = `${currentProblem.question} = ?`;
        els.feedback.textContent = '';
        els.feedback.className = 'modal__feedback';
      }, 1500);
    }
  }

  /* ── Event Listeners ──────────────────────────────────────── */
  els.submitBtn.addEventListener('click', validate);
  els.cancelBtn.addEventListener('click', () => close(false));

  // Enter key submits the answer
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validate();
    }
  });

  // Clicking outside the modal cancels
  els.overlay.addEventListener('click', (e) => {
    if (e.target === els.overlay) close(false);
  });

  return { open, close };
}
