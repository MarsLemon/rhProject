# 修复计划目录（fix-plans）

本目录是 **rhProject 项目的代码评审 / 问题收集固定地址**。

## 用途

- 记录 code-review 跑出来的真实 bug / 设计缺陷
- 记录跨域改动留下的技术债（不阻塞合并但需要排期）
- 任何 agent、协作者发现的问题，都按统一命名规范写到本目录

## 命名规范

```
<YYYYMMDD>-<来源>-<主题>.md
```

- `<来源>`：`code-review` / `manual-test` / `prod-incident` / `tech-debt` 等
- `<主题>`：3-5 个词的英文 / 拼音简述

示例：

- `20260608-code-review-notify-scope3.md`
- `20260608-prod-incident-ai-stream-flist.md`
- `20260610-tech-debt-plan-service-bean-mapper.md`

## 文件模板

每个问题文件必须包含：

```markdown
# <一句话标题>

- **发现时间**: YYYY-MM-DD
- **来源**: code-review / 手动测试 / 生产事故 / 技术债
- **关联提交/PR**: （可选，对应 git commit / branch）
- **严重度**: 🟥 阻塞合并 / 🟧 建议合并前修复 / 🟨 排期修复 / 🟦 长期技术债

## 现象

（具体 bug 描述）

## 触发条件

（用户/调用方 输入 → 错误输出）

## 修复建议

（具体的改法，必要时附代码片段）

## 相关文件

- `E:\rhProject\绝对路径\1`
- `E:\rhProject\绝对路径\2`
```

## 状态

每条问题用以下标签追踪：

- `[ ]` 待修复
- `[~]` 修复中
- `[x]` 已修复（请附 commit hash / 工作树变更说明）
- `[skip]` 决定不修（请附原因）

## 入口

每次开新会话跑完 `/code-review`，把 review 结果里"本次改动相关"的部分拆成本目录下的独立 .md 文件；"已有代码约定违反 / 未来扩展隐患"统一归到 `tech-debt/` 子目录。
