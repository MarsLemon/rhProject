# Agent 开发指南

## 项目概述

训练中心服务（train-center）是一个基于 Spring Boot 的企业级培训管理平台，采用简化 DDD 三层架构。

---

## 简化 DDD 三层架构规范

### 核心原则

**严格三层：Controller → Service → Repository**

- Controller 是对外接口的唯一入口
- Service 层统一只使用 DTO
- Entity 严格限制在 Repository 内部使用
- 数据转换只有两个入口点

### 层级职责

| 层                   | 包路径          | 使用类型   | 职责                                    |
| -------------------- | --------------- | ---------- | --------------------------------------- |
| **Controller** | `controller/` | VO         | 接收请求、参数校验、调用Service、返回VO |
| **Service**    | `service/`    | DTO        | 业务逻辑、事务控制、调用Repository      |
| **Repository** | `repository/` | Entity/DTO | 数据访问、内部完成Entity↔DTO转换       |

### 数据流

```
前端 → VO → Controller.toDTO() → DTO → Service → Repository → DB
                   ↓                              ↓
                 VO ← Controller.toVO() ← DTO ← Service ← Repository
```

### 转换规则（唯一转换入口）

| 位置                 | 转换          | 说明         |
| -------------------- | ------------- | ------------ |
| **Controller** | VO → DTO     | 入参转换     |
| **Controller** | DTO → VO     | 返回转换     |
| **Repository** | Entity → DTO | 查询结果转换 |
| **Repository** | DTO → Entity | 写入时转换   |

### 目录结构

```
module/
├── controller/
│   ├── XxxController.java
│   └── vo/
│       ├── CreateVO.java
│       ├── UpdateVO.java
│       ├── QueryVO.java
│       └── XxxVO.java
├── service/
│   ├── XxxService.java
│   ├── dto/
│   │   ├── CreateDTO.java
│   │   ├── UpdateDTO.java
│   │   ├── QueryDTO.java
│   │   └── XxxDTO.java
│   └── impl/
│       └── XxxServiceImpl.java
└── repository/
    ├── XxxRepository.java
    ├── entity/
    │   └── XxxEntity.java
    ├── impl/
    │   └── XxxRepositoryImpl.java
    └── mapper/
        └── XxxMapper.java
```

### 命名规范

| 类型         | 后缀           | 示例                         |
| ------------ | -------------- | ---------------------------- |
| 视图对象     | VO             | `TrainingSignInVO`         |
| 数据传输对象 | DTO            | `TrainingSignInDTO`        |
| 数据实体     | Entity         | `TrainingSignInEntity`     |
| 控制器       | Controller     | `TrainingSignInController` |
| 服务接口     | Service        | `XxxService`               |
| 服务实现     | ServiceImpl    | `XxxServiceImpl`           |
| 仓库接口     | Repository     | `XxxRepository`            |
| 仓库实现     | RepositoryImpl | `XxxRepositoryImpl`        |

### 包路径

| 包     | 路径                  |
| ------ | --------------------- |
| VO     | `controller.vo`     |
| DTO    | `service.dto`       |
| Entity | `repository.entity` |
| Mapper | `repository.mapper` |

---

## 规则约束

### 1. Entity 严格限制在 Repository 内

```java
// Service层 - ❌ 禁止创建Entity
public void create(CreateDTO dto) {
    TrainingSignInEntity entity = new TrainingSignInEntity();  // 禁止
}

// Service层 - ✅ 传DTO给Repository
public void create(CreateDTO dto) {
    repository.create(dto);  // 正确
}
```

### 2. Service 只使用 DTO

```java
// Service层 - ❌ 禁止使用Entity
public void doSign(TrainingSignInEntity entity) {  // 禁止

// Service层 - ✅ 使用DTO
public void doSign(DoSignDTO dto) {
```

### 3. Controller 只使用 VO

```java
// Controller - ❌ 禁止直接使用DTO
public ApiRest<Void> create(@RequestBody TrainingSignInDTO dto) {  // 禁止

// Controller - ✅ 使用VO
public ApiRest<Void> create(@RequestBody CreateVO vo) {
    DoSignDTO dto = toDoSignDTO(vo);  // Controller层转换
```

### 4. 转换位置固定

```java
// Controller层 - VO ↔ DTO 转换
private DoSignDTO toDoSignDTO(DoSignVO vo) { ... }
private TrainingSignInVO toSignInVO(TrainingSignInDTO dto) { ... }

// RepositoryImpl层 - Entity ↔ DTO 转换
private XxxEntity toEntity(CreateDTO dto) { ... }
private XxxDTO toDTO(XxxEntity entity) { ... }
```

### 5. 所有外部调用必须走 Controller

```java
// Job/定时任务 - ❌ 禁止直接访问Mapper
private final XxxMapper mapper;  // 禁止

// Job/定时任务 - ✅ 通过Repository
private final XxxRepository repository;
```

---

## 开发流程

1. **确定模块结构**：按照上述目录结构创建文件
2. **先写 Entity**：在 `repository/entity/` 下创建数据库表对应的实体
3. **再写 Mapper**：在 `repository/mapper/` 下创建 MyBatis Mapper 接口
4. **然后写 Repository**：定义数据访问接口，内部完成 Entity↔DTO 转换
5. **接着写 Service**：业务逻辑，只使用 DTO
6. **最后写 Controller**：入口，只使用 VO，内部完成 VO↔DTO 转换

---

## 参考示例

参考 `yf-module-training-sign-in` 模块，该模块完整实现了简化 DDD 三层架构。

```
training_sign_in/
├── controller/
│   ├── TrainingSignInController.java
│   └── vo/
│       ├── DoSignVO.java
│       ├── TrainingSignInConfigVO.java
│       ├── TrainingSignInRecordVO.java
│       ├── TrainingSignInVO.java
│       └── UpdateConfigVO.java
├── service/
│   ├── TrainingSignInService.java
│   ├── dto/
│   │   ├── CreateDTO.java
│   │   ├── DoSignDTO.java
│   │   ├── QueryDTO.java
│   │   ├── TrainingSignInConfigDTO.java
│   │   ├── TrainingSignInDTO.java
│   │   ├── TrainingSignInRecordDTO.java
│   │   └── UpdateConfigDTO.java
│   └── impl/
│       └── TrainingSignInServiceImpl.java
└── repository/
    ├── TrainingSignInRepository.java
    ├── entity/
    │   ├── TrainingSignInConfigEntity.java
    │   ├── TrainingSignInEntity.java
    │   └── TrainingSignInRecordEntity.java
    ├── impl/
    │   └── TrainingSignInRepositoryImpl.java
    └── mapper/
        ├── TrainingSignInConfigMapper.java
        ├── TrainingSignInMapper.java
        └── TrainingSignInRecordMapper.java
```

---

## SQL 资产治理规范

> **完整规范**：`.products/projects/wk-train-center-service/db/GOVERNANCE.md`
> **索引导航**：`.products/projects/wk-train-center-service/db/README.md`
> **本段为 AI 工具快速参考**。详细规则请查阅主规范。

### 1. SQL 资产位置

所有 SQL 资产位于 `.products/projects/wk-train-center-service/db/`，**不在后端代码仓内**。当前 6 个版本目录：`1.1/`、`1.2/`、`1.3/`、`1.4/`、`1.5/`、`mobile-1.1/`。

### 2. 新建 SQL 必须遵守

- **头部 8 字段**（必填，顺序固定）：版本 / 模块 / 用途 / 影响表 / 创建日期 / 作者 / 审核人 / 审核日期
- **强制结构 4 条**：
  1. 所有 DDL 使用 `` `wk_train_center`.`table_name` `` 库名限定
  2. 按表分块：每块前用 ``-- ============== 表名 ==============``
  3. 块首注明操作类型：`-- ALTER: ADD COLUMN` / `-- UPDATE: 数据回填` / `-- CREATE: 新建表` / `-- DROP: 删除` / `-- INDEX: 创建索引`
  4. 头部"影响表" = 正文去重表名（严格字符串相等）
- **模板**：`.products/projects/wk-train-center-service/db/HEADER-TEMPLATE.sql`

### 3. AI 自审（生成新 SQL 后）

- 自动调用 skill：**规范化SQL头部与结构生成技能**
- 通过后自动填头部"审核人"（格式 `<ide>:<model>`）和"审核日期"
- **不审 SQL 语义**（DROP 是否安全、UPDATE 是否带 WHERE 等）—— 那是 DBA / 部署负责人职责

### 4. 修改现有 SQL

- 修改前先看 `.products/projects/wk-train-center-service/db/README.md` 索引导航
- 历史 SQL 可加 ``-- TODO(legacy): 补全 8 字段头部 + 审核记录`` 标记
- 不删除现有 legacy 头部（即使不规范）

### 5. 索引导航查询路径

- 总入口：`.products/projects/wk-train-center-service/db/README.md`
- 按版本：`.products/projects/wk-train-center-service/db/<version>/README.md`
- 重新生成：`python scripts/sql/build-index.py`
- 校验报告：`.products/projects/wk-train-center-service/db/lint-report.md`
