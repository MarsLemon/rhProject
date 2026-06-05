#!/usr/bin/env node
/**
 * 一次性修复脚本: 规范化子项目图谱
 *
 * 修复内容:
 *  1. 给所有 file:/function:/class:/module:/endpoint:/table:/config:/document:/
 *     data:/template:/script:/service:/api: 节点的 ID 加 <子项目名>/ 前缀
 *  2. 同步重写所有边 (edges) 的 source / target,避免引用断裂
 *  3. 补全无 path/filePath 字段的 file 节点的 filePath(从 id 推断)
 *  4. 统一字段: 添加 filePath 字段(值与 path 一致,都带 <子项目名>/ 前缀)
 *  5. 修正 meta.json 的 analyzedFiles(从 file 节点数,而不是 nodes.length)
 *
 * 用法:
 *   node scripts/fix-subproject-understand-graph.mjs <subproject> [--apply]
 *
 * 示例:
 *   node scripts/fix-subproject-understand-graph.mjs wk-train-center-service
 *   node scripts/fix-subproject-understand-graph.mjs wk-train-center-ui --apply
 *   node scripts/fix-subproject-understand-graph.mjs wk-PPTist-ui --apply
 *
 * 模式:
 *   默认       DRY-RUN, 只统计/报告, 不写文件
 *   --apply    真正执行修复(带 .bak 备份)
 *
 * 设计原则: 不修改子图谱的 ID 语义, 只补全缺失的元数据并规范化。
 * 修复后子图谱将自洽(dashboard 可用), 也兼容 merge-understand-graph.mjs
 * 的前缀注入(只要后者也加上幂等保护)。
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");

// 解析 CLI: 第一个位置参数是子项目名
const argv = process.argv.slice(2);
const positional = argv.filter(a => !a.startsWith("--"));
if (positional.length === 0) {
  console.error("[ERROR] 用法: node scripts/fix-subproject-understand-graph.mjs <subproject> [--apply]");
  console.error("        例如: wk-train-center-service | wk-train-center-ui | wk-PPTist-ui");
  process.exit(1);
}
const PROJECT_NAME = positional[0];
const SUBPROJECT_DIR = path.join(REPO_ROOT, PROJECT_NAME);
const UA_DIR = path.join(SUBPROJECT_DIR, ".understand-anything");
const GRAPH_PATH = path.join(UA_DIR, "knowledge-graph.json");
const META_PATH = path.join(UA_DIR, "meta.json");
const PREFIX = `${PROJECT_NAME}/`;

const isApply = argv.includes("--apply");
const isDryRun = !isApply;

const NS_PREFIXES = [
  "file", "class", "module", "function", "endpoint",
  "table", "service", "document", "config", "data",
  "template", "script", "api",
];

const SUFFIX_BACKUP = new Date().toISOString().slice(0, 10);

// 提取 namespace: 之后的部分
function restOfId(id) {
  if (typeof id !== "string") return null;
  for (const ns of NS_PREFIXES) {
    if (id.startsWith(`${ns}:`)) return { ns, rest: id.slice(ns.length + 1) };
  }
  return null;
}

// 给 ID 加项目前缀(幂等)
function prefixId(id) {
  if (typeof id !== "string") return id;
  const parsed = restOfId(id);
  if (!parsed) return id; // 非 namespace: 形式, 跳过
  const { ns, rest } = parsed;
  // 已经带前缀则跳过
  if (rest.startsWith(PREFIX)) return id;
  return `${ns}:${PREFIX}${rest}`;
}

// 从 ID 推断文件相对路径
function pathFromId(id) {
  const parsed = restOfId(id);
  if (!parsed) return null;
  return parsed.rest; // 包含或不含 / 都返回
}

// 剥除子项目前缀, 得到真正的相对路径
function stripPrefix(p) {
  if (typeof p !== "string") return p;
  if (p.startsWith(PREFIX)) return p.slice(PREFIX.length);
  return p;
}

// 计算 node 的相对路径(不带项目前缀)
function nodeRelativePath(node) {
  if (typeof node.path === "string" && node.path) return stripPrefix(node.path);
  if (typeof node.filePath === "string" && node.filePath) return stripPrefix(node.filePath);
  // 从 id 推断(仅对 file 节点有意义)
  if (node.type === "file" && typeof node.id === "string") {
    const before = restOfId(node.id)?.rest;
    if (before) return stripPrefix(before);
  }
  return null;
}

async function main() {
  console.log(`[fix-subproject-understand-graph] mode = ${isApply ? "APPLY" : "DRY-RUN"}`);
  console.log(`[INFO] 目标子项目: ${PROJECT_NAME}`);
  console.log(`[INFO] 图谱: ${path.relative(REPO_ROOT, GRAPH_PATH)}`);

  const raw = await fs.readFile(GRAPH_PATH, "utf8");
  const graph = JSON.parse(raw);
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  console.log(`[INFO] 当前: ${nodes.length} nodes, ${edges.length} edges`);

  // ========== 第一步: 构建 ID 映射 ==========
  const idMap = new Map();
  let idWillChange = 0;
  for (const n of nodes) {
    if (typeof n.id !== "string") continue;
    const newId = prefixId(n.id);
    idMap.set(n.id, newId);
    if (newId !== n.id) idWillChange++;
  }

  // ========== 第二步: 重写节点 ==========
  // 关键顺序: 先用【原始 ID】推断路径并设置 filePath, 再重写 ID。
  // 否则从已加前缀的 ID 推断路径会得到 "wk-train-center-service/xxx",
  // 再加一次前缀就变成 "wk-train-center-service/wk-train-center-service/xxx" 双重前缀。
  let filePathAdded = 0;        // 新增 filePath
  let filePathAlreadyOk = 0;    // filePath 已正确(加前缀后)
  let pathPrefixed = 0;         // path 字段加前缀
  let idChangedNodes = 0;       // 实际 ID 改变的节点数

  for (const n of nodes) {
    // 1) 先用【当前 n.id】(此时仍是原始未加前缀的)推断路径
    const relPath = nodeRelativePath(n);
    if (relPath) {
      const prefixed = PREFIX + relPath;
      if (n.filePath !== prefixed) {
        n.filePath = prefixed;
        filePathAdded++;
      } else {
        filePathAlreadyOk++;
      }
      // 同步 path 字段(若存在)
      if (typeof n.path === "string" && n.path && n.path !== prefixed) {
        n.path = prefixed;
        pathPrefixed++;
      }
    }

    // 2) 再重写 ID(此时 filePath 已就位, 不会再被影响)
    if (typeof n.id === "string" && idMap.has(n.id)) {
      const newId = idMap.get(n.id);
      if (newId !== n.id) {
        n.id = newId;
        idChangedNodes++;
      }
    }
  }

  // ========== 第三步: 重写边 ==========
  let edgeSourceChanged = 0;
  let edgeTargetChanged = 0;
  for (const e of edges) {
    if (typeof e.source === "string" && idMap.has(e.source)) {
      const newSrc = idMap.get(e.source);
      if (newSrc !== e.source) {
        e.source = newSrc;
        edgeSourceChanged++;
      }
    }
    if (typeof e.target === "string" && idMap.has(e.target)) {
      const newTgt = idMap.get(e.target);
      if (newTgt !== e.target) {
        e.target = newTgt;
        edgeTargetChanged++;
      }
    }
  }

  // ========== 第三.五步: 重写 layers[].nodeIds (和 tour.steps[].nodeId) ==========
  // 否则 layer 卡片会因 nodeId 不匹配而显示 "0 files"
  // 注意: 节点的 ID 已在第二步重写, 所以 [节点当前 ID 集合] 是带前缀的。
  //       layers 中的 nodeId 可能是未带前缀的原始 ID, 不在 idMap 中,
  //       此时需用 prefixId 转换 + 验证转换后能匹配上某个节点。
  const currentNodeIds = new Set(nodes.map((n) => n.id));
  let layerNodeIdChanged = 0;
  let layerNodeIdUnresolved = 0;
  for (const layer of graph.layers || []) {
    if (!Array.isArray(layer.nodeIds)) continue;
    layer.nodeIds = layer.nodeIds.map((nid) => {
      if (typeof nid !== "string") return nid;
      // 1) 直接在 idMap 中
      if (idMap.has(nid)) {
        const newId = idMap.get(nid);
        if (newId !== nid) layerNodeIdChanged++;
        return newId;
      }
      // 2) 已经是带前缀的形式(已经修过)
      if (currentNodeIds.has(nid)) return nid;
      // 3) 尝试 prefixId 转换(用于修复 layer.nodeIds 未带前缀的情况)
      const newId = prefixId(nid);
      if (newId !== nid && currentNodeIds.has(newId)) {
        layerNodeIdChanged++;
        return newId;
      }
      // 4) 真的解析不到
      layerNodeIdUnresolved++;
      return nid;
    });
  }
  let tourStepNodeIdChanged = 0;
  if (graph.tour && Array.isArray(graph.tour.steps)) {
    for (const step of graph.tour.steps) {
      if (typeof step.nodeId !== "string") continue;
      if (idMap.has(step.nodeId)) {
        const newId = idMap.get(step.nodeId);
        if (newId !== step.nodeId) {
          step.nodeId = newId;
          tourStepNodeIdChanged++;
        }
      } else if (!currentNodeIds.has(step.nodeId)) {
        const newId = prefixId(step.nodeId);
        if (newId !== step.nodeId && currentNodeIds.has(newId)) {
          step.nodeId = newId;
          tourStepNodeIdChanged++;
        }
      }
    }
  }

  // ========== 第四步: 计算新 file 数 ==========
  const fileCount = nodes.filter(n => n.type === "file").length;
  const nodesWithoutFilePath = nodes.filter(n => n.type === "file" && !n.filePath).length;

  // ========== 报告 ==========
  console.log("\n=== 修复预览 ===");
  console.log(`  节点 ID 改变:           ${idChangedNodes}`);
  console.log(`  节点 filePath 新增/更新: ${filePathAdded}`);
  console.log(`  节点 filePath 已正确:   ${filePathAlreadyOk}`);
  console.log(`  节点 path 加前缀:       ${pathPrefixed}`);
  console.log(`  边 source 改写:         ${edgeSourceChanged}`);
  console.log(`  边 target 改写:         ${edgeTargetChanged}`);
  console.log(`  layer.nodeIds 改写:     ${layerNodeIdChanged} (未解析: ${layerNodeIdUnresolved})`);
  console.log(`  tour step.nodeId 改写:  ${tourStepNodeIdChanged}`);
  console.log(`  修复后无 filePath 的 file 节点: ${nodesWithoutFilePath}`);
  console.log(`  修复后 file 节点总数:   ${fileCount}`);
  console.log(`  修复后 analyzedFiles:   ${fileCount} (原错误值: 6638)`);

  // 抽检
  const sampleFile = nodes.find(n => n.type === "file");
  const sampleFn = nodes.find(n => n.type === "function");
  const sampleTable = nodes.find(n => n.type === "table");
  console.log("\n=== 样本(修复后) ===");
  if (sampleFile) {
    console.log(`  [file]`);
    console.log(`    id:       ${sampleFile.id}`);
    console.log(`    filePath: ${sampleFile.filePath}`);
    console.log(`    path:     ${sampleFile.path}`);
  }
  if (sampleFn) {
    console.log(`  [function]`);
    console.log(`    id:       ${sampleFn.id}`);
    console.log(`    filePath: ${sampleFn.filePath}`);
  }
  if (sampleTable) {
    console.log(`  [table]`);
    console.log(`    id:       ${sampleTable.id}`);
  }

  if (isDryRun) {
    console.log("\n[DRY-RUN] 未修改任何文件。带上 --apply 真正执行。");
    return;
  }

  // ========== 备份 ==========
  const graphBak = `${GRAPH_PATH}.bak.${SUFFIX_BACKUP}`;
  const metaBak = `${META_PATH}.bak.${SUFFIX_BACKUP}`;
  await fs.copyFile(GRAPH_PATH, graphBak);
  console.log(`\n[BACKUP] ${path.relative(REPO_ROOT, graphBak)}`);
  try {
    await fs.copyFile(META_PATH, metaBak);
    console.log(`[BACKUP] ${path.relative(REPO_ROOT, metaBak)}`);
  } catch {
    console.log(`[BACKUP] ${path.relative(REPO_ROOT, META_PATH)} 不存在,跳过`);
  }

  // ========== 写图谱 ==========
  await fs.writeFile(GRAPH_PATH, JSON.stringify(graph, null, 2));
  const sizeMB = (Buffer.byteLength(JSON.stringify(graph)) / 1024 / 1024).toFixed(2);
  console.log(`[WRITE]  ${path.relative(REPO_ROOT, GRAPH_PATH)}  ${sizeMB} MB`);

  // ========== 更新 meta.json ==========
  let meta = {};
  try {
    meta = JSON.parse(await fs.readFile(META_PATH, "utf8"));
  } catch {}
  meta.lastAnalyzedAt = new Date().toISOString();
  meta.analyzedFiles = fileCount;
  // 保留原 scope / parent / relocatedFrom / gitCommitHash 等
  await fs.writeFile(META_PATH, JSON.stringify(meta, null, 2));
  console.log(`[WRITE]  ${path.relative(REPO_ROOT, META_PATH)}`);

  console.log(`\n[DONE] ${PROJECT_NAME} 子项目图谱已规范化。`);
  console.log("下一步: 在 merge-understand-graph.mjs 的 prefixId 加上幂等保护后,");
  console.log("       运行 node scripts/merge-understand-graph.mjs --apply 重新合并到根。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
