import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuthUser();

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json({ error: "siteId is required" }, { status: 400 });
    }

    const items = await prisma.product.findMany({
      where: {
        siteId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            imageUrl: true,
          },
        },
      },
      take: 200,
    });

    return NextResponse.json({
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        skuPrefix: p.slug,
        image: p.images[0]?.imageUrl ?? null,
      })),
    });
  } catch (e: any) {
    const message = e?.message || "Server error";
    const status = /unauthorized/i.test(message) ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
