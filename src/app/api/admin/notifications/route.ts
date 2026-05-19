import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load notifications",
      },
      {
        status: 500,
      },
    );
  }
}
