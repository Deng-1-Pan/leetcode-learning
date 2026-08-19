# Teaching-quality rubric

Review every generated `explain.md` against this rubric before it is accepted.

## Problem breakdown and generic entry point

- Before any source solution, does the explanation accurately state what the judge checks and which constraints materially shape the solution?
- Does it name and briefly explain the relevant concepts, rather than assuming the reader already recognizes the pattern?
- Does it identify the broader problem pattern and give a reusable first-footing method for this kind of problem?
- Does it directly address the learner's exact confusion without prematurely presenting one of the formal solutions?
- Could a reader use the entry-point method to begin a nearby problem of the same type?

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
