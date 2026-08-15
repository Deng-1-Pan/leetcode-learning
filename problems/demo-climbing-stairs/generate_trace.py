#!/usr/bin/env python3
"""Execute the one-dimensional Climbing Stairs DP algorithm and dump every state."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

STEPS = 5
OUTPUT = Path(__file__).with_name("trace.json")


def snapshot(step: int, dp: list[int | None], active_index: int, description: str, dependencies: list[list[int]]) -> dict:
    return {
        "step": step,
        "description": description,
        "grid": dp.copy(),
        "activeCell": [0, active_index],
        "dependencies": [[0, dependency] for dependency in dependencies],
        "note": f"dp[{active_index}] = {dp[active_index]}",
    }


def generate() -> dict:
    dp: list[int | None] = [None] * (STEPS + 1)
    dp[0] = 1
    frames = [snapshot(0, dp, 0, "初始化：到达第 0 阶只有一种方式", [])]
    dp[1] = 1
    frames.append(snapshot(1, dp, 1, "初始化：到达第 1 阶只有一种方式", [0]))
    for current_step in range(2, STEPS + 1):
        dp[current_step] = dp[current_step - 1] + dp[current_step - 2]
        frames.append(snapshot(
            current_step,
            dp,
            current_step,
            f"计算第 {current_step} 阶：从前一阶或前两阶走来",
            [current_step - 1, current_step - 2],
        ))
    return {
        "problemId": "demo-climbing-stairs",
        "algorithm": "one-dimensional-dp",
        "input": {"n": STEPS},
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
