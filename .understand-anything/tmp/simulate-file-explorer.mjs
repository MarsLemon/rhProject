// 模拟 dashboard 的 FileExplorer 逻辑
import fs from "fs";

function normalizeFilePath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "");
  if (!normalized || normalized === "." || normalized.includes("\0")) return null;
  if (normalized.split("/").some((part) => part === "..")) return null;
  return normalized;
}
function bestFileNode(existing, candidate) {
  if (!existing) return candidate;
  if (existing.type !== "file" && candidate.type === "file") return candidate;
  return existing;
}

for (const sub of ["wk-train-center-ui", "wk-PPTist-ui", "wk-train-center-service"]) {
  console.log("========== " + sub + " ==========");
  const g = JSON.parse(fs.readFileSync(
    `E:/rhProject/${sub}/.understand-anything/knowledge-graph.json`, "utf8"
  ));
  console.log("总 nodes:", g.nodes.length);

  const files = new Map();
  let skippedNoPath = 0;
  let skippedNormalize = 0;
  for (const node of g.nodes) {
    if (!node.filePath) { skippedNoPath++; continue; }
    const filePath = normalizeFilePath(node.filePath);
    if (!filePath) { skippedNormalize++; continue; }
    files.set(filePath, bestFileNode(files.get(filePath), node));
  }

  console.log("跳过(无 filePath):", skippedNoPath);
  console.log("跳过(normalize 失败):", skippedNormalize);
  console.log("Map size (unique filePaths):", files.size);

  const typeCount = {};
  for (const v of files.values()) {
    typeCount[v.type] = (typeCount[v.type] || 0) + 1;
  }
  console.log("Map values 按类型:", typeCount);
  console.log("Map 中 type=file 的数量:", typeCount["file"] || 0, "(期望与原 file 节点数一致)");
}
