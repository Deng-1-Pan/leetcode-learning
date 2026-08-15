# LeetCode Visualizer Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-build static LeetCode explanation site with a reusable trace player and a verified Two Sum demo.

**Architecture:** Each problem directory contains only data and content. `problem-page.js` loads that data, creates a `TracePlayer`, then resolves a renderer through the registry. Renderers receive frames and never calculate algorithm state. The landing page consumes the generated `problems-index.json`.

**Tech Stack:** HTML, CSS, native ES modules, Node.js built-in `node:test`, Python standard library, GitHub Pages Actions.

---

## File structure

- `engine/player-core.js` — evented, DOM-independent trace playback state machine.
- `engine/components/*.js` — visual-mode renderers; array pointers and DP grid are operational in Phase 1.
- `engine/viz-registry.js` / `engine/problem-page.js` / `engine/list-page.js` — data loading and page assembly.
- `styles/*.css` — semantic design tokens and page styles.
- `problems/*` — portable problem content packages; no per-problem application code.
- `tests/*.test.mjs` — Node-level behavior tests for player and generated index.
- `scripts/build-index.mjs` — dependency-free index generator.

### Task 1: Initialize static shell and data contracts

**Files:** Create root page, stylesheet files, README, ENGINE-SPEC, template content package.

- [ ] Write the contracts before their consumers: `trace.json` has `problemId`, `algorithm`, `input`, and non-empty ordered `frames`; `meta.json` has `id`, `title`, `difficulty`, `tags`, `vizType`, `leetcodeUrl`, and `languages`.
- [ ] Build semantic CSS tokens and responsive base/list/problem layouts using one blue accent and accessible contrast.
- [ ] Document Markdown support: headings, paragraphs, unordered/ordered lists, inline code, fenced code blocks; raw HTML is escaped.

### Task 2: Player core (TDD)

**Files:** Create `tests/player-core.test.mjs`, `engine/player-core.js`.

- [ ] Write a failing test asserting `new TracePlayer(trace).next()` changes `currentStep`, emits a `step-change` event with the matching frame, and clamps at the final frame.
- [ ] Run `node --test tests/player-core.test.mjs`; expect `ERR_MODULE_NOT_FOUND` before implementation.
- [ ] Implement `TracePlayer` extending `EventTarget`, with `next`, `prev`, `goToStep`, `play`, `pause`, `reset`, `isPlaying`, and immutable trace access.
- [ ] Add tests for previous-boundary clamping, out-of-range jumps, reset, and timer-driven playback stopping at the final frame.
- [ ] Run `node --test tests/player-core.test.mjs`; expect all tests to pass.

### Task 3: Registry and reusable renderers

**Files:** Create `engine/viz-registry.js`, `engine/components/viz-array-pointers.js`, `engine/components/viz-dp-grid.js`, and documented placeholder modules for the remaining three modes.

- [ ] Register lazy factories keyed by `array-pointers` and `dp-grid`; error clearly for an unknown type.
- [ ] Render array values, pointer labels, highlights, window bounds, and notes from a supplied frame only.
- [ ] Render 1D/2D DP cells, active cells, and dependencies from supplied frame only.
- [ ] Make mount functions subscribe to `step-change` and return a cleanup function; they must never access player private fields.

### Task 4: Page assembly and navigation (TDD where behavior is pure)

**Files:** Create `engine/problem-page.js`, `engine/list-page.js`, `index.html`, `problems/*/index.html`, `tests/build-index.test.mjs`.

- [ ] Implement URL-relative resource loading with descriptive error panels.
- [ ] Add player controls for previous, next, reset, play/pause and a range input, reflecting state at first/last frames.
- [ ] Convert the defined safe Markdown subset to HTML, render metadata and language tabs, and apply Prism-compatible class names.
- [ ] Render problem cards with a combined title/tag/difficulty search and independent difficulty/tag filters.

### Task 5: Index generator and demo package (TDD)

**Files:** Create `scripts/build-index.mjs`, `problems/demo-two-sum/*`, `problems-index.json`, `.github/workflows/deploy.yml`.

- [ ] Write a failing Node test which creates temporary problem packages, runs the index script, and asserts `_template` is excluded and results are title-sorted.
- [ ] Implement Node standard-library scanning and atomic JSON generation; malformed metadata must fail the script with the path in its error.
- [ ] Run `node --test tests/build-index.test.mjs` and `node scripts/build-index.mjs`.
- [ ] Implement `generate_trace.py` to execute sorted Two Sum against `[2,7,11,15]`, target `9`, emitting each snapshot rather than literal hand-written frames.
- [ ] Generate `trace.json` from that program, add Markdown explanation plus Python/C++ code, and run the index generator again.
- [ ] Add GitHub Pages workflow using official configure/upload/deploy actions after the index generation step.

### Task 6: Non-visual verification

**Files:** All created files.

- [ ] Run `node --test`; all test suites must pass.
- [ ] Run `python3 problems/demo-two-sum/generate_trace.py --check` to verify committed trace equals generated output.
- [ ] Validate JSON with Node parsing and use `node --check` on every JavaScript module.
- [ ] Inspect generated index and static asset paths without starting a web server or browser.
