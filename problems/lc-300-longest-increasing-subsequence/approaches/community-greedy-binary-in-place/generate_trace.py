#!/usr/bin/env python3
"""Execute the community in-place g-array binary-search algorithm."""
from __future__ import annotations

import argparse
import bisect
import json
from pathlib import Path

INPUT = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
from bisect import bisect_left

def lengthOfLIS(nums: list[int]) -> int:
    ng = 0
    for x in nums:
        j = bisect_left(nums, x, 0, ng)
        nums[j] = x
        if j == ng:
            ng += 1
    return ng"""

CPP_CODE = """\
int lengthOfLIS(vector<int>& nums) {
    int ng = 0;
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        int x = nums[i];
        int j = lower_bound(nums.begin(), nums.begin() + ng, x) - nums.begin();
        nums[j] = x;
        if (j == ng) ++ng;
    }
    return ng;
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
    nums = INPUT.copy(); ng = 0
    frames = [{"step": 0, "description": "把 nums 的前缀视为 g", "array": nums.copy(), "pointers": {"ng": 0}, "highlightIndices": [], "note": "ng = 0；尚无候选。之后 nums[0:ng] 复用为 g，不额外分配数组。", "activeLine": active_line("ng = 0", "int ng = 0")} ]
    for read, x in enumerate(INPUT):
        slot = bisect.bisect_left(nums, x, 0, ng)
        nums[slot] = x
        extended = slot == ng
        if extended: ng += 1
        line = active_line("if j == ng", "if (j == ng)") if extended else active_line("nums[j] = x", "nums[j] = x")
        frames.append({"step": len(frames), "description": f"处理原输入 nums[{read}] = {x}", "array": nums.copy(), "pointers": {"slot": slot, "ng": ng - 1}, "highlightIndices": [slot], "window": {"start": 0, "end": ng - 1}, "note": (f"在有效前缀 [0, {ng - 1}] 中二分定位 {slot}；写回 nums[{slot}] = {x}。" + (" 位置原在末尾，ng 加一。" if extended else " 替换同长度候选的结尾，ng 不变。")), "activeLine": line})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "community-greedy-binary-in-place", "algorithm": "greedy-binary-search-in-place", "input": {"nums": INPUT}, "result": {"length": ng, "prefix": nums[:ng]}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
