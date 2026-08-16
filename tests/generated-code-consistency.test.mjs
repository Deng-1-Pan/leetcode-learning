import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function metaFor(directory) {
  return JSON.parse(await readFile(new URL(`problems/${directory}/meta.json`, root), 'utf8'));
}

async function runCpp(source) {
  const directory = await mkdtemp(join(tmpdir(), 'leetcode-code-'));
  const sourcePath = join(directory, 'main.cpp');
  const executablePath = join(directory, 'main');
  try {
    await writeFile(sourcePath, source, 'utf8');
    execFileSync('g++', ['-std=c++17', sourcePath, '-o', executablePath], { stdio: 'pipe' });
    return execFileSync(executablePath, [], { encoding: 'utf8' }).trim();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('LC 80 displayed Python and C++ implementations match the generated trace result', async () => {
  const meta = await metaFor('lc-80-remove-duplicates-sorted-array-ii');
  const python = `${meta.code.python}\nnums = [0, 0, 1, 1, 1, 1, 2, 3, 3]\nlength = removeDuplicates(nums)\nprint(length, nums[:length])`;
  const pythonOutput = execFileSync('python3', ['-c', python], { encoding: 'utf8' }).trim();
  assert.equal(pythonOutput, '7 [0, 0, 1, 1, 2, 3, 3]');

  const cppOutput = await runCpp(`#include <iostream>\n#include <vector>\nusing namespace std;\n${meta.code.cpp}\nint main() { vector<int> nums{0, 0, 1, 1, 1, 1, 2, 3, 3}; int length = removeDuplicates(nums); cout << length; for (int i = 0; i < length; ++i) cout << ' ' << nums[i]; }`);
  assert.equal(cppOutput, '7 0 0 1 1 2 3 3');
});

test('LC 122 displayed Python and C++ implementations match the generated trace result', async () => {
  const meta = await metaFor('lc-122-best-time-to-buy-and-sell-stock-ii');
  const python = `${meta.code.python}\nprint(maxProfit([7, 1, 5, 3, 6, 4]))`;
  const pythonOutput = execFileSync('python3', ['-c', python], { encoding: 'utf8' }).trim();
  assert.equal(pythonOutput, '7');

  const cppOutput = await runCpp(`#include <iostream>\n#include <vector>\nusing namespace std;\n${meta.code.cpp}\nint main() { vector<int> prices{7, 1, 5, 3, 6, 4}; cout << maxProfit(prices); }`);
  assert.equal(cppOutput, '7');
});
