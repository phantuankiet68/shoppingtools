import { NextResponse } from "next/server";
import fs from "fs/promises";
import { getAllowedRoots, safeJoin, normalizeRel } from "@/lib/template-files/paths";

export const runtime = "nodejs";

function sanitizeTemplatePath(p: string) {
  let rel = normalizeRel(p);

  if (rel.startsWith("@/")) rel = rel.slice(2);
  if (rel.startsWith("src/")) rel = rel.slice("src/".length);
  if (rel.startsWith("components/")) rel = rel.slice("components/".length);

  const idxTemplates = rel.indexOf("templates/");
  const idxAdminShared = rel.indexOf("admin/shared/templates/");

  if (idxTemplates >= 0) return rel.slice(idxTemplates);
  if (idxAdminShared >= 0) return rel.slice(idxAdminShared);

  throw new Error('Template path must contain "templates/" or "admin/shared/templates/"');
}

function sanitizeStylesPath(p: string) {
  let rel = normalizeRel(p);

  if (rel.startsWith("@/")) rel = rel.slice(2);
  if (rel.startsWith("src/")) rel = rel.slice("src/".length);
  if (rel.startsWith("components/")) rel = rel.slice("components/".length);
  if (rel.startsWith("styles/")) rel = rel.slice("styles/".length);

  const idxTemplates = rel.indexOf("templates/");
  const idxAdminShared = rel.indexOf("admin/shared/templates/");

  if (idxTemplates >= 0) return rel.slice(idxTemplates);
  if (idxAdminShared >= 0) return rel.slice(idxAdminShared);

  throw new Error('Style path must contain "templates/" or "admin/shared/templates/"');
}

export async function POST(req: Request) {
  interface DeleteRequestBody {
    path?: unknown;
  }

  const body = (await req.json().catch(() => ({}))) as DeleteRequestBody;
  const rawPath = body.path;

  if (typeof rawPath !== "string" || !rawPath.trim()) {
    return NextResponse.json({ ok: false, error: "Missing path" }, { status: 400 });
  }

  try {
    const scope: "styles" | "templates" = rawPath.trim().endsWith(".css") ? "styles" : "templates";

    const { componentsRoot, stylesRoot } = getAllowedRoots();
    const root = scope === "styles" ? stylesRoot : componentsRoot;

    const cleanedRel = scope === "styles" ? sanitizeStylesPath(rawPath) : sanitizeTemplatePath(rawPath);

    const abs = safeJoin(root, cleanedRel);

    await fs.unlink(abs).catch(() => {});

    return NextResponse.json({ ok: true, scope, path: cleanedRel });
  } catch (e: unknown) {
    console.error("DELETE ERROR:", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message || "Delete failed" }, { status: 400 });
  }
}
