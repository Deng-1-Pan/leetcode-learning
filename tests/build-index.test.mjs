import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('../scripts/build-index.mjs', import.meta.url).pathname;
const meta = (id, title) => JSON.stringify({ id, title, difficulty: 'easy', tags: ['数组'], vizType: 'array-pointers', leetcodeUrl: 'https://example.test', languages: ['python'] });
const metaV2 = (id, title) => JSON.stringify({
  id,
  title,
  difficulty: 'medium',
  tags: ['动态规划', '贪心'],
  leetcodeUrl: 'https://example.test',
  approaches: [{
    id: 'official-dp',
    label: '官方解法：动态规划',
    sourceType: 'official',
    vizType: 'dp-grid',
    languages: ['python', 'cpp'],
    code: { python: 'def solve(): pass', cpp: 'int solve() { return 0; }' },
  }],
});

const debugMetaV2 = (id, title) => JSON.stringify({
  id,
  title,
  difficulty: 'medium',
  tags: ['动态规划'],
  leetcodeUrl: 'https://example.test',
  approaches: [{
    id: 'official-dp-debug',
    label: '单步调试：动态规划怎么一行一行跑',
    sourceType: 'debug',
    sourceApproachId: 'official-dp',
    vizType: 'variable-watch',
    languages: ['python'],
    code: { python: 'def solve(): return 1' },
  }],
});

test('build index excludes the template and sorts problems by title', async () => {
  const root = await mkdtemp(join(tmpdir(), 'leetcode-index-'));
  await mkdir(join(root, 'problems', '_template'), { recursive: true });
  await mkdir(join(root, 'problems', 'zebra'), { recursive: true });
  await mkdir(join(root, 'problems', 'alpha'), { recursive: true });
  await writeFile(join(root, 'problems', '_template', 'meta.json'), meta('_template', 'Template'));
  await writeFile(join(root, 'problems', 'zebra', 'meta.json'), meta('zebra', 'Zebra Sort'));
  await writeFile(join(root, 'problems', 'alpha', 'meta.json'), meta('alpha', 'Alpha Search'));

  const result = spawnSync(process.execPath, [script, '--root', root], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  const index = JSON.parse(await readFile(join(root, 'problems-index.json'), 'utf8'));
  assert.deepEqual(index.map((item) => item.id), ['alpha', 'zebra']);
});

test('build index accepts a v2 problem with per-approach visualization metadata', async () => {
  const root = await mkdtemp(join(tmpdir(), 'leetcode-index-v2-'));
  await mkdir(join(root, 'problems', 'multi'), { recursive: true });
  await writeFile(join(root, 'problems', 'multi', 'meta.json'), metaV2('multi', 'Multi Approach'));

  const result = spawnSync(process.execPath, [script, '--root', root], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  const index = JSON.parse(await readFile(join(root, 'problems-index.json'), 'utf8'));
  assert.deepEqual(index[0].approaches.map((approach) => approach.id), ['official-dp']);
  assert.equal(index[0].vizType, undefined);
});

test('build index accepts a debug pseudo-approach using variable-watch', async () => {
  const root = await mkdtemp(join(tmpdir(), 'leetcode-index-debug-'));
  await mkdir(join(root, 'problems', 'debug'), { recursive: true });
  await writeFile(join(root, 'problems', 'debug', 'meta.json'), debugMetaV2('debug', 'Debug View'));

  const result = spawnSync(process.execPath, [script, '--root', root], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  const index = JSON.parse(await readFile(join(root, 'problems-index.json'), 'utf8'));
  assert.equal(index[0].approaches[0].sourceType, 'debug');
  assert.equal(index[0].approaches[0].vizType, 'variable-watch');
});
