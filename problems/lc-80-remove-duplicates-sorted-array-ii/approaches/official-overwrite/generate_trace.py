#!/usr/bin/env python3
"""Execute LC 80 official overwrite algorithm and serialize every decision."""
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

    read = write = 1
    count = 1
    while read < len(nums):
        if nums[read] == nums[read - 1]:
            count += 1
            if count > 2:
                read += 1
                continue
        else:
            count = 1

        nums[write] = nums[read]
        write += 1
        read += 1

    return write"""

CPP_CODE = """\
int removeDuplicates(vector<int>& nums) {
    if (nums.empty()) return 0;

    int read = 1, write = 1, count = 1;
    while (read < static_cast<int>(nums.size())) {
        if (nums[read] == nums[read - 1]) {
            ++count;
            if (count > 2) {
                ++read;
                continue;
            }
        } else {
            count = 1;
        }

        nums[write++] = nums[read++];
    }

    return write;
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
    """Run the displayed official read/write/count algorithm, recording its states."""
    frames: list[dict] = []
    if not nums:
        return 0, frames

    read = write = count = 1
    while read < len(nums):
        value = nums[read]
        if value == nums[read - 1]:
            count += 1
            if count > 2:
                frames.append({
                    "step": len(frames),
                    "description": f"read={read}，值 {value} 第 {count} 次出现：跳过",
                    "pointers": {"read": read, "write": write},
                    "highlightIndices": sorted({read, read - 1}),
                    "array": nums.copy(),
                    "window": {"start": 0, "end": write - 1},
                    "note": f"count = {count} > 2；不写入。有效前缀 nums[0:{write}] = {nums[:write]}。",
                    "activeLine": active_line("read += 1", "++read"),
                })
                read += 1
                continue
        else:
            count = 1

        destination = write
        nums[write] = value
        write += 1
        frames.append({
            "step": len(frames),
            "description": f"read={read}，保留值 {value} 并写入 nums[{destination}]",
            "pointers": {"read": read, "write": destination},
            "highlightIndices": sorted({read, destination}),
            "array": nums.copy(),
            "window": {"start": 0, "end": write - 1},
            "note": f"count = {count} <= 2；有效前缀 nums[0:{write}] = {nums[:write]}。",
            "activeLine": active_line("nums[write] = nums[read]", "nums[write++] = nums[read++]"),
        })
        read += 1

    return write, frames


def generate() -> dict:
    nums = NUMS.copy()
    length, frames = remove_duplicates_with_trace(nums)
    return {
        "problemId": "lc-80-remove-duplicates-sorted-array-ii",
        "approachId": "official-overwrite",
        "algorithm": "sorted-read-write-count-overwrite",
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
