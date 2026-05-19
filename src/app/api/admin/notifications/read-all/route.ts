import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  try {
    await prisma.notification.updateMany({
      where: {
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark notifications as read",
      },
      {
        status: 500,
      },
    );
  }
}
