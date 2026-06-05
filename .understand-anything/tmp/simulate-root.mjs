// 完整模拟根图谱
import fs from "fs";

function normalizeFilePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "");
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

const g = JSON.parse(fs.readFileSync("E:/rhProject/.understand-anything/knowledge-graph.json", "utf8"));
const entries = buildFileTree(g.nodes);
const total = countFiles(entries);
console.log("总 nodes:", g.nodes.length);
console.log("原 file 节点:", g.nodes.filter(n=>n.type==="file").length);
console.log("root.children 数量:", entries.length);
console.log("FileExplorer totalFiles:", total);
console.log("顶层 entry(去重):", entries.map(e => `${e.type}:${e.name}`).join(", "));
