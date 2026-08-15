import assert from 'node:assert/strict';
import test from 'node:test';

import { bindFilterEvents } from '../engine/list-page.js';

const fakeElement = () => ({
  listeners: new Map(),
  addEventListener(event, handler) { this.listeners.set(event, handler); },
});

test('list filters use input for search and change for select controls', () => {
  const search = fakeElement();
  const difficulty = fakeElement();
  const tag = fakeElement();
  let renderCalls = 0;

  bindFilterEvents({ search, difficulty, tag }, () => { renderCalls += 1; });
  search.listeners.get('input')();
  difficulty.listeners.get('change')();
  tag.listeners.get('change')();

  assert.equal(renderCalls, 3);
});
