import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const climbingDirectory = new URL('../problems/demo-climbing-stairs/', import.meta.url);

test('climbing-stairs commits a generated one-dimensional DP trace', async () => {
  const generated = spawnSync('python3', ['generate_trace.py', '--check'], {
    cwd: fileURLToPath(climbingDirectory),
    encoding: 'utf8',
  });
  assert.equal(generated.status, 0, generated.stderr || generated.stdout || String(generated.error));

  const meta = JSON.parse(await readFile(new URL('meta.json', climbingDirectory), 'utf8'));
  const trace = JSON.parse(await readFile(new URL('trace.json', climbingDirectory), 'utf8'));
  assert.equal(meta.vizType, 'dp-grid');
  assert.equal(trace.problemId, meta.id);
  assert.ok(trace.frames.length > 2);
  assert.ok(trace.frames.every((frame) => Array.isArray(frame.grid) && frame.activeCell?.length === 2));
});
