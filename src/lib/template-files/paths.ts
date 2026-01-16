import fs from "fs";
import path from "path";

function exists(p: string) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

export function getAllowedRoots() {
  const cwd = process.cwd();

  const componentsRoot = path.join(cwd, "src", "components");
  const stylesRoot = path.join(cwd, "src", "styles");

  if (!exists(componentsRoot)) throw new Error(`componentsRoot not found: ${componentsRoot}`);
  if (!exists(stylesRoot)) throw new Error(`stylesRoot not found: ${stylesRoot}`);

  return { componentsRoot, stylesRoot };
}

export function normalizeRel(p: string) {
  return p.replaceAll("\\", "/").replace(/^\/+/, "");
}

export function safeJoin(root: string, rel: string) {
  const cleaned = normalizeRel(rel);
  const abs = path.join(root, cleaned);
  const norm = path.normalize(abs);
  if (!norm.startsWith(root)) throw new Error("Invalid path");
  return norm;
}
