import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCellValue } from '../engine/components/viz-dp-grid.js';

test('DP cells render unfilled values as blanks', () => {
  assert.equal(formatCellValue(null), '');
  assert.equal(formatCellValue(undefined), '');
  assert.equal(formatCellValue(0), '0');
  assert.equal(formatCellValue(8), '8');
});
