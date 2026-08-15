import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('array visualization reserves horizontal space for edge pointer outlines', async () => {
  const css = await readFile(new URL('../styles/problem-page.css', import.meta.url), 'utf8');

  assert.match(css, /\.array-row\s*\{[^}]*padding:\s*1\.5rem\s+var\(--space-2\)\s+0;/s);
});
