# 百炼 / 语音能力迁移说明

## 执行脚本

`bailian_config_migration.sql` 仅在对应 `el_cfg_prop` 行**不存在**时插入占位配置，**不会**覆盖已有真实密钥。

执行前请备份 `el_cfg_prop` 表。

## 迁移后在管理端配置（推荐）

1. **系统配置 → 存储配置**：填写阿里云 OSS（AccessKey、Bucket、Endpoint、角色 ARN 等）
2. **系统配置 → 百炼知识库**：填写 `workspaceId`、`indexId`、`defaultCategoryId`、`roleArn`
3. **系统配置 → 语音能力**：填写 `dashscopeApiKey`（通常与 AI 接入里 `apiKey` 相同），并确认 ASR/TTS 模型与默认音色
4. 若已有 **AI 接入 → 百炼** 且已配置 `apiKey`，脚本会尝试将该 key 复制到 `voice/bailian` 的 `dashscopeApiKey`，避免重复配置 voice 项

## 关于原 application-local.yml 中 wk.bailian

该段已从仓库配置中移除。若原 yaml 中有值，请手工录入管理端（**勿**提交到 Git）。

## 安全提示

- 勿在 SQL 或 Git 中写入真实 AccessKey / Secret / workspace ID
- 生产环境仅通过管理端或密钥管理系统配置
