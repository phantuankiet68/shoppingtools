import { API_ROUTES } from "@/constants/api";

export type TemplateItem = {
  path: string;
  name: string;
  kind: string;
  group?: string;
};

export const PAGE_SIZE = 10;
export function basenameNoExt(p: string) {
  const file = p.split("/").at(-1) || p;
  return file.replace(/\.tsx$/i, "");
}

export function parseTemplatePath(p: string) {
  const parts = p.split("/").filter(Boolean);
  const tIdx = parts.lastIndexOf("templates");
  const after = tIdx >= 0 ? parts.slice(tIdx + 1) : parts;

  const kind = after[0] || "unknown";
  const group = after[1] || "root";
  const name = (after.at(-1) || p).replace(/\.tsx$/i, "") || basenameNoExt(p);

  return { kind, group, name };
}

export function normalizeClientPath(raw: string) {
  let p = (raw || "").trim();
  if (!p) return p;
  if (p.startsWith("@/")) p = p.slice(2);
  if (p.startsWith("src/")) p = p.slice(4);
  return p;
}

export function normalizeForScope(raw: string, scope: "templates" | "styles") {
  let p = normalizeClientPath(raw);

  if (scope === "styles") {
    if (p.startsWith("components/")) p = p.slice("components/".length);
    if (p.startsWith("styles/")) p = p.slice("styles/".length);
  } else {
    if (p.startsWith("styles/")) p = p.slice("styles/".length);
  }

  return p;
}

export async function apiList(kind?: string, signal?: AbortSignal) {
  const qs = kind ? `?kind=${encodeURIComponent(kind)}` : "";

  const res = await fetch(`${API_ROUTES.ADMIN_TEMPLATE_FILES.LIST}${qs}`, {
    cache: "no-store",
    signal,
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "List failed");
  return (json.files as string[]) || [];
}

export async function apiRead(relPath: string, signal?: AbortSignal) {
  const safePath = normalizeClientPath(relPath);

  const res = await fetch(API_ROUTES.ADMIN_TEMPLATE_FILES.READ, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: safePath }),
    signal,
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Read failed");
  return String(json.content ?? "");
}

export async function apiWrite(relPath: string, content: string, scope: "templates" | "styles") {
  const safePath = normalizeForScope(relPath, scope);

  const res = await fetch(API_ROUTES.ADMIN_TEMPLATE_FILES.WRITE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: safePath, content, scope }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Write failed");
  return true;
}

export async function apiDelete(relPath: string, scope: "templates" | "styles") {
  const safePath = normalizeForScope(relPath, scope);

  const res = await fetch(API_ROUTES.ADMIN_TEMPLATE_FILES.DELETE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: safePath, scope }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Delete failed");
  return true;
}

export function guessCssModulePath(tsxCode: string): string | null {
  const m = tsxCode.match(/from\s+["']([^"']+\.module\.css)["']/);
  if (!m) return null;

  const importPath = m[1];
  if (importPath.startsWith("@/")) return importPath.replace("@/", "");
  return importPath;
}

export function buildTemplateList(files: string[]): TemplateItem[] {
  return files.map((p0) => {
    const p = normalizeClientPath(p0);
    const meta = parseTemplatePath(p);

    return {
      path: p,
      kind: meta.kind,
      group: meta.group,
      name: meta.name || basenameNoExt(p),
    };
  });
}
