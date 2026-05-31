import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdminAuthUser } from "@/lib/auth/auth";

import { encrypt } from "@/lib/security/encryption";

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
        googleClientId: true,
      },
    });

    return NextResponse.json({
      success: true,

      data: {
        googleClientId: provider?.googleClientId ?? "",
      },
    });
  } catch (error) {
    console.error("[EMAIL_PROVIDER_SETTINGS_GET]", error);

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

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAdminAuthUser();

    const body = await req.json();

    const { siteId, googleClientId, googleClientSecret } = body;

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

    if (!googleClientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Client ID is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!googleClientSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Client Secret is required",
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

    const encryptedSecret = encrypt(googleClientSecret);

    await prisma.emailProviderConfig.upsert({
      where: {
        siteId,
      },

      update: {
        googleClientId,

        googleClientSecretEncrypted: encryptedSecret,
      },

      create: {
        siteId,

        googleClientId,

        googleClientSecretEncrypted: encryptedSecret,

        provider: "GOOGLE",

        email: "",

        accessTokenEncrypted: "",

        refreshTokenEncrypted: "",

        expiresAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Google OAuth settings saved successfully",
    });
  } catch (error) {
    console.error("[EMAIL_PROVIDER_SETTINGS_POST]", error);

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
