# 项目规范

## 审计字段自动填充

使用 MyBatis Plus 的 `FillMetaObjectHandler` 实现审计字段自动填充，参考：
`yf-web/src/main/java/com/yf/web/aspect/mybatis/FillMetaObjectHandler.java`

| 字段 | 类型 | 触发时机 | 说明 |
|------|------|----------|------|
| createBy | String | INSERT | 自动填充当前用户ID |
| createTime | LocalDateTime | INSERT | 自动填充当前时间 |
| updateBy | String | UPDATE | 自动填充当前用户ID |
| updateTime | LocalDateTime | UPDATE | 自动填充当前时间 |

**规则：新建表/保存赋值时，优先检查 FillMetaObjectHandler 是否已配置该字段，已配置则不手动赋值。**