import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        image: true,
        html: true,
      },
    });

    return NextResponse.json({
      success: true,
      items: templates,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load templates",
      },
      {
        status: 500,
      },
    );
  }
}
