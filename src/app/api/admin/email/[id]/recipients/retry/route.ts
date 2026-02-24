import { Prisma } from "@prisma/client";
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

const RetryBodySchema = z.object({
  onlyFailed: z.boolean().optional().default(true),
});

// ✅ Next 16 validator expects params to be Promise
type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const parsed = RetryBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Validation failed", 422, parsed.error.flatten());
    }

    const email = await prisma.email.findFirst({
      where: { id, userId: admin.id },
      select: { id: true, status: true },
    });
    if (!email) return jsonErr("Email not found", 404);

    if (email.status === "SENT") {
      // Có thể vẫn cho retry FAILED nếu muốn, nhưng thường SENT nghĩa là complete.
      return jsonErr("Cannot retry recipients for a SENT email", 409);
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // retry recipients FAILED (hoặc all nếu onlyFailed=false)
      const updated = await tx.emailRecipient.updateMany({
        where: {
          emailId: id,
          ...(parsed.data.onlyFailed ? { status: "FAILED" } : {}),
        },
        data: {
          status: "QUEUED",
          error: null,
          sentAt: null,
          providerMessageId: null,
        },
      });

      // set email back to QUEUED
      await tx.email.update({
        where: { id },
        data: {
          status: "QUEUED",
          lastError: null,
        },
      });

      // recompute counters from recipients (recommended)
      const [successCount, failedCount, totalRecipients] = await Promise.all([
        tx.emailRecipient.count({ where: { emailId: id, status: "SENT" } }),
        tx.emailRecipient.count({ where: { emailId: id, status: "FAILED" } }),
        tx.emailRecipient.count({ where: { emailId: id } }),
      ]);

      await tx.email.update({
        where: { id },
        data: { successCount, failedCount, totalRecipients },
      });

      return {
        retried: updated.count,
        successCount,
        failedCount,
        totalRecipients,
      };
    });

    return jsonOk(result);
  } catch (e) {
    console.error(e);
    return jsonErr("Failed to retry recipients", 500);
  }
}
