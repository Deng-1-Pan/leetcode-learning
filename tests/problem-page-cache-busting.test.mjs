import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pages = [
  '../problems/_template/index.html',
  '../problems/demo-two-sum/index.html',
  '../problems/demo-climbing-stairs/index.html',
];

test('problem pages version the shared layout stylesheet', async () => {
  for (const page of pages) {
    const html = await readFile(new URL(page, import.meta.url), 'utf8');
    assert.match(html, /href="\.\.\/\.\.\/styles\/problem-page\.css\?v=[a-z0-9]+"/);
  }
});
