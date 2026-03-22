import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { ok: false, message: "Missing productId" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      data: reviews.map((r) => ({
        id: r.id,
        author: r.authorName,
        avatar: r.avatar,
        rating: r.rating,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt,
        verified: r.verified,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}