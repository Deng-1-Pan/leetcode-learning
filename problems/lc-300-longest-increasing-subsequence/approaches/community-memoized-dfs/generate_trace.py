#!/usr/bin/env python3
"""Execute LC 300 top-down memoized DFS and serialize completed states."""
from __future__ import annotations

import argparse
import json
from functools import lru_cache
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    dp: list[int | None] = [None] * len(NUMS)
    frames: list[dict] = [{"step": 0, "description": "初始化记忆表", "grid": [NUMS.copy(), dp.copy()], "activeCell": [1, 0], "dependencies": [], "note": "dfs(i) 表示以 nums[i] 结尾的 LIS 长度；尚未求出的状态留空。"}]
    @lru_cache(maxsize=None)
    def dfs(i: int) -> int:
        candidates = [j for j in range(i) if NUMS[j] < NUMS[i]]
        value = 1 + max((dfs(j) for j in candidates), default=0)
        dp[i] = value
        frames.append({"step": len(frames), "description": f"记忆化求出 dfs({i})，即以 {NUMS[i]} 结尾", "grid": [NUMS.copy(), dp.copy()], "activeCell": [1, i], "dependencies": [[1, j] for j in candidates if dp[j] is not None], "note": f"枚举更小前项 {candidates}；最长结果为 {value}。同一 i 以后命中缓存，不会重复计算。"})
        return value
    answer = max(dfs(i) for i in range(len(NUMS)))
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "community-memoized-dfs", "algorithm": "memoized-depth-first-search", "input": {"nums": NUMS}, "result": {"length": answer, "dp": dp}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
