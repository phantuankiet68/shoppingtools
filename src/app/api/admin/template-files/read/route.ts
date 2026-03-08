import { NextResponse } from "next/server";
import fs from "fs/promises";
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
    throw new Error('Template path must start with "templates/" or "admin/shared/templates/"');
  }

  return rel;
}

function sanitizeStylesPath(p: string) {
  let rel = normalizeRel(p);

  if (rel.startsWith("@/")) rel = rel.slice(2);
  if (rel.startsWith("src/")) rel = rel.slice("src/".length);
  if (rel.startsWith("styles/")) rel = rel.slice("styles/".length);

  if (!rel.startsWith("templates/")) {
    throw new Error('Style path must start with "styles/templates/"');
  }

  return rel;
}

export async function POST(req: Request) {
  interface ReadRequestBody {
    path?: string;
  }

  const body = (await req.json().catch(() => ({}))) as ReadRequestBody;
  const rawPath = String(body.path || "").trim();

  try {
    assertExt(rawPath);

    const scope: "styles" | "templates" = rawPath.endsWith(".css") ? "styles" : "templates";

    const { componentsRoot, stylesRoot } = getAllowedRoots();

    const relPath = scope === "styles" ? sanitizeStylesPath(rawPath) : sanitizeTemplatePath(rawPath);

    const root = scope === "styles" ? stylesRoot : componentsRoot;
    const abs = safeJoin(root, relPath);
    const content = await fs.readFile(abs, "utf8");

    return NextResponse.json({
      ok: true,
      scope,
      path: relPath,
      content,
    });
  } catch (e: unknown) {
    console.error("READ ERROR:", e);
    // when e is unknown, use conditional to extract message
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message || "Read failed" }, { status: 400 });
  }
}
