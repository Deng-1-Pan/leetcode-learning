# 可视化引擎接口规范

本规范是题目内容包与共享播放器之间的契约。播放器是**纯读取者**：它只选择一帧并通知渲染器，绝不重新执行或推导算法。

## 内容包

每道题位于 `problems/<id>/`，包含：

```text
meta.json       题目元数据、可视化类型与示例代码
trace.json      由真实算法执行程序生成的状态快照
explain.md      Markdown 讲解文字
index.html      仅负责装配共享 problem-page.js 的小页面
```

`_template` 是可复制的起点；在替换其中的占位 ID 并生成至少一帧真实轨迹之前，不能将它作为题目发布。

## `meta.json`

```json
{
  "id": "demo-two-sum",
  "title": "Two Sum II - Input Array Is Sorted",
  "difficulty": "easy",
  "tags": ["双指针", "数组"],
  "vizType": "array-pointers",
  "leetcodeUrl": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
  "languages": ["python", "cpp"],
  "code": { "python": "...", "cpp": "..." }
}
```

必填字段是 `id`、`title`、`difficulty`、`tags`、`vizType`、`leetcodeUrl` 与 `languages`。`code` 是可选对象，其键是语言名、值是待展示的源码。当前注册的 `vizType` 为：`array-pointers`、`dp-grid`。

## `trace.json`

```json
{
  "problemId": "demo-two-sum",
  "algorithm": "sorted-two-pointer",
  "input": { "nums": [2, 7, 11, 15], "target": 9 },
  "frames": [
    {
      "step": 0,
      "description": "初始化 left=0, right=3",
      "pointers": { "left": 0, "right": 3 },
      "highlightIndices": [0, 3],
      "array": [2, 7, 11, 15],
      "note": "2 + 15 = 17"
    }
  ]
}
```

已发布题目必须有非空 `frames`，且每帧都由运行实际算法的生成程序输出。每一帧的 `step` 应从 `0` 递增；播放器按数组位置播放，不以 `step` 字段重新排序。

### `array-pointers` 帧字段

| 字段 | 类型 | 含义 |
|---|---|---|
| `array` | `unknown[]` | 当前数组快照 |
| `pointers` | `Record<string, number>` | 指针名至数组下标，可包含任意数量 |
| `highlightIndices` | `number[]` | 要突出的数组下标 |
| `window` | `{start: number, end: number}` | 可选的连续窗口范围 |
| `description` / `note` | `string` | 当前动作与补充说明 |

### `dp-grid` 帧字段

| 字段 | 类型 | 含义 |
|---|---|---|
| `grid` | `unknown[]` 或 `unknown[][]` | 一维或二维 DP 快照 |
| `activeCell` | `[row, column]` | 可选的当前计算单元 |
| `dependencies` | `[row, column][]` | 可选的依赖单元 |
| `description` / `note` | `string` | 当前动作与补充说明 |

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

播放位置改变时，它会发出：

```js
new CustomEvent('step-change', { detail: { step, frame } });
```

播放状态改变时发出 `play-state-change`，`detail` 为 `{ isPlaying }`。首尾移动会被安全钳制，播放到最后一帧会自动暂停。

每个有效组件导出：

```js
export function mount(container, player) {
  // 画 player.frame；订阅 step-change；返回 cleanup 函数。
  return () => {};
}
```

渲染器只可读取传入的 `frame` 并订阅事件；不能访问播放器私有状态，也不能在浏览器中补算算法结论。`viz-registry.js` 根据 `meta.vizType` 惰性加载组件。树图、栈队列与回溯树模块在 Phase 1 是仅含接口说明的占位模块。

## `explain.md` 约定

内置转换器支持一级至三级标题、段落、有序/无序列表、加粗、行内代码、围栏代码块及 `https` 链接。它会转义原始 HTML，因此内容生成器不应输出 HTML。代码展示使用 `meta.code`，而不是从 Markdown 中推断语言。

## 构建索引

运行 `node scripts/build-index.mjs`。脚本扫描 `problems/*/meta.json`，忽略以下划线开头的目录，按英文标题排序并原子写入根目录 `problems-index.json`。缺少必填字段或 JSON 损坏会以文件路径失败，避免部署不完整的数据包。
