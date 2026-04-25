# Fikr — Educational Social Network Prototype

A high-fidelity, production-ready prototype built with **zero dependencies** — strictly Vanilla HTML5, CSS3, and ES6+ JavaScript with ES Modules.

## Architecture Overview

```mermaid
graph LR
  A["index.html"] --> B["css/main.css"]
  A --> C["css/components/*"]
  A --> D["js/app.js"]
  D --> E["js/modules/state.js"]
  D --> F["js/modules/video-engine.js"]
  D --> G["js/modules/safety.js"]
  F --> G
```

## File Structure (10 Files)

| File | Purpose |
|------|---------|
| [index.html](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/index.html) | Semantic HTML5 entry point with all views |
| [css/main.css](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/css/main.css) | Design tokens, reset, layout, buttons, animations |
| [css/components/sidebar.css](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/css/components/sidebar.css) | Fixed sidebar navigation |
| [css/components/card.css](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/css/components/card.css) | Bento Grid cards + Creative Clubs view |
| [css/components/feed.css](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/css/components/feed.css) | Scroll-snap video feed |
| [css/components/modal.css](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/css/components/modal.css) | Parental Gate modal |
| [js/app.js](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/js/app.js) | Main orchestrator (FikrApp class) |
| [js/modules/state.js](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/js/modules/state.js) | Proxy-based reactive store |
| [js/modules/video-engine.js](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/js/modules/video-engine.js) | IntersectionObserver video engine |
| [js/modules/safety.js](file:///c:/Users/mystery/Downloads/FreePoo/Fickr/js/modules/safety.js) | Parental Gate + ContentSanitizer |

## Features Implemented

### 1. Bento Grid Dashboard
The default view uses `CSS Grid` with varying column/row spans for a playful, modern layout with glassmorphism cards. Includes Welcome, Profile, Learning Points, Streak, Stats, Stream Preview, Clubs Preview, and Achievements widgets.

### 2. Learning Stream (Video Feed)
- **CSS `scroll-snap-type: y mandatory`** for TikTok-style vertical snapping
- **`IntersectionObserver`** auto-activates videos at 70% viewport threshold
- Animated gradient backgrounds with floating shapes simulate video content
- **"Remix This"** button captures video metadata (id, title, creator, category, duration, timestamp)
- Slide-up **comments panel** with HTML-sanitized content

### 3. Creative Club Hub
- 12 clubs rendered dynamically from a JS data object
- **7 category filter pills** (All, Coding, Art, Science, Theater, Music, Reading)
- Filter system toggles clubs via JS without page refresh
- Join button awards +50 Learning Points reactively

### 4. Safety Layer & Parental Gate
- **Math challenge modal** with randomized multiplication/addition problems
- Promise-based API — `await gate.open()` returns `true/false`
- Auto-regenerates new problem after wrong answer
- **`sanitizeContent()`** uses `DOMParser` to strip all HTML tags from user comments

### 5. Reactive State Management (Proxy API)
- `createStore()` wraps state in a `Proxy` that intercepts `set` operations
- `subscribe(property, callback)` for property-level reactive binding
- Learning Points, username, level, streak, avatar, and badges all update reactively
- Points counter animates with a pop effect on change

### 6. Visual Identity — "The Creative Lab"
- **Palette**: Primary `#6D28D9`, Accent `#F59E0B`, Background `#0F172A`
- **Typography**: Lexend (neuro-inclusive)
- **Border radius**: 24px+ on cards
- **Micro-interactions**: hover scales, glow effects, waving hand, floating shapes, shimmer progress bars, bounce-in achievements, toast slide-ins

## Verification

All features tested in-browser:

````carousel
![Dashboard with Bento Grid layout, Welcome card, Learning Points, Streak, previews, and achievements](C:\Users\mystery\.gemini\antigravity\brain\c2c13611-4f2d-4b12-bf8f-23d9ce6a5a2f\dashboard_view_1776607438054.png)
<!-- slide -->
![Reactive points update with toast notification after clicking Earn Points](C:\Users\mystery\.gemini\antigravity\brain\c2c13611-4f2d-4b12-bf8f-23d9ce6a5a2f\points_updated_toast_1776607505174.png)
<!-- slide -->
![Learning Stream with scroll-snapping video feed and engagement buttons](C:\Users\mystery\.gemini\antigravity\brain\c2c13611-4f2d-4b12-bf8f-23d9ce6a5a2f\learning_stream_view_1776607480322.png)
<!-- slide -->
![Creative Clubs filtered by Coding category showing 3 matching clubs](C:\Users\mystery\.gemini\antigravity\brain\c2c13611-4f2d-4b12-bf8f-23d9ce6a5a2f\clubs_coding_filter_1776607534414.png)
<!-- slide -->
![Parental Gate modal with randomized math problem 7 × 3 = ?](C:\Users\mystery\.gemini\antigravity\brain\c2c13611-4f2d-4b12-bf8f-23d9ce6a5a2f\parental_gate_modal_1776607546529.png)
````

![Full interaction recording of all views and features](C:\Users\mystery\.gemini\antigravity\brain\c2c13611-4f2d-4b12-bf8f-23d9ce6a5a2f\fikr_full_verification_1776607421296.webp)

> [!NOTE]
> The app runs with zero dependencies — just open `index.html` via any local server (e.g. `npx serve .`) to serve ES Modules correctly. Currently running at `http://localhost:3000`.
