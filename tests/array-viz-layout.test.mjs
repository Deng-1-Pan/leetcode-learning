import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('array visualization keeps co-located pointer names readable at the left edge', async () => {
  const css = await readFile(new URL('../styles/problem-page.css', import.meta.url), 'utf8');

  assert.match(css, /\.array-row\s*\{[^}]*padding:\s*1\.5rem\s+2\.75rem\s+0;/s);
  assert.match(css, /\.pointer-label\s*\{[^}]*max-width:\s*none;/s);
  assert.match(css, /\.pointer-label\s*\{[^}]*transform:\s*translateX\(-50%\);/s);
});
