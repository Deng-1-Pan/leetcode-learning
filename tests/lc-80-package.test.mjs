import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const directory = new URL('../problems/lc-80-remove-duplicates-sorted-array-ii/', import.meta.url);

test('LC 80 retains every supplied official and community approach as a full package', async () => {
  const meta = JSON.parse(await readFile(new URL('meta.json', directory), 'utf8'));
  const explanation = await readFile(new URL('explain.md', directory), 'utf8');

  assert.deepEqual(meta.approaches.map(({ id, sourceType, vizType }) => [id, sourceType, vizType]), [
    ['official-pop-delete', 'official', 'array-pointers'],
    ['official-overwrite', 'official', 'array-pointers'],
    ['community-stack-write-two-back', 'community', 'array-pointers'],
  ]);
  assert.match(explanation, /^## 原题/m);
  assert.match(explanation, /^## 题目拆解与通用切入点/m);
  assert.doesNotMatch(explanation, /^## 暴力解法推导/m);
  assert.match(explanation, /^## 官方解法/m);
  assert.match(explanation, /^## 社区高赞解法/m);
  assert.match(explanation, /^### 方案一：把有效前缀当作栈/m);
  assert.match(explanation, /^### 方案一：删除多余重复项/m);
  assert.match(explanation, /^### 方案二：覆盖多余重复项/m);
  assert.match(explanation, /:::viz approach="official-pop-delete"/);
  assert.match(explanation, /:::viz approach="official-overwrite"/);
  assert.match(explanation, /:::viz approach="community-stack-write-two-back"/);
  assert.equal((explanation.match(/:::viz approach=/g) ?? []).length, 3);
  assert.match(explanation, /:::insight/);
  assert.match(explanation, /:::pitfall/);
});
