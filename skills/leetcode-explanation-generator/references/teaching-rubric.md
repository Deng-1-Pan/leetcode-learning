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

## Reading quality

- Are sections numbered 0 through 7 and complete?
- Are paragraphs short enough for a 780px column?
- Does the Markdown use only engine-supported syntax?
- Do Python and C++ implement the same checked algorithm as the trace generator?
