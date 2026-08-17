# Teaching-quality rubric

Review every generated `explain.md` against this rubric before it is accepted.

## Brute-force derivation

- Does the explanation start with a natural action a learner without a solution could attempt?
- Does it show at least one obstacle, failed shortcut, or decision that leads to the brute-force method?
- Does it name the learner's exact confusion and answer it directly?
- Could a reader distinguish the derivation from a sentence that merely announces the brute-force algorithm?

## Optimization bridge

- Is a concrete cost or repetition from the brute method identified?
- Does the text explain how observing that cost produces the key invariant or equivalence?
- Is the small example sufficient to check the claimed equivalence by hand?

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

- Does every independent algorithm have its own `approaches/<id>/generate_trace.py`, `trace.json`, `meta.json` entry, and `:::viz` insertion point?
- Are the approach players in their corresponding explanation sections and independent of one another?
- Is an equivalent community implementation correctly treated as an “实现变体” with no duplicate player?

## Reading quality

- Does the page follow 原题 → 暴力推导 → 官方解法 → 社区解法/实现变体 → 复杂度对比的 order?
- Are paragraphs short enough for a 780px column?
- Does the Markdown use only supported syntax, `:::viz`, `:::insight`, and `:::pitfall`?
- Do Python and C++ implement the same checked algorithm as the trace generator?
