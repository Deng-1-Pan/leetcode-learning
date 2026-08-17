# LC 300 生成自检

- [x] 原题标题、描述、三个示例与两条约束已逐字对照用户提供的原题截图转录。
- [x] 官方来源使用用户粘贴的官方编辑题解；正文只转述 DP 推理与复杂度。
- [x] 社区来源为用户给出的高赞帖；仅采用“贪心 + 二分”的算法思路，未复制其代码。
- [x] 选择官方 DP 与社区贪心 + 二分作为独立 approach：后者相对本页选定的官方 DP 路线复杂度从 `O(n^2)` 改进为 `O(n log n)`。
- [x] `official-dp` 与 `community-greedy-binary-search` 都由各自 `generate_trace.py` 真实生成，并以 `--check` 验证。
- [x] Python 与 C++ 展示代码和对应生成器使用同一 DP / lower-bound 算法。
- [x] 两个 `:::viz` 指令各引用一个唯一 approach；浏览器验收待本地静态服务器完成。
- [x] `:::insight` / `:::pitfall` 只使用安全语义块；本文件不被渲染管线或索引读取。
