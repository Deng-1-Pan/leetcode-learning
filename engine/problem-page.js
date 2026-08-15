import { TracePlayer } from './player-core.js';
import { loadVisualizer } from './viz-registry.js';

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

export function markdownToHtml(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const output = [];
  let paragraph = [];
  let listTag = null;
  let codeLines = null;
  const flushParagraph = () => { if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`); paragraph = []; };
  const flushList = () => { if (listTag) output.push(`</${listTag}>`); listTag = null; };
  const flushCode = () => { if (codeLines) output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`); codeLines = null; };
  for (const line of lines) {
    if (line.startsWith('```')) { if (codeLines) flushCode(); else { flushParagraph(); flushList(); codeLines = []; } continue; }
    if (codeLines) { codeLines.push(line); continue; }
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

function renderCodeTabs(container, code = {}) {
  const entries = Object.entries(code);
  if (!entries.length) return;
  const tabs = document.createElement('div'); tabs.className = 'language-tabs';
  const panels = document.createElement('div');
  entries.forEach(([language, source], index) => {
    const button = document.createElement('button'); button.className = `button secondary${index ? '' : ' active'}`; button.textContent = language;
    const panel = document.createElement('pre'); panel.className = 'code-panel'; panel.hidden = index !== 0;
    const block = document.createElement('code'); block.className = `language-${language.toLowerCase()}`; block.textContent = source; panel.append(block);
    button.addEventListener('click', () => { [...panels.children].forEach((item, panelIndex) => { item.hidden = panelIndex !== index; }); [...tabs.children].forEach((item, tabIndex) => item.classList.toggle('active', tabIndex === index)); });
    tabs.append(button); panels.append(panel);
  });
  container.append(tabs, panels);
  window.Prism?.highlightAllUnder(container);
}

function wireControls(root, player) {
  const previous = root.querySelector('[data-action="previous"]'); const next = root.querySelector('[data-action="next"]'); const reset = root.querySelector('[data-action="reset"]'); const play = root.querySelector('[data-action="play"]'); const slider = root.querySelector('[data-step-slider]');
  const update = () => { const last = player.trace.frames.length - 1; previous.disabled = player.currentStep === 0; next.disabled = player.currentStep === last; slider.value = player.currentStep; play.textContent = player.isPlaying ? '暂停' : '播放'; };
  previous.addEventListener('click', () => player.prev()); next.addEventListener('click', () => player.next()); reset.addEventListener('click', () => player.reset()); play.addEventListener('click', () => player.isPlaying ? player.pause() : player.play()); slider.addEventListener('input', () => player.goToStep(slider.value));
  player.addEventListener('step-change', (event) => { root.querySelector('[data-step]').textContent = String(event.detail.step); root.querySelector('[data-description]').textContent = event.detail.frame.description ?? ''; root.querySelector('[data-note]').textContent = event.detail.frame.note ?? ''; update(); });
  player.addEventListener('play-state-change', update); update();
}

export async function mountProblemPage(problemId) {
  const root = document.querySelector('[data-problem-root]');
  if (!root) return;
  try {
    const base = './';
    const [meta, trace, explain] = await Promise.all([loadJson(`${base}meta.json`), loadJson(`${base}trace.json`), loadText(`${base}explain.md`)]);
    if (meta.id !== problemId || trace.problemId !== problemId) throw new Error('Problem id does not match the page package.');
    const player = new TracePlayer(trace);
    root.innerHTML = `<section class="problem-header"><a href="../../index.html">← 题目列表</a><p class="eyebrow">${escapeHtml(meta.vizType)}</p><h1>${escapeHtml(meta.title)}</h1><div class="metadata"><span class="difficulty-${escapeHtml(meta.difficulty)}">${escapeHtml(meta.difficulty)}</span>${meta.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div></section><section class="player panel"><div class="player-status"><span class="step-number">#<span data-step>0</span></span><div><p class="frame-description" data-description>${escapeHtml(player.frame.description ?? '')}</p><p class="frame-note" data-note>${escapeHtml(player.frame.note ?? '')}</p></div></div><div data-visualization></div><div class="player-controls"><button class="button secondary" data-action="previous">上一步</button><button class="button" data-action="next">下一步</button><button class="button secondary" data-action="reset">重置</button><button class="button secondary" data-action="play">播放</button><input data-step-slider type="range" min="0" max="${trace.frames.length - 1}" value="0" aria-label="跳转到步骤"></div></section><article class="content"><div data-explanation></div><div data-code></div></article>`;
    const mountVisualizer = await loadVisualizer(meta.vizType);
    mountVisualizer(root.querySelector('[data-visualization]'), player);
    root.querySelector('[data-explanation]').innerHTML = markdownToHtml(explain);
    renderCodeTabs(root.querySelector('[data-code]'), meta.code);
    wireControls(root, player);
  } catch (error) { root.innerHTML = `<section class="error-panel"><strong>题目加载失败。</strong><br>${escapeHtml(error.message)}</section>`; }
}
