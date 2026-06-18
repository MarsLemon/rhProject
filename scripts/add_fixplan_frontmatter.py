#!/usr/bin/env python3
"""
add_fixplan_frontmatter.py

给 E:\rhProject\fix-plans\ 下的所有 .md 一次性加 frontmatter。
按 HermesVault SCHEMA 规约（type: fix-plan + severity + status + learned）。
原地修改原文件前先复制到 _legacy_no_fm/ 备份。

用法：
    python add_fixplan_frontmatter.py
"""

import re
import shutil
from pathlib import Path
from datetime import datetime

SRC_DIR = Path(r"E:\rhProject\fix-plans")
LEGACY_DIR = SRC_DIR / "_legacy_no_fm"

# 已知文件的手工标注（fix 状态、learned 一句话）
# 键 = 文件名，值 = (status, learned, severity, module)
KNOWN = {
    "20260608-code-review-ai-file-list-typeerror.md": (
        "open", "AI 流式回复前端持久化前未做空值检查;处理 SSE chunk 时必须 try/catch", "blocker", "ui"
    ),
    "20260608-code-review-exam-mapper-list-resultmap.md": (
        "open", "MyBatis resultMap 缺列会运行时炸;反向引用 SQL 必须穷举返回字段", "blocker", "backend"
    ),
    "20260608-code-review-notify-scope3-deadcode.md": (
        "fixed", "scope=3 限定 PERSON 计划;写业务代码前先看清枚举的所有取值", "high", "backend"
    ),
    "20260608-code-review-notify-scope3-dup-userids.md": (
        "fixed", "入参 userIds 必须先去重;调用方不可信原则", "high", "ui"
    ),
    "20260608-code-review-plan-dialog-loading-hint.md": (
        "fixed", "加载中文案在切换 plan 时未清空;dialog 状态隔离要彻底", "medium", "ui"
    ),
    "20260608-code-review-plan-dialog-stale-userids.md": (
        "fixed", "dialog 切换 plan 时残留上一份 userIds;onPlanChange 必须 reset", "high", "ui"
    ),
    "20260608-code-review-summary.md": (
        "fixed", "code-review 一次 14 条结论,按 必修/技术债 分类沉淀;问题分桶比逐条修更高效", "meta", "meta"
    ),
    "20260609-data-table-filter-reset-and-default-params.md": (
        "open", "筛选器切换时未重置分页;分页参数和筛选条件必须联动", "medium", "ui"
    ),
    "20260611-plan-notify-dialog-destroy-on-close.md": (
        "fixed", "Element-UI dialog 默认缓存实例;destroy-on-close 防止残留 watcher", "medium", "ui"
    ),
    "20260611-qu-import-template-mismatch.md": (
        "fixed", "Excel 模板列名变化必须同步 DTO @ExcelField;字段严格相等匹配,新模板前要 importDryRun", "high", "backend"
    ),
    "20260615-manual-test-cases.md": (
        "open", "DDL 验证用 SHOW COLUMNS;手动测试清单按 前置/操作/预期 三段写最稳", "meta", "test"
    ),
    "20260615-unlock-flow-required-button-removed-vulns.md": (
        "fixed", "删除 el_training_record.required 字段后,前端解锁按钮的判断要重新走查;字段下线 ≠ 业务下线", "high", "backend"
    ),
    "20260615-verify-test-cases.md": (
        "open", "v3 迁移 6 文件的 lang=ts 验证清单;vue-tsc 跟 esbuild 是不同编译器,双绿不等于运行绿", "meta", "test"
    ),
}

TECH_DEBT = {
    "20260608-code-review-tech-debt.md": (
        "open", "8 条技术债集中在 api/ai/common.js;逻辑过度复杂 + 调试代码长期在线是腐烂温床", "medium", "ui"
    ),
}

def parse_filename(name: str):
    """从文件名解析日期 / 来源 / 主题"""
    m = re.match(r"^(\d{4})(\d{2})(\d{2})-([^-]+)-(.+)\.md$", name)
    if not m:
        return None
    y, mo, d, src, topic = m.groups()
    return {
        "date": f"{y}-{mo}-{d}",
        "source": src,
        "topic": topic,
    }

def title_from_topic(topic: str) -> str:
    """kebab-case → Title Case"""
    return " ".join(w.capitalize() for w in topic.replace("-", " ").split())

def build_frontmatter(meta: dict, status: str, learned: str, severity: str, module: str) -> str:
    fm = [
        "---",
        f"title: {title_from_topic(meta['topic'])}",
        f"created: {meta['date']}",
        f"updated: {meta['date']}",
        "type: fix-plan",
        f"severity: {severity}",
        f"status: {status}",
        f"tags: [fix-plan, {meta['source']}, {module}]",
        f"learned: {learned}",
    ]
    if status == "fixed":
        fm.append("fixed_in: 待主人 commit 后回填")
    if module == "meta":
        fm.append("confidence: high")
    else:
        fm.append("confidence: high")
    fm.append("---")
    return "\n".join(fm)

def process(src: Path, archive: bool = False) -> tuple[bool, str]:
    name = src.name
    if not name.endswith(".md"):
        return False, "skip non-md"

    parsed = parse_filename(name)
    if not parsed:
        return False, "skip bad-name"

    # 查 known
    known = KNOWN.get(name) or TECH_DEBT.get(name)
    if not known:
        return False, "no-known-entry"
    status, learned, severity, module = known

    # 读内容
    text = src.read_text(encoding="utf-8")

    # 已经带 frontmatter 跳过
    if text.startswith("---\n"):
        return False, "already-has-fm"

    # 找第一个 # 标题 → 拿原标题
    m = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    orig_title = m.group(1) if m else title_from_topic(parsed["topic"])

    fm = build_frontmatter(parsed, status, learned, severity, module)
    new_text = fm + "\n\n" + text

    # 备份
    if not LEGACY_DIR.exists():
        LEGACY_DIR.mkdir(parents=True)
    shutil.copy2(src, LEGACY_DIR / name)

    src.write_text(new_text, encoding="utf-8")
    return True, f"{parsed['date']} | {parsed['source']} | {status} | {orig_title[:40]}"

def main():
    print(f"源目录: {SRC_DIR}")
    print(f"备份: {LEGACY_DIR}")
    print("=" * 80)

    # 处理根目录的 .md
    for p in sorted(SRC_DIR.glob("*.md")):
        ok, msg = process(p)
        flag = "✅" if ok else "⏭ "
        print(f"  {flag} {p.name}  →  {msg}")

    # 处理 tech-debt/
    td = SRC_DIR / "tech-debt"
    if td.exists():
        print("---")
        print("tech-debt/:")
        for p in sorted(td.glob("*.md")):
            ok, msg = process(p)
            flag = "✅" if ok else "⏭ "
            print(f"  {flag} {p.name}  →  {msg}")

    print("=" * 80)
    print(f"原文件备份在: {LEGACY_DIR}")

if __name__ == "__main__":
    main()
