# 教训：commit message / 代码 / 注释 / 测试 必须四位一体

## 一句话

**任何代码修改，必须同时满足：(1) 代码本身正确 (2) 注释/文档说明正确 (3) commit message 描述准确 (4) 单元测试断言反映真实行为。**任一不一致 = 给未来挖坑。

## 反模式四大类型

### 1. commit message 与代码自相矛盾

```bash
# ❌ commit message 说: "去除对 deleted 字段的过滤"
# 实际代码:
wrapper.lambda().eq(PlanNode::getDeleted, 0);   # ← 仍在过滤!

# 后果: 后续开发者按注释/口述删除 .eq("deleted", 0)
#       → 软删节点被返回 → checkFinished 凑不齐
#       → 全平台培训计划永远无法标记完成
```

### 2. 注释与代码不一致

```java
// ❌ 注释说: "已使用 @TableLogic,无需显式条件"
// 实际: 实体无 @TableLogic 注解,代码却还写 .eq("deleted", 0)
```

### 3. 测试断言被同步删除掩盖回归

```java
// ❌ 之前:assertThat(result).doesNotContain(deletedNode);  // 守住了
// 之后:assertThat(result).contains(deletedNode);  // 测试改了/删了
// 代码:wrapper 没动 → "测试通过"= "回归被认可"
```

### 4. 接口契约改了但文档/前端没改

```java
// 后端 save() 改为返回 String id
// 前端还在按 response.data.title 反向查 id → 失败
// 文档还在写 "save() 返回 void" → 新人按错文档写代码
```

## 正模式：四位一体自检

```bash
# 1. 改代码
git diff src/main/.../FooService.java

# 2. 看 commit message
git log -1 --format=%B

# 3. 看注释是否同步
grep -n "// " src/main/.../FooService.java

# 4. 看测试断言是否反映新行为
git diff src/test/.../FooServiceTest.java

# 四份 diff 必须方向一致: 都在讲同一个故事
```

## 必须做的自检清单

- [ ] commit message 描述与实际 diff 行为一致？
- [ ] 注释中的"已做/未做"标记与代码现状一致？
- [ ] 单元测试断言反映最新行为（不是被"妥协删除"）？
- [ ] API 契约变更时，前端 / 接口文档 / OpenAPI 同步更新？

## 命中历史

- 2026-07-13 [P0-3 / 必修 #1 listAllNonSparringNode commit message 误导](Thinkpad/00-Inbox/claude-find-bug.md) — 注释、commit、测试三处都错了

## 红线

**禁止**：commit message 写"修复 X"但实际 diff 是"删除 X 相关逻辑"

**禁止**：注释写"已处理"但代码无对应处理（注释会过期，删除它或改对）

**禁止**：测试断言与代码行为方向相反（CI 不会报警，但语义错了）

**强制**：每次代码改动前先 grep 旧注释 / 旧测试 / 旧 commit message，确保改动方向对齐