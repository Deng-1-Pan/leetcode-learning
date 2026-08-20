import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const sharedDirectory = fileURLToPath(new URL('../problems/_shared/', import.meta.url));
const source = `from functools import cache

def solve(nums: list[int]) -> int:
    @cache
    def dfs(i: int) -> int:
        if i == 0:
            return nums[0]
        return dfs(i - 1) + nums[i]
    return dfs(len(nums) - 1)`;
const script = `
import json
import sys
sys.path.insert(0, sys.argv[1])
import line_tracer
func = line_tracer.load_function(${JSON.stringify(source)}, 'solve')
steps, result = line_tracer.trace_call(func, ([1, 2, 3],))
print(json.dumps({'steps': steps, 'result': result}))
`;
const mutationSource = `def mutate() -> list[int]:
    values = [0]
    values.append(1)
    return values`;
const mutationScript = `
import json
import sys
sys.path.insert(0, sys.argv[1])
import line_tracer
func = line_tracer.load_function(${JSON.stringify(mutationSource)}, 'mutate')
steps, result = line_tracer.trace_call(func, ())
print(json.dumps({'steps': steps, 'result': result}))
`;

test('line tracer follows nested cached closures and records JSON-safe return events', () => {
  const result = spawnSync('python3', ['-c', script, sharedDirectory], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error));

  const { steps, result: value } = JSON.parse(result.stdout);
  assert.equal(value, 6);
  assert.ok(steps.some((step) => step.line === 6 && step.depth > 1));
  assert.ok(steps.some((step) => step.function === 'dfs' && step.depth > 1));
  assert.ok(steps.some((step) => step.event === 'return' && step.returnValue === 6));
  assert.ok(steps.every((step) => ['line', 'return'].includes(step.event)));
  assert.doesNotThrow(() => JSON.stringify(steps));
});

test('line tracer snapshots mutable locals at each pre-execution event', () => {
  const result = spawnSync('python3', ['-c', mutationScript, sharedDirectory], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error));

  const { steps } = JSON.parse(result.stdout);
  assert.deepEqual(steps.find((step) => step.line === 3 && step.event === 'line').locals.values, [0]);
});

test('line tracer preserves JSON-safe null locals', () => {
  const nullSource = `def read_null() -> int:
    value = None
    return 1`;
  const nullScript = `
import json
import sys
sys.path.insert(0, sys.argv[1])
import line_tracer
func = line_tracer.load_function(${JSON.stringify(nullSource)}, 'read_null')
steps, result = line_tracer.trace_call(func, ())
print(json.dumps({'steps': steps, 'result': result}))
`;
  const result = spawnSync('python3', ['-c', nullScript, sharedDirectory], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error));

  const { steps } = JSON.parse(result.stdout);
  assert.equal(steps.find((step) => step.line === 3 && step.event === 'line').locals.value, null);
});
