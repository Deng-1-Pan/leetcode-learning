#!/usr/bin/env python3
"""Generate the demo trace by executing the sorted two-pointer algorithm."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [2, 7, 11, 15]
TARGET = 9
OUTPUT = Path(__file__).with_name("trace.json")


def frame(step: int, left: int, right: int, description: str) -> dict:
    current_sum = NUMS[left] + NUMS[right]
    return {
        "step": step,
        "description": description,
        "pointers": {"left": left, "right": right},
        "highlightIndices": [left, right],
        "array": NUMS,
        "note": f"nums[left] + nums[right] = {NUMS[left]} + {NUMS[right]} = {current_sum}",
    }


def generate() -> dict:
    left, right, step = 0, len(NUMS) - 1, 0
    frames = [frame(step, left, right, "初始化：左右指针分别指向数组两端")]
    while left < right:
        current_sum = NUMS[left] + NUMS[right]
        if current_sum == TARGET:
            step += 1
            frames.append(frame(step, left, right, "找到目标和，返回题目要求的 1-based 下标 [1, 2]"))
            break
        step += 1
        if current_sum < TARGET:
            left += 1
            frames.append(frame(step, left, right, "当前和太小，left 右移以增大和"))
        else:
            right -= 1
            frames.append(frame(step, left, right, "当前和太大，right 左移以减小和"))
    return {"problemId": "demo-two-sum", "algorithm": "sorted-two-pointer", "input": {"nums": NUMS, "target": TARGET}, "frames": frames}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail when the committed JSON differs from generated output")
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
