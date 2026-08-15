# Phase 1b 完成报告：可视化与部署验收

**完成日期：** 2026-08-16  
**验收范围：** 浏览器实测、`dp-grid` 真实题目包、GitHub Pages 真实部署  
**当前线上版本：** `8e416ca`

## Task A — 列表页与 Two Sum 浏览器实测

本地静态服务器及真实浏览器完成验证；每次页面加载均检查 DevTools Console 的 `error`、`warn` 和 `warning` 记录。

### 列表页

| 检查点 | 结果 | 证据 |
|---|---|---|
| 页面无 Console error / warning | 通过 | 初始加载、搜索与筛选后均无记录 |
| `demo-two-sum` 卡片显示标题、难度、标签 | 通过 | 显示 `Two Sum II - Input Array Is Sorted`、`easy`、`双指针`、`数组` |
| 标题搜索可过滤并清空恢复 | 通过 | `Climbing` 搜索保留一项；键盘清空后恢复完整列表 |
| 难度和标签筛选正确 | 通过 | `easy`、`双指针`、`数组` 均返回匹配卡片 |
| 点击卡片跳转题目页 | 通过 | 跳转至 `problems/demo-two-sum/index.html` |

### Two Sum 页面

| 检查点 | 结果 | 证据 |
|---|---|---|
| 页面无 Console error / warning | 通过 | 本地与线上加载均无错误 |
| 初始帧的数组、`left` / `right`、高亮正确 | 通过 | 初始为 `[2, 7, 11, 15]`，指针在 2 与 15，高亮完整可见 |
| 下一步逐帧高亮连贯、无残留 | 通过 | 步骤 0→1→2→3 的指针位置及高亮随轨迹更新；最终帧禁用下一步 |
| 上一步和首尾禁用状态正确 | 通过 | 第 0 帧禁用上一步；最终帧禁用下一步；回退恢复前一帧 |
| 步骤滑杆跳转正确 | 通过 | 由人工在浏览器中拖动确认，步骤号和指针同步变化 |
| 播放自动结束 | 通过 | 自动到最终帧后停止，播放按钮回到“播放” |
| 重置回第 0 帧 | 通过 | 重置后指针和步骤号恢复初始状态 |
| Markdown 正常渲染 | 通过 | 标题、段落、列表、行内代码、加粗均正常，无转义残留 |
| Python / C++ Tab 与 Prism 高亮 | 通过 | Tab 切换正常；Python 与 C++ 分别产生 Prism token |

## Task B — `dp-grid` 真实验证

新增 `problems/demo-climbing-stairs/`，使用 `generate_trace.py` 实际执行一维 DP 算法（`n = 5`），逐帧生成 `trace.json`；`meta.json` 的 `vizType` 为 `dp-grid`。索引生成后包含 `Climbing Stairs` 与 `Two Sum II` 两道 demo。

| 检查点 | 结果 | 证据 |
|---|---|---|
| 真实算法生成轨迹 | 通过 | `python3 problems/demo-climbing-stairs/generate_trace.py --check` 通过 |
| 当前格高亮 | 通过 | 初始高亮 `dp[0]`；步骤 2 高亮 `dp[2]` |
| 依赖格高亮 | 通过 | 步骤 2 的 `dp[0]` 与 `dp[1]` 作为依赖格高亮 |
| 逐步填格 | 通过 | 从 `[1, 空, …]` 演进到最终 `dp[5] = 8` |
| 浏览器 Console | 通过 | 本地及线上均无错误 |

发现并修复的渲染问题：

1. 未填充格显示为字面量 `null`。根因是组件无条件调用 `String(value)`；现通过 `formatCellValue` 将 `null` / `undefined` 显示为空白，并加回归测试。
2. 数组首个指针 outline 被横向滚动容器裁切。根因是 outline 延伸到容器外、数组行无左右安全间距；现为 `.array-row` 加入 8px 横向留白。线上复验确认 outline 完全位于容器内。
3. GitHub Pages 缓存继续提供旧 CSS。题目页的 `problem-page.css` 现带版本参数，保证最新布局样式被重新请求。

另修复两项在 Task A 中发现的验收缺陷：

- 原生 `<select>` 只监听 `input`，导致难度/标签筛选不更新；现监听 `change`。
- CDN Prism 未在本地稳定加载，且 C++ 缺少 C 语言依赖；现随站点发布固定版本的本地 Prism 核心、Python、C、C++ 组件，并在动态插入代码后显式高亮。

## Task C — 真实 GitHub Pages 部署

| 项目 | 链接 / 状态 |
|---|---|
| GitHub 仓库 | [Deng-1-Pan/leetcode-learning](https://github.com/Deng-1-Pan/leetcode-learning) |
| GitHub Pages | [https://deng-1-pan.github.io/leetcode-learning/](https://deng-1-pan.github.io/leetcode-learning/) |
| 最终部署 workflow | [Run #31915444811](https://github.com/Deng-1-Pan/leetcode-learning/actions/runs/31915444811) — 成功 |
| Pages 构建来源 | GitHub Actions |

首次部署失败是因为新仓库尚未有 Pages site，随后通过 GitHub REST API 创建并设置为 `workflow` 构建来源；后续部署成功。线上复测已确认：列表同时显示两道 demo，搜索/标签筛选、Two Sum 首帧与下一步、Prism 高亮、Climbing Stairs 当前格和依赖格均可正常工作，Console 无错误。

GitHub Actions 对其内部 Node 20→24 迁移给出 action-level deprecation annotation；该提示不影响 build-index、上传或 deploy-pages，最终部署均成功。

## 自动化验证

```text
node --test
10/10 passing

python3 problems/demo-two-sum/generate_trace.py --check
python3 problems/demo-climbing-stairs/generate_trace.py --check
node scripts/build-index.mjs
```

Phase 1 的可见交互、DP 管线与真实部署验收已完成，可进入 Phase 2。
