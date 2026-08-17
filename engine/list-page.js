const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

export function visualizationSummary(problem) {
  return Array.isArray(problem.approaches) ? `${problem.approaches.length} 种解法` : problem.vizType;
}

function optionList(values, label) { return `<option value="">全部${label}</option>${[...values].sort().map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`; }

export function bindFilterEvents({ search, difficulty, tag }, render) {
  search.addEventListener('input', render);
  difficulty.addEventListener('change', render);
  tag.addEventListener('change', render);
}

export async function mountListPage() {
  const root = document.querySelector('[data-list-root]'); if (!root) return;
  try {
    const response = await fetch('./problems-index.json'); if (!response.ok) throw new Error(`Could not load problem index (${response.status}).`);
    const problems = await response.json(); const tags = new Set(problems.flatMap((problem) => problem.tags)); const difficulties = new Set(problems.map((problem) => problem.difficulty));
    root.innerHTML = `<section class="list-hero"><div><p class="eyebrow">算法学习笔记</p><h1>逐步看懂每一次算法决策。</h1><p>静态轨迹驱动的 LeetCode 可视化讲解。</p></div></section><section class="filters" aria-label="题目筛选"><input data-search type="search" placeholder="搜索题目标题或标签"><select data-difficulty>${optionList(difficulties, '难度')}</select><select data-tag>${optionList(tags, '标签')}</select></section><section class="problem-grid" data-results></section>`;
    const search = root.querySelector('[data-search]'); const difficulty = root.querySelector('[data-difficulty]'); const tag = root.querySelector('[data-tag]'); const results = root.querySelector('[data-results]');
    const render = () => { const query = search.value.trim().toLocaleLowerCase(); const filtered = problems.filter((problem) => (!query || `${problem.title} ${problem.tags.join(' ')}`.toLocaleLowerCase().includes(query)) && (!difficulty.value || problem.difficulty === difficulty.value) && (!tag.value || problem.tags.includes(tag.value))); results.innerHTML = filtered.length ? filtered.map((problem) => `<a class="problem-card panel" href="problems/${encodeURIComponent(problem.id)}/index.html"><p class="eyebrow">${escapeHtml(visualizationSummary(problem))}</p><h2>${escapeHtml(problem.title)}</h2><p class="difficulty-${escapeHtml(problem.difficulty)}">${escapeHtml(problem.difficulty)}</p><div class="card-meta">${problem.tags.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div></a>`).join('') : '<div class="empty-state panel">没有符合条件的题目。</div>'; };
    bindFilterEvents({ search, difficulty, tag }, render); render();
  } catch (error) { root.innerHTML = `<section class="error-panel"><strong>题目索引加载失败。</strong><br>${escapeHtml(error.message)}</section>`; }
}
