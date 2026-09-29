---
kind: configuration_system
name: 多后端 Nacos + Profile 分层配置与前端 .env 环境隔离
category: configuration_system
scope:
    - '**'
source_files:
    - Backend/customer-pricing/wk-customer-pricing-api/src/main/resources/application.yml
    - Backend/supply/wk-sd-supply-api/src/main/resources/application.yml
    - Backend/wk-train-center-service/yf-web/src/main/resources/application.yml
    - Backend/wk-train-center-service/yf-web/src/main/resources/application-local.yml
    - Frontend/vue/mhc-mobile/.env.development
    - Frontend/vue/PPTist-ui/.env
    - Frontend/angular/mhc-ui/.env
---

## 1. 使用的系统与工具

仓库包含多个独立的后端服务（Spring Boot）和前端工程，各自采用不同的运行时配置方案：

- **Spring Boot 后端**：使用 `application.yml` + Spring Profiles（`local`/`dev`/`prod` 等）+ Nacos 远程配置中心。通过 `spring.config.import` 的 `optional:nacos:...` 语法从 Nacos 拉取共享基础配置。
- **wk-train-center-service（yf-web）**：本地化配置为主，`application.yml` 存放默认值，`application-local.yml` 覆盖开发环境；未启用 Nacos。
- **前端（Angular / Vue）**：使用 Vite/Angular CLI 标准的 `.env*` 文件，变量以 `VITE_` 前缀暴露给浏览器。

## 2. 关键文件

- `Backend/customer-pricing/wk-customer-pricing-api/src/main/resources/application.yml` — 定价服务入口配置，声明 Nacos server、namespace、username/password，并通过 `spring.config.import` 引入 `wk-base-application.yaml`、`wk-circuit-breaker.yaml`、`wk-druid-config.yaml`、`wk-redis-config.yaml`、`wk-customer-pricing-application.yaml`、`wk-auth-permission.yaml` 等远端配置。
- `Backend/supply/wk-sd-supply-api/src/main/resources/application.yml` — 供应链服务入口配置，同样通过 `optional:nacos:` 引入 wk-base、circuit-breaker、druid、xxljob、supply-application、redis、rabbitmq、oa、elasticsearch、auth-permission、cost-config、country-agent-fee 等模块配置。
- `Backend/wk-train-center-service/yf-web/src/main/resources/application.yml` — 培训考试服务的默认配置（Druid、Redis、Quartz、ycloud/wechat/crop-wechat/ding-talk/swagger/logging 等），不连接 Nacos。
- `Backend/wk-train-center-service/yf-web/src/main/resources/application-local.yml` — 覆盖端口、数据库、Redis、ycloud secret、微信/钉钉凭证、swagger、logging.level.root 为 info。
- `Frontend/vue/mhc-mobile/.env.development` — Vite 环境变量（`VITE_APP_API_BASE_URL`、`VITE_AI_API_BASE_URL`、`VITE_TRAIN_API_BASE_URL` 等）。
- `Frontend/vue/PPTist-ui/.env` — PPTist 的 Vite 密钥（Pexels/DashScope API Key）。
- `Frontend/angular/mhc-ui/.env` — Angular 的 `WATCHPACK_POLLING=true`。

## 3. 架构与约定

### 后端（Spring Boot）

- **Profile 机制**：每个服务 `application.yml` 中设置 `spring.profiles.active: local`，通过同名 `application-{profile}.yml` 文件覆盖（如 `application-local.yml`）。这是 Spring Boot 原生约定，非自定义实现。
- **Nacos 远程配置**：`customer-pricing` 与 `supply` 两个服务统一接入 Nacos，连接信息集中在 `spring.cloud.nacos.*`（server-addr、discovery.namespace、config.namespace、username、password）。所有远端配置均使用 `optional:nacos:<dataId>` 导入，允许 Nacos 不可用时启动失败被忽略。
- **分片式 dataId 命名**：远端配置按领域拆分，遵循 `<wk-|业务>-<模块>.yaml(.properties)` 命名，如 `wk-base-application.yaml`、`wk-circuit-breaker.yaml`、`wk-druid-config.yaml`、`wk-redis-config.yaml`、`wk-auth-permission.yaml`、`wk-sd-supply-application.properties`、`wk-oa-application.yaml`、`wk-elasticsearch-config.yaml`、`wk-cost-config.properties`、`wk-sd-supply-country-agent-fee.properties`。每个服务在 `spring.config.import` 中显式列出所需 dataId。
- **本地 vs 远端优先级**：Nacos 导入的配置由 Spring Config Import 机制加载，本地 `application.yml` 中的同键会覆盖远端值（Spring Boot 标准行为）。
- **yk-train-center-service 例外**：该服务没有 Nacos 集成，所有配置（包括数据库密码、Redis、ycloud open-secret、微信/钉钉 AppSecret 等敏感值）直接写在 `application.yml` 与 `application-local.yml` 中。

### 前端

- **Vite 项目**（`mhc-mobile`、`PPTist-ui`、`wk-train-center-ui-v3`）：使用 `.env` / `.env.development` / `.env.production` / `.env.staging` / `.env.uat` / `.env.iterate` 等多环境文件，变量必须以 `VITE_` 前缀才能被注入到客户端代码。
- **Angular 项目**（`marketing-ui`、`mhc-ui`）：使用根级 `.env` 或 `angular.json` 中的构建参数，而非 Vite 的 `VITE_` 约定。

## 4. 约定与约束

- **Nacos dataId 必须通过 `optional:nacos:` 导入**：两个接入 Nacos 的服务全部使用 `optional:nacos:<dataId>` 形式，确保 Nacos 不可用不会导致应用启动失败（见 `customer-pricing` 与 `supply` 的 `application.yml`）。
- **Nacos 凭据集中配置**：`spring.cloud.nacos.username` 与 `spring.cloud.nacos.password` 在 `application.yml` 中以明文硬编码（`wk-local-read` / `123456`），未使用外部密钥管理。
- **Profile 覆盖模式**：通用配置放 `application.yml`，环境差异放 `application-{profile}.yml`，通过 `spring.profiles.active` 切换（当前默认 `local`）。
- **日志级别覆盖约定**：`application.yml` 中 `logging.level.root: error`，`application-local.yml` 覆盖为 `info`，注释明确说明“确保 INFO 级别的请求与业务日志能正常打印”。
- **前端环境变量前缀**：Vite 项目强制使用 `VITE_` 前缀（如 `VITE_APP_API_BASE_URL`、`VITE_AI_API_BASE_URL`、`VITE_PEXELS_API_KEY`），这是 Vite 框架的硬性要求。
- **敏感配置散落**：部分服务（尤其是 `yf-web`）将数据库密码、Redis 密码、ycloud open-secret、微信/钉钉 AppSecret 等直接写入源码中的 `application*.yml`，未走统一的密钥管理系统。
- **Nacos 命名空间隔离**：Nacos 配置使用 `namespace: wk-local`，区分不同环境（但 username/password 也硬编码在源码中）。