#!/usr/bin/env python3
"""Execute LC 300 bottom-up DP as presented by the community source."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    dp = [1] * len(NUMS)
    frames = [{"step": 0, "description": "初始化 f 数组", "grid": [NUMS.copy(), dp.copy()], "activeCell": [1, 0], "dependencies": [], "note": "f[i] 表示以 nums[i] 结尾的最长递增子序列长度；每个元素单独成序列，初始为 1。"}]
    for i, value in enumerate(NUMS[1:], 1):
        usable = []
        for j in range(i):
            if NUMS[j] < value:
                usable.append(j); dp[i] = max(dp[i], dp[j] + 1)
        frames.append({"step": len(frames), "description": f"递推 f[{i}]（nums[{i}] = {value}）", "grid": [NUMS.copy(), dp.copy()], "activeCell": [1, i], "dependencies": [[1, j] for j in usable], "note": f"枚举前面所有位置；可接前项为 {usable}，因此 f[{i}] = {dp[i]}。"})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "community-iterative-dp", "algorithm": "bottom-up-dynamic-programming", "input": {"nums": NUMS}, "result": {"length": max(dp), "dp": dp}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
