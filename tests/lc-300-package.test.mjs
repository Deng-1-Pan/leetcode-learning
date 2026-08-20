import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const directory = new URL('../problems/lc-300-longest-increasing-subsequence/', import.meta.url);
const approaches = [
  ['official-dp', 'official', 'dp-grid'],
  ['official-dp-debug', 'debug', 'variable-watch'],
  ['official-greedy-linear-scan', 'official', 'array-pointers'],
  ['official-greedy-binary-search', 'official', 'array-pointers'],
  ['community-memoized-dfs', 'community', 'dp-grid'],
  ['community-memoized-dfs-debug', 'debug', 'variable-watch'],
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
    assert.ok(trace.frames.length >= 2);
    const approach = meta.approaches.find(({ id }) => id === approachId);
    for (const frame of trace.frames) {
      const languages = approach.sourceType === 'debug' ? ['python'] : ['python', 'cpp'];
      for (const language of languages) {
        assert.ok(Number.isInteger(frame.activeLine?.[language]), `${approachId} ${language} activeLine is missing`);
        assert.ok(frame.activeLine[language] >= 1 && frame.activeLine[language] <= approach.code[language].split('\n').length, `${approachId} ${language} activeLine is outside the displayed source`);
      }
      if (approach.sourceType === 'debug') {
        assert.ok(Number.isInteger(frame.line), `${approachId} line is missing`);
        assert.ok(Number.isInteger(frame.depth), `${approachId} depth is missing`);
        assert.equal(typeof frame.locals, 'object', `${approachId} locals are missing`);
        assert.equal(typeof frame.note, 'string', `${approachId} note is missing`);
      }
    }
  }
});

test('LC 300 explanation follows the Skill structure and embeds all ten players in place', async () => {
  const explanation = await readFile(new URL('explain.md', directory), 'utf8');
  assert.match(explanation, /^## 原题/m);
  assert.match(explanation, /^## 题目拆解与通用切入点/m);
  assert.doesNotMatch(explanation, /^## 暴力解法推导/m);
  assert.match(explanation, /^## 官方解法/m);
  assert.match(explanation, /^## 社区高赞解法/m);
  for (const [approachId] of approaches) assert.match(explanation, new RegExp(`:::viz approach="${approachId}"`));
  for (const approachId of ['official-dp-debug', 'community-memoized-dfs-debug']) assert.match(explanation, new RegExp(`:::viz approach="${approachId}"`));
  assert.equal((explanation.match(/:::viz approach=/g) ?? []).length, 10);
  assert.match(explanation, /:::insight/);
  assert.match(explanation, /:::pitfall/);
  assert.match(explanation, /5 秒想一想/);
  assert.match(explanation, /直接看答案/);
  assert.match(explanation, /现在只需要记住/);
  assert.match(explanation, /现在只需要记住：\*\* `dp\[i\]`[^\n]+。\n\n\*\*想看这段代码到底怎么一行一行跑起来？\*\*/);
  assert.match(explanation, /现在只需要记住：\*\* 记忆化就是[^\n]+。\n\n\*\*想看递归和缓存到底怎么一行一行跑起来？\*\*/);
  assert.doesNotMatch(explanation, /^\|/m, 'the safe Markdown subset does not render tables');
});
