#!/usr/bin/env python3
"""Generate an interpreter-traced single-step view of LC 300's DP solution."""
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
def lengthOfLIS(nums: list[int]) -> int:
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)"""


def note_for(step: dict) -> str:
    values = step["locals"]
    line = step["line"]
    if step["event"] == "return":
        return f"函数返回 {step.get('returnValue')}：这就是整个数组的最长递增子序列长度。"
    if line == 2:
        return "即将初始化：每个数自己都能构成长度为 1 的递增子序列。下一步会创建 dp 表。"
    if line == 3:
        if "i" not in values:
            return "dp 表已经初始化，准备开始外层循环，依次确定每个位置作为结尾时的答案。"
        return f"刚完成 i={values['i']} 的检查；外层循环即将继续寻找下一个结尾位置。"
    if line == 4:
        i = values["i"]
        return f"外层循环来到 i={i}（nums[i]={values['nums'][i]}）：现在检查它前面的每个位置。"
    if line == 5:
        i, j = values["i"], values["j"]
        left, current = values["nums"][j], values["nums"][i]
        if left < current:
            return f"{left} 比 {current} 小，可以接在 i={i} 的数前面。"
        return f"{left} 不比 {current} 小，不能组成严格递增关系，跳过。"
    if line == 6:
        i, j = values["i"], values["j"]
        dp = values["dp"]
        return f"确实可以接上：即将把 dp[{i}] 更新为 max(dp[{i}], dp[{j}] + 1) = max({dp[i]}, {dp[j]} + 1)。"
    if line == 7:
        return f"全部位置算完：dp = {values['dp']}，最大值 {max(values['dp'])} 就是答案。"
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
        "approachId": "official-dp-debug",
        "sourceApproachId": "official-dp",
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
