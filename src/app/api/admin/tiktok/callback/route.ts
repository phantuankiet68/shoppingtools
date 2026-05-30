import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();

    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        {
          error: "Code missing",
        },
        {
          status: 400,
        },
      );
    }

    /*
      TODO:
      Exchange token from TikTok API
    */

    const fakeOpenId = "temp-open-id";

    const fakeAccessToken = "temp-access-token";

    await prisma.tikTokAuthor.create({
      data: {
        userId: admin.id,

        tiktokOpenId: fakeOpenId,

        accessToken: fakeAccessToken,
      },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/tiktok`);
  } catch (error) {
    console.error("TIKTOK CALLBACK ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
