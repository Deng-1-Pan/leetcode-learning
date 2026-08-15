import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('../scripts/build-index.mjs', import.meta.url).pathname;
const meta = (id, title) => JSON.stringify({ id, title, difficulty: 'easy', tags: ['数组'], vizType: 'array-pointers', leetcodeUrl: 'https://example.test', languages: ['python'] });

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
