import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const directory = new URL('../problems/lc-300-longest-increasing-subsequence/', import.meta.url);
const debugApproaches = ['official-dp-debug', 'community-memoized-dfs-debug'];

test('LC 300 debug approaches commit line-by-line traces generated from executable Python', async () => {
  const meta = JSON.parse(await readFile(new URL('meta.json', directory), 'utf8'));

  for (const approachId of debugApproaches) {
    const approach = meta.approaches.find(({ id }) => id === approachId);
    assert.deepEqual(approach?.languages, ['python']);
    assert.equal(approach?.sourceType, 'debug');
    assert.equal(approach?.vizType, 'variable-watch');

    const generated = spawnSync('python3', ['generate_trace.py', '--check'], {
      cwd: fileURLToPath(new URL(`approaches/${approachId}/`, directory)),
      encoding: 'utf8',
    });
    assert.equal(generated.status, 0, generated.stderr || generated.stdout || String(generated.error));

    const trace = JSON.parse(await readFile(new URL(`approaches/${approachId}/trace.json`, directory), 'utf8'));
    assert.equal(trace.problemId, meta.id);
    assert.equal(trace.approachId, approachId);
    assert.ok(trace.frames.length > 1);
    for (const frame of trace.frames) {
      assert.ok(Number.isInteger(frame.line));
      assert.ok(Number.isInteger(frame.depth) && frame.depth >= 1);
      assert.ok(['line', 'return'].includes(frame.event));
      assert.equal(typeof frame.locals, 'object');
      assert.equal(typeof frame.note, 'string');
      assert.equal(frame.activeLine?.python, frame.line);
    }
  }
});

test('memoized debug trace records nested closure execution and return values', async () => {
  const trace = JSON.parse(await readFile(new URL('approaches/community-memoized-dfs-debug/trace.json', directory), 'utf8'));

  assert.ok(trace.frames.some((frame) => frame.depth > 1 && 'i' in frame.locals));
  assert.ok(trace.frames.some((frame) => frame.event === 'return' && Number.isInteger(frame.returnValue)));
  assert.ok(trace.frames.filter((frame) => frame.function === '<genexpr>' && frame.event === 'return').every((frame) => frame.note.includes('max')));
  assert.match(trace.frames.at(-1).note, /外层函数返回/);
});
