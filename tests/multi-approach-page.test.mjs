import assert from 'node:assert/strict';
import test from 'node:test';
import { validateApproachTraces } from '../engine/problem-page.js';

const approaches = [
  { id: 'official-dp', label: '官方解法：动态规划', sourceType: 'official', vizType: 'dp-grid', languages: ['python'], code: { python: 'pass' } },
  { id: 'community-greedy', label: '社区高赞：贪心', sourceType: 'community', vizType: 'array-pointers', languages: ['python'], code: { python: 'pass' } },
];

const trace = (approachId) => ({ problemId: 'multi', approachId, frames: [{ step: 0 }] });

test('validated approach traces remain associated with their own approach ids', () => {
  const result = validateApproachTraces('multi', approaches, [trace('community-greedy'), trace('official-dp')]);

  assert.deepEqual(result.map(({ approach, trace: approachTrace }) => [approach.id, approachTrace.approachId]), [
    ['official-dp', 'official-dp'],
    ['community-greedy', 'community-greedy'],
  ]);
});

test('approach trace validation rejects a trace attached to the wrong approach', () => {
  assert.throws(
    () => validateApproachTraces('multi', approaches, [trace('official-dp'), trace('official-dp')]),
    /approach trace id does not match/i,
  );
});
