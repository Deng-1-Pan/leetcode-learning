#!/usr/bin/env python3
"""Execute LC 80 official pop/delete approach and serialize its real mutations."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

NUMS = [0, 0, 1, 1, 1, 1, 2, 3, 3]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
def removeDuplicates(nums: list[int]) -> int:
    if not nums:
        return 0

    i = 1
    count = 1
    while i < len(nums):
        if nums[i] == nums[i - 1]:
            count += 1
            if count > 2:
                nums.pop(i)
                count -= 1
                continue
        else:
            count = 1
        i += 1

    return len(nums)"""

CPP_CODE = """\
int removeDuplicates(vector<int>& nums) {
    if (nums.empty()) return 0;

    int i = 1, count = 1;
    while (i < static_cast<int>(nums.size())) {
        if (nums[i] == nums[i - 1]) {
            ++count;
            if (count > 2) {
                nums.erase(nums.begin() + i);
                --count;
                continue;
            }
        } else {
            count = 1;
        }
        ++i;
    }

    return static_cast<int>(nums.size());
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
    """Run the displayed official pop/delete algorithm, recording every decision."""
    frames: list[dict] = [{
        "step": 0,
        "description": "从下标 1 开始扫描；当前值已出现 1 次",
        "pointers": {"i": 1},
        "highlightIndices": [0, 1],
        "array": nums.copy(),
        "note": "count = 1；相同值连续出现，因此只需与前一个位置比较。",
        "activeLine": active_line("i = 1", "int i = 1, count = 1"),
    }]
    if not nums:
        return 0, frames

    i = 1
    count = 1
    while i < len(nums):
        value = nums[i]
        if value == nums[i - 1]:
            count += 1
            if count > 2:
                removed = nums.pop(i)
                count -= 1
                frames.append({
                    "step": len(frames),
                    "description": f"i={i}，第 3 次出现 {removed}：删除 nums[{i}]",
                    "pointers": {"i": min(i, len(nums) - 1)},
                    "highlightIndices": [min(i, len(nums) - 1)],
                    "array": nums.copy(),
                    "note": f"删除后右侧元素整体左移；count 回到 {count}，i 保持不动以检查刚移来的元素。",
                    "activeLine": active_line("nums.pop(i)", "nums.erase(nums.begin() + i)"),
                })
                continue
        else:
            count = 1

        line = active_line("i += 1", "++i")
        frames.append({
            "step": len(frames),
            "description": f"i={i}，保留值 {value}，继续扫描",
            "pointers": {"i": i},
            "highlightIndices": sorted({i - 1, i}),
            "array": nums.copy(),
            "note": f"count = {count} <= 2；当前数组前缀仍然合法。",
            "activeLine": line,
        })
        i += 1

    return len(nums), frames


def generate() -> dict:
    nums = NUMS.copy()
    length, frames = remove_duplicates_with_trace(nums)
    return {
        "problemId": "lc-80-remove-duplicates-sorted-array-ii",
        "approachId": "official-pop-delete",
        "algorithm": "sorted-count-pop-delete",
        "input": {"nums": NUMS, "maxOccurrences": 2},
        "result": {"length": length, "nums": nums},
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
