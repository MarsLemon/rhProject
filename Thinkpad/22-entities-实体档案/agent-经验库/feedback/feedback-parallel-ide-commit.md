---
name: feedback-parallel-ide-commit
description: 用户可能通过 Cursor/Qoder 在 Claude 工作期间并行 commit 修复，导致 Claude 的 Edit 变成 no-op；改完代码先 git status 确认再决定是否提交
metadata:
  node_type: memory
  type: feedback
  originSessionId: 371fb4ca-f01f-4e3d-8880-0127e6a876bf
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\feedback-parallel-ide-commit.md
---

**现象:** 2026-06-22 排查百炼 `size too large` 错误时，Claude 读 `BailianSyncJob.java` 后 Edit 添加大小预检查（按类型查表 100MB/20MB/512MB）。但改完 `git status` 显示工作区干净、`git diff` 为空、`mvn compile` 不重编 `yf-module-course` 的 source（缓存命中说明已是最新）。调查发现 commit `ad3d09c`（MarsLemon, 2026-06-22 18:08:12）已包含与 Claude Edit **字节级一致**的修复。Claude 的 Edit 工具因目标内容已等于 HEAD 而被 harness 当作 no-op 跳过。

**Why:** [[CLAUDE.md]] 已声明工作区由 3 个 IDE（Claude / Cursor / Qoder）共享同一文件系统，共享 `.ai-skills-store`。用户（MarsLemon）在每个 IDE 都可能工作；Cursor/Qoder 与 Claude 之间通过共享文件系统实时同步。用户可能在 Claude 读文件 → 写 Edit 的窗口期用 Cursor 提交了相同的修复。

**How to apply:**
- **改完代码不要立刻 commit**，先 `git status --short` 检查工作区。如果 "clean"，先 `git log -1 --oneline` 看 HEAD 是否已包含本应未入库的修改
- Edit 工具报 "updated successfully" 但 `git diff` 为空 = 文件已等于 HEAD，无需重提，也不要再尝试 commit（会得到空 commit）
- `git ls-files "**/Foo.java"` 在父仓库 `/e/rhProject` 查不到 ≠ 该文件未追踪；`wk-train-center-service` 是独立 git 仓库（不是 submodule），要从子目录内部查 `git ls-files --error-unmatch`
- 遇到 `size too large` 类百炼错误，**先 `git log --all --oneline -- <file>` 看 `BailianSyncJob` 历史**，常发现 `refactor(bailian)` / `fix(bailian)` 系列 commit 已尝试修过同类问题
- 同主题文档：[[百炼重复导入问题根因分析与修复]]（y,f-modules/yf-module-course 目录下，2026-06 时已存在）