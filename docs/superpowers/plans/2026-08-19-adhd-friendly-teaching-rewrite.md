# ADHD-Friendly Teaching Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the LeetCode explanation generator and LC 80/LC 300 pages usable for a zero-basics learner who benefits from short, guided, ADHD-friendly teaching steps.

**Architecture:** Keep the existing v2 package, source fidelity, real traces, and independent players untouched. Change only the teaching contract, rubric, package QC records, and Markdown prose. Every formal solution is rewritten as short “goal → plain-language concept → small example → optional five-second check → answer → one memory sentence” units.

**Tech Stack:** Markdown content packages, Node.js `node:test`, Python trace generators, static browser page renderer.

---

## File map

- Modify `skills/leetcode-explanation-generator/SKILL.md`: require micro-step teaching units and learner accommodations during package creation.
- Modify `skills/leetcode-explanation-generator/references/teaching-rubric.md`: add acceptance criteria for short sentences, first-use concept explanation, optional checks, answers, and memory sentences.
- Modify `problems/lc-80-remove-duplicates-sorted-array-ii/explain.md`: rewrite the problem analysis and all three sourced approaches without changing directives or source coverage.
- Modify `problems/lc-80-remove-duplicates-sorted-array-ii/_qc-checklist.md`: record the ADHD-friendly review and browser verification.
- Modify `problems/lc-300-longest-increasing-subsequence/explain.md`: rewrite the problem analysis and all eight sourced approaches without changing directives or source coverage.
- Modify `problems/lc-300-longest-increasing-subsequence/_qc-checklist.md`: record the ADHD-friendly review and browser verification.
- Modify `tests/lc-80-package.test.mjs` and `tests/lc-300-package.test.mjs`: protect the new structural markers while retaining checks that all source approaches remain present.

### Task 1: Encode the micro-step teaching contract

**Files:**
- Modify: `skills/leetcode-explanation-generator/SKILL.md`
- Modify: `skills/leetcode-explanation-generator/references/teaching-rubric.md`

- [ ] **Step 1: Add a failing structural expectation to the package tests**

Add the same assertion shape to both package tests after the existing `:::insight` assertion:

```js
assert.match(explanation, /现在只需要记住/);
assert.match(explanation, /5 秒/);
assert.match(explanation, /直接看答案/);
```

- [ ] **Step 2: Run the focused tests to confirm the current prose does not yet satisfy the contract**

Run: `node --test tests/lc-80-package.test.mjs tests/lc-300-package.test.mjs`

Expected: FAIL because the current pages do not consistently include the three learner-support markers.

- [ ] **Step 3: Update the generator Skill**

In the Page structure section, add an ADHD-friendly teaching requirement: every new concept is introduced as `plain-language explanation (technical term)`, every reasoning unit starts with its immediate goal, and formal solutions are written in short units. State that a five-second check is optional, must follow enough evidence, must ask one local judgment, and must immediately include a “直接看答案” explanation. Require a one-sentence “现在只需要记住” close for each approach.

- [ ] **Step 4: Update the teaching rubric**

Add a `## Zero-basics and ADHD-friendly pacing` section with these review questions:

```markdown
- Does each paragraph introduce at most one new idea and use short, direct sentences?
- Is every first-use technical term first explained in ordinary language and tied to a current purpose?
- Before every `5 秒` check, has the reader already received a concrete example and the decision rule?
- Does every check immediately include `直接看答案` and its reason?
- Does each approach close with `现在只需要记住` followed by one actionable sentence?
```

- [ ] **Step 5: Re-run the focused tests**

Run: `node --test tests/lc-80-package.test.mjs tests/lc-300-package.test.mjs`

Expected: Still FAIL, because prose has not yet been rewritten; the contract itself is now defined.

- [ ] **Step 6: Commit the Skill contract**

```bash
git add skills/leetcode-explanation-generator tests/lc-80-package.test.mjs tests/lc-300-package.test.mjs
git commit -m "feat: add ADHD-friendly teaching contract"
```

### Task 2: Rewrite LC 80 as guided micro-steps

**Files:**
- Modify: `problems/lc-80-remove-duplicates-sorted-array-ii/explain.md`
- Modify: `problems/lc-80-remove-duplicates-sorted-array-ii/_qc-checklist.md`
- Test: `tests/lc-80-package.test.mjs`

- [ ] **Step 1: Rewrite the problem analysis**

Keep the exact original-problem section unchanged. Replace only the content under `## 题目拆解与通用切入点` with short units that introduce: “judge only reads the useful prefix”, “sorted means equal values sit together”, and “in-place means reuse the original array”. Use `[1,1,1,2,2,3]` to give the reader enough evidence before the first optional check:

```markdown
#### 先只看判题器

题目不会检查整个数组。它只检查前 `k` 个位置。

**5 秒想一想：** 第三个 `1` 被跳过后，最后的 `k` 会不会包含它？

**直接看答案：** 不会。`k` 只覆盖保留下来的前缀。

**现在只需要记住：** 这题的答案不是整个数组，而是 `nums[0:k]`。
```

- [ ] **Step 2: Rewrite the three approach sections**

For delete, overwrite, and stack-prefix approaches, retain their existing `:::viz` IDs and all source material. Split each into a named immediate goal, ordinary-language introduction of every new pointer/count/stack term, one concrete mini-walkthrough, one optional local check with answer, and a single memory sentence. Do not change code, metadata, trace files, or directive count.

- [ ] **Step 3: Update LC 80 QC**

Replace the generic prose-quality statement with checked items confirming every approach has a goal, plain-language first-use concept, mini-example, optional check with answer, and memory sentence. Preserve all existing source and trace checks.

- [ ] **Step 4: Run focused content and trace checks**

Run: `node --test tests/lc-80-package.test.mjs tests/demo-traces.test.mjs`

Expected: PASS, including three approach directives and generated traces.

- [ ] **Step 5: Commit LC 80 rewrite**

```bash
git add problems/lc-80-remove-duplicates-sorted-array-ii tests/lc-80-package.test.mjs
git commit -m "docs: rewrite LC 80 for guided learning"
```

### Task 3: Rewrite LC 300 as guided micro-steps

**Files:**
- Modify: `problems/lc-300-longest-increasing-subsequence/explain.md`
- Modify: `problems/lc-300-longest-increasing-subsequence/_qc-checklist.md`
- Test: `tests/lc-300-package.test.mjs`

- [ ] **Step 1: Rewrite the problem analysis**

Keep the exact source transcription unchanged. Replace the existing abstract introduction with short units for: “subsequence can skip but cannot reorder”, “strictly increasing means the next value is larger”, “only length is required”, and “fix the last value as a first foothold”. Use `[2,5,3]` to distinguish a choice from a final solution before introducing DP.

- [ ] **Step 2: Rewrite all three official sections**

Keep one complete section and one `:::viz` for each official approach. For DP, introduce “record the best answer ending here (`dp[i]`)” before the recurrence. For linear candidate tails, show `[8,1,6,2]` before explaining replacement. For binary search, show the already sorted candidate endings before naming `bisect_left`. Each section must include one optional check and one memory sentence.

- [ ] **Step 3: Rewrite all five community sections**

Keep every player and code block. Explain memoized DFS as “ask a smaller question and remember its answer”, iterative DP as “fill the same answer sheet left to right”, extra-space tails as “keep the easiest ending to continue”, in-place tails as “borrow the beginning of the input as the notebook”, and reconstruction as “leave breadcrumbs to walk back”. Each section gets a local check and answer, and must distinguish candidate data from a final LIS where relevant.

- [ ] **Step 4: Update LC 300 QC**

Keep the existing eight-approach source inventory. Add explicit checked items for micro-step pacing, first-use concept translation, optional checks with immediate answers, approach memory sentences, and independent player verification.

- [ ] **Step 5: Run focused package and consistency checks**

Run: `node --test tests/lc-300-package.test.mjs tests/generated-code-consistency.test.mjs`

Expected: PASS, including all eight `generate_trace.py --check` calls and Python/C++ equivalence tests.

- [ ] **Step 6: Commit LC 300 rewrite**

```bash
git add problems/lc-300-longest-increasing-subsequence tests/lc-300-package.test.mjs
git commit -m "docs: rewrite LC 300 for guided learning"
```

### Task 4: Full regression and browser acceptance

**Files:**
- Modify: `problems-index.json` only if `node scripts/build-index.mjs` changes it
- Modify: both package `_qc-checklist.md` files only to record actual browser results

- [ ] **Step 1: Rebuild and run the full suite**

Run: `node scripts/build-index.mjs && node --test && git diff --check`

Expected: Index contains three problems, all tests pass, and no whitespace errors appear.

- [ ] **Step 2: Serve the updated static site**

Run: `python3 -m http.server 8005`

Expected: The site is reachable at `http://localhost:8005/`.

- [ ] **Step 3: Browser-check both pages**

Open the LC 80 and LC 300 URLs. Verify every source badge and code tab appears beside its text; LC 80 has three players and LC 300 has eight. Click “下一步” in a first and a last player on LC 300 to verify only the clicked player advances. Check DevTools console for error and warning entries.

- [ ] **Step 4: Record real verification results**

Update the two QC files with the actual port, player counts, independent control result, and console result. Do not mark a browser item complete without performing it.

- [ ] **Step 5: Commit the verified package**

```bash
git add problems-index.json problems/lc-80-remove-duplicates-sorted-array-ii problems/lc-300-longest-increasing-subsequence
git commit -m "test: verify guided learning pages"
```

## Self-review

- Spec coverage: Tasks 1–4 cover the approved teaching contract, both required pages, source retention, test coverage, trace preservation, and browser verification.
- Completeness scan: every task has explicit files, commands, expected outcomes, and a commit boundary; no unresolved implementation item remains.
- Consistency: the plan preserves current `:::viz` IDs, meta entries, and trace generators; it changes prose and contract only.
