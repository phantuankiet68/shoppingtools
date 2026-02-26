import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET() {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const items = await prisma.product.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        sku: true,
        // lấy cover image (nếu bạn muốn)
        images: {
          where: { isCover: true },
          take: 1,
          select: { url: true },
        },
      },
      take: 200, // cap
    });

    return NextResponse.json({
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        skuPrefix: p.sku, // tạm dùng sku làm prefix; nếu bạn có field riêng thì đổi
        image: p.images?.[0]?.url ?? null,
      })),
    });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
