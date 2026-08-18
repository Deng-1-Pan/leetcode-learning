import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('problem pages load a local Prism runtime and highlight inserted code blocks', async () => {
  const page = await readFile(new URL('../problems/lc-80-remove-duplicates-sorted-array-ii/index.html', import.meta.url), 'utf8');
  const assembly = await readFile(new URL('../engine/problem-page.js', import.meta.url), 'utf8');

  assert.match(page, /<script src="\.\.\/\.\.\/engine\/prism\.js"><\/script><script src="\.\.\/\.\.\/engine\/prism-python\.js"><\/script><script src="\.\.\/\.\.\/engine\/prism-c\.js"><\/script><script src="\.\.\/\.\.\/engine\/prism-cpp\.js"><\/script>/);
  assert.doesNotMatch(page, /cdn\.jsdelivr\.net/);
  assert.match(assembly, /window\.Prism\?\.highlightAllUnder\(container\)/);
  await access(new URL('../engine/prism.js', import.meta.url));
  await access(new URL('../engine/prism-python.js', import.meta.url));
  await access(new URL('../engine/prism-c.js', import.meta.url));
  await access(new URL('../engine/prism-cpp.js', import.meta.url));
});
