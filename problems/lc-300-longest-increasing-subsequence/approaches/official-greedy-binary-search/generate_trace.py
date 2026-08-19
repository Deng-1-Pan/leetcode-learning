#!/usr/bin/env python3
"""Execute the official binary-search tails algorithm for LC 300."""
from __future__ import annotations

import argparse
import bisect
import json
from pathlib import Path

NUMS = [8, 1, 6, 2, 3, 10]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
from bisect import bisect_left

def lengthOfLIS(nums: list[int]) -> int:
    sub: list[int] = []
    for num in nums:
        slot = bisect_left(sub, num)
        if slot == len(sub):
            sub.append(num)
        else:
            sub[slot] = num
    return len(sub)"""

CPP_CODE = """\
int lengthOfLIS(const vector<int>& nums) {
    vector<int> sub;
    for (int num : nums) {
        auto slot = lower_bound(sub.begin(), sub.end(), num);
        if (slot == sub.end()) sub.push_back(num);
        else *slot = num;
    }
    return static_cast<int>(sub.size());
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
    tails: list[int] = []
    frames = [{"step": 0, "description": "初始化候选结尾数组 sub", "array": [], "pointers": {}, "highlightIndices": [], "note": "候选结尾按升序排列，因此可以二分定位替换位置。", "activeLine": active_line("sub: list[int] = []", "vector<int> sub")}]
    for read, value in enumerate(NUMS):
        slot = bisect.bisect_left(tails, value)
        if slot == len(tails):
            tails.append(value); action = f"二分结果在末尾，追加 {value} 并把最长长度扩展到 {len(tails)}。"; line = active_line("sub.append(num)", "sub.push_back(num)")
        else:
            old = tails[slot]; tails[slot] = value; action = f"二分找到第一个不小于 {value} 的位置 {slot}，用它压低结尾 {old}。"; line = active_line("sub[slot] = num", "*slot = num")
        frames.append({"step": len(frames), "description": f"处理 nums[{read}] = {value}", "array": tails.copy(), "pointers": {"slot": slot}, "highlightIndices": [slot], "window": {"start": 0, "end": len(tails) - 1}, "note": f"{action} 当前 sub = {tails}。", "activeLine": line})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "official-greedy-binary-search", "algorithm": "greedy-tails-binary-search", "input": {"nums": NUMS}, "result": {"length": len(tails), "tails": tails}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
