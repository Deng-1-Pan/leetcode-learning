---
name: leetcode-explanation-generator
description: Turn problem, official-solution, and community-solution screenshots plus a learner's specific blockage into a verified multi-approach LeetCode learning package. Use when creating or revising screenshot-driven visual explanations in the leetcode-learning project.
---

# LeetCode Explanation Generator

Create a verified learning page from source screenshots. The learner's exact blockage still drives the brute-force derivation; screenshots make the problem constraints and competing approaches auditable.

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
3. Extract only the community algorithmic idea. Never copy community code: independently implement, run, and validate it before producing this project's trace and displayed Python/C++ code.
4. Consider each community approach for separate inclusion only when it uses a different algorithmic paradigm or improves complexity over the official approach. An equivalent implementation becomes an “实现变体” text section, not an approach or player.

## Contract-first workflow

1. Read `docs/ENGINE-SPEC.md` and `engine/viz-registry.js` from the target project.
2. Classify the official and community algorithms independently.
3. Reuse registered visualizers. First try frame `description`/`note` for state that is not spatial. Do not extend the engine without an explicit design decision.
4. For every independently included approach, create `approaches/<approach-id>/generate_trace.py` and generate the matching `trace.json` with `approachId`.
5. Write v2 `meta.json`: every independent approach needs unique `id`, source type, registered `vizType`, languages, and code.

## Page structure

Write `explain.md` in this order:

1. `## 原题` — exact screenshot transcription.
2. `## 暴力解法推导` — no visual player. Narrate the no-idea starting point, the natural attempt, the blockage, the brute-force algorithm, and a concrete cost. Directly answer the learner's confusion.
3. `## 官方解法` — explain the insight as a consequence of brute-force waste, explain the algorithm, then insert its player exactly where it is discussed:

```makefile
:::insight
The one insight worth retaining.
:::

:::viz approach="official-id"
:::
```

4. `## 社区高赞解法` — include only a qualifying independent approach; contrast its angle with the official approach and insert its own `:::viz` player. Otherwise use `### 实现变体` with prose only.
5. `## 复杂度对比总结` — compare brute force, official, and qualifying community approaches in a compact Markdown table or list.

Use `:::pitfall` only for a concrete trap. Use fixed semantic callouts and `**bold**` for emphasis; never introduce arbitrary colors or raw HTML. The visual directive also renders that approach's Python/C++ code tabs in place.

## QC artifact and verification

Create `problems/<id>/_qc-checklist.md`; it is not page content. It must record:

- original transcription checked against every screenshot;
- official/community source distinction and inclusion decision;
- each trace generated and `--check`-verified;
- Python/C++ output matches each generator;
- every `:::viz` resolves to one distinct player;
- browser test confirms independent next/previous/slider/play/reset behavior;
- insight/pitfall render safely and the QC file is absent from the page.

Run the index build, automated tests, and real browser checks before reporting success. Read [the teaching rubric](references/teaching-rubric.md) before final acceptance.
