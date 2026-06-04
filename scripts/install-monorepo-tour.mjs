#!/usr/bin/env node
/**
 * 在根 .understand-anything/knowledge-graph.json 上安装/更新"monorepo 全貌"
 * 跨子项目导览（tour）。
 *
 * 设计目标：
 *   - 给 monorepo 新人一个 5-7 步的高层导览，先讲清三个 app 各自定位，
 *     再讲清它们如何协作（跨子项目集成模式）
 *   - 所有 nodeIds 都必须是 merged 图里真实存在的节点
 *   - 重复执行是幂等的：用 tour.steps 的第一个 title 作为"标记"识别本 tour
 *
 * 模式：
 *   --dry-run   只打印将写入的 tour，不动文件  （默认）
 *   --apply     实际写回根图谱（带 .bak 备份）
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");
const UA_ROOT = path.join(REPO_ROOT, ".understand-anything");
const ROOT_GRAPH = path.join(UA_ROOT, "knowledge-graph.json");
const ROOT_META = path.join(UA_ROOT, "meta.json");

const argv = process.argv.slice(2);
const isApply = argv.includes("--apply");
const isDryRun = !isApply;

const SUFFIX_BACKUP = new Date().toISOString().slice(0, 10);

const TOUR_MARKER_TITLE = "monorepo 全貌导览（根聚合视图）";

// ---------- tour content ----------
// 每个步骤：
//   order: 序号（1-based）
//   title: 短句
//   description: 详细描述
//   nodeIds: 引用的节点（必须存在于 merged 图里）
//   languageLesson: 可选，跨子项目/架构层面的注意点
const TOUR_STEPS = [
  {
    order: 1,
    title: TOUR_MARKER_TITLE,
    description:
      "rhProject 是一个 6 个子项目组成的智能培训系统 monorepo（智培/Admin/学员门户/PPT 创作/移动端/PowerPoint 桌面端）。本导览聚焦三大核心 app：后端 (wk-train-center-service, Spring Boot 3.2 + DDD)、Vue 2 前端 (wk-train-center-ui, Element-UI)、以及 AI PPT 创作器 (wk-PPTist-ui, Vue 3 + Vite)。",
    nodeIds: [
      "app:wk-train-center-service",
      "app:wk-train-center-ui",
      "app:wk-PPTist-ui",
    ],
    languageLesson:
      "monorepo 的核心 trade-off：跨子项目共享构建脚本/工具链的成本 vs 子项目独立版本/技术栈的灵活性。本仓库采用 npm workspace + 各自独立 package.json 的混合模式。",
  },
  {
    order: 2,
    title: "Java 后端：业务与数据核心",
    description:
      "wk-train-center-service 是整个系统的数据源与业务规则中心。WebApplication 是 Spring Boot 启动入口；yf-web 模块是 HTTP API 层；yf-modules 下的 yf-module-exam / yf-module-repo / yf-module-ucenter 等是按 DDD 限界上下文拆分的领域模块，每个模块自带 controller/service/repository 三层。",
    nodeIds: [
      "app:wk-train-center-service",
      "file:wk-train-center-service/yf-web/src/main/java/com/yf/web/WebApplication.java",
      "file:wk-train-center-service/yf-modules/yf-module-exam/src/main/java/com/yf/exam/modules/client/exam/controller/ExamImgClientController.java",
    ],
    languageLesson:
      "DDD 分层架构（Controller → Application → Service → Domain → Repository → Infrastructure）严禁跨层调用，例如 Controller 不能直接调 Mapper。这是为了让业务规则集中在 Domain 层，方便未来替换基础设施（如换 MyBatis-Plus 为 JPA）而不影响业务。",
  },
  {
    order: 3,
    title: "Vue 2 前端：管理与学员入口",
    description:
      "wk-train-center-ui 是给管理员和学员用的 Web 门户，基于 Vue 2.7 + Element-UI。main.js 挂载 Vue 实例并注册全局组件（Element-UI、过滤器、指令）；router/index.js 集中所有路由（试卷管理、题库管理、考试监控、学员中心等）。代码组织按业务视图（views/）划分，每个视图对应后端的一个 DDD 模块。",
    nodeIds: [
      "app:wk-train-center-ui",
      "file:wk-train-center-ui/src/main.js",
      "file:wk-train-center-ui/src/router/index.js",
    ],
    languageLesson:
      "Vue 2.7 项目强制使用 Options API（禁止 Composition API 与 <script setup>），这是为了让团队保持统一的代码风格。状态管理用 Vuex 3，按业务域拆分 modules（user/exam/paper/snapshot 等），mutation 必须是大写蛇形命名以便 devtools 追踪。",
  },
  {
    order: 4,
    title: "AI PPT 创作器：内容生成与幻灯片编辑",
    description:
      "wk-PPTist-ui 是一个独立的 Vue 3 + Vite 应用，专注 PPT 在线编辑与 AI 生成。main.ts 监听父窗口 postMessage（INIT_PPT_EVN 消息）来获取 OSS 环境配置后才挂载 Vue——这是嵌入到门户中作为 iframe 时的握手协议。types/slides.ts 定义所有幻灯片元素的数据结构（文本/图片/形状/表格/图表/音视频/公式），是整个编辑器的'词汇表'。",
    nodeIds: [
      "app:wk-PPTist-ui",
      "file:wk-PPTist-ui/src/main.ts",
      "file:wk-PPTist-ui/src/types/slides.ts",
    ],
    languageLesson:
      "PPTist 通过 postMessage 与父窗口（wk-mhc-ui 或 wk-train-center-ui）通信是典型嵌入式 Web 应用模式：父应用控制上下文（用户/权限/OSS 配置），子应用专注功能。这种解耦让 PPTist 可以独立部署、独立升级，不需要和门户同步发版。",
  },
  {
    order: 5,
    title: "跨子项目协作：HTTP + postMessage 双重通道",
    description:
      "三个核心 app 之间通过两条通道协作：①HTTP/REST（wk-train-center-ui 与 wk-train-center-service 之间，axios 调用后端 Result<T> 统一响应）；②postMessage（PPTist 与父门户之间，传输 OSS 配置、AI 指令等运行时上下文）。Vue 2 前端是后端的直接消费方；PPTist 是 Vue 2 前端或 Angular 门户的内嵌子应用。",
    nodeIds: [
      "app:wk-train-center-service",
      "app:wk-train-center-ui",
      "app:wk-PPTist-ui",
      "file:wk-train-center-ui/src/main.js",
      "file:wk-PPTist-ui/src/main.ts",
    ],
    languageLesson:
      "后端 API 响应统一用 Result<T> 包装，code=0 表示成功。前端 axios 拦截器根据 code 决定是 resolve 还是 reject——400 弹 Notification.warn、401/10010002 跳登录、403 显示无权限、500 弹 Notification.error。这套约定让前端不需要每个接口单独处理错误。",
  },
  {
    order: 6,
    title: "演进路径：从 v2 到 v3，从单体到微前端",
    description:
      "前端有两个并行版本：wk-train-center-ui（Vue 2.7，生产环境主力）和 wk-train-center-ui-v3（Vue 3.5 + TypeScript + Vite，正在迁移）。门户 wk-mhc-ui 采用 Angular 18 + Nx + Module Federation，是微前端架构的尝试。移动端 wk-mhc-mobile 与 PowerPoint 桌面端都在 wk-PPTist-ui 的能力上做平台化扩展。",
    nodeIds: [
      "app:wk-train-center-ui",
      "app:wk-PPTist-ui",
    ],
    languageLesson:
      "多技术栈共存是渐进式迁移的常见折中：先用 v3 跑新业务页面，v2 旧页面保持不动，等 v3 覆盖率到 80% 再切流量。这样既能让团队学习新技术，又不阻塞业务迭代。Module Federation 让 Angular 门户可以远程加载 Vue 微应用，避免巨型单体。",
  },
  {
    order: 7,
    title: "下一步：从这里出发",
    description:
      "看完本导览后建议：①深入 wk-train-center-service 的 yf-module-exam 模块看一个完整 DDD 流（Controller → Application → Service → Domain → Repository）；②在 wk-PPTist-ui 的 store/slides.ts 看 Pinia 状态设计；③在 wk-train-center-ui 的 views/ 找一处你最熟悉的业务对比前后端字段映射。理解这三块后就能参与任何模块的开发。",
    nodeIds: [
      "app:wk-train-center-service",
      "app:wk-train-center-ui",
      "app:wk-PPTist-ui",
    ],
    languageLesson:
      "掌握一个 monorepo 的最佳方式是'选一个完整业务做垂直切片'，从后端 Controller 一路追到前端组件，搞清全链路后再横向扩展到其他模块。本仓库每个 DDD 模块都是独立的垂直切片。",
  },
];

// ---------- main ----------
async function main() {
  console.log(`[install-monorepo-tour] mode = ${isApply ? "APPLY" : "DRY-RUN"}`);

  const raw = await fs.readFile(ROOT_GRAPH, "utf8");
  const graph = JSON.parse(raw);
  const nodeIdsInGraph = new Set((graph.nodes || []).map((n) => n.id));

  // 校验所有引用的 nodeIds 都存在
  const dangling = [];
  for (const step of TOUR_STEPS) {
    for (const id of step.nodeIds) {
      if (!nodeIdsInGraph.has(id)) dangling.push({ step: step.order, id });
    }
  }
  if (dangling.length) {
    console.error("[ERROR] 以下 nodeIds 在 merged 图中不存在：");
    for (const d of dangling) console.error(`  step ${d.step}: ${d.id}`);
    console.error("\n请先运行 `npm run understand:merge` 重新聚合，或修改 tour 节点引用。");
    process.exit(1);
  }

  // 检查是否已经安装过（idempotent）
  const existingTour = Array.isArray(graph.tour) ? graph.tour : [];
  const existingIdx = existingTour.findIndex((s) => s.title === TOUR_MARKER_TITLE);
  if (existingIdx >= 0) {
    console.log(`[INFO] 已检测到旧版本 tour（在 step #${existingIdx + 1}），将覆盖替换。`);
  }

  console.log("\n=== TOUR 内容预览 ===");
  for (const s of TOUR_STEPS) {
    console.log(`\n[${s.order}] ${s.title}`);
    console.log(`  ${s.description.slice(0, 80)}…`);
    console.log(`  nodes (${s.nodeIds.length}): ${s.nodeIds.slice(0, 3).join(", ")}${s.nodeIds.length > 3 ? "…" : ""}`);
  }
  console.log(`\n[TOTAL] ${TOUR_STEPS.length} steps`);

  if (isDryRun) {
    console.log("\n[DRY-RUN] 未修改任何文件。带上 --apply 真正写入。");
    return;
  }

  // 备份
  console.log("\n=== 备份根文件 ===");
  await fs.copyFile(ROOT_GRAPH, `${ROOT_GRAPH}.bak.${SUFFIX_BACKUP}`);
  try {
    await fs.copyFile(ROOT_META, `${ROOT_META}.bak.${SUFFIX_BACKUP}`);
  } catch {}

  // 替换或追加
  if (existingIdx >= 0) {
    // 移除旧版本（一次性移除从 marker 起连续的"我们的"步骤）
    // 简化：直接替换为新数组
    const newTour = [
      ...existingTour.slice(0, existingIdx),
      ...TOUR_STEPS,
      ...existingTour.slice(existingIdx + TOUR_STEPS.length), // 容错：若旧版步骤多于新版，保留尾部
    ];
    graph.tour = newTour;
  } else {
    graph.tour = [...existingTour, ...TOUR_STEPS];
  }

  await fs.writeFile(ROOT_GRAPH, JSON.stringify(graph, null, 2));
  console.log(`  wrote ${path.relative(REPO_ROOT, ROOT_GRAPH)}  ${(Buffer.byteLength(JSON.stringify(graph)) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  tour steps: ${graph.tour.length}`);

  console.log("\n[DONE] tour 安装完成。备份文件：");
  console.log(`  ${path.relative(REPO_ROOT, ROOT_GRAPH)}.bak.${SUFFIX_BACKUP}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
