// app/api/pages/sync-from-menu/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type InItem = { title: string; slug: string; path: string };

type Body = {
  items: InItem[];
  siteId?: string;
};

function normalizeSlug(raw: string) {
  const s = (raw || "").trim();
  if (!s || s === "/") return "/";
  return s.replace(/^\/+/, "").replace(/\/+$/, "");
}
function ensureLeadingSlash(p: string) {
  const s = (p || "").trim();
  if (!s) return "/";
  return s.startsWith("/") ? s : `/${s}`;
}
function pathFromSlug(slug: string) {
  return slug === "/" ? "/" : `/${slug}`;
}

async function resolveSiteId(req: Request, hinted?: string): Promise<string> {
  if (hinted) {
    const ok = await prisma.site.findUnique({ where: { id: hinted }, select: { id: true } });
    if (ok?.id) return ok.id;
  }

  const host = req.headers.get("host")?.split(":")[0] || "";
  if (host) {
    const byDomain = await prisma.site.findUnique({ where: { domain: host }, select: { id: true } });
    if (byDomain?.id) return byDomain.id;
  }
  const first = await prisma.site.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!first?.id) throw new Error("No Site found. Please seed Site first.");
  return first.id;
}

export async function POST(req: Request) {
  try {
    const { items, siteId: hintedSiteId } = (await req.json()) as Body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ ok: false, error: "Invalid payload: items must be an array" }, { status: 400 });
    }

    const siteId = await resolveSiteId(req, hintedSiteId);

    const results: Array<{ id: string; slug: string; path: string; title: string }> = [];

    for (const it of items) {
      if (!it?.title || !it?.slug) continue;
      const slug = normalizeSlug(it.slug);
      const path = ensureLeadingSlash(it.path || pathFromSlug(slug));
      const title = String(it.title).trim();

      if (!title) continue;

      const createData: Prisma.PageCreateInput = {
        site: { connect: { id: siteId } },
        title,
        slug,
        path,
        status: "DRAFT",
        blocks: [] as any,
        seoTitle: title,
        seoDesc: "",
        coverImage: null,
      };

      const updateData: Prisma.PageUpdateInput = {
        title,
        path, // có thể đổi path -> vẫn OK (unique siteId,path)
        seoTitle: title,
      };

      // ✅ unique mới theo schema: @@unique([siteId, slug])
      const page = await prisma.page.upsert({
        where: { siteId_slug: { siteId, slug } },
        create: createData,
        update: updateData,
        select: { id: true, slug: true, path: true, title: true },
      });

      results.push(page);
    }

    return NextResponse.json({ ok: true, siteId, count: results.length, pages: results });
  } catch (e: any) {
    if (e?.code === "P2002") {
      // Đụng unique (thường là siteId,path) khi update đổi path trùng
      return NextResponse.json({ ok: false, error: `Unique constraint failed on: ${e?.meta?.target || "unknown"}` }, { status: 409 });
    }
    console.error("POST /api/pages/sync-from-menu error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
