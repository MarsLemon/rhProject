#!/usr/bin/env node
/**
 * 把所有子项目的 .understand-anything/knowledge-graph.json 合并到根
 * .understand-anything/knowledge-graph.json。
 *
 * 与 split-understand-graph.mjs 相反方向：子项目 → 根。
 *
 * 合并规则：
 *   - 节点 ID 加子项目前缀避免冲突：
 *       file:src/foo.ts        → file:wk-PPTist-ui/src/foo.ts
 *       class:com.x.Foo        → class:wk-PPTist-ui/com.x.Foo
 *       function:foo           → function:wk-PPTist-ui/foo
 *   - 节点 path 字段加上子项目相对路径前缀（如果尚未包含）
 *   - 边 source / target 同步重写
 *   - 同子项目内的边保留 type / weight 等属性
 *   - 跨子项目的边（source 来自 A、target 来自 B）保留在根，
 *     并打上 crossProject: { from, to } 标记，便于聚合视图
 *   - 现有 app:xxx 节点保留不动（仅当 ID 未冲突时才覆盖）
 *
 * 模式：
 *   --dry-run   只统计，不写文件  （默认）
 *   --apply     真正执行合并（带 .bak 备份）
 *   --only <p>  只处理指定子项目（可重复）
 *
 * 现有 app 占位节点不会被复制进 nodes/edges —— 它们由占位规则生成。
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

// 已知子项目（按需扩）。也支持脚本启动时动态扫描 wk-*/.understand-anything/knowledge-graph.json
const KNOWN_SUBPROJECTS = [
  "wk-train-center-service",
  "wk-train-center-ui",
  "wk-PPTist-ui",
];

const NS_PREFIXES = [
  "file", "class", "module", "function", "endpoint",
  "table", "service", "document", "config", "data",
  "template", "script", "api",
];

const argv = process.argv.slice(2);
const isApply = argv.includes("--apply");
const isDryRun = !isApply;
const onlyIdx = argv.indexOf("--only");
const onlyFilter = onlyIdx >= 0 ? new Set([argv[onlyIdx + 1]]) : null;

const SUFFIX_BACKUP = new Date().toISOString().slice(0, 10);

// ---------- helpers ----------
function prefixId(id, project) {
  if (typeof id !== "string") return id;
  for (const ns of NS_PREFIXES) {
    const re = new RegExp(`^${ns}:`);
    if (re.test(id)) return `${ns}:${project}/${id.slice(ns.length + 1)}`;
  }
  // 纯路径（罕见）：wk-PPTist-ui/src/foo.ts
  if (id.startsWith(project + "/")) return id;
  return `${project}/${id}`;
}

function prefixPath(p, project) {
  if (typeof p !== "string") return p;
  if (p.startsWith(project + "/")) return p;
  return `${project}/${p.replace(/^\/+/, "")}`;
}

function detectProjectFromId(id) {
  if (typeof id !== "string") return null;
  for (const ns of NS_PREFIXES) {
    const m = id.match(new RegExp(`^${ns}:([^/:]+)/`));
    if (m) return m[1];
  }
  return null;
}

async function discoverSubprojects() {
  // 只采用显式 KNOWN；动态扫描作为保险
  const entries = await fs.readdir(REPO_ROOT, { withFileTypes: true });
  const found = new Set(KNOWN_SUBPROJECTS);
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (!e.name.startsWith("wk-")) continue;
    const graphPath = path.join(REPO_ROOT, e.name, ".understand-anything", "knowledge-graph.json");
    try {
      await fs.stat(graphPath);
      found.add(e.name);
    } catch {
      // no graph
    }
  }
  return [...found].filter((p) => (onlyFilter ? onlyFilter.has(p) : true)).sort();
}

// ---------- main ----------
async function main() {
  console.log(`[merge-understand-graph] mode = ${isApply ? "APPLY" : "DRY-RUN"}`);

  const subprojects = await discoverSubprojects();
  if (subprojects.length === 0) {
    console.error("[ERROR] 未发现任何子项目图谱。退出。");
    process.exit(1);
  }
  console.log(`[INFO] 将处理 ${subprojects.length} 个子项目: ${subprojects.join(", ")}`);

  // 读根图谱
  const rootRaw = await fs.readFile(ROOT_GRAPH, "utf8");
  const rootGraph = JSON.parse(rootRaw);

  // 保留现有 app: 占位节点，剩余的"真实节点"清零（防止重复合并）
  const appNodes = (rootGraph.nodes || []).filter((n) => n.id && n.id.startsWith("app:"));
  const appIds = new Set(appNodes.map((n) => n.id));

  // 准备 buckets
  const buckets = {};
  for (const p of subprojects) {
    buckets[p] = {
      nodes: [],
      edges: [],
      nodeIds: new Set(),
      meta: null,
      fileSize: 0,
    };
  }

  let crossProjectEdges = [];

  for (const p of subprojects) {
    const subGraphPath = path.join(REPO_ROOT, p, ".understand-anything", "knowledge-graph.json");
    const subMetaPath = path.join(REPO_ROOT, p, ".understand-anything", "meta.json");
    let raw;
    try {
      raw = await fs.readFile(subGraphPath, "utf8");
    } catch (e) {
      console.warn(`[SKIP] ${p}: ${e.message}`);
      delete buckets[p];
      continue;
    }
    const stat = await fs.stat(subGraphPath);
    buckets[p].fileSize = stat.size;

    let subGraph;
    try {
      subGraph = JSON.parse(raw);
    } catch (e) {
      console.warn(`[SKIP] ${p}: invalid JSON - ${e.message}`);
      delete buckets[p];
      continue;
    }

    try {
      const metaRaw = await fs.readFile(subMetaPath, "utf8");
      buckets[p].meta = JSON.parse(metaRaw);
    } catch {
      buckets[p].meta = null;
    }

    const subNodes = subGraph.nodes || [];
    const subEdges = subGraph.edges || [];

    // 节点：id + path 加前缀
    for (const n of subNodes) {
      // 跳过子项目里自带的 app: 占位（如果有）
      if (typeof n.id === "string" && n.id.startsWith("app:")) continue;
      const rew = { ...n };
      rew.id = prefixId(n.id, p);
      if (rew.path) rew.path = prefixPath(rew.path, p);
      // scope 标子项目
      if (!rew.scope) rew.scope = p;
      buckets[p].nodes.push(rew);
      buckets[p].nodeIds.add(rew.id);
    }

    // 边：source/target 重写，全部归入当前子项目 bucket
    // 注：跨子项目的边需要单独做 import 分析（不同图世界的 ID 不天然相连），
    // 本脚本只做"按子项目聚合"，不做跨子项目 import 追踪。
    for (const e of subEdges) {
      const newSource = prefixId(e.source, p);
      const newTarget = prefixId(e.target, p);
      const rew = { ...e, source: newSource, target: newTarget };
      buckets[p].edges.push(rew);
    }
  }

  // ---------- DRY-RUN report ----------
  console.log("\n=== DRY-RUN 预览 ===");
  let totalNodes = 0;
  let totalEdges = 0;
  for (const p of subprojects) {
    const b = buckets[p];
    if (!b) continue;
    console.log(`\n[${p}]`);
    console.log(`  source : ${(b.fileSize / 1024).toFixed(1)} KB`);
    console.log(`  meta   : lastAnalyzedAt=${b.meta?.lastAnalyzedAt || "n/a"}, files=${b.meta?.analyzedFiles || "n/a"}`);
    console.log(`  nodes  : ${b.nodes.length}`);
    console.log(`  edges  : ${b.edges.length}`);
    const sample = b.nodes.slice(0, 3).map((n) => n.id);
    console.log(`  sample : ${JSON.stringify(sample)}`);
    totalNodes += b.nodes.length;
    totalEdges += b.edges.length;
  }
  console.log(`\n[cross-project]`);
  console.log(`  edges  : 0 (本脚本不做跨子项目 import 分析；如需请另写脚本)`);
  console.log(`\n[TOTAL]`);
  console.log(`  nodes : ${totalNodes}`);
  console.log(`  edges : ${totalEdges}`);

  if (isDryRun) {
    console.log("\n[DRY-RUN] 未修改任何文件。带上 --apply 真正执行合并。");
    return;
  }

  // ---------- APPLY ----------
  console.log("\n=== 备份根文件 ===");
  await fs.copyFile(ROOT_GRAPH, `${ROOT_GRAPH}.bak.${SUFFIX_BACKUP}`);
  try {
    await fs.copyFile(ROOT_META, `${ROOT_META}.bak.${SUFFIX_BACKUP}`);
  } catch {}

  // 写根图谱
  const mergedNodes = [
    ...appNodes,
    ...subprojects.flatMap((p) => buckets[p]?.nodes || []),
  ];

  const mergedEdges = [
    ...subprojects.flatMap((p) => buckets[p]?.edges || []),
  ];

  // 收集 layers（去重 by id）
  const layerMap = new Map();
  for (const l of rootGraph.layers || []) layerMap.set(l.id, l);
  for (const p of subprojects) {
    const b = buckets[p];
    if (!b) continue;
    const subGraph = JSON.parse(await fs.readFile(path.join(REPO_ROOT, p, ".understand-anything", "knowledge-graph.json"), "utf8"));
    for (const l of subGraph.layers || []) {
      if (!layerMap.has(l.id)) layerMap.set(l.id, { ...l, scope: "merged" });
    }
  }
  const mergedLayers = [...layerMap.values()];

  // 保留根已有 tour（如 install-monorepo-tour 写入的跨子项目导览），
  // 不再清空。如果根没有 tour，则保留为空数组（schema 要求）。
  const preservedTour = Array.isArray(rootGraph.tour) ? rootGraph.tour : [];

  const mergedGraph = {
    version: rootGraph.version || "1.0.0",
    project: {
      ...(rootGraph.project || {}),
      name: "rhProject (智能培训系统 monorepo) — merged",
      description: `Aggregated view. ${subprojects.length} subprojects, ${mergedNodes.length} nodes, ${mergedEdges.length} edges. Sub-project graphs are still isolated under each app's .understand-anything/; this is a read-only aggregation.`,
      scope: "cross-project-merged",
      analyzedAt: new Date().toISOString(),
    },
    nodes: mergedNodes,
    edges: mergedEdges,
    layers: mergedLayers,
    tour: preservedTour,
  };
  await fs.writeFile(ROOT_GRAPH, JSON.stringify(mergedGraph, null, 2));
  console.log(`  wrote ${path.relative(REPO_ROOT, ROOT_GRAPH)}  ${(Buffer.byteLength(JSON.stringify(mergedGraph)) / 1024 / 1024).toFixed(2)} MB`);

  // 根 meta.json
  const rootMeta = {
    lastAnalyzedAt: new Date().toISOString(),
    gitCommitHash: "N/A (merged, re-run merge-understand-graph.mjs to refresh)",
    version: rootGraph.version || "1.0.0",
    analyzedFiles: mergedNodes.filter((n) => n.type === "file").length,
    subprojects: subprojects.map((p) => ({
      name: p,
      lastAnalyzedAt: buckets[p]?.meta?.lastAnalyzedAt,
      gitCommitHash: buckets[p]?.meta?.gitCommitHash,
      analyzedFiles: buckets[p]?.meta?.analyzedFiles,
      graphRef: `${p}/.understand-anything/knowledge-graph.json`,
    })),
    scope: "cross-project-merged",
    note: "Aggregated from all subproject .understand-anything/ graphs. To refresh: npm run understand:merge -- --apply",
  };
  await fs.writeFile(ROOT_META, JSON.stringify(rootMeta, null, 2));
  console.log(`  wrote ${path.relative(REPO_ROOT, ROOT_META)}`);

  console.log("\n[DONE] 合并完成。备份文件：");
  console.log(`  ${path.relative(REPO_ROOT, ROOT_GRAPH)}.bak.${SUFFIX_BACKUP}`);
  console.log(`  ${path.relative(REPO_ROOT, ROOT_META)}.bak.${SUFFIX_BACKUP}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
