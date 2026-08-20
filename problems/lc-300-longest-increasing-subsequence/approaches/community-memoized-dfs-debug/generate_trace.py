#!/usr/bin/env python3
"""Generate an interpreter-traced single-step view of LC 300's memoized DFS."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "_shared"))
import line_tracer

NUMS = [2, 5, 3, 7]
OUTPUT = Path(__file__).with_name("trace.json")

PYTHON_CODE = """\
from functools import cache

def lengthOfLIS(nums: list[int]) -> int:
    @cache
    def dfs(i: int) -> int:
        best = 1
        for j in range(i):
            if nums[j] < nums[i]:
                best = max(best, dfs(j) + 1)
        return best
    return max(dfs(i) for i in range(len(nums)))"""


def note_for(step: dict) -> str:
    values = step["locals"]
    line = step["line"]
    if step["event"] == "return":
        result = step.get("returnValue")
        if step["function"] == "dfs":
            return f"dfs({values['i']}) 算完，返回 {result}：以 nums[{values['i']}] 结尾最长有 {result} 项。"
        if step["function"] == "<genexpr>":
            return f"生成器把 dfs 的结果 {result} 交给 max，继续汇总所有结尾位置。"
        return f"外层函数返回 {result}，这就是整个数组的 LIS 长度。"
    if line == 4:
        return "即将给内层 dfs 加缓存：同一个 i 算过后，之后会直接复用答案。"
    if line == 5:
        return "即将定义 dfs(i)：它回答“必须以 nums[i] 结尾时，最长能有多长”。"
    if line == 6:
        i = values["i"]
        return f"进入 dfs({i})，先把只选 nums[{i}] = {values['nums'][i]} 的长度设为 1。"
    if line == 7:
        return f"dfs({values['i']}) 准备从左到右检查所有 j < {values['i']} 的位置。"
    if line == 8:
        i, j = values["i"], values["j"]
        left, current = values["nums"][j], values["nums"][i]
        if left < current:
            return f"nums[{j}] = {left} 小于 nums[{i}] = {current}，可以尝试递归接上。"
        return f"nums[{j}] = {left} 不小于 nums[{i}] = {current}，这一条不能接。"
    if line == 9:
        i, j = values["i"], values["j"]
        return f"即将比较当前 best={values['best']} 与 dfs({j}) + 1；dfs({j}) 若已缓存会直接返回。"
    if line == 10:
        return f"dfs({values['i']}) 的前项检查结束，准备返回 best={values['best']}。"
    if line == 11:
        return "外层函数即将汇总每个结尾位置的 dfs(i)，取其中最大值。"
    return "解释器即将执行这一行。"


def generate() -> dict:
    function = line_tracer.load_function(PYTHON_CODE, "lengthOfLIS")
    steps, result = line_tracer.trace_call(function, (NUMS.copy(),))
    frames = [
        {
            "step": index,
            **step,
            "note": note_for(step),
            "activeLine": {"python": step["line"]},
        }
        for index, step in enumerate(steps)
    ]
    return {
        "problemId": "lc-300-longest-increasing-subsequence",
        "approachId": "community-memoized-dfs-debug",
        "sourceApproachId": "community-memoized-dfs",
        "example": {"nums": NUMS},
        "result": {"length": result},
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
