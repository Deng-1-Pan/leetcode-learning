# Multi-Approach Learning Pages (Phase 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support screenshot-driven, multi-approach LeetCode pages with independent in-place visual players and safe semantic callouts.

**Architecture:** Preserve the current single-trace package as v1 compatibility. Add v2 `approaches` metadata where every approach owns its trace and code; render a player only where a validated `:::viz` directive occurs in `explain.md`. Extend the existing safe Markdown parser with allowlisted `viz`, `insight`, and `pitfall` blocks; all unknown directives remain escaped code blocks.

**Tech Stack:** Static HTML, browser-native ES modules, Node test runner, Python trace generators, local static-server browser tests.

---

### Task 1: Specify v2 packages and index validation

**Files:**
- Modify: `docs/ENGINE-SPEC.md`
- Modify: `scripts/build-index.mjs`
- Modify: `tests/build-index.test.mjs`

- [ ] **Step 1: Write failing v2 index test**

Add a `metaV2` fixture without top-level `vizType`/`languages` and assert the index accepts it while preserving `approaches`:

```js
const metaV2 = JSON.stringify({
  id: 'multi', title: 'Multi Approach', difficulty: 'medium', tags: ['动态规划'],
  leetcodeUrl: 'https://example.test',
  approaches: [{ id: 'official-dp', label: '官方解法：动态规划', sourceType: 'official', vizType: 'dp-grid', languages: ['python', 'cpp'], code: { python: 'pass', cpp: '//' } },
]);
```

- [ ] **Step 2: Run the test and observe rejection caused by missing v1 fields**

Run: `node --test tests/build-index.test.mjs`

- [ ] **Step 3: Validate the two schemas explicitly**

Keep `id/title/difficulty/tags/leetcodeUrl` shared. Accept v1 only when `vizType` and `languages` are present; otherwise require a non-empty `approaches` array with unique `id`, valid `sourceType`, `vizType`, `languages`, and `code` for every approach.

- [ ] **Step 4: Document exact v2 metadata, trace and directory contracts**

Document `trace.approachId`, per-approach generator/trace paths, v1 compatibility, and `_qc-checklist.md` as a non-rendered artifact.

- [ ] **Step 5: Re-run index tests**

Run: `node --test tests/build-index.test.mjs`

### Task 2: Parse safe inline visual and callout directives

**Files:**
- Modify: `engine/problem-page.js`
- Create: `tests/markdown-directives.test.mjs`

- [ ] **Step 1: Write failing rendering tests**

Test `markdownToHtml` for a validated visual mount placeholder, `.callout-insight`, `.callout-pitfall`, and escaped output for `:::unknown`.

- [ ] **Step 2: Run the directive tests and observe the current parser treat directives as paragraphs**

Run: `node --test tests/markdown-directives.test.mjs`

- [ ] **Step 3: Implement an allowlisted block parser**

Recognize only complete `:::viz approach="<id>" ... :::`, `:::insight ... :::`, and `:::pitfall ... :::` blocks. Use `escapeHtml` for attributes/body, render visual placeholders without executing Markdown-supplied HTML, and serialize unknown directives as escaped `<pre><code>` blocks.

- [ ] **Step 4: Re-run directive tests**

Run: `node --test tests/markdown-directives.test.mjs`

### Task 3: Mount independent approach players in place

**Files:**
- Modify: `engine/problem-page.js`
- Modify: `styles/problem-page.css`
- Create: `tests/multi-approach-page.test.mjs`

- [ ] **Step 1: Write failing source-level and behavior tests**

Assert v2 loading uses `approaches/<id>/trace.json`, validates each `approachId`, creates one `TracePlayer` per validated approach, and mounts only the player wrapper associated with each `data-approach-viz` placeholder.

- [ ] **Step 2: Run tests and observe missing multi-approach implementation**

Run: `node --test tests/multi-approach-page.test.mjs`

- [ ] **Step 3: Implement v2 mounting without changing v1 output**

Extract a reusable player-section constructor with scoped controls, source badge, approach label, visual mounting, and approach-specific code tabs. Load all approach traces concurrently, render explanation first, then mount each placeholder independently.

- [ ] **Step 4: Add restrained styles for source badges and semantic callouts**

Use fixed colors by semantic meaning; do not support arbitrary user-supplied colors.

- [ ] **Step 5: Re-run page tests**

Run: `node --test tests/multi-approach-page.test.mjs tests/markdown-directives.test.mjs`

### Task 4: Upgrade the generation Skill and provide a v2 fixture

**Files:**
- Modify: `skills/leetcode-explanation-generator/SKILL.md`
- Modify: `skills/leetcode-explanation-generator/references/teaching-rubric.md`
- Create: `problems/lc-300-longest-increasing-subsequence/` (only after screenshots are supplied)

- [ ] **Step 1: Upgrade Skill input, transcription, source, and QC rules**

Require problem/official/community screenshots, word-for-word original-problem transcription, paraphrased official reasoning, independently implemented community logic, comparison rules, `:::viz` placement, and `_qc-checklist.md`.

- [ ] **Step 2: Update rubric for screenshot fidelity and independent players**

Ensure the QC artifact confirms transcription, source distinction, visual independence, directive placement, and that `_qc-checklist.md` is not in the page.

- [ ] **Step 3: Validate Skill package**

Run: `/Users/pandeng/miniforge3/bin/python3.10 /Users/pandeng/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/leetcode-explanation-generator`

- [ ] **Step 4: Generate LC 300 only from provided screenshots**

Create exact transcription plus independent official DP and community greedy/binary-search traces and QC file; do not substitute web text for screenshots.

### Task 5: Verify compatibility and real browser behavior

**Files:**
- Modify: `tests/problem-page-cache-busting.test.mjs` if the fixture page is added
- Create: `docs/PHASE-3-COMPLETION-REPORT.md` after screenshots are supplied

- [ ] **Step 1: Run all automated tests and build the index**

Run: `node --test && node scripts/build-index.mjs`

- [ ] **Step 2: Browser-test LC 300 after its screenshots are supplied**

Check original-text fidelity against supplied images; verify both players’ buttons, sliders, reset and playback operate independently; inspect callouts and confirm QC text is not rendered.

- [ ] **Step 3: Record final screenshot-dependent acceptance**

Write a Phase 3 report with the two player results, source-selection decision, and any design concern.
