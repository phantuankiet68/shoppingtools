import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getAllowedRoots, safeJoin, normalizeRel } from "@/lib/template-files/paths";

export const runtime = "nodejs";

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
  if (rel.startsWith("styles/")) rel = rel.slice("styles/".length);

  if (!rel.startsWith("admin/shared/templates/")) {
    throw new Error('Style path must start with "admin/shared/templates/"');
  }

  return rel;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const scope = body.scope === "styles" ? "styles" : "templates";
  const rawPath = body.path;

  if (typeof rawPath !== "string" || !rawPath.trim()) {
    return NextResponse.json({ ok: false, error: "Missing path" }, { status: 400 });
  }

  try {
    const { componentsRoot, stylesRoot } = getAllowedRoots();
    const root = scope === "styles" ? stylesRoot : componentsRoot;

    const cleanedRel = scope === "styles" ? sanitizeStylesPath(rawPath) : sanitizeTemplatePath(rawPath);

    const abs = safeJoin(root, cleanedRel);

    await fs.unlink(abs).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Delete failed" }, { status: 400 });
  }
}
