import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function resolveSiteId(req: Request): Promise<{ siteId: string; domain: string }> {
  const url = new URL(req.url);
  const qpSiteId = String(url.searchParams.get("siteId") ?? "").trim();

  const hostHeader = req.headers.get("x-site-domain") ?? req.headers.get("host") ?? "";
  const domain = hostHeader.split(":")[0].toLowerCase();

  if (qpSiteId) return { siteId: qpSiteId, domain };

  if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
    const site = await prisma.site.findUnique({
      where: { domain },
      select: { id: true },
    });

    if (site?.id) return { siteId: site.id, domain };
  }

  const defaultSite = await prisma.site.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, domain: true },
  });

  if (defaultSite) {
    return {
      siteId: defaultSite.id,
      domain: defaultSite.domain,
    };
  }

  return { siteId: "", domain };
}

export async function GET(req: Request) {
  try {
    const { siteId, domain } = await resolveSiteId(req);

    if (!siteId) {
      return jsonError(`Missing siteId. Query param not found and no site matched domain: ${domain || "(empty)"}`, 400);
    }

    const where: Prisma.ProductWhereInput = {
      siteId,
      deletedAt: null,
      isVisible: true,
      status: "ACTIVE",
    };

    const items = await prisma.product.findMany({
      where,
      take: 8,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        productType: true,
        tags: true,
        price: true,
        marketPrice: true,
        savingPrice: true,
        productQty: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 1,
          select: {
            id: true,
            imageUrl: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json({
      siteId,
      domain,
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        href: p.slug ? `/products/${p.slug}` : `/products/${p.id}`,
        shortDescription: p.shortDescription,
        productType: p.productType,
        tags: p.tags,
        price: p.price?.toString() ?? null,
        marketPrice: p.marketPrice?.toString() ?? null,
        savingPrice: p.savingPrice?.toString() ?? null,
        productQty: p.productQty,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        category: p.category,
        brand: p.brand,
        image: p.images[0]
          ? {
              id: p.images[0].id,
              url: p.images[0].imageUrl,
              sort: p.images[0].sortOrder,
            }
          : null,
      })),
      total: items.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return jsonError(message, 500);
  }
}
