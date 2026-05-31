import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { decrypt } from "@/lib/security/encryption";

import { SubscriberStatus } from "@/generated/prisma";

import { sendGoogleMail, refreshAccessToken } from "@/lib/email/google-mail";

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAdminAuthUser();

    const body = await req.json();

    const { siteId, subject, html } = body;

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ownerUserId: authUser.id,
        deletedAt: null,
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
    });

    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          message: "Provider not found",
        },
        {
          status: 400,
        },
      );
    }

    const subscribers = await prisma.subscriber.findMany({
      where: {
        siteId,
        status: SubscriberStatus.ACTIVE,
      },
    });

    let accessToken = decrypt(provider.accessTokenEncrypted);

    try {
      await sendGoogleMail({
        accessToken,
        from: provider.email,
        to: provider.email,
        subject: "Token Validation",
        html: "<p>Token Validation</p>",
      });
    } catch {
      const refreshed = await refreshAccessToken(siteId);

      accessToken = refreshed.accessToken;
    }

    let successCount = 0;
    let failedCount = 0;

    const failures: string[] = [];

    for (const subscriber of subscribers) {
      try {
        await sendGoogleMail({
          accessToken,
          from: provider.email,
          to: subscriber.email,
          subject,
          html,
        });

        successCount++;
      } catch (error) {
        console.error("[CAMPAIGN_SEND_ERROR]", subscriber.email, error);

        failedCount++;

        failures.push(subscriber.email);
      }
    }

    return NextResponse.json({
      success: true,
      total: subscribers.length,
      successCount,
      failedCount,
      failures,
    });
  } catch (error) {
    console.error("[EMAIL_CAMPAIGN]", error);

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
