#!/usr/bin/env python3
"""Execute the supplied LC 80 community stack-style implementation."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [0, 0, 1, 1, 1, 1, 2, 3, 3]
OUTPUT = Path(__file__).with_name("trace.json")


def remove_duplicates_with_trace(nums: list[int]) -> tuple[int, list[dict]]:
    """Run the displayed stack-size / write-two-back algorithm exactly."""
    if len(nums) < 2:
        return len(nums), [{
            "step": 0,
            "description": "数组长度不足 2，直接返回原长度",
            "pointers": {"i": 0},
            "highlightIndices": [0] if nums else [],
            "array": nums.copy(),
            "window": {"start": 0, "end": max(0, len(nums) - 1)},
            "note": "前两个元素默认保留；这里没有第二个元素需要检查。",
        }]

    frames: list[dict] = [{
        "step": 0,
        "description": "先把前两个元素作为栈底保留",
        "pointers": {"i": 1, "stackSize": 1},
        "highlightIndices": [0, 1],
        "array": nums.copy(),
        "window": {"start": 0, "end": 1},
        "note": "stackSize = 2；只要数组长度至少为 2，前两个元素一定合法。",
    }]
    stack_size = 2
    for i in range(2, len(nums)):
        value = nums[i]
        comparison_index = stack_size - 2
        comparison_value = nums[comparison_index]
        allowed = value != comparison_value
        if allowed:
            destination = stack_size
            nums[stack_size] = value
            stack_size += 1
            action = f"入栈：写入 nums[{destination}]"
            highlights = sorted({i, comparison_index, destination})
            pointer_stack = destination
        else:
            action = "不入栈：会形成第三次出现"
            highlights = sorted({i, comparison_index})
            pointer_stack = stack_size - 1
        frames.append({
            "step": len(frames),
            "description": f"i={i}，检查值 {value}：{action}",
            "pointers": {"i": i, "stackSize": pointer_stack},
            "highlightIndices": highlights,
            "array": nums.copy(),
            "window": {"start": 0, "end": stack_size - 1},
            "note": f"nums[stackSize-2] = nums[{comparison_index}] = {comparison_value}；{value} {'!=' if allowed else '=='} {comparison_value}，stackSize = {stack_size}。",
        })
    return min(stack_size, len(nums)), frames


def generate() -> dict:
    nums = NUMS.copy()
    length, frames = remove_duplicates_with_trace(nums)
    return {
        "problemId": "lc-80-remove-duplicates-sorted-array-ii",
        "approachId": "community-stack-write-two-back",
        "algorithm": "stack-size-write-two-back",
        "input": {"nums": NUMS, "maxOccurrences": 2},
        "result": {"length": length, "nums": nums[:length]},
        "frames": frames,
    }


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
