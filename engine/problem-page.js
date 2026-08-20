import { TracePlayer } from './player-core.js';
import { loadVisualizer } from './viz-registry.js';

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const sourceLabels = { official: '官方解法', community: '社区高赞', debug: '单步调试' };

export function markdownToHtml(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const output = [];
  let paragraph = [];
  let listTag = null;
  let codeLines = null;
  const flushParagraph = () => { if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`); paragraph = []; };
  const flushList = () => { if (listTag) output.push(`</${listTag}>`); listTag = null; };
  const flushCode = () => { if (codeLines) output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`); codeLines = null; };
  const renderDirective = (openingIndex) => {
    const opening = lines[openingIndex];
    const closingIndex = lines.indexOf(':::', openingIndex + 1);
    if (closingIndex === -1) return null;
    const source = lines.slice(openingIndex, closingIndex + 1).join('\n');
    const content = lines.slice(openingIndex + 1, closingIndex).filter((line) => line.trim());
    const visual = opening.match(/^:::viz\s+approach="([a-z][a-z0-9-]*)"\s*$/);
    if (visual && content.length === 0) return { html: `<div data-approach-viz="${escapeHtml(visual[1])}"></div>`, closingIndex };
    const callout = opening.match(/^:::(insight|pitfall)\s*$/);
    if (callout) return { html: `<aside class="callout callout-${callout[1]}">${inlineMarkdown(content.join(' '))}</aside>`, closingIndex };
    return { html: `<pre><code>${escapeHtml(source)}</code></pre>`, closingIndex };
  };
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (line.startsWith('```')) { if (codeLines) flushCode(); else { flushParagraph(); flushList(); codeLines = []; } continue; }
    if (codeLines) { codeLines.push(line); continue; }
    if (line.startsWith(':::')) {
      const directive = renderDirective(lineIndex);
      if (directive) { flushParagraph(); flushList(); output.push(directive.html); lineIndex = directive.closingIndex; continue; }
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`); continue; }
    const unordered = line.match(/^[-*]\s+(.+)$/); const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) { flushParagraph(); const expected = unordered ? 'ul' : 'ol'; if (listTag && listTag !== expected) flushList(); if (!listTag) { listTag = expected; output.push(`<${listTag}>`); } output.push(`<li>${inlineMarkdown((unordered ?? ordered)[1])}</li>`); continue; }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph(); flushList(); flushCode();
  return output.join('\n');
}

function inlineMarkdown(value) {
  return escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
  return response.json();
}

async function loadText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
  return response.text();
}

function renderHighlightedLines(block, source, languageKey) {
  const grammar = window.Prism?.languages?.[languageKey];
  source.split('\n').forEach((lineText, index) => {
    const line = document.createElement('span');
    line.className = 'code-line';
    line.dataset.line = String(index + 1);
    line.innerHTML = grammar ? window.Prism.highlight(lineText, grammar, languageKey) : escapeHtml(lineText);
    block.append(line);
  });
}

function renderCodeTabs(container, code = {}) {
  const entries = Object.entries(code);
  if (!entries.length) return null;
  const tabs = document.createElement('div'); tabs.className = 'language-tabs';
  const panels = document.createElement('div');
  const state = { activeLanguage: entries[0]?.[0] ?? null, onLanguageChange: null };
  entries.forEach(([language, source], index) => {
    const button = document.createElement('button'); button.className = `button secondary${index ? '' : ' active'}`; button.textContent = language;
    const panel = document.createElement('pre'); panel.className = 'code-panel'; panel.hidden = index !== 0;
    const languageKey = language.toLowerCase();
    const block = document.createElement('code'); block.className = `language-${languageKey}`; renderHighlightedLines(block, source, languageKey); panel.append(block);
    button.addEventListener('click', () => {
      [...panels.children].forEach((item, panelIndex) => { item.hidden = panelIndex !== index; });
      [...tabs.children].forEach((item, tabIndex) => item.classList.toggle('active', tabIndex === index));
      state.activeLanguage = language;
      state.onLanguageChange?.();
    });
    tabs.append(button); panels.append(panel);
  });
  container.append(tabs, panels);
  return state;
}

function wireCodeLineHighlight(section, player, codeState) {
  const applyActiveLine = () => {
    section.querySelectorAll('.code-line.is-active-line').forEach((line) => line.classList.remove('is-active-line'));
    const lineNumber = player.frame.activeLine?.[codeState.activeLanguage];
    if (lineNumber == null) return;
    const panel = [...section.querySelectorAll('.code-panel')].find((item) => !item.hidden);
    panel?.querySelector(`.code-line[data-line="${lineNumber}"]`)?.classList.add('is-active-line');
  };
  codeState.onLanguageChange = applyActiveLine;
  player.addEventListener('step-change', applyActiveLine);
  applyActiveLine();
}

function wireControls(root, player) {
  const previous = root.querySelector('[data-action="previous"]'); const next = root.querySelector('[data-action="next"]'); const reset = root.querySelector('[data-action="reset"]'); const play = root.querySelector('[data-action="play"]'); const slider = root.querySelector('[data-step-slider]');
  const update = () => { const last = player.trace.frames.length - 1; previous.disabled = player.currentStep === 0; next.disabled = player.currentStep === last; slider.value = player.currentStep; play.textContent = player.isPlaying ? '暂停' : '播放'; };
  previous.addEventListener('click', () => player.prev()); next.addEventListener('click', () => player.next()); reset.addEventListener('click', () => player.reset()); play.addEventListener('click', () => player.isPlaying ? player.pause() : player.play()); slider.addEventListener('input', () => player.goToStep(slider.value));
  player.addEventListener('step-change', (event) => { root.querySelector('[data-step]').textContent = String(event.detail.step); root.querySelector('[data-description]').textContent = event.detail.frame.description ?? ''; root.querySelector('[data-note]').textContent = event.detail.frame.note ?? ''; update(); });
  player.addEventListener('play-state-change', update); update();
}

function createPlayerSection({ approach, trace, legacy = false }) {
  const player = new TracePlayer(trace);
  const section = document.createElement('section');
  section.className = `player panel${legacy ? '' : ' approach-player'}`;
  if (!legacy) {
    section.dataset.approachId = approach.id;
    section.innerHTML = `<div class="approach-heading"><span class="source-badge source-${escapeHtml(approach.sourceType)}">${escapeHtml(sourceLabels[approach.sourceType] ?? approach.sourceType)}</span><strong>${escapeHtml(approach.label)}</strong></div>`;
  }
  const playerContent = document.createElement('div');
  playerContent.innerHTML = `<div class="player-status"><span class="step-number">#<span data-step>0</span></span><div><p class="frame-description" data-description>${escapeHtml(player.frame.description ?? '')}</p><p class="frame-note" data-note>${escapeHtml(player.frame.note ?? '')}</p></div></div><div data-visualization></div><div class="player-controls"><button class="button secondary" data-action="previous">上一步</button><button class="button" data-action="next">下一步</button><button class="button secondary" data-action="reset">重置</button><button class="button secondary" data-action="play">播放</button><input data-step-slider type="range" min="0" max="${trace.frames.length - 1}" value="0" aria-label="跳转到步骤"></div>`;
  section.append(playerContent);
  const codeState = approach.code ? renderCodeTabs(section, approach.code) : null;
  wireControls(section, player);
  if (codeState) wireCodeLineHighlight(section, player, codeState);
  return { section, player };
}

async function mountPlayer(placeholder, approach, trace, legacy = false) {
  const mounted = createPlayerSection({ approach, trace, legacy });
  placeholder.replaceWith(mounted.section);
  const mountVisualizer = await loadVisualizer(approach.vizType);
  mountVisualizer(mounted.section.querySelector('[data-visualization]'), mounted.player);
}

export function validateApproachTraces(problemId, approaches, traces) {
  if (!Array.isArray(approaches) || !Array.isArray(traces) || approaches.length !== traces.length) throw new Error('Approach metadata and traces must have matching lengths.');
  const tracesById = new Map();
  for (const trace of traces) {
    if (trace?.problemId !== problemId) throw new Error('Approach trace problem id does not match the page package.');
    if (!trace.approachId || tracesById.has(trace.approachId)) throw new Error('Approach trace id does not match exactly one approach.');
    tracesById.set(trace.approachId, trace);
  }
  return approaches.map((approach) => {
    const trace = tracesById.get(approach.id);
    if (!trace) throw new Error('Approach trace id does not match approach metadata.');
    return { approach, trace };
  });
}

async function mountApproachPlayers(explanation, problemId, approaches, traces) {
  const packages = validateApproachTraces(problemId, approaches, traces);
  const placeholders = new Map();
  for (const placeholder of explanation.querySelectorAll('[data-approach-viz]')) {
    const id = placeholder.dataset.approachViz;
    if (placeholders.has(id)) throw new Error(`Duplicate visual insertion point for approach ${id}.`);
    placeholders.set(id, placeholder);
  }
  await Promise.all(packages.map(async ({ approach, trace }) => {
    const placeholder = placeholders.get(approach.id);
    if (!placeholder) throw new Error(`Missing visual insertion point for approach ${approach.id}.`);
    await mountPlayer(placeholder, approach, trace);
  }));
}

function renderHeader(root, meta, eyebrow) {
  root.innerHTML = `<section class="problem-header"><a href="../../index.html">← 题目列表</a><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(meta.title)}</h1><div class="metadata"><span class="difficulty-${escapeHtml(meta.difficulty)}">${escapeHtml(meta.difficulty)}</span>${meta.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div></section>`;
}

export async function mountProblemPage(problemId) {
  const root = document.querySelector('[data-problem-root]');
  if (!root) return;
  try {
    const base = './';
    const [meta, explain] = await Promise.all([loadJson(`${base}meta.json`), loadText(`${base}explain.md`)]);
    if (meta.id !== problemId) throw new Error('Problem id does not match the page package.');
    const explanation = document.createElement('article'); explanation.className = 'content'; explanation.innerHTML = markdownToHtml(explain);
    if (Array.isArray(meta.approaches)) {
      renderHeader(root, meta, `${meta.approaches.length} 种解法`);
      root.append(explanation);
      const traces = await Promise.all(meta.approaches.map((approach) => loadJson(`${base}approaches/${encodeURIComponent(approach.id)}/trace.json`)));
      await mountApproachPlayers(explanation, problemId, meta.approaches, traces);
      return;
    }
    const trace = await loadJson(`${base}trace.json`);
    if (trace.problemId !== problemId) throw new Error('Problem id does not match the page package.');
    renderHeader(root, meta, meta.vizType);
    const legacyPlayer = document.createElement('section'); root.append(legacyPlayer);
    await mountPlayer(legacyPlayer, meta, trace, true);
    root.append(explanation);
  } catch (error) { root.innerHTML = `<section class="error-panel"><strong>题目加载失败。</strong><br>${escapeHtml(error.message)}</section>`; }
}
