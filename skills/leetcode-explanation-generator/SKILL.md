---
name: leetcode-explanation-generator
description: Turn problem, official-solution, and community-solution screenshots plus a learner's specific blockage into a verified multi-approach LeetCode learning package. Use when creating or revising screenshot-driven visual explanations in the leetcode-learning project.
---

# LeetCode Explanation Generator

Create a verified learning page from source screenshots. The learner's exact blockage drives the problem analysis and generic entry-point guidance; screenshots make the problem constraints and competing approaches auditable.

## Required inputs

Collect all four inputs before generating a formal problem package:

1. One or more original-problem screenshots, including description, constraints, and examples.
2. One or more official-solution screenshots.
3. One or more high-voted community-solution screenshots.
4. A specific learner confusion; an optional attempted idea may accompany it.

Do not substitute a web page, remembered wording, or a paraphrase for the original-problem screenshots. If screenshots are absent, explain that an exact-transcription package cannot be generated; infrastructure work may continue independently.

## Source handling

1. Transcribe the original problem **word for word** into the top “原题” section: number, description, constraints, and examples. Check every boundary condition against the screenshots before writing traces.
2. Paraphrase official reasoning and complexity conclusions; do not copy long passages.
3. Extract every community approach supplied by the user. Never copy community code: independently implement, run, and validate it before producing this project's trace and displayed Python/C++ code.
4. **Account for every official approach shown in the supplied official material.** Keep every approach with a distinct algorithmic idea as a separately labelled official section and approach package, even when it is slower. Do not silently collapse a brute-force or intermediate official approach merely because a later official approach is asymptotically better: it can be the learner's bridge to that later insight.
5. **Do not merge or omit any supplied official approach.** Each one needs its own full explanation, Python/C++ code, generated trace, and player, even if its algorithm is equivalent to another supplied answer.
6. **Do not merge or omit any supplied community approach.** Each one needs the same full package as an official approach, even if it is an equivalent implementation or has worse complexity. The only permitted compression is a user-approved decision to remove a source from the input scope; record it in `_qc-checklist.md`.

## Contract-first workflow

1. Read `docs/ENGINE-SPEC.md` and `engine/viz-registry.js` from the target project.
2. List every official approach from the source, then classify them separately by algorithmic invariant; list and classify community approaches independently.
3. Record which supplied approaches are algorithmically equivalent, but retain them anyway. “It is slower”, “it is the brute-force baseline”, or “it is only an implementation variant” is **not** grounds for omitting any supplied answer.
4. Reuse registered visualizers. First try frame `description`/`note` for state that is not spatial. Do not extend the engine without an explicit design decision.
5. For every supplied approach, create `approaches/<approach-id>/generate_trace.py` and generate the matching `trace.json` with `approachId`.
6. Write v2 `meta.json`: every supplied approach needs a unique `id`, source type, registered `vizType`, languages, and code.

## Page structure

Write `explain.md` in this order:

1. `## 原题` — exact screenshot transcription.
2. `## 题目拆解与通用切入点` — no visual player. Before presenting any source solution, explain: (a) what the judge actually checks and which constraints are decisive; (b) the relevant data-structure / algorithm concepts; (c) the broader problem pattern; and (d) a reusable way to find the first foothold for this pattern. Apply that generic entry point to the learner's exact confusion and this problem's concrete conditions, but do not prematurely turn it into a full source solution.
3. `## 官方解法` — create one `### 方案 N：…` subsection for **every supplied official approach**, in source order. For the first official approach, connect it explicitly to the preceding problem analysis and generic entry point. For each later official approach, derive its insight from a concrete cost or limitation of the immediately preceding supplied approach before naming the technique; do not state the conclusion and then merely justify it. Explain each algorithm, then insert its own player exactly where it is discussed:

```makefile
:::insight
The one insight worth retaining.
:::

:::viz approach="official-id"
:::
```

4. `## 社区高赞解法` — create one complete `### 方案 N：…` subsection for **every supplied community approach**, in source order. Independently derive its insight from the preceding approach, contrast it with the relevant official approach, then include its own player and Python/C++ code. Never replace a supplied community answer with an “实现变体” prose-only section.
5. `## 复杂度对比总结` — compare every supplied official and community approach in a compact Markdown table or list.

## Zero-basics and ADHD-friendly teaching

Assume the learner may have no prerequisite vocabulary, may need more time to turn a sentence into a mental picture, and may lose focus when one paragraph carries several ideas. Accuracy is necessary but is not sufficient: make the path to each idea easy to re-enter after an interruption.

- Introduce one new idea at a time. Start each reasoning unit with its immediate goal, then use short, direct sentences.
- On first use, write the everyday meaning before the term, for example “把以前算过的答案记下来（记忆化）”. State what that idea is useful for **right now**.
- Before a formula or general rule, walk through a tiny numeric example. Translate the formula back into ordinary language immediately afterward.
- For every formal approach, use this order: immediate goal → plain-language concept → tiny walkthrough → optional five-second check → immediate answer and reason → one memory sentence.
- A check is optional help, never a gate. Label it `**5 秒想一想：**`; ask only one local judgment after enough information has appeared; follow it immediately with `**直接看答案：**` and the reason. Do not ask the learner to reconstruct an entire algorithm in their head.
- End every approach with `**现在只需要记住：**` followed by one short, actionable sentence.
- Explicitly state common boundaries and non-examples when they prevent a likely misconception, such as “`tails` 不是最终 LIS 本身”.
- Keep player notes in the same order: current action → reason → current result. Use short sentences.

## Knowledge map before solutions

Do not treat “题目拆解” as only a restatement of the input and output. A learner needs to know what they are supposed to be learning before they can attach meaning to the later methods.

- State plainly whether the central test is mainly an **algorithmic idea**, a **data-structure operation**, or both. Explain the distinction in ordinary language: an algorithm is the step-by-step strategy; a data structure is how information is stored and accessed.
- Name the specific abilities the problem exercises. For example, LC 300 is primarily about sequence algorithms and state representation: dynamic programming, state compression, greedy choice, and binary search. An array is the input container here, not the main knowledge being tested.
- When sources contain several approaches, give the reader a compact route map before the first formal solution: what each route is trying to improve, and why several correct routes can coexist. Do not imply that every route is a separate unrelated “answer”.
- Use this map to explain what a learner should first practice. Do not use it to reveal a formal solution before its own section.

## Symbol and example handoff

Never introduce notation, a named value from an example, or a phrase such as “best length” as if the learner has already met it. Before a new state, variable, formula, or selected value appears, complete this handoff in order:

1. Choose a concrete input and label the relevant position explicitly, for example “in `[10,9,2,5,3,7,101,18]`, we are looking at `nums[5]`, whose value is `7`”.
2. Ask the state question in ordinary language, for example “if we insist that this little sequence ends at this `7`, how many numbers can it contain at most?” Explain why this smaller question helps the original problem.
3. Introduce the storage in ordinary language before notation, for example “we will keep one answer in a table for every position”. Only then define the symbol: “the answer stored for position `i` is called `dp[i]`”.
4. Work one base value and one transition with explicit inputs and outputs before writing a general recurrence. Translate every part of the recurrence back into the same ordinary-language question.

Use stable names while teaching. Do not switch from “answer ending at this position” to “best length”, “state”, or `dp[i]` without saying they refer to the same thing. Do not write “calculate 7” or “look at 2 and 3” without identifying their original array positions and why those exact values were selected.

## Prerequisite and causality checks

Treat every explanation as a chain of prerequisites. A sentence may use an object only after the reader has met its origin, role, and one concrete use.

- Before the first formal approach, include a `这题在考什么` map: name the primary algorithmic skill, any supporting data structure, why several approaches may coexist, and the first concept to learn. Do not leave the learner guessing whether the test is about arrays, data structures, or algorithms.
- Before defining a state such as `dp[i]`, first show the exact question that the state will answer in ordinary language. Then show the storage idea (“one answer per position”), then the notation. Never begin a paragraph with unexplained notation.
- Every example value must have provenance: identify the input, its index, its value, and why it is the current focus.
- Do not use `所以`、`因此`、`这说明`、`最好`、`候选` or “加一” unless the preceding sentences contain the specific fact or comparison that makes that step true. Write the missing middle decision explicitly.
- A base case must be written as a full three-part statement: the exact input condition, the answer stored for it, and why that answer is valid. A transition must likewise name the previous stored answer, the eligibility comparison, and the newly stored answer.

Use `:::pitfall` only for a concrete trap. Use fixed semantic callouts and `**bold**` for emphasis; never introduce arbitrary colors or raw HTML. The visual directive also renders that approach's Python/C++ code tabs in place.

## QC artifact and verification

Create `problems/<id>/_qc-checklist.md`; it is not page content. It must record:

- original transcription checked against every screenshot;
- every supplied official and community approach, source order, and equivalence note; any omission must name the user's explicit removal decision;
- each trace generated and `--check`-verified;
- Python/C++ output matches each generator;
- every `:::viz` resolves to one distinct player;
- browser test confirms independent next/previous/slider/play/reset behavior;
- insight/pitfall render safely and the QC file is absent from the page.
- the knowledge map identifies the primary knowledge being tested and explains the role of each supplied route;
- every first-use symbol and selected example value completes the symbol-and-example handoff above.

Run the index build, automated tests, and real browser checks before reporting success. Read [the teaching rubric](references/teaching-rubric.md) before final acceptance.
