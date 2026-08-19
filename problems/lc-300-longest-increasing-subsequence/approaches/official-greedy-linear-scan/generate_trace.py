#!/usr/bin/env python3
"""Execute the official linear-scan tails algorithm for LC 300."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [8, 1, 6, 2, 3, 10]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    tails: list[int] = []
    frames = [{"step": 0, "description": "初始化候选结尾数组 sub", "array": [], "pointers": {}, "highlightIndices": [], "note": "sub[k] 保存长度 k + 1 的候选序列的最小结尾。"}]
    for read, value in enumerate(NUMS):
        slot = 0
        while slot < len(tails) and tails[slot] < value:
            slot += 1
        if slot == len(tails):
            tails.append(value)
            action = f"线性扫描越过所有更小结尾，把 {value} 追加为长度 {len(tails)} 的候选。"
        else:
            old = tails[slot]
            tails[slot] = value
            action = f"线性扫描找到第一个不小于 {value} 的位置 {slot}，以 {value} 替换 {old}。"
        frames.append({"step": len(frames), "description": f"处理 nums[{read}] = {value}", "array": tails.copy(), "pointers": {"slot": slot}, "highlightIndices": [slot], "window": {"start": 0, "end": len(tails) - 1}, "note": f"{action} 当前 sub = {tails}，长度答案暂为 {len(tails)}。"})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "official-greedy-linear-scan", "algorithm": "greedy-tails-linear-scan", "input": {"nums": NUMS}, "result": {"length": len(tails), "tails": tails}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args()
    content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else:
        OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
