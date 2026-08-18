import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const removeDuplicatesDirectory = new URL('../problems/lc-80-remove-duplicates-sorted-array-ii/', import.meta.url);
const stockDirectory = new URL('../problems/lc-122-best-time-to-buy-and-sell-stock-ii/', import.meta.url);

for (const [name, directory, expectedId] of [
  ['LC 80', removeDuplicatesDirectory, 'lc-80-remove-duplicates-sorted-array-ii'],
  ['LC 122', stockDirectory, 'lc-122-best-time-to-buy-and-sell-stock-ii'],
]) {
  test(`${name} commits a generated array-pointer trace`, async () => {
    const generated = spawnSync('python3', ['generate_trace.py', '--check'], {
      cwd: fileURLToPath(directory),
      encoding: 'utf8',
    });
    assert.equal(generated.status, 0, generated.stderr || generated.stdout || String(generated.error));

    const meta = JSON.parse(await readFile(new URL('meta.json', directory), 'utf8'));
    const trace = JSON.parse(await readFile(new URL('trace.json', directory), 'utf8'));
    assert.equal(meta.id, expectedId);
    assert.equal(meta.vizType, 'array-pointers');
    assert.equal(trace.problemId, expectedId);
    assert.ok(trace.frames.length > 3);
    assert.ok(trace.frames.every((frame) => Array.isArray(frame.array) && Array.isArray(frame.highlightIndices)));
  });
}
