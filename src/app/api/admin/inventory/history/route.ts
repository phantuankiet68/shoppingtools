import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    // filter type
    if (type) {
      where.type = type;
    }

    // search
    if (search.trim()) {
      where.OR = [
        {
          note: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          product: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },

        {
          product: {
            sku: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      }),

      prisma.inventoryTransaction.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,

      data: items,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
