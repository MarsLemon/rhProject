# EVAL 严重度等级标准(本工作区硬约束)

> **参考** `JeremyDev87/codingbuddy` 的 EVAL 严重度体系,本工作区采用同样的 4 级制。
> 用于 Orchestrator 阶段 4 回环验收时判断"能否发布(ship)"。

---

## 🚦 Escape Condition(发布门槛)

```
Critical == 0 AND High == 0  →  Ship ✅
Critical >  0 OR  High >  0  →  Iterate(回阶段 2 / 3 修复)
Iteration >= 3               →  STOP,report remaining issues 上报
```

**3 次迭代仍未通过 → 升级到用户(给资源 / 拍板 / 调整范围),不无限循环。**

---

## 🚨 Critical — 必须修(阻止发布)

立即阻断,任何一项都不行。

| 类别 | 例子 |
|---|---|
| **测试失败** | 已有测试挂了 / 新写测试不过 / 测试被破坏 |
| **构建失败** | tsc / mvn / nx build 报错 / 缺导入 / 语法错 |
| **安全漏洞** | XSS / 注入 / 暴露密钥 / 不安全鉴权 |
| **数据丢失风险** | 破坏性操作无确认 / 缺校验 / 删表前没备份 |
| **运行崩溃** | 空指针 / 未捕获异常在关键路径 |
| **核心需求缺失** | 验收标准中"必须有"的未实现 |

**动作**:立即回阶段 2 / 3 修复,优先于其他工作。

---

## ⚠️ High — 必须修(阻止发布)

导致功能错误或质量严重下降。

| 类别 | 例子 |
|---|---|
| **功能错误** | 行为不符合验收标准 |
| **验收标准缺失** | 任务里的 checkbox 项未实现 |
| **回归** | 已有功能被破坏 |
| **类型错误** | TypeScript `any` 滥用 / 缺类型定义 |
| **缺错误处理** | 关键逻辑的边界 case 未处理 |
| **测试覆盖空缺** | 核心逻辑路径无测试 |

**动作**:回阶段 2 修复后再 ship。

---

## 📝 Medium — 在 PR 记录(不阻断发布)

真实但可接受,合并后清理。

| 类别 | 例子 |
|---|---|
| **代码风格** | 命名不一致 / 格式问题 |
| **边界 case 测试缺失** | 非关键路径无测试 |
| **文档空缺** | 缺 / 不全的 inline 注释 |
| **类型略松** | 正确但不够精确的类型注解 |
| **性能** | 次优但能用的实现 |
| **可访问性** | 次要的 a11y 改进空间 |

**动作**:在 PR 描述"已知问题 / 后续"段记录,**可 ship**。

---

## 💡 Low — 可选(不阻断发布)

可做可不做的改进。

| 类别 | 例子 |
|---|---|
| **重构机会** | 能 work 但可更清晰 |
| **增强日志** | 详细日志 |
| **扩展测试** | 额外边界 case |
| **文档增强** | 更多例子 / 更好格式 |
| **微优化** | 性能可更优但影响可忽略 |

**动作**:可选记录在 PR。可 ship。

---

## ✅ EVAL Checklist(检查顺序)

按以下顺序检查(严重度高 → 低):

```
1. TESTS(对应 Critical)
   - [ ] 已有测试全过
   - [ ] 新测试覆盖验收标准
   - [ ] 无跳过 / 注释掉的测试

2. BUILD(对应 Critical)
   - [ ] tsc / mvn / nx build 通过
   - [ ] 修改文件无 lint 错误
   - [ ] 无循环依赖

3. ACCEPTANCE CRITERIA(对应 High)
   - [ ] 任务的 checkbox 全部实现
   - [ ] 行为符合任务描述
   - [ ] 边界 case 已考虑

4. SECURITY(对应 High)
   - [ ] 无密钥在代码里
   - [ ] 输入校验
   - [ ] 无注入漏洞

5. COMPATIBILITY(对应 High)
   - [ ] 向后兼容(或提供迁移)
   - [ ] 公开 API 无破坏性变更
   - [ ] 已有集成不受影响

6. CODE QUALITY(对应 Medium)
   - [ ] 无 TypeScript `any` 滥用
   - [ ] 纯函数 / 副作用函数分离
   - [ ] SOLID 原则
   - [ ] DRY(不重复)
```

---

## 🌳 严重度决策树

```
测试套件是否坏?
├── YES → Critical
└── NO
    构建是否过?
    ├── NO → Critical
    └── YES
        行为是否符合验收标准?
        ├── NO → High
        └── YES
            验收标准 checkbox 全打勾?
            ├── NO → High
            └── YES
                代码质量有顾虑?
                ├── YES → Medium(记入 PR)
                └── NO
                    有小改进空间?
                    ├── YES → Low(可选记入 PR)
                    └── NO → Ship! 🚀
```

---

## 📊 EVAL 报告格式

```markdown
## EVAL Results — Iteration N

### Summary
- Critical: X
- High: Y
- Medium: Z
- Low: W

### Findings

#### Critical
1. [C1] ...
2. [C2] ...

#### High
1. [H1] ...
2. [H2] ...

#### Medium
1. [M1] ...
2. [M2] ...

#### Low
1. [L1] ...

### Decision
- [ ] Ship: Critical=0, High=0 ✅
- [ ] Iterate: Fix C1, C2 → 回阶段 2
- [ ] Escalate: 3 次迭代仍未过 → 上报用户
```

---

## 🎯 何时调 specialist

EVAL 阶段按问题复杂度分派 specialist:

| 复杂度 | 推荐 specialist |
|---|---|
| 简单(单文件 / 单函数) | 自评足够,不调 |
| 中等(多文件 / 跨模块) | code-quality-specialist |
| 复杂(架构变更 / 跨主域) | code-quality + test-strategy + security |

**specialist 调用**:
- 在 EVAL 阶段由 Orchestrator 派
- 每个 specialist 输出"严重度等级 + 发现列表 + 建议"
- Orchestrator 综合所有 specialist 输出,产出最终 EVAL 报告
