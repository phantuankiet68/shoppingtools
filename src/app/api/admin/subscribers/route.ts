import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAdminAuthUser();

    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        {
          success: false,
          message: "siteId is required",
        },
        {
          status: 400,
        },
      );
    }

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,

        ownerUserId: authUser.id,

        deletedAt: null,
      },

      select: {
        id: true,
      },
    });

    if (!site) {
      return NextResponse.json(
        {
          success: false,
          message: "Site not found",
        },
        {
          status: 404,
        },
      );
    }

    const subscribers = await prisma.subscriber.findMany({
      where: {
        siteId,
      },

      orderBy: {
        subscribedAt: "desc",
      },

      select: {
        id: true,

        email: true,

        name: true,

        status: true,

        subscribedAt: true,
      },
    });

    return NextResponse.json({
      success: true,

      items: subscribers,

      total: subscribers.length,
    });
  } catch (error) {
    console.error("[ADMIN_SUBSCRIBERS_GET]", error);

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
