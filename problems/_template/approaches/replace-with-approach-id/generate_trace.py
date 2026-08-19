"""
Placeholder only. A real generate_trace.py must execute the genuine algorithm,
write this approach's trace.json from that execution, and support --check to
verify the committed trace has not become stale.
"""

# Keep these character-for-character identical to this approach's
# meta.json code.python/code.cpp values. The source-sync test enforces it.
PYTHON_CODE = """\
# Add solution code that matches this approach's generator"""

CPP_CODE = """\
// Add solution code that matches this approach's generator"""


def line_of(source: str, anchor: str, occurrence: int = 1) -> int:
    """Return the 1-indexed line number for an anchor in displayed source."""
    lines = source.splitlines()
    matches = [index for index, line in enumerate(lines, start=1) if anchor in line]
    if len(matches) < occurrence:
        raise SystemExit(
            f"active-line anchor {anchor!r} (occurrence {occurrence}) not found; "
            f"only {len(matches)} match(es) in source"
        )
    return matches[occurrence - 1]


def active_line(python_anchor: str, cpp_anchor: str, *, python_occurrence: int = 1, cpp_occurrence: int = 1) -> dict:
    return {
        "python": line_of(PYTHON_CODE, python_anchor, python_occurrence),
        "cpp": line_of(CPP_CODE, cpp_anchor, cpp_occurrence),
    }


EXAMPLE_FRAME = {
    # Add this field to every real frame. Choose anchors for the action that
    # frame represents; do not write literal line numbers.
    "activeLine": active_line("# Add solution code", "// Add solution code"),
}
