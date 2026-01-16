import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, PageStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const offset = Math.max(0, Number(searchParams.get("offset") || 0));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 8)));
  const statusParam = searchParams.get("status");
  const sortKeyParam = (searchParams.get("sort") as "updatedAt" | "createdAt" | "title") || "updatedAt";
  const sortDirParam = (searchParams.get("dir") as "asc" | "desc") || "desc";
  const siteId = searchParams.get("siteId") || undefined;

  const ci = (v: string) => ({ contains: v, mode: Prisma.QueryMode.insensitive } as const);

  const where: Prisma.PageWhereInput = {
    ...(siteId ? { siteId } : {}),
    ...(statusParam && statusParam !== "all" ? { status: statusParam as PageStatus } : {}),
    ...(q ? { OR: [{ title: ci(q) }, { slug: ci(q) }, { path: ci(q) }] } : {}),
  };

  const orderBy: Prisma.PageOrderByWithRelationInput = { [sortKeyParam]: sortDirParam };

  const [items, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        siteId: true,
        site: { select: { domain: true, name: true } },
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
}
