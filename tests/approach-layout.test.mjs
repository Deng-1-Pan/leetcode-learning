import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('approach players use proportional flex columns that wrap without a media-query breakpoint', async () => {
  const [css, page, spec, template, lc80, lc122, lc300] = await Promise.all([
    readFile(new URL('../styles/problem-page.css', import.meta.url), 'utf8'),
    readFile(new URL('../engine/problem-page.js', import.meta.url), 'utf8'),
    readFile(new URL('../docs/ENGINE-SPEC.md', import.meta.url), 'utf8'),
    readFile(new URL('../problems/_template/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../problems/lc-80-remove-duplicates-sorted-array-ii/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../problems/lc-122-best-time-to-buy-and-sell-stock-ii/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../problems/lc-300-longest-increasing-subsequence/index.html', import.meta.url), 'utf8'),
  ]);

  assert.match(css, /\.approach-heading\s*\{/);
  assert.match(css, /\.source-badge\s*\{/);
  assert.match(css, /\.source-official\s*\{/);
  assert.match(css, /\.source-community\s*\{/);
  assert.match(css, /\.source-debug\s*\{/);
  assert.match(css, /\.variable-watch\s*\{/);
  assert.match(css, /\.variable-array-cell\s*\{/);
  assert.match(css, /\.callout-insight\s*\{/);
  assert.match(css, /\.callout-pitfall\s*\{/);
  assert.match(css, /\.content\s*\{[^}]*max-width:\s*1000px/s);
  assert.match(css, /\.content\s*>\s*p,[\s\S]*\.content\s*>\s*\.callout\s*\{[^}]*max-width:\s*780px/s);
  assert.match(css, /\.player-columns\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/s);
  assert.match(css, /\.player-visualization\s*\{[^}]*flex:\s*1\s+1\s+280px[^}]*min-width:\s*0/s);
  assert.match(css, /\.player-code\s*\{[^}]*flex:\s*1\.6\s+1\s+645px[^}]*min-width:\s*0/s);
  assert.doesNotMatch(css, /\.player-columns\s*\{[^}]*grid-template-columns/s);
  assert.doesNotMatch(css, /@media\s*\([^)]*\)\s*\{[^}]*\.player-columns\s*\{[^}]*grid-template-columns/s);
  assert.doesNotMatch(css, /\.player-visualization,\s*\.player-code\s*\{/s);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:\s*auto[^}]*white-space:\s*pre-wrap[^}]*overflow-wrap:\s*anywhere/s);
  for (const index of [template, lc80, lc122, lc300]) {
    assert.match(index, /problem-page\.css\?v=player-columns-flex-wrap/);
    assert.match(index, /problem-page\.js\?v=player-columns-flex-wrap/);
  }
  assert.match(page, /debug:\s*'单步调试'/);
  assert.match(page, /<div class="player-columns">[\s\S]*<div class="player-visualization" data-visualization><\/div>[\s\S]*<div class="player-code"><\/div>[\s\S]*<\/div>/);
  assert.match(page, /renderCodeTabs\(section\.querySelector\('\.player-code'\), approach\.code\)/);
  assert.match(spec, /`debug`/);
  assert.match(spec, /`sourceApproachId`/);
  assert.match(spec, /`variable-watch`/);
  assert.match(spec, /`locals`/);
  assert.match(spec, /`depth`/);
  assert.match(spec, /`event`/);
});
