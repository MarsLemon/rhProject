// 完整模拟 dashboard buildFileTree + totalFiles
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

function buildFileTree(nodes) {
  const files = new Map();
  for (const node of nodes) {
    if (!node.filePath) continue;
    const filePath = normalizeFilePath(node.filePath);
    if (!filePath) continue;
    files.set(filePath, bestFileNode(files.get(filePath), node));
  }
  const root = { name: "", path: "", type: "folder", children: [] };
  const folders = new Map([["", root]]);
  for (const [filePath, node] of files) {
    const parts = filePath.split("/");
    let parent = root;
    let currentPath = "";
    for (let i = 0; i < parts.length; i += 1) {
      const name = parts[i];
      currentPath = currentPath ? `${currentPath}/${name}` : name;
      const isFile = i === parts.length - 1;
      if (isFile) {
        parent.children.push({ name, path: currentPath, type: "file", children: [], nodeId: node.id });
        continue;
      }
      let folder = folders.get(currentPath);
      if (!folder) {
        folder = { name, path: currentPath, type: "folder", children: [] };
        folders.set(currentPath, folder);
        parent.children.push(folder);
      }
      parent = folder;
    }
  }
  return root.children;
}

function countFiles(items) {
  return items.reduce(
    (count, item) => count + (item.type === "file" ? 1 : countFiles(item.children)),
    0,
  );
}

for (const sub of ["wk-train-center-ui", "wk-PPTist-ui", "wk-train-center-service"]) {
  console.log("========== " + sub + " ==========");
  const g = JSON.parse(fs.readFileSync(
    `E:/rhProject/${sub}/.understand-anything/knowledge-graph.json`, "utf8"
  ));
  const entries = buildFileTree(g.nodes);
  const total = countFiles(entries);
  console.log("root.children 数量:", entries.length);
  console.log("totalFiles:", total);
  console.log("顶层 file:", entries.filter(e => e.type === "file").length);
  console.log("顶层 folder:", entries.filter(e => e.type === "folder").length);
  console.log("总 file (递归):", total);
}
