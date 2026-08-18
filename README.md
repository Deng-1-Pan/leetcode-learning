# LeetCode 动态可视化讲解站

一个可部署至 GitHub Pages 的零构建静态站点：算法执行逻辑在题目包生成轨迹，浏览器只播放帧数据。站点用 Skill 驱动单解法与多解法内容生成，当前发布 `demo-two-sum`、`demo-climbing-stairs`、LC 80、LC 122、LC 300 共 5 道题，并兼容 v1 与 v2 页面格式。

## 本地使用

不需要安装 npm 依赖。生成题目索引：

```sh
node scripts/build-index.mjs
```

需要人工预览时可使用任一静态服务器，例如 `python3 -m http.server`；本次开发没有启动预览服务器。直接双击 HTML 不可行，因为页面通过 `fetch` 读取 JSON/Markdown。

## 新增题目

1. 复制 `problems/_template/`，并把目录名及其中所有 `replace-with-*` 占位值改为实际题目与解法 ID。
2. 用真实的算法执行程序生成 `trace.json`，每次状态变更记录一帧；不要手写推导的帧。
3. 选择已支持的 `vizType`（`array-pointers` 或 `dp-grid`），填写 `meta.json` 与 `explain.md`。
4. 运行 `node scripts/build-index.mjs`，再以静态服务器检查页面。

`docs/ENGINE-SPEC.md` 定义了所有数据字段和组件边界，是后续内容生成器的唯一格式依据。

## 验证

```sh
node --test
python3 problems/demo-two-sum/generate_trace.py --check
node scripts/build-index.mjs
```

## 部署

工作流在 `main` 分支 push 后生成索引，并使用 GitHub 官方 Pages actions 部署。仓库的 **Settings → Pages → Build and deployment** 应选择 **GitHub Actions**。
