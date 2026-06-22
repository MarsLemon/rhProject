# 04-obsidian-vault

Obsidian Vault(`E:\rhProject\HermesVault\`)相关的迁移、frontmatter 工具。

## 文件

| 文件 | 用途 | 状态 | 备注 |
|---|---|---|---|
| `migrate_research.py` | 把 `research/` 8 份调研按方案 A 迁移到 HermesVault | 🟢 | **已拍板执行过**,2026-06-18 |
| `add_fixplan_frontmatter.py` | 给 `fix-plans/*.md` 加 frontmatter(SCHEMA 规约) | 🟢 | 用前会自动备份到 `_legacy_no_fm/` |

## 用法

```bash
# 跑调研迁移(只跑一次,已跑过)
python 04-obsidian-vault/migrate_research.py

# 给 fix-plans 加 frontmatter
python 04-obsidian-vault/add_fixplan_frontmatter.py
```

## 关联

- 数据源:`E:\rhProject\research\`(已迁完,目录保留为参考)
- 目标:`E:\rhProject\HermesVault\`
- SCHEMA 规约见 `HermesVault/SCHEMA.md`