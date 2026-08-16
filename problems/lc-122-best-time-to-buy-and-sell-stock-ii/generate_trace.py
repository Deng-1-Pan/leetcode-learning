#!/usr/bin/env python3
"""Execute LC 122's positive-adjacent-difference greedy algorithm."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

PRICES = [7, 1, 5, 3, 6, 4]
OUTPUT = Path(__file__).with_name("trace.json")


def generate() -> dict:
    profit = 0
    frames = [{
        "step": 0,
        "description": "从第 1 天开始，准备比较每一天和前一天的价格",
        "pointers": {"day": 0},
        "highlightIndices": [0],
        "array": PRICES.copy(),
        "note": "累计利润 = 0；还没有相邻价格差可以结算。",
    }]

    for day in range(1, len(PRICES)):
        change = PRICES[day] - PRICES[day - 1]
        if change > 0:
            profit += change
            action = f"上涨 {change}，捕获这段涨幅"
        else:
            action = f"价格没有上涨（变化 {change}），不交易"
        frames.append({
            "step": len(frames),
            "description": f"比较第 {day} 天与第 {day + 1} 天：{action}",
            "pointers": {"day": day},
            "highlightIndices": [day - 1, day],
            "array": PRICES.copy(),
            "window": {"start": day - 1, "end": day},
            "note": f"prices[{day}] - prices[{day - 1}] = {PRICES[day]} - {PRICES[day - 1]} = {change}；累计利润 = {profit}。",
        })

    return {
        "problemId": "lc-122-best-time-to-buy-and-sell-stock-ii",
        "algorithm": "positive-adjacent-differences-greedy",
        "input": {"prices": PRICES},
        "result": {"maxProfit": profit},
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
