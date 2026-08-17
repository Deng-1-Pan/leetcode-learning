import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('approach players use source badges and fixed semantic callout styles', async () => {
  const css = await readFile(new URL('../styles/problem-page.css', import.meta.url), 'utf8');

  assert.match(css, /\.approach-heading\s*\{/);
  assert.match(css, /\.source-badge\s*\{/);
  assert.match(css, /\.source-official\s*\{/);
  assert.match(css, /\.source-community\s*\{/);
  assert.match(css, /\.callout-insight\s*\{/);
  assert.match(css, /\.callout-pitfall\s*\{/);
});
