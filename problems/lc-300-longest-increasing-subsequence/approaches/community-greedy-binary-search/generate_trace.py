#!/usr/bin/env python3
"""Execute LC 300's greedy lower-bound algorithm and serialize its tails array."""
from __future__ import annotations

import argparse
import bisect
import json
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    tails: list[int] = []
    frames = [{
        "step": 0,
        "description": "初始化候选结尾数组 tails",
        "array": [],
        "pointers": {},
        "highlightIndices": [],
        "note": "tails[k] 记录长度 k + 1 的递增序列目前能拥有的最小结尾。",
    }]

    for read, value in enumerate(NUMS):
        slot = bisect.bisect_left(tails, value)
        if slot == len(tails):
            tails.append(value)
            action = f"{value} 比所有候选结尾都大，追加它并首次得到长度 {len(tails)} 的候选。"
        else:
            replaced = tails[slot]
            tails[slot] = value
            action = f"二分找到第一个不小于 {value} 的位置 {slot}，用 {value} 替换 {replaced}，给未来留出更低的结尾。"
        frames.append({
            "step": len(frames),
            "description": f"处理 nums[{read}] = {value}",
            "array": tails.copy(),
            "pointers": {"slot": slot},
            "highlightIndices": [slot],
            "window": {"start": 0, "end": len(tails) - 1},
            "note": f"{action} 当前 tails = {tails}，当前可达最长长度为 {len(tails)}。",
        })

    return {
        "problemId": "lc-300-longest-increasing-subsequence",
        "approachId": "community-greedy-binary-search",
        "algorithm": "greedy-lower-bound",
        "input": {"nums": NUMS},
        "result": {"length": len(tails), "tails": tails},
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
