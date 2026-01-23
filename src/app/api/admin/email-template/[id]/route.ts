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

const EmailTemplatePatchSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  subject: z.string().trim().min(1).max(500).optional(),
  htmlContent: z.string().optional().nullable(),
  textContent: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

type Params = { params: { id: string } };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();

    const template = await prisma.emailTemplate.findFirst({
      where: { id: params.id, userId: admin.id },
      select: {
        id: true,
        userId: true,
        key: true,
        name: true,
        subject: true,
        htmlContent: true,
        textContent: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!template) return jsonErr("Template not found", 404);
    return jsonOk(template);
  } catch (e) {
    console.error(e);
    return jsonErr("Failed to fetch email template", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const body = await req.json();

    const parsed = EmailTemplatePatchSchema.safeParse(body);
    if (!parsed.success) {
      return jsonErr("Validation failed", 422, parsed.error.flatten());
    }

    // Ensure owner
    const existing = await prisma.emailTemplate.findFirst({
      where: { id: params.id, userId: admin.id },
      select: { id: true },
    });
    if (!existing) return jsonErr("Template not found", 404);

    // If both contents are explicitly null/empty => block
    const nextHtml = parsed.data.htmlContent;
    const nextText = parsed.data.textContent;
    if (nextHtml === null && nextText === null) {
      return jsonErr("htmlContent and textContent cannot both be null", 422);
    }

    const updated = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
      },
      select: {
        id: true,
        userId: true,
        key: true,
        name: true,
        subject: true,
        htmlContent: true,
        textContent: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonOk(updated);
  } catch (e) {
    console.error(e);
    return jsonErr("Failed to update email template", 500);
  }
}

/**
 * DELETE: soft delete -> isActive=false
 */
export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();

    const existing = await prisma.emailTemplate.findFirst({
      where: { id: params.id, userId: admin.id },
      select: { id: true, isActive: true },
    });
    if (!existing) return jsonErr("Template not found", 404);

    if (!existing.isActive) return jsonOk({ deleted: true }); // idempotent

    await prisma.emailTemplate.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return jsonOk({ deleted: true });
  } catch (e) {
    console.error(e);
    return jsonErr("Failed to delete email template", 500);
  }
}
