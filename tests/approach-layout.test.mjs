import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('approach players use source badges, a two-column player layout, and fixed semantic callout styles', async () => {
  const [css, page, spec] = await Promise.all([
    readFile(new URL('../styles/problem-page.css', import.meta.url), 'utf8'),
    readFile(new URL('../engine/problem-page.js', import.meta.url), 'utf8'),
    readFile(new URL('../docs/ENGINE-SPEC.md', import.meta.url), 'utf8'),
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
  assert.match(css, /\.player-columns\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/s);
  assert.match(css, /\.player-visualization,\s*\.player-code\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.player-columns\s*\{[^}]*grid-template-columns:\s*1fr/s);
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
