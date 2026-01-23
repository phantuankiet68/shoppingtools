import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

function jsonErr(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, message, details }, { status });
}

const PatchEmailSchema = z.object({
  type: z.enum(["SYSTEM", "MARKETING", "TRANSACTIONAL", "INTERNAL"]).optional(),
  subject: z.string().trim().min(1).optional(),
  previewText: z.string().trim().optional().nullable(),
  htmlContent: z.string().optional().nullable(),
  textContent: z.string().optional().nullable(),
  templateKey: z.string().trim().optional().nullable(),
  templateData: z.any().optional().nullable(),
  fromName: z.string().trim().optional().nullable(),
  fromEmail: z.string().email().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const email = await prisma.email.findFirst({
      where: { id: params.id, userId },
      include: {
        recipients: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!email) return jsonErr("Email not found", 404);
    return jsonOk({ data: email });
  } catch (e: any) {
    console.error(e);
    return jsonErr("Failed to fetch email", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const body = await req.json();
    const parsed = PatchEmailSchema.safeParse(body);
    if (!parsed.success) return jsonErr("Validation failed", 422, parsed.error.flatten());

    const existing = await prisma.email.findFirst({
      where: { id: params.id, userId },
      select: { id: true, status: true },
    });

    if (!existing) return jsonErr("Email not found", 404);

    if (!["DRAFT", "QUEUED"].includes(existing.status)) {
      return jsonErr("Email cannot be updated in current status", 409);
    }

    const updated = await prisma.email.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
        templateData: parsed.data.templateData as any,
        updatedAt: new Date(),
      },
    });

    return jsonOk({ data: updated });
  } catch (e: any) {
    console.error(e);
    return jsonErr("Failed to update email", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const existing = await prisma.email.findFirst({
      where: { id: params.id, userId },
      select: { id: true, status: true },
    });

    if (!existing) return jsonErr("Email not found", 404);

    if (existing.status === "SENT") {
      return jsonErr("Cannot cancel a sent email", 409);
    }

    await prisma.$transaction([
      prisma.email.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      }),
      prisma.emailRecipient.updateMany({
        where: {
          emailId: params.id,
          status: { notIn: ["SENT", "CANCELLED"] },
        },
        data: { status: "CANCELLED" },
      }),
    ]);

    return jsonOk({ data: { cancelled: true } });
  } catch (e: any) {
    console.error(e);
    return jsonErr("Failed to cancel email", 500);
  }
}
