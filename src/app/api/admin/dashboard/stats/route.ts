import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const siteId = searchParams.get("siteId");

    if (!userId || !siteId) {
      return NextResponse.json(
        { error: "Missing userId or siteId" },
        { status: 400 }
      );
    }

    const [
      totalSites,
      totalProducts,
      totalPages,
      sold,
      totalStock,
      totalUsers, // 🔥 thêm
    ] = await Promise.all([
      prisma.site.count({
        where: {
          ownerUserId: userId,
          deletedAt: null,
        },
      }),

      prisma.product.count({
        where: {
          siteId: siteId,
          deletedAt: null,
        },
      }),

      prisma.page.count({
        where: {
          siteId: siteId,
        },
      }),

      prisma.orderItem.aggregate({
        _sum: {
          qty: true,
        },
        where: {
          siteId: siteId,
          order: {
            status: "COMPLETED",
          },
        },
      }),

      prisma.productVariant.aggregate({
        _sum: {
          stockQty: true,
        },
        where: {
          siteId: siteId,
        },
      }),

      // 🔥 USERS COUNT THEO SITE
      prisma.workspaceMember.count({
        where: {
          siteId: siteId,
        },
      }),
    ]);

    const productsSold = sold._sum.qty ?? 0;
    const stock = totalStock._sum.stockQty ?? 0;
    const stockRemaining = stock - productsSold;

    return NextResponse.json({
      totalSites,
      totalProducts,
      totalPages,
      productsSold,
      stockRemaining,
      totalStock: stock,
      totalUsers,
    });
  } catch (error) {
    console.error("STATS API ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}