# Teaching-quality rubric

Review every generated `explain.md` against this rubric before it is accepted.

## Problem breakdown and generic entry point

- Before any source solution, does the explanation accurately state what the judge checks and which constraints materially shape the solution?
- Does it name and briefly explain the relevant concepts, rather than assuming the reader already recognizes the pattern?
- Does it identify the broader problem pattern and give a reusable first-footing method for this kind of problem?
- Does it directly address the learner's exact confusion without prematurely presenting one of the formal solutions?
- Could a reader use the entry-point method to begin a nearby problem of the same type?

## Knowledge map and symbol handoff

- Before any formal solution, does the page say whether the problem mainly tests algorithmic strategy, data-structure use, or both? Does it explain that distinction in ordinary language?
- Does it name the specific knowledge points and show how the supplied approaches are related routes, rather than unrelated answers?
- Before the first `dp[i]`, `f[i]`, `g[k]`, `tails`, pointer, or recurrence, does the text first name a concrete input position and ask the corresponding ordinary-language question?
- Does the first worked example explicitly identify each value by both its array position and value, for example `nums[5] = 7`, rather than saying “calculate 7”?
- Before saying “best”, “longest”, or “candidate”, has the text specified *best/longest/candidate for which exact condition*?
- Does it work at least one base case and one transition as concrete input → decision → stored result before using a general formula?
- Could a learner point to exactly where a new symbol came from, what question it answers, and why that question helps solve the original problem?

## Optimization bridge

Apply every item in this section to **every** explanation of “why this technique / why think of this approach”, including the bridge from the generic entry point to the first formal approach. Each `:::insight` box is independently in scope: the official and community approaches must each derive their own idea.

- Is a concrete constraint, cost, repetition, or dominated state from the generic entry point or immediately preceding approach identified?
- Before stating the general technique, does the text compute or walk through a small concrete example that makes the technique necessary or natural?
- Does the text explain how observing that example produces the key invariant or equivalence?
- Could a reader distinguish this from a sentence that states the conclusion and then merely justifies it? If not, it fails the rubric as conclusion-first writing.
- Is the small example sufficient to check the claimed equivalence by hand?

Use LC 122’s following verified passage as the model:

> 暴力枚举重复计算的是一段连续上涨的不同切分。对 `[1,2,3,4]`，一次 `1→4`
> 的利润是 `4-1=3`；拆成每天交易则是 `(2-1)+(3-2)+(4-3)=3`，结果完全一样。
>
> 允许不限次数交易正是这个等价关系成立的原因：上涨的每个相邻差都可以独立
> 捕获，连加后恰好望远镜相消为整段利润。

The numeric identity is calculated and shown before the general principle, so the reader can verify it by hand before being asked to accept the conclusion. See `problems/lc-122-best-time-to-buy-and-sell-stock-ii/explain.md`.

## Trace and visual fit

- Does every frame correspond to a real algorithm state?
- Does each frame's `activeLine` point to the source line that actually represents this step, rather than mechanically staying on a loop header?
- Do pointer positions and highlights reveal the important choice without relying on hidden data?
- If state is expressed in notes, are the notes short and deterministic enough to make the state legible?
- If the representation is still unclear, record the limitation rather than adding a component without approval.

## Screenshot and source fidelity

- Is the original-problem section a complete, word-for-word transcription of supplied screenshots, including constraints and examples?
- Is official prose summarized rather than copied at length?
- Is community code independently implemented instead of copied, and is the decision to include it as an independent approach recorded?

## Multi-approach structure

- Does every supplied official and community approach have its own `approaches/<id>/generate_trace.py`, `trace.json`, `meta.json` entry, and `:::viz` insertion point?
- Are the approach players in their corresponding explanation sections and independent of one another?
- Are equivalent supplied implementations still retained as full packages, as required by the input contract?

## Reading quality

- Does the page follow 原题 → 题目拆解与通用切入点 → 官方解法 → 社区解法 → 复杂度对比的 order?
- Are paragraphs short enough for a 780px column?
- Does the Markdown use only supported syntax, `:::viz`, `:::insight`, and `:::pitfall`?
- Do Python and C++ implement the same checked algorithm as the trace generator?

## Zero-basics and ADHD-friendly pacing

- Does each paragraph introduce at most one new idea and use short, direct sentences?
- Is every first-use technical term first explained in ordinary language and tied to a current purpose?
- Before every `5 秒想一想` check, has the reader already received a concrete example and the decision rule?
- Does every check immediately include `直接看答案` and its reason?
- Does each approach close with `现在只需要记住` followed by one actionable sentence?
- Does the explanation state what an easily confused structure is **not**, when that boundary matters for correctness?
- Could a learner resume after losing focus by reading the immediate goal and the current memory sentence, without needing to reconstruct a long paragraph?
- Does a five-second check ask only about a concept that has already completed the knowledge-map and symbol-handoff prerequisites?

## Prerequisite and causal continuity

- Does the page explicitly say what is mainly being tested, what is only a supporting container, and what the learner should learn first?
- Before every symbol or named state, has the reader seen the exact ordinary-language question it answers and a concrete storage example?
- Can every selected value be traced to a named input and index, rather than appearing only as a bare number?
- For each use of “therefore”, “best”, “candidate”, or “add one”, is the comparison or prior result that licenses it written immediately before it?
- Does every base case state the condition, stored value, and reason; and every transition state the previous value, eligibility test, and new value?
