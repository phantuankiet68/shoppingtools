import { NextResponse } from "next/server";

import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET() {
  await requireAdminAuthUser();

  const clientKey = process.env.TIKTOK_CLIENT_KEY;

  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  const scopes = ["user.info.basic", "video.publish"];

  const authUrl =
    `https://www.tiktok.com/v2/auth/authorize/` +
    `?client_key=${clientKey}` +
    `&scope=${scopes.join(",")}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri!)}` +
    `&state=tiktok_auth`;

  return NextResponse.redirect(authUrl);
}
