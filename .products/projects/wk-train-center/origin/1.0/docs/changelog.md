# wk-train-center 产品变更日志

> 状态: 空(等首次产品变更)
> Owner: Wiki 维护 agent

(等待首个 changelog 写入)

### v1.1.0 — 2026-07-08(Phase E e2e 验证)

- 新增决策记录:`docs/decisions/2026-07-08-phase-e-e2e-test.md`(验证 bump-prd-version 链路)
- bump 链路 e2e 验证通过:feat commit → minor bump → tag 创建 → frontmatter 1.0.0 → 1.1.0
- git tag:PRD-wk-train-center-v1.1.0(本地,未推)
- 触发:Phase E 派单(c7c8707)

### v1.0.0 — 2026-07-08(基线)

- PRD 脚手架上线:YAML frontmatter 标准化
- 引入 semver 版本号 + git tag 契约
- 后端 dashboard 解析 frontmatter(`version`/`status`/`lastUpdated`/`tags`)
- conventional commit + commitlint 强约束上线
