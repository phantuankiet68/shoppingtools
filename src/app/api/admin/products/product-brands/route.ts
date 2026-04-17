import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId");
    const lite = searchParams.get("lite");

    if (!siteId) {
      return NextResponse.json({ error: "siteId is required" }, { status: 400 });
    }

    const brands = await prisma.productBrand.findMany({
      where: {
        siteId,
      },
      orderBy: {
        name: "asc",
      },
      select:
        lite === "1"
          ? {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            }
          : {
              id: true,
              siteId: true,
              name: true,
              slug: true,
              description: true,
              logoUrl: true,
              createdAt: true,
              updatedAt: true,
            },
    });

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("GET product brands error:", error);

    return NextResponse.json({ error: "Failed to fetch product brands" }, { status: 500 });
  }
}
