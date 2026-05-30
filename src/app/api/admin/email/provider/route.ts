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

    const provider = await prisma.emailProviderConfig.findUnique({
      where: {
        siteId,
      },
      select: {
        provider: true,
        email: true,
        senderName: true,
        name: true,
        picture: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!provider) {
      return NextResponse.json({
        success: true,
        connected: false,
        provider: null,
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,

      provider: {
        provider: provider.provider,

        email: provider.email,

        senderName: provider.senderName,

        name: provider.name,

        picture: provider.picture,

        status: provider.status,

        expiresAt: provider.expiresAt,

        createdAt: provider.createdAt,

        updatedAt: provider.updatedAt,
      },
    });
  } catch (error) {
    console.error("[EMAIL_PROVIDER_GET]", error);

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
export async function DELETE(req: NextRequest) {
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

    const provider = await prisma.emailProviderConfig.findUnique({
      where: {
        siteId,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      return NextResponse.json({
        success: true,
        message: "Provider already disconnected",
      });
    }

    await prisma.emailProviderConfig.delete({
      where: {
        siteId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email provider disconnected",
    });
  } catch (error) {
    console.error("[EMAIL_PROVIDER_DELETE]", error);

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
