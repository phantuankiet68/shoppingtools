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
  if (!(rel.startsWith("templates/") || rel.startsWith("admin/templates/"))) {
    throw new Error('Path must start with "templates/" or "admin/templates/"');
  }
  return rel;
}

function sanitizeStylesPath(p: string) {
  let rel = normalizeRel(p);
  if (rel.startsWith("styles/")) rel = rel.slice("styles/".length);
  if (!rel.startsWith("admin/templates/")) {
    throw new Error('Style path must start with "admin/templates/"');
  }
  return rel;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const scope = body.scope === "styles" ? "styles" : "templates";
  const rawPath = body.path; // giữ nguyên để check undefined
  const rawContent = body.content;

  // ✅ validate sớm để khỏi crash
  if (typeof rawPath !== "string" || !rawPath.trim()) {
    return NextResponse.json({ ok: false, error: "Missing path" }, { status: 400 });
  }
  if (typeof rawContent !== "string") {
    return NextResponse.json({ ok: false, error: "Missing content" }, { status: 400 });
  }

  const relPath = rawPath.trim();

  try {
    assertExt(relPath);

    const { componentsRoot, stylesRoot } = getAllowedRoots();
    const root = scope === "styles" ? stylesRoot : componentsRoot;

    const cleanedRel = scope === "styles" ? sanitizeStylesPath(relPath) : sanitizeTemplatePath(relPath);
    const abs = safeJoin(root, cleanedRel);

    // backup
    try {
      const old = await fs.readFile(abs, "utf8");
      await fs.writeFile(abs + ".bak", old, "utf8");
    } catch {}

    await fs.writeFile(abs, rawContent, "utf8");
    return NextResponse.json({ ok: true, scope, path: cleanedRel });
  } catch (e: any) {
    console.error("WRITE ERROR:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Write failed" }, { status: 400 });
  }
}
