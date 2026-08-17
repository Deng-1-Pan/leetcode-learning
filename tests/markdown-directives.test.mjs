import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownToHtml } from '../engine/problem-page.js';

test('markdown renders an allowlisted approach visual mount point', () => {
  const html = markdownToHtml('官方讲解。\n\n:::viz approach="official-dp"\n:::\n\n继续解释。');

  assert.match(html, /<div data-approach-viz="official-dp"><\/div>/);
  assert.doesNotMatch(html, /<p>:::viz/);
});

test('markdown renders insight and pitfall as fixed semantic callouts', () => {
  const html = markdownToHtml(':::insight\n**排序**消除了全局计数。\n:::\n\n:::pitfall\n不要修改原数组尾部。\n:::');

  assert.match(html, /<aside class="callout callout-insight"><strong>排序<\/strong>消除了全局计数。<\/aside>/);
  assert.match(html, /<aside class="callout callout-pitfall">不要修改原数组尾部。<\/aside>/);
});

test('markdown escapes unknown directives instead of interpreting them as HTML', () => {
  const html = markdownToHtml(':::unknown\n<script>alert(1)<\/script>\n:::');

  assert.match(html, /<pre><code>:::unknown\n&lt;script&gt;alert\(1\)&lt;\/script&gt;\n:::<\/code><\/pre>/);
  assert.doesNotMatch(html, /<script>/);
});
