import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const removeDuplicatesDirectory = new URL('../problems/lc-80-remove-duplicates-sorted-array-ii/', import.meta.url);
const stockDirectory = new URL('../problems/lc-122-best-time-to-buy-and-sell-stock-ii/', import.meta.url);

test('LC 80 commits generated traces for every supplied official and community approach', async () => {
  const meta = JSON.parse(await readFile(new URL('meta.json', removeDuplicatesDirectory), 'utf8'));
  assert.equal(meta.id, 'lc-80-remove-duplicates-sorted-array-ii');
  assert.deepEqual(meta.approaches.map(({ id }) => id), [
    'official-pop-delete',
    'official-overwrite',
    'community-stack-write-two-back',
  ]);

  for (const approach of meta.approaches) {
    assert.equal(approach.vizType, 'array-pointers');
    const generated = spawnSync('python3', ['generate_trace.py', '--check'], {
      cwd: fileURLToPath(new URL(`approaches/${approach.id}/`, removeDuplicatesDirectory)),
      encoding: 'utf8',
    });
    assert.equal(generated.status, 0, generated.stderr || generated.stdout || String(generated.error));

    const trace = JSON.parse(await readFile(new URL(`approaches/${approach.id}/trace.json`, removeDuplicatesDirectory), 'utf8'));
    assert.equal(trace.problemId, meta.id);
    assert.equal(trace.approachId, approach.id);
    assert.ok(trace.frames.length > 3);
    assert.ok(trace.frames.every((frame) => Array.isArray(frame.array) && Array.isArray(frame.highlightIndices)));
    for (const frame of trace.frames) {
      for (const language of ['python', 'cpp']) {
        assert.ok(Number.isInteger(frame.activeLine?.[language]), `${approach.id} ${language} activeLine is missing`);
        assert.ok(frame.activeLine[language] >= 1 && frame.activeLine[language] <= approach.code[language].split('\n').length, `${approach.id} ${language} activeLine is outside the displayed source`);
      }
    }
  }
});

test('LC 122 commits a generated array-pointer trace', async () => {
  const directory = stockDirectory;
  const expectedId = 'lc-122-best-time-to-buy-and-sell-stock-ii';
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
