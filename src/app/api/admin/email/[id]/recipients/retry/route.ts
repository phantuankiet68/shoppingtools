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

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const body = await req.json().catch(() => ({}));
    const parsed = RetryBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Validation failed", 422, parsed.error.flatten());
    }

    const email = await prisma.email.findFirst({
      where: { id: params.id, userId: admin.id },
      select: { id: true, status: true },
    });
    if (!email) return jsonErr("Email not found", 404);

    if (email.status === "SENT") {
      // Có thể vẫn cho retry FAILED nếu muốn, nhưng thường SENT nghĩa là complete.
      return jsonErr("Cannot retry recipients for a SENT email", 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      // retry recipients FAILED
      const updated = await tx.emailRecipient.updateMany({
        where: {
          emailId: params.id,
          status: "FAILED",
        },
        data: {
          status: "QUEUED",
          error: null,
          sentAt: null,
          providerMessageId: null,
        },
      });

      // set email back to QUEUED if needed
      await tx.email.update({
        where: { id: params.id },
        data: {
          status: "QUEUED",
          lastError: null,
        },
      });

      // recompute counters from recipients (recommended)
      const [successCount, failedCount, totalRecipients] = await Promise.all([
        tx.emailRecipient.count({ where: { emailId: params.id, status: "SENT" } }),
        tx.emailRecipient.count({ where: { emailId: params.id, status: "FAILED" } }),
        tx.emailRecipient.count({ where: { emailId: params.id } }),
      ]);

      await tx.email.update({
        where: { id: params.id },
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
