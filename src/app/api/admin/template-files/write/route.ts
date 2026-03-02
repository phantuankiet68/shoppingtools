import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getAllowedRoots, safeJoin, normalizeRel } from "@/lib/template-files/paths";

export const runtime = "nodejs";

function assertExt(p: string) {
  if (!p.endsWith(".tsx") && !p.endsWith(".ts") && !p.endsWith(".css")) {
    throw new Error("Invalid extension");
  }
}

function sanitizeTemplatePath(p: string) {
  let rel = p.replace(/\\/g, "/").trim();

  if (rel.startsWith("@/")) rel = rel.slice(2);
  if (rel.startsWith("src/")) rel = rel.slice("src/".length);
  if (rel.startsWith("components/")) rel = rel.slice("components/".length);
  if (!(rel.startsWith("templates/") || rel.startsWith("admin/shared/templates/"))) {
    throw new Error('Path must start with "templates/" or "admin/shared/templates/"');
  }

  return rel;
}

function sanitizeStylesPath(p: string) {
  let rel = normalizeRel(p);
  rel = rel.replace(/\\/g, "/").trim();
  if (rel.startsWith("@/")) rel = rel.slice(2);
  if (rel.startsWith("src/")) rel = rel.slice("src/".length);
  if (rel.startsWith("components/")) rel = rel.slice("components/".length);
  if (rel.startsWith("styles/")) rel = rel.slice("styles/".length);
  if (!(rel.startsWith("templates/") || rel.startsWith("admin/shared/templates/"))) {
    throw new Error('Style path must start with "templates/" or "admin/shared/templates/"');
  }

  return rel;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const rawPath = body.path;
  const rawContent = body.content;

  if (typeof rawPath !== "string" || !rawPath.trim()) {
    return NextResponse.json({ ok: false, error: "Missing path" }, { status: 400 });
  }

  if (typeof rawContent !== "string") {
    return NextResponse.json({ ok: false, error: "Missing content" }, { status: 400 });
  }

  const relPath = rawPath.trim();

  try {
    assertExt(relPath);
    const scope: "styles" | "templates" = relPath.endsWith(".css")
      ? "styles"
      : body.scope === "styles"
        ? "styles"
        : "templates";

    const { componentsRoot, stylesRoot } = getAllowedRoots();
    const root = scope === "styles" ? stylesRoot : componentsRoot;

    const cleanedRel = scope === "styles" ? sanitizeStylesPath(relPath) : sanitizeTemplatePath(relPath);

    const abs = safeJoin(root, cleanedRel);

    await fs.mkdir(path.dirname(abs), { recursive: true });

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
