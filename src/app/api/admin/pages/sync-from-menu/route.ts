// app/api/pages/sync-from-menu/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Locale as DbLocale, Prisma } from "@prisma/client";

export const runtime = "nodejs";

type InItem = { title: string; slug: string; path: string };
type Body = {
  locale: DbLocale;
  items: InItem[];
  siteId?: string; // ✅ optional: ưu tiên nếu client truyền
};

async function resolveSiteId(req: Request, hinted?: string): Promise<string> {
  // 1) Ưu tiên siteId truyền vào
  if (hinted) {
    const ok = await prisma.site.findUnique({ where: { id: hinted }, select: { id: true } });
    if (ok?.id) return ok.id;
  }

  // 2) Thử map theo Host header (sitea.local / siteb.local)
  const host = req.headers.get("host")?.split(":")[0] || "";
  if (host) {
    const byDomain = await prisma.site.findUnique({ where: { domain: host }, select: { id: true } });
    if (byDomain?.id) return byDomain.id;
  }

  // 3) Fallback: site đầu tiên
  const first = await prisma.site.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!first?.id) throw new Error("No Site found. Please seed Site first.");
  return first.id;
}

export async function POST(req: Request) {
  try {
    const { locale, items, siteId: hintedSiteId } = (await req.json()) as Body;

    if (!locale || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const siteId = await resolveSiteId(req, hintedSiteId);

    const results: Array<{ id: string; slug: string; path: string; title: string }> = [];

    for (const it of items) {
      if (!it?.title || !it?.slug || !it?.path) continue;

      const createData: Prisma.PageCreateInput = {
        site: { connect: { id: siteId } }, // ✅ bắt buộc gắn site
        locale,
        title: it.title,
        slug: it.slug,
        path: it.path,
        status: "DRAFT",
        blocks: [] as any,
        seoTitle: it.title,
        seoDesc: "",
        coverImage: null,
      };

      const updateData: Prisma.PageUpdateInput = {
        title: it.title,
        path: it.path, // có thể đổi path -> vẫn OK (unique siteId,path)
        seoTitle: it.title,
      };

      // ✅ sử dụng unique mới theo schema: @@unique([siteId, locale, slug])
      const page = await prisma.page.upsert({
        where: { siteId_locale_slug: { siteId, locale, slug: it.slug } },
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
      return NextResponse.json({ error: `Unique constraint failed on: ${e?.meta?.target || "unknown"}` }, { status: 409 });
    }
    console.error("POST /api/pages/sync-from-menu error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
