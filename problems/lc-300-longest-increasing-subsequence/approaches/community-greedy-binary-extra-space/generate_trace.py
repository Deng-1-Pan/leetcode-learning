#!/usr/bin/env python3
"""Execute the community g-array (extra space) binary-search algorithm."""
from __future__ import annotations

import argparse
import bisect
import json
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    g: list[int] = []
    frames = [{"step": 0, "description": "初始化 g", "array": [], "pointers": {}, "highlightIndices": [], "note": "g[k] 是长度 k + 1 的递增子序列可以拥有的最小末尾元素。"}]
    for i, x in enumerate(NUMS):
        slot = bisect.bisect_left(g, x)
        if slot == len(g):
            g.append(x); action = f"x = {x} 大于全部末尾，新增长度 {len(g)} 的候选。"
        else:
            old = g[slot]; g[slot] = x; action = f"用 x = {x} 替换 g[{slot}] = {old}，同长度留下更小末尾。"
        frames.append({"step": len(frames), "description": f"处理 nums[{i}] = {x}", "array": g.copy(), "pointers": {"slot": slot}, "highlightIndices": [slot], "window": {"start": 0, "end": len(g) - 1}, "note": f"{action} g = {g}。"})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "community-greedy-binary-extra-space", "algorithm": "greedy-binary-search-extra-space", "input": {"nums": NUMS}, "result": {"length": len(g), "g": g}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
