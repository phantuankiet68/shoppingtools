import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { EmailConnectionStatus, EmailProvider } from "@/generated/prisma";

import { encrypt, decrypt } from "@/lib/security/encryption";

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

    const providerConfig = await prisma.emailProviderConfig.findUnique({
      where: {
        siteId: payload.siteId,
      },
      select: {
        googleClientId: true,
        googleClientSecretEncrypted: true,
      },
    });

    if (!providerConfig) {
      throw new Error("EMAIL_PROVIDER_CONFIG_NOT_FOUND");
    }

    if (!providerConfig.googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID_NOT_CONFIGURED");
    }

    if (!providerConfig.googleClientSecretEncrypted) {
      throw new Error("GOOGLE_CLIENT_SECRET_NOT_CONFIGURED");
    }

    const googleClientSecret = decrypt(providerConfig.googleClientSecretEncrypted);

    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!redirectUri) {
      throw new Error("GOOGLE_REDIRECT_URI_MISSING");
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,

        client_id: providerConfig.googleClientId,

        client_secret: googleClientSecret,

        redirect_uri: redirectUri,

        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("[GOOGLE_TOKEN_ERROR]", tokenData);

      throw new Error("TOKEN_EXCHANGE_FAILED");
    }

    if (!tokenData.access_token) {
      throw new Error("ACCESS_TOKEN_MISSING");
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

    await prisma.emailProviderConfig.update({
      where: {
        siteId: payload.siteId,
      },

      data: {
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

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ADMIN_URL}/email?success=connected`);
  } catch (error) {
    console.error("[GOOGLE_EMAIL_CALLBACK]", error);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ADMIN_URL}/email?error=callback`);
  }
}
