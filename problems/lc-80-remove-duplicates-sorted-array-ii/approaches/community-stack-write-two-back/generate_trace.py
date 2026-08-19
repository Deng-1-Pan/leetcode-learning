#!/usr/bin/env python3
"""Execute the supplied LC 80 community stack-style implementation."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [0, 0, 1, 1, 1, 1, 2, 3, 3]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
def removeDuplicates(nums: list[int]) -> int:
    stack_size = 2
    for i in range(2, len(nums)):
        # 与有效前缀倒数第二个值比较，防止写入第三次。
        if nums[i] != nums[stack_size - 2]:
            nums[stack_size] = nums[i]
            stack_size += 1
    return min(stack_size, len(nums))"""

CPP_CODE = """\
int removeDuplicates(vector<int>& nums) {
    int stackSize = 2;
    for (int i = 2; i < static_cast<int>(nums.size()); ++i) {
        // 与有效前缀倒数第二个值比较，防止写入第三次。
        if (nums[i] != nums[stackSize - 2]) {
            nums[stackSize++] = nums[i];
        }
    }
    return min(stackSize, static_cast<int>(nums.size()));
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
            "activeLine": active_line("return len(nums)", "return min(stackSize"),
        }]

    frames: list[dict] = [{
        "step": 0,
        "description": "先把前两个元素作为栈底保留",
        "pointers": {"i": 1, "stackSize": 1},
        "highlightIndices": [0, 1],
        "array": nums.copy(),
        "window": {"start": 0, "end": 1},
        "note": "stackSize = 2；只要数组长度至少为 2，前两个元素一定合法。",
        "activeLine": active_line("stack_size = 2", "int stackSize = 2"),
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
            line = active_line("nums[stack_size] = nums[i]", "nums[stackSize++] = nums[i]")
        else:
            action = "不入栈：会形成第三次出现"
            highlights = sorted({i, comparison_index})
            pointer_stack = stack_size - 1
            line = active_line("if nums[i] != nums[stack_size - 2]", "if (nums[i] != nums[stackSize - 2])")
        frames.append({
            "step": len(frames),
            "description": f"i={i}，检查值 {value}：{action}",
            "pointers": {"i": i, "stackSize": pointer_stack},
            "highlightIndices": highlights,
            "array": nums.copy(),
            "window": {"start": 0, "end": stack_size - 1},
            "note": f"nums[stackSize-2] = nums[{comparison_index}] = {comparison_value}；{value} {'!=' if allowed else '=='} {comparison_value}，stackSize = {stack_size}。",
            "activeLine": line,
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
