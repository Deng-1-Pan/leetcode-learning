import assert from 'node:assert/strict';
import test from 'node:test';

import { TracePlayer } from '../engine/player-core.js';

const trace = Object.freeze({
  problemId: 'example',
  algorithm: 'example',
  input: {},
  frames: [
    { step: 0, description: 'start' },
    { step: 1, description: 'middle' },
    { step: 2, description: 'finish' },
  ],
});

test('next emits the matching frame and clamps at the final frame', () => {
  const player = new TracePlayer(trace);
  const events = [];
  player.addEventListener('step-change', (event) => events.push(event.detail));

  player.next();
  player.next();
  player.next();

  assert.equal(player.currentStep, 2);
  assert.deepEqual(events.map(({ step }) => step), [1, 2]);
  assert.equal(events.at(-1).frame.description, 'finish');
});

test('previous, jump, and reset clamp to valid trace steps', () => {
  const player = new TracePlayer(trace);

  player.prev();
  assert.equal(player.currentStep, 0);
  player.goToStep(99);
  assert.equal(player.currentStep, 2);
  player.goToStep(-10);
  assert.equal(player.currentStep, 0);
  player.goToStep(1);
  player.reset();
  assert.equal(player.currentStep, 0);
});

test('play advances frames and stops automatically at the end', async () => {
  const player = new TracePlayer(trace);

  player.play(5);
  assert.equal(player.isPlaying, true);
  await new Promise((resolve) => setTimeout(resolve, 35));

  assert.equal(player.currentStep, 2);
  assert.equal(player.isPlaying, false);
});
