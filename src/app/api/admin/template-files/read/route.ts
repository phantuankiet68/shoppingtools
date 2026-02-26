import { NextResponse } from "next/server";
import fs from "fs/promises";
import { getAllowedRoots, safeJoin, normalizeRel } from "@/lib/template-files/paths";

export const runtime = "nodejs";

function assertExt(p: string) {
  if (!p.endsWith(".tsx") && !p.endsWith(".ts") && !p.endsWith(".css")) throw new Error("Invalid extension");
}

function sanitizeTemplatePath(p: string) {
  let rel = normalizeRel(p);
  if (rel.startsWith("components/")) rel = rel.slice("components/".length);
  if (!(rel.startsWith("templates/") || rel.startsWith("admin/shared/templates/"))) {
    throw new Error('Path must start with "templates/" or "admin/shared/templates/"');
  }

  return rel;
}

function sanitizeStylesPath(p: string) {
  let rel = normalizeRel(p);
  if (rel.startsWith("styles/")) rel = rel.slice("styles/".length);
  if (!rel.startsWith("admin/shared/templates/")) {
    throw new Error('Style path must start with "admin/shared/templates/"');
  }
  return rel;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const scope = body.scope === "styles" ? "styles" : "templates";
  const rawPath = String(body.path || "");

  try {
    assertExt(rawPath);

    const { componentsRoot, stylesRoot } = getAllowedRoots();

    const relPath = scope === "styles" ? sanitizeStylesPath(rawPath) : sanitizeTemplatePath(rawPath);
    const root = scope === "styles" ? stylesRoot : componentsRoot;

    const abs = safeJoin(root, relPath);
    const content = await fs.readFile(abs, "utf8");

    return NextResponse.json({ ok: true, scope, path: relPath, content });
  } catch (e: any) {
    console.error("READ ERROR:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Read failed" }, { status: 400 });
  }
}
