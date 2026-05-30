import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { EmailConnectionStatus, EmailProvider } from "@/generated/prisma";

import { encrypt } from "@/lib/security/encryption";

import { verifyOAuthState } from "@/lib/email/oauth-state";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const code = searchParams.get("code");

    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ADMIN_URL}/marketing/email?error=oauth`);
    }

    const payload = verifyOAuthState(state);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("TOKEN_EXCHANGE_FAILED");
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    const encryptedAccessToken = encrypt(tokenData.access_token);

    const encryptedRefreshToken = encrypt(tokenData.refresh_token ?? "");

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await prisma.emailProviderConfig.upsert({
      where: {
        siteId: payload.siteId,
      },

      update: {
        provider: EmailProvider.GOOGLE,

        email: profile.email,

        senderName: profile.name,

        name: profile.name,

        picture: profile.picture,

        status: EmailConnectionStatus.CONNECTED,

        accessTokenEncrypted: encryptedAccessToken,

        refreshTokenEncrypted: encryptedRefreshToken,

        expiresAt,
      },

      create: {
        siteId: payload.siteId,

        provider: EmailProvider.GOOGLE,

        email: profile.email,

        senderName: profile.name,

        name: profile.name,

        picture: profile.picture,

        status: EmailConnectionStatus.CONNECTED,

        accessTokenEncrypted: encryptedAccessToken,

        refreshTokenEncrypted: encryptedRefreshToken,

        expiresAt,
      },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ADMIN_URL}/marketing/email?success=connected`);
  } catch (error) {
    console.error("[GOOGLE_EMAIL_CALLBACK]", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
