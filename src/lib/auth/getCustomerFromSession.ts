import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export type SessionResult = {
  customerId: string;
  userId: string;
  email: string;
} | null;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCustomerFromSession(req: NextRequest, siteId?: string): Promise<SessionResult> {
  try {
    const rawSessionToken = req.cookies.get("user_session")?.value;

    if (!rawSessionToken) {
      return null;
    }

    const refreshTokenHash = hashSessionToken(rawSessionToken);
    const now = new Date();

    const session = await prisma.userSession.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      select: {
        userId: true,
      },
    });

    if (!session?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user?.email) {
      return null;
    }

    const customer = await prisma.customer.findFirst({
      where: {
        ...(siteId ? { siteId } : {}),
        email: user.email,
      },
      select: {
        id: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (!customer?.id) {
      return null;
    }

    return {
      customerId: customer.id,
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("getCustomerFromSession error:", error);
    return null;
  }
}
