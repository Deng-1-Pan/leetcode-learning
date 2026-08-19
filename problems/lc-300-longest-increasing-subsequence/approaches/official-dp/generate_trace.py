#!/usr/bin/env python3
"""Execute LC 300's quadratic DP and serialize one completed state per index."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
def lengthOfLIS(nums: list[int]) -> int:
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)"""

CPP_CODE = """\
int lengthOfLIS(const vector<int>& nums) {
    vector<int> dp(nums.size(), 1);
    for (int i = 1; i < static_cast<int>(nums.size()); ++i)
        for (int j = 0; j < i; ++j)
            if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
    return *max_element(dp.begin(), dp.end());
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


def frame(step: int, dp: list[int], index: int, dependencies: list[int], note: str, active_line_data: dict) -> dict:
    return {
        "step": step,
        "description": f"计算以 nums[{index}] = {NUMS[index]} 结尾的最长递增子序列",
        "grid": [NUMS.copy(), dp.copy()],
        "activeCell": [1, index],
        "dependencies": [[1, previous] for previous in dependencies],
        "note": note,
        "activeLine": active_line_data,
    }


def generate() -> dict:
    dp = [1] * len(NUMS)
    frames = [frame(0, dp, 0, [], "初始化：任何一个数单独都能构成长度为 1 的递增子序列。", active_line("dp = [1] * len(nums)", "vector<int> dp"))]

    for index in range(1, len(NUMS)):
        compatible = []
        for previous in range(index):
            if NUMS[previous] < NUMS[index]:
                compatible.append(previous)
                dp[index] = max(dp[index], dp[previous] + 1)
        if compatible:
            candidates = ", ".join(f"dp[{previous}] + 1 = {dp[previous] + 1}" for previous in compatible)
            note = f"可接在更小的前项 {compatible} 后面，候选为 {candidates}；取最大值 dp[{index}] = {dp[index]}。"
        else:
            note = f"前面没有比 {NUMS[index]} 更小的数，因此 dp[{index}] 保持为 1。"
        frames.append(frame(len(frames), dp, index, compatible, note, active_line("dp[i] = max(dp[i], dp[j] + 1)", "if (nums[j] < nums[i]) dp[i] = max")))

    return {
        "problemId": "lc-300-longest-increasing-subsequence",
        "approachId": "official-dp",
        "algorithm": "quadratic-dynamic-programming",
        "input": {"nums": NUMS},
        "result": {"length": max(dp), "dp": dp},
        "frames": frames,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            raise SystemExit("trace.json is stale; run generate_trace.py")
        return
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Generated {OUTPUT}")


if __name__ == "__main__":
    main()
