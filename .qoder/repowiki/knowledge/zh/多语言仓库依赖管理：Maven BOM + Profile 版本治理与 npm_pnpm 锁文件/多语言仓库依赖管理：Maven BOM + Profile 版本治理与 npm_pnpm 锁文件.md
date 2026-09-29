---
kind: dependency_management
name: 多语言仓库依赖管理：Maven BOM + Profile 版本治理与 npm/pnpm 锁文件
category: dependency_management
scope:
    - '**'
source_files:
    - Backend/customer-pricing/pom.xml
    - Backend/wk-train-center-service/pom.xml
    - Backend/customer-pricing/.flattened-pom.xml
    - Frontend/angular/mhc-ui/package.json
    - Frontend/angular/mhc-ui/.npmrc
    - Frontend/vue/PPTist-ui/package.json
---

## 1. 使用的系统与工具

本仓库是一个多语言聚合工作区，后端 Java 项目使用 **Maven**，前端项目分别使用 **npm**（Angular）和 **pnpm**（Vue），各自维护独立的锁文件。

- Java 侧：Maven `pom.xml` + 外部父 POM `com.wk:wk-dependencies:1.0-RELEASE` + Maven Profile 切换 SNAPSHOT/RELEASE。
- Angular 侧：`package.json` + `package-lock.json` + `.npmrc`（npm 10.9.3，registry 指向 npmmirror）。
- Vue 侧：`package.json` + `pnpm-lock.yaml` + `.npmrc`（指定 pnpm 引擎）。

## 2. 关键文件

- `Backend/customer-pricing/pom.xml` — 客户报价定价服务的聚合 POM，继承 `com.wk:wk-dependencies:1.0-RELEASE`，定义模块、properties 与 `dependencyManagement`。
- `Backend/wk-train-center-service/pom.xml` — 培训中心服务聚合 POM，直接在根 POM 内集中声明所有第三方依赖版本（Spring Boot 3.2.1、MyBatis-Plus 3.5.11、Shiro 2.0.2、Jackson 2.15.3 等）。
- `Frontend/angular/mhc-ui/package.json` — Angular NX monorepo 的顶层依赖声明。
- `Frontend/vue/PPTist-ui/package.json` — Vue Vite 项目的依赖声明。
- `Frontend/angular/mhc-ui/.npmrc` — npm registry 与锁定策略。
- `Backend/customer-pricing/.flattened-pom.xml` — maven-flatten-plugin 生成的扁平化 POM（用于发布到私有仓库）。

## 3. 架构与约定

### 3.1 Java 依赖治理（双模式）

**customer-pricing 项目**采用「外部父 POM + 内部 `dependencyManagement`」双层治理：
- 通过 `<parent><groupId>com.wk</groupId><artifactId>wk-dependencies</artifactId><version>1.0-RELEASE</version></parent>` 继承统一依赖基线。
- 在自身 POM 的 `<dependencyManagement>` 中再次声明内部模块（`wk-customer-pricing-api`、`common-web`、`common-mysql` 等）的版本，供子模块引用时省略版本号。
- 所有第三方依赖通过 properties（如 `${common-web.version}`）集中声明，子模块仅写 `<artifactId>` 不写 `<version>`。

**wk-train-center-service 项目**则把全部第三方依赖直接写在根 POM 的 `<dependencyManagement>` 中，未使用外部父 POM，但同样遵循「根 POM 管版本、子模块不写 version」的模式。它通过 `<dependencyManagement>` 引入 Spring Boot BOM、Spring Framework BOM、MyBatis-Plus BOM 来统一管理传递依赖。

### 3.2 环境 Profile 与私有仓库

两个 Maven 项目都定义了 `wk-dev` / `wk-test` / `wk-uat` / `wk-prod` Profile，通过 `-deploy` 后缀属性区分部署版本：
- dev/test/uat：`${xxx.version}-SNAPSHOT`
- prod：`${xxx.version}-RELEASE`

`wk-dev` Profile 默认激活，并配置私有 Maven 仓库 `http://139.129.223.217:8085/repository/wk-prod-group/`（id=`wk-prod`），用于拉取内部构件。

### 3.3 依赖排除与冲突收敛

wk-train-center-service 对已知冲突依赖显式 `<exclusions>`：
- `spring-boot-starter-test` 排除 `byte-buddy` / `byte-buddy-agent`，改用统一的 `${bytebuddy.version}`。
- `shiro-spring-boot-starter`、`shiro-web`、`shiro-spring` 互相排除以避免重复加载。
- `shiro-redis` 排除 `jedis` 与 `maven-*` 插件依赖。
- `dozer-core` 排除 `slf4j-simple` / `slf4j-api`。
- `jodconverter-spring-boot-starter` 排除整个 `org.springframework.boot:*`。

### 3.4 前端依赖锁定

- Angular (`mhc-ui`)：`.npmrc` 设置 `package-lock=true`、`save-exact=true`、`omit=peer`，registry 指向 `https://registry.npmmirror.com`；`package.json` 中 `engines.node >= 20.0.0, npm >= 10.0.0`，并通过 `packageManager: "npm@10.9.3"` 固定包管理器版本。
- Vue (`PPTist-ui`)：使用 pnpm，`package.json` 中 `packageManager: "pnpm@10.30.2"` 且 `engines.pnpm: "10.30.2"`，配合 `pnpm-lock.yaml` 锁定。

### 3.5 构建产物

每个 Maven 子模块生成 `.flattened-pom.xml`（由 `flatten-maven-plugin` 生成），用于发布到私有仓库时剥离 IDE 元信息。

## 4. 约定与约束

- **Java 子模块不得自行声明版本**：子模块在 `<dependencies>` 中只写 `<artifactId>`，版本由父 POM 或 `dependencyManagement` 提供（customer-pricing 与 wk-train-center-service 均如此）。
- **第三方依赖版本集中在根 POM**：customer-pricing 放在 properties + dependencyManagement，wk-train-center-service 直接放在 dependencyManagement 中，二者都避免散落在业务模块里。
- **Profile 驱动 SNAPSHOT/RELEASE 切换**：dev/test/uat 一律追加 `-SNAPSHOT`，prod 使用 `-RELEASE`，这是通过 `${xxx-deploy.version}` 属性实现的强制约定。
- **私有仓库仅在 dev profile 启用**：`wk-dev` Profile 内嵌 `wk-prod` 仓库（`http://139.129.223.217:8085/repository/wk-prod-group/`），其他 Profile 不声明仓库，依赖从 Maven Central 获取。
- **前端必须使用指定包管理器**：Angular 要求 npm ≥ 10.0.0（实际 10.9.3），Vue 要求 pnpm 10.30.2，通过 `packageManager` 字段与 `engines` 共同约束。
- **Angular 禁止自动更新依赖**：`.npmrc` 中 `save-exact=true` 使 `npm install xxx` 写入精确版本而非范围。
- **Angular 使用镜像源**：`.npmrc` 将 registry 设置为 `https://registry.npmmirror.com`。
- **依赖冲突通过显式 exclusions 收敛**：wk-train-center-service 对 shiro、jodconverter、dozer、spring-boot-starter-test 等依赖做了大量 `<exclusions>`，以消除传递依赖版本漂移。
- **无 vendored 源码**：未发现 `vendor/`、`lib/` 等目录下的第三方源码，所有依赖均通过远程仓库解析。
- **wk-train-center-service 中注释掉的阿里云/Sonatype 仓库配置**（第 46-71 行）表明曾考虑过公共镜像，但当前未启用。