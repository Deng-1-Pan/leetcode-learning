import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const directory = new URL('../problems/lc-300-longest-increasing-subsequence/', import.meta.url);
const approaches = [
  ['official-dp', 'official', 'dp-grid'],
  ['official-greedy-linear-scan', 'official', 'array-pointers'],
  ['official-greedy-binary-search', 'official', 'array-pointers'],
  ['community-memoized-dfs', 'community', 'dp-grid'],
  ['community-iterative-dp', 'community', 'dp-grid'],
  ['community-greedy-binary-extra-space', 'community', 'array-pointers'],
  ['community-greedy-binary-in-place', 'community', 'array-pointers'],
  ['community-reconstruct-lis', 'community', 'array-pointers'],
];

test('LC 300 retains every supplied official and community approach as an independently generated package', async () => {
  const meta = JSON.parse(await readFile(new URL('meta.json', directory), 'utf8'));
  assert.equal(meta.id, 'lc-300-longest-increasing-subsequence');
  assert.deepEqual(meta.approaches.map(({ id, sourceType, vizType }) => [id, sourceType, vizType]), approaches);
  for (const [approachId] of approaches) {
    const generated = spawnSync('/opt/homebrew/bin/python3', ['generate_trace.py', '--check'], { cwd: fileURLToPath(new URL(`approaches/${approachId}/`, directory)), encoding: 'utf8' });
    assert.equal(generated.status, 0, generated.stderr || generated.stdout || String(generated.error));
    const trace = JSON.parse(await readFile(new URL(`approaches/${approachId}/trace.json`, directory), 'utf8'));
    assert.equal(trace.problemId, meta.id);
    assert.equal(trace.approachId, approachId);
    assert.ok(trace.frames.length >= 6);
  }
});

test('LC 300 explanation follows the Skill structure and embeds all eight players in place', async () => {
  const explanation = await readFile(new URL('explain.md', directory), 'utf8');
  assert.match(explanation, /^## 原题/m);
  assert.match(explanation, /^## 题目拆解与通用切入点/m);
  assert.doesNotMatch(explanation, /^## 暴力解法推导/m);
  assert.match(explanation, /^## 官方解法/m);
  assert.match(explanation, /^## 社区高赞解法/m);
  for (const [approachId] of approaches) assert.match(explanation, new RegExp(`:::viz approach="${approachId}"`));
  assert.equal((explanation.match(/:::viz approach=/g) ?? []).length, 8);
  assert.match(explanation, /:::insight/);
  assert.match(explanation, /:::pitfall/);
  assert.doesNotMatch(explanation, /^\|/m, 'the safe Markdown subset does not render tables');
});
