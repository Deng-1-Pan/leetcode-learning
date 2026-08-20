"""Shared line-by-line execution tracer for debug-mode trace generation.

Used by approaches/<id>/generate_trace.py. Existing generate_trace.py files
remain standalone by design.
"""
from __future__ import annotations

import json
import sys
from typing import Any, Callable

_DEBUG_SOURCE_LABEL = "<debug-trace>"
_JSON_UNSAFE = object()


def _json_snapshot(value: Any) -> Any:
    try:
        return json.loads(json.dumps(value))
    except (TypeError, ValueError):
        return _JSON_UNSAFE


def load_function(code_python: str, function_name: str) -> Callable:
    """Compile displayed code and return a top-level function from it."""
    namespace: dict[str, Any] = {}
    compiled = compile(code_python, _DEBUG_SOURCE_LABEL, "exec")
    exec(compiled, namespace)
    return namespace[function_name]


def _source_depth(frame: Any) -> int:
    depth = 0
    probe = frame
    while probe is not None:
        if probe.f_code.co_filename == _DEBUG_SOURCE_LABEL:
            depth += 1
        probe = probe.f_back
    return depth


def trace_call(func: Callable, args: tuple) -> tuple[list[dict], Any]:
    """Run ``func(*args)`` and capture its source line and return events."""
    steps: list[dict] = []

    def tracer(frame: Any, event: str, arg: Any):
        if frame.f_code.co_filename != _DEBUG_SOURCE_LABEL:
            return None
        if event in ("line", "return"):
            step = {
                "line": frame.f_lineno,
                "depth": _source_depth(frame),
                "event": event,
                "function": frame.f_code.co_name,
                "locals": {
                    name: snapshot
                    for name, value in frame.f_locals.items()
                    if (snapshot := _json_snapshot(value)) is not _JSON_UNSAFE
                },
            }
            return_value = _json_snapshot(arg)
            if event == "return" and return_value is not _JSON_UNSAFE:
                step["returnValue"] = return_value
            steps.append(step)
        return tracer

    previous_tracer = sys.gettrace()
    sys.settrace(tracer)
    try:
        result = func(*args)
    finally:
        sys.settrace(previous_tracer)
    return steps, result
