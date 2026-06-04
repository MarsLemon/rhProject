#!/usr/bin/env node
/**
 * 把根 .understand-anything/knowledge-graph.json 拆到子项目（当前只支持 wk-train-center-service）。
 *
 * 设计原则：
 *   - 任何 node.id 以 "file:class:module:function:endpoint:table:service:document:config:data:template:script:api:wk-train-center-service/" 开头 → 归后端
 *   - node.path 字段以 "wk-train-center-service/" 开头 → 归后端
 *   - 不命中 → 留在根（丢弃 or 警告）
 *   - 边：rewrite source/target，去掉 "wk-train-center-service/" 第一个出现的前缀
 *
 * 模式：
 *   --dry-run   只统计，不写文件  （默认）
 *   不带参数     执行搬迁（带 .bak 备份）
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");
const UA_ROOT = path.join(REPO_ROOT, ".understand-anything");
const SOURCE_JSON = path.join(UA_ROOT, "knowledge-graph.json");
const SOURCE_META = path.join(UA_ROOT, "meta.json");
const SOURCE_SCAN = path.join(UA_ROOT, "intermediate", "scan-result.json");

const SUBPROJECTS = ["wk-train-center-service"];
const NS_PREFIXES = [
  "file", "class", "module", "function", "endpoint",
  "table", "service", "document", "config", "data",
  "template", "script", "api",
];

const isDryRun = process.argv.includes("--dry-run") || !process.argv.includes("--apply");
const isApply = process.argv.includes("--apply");

const SUFFIX_BACKUP = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ---------- helpers ----------
function pickPrefix(s) {
  if (typeof s !== "string") return null;
  for (const ns of NS_PREFIXES) {
    const m = s.match(new RegExp(`^${ns}:([^/:]+)/`));
    if (m) return m[1];
  }
  // 纯路径开头 (path 字段场景)
  const p = s.match(/^([^\/:][^/:]*)\//);
  if (p) return p[1];
  return null;
}

function rewriteId(s, project) {
  if (typeof s !== "string") return s;
  // 形如 file:wk-train-center-service/... → file:...
  for (const ns of NS_PREFIXES) {
    const re = new RegExp(`^${ns}:${project}/`);
    if (re.test(s)) return s.replace(re, `${ns}:`);
  }
  // 纯路径 wk-train-center-service/... → ...
  if (s.startsWith(project + "/")) return s.slice(project.length + 1);
  return s;
}

function rewritePathField(p, project) {
  if (typeof p !== "string") return p;
  if (p.startsWith(project + "/")) return p.slice(project.length + 1);
  return p;
}

// ---------- main ----------
async function main() {
  console.log(`[split-understand-graph] mode = ${isApply ? "APPLY" : "DRY-RUN"}`);

  const raw = await fs.readFile(SOURCE_JSON, "utf8");
  const graph = JSON.parse(raw);
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];

  // bucket nodes by project
  const buckets = Object.fromEntries(SUBPROJECTS.map((p) => [p, { nodes: [], nodeIds: new Set(), dropped: [] }]));
  buckets.__root = { nodes: [], nodeIds: new Set(), dropped: [] };

  for (const n of nodes) {
    const fromId = pickPrefix(n.id);
    const fromPath = pickPrefix(n.path);
    const proj = (SUBPROJECTS.includes(fromId) ? fromId : null)
              || (SUBPROJECTS.includes(fromPath) ? fromPath : null)
              || null;

    if (proj) {
      // rewrite
      const rew = { ...n };
      rew.id = rewriteId(n.id, proj);
      if (rew.path) rew.path = rewritePathField(n.path, proj);
      buckets[proj].nodes.push(rew);
      buckets[proj].nodeIds.add(rew.id);
    } else {
      // 兜底 A：id 字符串里含子项目前缀（path 缺失但 id 有前缀）
      const idStr = String(n.id || "");
      const proj2 = SUBPROJECTS.find((p) => idStr.includes(p + "/"));
      if (proj2) {
        const rew = { ...n };
        rew.id = rewriteId(n.id, proj2);
        if (rew.path) rew.path = rewritePathField(n.path, proj2);
        buckets[proj2].nodes.push(rew);
        buckets[proj2].nodeIds.add(rew.id);
      } else if (SUBPROJECTS.length === 1) {
        // 兜底 B：只配了一个子项目时，落单节点（module/table 摘要等）默认归它
        const only = SUBPROJECTS[0];
        const rew = { ...n };
        buckets[only].nodes.push(rew);
        buckets[only].nodeIds.add(rew.id);
        buckets[only].fallback = (buckets[only].fallback || 0) + 1;
      } else {
        buckets.__root.dropped.push(n);
      }
    }
  }

  // bucket edges
  const edgeStats = Object.fromEntries([
    ...SUBPROJECTS.map((p) => [p, 0]),
    ["__cross", 0],
    ["__orphan", 0],
    ["__root", 0],
  ]);

  const edgeBuckets = Object.fromEntries(SUBPROJECTS.map((p) => [p, []]));
  edgeBuckets.__root = [];

  for (const e of edges) {
    const srcProj = pickPrefix(e.source);
    const tgtProj = pickPrefix(e.target);

    if (srcProj && SUBPROJECTS.includes(srcProj) && tgtProj && SUBPROJECTS.includes(tgtProj) && srcProj === tgtProj) {
      const rew = { ...e, source: rewriteId(e.source, srcProj), target: rewriteId(e.target, tgtProj) };
      edgeBuckets[srcProj].push(rew);
      edgeStats[srcProj]++;
    } else if (srcProj && SUBPROJECTS.includes(srcProj)) {
      // src 在子项目，tgt 兜底匹配
      const rew = { ...e, source: rewriteId(e.source, srcProj) };
      if (typeof e.target === "string" && e.target.startsWith(srcProj + "/")) {
        rew.target = rewriteId(e.target, srcProj);
      }
      edgeBuckets[srcProj].push(rew);
      edgeStats[srcProj]++;
    } else if (tgtProj && SUBPROJECTS.includes(tgtProj)) {
      const rew = { ...e, target: rewriteId(e.target, tgtProj) };
      if (typeof e.source === "string" && e.source.startsWith(tgtProj + "/")) {
        rew.source = rewriteId(e.source, tgtProj);
      }
      edgeBuckets[tgtProj].push(rew);
      edgeStats[tgtProj]++;
    } else {
      edgeBuckets.__root.push(e);
      edgeStats.__root++;
    }
  }

  // ---------- DRY-RUN report ----------
  console.log("\n=== DRY-RUN 预览 ===");
  for (const p of SUBPROJECTS) {
    const b = buckets[p];
    console.log(`\n[${p}]`);
    console.log(`  nodes  : ${b.nodes.length}  (含 fallback ${b.fallback || 0} 个)`);
    console.log(`  edges  : ${edgeStats[p]}`);
    const sample = b.nodes.slice(0, 3).map((n) => n.id);
    console.log(`  sample : ${JSON.stringify(sample)}`);
  }
  console.log(`\n[__root / dropped]`);
  console.log(`  dropped nodes : ${buckets.__root.dropped.length}`);
  console.log(`  root edges    : ${edgeStats.__root}`);
  if (buckets.__root.dropped.length) {
    console.log("  sample dropped ids:", buckets.__root.dropped.slice(0, 5).map((n) => n.id));
  }

  console.log("\n=== 源文件 ===");
  for (const f of [SOURCE_JSON, SOURCE_META, SOURCE_SCAN]) {
    try {
      const st = await fs.stat(f);
      console.log(`  ${path.relative(REPO_ROOT, f)}  ${(st.size / 1024 / 1024).toFixed(2)} MB`);
    } catch {
      console.log(`  ${path.relative(REPO_ROOT, f)}  (missing)`);
    }
  }

  if (!isApply) {
    console.log("\n[DRY-RUN] 未修改任何文件。带上 --apply 真正执行搬迁。");
    return;
  }

  // ---------- APPLY ----------
  console.log("\n=== 备份原文件 ===");
  await fs.copyFile(SOURCE_JSON, `${SOURCE_JSON}.bak.${SUFFIX_BACKUP}`);
  try { await fs.copyFile(SOURCE_META, `${SOURCE_META}.bak.${SUFFIX_BACKUP}`); } catch {}
  try { await fs.copyFile(SOURCE_SCAN, `${SOURCE_SCAN}.bak.${SUFFIX_BACKUP}`); } catch {}

  // 写子项目目录
  for (const p of SUBPROJECTS) {
    const dir = path.join(REPO_ROOT, p, ".understand-anything");
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(path.join(dir, "intermediate"), { recursive: true });

    const subGraph = {
      version: graph.version || "1.0.0",
      project: {
        ...(graph.project || {}),
        name: p,
        scope: p,
        parent: REPO_ROOT.split(/[\\/]/).pop(),
        relocatedAt: new Date().toISOString(),
      },
      nodes: buckets[p].nodes,
      edges: edgeBuckets[p],
      layers: (graph.layers || []).filter((l) => l.scope !== "cross-project"),
      tour: (graph.tour && graph.tour.steps)
        ? { ...graph.tour, steps: graph.tour.steps.map((s) => ({ ...s, nodeId: rewriteId(s.nodeId || "", p) })) }
        : graph.tour,
    };
    await fs.writeFile(path.join(dir, "knowledge-graph.json"), JSON.stringify(subGraph));
    console.log(`  wrote ${path.relative(REPO_ROOT, path.join(dir, "knowledge-graph.json"))}  ${(Buffer.byteLength(JSON.stringify(subGraph)) / 1024 / 1024).toFixed(2)} MB`);

    // 子项目 meta.json
    const subMeta = {
      lastAnalyzedAt: new Date().toISOString(),
      gitCommitHash: "N/A (relocated, run understand-anything in subdir to refresh)",
      version: graph.version || "1.0.0",
      analyzedFiles: buckets[p].nodes.filter((n) => n.type === "file").length,
      scope: p,
      parent: path.basename(REPO_ROOT),
      relocatedFrom: "root .understand-anything/",
    };
    await fs.writeFile(path.join(dir, "meta.json"), JSON.stringify(subMeta, null, 2));
    console.log(`  wrote ${path.relative(REPO_ROOT, path.join(dir, "meta.json"))}`);
  }

  // 写根 placeholder
  const placeholderGraph = {
    version: graph.version || "1.0.0",
    project: {
      name: "rhProject (智能培训系统 monorepo)",
      description: "Cross-project overview. Sub-project graphs are isolated under each app's .understand-anything/.",
      languages: [],
      frameworks: [],
      scope: "cross-project-placeholder",
      analyzedAt: new Date().toISOString(),
    },
    nodes: SUBPROJECTS.map((p) => ({
      id: `app:${p}`,
      type: "application",
      label: p,
      name: p,
      scope: p,
      kind: "unknown",
      graphRef: `${p}/.understand-anything/knowledge-graph.json`,
    })),
    edges: [],
    layers: [
      { id: "applications", name: "Applications", scope: "cross-project" },
    ],
    tour: undefined,
  };
  await fs.writeFile(SOURCE_JSON, JSON.stringify(placeholderGraph, null, 2));
  console.log(`\n  wrote ${path.relative(REPO_ROOT, SOURCE_JSON)}  (placeholder, ${SUBPROJECTS.length} apps, 0 edges)`);

  // 根 meta.json
  const rootMeta = {
    lastAnalyzedAt: new Date().toISOString(),
    gitCommitHash: "N/A",
    version: graph.version || "1.0.0",
    analyzedFiles: SUBPROJECTS.length,
    scope: "cross-project-placeholder",
    note: "Run understand-anything inside each subproject to populate its own graph.",
  };
  await fs.writeFile(SOURCE_META, JSON.stringify(rootMeta, null, 2));

  // 把原 intermediate 留在根但加 .bak （不动其它 metadata）
  console.log("\n[DONE] 搬迁完成。备份文件：");
  console.log(`  ${path.relative(REPO_ROOT, SOURCE_JSON)}.bak.${SUFFIX_BACKUP}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
