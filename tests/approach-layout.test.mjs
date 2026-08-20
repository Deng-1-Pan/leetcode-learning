import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('approach players use source badges and fixed semantic callout styles', async () => {
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
  assert.match(page, /debug:\s*'单步调试'/);
  assert.match(spec, /`debug`/);
  assert.match(spec, /`sourceApproachId`/);
  assert.match(spec, /`variable-watch`/);
  assert.match(spec, /`locals`/);
  assert.match(spec, /`depth`/);
  assert.match(spec, /`event`/);
});
