import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}
function jsonErr(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, message, details }, { status });
}

const EmailStatusEnum = z.enum(["DRAFT", "QUEUED", "SENDING", "SENT", "FAILED", "CANCELLED"]);

// ✅ Next 16 validator expects params to be Promise
type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const { id } = await params;

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const q = (searchParams.get("q") || "").trim();

    const opened = searchParams.get("opened"); // "true" | "false" | null
    const clicked = searchParams.get("clicked"); // "true" | "false" | null

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)));
    const skip = (page - 1) * limit;

    if (status && !EmailStatusEnum.safeParse(status).success) {
      return jsonErr("Invalid status", 400);
    }

    const where: any = {
      emailId: id,
      email: { userId: admin.id },
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { toEmail: { contains: q, mode: "insensitive" } },
              { toName: { contains: q, mode: "insensitive" } },
              { providerMessageId: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(opened === "true" ? { openedAt: { not: null } } : opened === "false" ? { openedAt: null } : {}),
      ...(clicked === "true" ? { clickedAt: { not: null } } : clicked === "false" ? { clickedAt: null } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.emailRecipient.findMany({
        where,
        orderBy: [{ createdAt: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          emailId: true,
          toEmail: true,
          toName: true,
          status: true,
          sentAt: true,
          error: true,
          openedAt: true,
          clickedAt: true,
          providerMessageId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.emailRecipient.count({ where }),
    ]);

    return jsonOk({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error(e);
    return jsonErr("Failed to fetch email recipients", 500);
  }
}
