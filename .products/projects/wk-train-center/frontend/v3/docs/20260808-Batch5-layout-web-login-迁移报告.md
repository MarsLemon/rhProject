# Batch 5 · layout/Web + login + components · 迁移报告

> 范围：`src/layout/Web/`、`src/layout/login/`、`src/layout/components/`
> 对比基准：`wk-train-center-ui`（V2）
> 结果：**修复 2 个关键 bug**（WebLayout slot、退出登录确认）；6 文件评估「不动」；typecheck ✅、build ✅（27.49s）

## 一、评估总览（plan 内 8 文件）

| # | 文件 | V3 行数 | V2 行数 | 行数差 | 判定 | 关键差异 |
|---|------|---------|---------|--------|------|----------|
| 1 | Web/UserLayout.vue | 41 | 88 | -47 | 不动 | V3 简化（菜单项 + Options API→script setup），无功能损失 |
| 2 | Web/WebHeader.vue | 397 → 412 | 377 | **+15** | **修复 1** | **V3 漏掉退出登录确认弹窗** |
| 3 | Web/WebLayout.vue | 76 → 79 | 73 | **+3** | **修复 2** | **V3 漏掉 `<slot name="main">`，导致子页面 uc-menu 被静默丢弃** |
| 4 | components/AppMain.vue | 68 | 55 | +13 | 不动 | 已 Vue3 化（storeToRefs + watch + router-view slot） |
| 5 | login/Login.vue | 229 | 210 | +19 | 不动 | script setup + Pinia；QR/SMS 内联实现，与 V2 等价 |
| 6 | login/LoginForgot.vue | 137 | 119 | +18 | 不动 | 同上 |
| 7 | login/LoginLayout.vue | 87 | 67 | +20 | 不动 | V3 增补 flex 容器布局，更完善 |
| 8 | login/LoginRegister.vue | 118 | 120 | -2 | 不动 | V3 简化（去 RegDepartSelect，deptCode 改 el-input） |

## 二、关键修复

### 2.1 WebLayout.vue — 补回 `<slot name="main">` 🔴 严重 Bug

**问题**：V3 重构 WebLayout 时遗漏了 `<slot name="main">`，但 `UserLayout.vue` 等子页面仍按 V2 模式用 `<template #main>` 注入内容。

**后果**：所有学员端"用户中心"页面的 uc-menu 顶栏（个人资料 / 我的消息 / 私人课件 三个 Tab）**被 Vue 静默丢弃**，用户看不到导航 Tab。

**修复**：

```vue
<!-- V3 修复前 -->
<main class="page-main container">
  <AppMain />
</main>

<!-- V3 修复后 -->
<main class="page-main container">
  <!-- 兼容子页面通过 #main slot 注入自定义内容 (如 UserLayout 的 uc-menu); 否则回退渲染 AppMain -->
  <slot v-if="$slots.main" name="main" />
  <AppMain v-else />
</main>
```

### 2.2 WebHeader.vue — 补回退出登录确认弹窗 🟡 UX 回归

**问题**：V3 重构 logout 时直接调用 `userStore.logoutAction()`，未保留 V2 的 `ElMessageBox.confirm`。

**后果**：学员端顶部下拉点"退出登录"立即登出，**无任何二次确认**，容易误操作。

**修复**：

```ts
// V3 修复前
function handleCommand(command: string) {
  if (command === "logout") {
    userStore.logoutAction();
    router.push("/pages/login/login").catch(() => {});
  }
  // ...
}

// V3 修复后
function handleCommand(command: string) {
  if (command === "logout") {
    logout();
  }
  // ...
}

async function logout() {
  try {
    await ElMessageBox.confirm("确定要退出吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    });
    await userStore.logoutAction();
    router.push("/pages/login/login").catch(() => {});
  } catch {
    // 用户取消
  }
}
```

**注**：与 Admin/Navbar.vue V3 行为对齐（Navbar V3 已有 `ElMessageBox.confirm`）。

## 三、其它文件判定依据

### 3.1 UserLayout.vue — 不动
- V3 简化了菜单项（去掉 V2 注释掉的 5 项 capability/pass/bind/real/points），仅保留 3 项实际可用项
- Options API → script setup
- 业务能力等价，无功能损失

### 3.2 AppMain.vue — 不动
- V3 用 `storeToRefs` 绑定 `cachedViews`
- V3 用 `router-view v-slot="{ Component, route }"` 接收路由 + 包裹 keep-alive
- 比 V2 的简单 `<RouterView :key>` 更精准
- ✅ 现代化等价

### 3.3 login/Login.vue — 不动
- QR 码：V2 用 `vue-qr` 组件 → V3 用外部 `api.qrserver.com`（避免依赖）
- SMS 输入：V2 用 `<SmsInput>` 子组件 → V3 内联实现（含倒计时）
- `isDemo` 改为 `getCurrentInstance().proxy.$isDev` 读取全局属性
- ✅ 业务等价

### 3.4 login/LoginForgot.vue — 不动
- 同 Login.vue，SMS 输入从 `<SmsInput>` 改为内联实现
- ✅ 业务等价

### 3.5 login/LoginLayout.vue — 不动
- V3 增加了 `.login-container` flex 布局（top/content/footer 三段）
- 视觉布局更合理（之前 V2 只有简单的 `::v-deep .app-main`）
- ✅ 升级而非退化

### 3.6 login/LoginRegister.vue — 不动
- V3 简化 deptCode 输入：V2 用 `<RegDepartSelect>` 组件（下拉选部门） → V3 用 `<el-input>` 手动输入
- 属于 P3 范围（部门选择 UX 改进），本批不动

## 四、Plan 外文件评估

以下 6 个文件不在 Plan B5 范围（Plan 仅列 8 文件），但属于本批覆盖的目录，建议后续单独批次处理：

| # | 文件 | V3 行数 | V2 行数 | 行数差 | 说明 |
|---|------|---------|---------|--------|------|
| 1 | Web/UserBanner.vue | 92 | 135 | -43 | 学员端横幅；未评估 |
| 2 | components/Settings.vue | 67 | 107 | -40 | 页面设置抽屉；未评估 |
| 3 | login/components/DemoAccount.vue | 66 | 72 | -6 | 演示账号提示 |
| 4 | login/components/FaceLoginDialog.vue | 87 | 91 | -4 | 人脸登录弹窗 |
| 5 | login/components/ThirdLogin.vue | 159 | 118 | +41 | 第三方登录 |
| 6 | login/sync.vue | 32 | 33 | -1 | 登录态同步 |

**注**：V3 还删除了 V2 的 `login/components/RegDepartSelect.vue`（232 行），如需在 userDeptType=0 环境下提供部门选择 UI，需重新引入。

## 五、验证

```bash
$ npm run typecheck
（无 error 输出）✅

$ npm run build
✓ built in 27.49s
（无 error，dist/ 产物正常生成）✅
```

## 六、本批次小结

| 项 | 数值 |
|----|------|
| 评估文件数 | 8 |
| 修改文件数 | 2（WebLayout.vue 补 slot + WebHeader.vue 补确认弹窗） |
| 关键 Bug 修复 | 2 处（1 严重 + 1 UX） |
| typecheck | ✅ 通过 |
| build | ✅ 通过（27.49s） |
| 实际业务功能缺口 | **2 处已修复** |

**关键结论**：本批次修复了 1 个**严重静默 Bug**（UserLayout uc-menu 被丢弃）和 1 个 UX 回归（无确认登出）。**这两处遗漏若不上线学员端测试，可能要数周后用户反馈才能发现**。

## 七、下一步

进入 Batch 6：admin/dashboard（10 个差异小文件，已 Vue3 化，多为 CSS/图标）。