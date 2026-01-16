import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getAllowedRoots, normalizeRel } from "@/lib/template-files/paths";

export const runtime = "nodejs";

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

export async function GET(req: Request) {
  // TODO: await requireAdminAuthUser();

  const { componentsRoot } = getAllowedRoots();

  // ✅ chỉ list trong src/components/templates và src/components/admin/templates
  const allowPrefixes = ["templates/", "admin/templates/"];

  const all = (await walk(componentsRoot))
    .filter((p) => p.endsWith(".tsx"))
    .map((abs) => normalizeRel(path.relative(componentsRoot, abs)))
    .filter((rel) => allowPrefixes.some((pre) => rel.startsWith(pre)));

  return NextResponse.json({ ok: true, files: all.sort() });
}
