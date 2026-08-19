#!/usr/bin/env python3
"""Execute a tails-plus-predecessor algorithm that reconstructs one LIS."""
from __future__ import annotations

import argparse
import bisect
import json
from pathlib import Path

NUMS = [10, 9, 2, 5, 3, 7, 101, 18]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    tails: list[tuple[int, int]] = []
    previous = [-1] * len(NUMS)
    frames = [{"step": 0, "description": "初始化候选结尾和前驱记录", "array": [], "pointers": {}, "highlightIndices": [], "note": "除了每个长度的最小结尾，还会保存该结尾的原下标，并为每个元素记录前驱。"}]
    for i, x in enumerate(NUMS):
        values = [value for value, _ in tails]
        slot = bisect.bisect_left(values, x)
        if slot > 0: previous[i] = tails[slot - 1][1]
        if slot == len(tails): tails.append((x, i)); action = "追加新的最长长度"
        else: tails[slot] = (x, i); action = "替换同长度的候选结尾"
        frames.append({"step": len(frames), "description": f"处理 nums[{i}] = {x}", "array": [value for value, _ in tails], "pointers": {"slot": slot}, "highlightIndices": [slot], "window": {"start": 0, "end": len(tails) - 1}, "note": f"{action}；previous[{i}] = {previous[i]}。候选结尾为 {[value for value, _ in tails]}。"})
    cursor = tails[-1][1]; sequence: list[int] = []
    while cursor != -1:
        sequence.append(NUMS[cursor])
        frames.append({"step": len(frames), "description": f"从下标 {cursor} 沿前驱回溯", "array": list(reversed(sequence)), "pointers": {"current": len(sequence) - 1}, "highlightIndices": [len(sequence) - 1], "window": {"start": 0, "end": len(sequence) - 1}, "note": f"取到 {NUMS[cursor]}，下一前驱为 {previous[cursor]}。当前回溯片段需反转后才是正向序列。"})
        cursor = previous[cursor]
    sequence.reverse()
    frames.append({"step": len(frames), "description": "完成一条具体的最长递增子序列", "array": sequence.copy(), "pointers": {}, "highlightIndices": list(range(len(sequence))), "window": {"start": 0, "end": len(sequence) - 1}, "note": f"反转回溯结果，得到 LIS = {sequence}。"})
    return {"problemId": "lc-300-longest-increasing-subsequence", "approachId": "community-reconstruct-lis", "algorithm": "binary-search-tails-with-predecessor-reconstruction", "input": {"nums": NUMS}, "result": {"length": len(sequence), "lis": sequence}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args(); content = json.dumps(generate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content: raise SystemExit("trace.json is stale; run generate_trace.py")
    else: OUTPUT.write_text(content, encoding="utf-8"); print(f"Generated {OUTPUT}")


if __name__ == "__main__": main()
