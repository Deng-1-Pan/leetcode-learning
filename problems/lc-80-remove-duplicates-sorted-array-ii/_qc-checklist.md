# LC 80 追溯式 QC 清单

> 本清单在题目首次生成后补建；只记录 2026-08-18 能重新取得的证据。

- [ ] **原题截图逐字转录：未能追溯验证。** 本仓库没有保留当时的原题截图，无法把当前 `explain.md` 与原图逐字比对；因此不把它标为已检查。
- [ ] **官方/社区来源与收录决定：未能追溯验证。** 当时使用的题解截图及选择记录未保存在仓库，不能诚实地重建来源筛选过程。
- [x] **真实轨迹仍可复现。** 2026-08-18 在本目录运行 `python3 generate_trace.py --check`，命令以 exit status `0` 结束；已提交的 `trace.json` 没有过期。
- [x] **展示代码与生成算法一致。** 2026-08-18 运行 `node --test`，其中 `LC 80 displayed Python and C++ implementations match the generated trace result` 通过；完整套件为 `25` passed、`0` failed。
- [x] **浏览器播放器实测。** 本地静态服务器打开本页后，点击“下一步”从 `#0` 到 `#1`，点击“上一步”回到 `#0`，滑杆跳到 `#3`，点击“重置”回到 `#0`，再点击“播放”自动停在末帧 `#8`；末帧“下一步”禁用，浏览器 console 无 error/warning。
- [x] **本文件不进入页面。** `docs/ENGINE-SPEC.md` 规定 `_qc-checklist.md` 不由页面或索引读取；本次浏览器页面也只加载 `meta.json`、`explain.md` 与 `trace.json`。
