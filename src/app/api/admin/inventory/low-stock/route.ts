import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 10);

    const search = String(searchParams.get("search") || "");

    const threshold = Number(searchParams.get("threshold") || 5);

    const skip = (page - 1) * limit;

    const where = {
      stock: {
        lte: threshold,
      },

      product: {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },

          {
            sku: {
              contains: search,
              mode: "insensitive" as const,
            },
          },

          {
            barcode: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      },
    };

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          stock: "asc",
        },

        include: {
          product: {
            include: {
              category: true,
              brand: true,
              images: true,
            },
          },
        },
      }),

      prisma.inventory.count({
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

      meta: {
        threshold,
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
