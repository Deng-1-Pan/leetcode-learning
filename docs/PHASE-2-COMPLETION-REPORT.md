# Phase 2 完成报告：讲解生成 Skill

## 结论

Phase 2 已完成。仓库内新增可版本化的 [LeetCode 讲解生成 Skill](../skills/leetcode-explanation-generator/SKILL.md)，并以 LC 80、LC 122 的真实算法执行包进行了两轮验证和一次基于浏览器观察的迭代。

`docs/ENGINE-SPEC.md` 已明确 Markdown 安全子集：一级至三级标题、段落、有序/无序列表、加粗、行内代码、围栏代码块和 `https` 链接；原始 HTML 会被转义。因此本阶段不需要修改引擎契约。

## Skill 交付物

- `skills/leetcode-explanation-generator/SKILL.md`：输入契约、可视化决策、八步教学结构、生成流程与浏览器验收门禁。
- `skills/leetcode-explanation-generator/references/teaching-rubric.md`：针对暴力推导、优化桥梁、轨迹可读性和 780px 内容列可读性的审阅清单。
- Skill 结构校验通过：`quick_validate.py`。

Skill 明确要求先读取 `docs/ENGINE-SPEC.md` 和 `engine/viz-registry.js`，并禁止未经讨论新增引擎组件。

## LC 80：Remove Duplicates from Sorted Array II

目录：[problems/lc-80-remove-duplicates-sorted-array-ii](../problems/lc-80-remove-duplicates-sorted-array-ii/)。

| 检查项 | 结果 |
| --- | --- |
| 具体困惑点 | “完全想不出暴力解法从哪里下手”已在第 1 节直接回应。 |
| 暴力推导 | 通过：从“如何原地删除”出发，推到遇到第三次出现就左移后续元素的扫描+搬移法；没有直接宣布结论。 |
| 暴力代价 | 通过：用 `[1,1,1,1,1,2]` 说明两次删除合计 5 次搬移，并给出 `O(n²)` 直觉。 |
| 关键洞察 | 通过：从反复搬动有效前缀的浪费，推到已排序数组只需比较 `write - 2`。 |
| 轨迹 | 通过：`generate_trace.py` 实际执行读写双指针，生成 9 帧；结果为长度 `7`、前缀 `[0,0,1,1,2,3,3]`。 |
| 可视化选择 | 通过：复用 `array-pointers`，`read`/`write` 指针、有效前缀窗口和 note 直接解释“写入/跳过”。 |
| 浏览器实测 | 通过：无 console error/warning；逐帧检查到第三个 `1` 时 `read` 前进、`write` 不扩张；首尾禁用、上一步、滑杆、播放到末帧自动停止、重置、Markdown 和 Python/C++ 切换均正常。 |
| 代码一致性 | 通过：页面中 Python 与 C++ 均实际运行，和轨迹结果一致。 |

## LC 122：Best Time to Buy and Sell Stock II

目录：[problems/lc-122-best-time-to-buy-and-sell-stock-ii](../problems/lc-122-best-time-to-buy-and-sell-stock-ii/)。

| 检查项 | 结果 |
| --- | --- |
| 具体困惑点 | “不知道为什么可以用贪心，感觉应该要枚举买卖点”已在第 1 节直接回应。 |
| 暴力推导 | 通过：从先选一笔买卖、再枚举后续交易，推到递归枚举全部合法交易序列的分支爆炸。 |
| 暴力代价 | 通过：用 `[1,2,3,4]` 展示同一上涨区间被不同交易切分反复枚举。 |
| 关键洞察 | 通过：以 `4-1=(2-1)+(3-2)+(4-3)` 验证连续上涨区间可拆成相邻正差，说明这来自暴力法的重复切分。 |
| 轨迹 | 通过：`generate_trace.py` 实际执行相邻正差贪心，生成 6 帧；`[7,1,5,3,6,4]` 的利润为 `7`。 |
| 可视化决策 | 通过复用 `array-pointers`：只显示 `day`，高亮 `day-1/day`，note 显示差值、捕获/跳过和累计利润。没有新增组件。 |
| 浏览器实测 | 通过：无 console error/warning；第 2 帧清楚显示 `5-1=4` 被捕获；逐帧、首尾禁用、回退、滑杆、播放自动停止、重置、Markdown 和 Python/C++ 切换均正常。 |
| 代码一致性 | 通过：页面中 Python 与 C++ 均实际运行，结果均为 `7`。 |

### 122 的组件判断

现有组件对本题足够：核心教学动作是“结算一对相邻日”，数组位置和这对位置的高亮能画出来；剩下的累计利润是一个标量，用短 note 表示不会遮蔽决策。若未来需要同时强调多段持仓区间或展示交易账本，再讨论轻量状态徽章；当前没有必要扩展引擎。

## 测试中发现的修复与 Skill 迭代

发现：LC 80 的初始帧中 `read` 和 `write` 同格，原有标签最大宽度会将 `read · write` 截断。

修复：[styles/problem-page.css](../styles/problem-page.css) 现在给数组边缘预留标签空间，并使同格指针标签居中、完整显示；相应的布局回归测试已补上。该改动属于已存在组件的渲染缺陷修复，不是新增可视化设计。

这次真实验证也反哺了 Skill：

1. 明确“累计利润”等标量状态在位置高亮能表达状态转移时，可由 `note` 承载。
2. 浏览器验收新增“可能同格的多个指针标签不得截断或重叠”。

## 验证记录

- `python3 generate_trace.py --check`：LC 80、LC 122 均通过。
- `node scripts/build-index.mjs`：通过，索引共 4 道题。
- `node --test`：14/14 通过。
- Skill 结构验证：通过。
- 本地浏览器：两页均实际打开并验证交互与视觉帧；无 console error/warning。

## 评估结论

两道题的第 1 步均以“从没有思路时的自然尝试”开场，并在叙述中抵达暴力算法；第 3 步都把优化理由连接回暴力法的重复劳动。正文以短段落和小例子组织，适合 780px 内容列。当前没有需要升级到设计讨论的组件缺口；LC 122 的单指针表示已经达到本阶段的讲解目标。
