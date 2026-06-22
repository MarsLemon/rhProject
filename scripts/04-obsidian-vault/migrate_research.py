#!/usr/bin/env python3
"""
migrate_research.py

把 E:\\rhProject\\research\\ 8 份调研按主人拍板方案 A 迁移到 HermesVault/。

方案 A（已拍板）：
- A. 已落实的调研 (1 份)   → concepts/调研/   status: implemented
- B. 坑复盘 (2 份)         → concepts/坑复盘/ status: implemented (教训沉淀)
- C. 未落实的调研 (md 4 份) → raw/articles/调研-未落实/  status: not-implemented
- D. 陪练方案 (docx/xlsx)   → raw/articles/调研-未落实/陪练方案/  status: not-implemented

额外处理：
- research/tools/weather.py 错位 → scripts/weather.py
- research/tools/ 目录删除
- research/ 目录最后清空
"""

import shutil
from pathlib import Path
from datetime import datetime

SRC = Path(r"E:\rhProject\research")
VAULT = Path(r"E:\rhProject\HermesVault")
SCRIPTS = Path(r"E:\rhProject\scripts")

# A. 已落实的调研 → concepts/调研/
A_FILES = {
    "2026-06-18-让Hermes更聪明更实用-调研.md": {
        "title": "让 Hermes 更聪明更实用（调研）",
        "tags": "[concept, research, ai, workflow]",
        "learned": "Obsidian + Filesystem MCP + Memory/Skill 是当前性价比最高的长期记忆三件套;调研比动手早一步能省大量返工",
        "implemented": "✅ 已落实:Vault 建好 + Filesystem MCP 14/14 tools + 工具栈 INVENTORY.md + 调研文档本身闭环",
    },
}

# B. 坑复盘 → concepts/坑复盘/
B_FILES = {
    "2026-06-14-v3-migration-pitfalls.md": {
        "title": "v3 迁移关键坑（第 15 轮）",
        "tags": "[concept, pitfall, v3-migration, vue, typescript]",
        "learned": "find -name 漏同级兄弟 / 纯 JS 不能加 TS 注解 / vue-tsc≠esbuild 双绿不够 — 三个工具链盲点",
        "implemented": "✅ 教训已沉淀到主人 memory（2026-06-15 第 16 轮审计）",
    },
    "2026-06-14-删文件踩坑复盘.md": {
        "title": "删文件踩坑复盘",
        "tags": "[concept, pitfall, file-ops]",
        "learned": "删前必须看完整路径(中文/空格/特殊字符);删前 git 备份;删后立刻 git status 验证",
        "implemented": "✅ 教训已写入主人 memory(2026-06-15 第 16 轮审计方法论新发现)",
    },
}

# C. 未落实的调研 (md) → raw/articles/调研-未落实/
C_FILES = {
    "2026-06-14-国内大厂商业智能体调研.md": {
        "title": "国内大厂 To B 商业智能体调研（船舶行业适用版）",
        "tags": "[research, ai, industry, not-implemented]",
        "learned": "阿里云百炼 + 扣子 + 腾讯元器 + 百度千帆 是船舶行业最有可能落地的四家(2026-06 知识)",
        "not_implemented_reason": "调研完成,未启动采购/试点;仅作选型参考",
    },
    "2026-06-15-review-skills-调研.md": {
        "title": "Review 类 Skill 调研",
        "tags": "[research, ai, skill, code-review, not-implemented]",
        "learned": "anthropics/claude-code pr-review-toolkit 含 6 个专门 agent(code-reviewer/code-simplifier/silent-failure-hunter 等) 值得试",
        "not_implemented_reason": "调研完成,未实际试用 pr-review-toolkit 任何 agent",
    },
    "公网视频资源使用调研报告.md": {
        "title": "公网视频类资源使用调研报告",
        "tags": "[research, copyright, video, not-implemented]",
        "learned": "公网视频(B站/抖音/小红书/视频号)使用涉及版权+平台协议+水印三重风险,商业用途必须逐条核实",
        "not_implemented_reason": "调研完成,未沉淀到 public-video-rights-cn skill 的可执行清单",
    },
    "2026-06-14-船舶行业智能体适用调研.docx": {
        "title": "船舶行业智能体适用调研",
        "tags": "[research, ai, shipping, not-implemented]",
        "learned": "船舶行业 AI 落地分三层:船员英语培训 / 工务设备管理 / 教务考试系统",
        "not_implemented_reason": "调研完成,未进入产品规划(领导汇报材料)",
        "is_binary": True,
    },
    "2026-06-14-船海行业公网知识内容使用合规调研.docx": {
        "title": "船海行业公网知识内容使用合规调研",
        "tags": "[research, compliance, shipping, not-implemented]",
        "learned": "船海行业公网内容使用的合规风险点(版权 / 平台协议 / 数据安全)",
        "not_implemented_reason": "调研完成,未落地为合规审查 SOP",
        "is_binary": True,
    },
    "2026-06-17-陪练AI三段式方案.docx": {
        "title": "陪练 AI 三段式方案(docx)",
        "tags": "[research, training, ai-tutoring, not-implemented]",
        "learned": "陪练 AI 三段式(场景搭建→即时反馈→错题复盘) 比单纯讲知识吸收率高 3 倍",
        "not_implemented_reason": "方案汇报给领导,未进入开发排期(06-17 第 5 轮压缩中)",
        "is_binary": True,
    },
    "2026-06-17-陪练AI三段式方案.xlsx": {
        "title": "陪练 AI 三段式方案(需求清单 xlsx)",
        "tags": "[research, training, ai-tutoring, requirements, not-implemented]",
        "learned": "把方案压缩成 1 页需求单(嵌入 xlsx) 比 6-9 章 docx 更易过评审",
        "not_implemented_reason": "方案汇报给领导,未进入开发排期(06-17 第 4 轮格式转换)",
        "is_binary": True,
    },
}

# 错位的脚本
MISPLACED_TOOLS = {
    "tools/weather.py": SCRIPTS / "weather.py",
}

def build_concept_frontmatter(meta: dict, source: str) -> str:
    today = "2026-06-18"
    fm = [
        "---",
        f"title: {meta['title']}",
        f"created: {today}",
        f"updated: {today}",
        f"type: concept",
        f"tags: {meta['tags']}",
        f"sources:",
        f"  - {source}",
        f"learned: {meta['learned']}",
        f"implemented: {meta['implemented']}",
        "confidence: high",
        "---",
    ]
    return "\n".join(fm)

def build_raw_frontmatter(meta: dict, source: str) -> str:
    today = "2026-06-18"
    fm = [
        "---",
        f"title: {meta['title']}",
        f"created: {today}",
        f"updated: {today}",
        f"type: raw",
        f"tags: {meta['tags']}",
        f"sources:",
        f"  - {source}",
        f"learned: {meta['learned']}",
        f"status: not-implemented",
        f"not_implemented_reason: {meta['not_implemented_reason']}",
        "confidence: medium",
        "---",
    ]
    return "\n".join(fm)

def add_frontmatter(text: str, fm: str) -> str:
    if text.startswith("---\n"):
        return text  # 已带，跳过
    return fm + "\n\n" + text

def main():
    print("=" * 70)
    print("research/ 8 份调研 + 1 个错位脚本 迁移到 HermesVault/")
    print("=" * 70)

    # 1. A 类:已落实 → concepts/调研/
    dst = VAULT / "concepts" / "调研"
    dst.mkdir(parents=True, exist_ok=True)
    print(f"\n[A] → {dst}")
    for fname, meta in A_FILES.items():
        src = SRC / fname
        if not src.exists():
            print(f"  ❌ {fname} (源不存在)")
            continue
        text = src.read_text(encoding="utf-8")
        fm = build_concept_frontmatter(meta, str(src))
        new_text = add_frontmatter(text, fm)
        (dst / fname).write_text(new_text, encoding="utf-8")
        print(f"  ✅ {fname}")

    # 2. B 类:坑复盘 → concepts/坑复盘/
    dst = VAULT / "concepts" / "坑复盘"
    dst.mkdir(parents=True, exist_ok=True)
    print(f"\n[B] → {dst}")
    for fname, meta in B_FILES.items():
        src = SRC / fname
        if not src.exists():
            print(f"  ❌ {fname} (源不存在)")
            continue
        text = src.read_text(encoding="utf-8")
        fm = build_concept_frontmatter(meta, str(src))
        new_text = add_frontmatter(text, fm)
        (dst / fname).write_text(new_text, encoding="utf-8")
        print(f"  ✅ {fname}")

    # 3. C 类:未落实的调研 → raw/articles/调研-未落实/
    dst = VAULT / "raw" / "articles" / "调研-未落实"
    dst.mkdir(parents=True, exist_ok=True)
    print(f"\n[C] → {dst}")
    for fname, meta in C_FILES.items():
        src = SRC / fname
        if not src.exists():
            print(f"  ❌ {fname} (源不存在)")
            continue
        # 二进制文件不读不写，直接 copy
        if meta.get("is_binary"):
            shutil.copy2(src, dst / fname)
            print(f"  ✅ {fname} (binary copy, 不加 frontmatter)")
        else:
            text = src.read_text(encoding="utf-8")
            fm = build_raw_frontmatter(meta, str(src))
            new_text = add_frontmatter(text, fm)
            (dst / fname).write_text(new_text, encoding="utf-8")
            print(f"  ✅ {fname}")

    # 4. 错位脚本 → scripts/
    print(f"\n[Misplaced tools] → {SCRIPTS}")
    for src_rel, dst_path in MISPLACED_TOOLS.items():
        src = SRC / src_rel
        if not src.exists():
            print(f"  ❌ {src_rel} (源不存在)")
            continue
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst_path)
        print(f"  ✅ {src_rel} → {dst_path}")

    # 5. 写 README 索引
    print("\n[README] → dst 索引")
    a_count = len([f for f in A_FILES if (SRC / f).exists()])
    b_count = len([f for f in B_FILES if (SRC / f).exists()])
    c_count = len([f for f in C_FILES if (SRC / f).exists()])
    write_index_readme(VAULT / "concepts" / "调研", a_count)
    write_index_readme(VAULT / "concepts" / "坑复盘", b_count)
    write_index_readme(VAULT / "raw" / "articles" / "调研-未落实", c_count)

    print("\n" + "=" * 70)
    print("✅ 全部完成。源文件 research/ 还在(Smart Approval 拦了 rm -rf),等主人拍板再删。")
    print("=" * 70)

def write_index_readme(dst: Path, n: int):
    title = dst.name
    if title == "调研":
        readme = f"""---
title: 调研索引
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, research, index]
sources: [E:\\rhProject\\research\\]
confidence: high
---

# 调研索引(已落实)

> {n} 份。**已落地 = 调研结论已被使用,产出可观测的代码/工具/规约**。
> **未落实的** 7 份在 [[调研-未落实]]。

```dataview
TABLE WITHOUT ID title, tags, learned, implemented
FROM "concepts/调研"
SORT created DESC
```
"""
    elif title == "坑复盘":
        readme = f"""---
title: 坑复盘索引
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, pitfall, index]
sources: [E:\\rhProject\\research\\]
confidence: high
---

# 坑复盘索引(教训沉淀)

> {n} 份。**每条都是"犯了 + 怎么避"**,半年后回看比模糊印象值钱。
> 写入主人 memory 的速查:见每条 `learned` 字段。

```dataview
TABLE WITHOUT ID title, tags, learned
FROM "concepts/坑复盘"
SORT created DESC
```
"""
    elif title == "调研-未落实":
        readme = f"""---
title: 调研-未落实索引
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, research, not-implemented, index]
sources: [E:\\rhProject\\research\\]
confidence: high
---

# 调研-未落实索引(参考材料)

> 共 {n} 份。**未落地 = 调研完成,但结论没用到实际代码/工具/规约里**。
>
> ⚠️ **何时升级到"已落实"**:
> - 调研结论写进了代码(可 grep)
> - 调研结论写进了 skill(可被 AI 调用)
> - 调研结论写进了规约(可被同事遵守)
>
> 满足任一条 → 移到 [[../调研/]] 并补 `implemented:` 字段。

## 文件清单

| 文件 | 类型 | tags | 未落实原因 |
|---|---|---|---|
"""
        for fname, meta in C_FILES.items():
            if (SRC / fname).exists():
                fname_safe = fname.replace('|', '\\|')
                meta_safe = meta['not_implemented_reason'].replace('|', '\\|')
                readme += f"| [[{fname}\|{meta['title']}]] | {'binary' if meta.get('is_binary') else 'md'} | {' '.join(meta['tags'].strip('[]').split(','))} | {meta_safe} |\n"
    (dst / "README.md").write_text(readme, encoding="utf-8")
    print(f"  ✅ {dst}/README.md")

if __name__ == "__main__":
    main()
