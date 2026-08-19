#!/usr/bin/env python3
"""Execute LC 300 bottom-up DP as presented by the community source."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
def lengthOfLIS(nums: list[int]) -> int:
    f = [1] * len(nums)
    for i, x in enumerate(nums):
        for j, y in enumerate(nums[:i]):
            if y < x:
                f[i] = max(f[i], f[j] + 1)
    return max(f)"""

CPP_CODE = """\
int lengthOfLIS(const vector<int>& nums) {
    vector<int> f(nums.size(), 1);
    for (int i = 0; i < static_cast<int>(nums.size()); ++i)
        for (int j = 0; j < i; ++j) if (nums[j] < nums[i]) f[i] = max(f[i], f[j] + 1);
    return *max_element(f.begin(), f.end());
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
    dp = [1] * len(NUMS)
    frames = [{"step": 0, "description": "初始化 f 数组", "grid": [NUMS.copy(), dp.copy()], "activeCell": [1, 0], "dependencies": [], "note": "f[i] 表示以 nums[i] 结尾的最长递增子序列长度；每个元素单独成序列，初始为 1。", "activeLine": active_line("f = [1] * len(nums)", "vector<int> f")} ]
    for i, value in enumerate(NUMS[1:], 1):
        usable = []
        for j in range(i):
            if NUMS[j] < value:
                usable.append(j); dp[i] = max(dp[i], dp[j] + 1)
        frames.append({"step": len(frames), "description": f"递推 f[{i}]（nums[{i}] = {value}）", "grid": [NUMS.copy(), dp.copy()], "activeCell": [1, i], "dependencies": [[1, j] for j in usable], "note": f"枚举前面所有位置；可接前项为 {usable}，因此 f[{i}] = {dp[i]}。", "activeLine": active_line("f[i] = max(f[i], f[j] + 1)", "f[i] = max(f[i], f[j] + 1)")})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "community-iterative-dp", "algorithm": "bottom-up-dynamic-programming", "input": {"nums": NUMS}, "result": {"length": max(dp), "dp": dp}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
