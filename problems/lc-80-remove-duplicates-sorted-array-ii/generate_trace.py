#!/usr/bin/env python3
"""Execute LC 80's read/write-pointer algorithm and serialize its decisions."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [0, 0, 1, 1, 1, 1, 2, 3, 3]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    nums = NUMS.copy()
    frames: list[dict] = []
    write = 0

    for read, value in enumerate(nums):
        if write < 2:
            allowed = True
            reason = "有效区还不足两个元素，当前值一定可以写入"
        else:
            comparison_index = write - 2
            allowed = value != nums[comparison_index]
            relation = "!=" if allowed else "=="
            reason = f"nums[write-2] = nums[{comparison_index}] = {nums[comparison_index]}，{value} {relation} {nums[comparison_index]}"

        if allowed:
            nums[write] = value
            action = f"写入 nums[{write}]，有效前缀长度变为 {write + 1}"
            highlighted = sorted({read, write})
            pointer_write = write
            write += 1
        else:
            action = "跳过：写入会让这个值在有效前缀中出现第三次"
            highlighted = sorted({read, write - 2})
            pointer_write = write - 1

        frames.append({
            "step": len(frames),
            "description": f"read={read}，检查值 {value}：{action}",
            "pointers": {"read": read, "write": pointer_write},
            "highlightIndices": highlighted,
            "array": nums.copy(),
            "window": {"start": 0, "end": max(write - 1, 0)},
            "note": f"{reason}；当前有效前缀为 nums[0:{write}] = {nums[:write]}。",
        })

    return {
        "problemId": "lc-80-remove-duplicates-sorted-array-ii",
        "algorithm": "sorted-read-write-two-pointers",
        "input": {"nums": NUMS, "maxOccurrences": 2},
        "result": {"length": write, "nums": nums[:write]},
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
