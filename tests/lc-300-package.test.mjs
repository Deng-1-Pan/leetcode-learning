import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const directory = new URL('../problems/lc-300-longest-increasing-subsequence/', import.meta.url);
const approaches = [
  ['official-dp', 'dp-grid'],
  ['community-greedy-binary-search', 'array-pointers'],
];

test('LC 300 is a generated v2 package with two independent visual approaches', async () => {
  const meta = JSON.parse(await readFile(new URL('meta.json', directory), 'utf8'));
  assert.equal(meta.id, 'lc-300-longest-increasing-subsequence');
  assert.deepEqual(meta.approaches.map(({ id, vizType }) => [id, vizType]), approaches);

  for (const [approachId, vizType] of approaches) {
    const generated = spawnSync('python3', ['generate_trace.py', '--check'], {
      cwd: fileURLToPath(new URL(`approaches/${approachId}/`, directory)),
      encoding: 'utf8',
    });
    assert.equal(generated.status, 0, generated.stderr || generated.stdout || String(generated.error));

    const trace = JSON.parse(await readFile(new URL(`approaches/${approachId}/trace.json`, directory), 'utf8'));
    assert.equal(trace.problemId, meta.id);
    assert.equal(trace.approachId, approachId);
    assert.ok(trace.frames.length >= 6);
    assert.equal(meta.approaches.find((approach) => approach.id === approachId).vizType, vizType);
  }
});

test('LC 300 explanation keeps both visual players next to their respective approaches', async () => {
  const explanation = await readFile(new URL('explain.md', directory), 'utf8');
  assert.match(explanation, /## 原题/);
  assert.match(explanation, /## 暴力解法推导/);
  assert.match(explanation, /:::viz approach="official-dp"/);
  assert.match(explanation, /:::viz approach="community-greedy-binary-search"/);
  assert.match(explanation, /:::insight/);
  assert.match(explanation, /:::pitfall/);
  assert.doesNotMatch(explanation, /^\|/m, 'the safe Markdown subset does not render tables');
});
