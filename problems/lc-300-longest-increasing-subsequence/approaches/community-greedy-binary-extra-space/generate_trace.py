#!/usr/bin/env python3
"""Execute the community g-array (extra space) binary-search algorithm."""
from __future__ import annotations

import argparse
import bisect
import json
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
from bisect import bisect_left

def lengthOfLIS(nums: list[int]) -> int:
    g: list[int] = []
    for x in nums:
        j = bisect_left(g, x)
        if j == len(g):
            g.append(x)
        else:
            g[j] = x
    return len(g)"""

CPP_CODE = """\
int lengthOfLIS(const vector<int>& nums) {
    vector<int> g;
    for (int x : nums) {
        auto j = lower_bound(g.begin(), g.end(), x);
        if (j == g.end()) g.push_back(x);
        else *j = x;
    }
    return static_cast<int>(g.size());
}"""


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


def generate() -> dict:
    g: list[int] = []
    frames = [{"step": 0, "description": "初始化 g", "array": [], "pointers": {}, "highlightIndices": [], "note": "g[k] 是长度 k + 1 的递增子序列可以拥有的最小末尾元素。", "activeLine": active_line("g: list[int] = []", "vector<int> g")}]
    for i, x in enumerate(NUMS):
        slot = bisect.bisect_left(g, x)
        if slot == len(g):
            g.append(x); action = f"x = {x} 大于全部末尾，新增长度 {len(g)} 的候选。"; line = active_line("g.append(x)", "g.push_back(x)")
        else:
            old = g[slot]; g[slot] = x; action = f"用 x = {x} 替换 g[{slot}] = {old}，同长度留下更小末尾。"; line = active_line("g[j] = x", "*j = x")
        frames.append({"step": len(frames), "description": f"处理 nums[{i}] = {x}", "array": g.copy(), "pointers": {"slot": slot}, "highlightIndices": [slot], "window": {"start": 0, "end": len(g) - 1}, "note": f"{action} g = {g}。", "activeLine": line})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "community-greedy-binary-extra-space", "algorithm": "greedy-binary-search-extra-space", "input": {"nums": NUMS}, "result": {"length": len(g), "g": g}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
