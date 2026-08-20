import assert from 'node:assert/strict';
import test from 'node:test';

import { mount } from '../engine/components/viz-variable-watch.js';
import { supportedVizTypes } from '../engine/viz-registry.js';

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.className = '';
    this.textContent = '';
  }

  append(...children) { this.children.push(...children); }
  set innerHTML(value) { if (value === '') this.children = []; }
}

class StepChangeEvent extends Event {
  constructor(frame) {
    super('step-change');
    this.detail = { frame };
  }
}

test('variable watch is registered and renders arrays and scalar locals without name-specific rules', () => {
  assert.ok(supportedVizTypes.includes('variable-watch'));
  const originalDocument = globalThis.document;
  globalThis.document = { createElement: (tagName) => new Element(tagName) };
  try {
    const container = new Element('div');
    const player = new EventTarget();
    player.frame = { locals: { dp: [1, null, 3], index: 2, ready: true } };
    const unmount = mount(container, player);

    const [panel] = container.children;
    assert.equal(panel.className, 'variable-watch');
    const [arrayRow, scalarRow, booleanRow] = panel.children;
    assert.equal(arrayRow.children[0].textContent, 'dp');
    assert.equal(arrayRow.children[1].className, 'variable-array');
    assert.deepEqual(arrayRow.children[1].children.map((cell) => cell.textContent), ['1', '', '3']);
    assert.match(arrayRow.children[1].children[0].className, /(^| )array-cell( |$)/);
    assert.equal(scalarRow.children[1].className, 'variable-value');
    assert.equal(scalarRow.children[1].textContent, '2');
    assert.equal(booleanRow.children[1].textContent, 'true');

    player.dispatchEvent(new StepChangeEvent({ locals: { memo: [4], answer: null } }));
    assert.equal(container.children[0].children[0].children[0].textContent, 'memo');
    assert.equal(container.children[0].children[1].children[1].textContent, 'null');
    unmount();
  } finally {
    globalThis.document = originalDocument;
  }
});
