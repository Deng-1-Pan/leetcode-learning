# LC300 Single-Step Debug Mode Design

## Goal

Add a line-by-line, interpreter-derived debug view for the LC300 `official-dp` and `community-memoized-dfs` approaches. Each view must work with the existing player controls and Python code-line highlighting while showing captured local variables in a generic visualizer.

## Boundaries

- Add only two pseudo-approaches: `official-dp-debug` and `community-memoized-dfs-debug`.
- Preserve `TracePlayer`, existing visualizers, and all existing approach traces and generators.
- Do not add C++ execution or C++ line highlighting to debug frames.
- Do not alter `skills/leetcode-explanation-generator/SKILL.md`.

## Architecture

`problems/_shared/line_tracer.py` compiles the exact displayed Python snippet with a fixed synthetic filename and uses `sys.settrace` to record `line` and `return` events from any frame compiled from that snippet. Filename matching includes nested closures and recursive frames without recognizing specific syntax or function names. Frames include source line, source-only stack depth, JSON-safe local variables, event kind, and return value when applicable.

Each new `approaches/<id>-debug/generate_trace.py` contains a byte-for-byte Python source copy of its paired normal approach, imports the shared tracer using `Path(__file__).resolve().parents[3] / "_shared"`, traces a deliberately small input, renders one note template per source line, and writes the ordinary per-approach `trace.json`. Its generated trace has `activeLine: {"python": line}`, so the existing player and highlighter require no changes.

The debug pseudo-approaches are ordinary entries in `meta.json`: `sourceType: "debug"`, `sourceApproachId`, `vizType: "variable-watch"`, and `languages: ["python"]`. The normal mounting path fetches their `trace.json` exactly like every other approach.

`engine/components/viz-variable-watch.js` renders each local solely by JavaScript value type: arrays as ordered cells and all other values as JSON-valued chips. It does not interpret variable names or algorithms. The registry gains the `variable-watch` visualizer, while page styles add a neutral debug badge and the variable-watch layout.

## User Experience

The original DP and memoized-DFS explanation sections each gain a short non-heading transition and one debug player. The DP trace uses `[2, 5, 3, 7]`. The DFS trace uses a similarly small input chosen after inspecting the exact closure implementation. Next, previous, slider, and play navigate every captured source event; repeated loop lines and recursive returns visibly update both the active Python line and variable monitor.

## Documentation and Validation

`docs/ENGINE-SPEC.md` will document `debug` source type, optional human-readable `sourceApproachId`, `variable-watch`, and the debug-frame fields `locals`, `depth`, and `event`. It will state that debug frames only highlight Python because only Python was executed.

Tests will first cover the shared tracer, debug trace generation/check mode, metadata and explanation insertions, variable-watch registration/rendering, and build-index acceptance of `debug`. Existing source-copy consistency coverage will extend to the debug generators' Python copies. The final check runs `node --test`, `node scripts/build-index.mjs`, both generators' `--check`, and a real browser walkthrough recorded in LC300's QC checklist.
