import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";
type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const PAGE_STATUSES: PageStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const offsetRaw = Number(searchParams.get("offset") || 0);
    const limitRaw = Number(searchParams.get("limit") || 8);

    const offset = Number.isFinite(offsetRaw) ? Math.max(0, offsetRaw) : 0;
    const limit = Number.isFinite(limitRaw)
      ? Math.min(100, Math.max(1, limitRaw))
      : 8;

    const statusParam = (searchParams.get("status") || "").trim();
    const siteId = (searchParams.get("siteId") || "").trim() || undefined;

    const rawSort = (searchParams.get("sort") || "updatedAt").trim();
    const rawDir = (searchParams.get("dir") || "desc").trim();

    const sortKey: SortKey =
      rawSort === "createdAt" || rawSort === "title" ? rawSort : "updatedAt";

    const sortDir: SortDir = rawDir === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (siteId && siteId !== "all") {
      where.siteId = siteId;
    }

    if (statusParam && statusParam !== "all") {
      if (PAGE_STATUSES.includes(statusParam as PageStatus)) {
        where.status = statusParam;
      } else {
        return NextResponse.json(
          {
            items: [],
            total: 0,
            hasMore: false,
            error: `Invalid status: ${statusParam}`,
          },
          { status: 400 },
        );
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { slug: { contains: q } },
        { path: { contains: q } },
      ];
    }

    const orderBy: Record<string, SortDir> = {
      [sortKey]: sortDir,
    };

    const [items, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          siteId: true,
          site: {
            select: {
              domain: true,
              name: true,
            },
          },
          title: true,
          slug: true,
          path: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.page.count({ where }),
    ]);

    const hasMore = offset + items.length < total;

    return NextResponse.json({
      items: items.map((p) => ({
        id: p.id,
        siteId: p.siteId,
        siteDomain: p.site?.domain || null,
        siteName: p.site?.name || null,
        title: p.title,
        slug: p.slug === "/" ? "/" : p.slug,
        path: p.path,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total,
      hasMore,
    });
  } catch (e: unknown) {
    console.error("GET /api/admin/builder/pages/list failed:", e);

    const message = e instanceof Error ? e.message : "Failed to load pages";

    return NextResponse.json(
      {
        items: [],
        total: 0,
        hasMore: false,
        error: message,
      },
      { status: 500 },
    );
  }
}