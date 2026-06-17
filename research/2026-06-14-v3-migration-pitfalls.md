# v3 迁移关键坑（2026-06-14，第 15 轮）

## 进度

- 学员端 6/7 完整迁移
- web 漏洞 A 方案 6 文件修复完成
- B 方案 8 文件统一 `lang="ts"`
- 共 24 文件 + 1 store（capability.vue）

## 3 个硬教训

### 1. `find -name` 漏同级兄弟

- **坑**：用 `find -name '*.vue'` 找文件，可能漏掉同级兄弟文件
- **正确**：必须 `ls + grep` 双重核实，确认每个文件都被覆盖
- **例**：v3 漏迁纯 JS 文件，必须 8 个全部找出 + 全部改 lang="ts"

### 2. 纯 JS 文件不能加 TS 注解

- **坑**：v3 项目约定 TS（202 个 `<script setup>` 中 194 带 `lang="ts"`），但有 **8 个文件漏迁纯 JS**（3 Login + 5 exam）。给这些文件加 TS 类型注解会触发 esbuild `Expected ')' but found ':'` 编译错误
- **正确修法**：`<script setup>` → `<script setup lang="ts">` 统一
- **用户原话**："应该用 ts 的吧，v3 版本就是 ts" —— v3 整体约定 TS，纯 JS 漏迁文件必须改 `lang="ts"`

### 3. vue-tsc ≠ esbuild，**双绿不够**

- **坑**：`npm run typecheck` + `verify:chinese`（已废弃）通过不代表能跑
- **正确**：`vite dev` 实测 esbuild 编译，**curl `.vue` 端点 HTTP 200** 才算 OK
- **原理**：`vue-tsc` 和 esbuild 是两个独立的编译器，typecheck 漏过 ≠ vite 编译过

## 用户验证偏好（原话）

> 改完 v3 要"验证老逻辑 + 检验 bug"，改完 grep v2/v3 关键调用点对账

## 范围约定（本轮）

- 暂不迁：签到 / 培训列表 / 部门树
- 废弃不管：`training-plan`
- v3 空壳：**只标记不修复**（大量 < 1KB 占位文件，尤其 `ucenter/`）
- 旧 fix 大提交：优先处理"统一逻辑/基座补丁"，业务页面 v3 不存在的不动（如 ddbc5005 改 48 文件）