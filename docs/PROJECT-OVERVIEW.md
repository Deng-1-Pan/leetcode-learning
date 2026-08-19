# 项目总览（写给 AI 会话看的项目地图）

> 本文档的读者是**未来接手这个项目的 AI 会话**（Claude 自己，或被监督执行任务的
> Codex），不是写给项目所有者本人看的。目的是让一个完全没有上下文的新会话读完
> 就能理解"这个项目在干什么、已经走到哪一步、接下来大概会往哪走"，不必重新
> 翻聊天记录或猜测。
>
> 核对基准：commit `652ef8a`（2026-08-17），working tree 干净（只有本地未提交
> 的 `.claude/` 预览配置和 `.codegraph/daemon.pid`，与项目内容无关）。**本文档
> 会过时**——如果这里写的和仓库实际内容冲突，以仓库当前内容为准，并顺手回来
> 更新这份文档。这不是一句场面话：这个项目已经发生过"文档/报告说完成了，但
> 实际没做到"的真实事故（见下方"阶段交付历史"），所以任何关于本文档新鲜度的
> 怀疑都应该被认真对待。

## 项目愿景

个人 LeetCode 难题学习网站，纯前端、零构建、部署在 GitHub Pages
（`https://github.com/Deng-1-Pan/leetcode-learning`）。核心不是文字讲解，
而是**逐步可视化算法执行过程**（数组指针移动、DP 表格填充等），配合"从零到
暴力解法怎么想出来、再到最优解法"的完整推导过程。

内容不是手写的：站点靠一套可复用的 Skill（`skills/leetcode-explanation-generator/`）
生产，输入是题目截图（原题 + 官方题解 + 社区高赞题解）+ 使用者当时具体卡在
哪个点，输出是符合 `docs/ENGINE-SPEC.md` 契约的内容包（`meta.json` +
`explain.md` + 每个解法一份真实执行生成的 `trace.json`）。

## 核心设计原则（贯穿所有阶段，不能被违背）

1. **正确性与展示分离**：所有可视化数据（`trace.json`）必须来自真实执行的
   `generate_trace.py`，不能是 AI 手写/编造的帧数据。`explain.md` 里的
   Python/C++ 展示代码也必须和生成轨迹的真实算法逐字段一致（这条由
   `tests/generated-code-consistency.test.mjs` 自动校验）。
2. **组件复用而非每题定制**：可视化组件按算法模式设计，不按题目定制。目前
   `engine/viz-registry.js` 里**真正注册**的只有两个：`array-pointers`（数组
   指针）、`dp-grid`（DP 网格），5 道已发布题目全部复用这两个组件，没有为
   任何一题单独开发过组件。
3. **零构建工具链**：纯 HTML + 原生 ES Modules JS，没有 npm 依赖、没有
   React/Vue/webpack，`git clone` 后配合任意静态服务器即可跑，保证 GitHub
   Pages 直接托管。
4. **讲解必须是推导过程，不能结论先行**：任何"关键洞察"类内容必须展示
   "一个什么都不知道的人是怎么一步步想到这个技巧的"，不能直接说"这道题用
   XX 方法，因为……"。**这条是历史上反复出问题的地方**——`teaching-rubric.md`
   最早只把这条规则写死在"暴力解法推导"一节，没有推广到官方解法/社区解法
   各自的"关键洞察"小节，导致同一个毛病在多道题目里重复出现。2026-08-17
   已经把规则改成通用要求（见下方"阶段交付历史"最后一条和"当前状态"）。
5. **报告必须附真实证据，不能只写"已验证/已通过"**：这个项目经历过多次
   "报告说完成了，但实际没有推送到远程 / 没有真的打开过浏览器"的真实事故
   （Phase 1 就是原始案例）。现在的要求是：任何验收报告都要附具体证据——
   浏览器实测要写清楚点击了什么、看到了什么变化，不能只写"交互正常"；测试
   要贴真实命令输出，不能写"应该没问题"。

## 仓库结构速查

```
engine/                       共享引擎，所有题目页面复用同一份代码
  player-core.js               TracePlayer：EventTarget 状态机
                                (next/prev/goToStep/play/pause/reset,
                                 发 step-change / play-state-change 事件)
  viz-registry.js               vizType → 组件懒加载映射
                                真正注册的只有 'array-pointers' 和 'dp-grid'
  components/
    viz-array-pointers.js       真实组件，46 行
    viz-dp-grid.js               真实组件，29 行
    viz-backtrack-tree.js       Phase 1 占位符，4 行注释，未实现未注册
    viz-stack-queue.js           同上（栈/队列）
    viz-tree-graph.js            同上（树/图遍历）
  problem-page.js / list-page.js  题目页 / 列表页渲染逻辑
  prism.js / prism-python.js / prism-cpp.js / prism-c.js  代码高亮

problems/<id>/                 每道题一个内容包，字段契约见 docs/ENGINE-SPEC.md
  meta.json                     v1（题目层 vizType）或 v2（approaches 数组）
  explain.md                    正文，仅支持受限 Markdown 子集 + :::viz/:::insight/:::pitfall
  index.html
  _qc-checklist.md              生成自检清单，不进页面渲染（LC 80、LC 122、LC 300 均有）
  approaches/<approach-id>/     仅 v2 使用：各自的 generate_trace.py + trace.json
  _template/                    新题目起点——v2 单 approach 格式

skills/leetcode-explanation-generator/
  SKILL.md                      讲解生成流程契约（输入要求、页面结构、QC 流程）
  references/teaching-rubric.md 验收标准，生成后必须对照检查

scripts/build-index.mjs         扫描 problems/*/meta.json → 生成根目录 problems-index.json
tests/                          14 个测试文件，`node --test` 运行；包含 active-line 源码同步校验
.github/workflows/deploy.yml    push main → node scripts/build-index.mjs → GitHub 官方
                                 Pages actions (configure-pages/upload-pages-artifact/deploy-pages)
docs/ENGINE-SPEC.md              player / 组件 / meta.json / trace.json / explain.md 的
                                 唯一格式依据，改引擎或加新组件前必须先读这份
```

### 已发布题目清单

| id | 难度 | 格式 | vizType(s) | 备注 |
| --- | --- | --- | --- | --- |
| `lc-80-remove-duplicates-sorted-array-ii` | medium | v2 | array-pointers | Phase 2，已补追溯式 `_qc-checklist.md` |
| `lc-122-best-time-to-buy-and-sell-stock-ii` | medium | v1 | array-pointers | Phase 2，已补追溯式 `_qc-checklist.md`；"关键洞察"好范例来源 |
| `lc-300-longest-increasing-subsequence` | medium | v2 | dp-grid（官方）+ array-pointers（社区） | Phase 3，含 `_qc-checklist.md` |

所有 v2 trace 还可携带生成阶段计算的 `activeLine`，让代码面板只读取当前帧的行号并高亮对应 Python/C++ 源码行。

### 关键命令速查

```sh
node scripts/build-index.mjs                              # 生成 problems-index.json
node --test                                                 # 跑全部 24 个 test case
python3 problems/<id>/generate_trace.py --check             # v1 题目校验轨迹
python3 problems/<id>/approaches/<approach-id>/generate_trace.py --check  # v2 题目校验轨迹
python3 -m http.server                                      # 本地预览（页面靠 fetch 读 JSON/Markdown，不能直接双击 HTML）
```

## 阶段交付历史

### Phase 1 — 基础框架（2026-08-15）

commits：`fff8cae` chore: initialize phase 1 plan → `0ec351b` feat: add static
leetcode visualizer foundation → `ace4e21` docs: add phase 1 completion report

搭了引擎核心（`player-core.js` 状态机）、两个真实可视化组件
（array-pointers、dp-grid）、题目列表页、GitHub Actions 部署骨架，用
`demo-two-sum` 验证链路。同一批提交里还建了三个可视化组件的**空占位文件**
（backtrack-tree / stack-queue / tree-graph，各 4 行注释，见上方"仓库结构
速查"），为将来可能用到的算法模式预留了文件名，但从未实现、从未注册。

**Phase 1 报告 `ace4e21` 声称"完成"，但实际从没有打开过浏览器测试**——这是
"报告必须附真实证据"这条原则的真实来源事故。

### Phase 1b — 浏览器实测收尾（2026-08-15 ~ 2026-08-16）

commits：`65f9120` test: close phase 1 visual verification gaps → `b04a325`
fix: enable GitHub Pages deployment → `22164d0` fix: prevent edge pointer
clipping → `8e416ca` fix: version problem page stylesheet → `bbf8b12` docs:
add phase 1b completion report

补了真实浏览器实测、新增 `demo-climbing-stairs` 验证 `dp-grid` 组件、修了
真实浏览器测试中才会暴露的边界指针裁剪和样式版本问题，真实推送远程仓库并
跑通一次线上部署（`.github/workflows/deploy.yml` 里的 GitHub 官方 Pages
actions 流程）。

*精确到 commit 的小提醒*：`65f9120`（补测试 + 加 `demo-climbing-stairs`）
提交信息自称是"close **phase 1** visual verification gaps"，日期也和 Phase 1
的三个提交同一天（08-15）；真正带上"phase 1b"字样、且改部署配置的提交是
第二天（08-16）的那四个。两轮工作在叙事上是连续的一次纠正，这里只是记录
精确的 commit 归属，不影响"Phase 1b"这个整体说法。

### Phase 2 — 讲解 Skill 首版（2026-08-16）

commit：`20dd0f0` feat: add explanation generation skill and validation cases

设计了 `skills/leetcode-explanation-generator/`，核心是页面结构契约：
原题 → 暴力解法推导（必须是从零开始的思考过程叙述，不能直接给结论）→
最优解法讲解 → 代码实现 → 复杂度总结。用 LC 80（Remove Duplicates from
Sorted Array II）和 LC 122（Best Time to Buy and Sell Stock II）两道使用者
本人真实卡住过的题（连暴力解法都想不出来）做测试验证，两题都是 v1
单解法格式。`SKILL.md` 从这一版起就要求生成 `_qc-checklist.md`，但 LC 80
和 LC 122 实际都没有这个文件（见"当前状态"）。

### Phase 3 — 截图输入 + 多解法支持（2026-08-17）

commits：`649e26b` feat: support embedded multi-approach players → `557f4b2`
feat: add LC 300 multi-approach lesson

Skill 输入源从"题目链接 + 困惑点"升级为"截图（原题 + 官方题解 + 社区高赞
题解）+ 困惑点"。页面结构改为 原题 → 暴力解法（纯文字）→ 官方解法（讲解 +
就地可视化 + 代码）→ 社区高赞解法（算法思路不同则同样讲解+可视化+代码；
本质相同则降级为"实现变体"纯文字小节）→ 复杂度对比。引擎升级为支持一题
多个独立可视化播放器（`meta.json` v2 的 `approaches` 数组，每个 approach
各自的 `TracePlayer` 实例，互不干扰，非共享播放器切换数据源）。新增
`:::insight` / `:::pitfall` 语义化高亮块（颜色与内容类型绑定，不接受自定义
颜色）。用 LC 300（官方 DP vs 社区贪心+二分）测试多解法可视化架构，两个
播放器的独立性在浏览器里逐一点击验证过。LC 300 是目前唯一有
`_qc-checklist.md` 的题目。

### Phase 3 后续修正 — 关键洞察推导规则通用化（2026-08-17）

commits：`e501f74` docs: derive key insights before conclusions → `652ef8a`
fix: correct write-2 target in LC 80 insight walkthrough

详见下方"当前状态"——这不是待办事项，是已经完成并推送到 `origin/main` 的
修正，记在这里是为了让阶段历史保持连续、可追溯。

## 当前状态

### "关键洞察结论先行"问题 —— 已解决，不是待办

历史上反复出现的毛病：`explain.md` 的"关键洞察"直接陈述技巧、再解释这个
技巧为什么正确，而不是展示"怎么想到这个技巧"的推导过程。根因是
`teaching-rubric.md` 的反结论先行判据（"能否分辨这是推导还是只是宣布暴力
算法的句子"）原本只写在"暴力解法推导"一节，没有推广成"任何关键洞察小节都
适用"的通用要求。

2026-08-17 的修正（`e501f74` + `652ef8a`）：

- `teaching-rubric.md` 的 `## Optimization bridge` 一节现在明文要求：适用于
  **每一个** `:::insight`，不止暴力→官方这一次桥接，官方解法和社区解法的
  洞察各自独立在管辖范围内；新增了反结论先行的硬判据（"若读者无法分辨这是
  推导还是先给结论再证明，就判定失败"）；嵌入了 LC 122 的
  `4-1=(2-1)+(3-2)+(4-3)` 具体数字演算作为范例。
- `SKILL.md` 的官方解法 / 社区高赞解法两条 bullet 都加上了"必须先从具体
  例子推导出洞察、不能先陈述结论再解释"的明文要求。
- 三处具体内容都已修正并用真实数据核对过：LC 80 的 `write-2` 走位、LC 300
  官方解法"固定最后一个数为什么是唯一有用信息"、LC 300 社区解法"为什么会
  想到维护 `tails` 这个数据结构"。
- 修正过程中发现 Codex 第一版的 LC 80 推导本身有个真实数字错误（声称
  "读到第二个 `2` 时 `write-2` 落在第一个 `2` 上"，实际用代码回放算出来是
  `nums[1]=1`，根本不是 `2`）——已核对并改正，这也是"报告必须附真实证据"
  原则在这个项目里的又一次实际应用。
- 验证链路全部跑过并有实际输出为证：`node --test` 25/25 通过；三个
  `generate_trace.py --check` 全部 exit 0；`node scripts/build-index.mjs`
  成功生成 5 个题目的索引；LC 80 和 LC 300 两个页面浏览器实测 console 无
  报错；LC 300 两个播放器点击"下一步"验证过互相独立（只有被点击的那个前进
  了一帧）。
- 已 commit 并推送到 `origin/main`（`e501f74`, `652ef8a`）。

### 顺带发现、尚未处理的缺口（不在任何已确认任务范围内，仅记录）

1. **三个占位组件文件**：`viz-backtrack-tree.js` / `viz-stack-queue.js` /
   `viz-tree-graph.js` 从 Phase 1 就在仓库里，各 4 行注释，无实现、未在
   `viz-registry.js` 注册。不违反"按需扩展、不预判性开发"的原则（因为没有
   实际代码，等同于没做），但如果未来真的要做这几类可视化，说明当初已经
   预留过文件名，可以直接复用而不必重新决定命名。

这条是本次核查时顺带发现的既有状态，不是这次任务要处理的对象。

## 后续方向

不是确定的任务清单，只给方向感：

Skill 目前仍在打磨阶段，靠少数几道使用者真实卡住过的题反复测试。等 Skill
稳定到不再反复出现同类问题后，项目会从"打磨工具"转向"批量产出内容"——但
现在还没到那一步，现阶段重点仍然是让 Skill 可靠。过程中如果遇到现有可视化
组件覆盖不了的新算法模式（栈队列、树图、回溯等），再讨论是否把上面提到的
占位文件填成真实实现，不要提前预判性地开发用不上的组件。

## 维护提示

这份文档描述的是某个时间点的状态，不会自动跟着仓库更新。如果你（未来的
Claude 或 Codex）在读这份文档时发现和仓库实际内容有出入——尤其是"当前
状态"一节——以仓库实际内容为准，并且请顺手更新这份文档，而不是让下一个
读者重复一遍同样的核实工作。
