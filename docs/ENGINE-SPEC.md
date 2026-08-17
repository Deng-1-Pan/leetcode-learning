# 可视化引擎接口规范

本规范是题目内容包与共享播放器之间的契约。播放器是**纯读取者**：它只选择已生成的帧并通知渲染器，绝不在浏览器里重新执行或推导算法。

## 内容包

每道题位于 `problems/<id>/`。引擎同时支持历史的 v1 单解法格式和当前的 v2 多解法格式；新题目应使用 v2。

```text
problems/<id>/
├── meta.json
├── explain.md
├── index.html
├── _qc-checklist.md              # 仅生成自检，不进入页面渲染
└── approaches/
    └── <approach-id>/
        ├── generate_trace.py
        └── trace.json
```

`_template` 只是一份起点；替换占位 ID 并生成真实轨迹前不能发布。`_qc-checklist.md` 不由任何页面或索引读取。

## `meta.json` v2

```json
{
  "id": "lc-300-longest-increasing-subsequence",
  "title": "Longest Increasing Subsequence",
  "difficulty": "medium",
  "tags": ["动态规划", "贪心", "二分查找"],
  "leetcodeUrl": "https://leetcode.com/problems/longest-increasing-subsequence/",
  "approaches": [
    {
      "id": "official-dp",
      "label": "官方解法：动态规划",
      "sourceType": "official",
      "vizType": "dp-grid",
      "languages": ["python", "cpp"],
      "code": { "python": "...", "cpp": "..." }
    },
    {
      "id": "community-binary-search",
      "label": "社区高赞：贪心 + 二分查找",
      "sourceType": "community",
      "vizType": "array-pointers",
      "languages": ["python", "cpp"],
      "code": { "python": "...", "cpp": "..." }
    }
  ]
}
```

题目共用必填字段为 `id`、`title`、`difficulty`、`tags`、`leetcodeUrl`。v2 的 `approaches` 必须非空，且每项的 `id` 唯一；`id`、`label`、`sourceType`、`vizType`、`languages`、`code` 都是必填字段。`sourceType` 仅可为 `official` 或 `community`；当前注册的 `vizType` 为 `array-pointers`、`dp-grid`。

`code` 的键是语言名、值是展示源码；它必须与该 approach 的真实 `generate_trace.py` 算法等价。页面根据 `sourceType` 自动生成“官方解法”或“社区高赞”徽章，不从 Markdown 接收颜色。

### v1 兼容格式

已发布的单解法页面可继续使用题目层的 `vizType`、`languages` 和可选 `code`，并从 `trace.json` 读取单份轨迹。新页面不要混用两种格式：出现 `approaches` 时，播放器和代码都以每个 approach 的字段为准。

## `trace.json`

v2 的每份轨迹必须由同目录的 `generate_trace.py` 实际执行产生：

```json
{
  "problemId": "lc-300-longest-increasing-subsequence",
  "approachId": "official-dp",
  "algorithm": "quadratic-dp",
  "input": { "nums": [10, 9, 2, 5, 3, 7, 101, 18] },
  "frames": [
    {
      "step": 0,
      "description": "初始化 dp",
      "grid": [1, null, null],
      "activeCell": [0, 0],
      "note": "以 nums[0] 结尾的 LIS 长度为 1"
    }
  ]
}
```

`problemId` 和 `approachId` 必须分别匹配当前页面与目录名。每份已发布轨迹必须有非空 `frames`，每帧来自真实算法状态；`step` 从 `0` 递增，播放器按数组位置播放，不以 `step` 重新排序。

### `array-pointers` 帧字段

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `array` | `unknown[]` | 当前数组快照 |
| `pointers` | `Record<string, number>` | 指针名至数组下标，可包含任意数量 |
| `highlightIndices` | `number[]` | 要突出的数组下标 |
| `window` | `{start: number, end: number}` | 可选连续窗口 |
| `description` / `note` | `string` | 当前动作及补充说明 |

### `dp-grid` 帧字段

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `grid` | `unknown[]` 或 `unknown[][]` | 一维或二维 DP 快照 |
| `activeCell` | `[row, column]` | 可选当前计算单元 |
| `dependencies` | `[row, column][]` | 可选依赖单元 |
| `description` / `note` | `string` | 当前动作及补充说明 |

## 播放器与渲染器

`TracePlayer` 是 `EventTarget`，构造方式为 `new TracePlayer(trace)`。公开只读成员为 `trace`、`currentStep`、`frame`、`isPlaying`；控制方法为：

```js
player.next();
player.prev();
player.goToStep(index);
player.play(speedMs);
player.pause();
player.reset();
```

位置改变时发出 `step-change`，`detail` 为 `{ step, frame }`；播放状态改变时发出 `play-state-change`，`detail` 为 `{ isPlaying }`。首尾移动被安全钳制，播放到最后一帧自动暂停。

每个有效组件导出：

```js
export function mount(container, player) {
  // 只读取 player.frame 并订阅事件。
  return () => {};
}
```

v2 中每个 `:::viz` 插入点会创建一个独立 `TracePlayer` 与完整控件；任意一个播放器的播放、滑杆、重置都不得影响其他播放器。`viz-registry.js` 根据 approach 的 `vizType` 惰性加载渲染器。

## `explain.md` 安全 Markdown

支持一级至三级标题、段落、有序/无序列表、加粗、行内代码、围栏代码块和 `https` 链接。原始 HTML 一律转义。

此外，仅允许以下完整的语义化指令块：

```makefile
:::viz approach="official-dp"
:::

:::insight
这里放关键洞察；颜色由固定样式决定。
:::

:::pitfall
这里放容易踩的坑；颜色由固定样式决定。
:::
```

`:::viz` 必须引用 `meta.approaches` 中唯一的 `id`，其位置就是该 approach 的播放器与代码出现的位置。`:::insight` 和 `:::pitfall` 使用固定语义颜色，不支持自定义颜色。未知或格式不正确的 `:::` 块会作为转义后的代码块原样显示，绝不解释为 HTML。

建议正文依次组织为：原题截图逐字转录、暴力推导与代价、官方解法（洞察、讲解、`:::viz`）、值得独立收录的社区解法（同样结构）、以及复杂度对比。社区方案若只是官方算法的实现变体，则不放入 `approaches`，只写文字变体小节。

## 构建索引

运行 `node scripts/build-index.mjs`。脚本扫描 `problems/*/meta.json`，忽略以下划线开头的目录，按英文标题排序并原子写入根目录 `problems-index.json`。任一 v1/v2 契约字段缺失、重复 approach ID 或未注册的 `vizType` 都会使构建失败，避免部署不完整包。
