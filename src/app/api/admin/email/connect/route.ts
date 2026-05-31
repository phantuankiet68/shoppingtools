import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { createOAuthState } from "@/lib/email/oauth-state";

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
        name: true,
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

    const providerConfig = await prisma.emailProviderConfig.findUnique({
      where: {
        siteId: site.id,
      },
      select: {
        googleClientId: true,
        googleClientSecretEncrypted: true,
      },
    });

    if (!providerConfig) {
      return NextResponse.json(
        {
          success: false,
          message: "Email provider configuration not found",
        },
        {
          status: 404,
        },
      );
    }

    if (!providerConfig.googleClientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Client ID has not been configured",
        },
        {
          status: 400,
        },
      );
    }

    if (!providerConfig.googleClientSecretEncrypted) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Client Secret has not been configured",
        },
        {
          status: 400,
        },
      );
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!redirectUri) {
      return NextResponse.json(
        {
          success: false,
          message: "GOOGLE_REDIRECT_URI is missing",
        },
        {
          status: 500,
        },
      );
    }

    const state = createOAuthState({
      siteId: site.id,
      userId: authUser.id,
      timestamp: Date.now(),
    });

    const scopes = ["openid", "email", "profile", "https://www.googleapis.com/auth/gmail.send"];

    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    googleUrl.searchParams.set("client_id", providerConfig.googleClientId);

    googleUrl.searchParams.set("redirect_uri", redirectUri);

    googleUrl.searchParams.set("response_type", "code");

    googleUrl.searchParams.set("access_type", "offline");

    googleUrl.searchParams.set("prompt", "consent");

    googleUrl.searchParams.set("scope", scopes.join(" "));

    googleUrl.searchParams.set("state", state);

    console.log("[EMAIL_CONNECT]", {
      siteId: site.id,
      siteName: site.name,
      clientId: providerConfig.googleClientId,
    });

    return NextResponse.redirect(googleUrl.toString());
  } catch (error) {
    console.error("[EMAIL_CONNECT_ERROR]", error);

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
