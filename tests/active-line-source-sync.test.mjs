import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = new URL('../problems/', import.meta.url);
const packages = [
  ['lc-300-longest-increasing-subsequence', [
    'official-dp',
    'official-greedy-linear-scan',
    'official-greedy-binary-search',
    'community-memoized-dfs',
    'community-iterative-dp',
    'community-greedy-binary-extra-space',
    'community-greedy-binary-in-place',
    'community-reconstruct-lis',
  ]],
  ['lc-80-remove-duplicates-sorted-array-ii', [
    'official-pop-delete',
    'official-overwrite',
    'community-stack-write-two-back',
  ]],
];

function generatorCode(directory, keys = ['PYTHON_CODE', 'CPP_CODE']) {
  const script = "import json, runpy, sys; namespace = runpy.run_path(sys.argv[1]); print(json.dumps([namespace[key] for key in sys.argv[2:]]))";
  const result = spawnSync('python3', ['-c', script, 'generate_trace.py', ...keys], {
    cwd: fileURLToPath(directory),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error));
  return JSON.parse(result.stdout);
}

test('LC 300 and LC 80 generators keep active-line source copies synchronized with displayed code', async () => {
  for (const [problemId, approachIds] of packages) {
    const directory = new URL(`${problemId}/`, root);
    const meta = JSON.parse(await readFile(new URL('meta.json', directory), 'utf8'));
    for (const approachId of approachIds) {
      const approach = meta.approaches.find(({ id }) => id === approachId);
      const [python, cpp] = generatorCode(new URL(`approaches/${approachId}/`, directory));
      assert.equal(python, approach.code.python, `${problemId}/${approachId} Python source is stale`);
      assert.equal(cpp, approach.code.cpp, `${problemId}/${approachId} C++ source is stale`);
    }
  }
});

test('LC 300 debug generators keep their Python source copies synchronized with their paired approaches', async () => {
  const directory = new URL('lc-300-longest-increasing-subsequence/', root);
  const meta = JSON.parse(await readFile(new URL('meta.json', directory), 'utf8'));
  for (const [debugId, sourceId] of [
    ['official-dp-debug', 'official-dp'],
    ['community-memoized-dfs-debug', 'community-memoized-dfs'],
  ]) {
    const debug = meta.approaches.find(({ id }) => id === debugId);
    const source = meta.approaches.find(({ id }) => id === sourceId);
    const [python] = generatorCode(new URL(`approaches/${debugId}/`, directory), ['PYTHON_CODE']);
    assert.equal(debug.sourceApproachId, sourceId);
    assert.equal(debug.code.python, source.code.python);
    assert.equal(python, source.code.python);
  }
});
