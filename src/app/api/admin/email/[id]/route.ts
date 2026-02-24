import { Prisma } from "@prisma/client";
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

const EmailTypeEnum = z.enum(["SYSTEM", "MARKETING", "TRANSACTIONAL", "INTERNAL"]);
const EmailStatusEnum = z.enum(["DRAFT", "QUEUED", "SENDING", "SENT", "FAILED", "CANCELLED"]);

const CreateRecipientSchema = z.object({
  toEmail: z.string().email(),
  toName: z.string().trim().min(1).optional(),
});

const CreateEmailSchema = z.object({
  type: EmailTypeEnum.optional(),
  subject: z.string().trim().min(1),
  previewText: z.string().trim().optional().nullable(),
  htmlContent: z.string().optional().nullable(),
  textContent: z.string().optional().nullable(),
  templateKey: z.string().trim().optional().nullable(),
  templateData: z.any().optional().nullable(),
  fromName: z.string().trim().optional().nullable(),
  fromEmail: z.string().email().optional().nullable(),
  recipients: z.array(CreateRecipientSchema).min(1),
});

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser(); // <- your auth
    const userId = admin.id;

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const q = (searchParams.get("q") || "").trim();

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
    const skip = (page - 1) * limit;

    if (status && !EmailStatusEnum.safeParse(status).success) {
      return jsonErr("Invalid status", 400);
    }
    if (type && !EmailTypeEnum.safeParse(type).success) {
      return jsonErr("Invalid type", 400);
    }

    const where: any = {
      userId,
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(q
        ? {
            OR: [
              { subject: { contains: q, mode: "insensitive" } },
              { templateKey: { contains: q, mode: "insensitive" } },
              { fromEmail: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.email.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          type: true,
          status: true,
          subject: true,
          previewText: true,
          templateKey: true,
          fromName: true,
          fromEmail: true,
          scheduledAt: true,
          sentAt: true,
          totalRecipients: true,
          successCount: true,
          failedCount: true,
          lastError: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { recipients: true } },
        },
      }),
      prisma.email.count({ where }),
    ]);

    return jsonOk({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e: any) {
    console.error(e);
    return jsonErr("Failed to fetch emails", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const body = await req.json();
    const parsed = CreateEmailSchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Validation failed", 422, parsed.error.flatten());
    }

    const input = parsed.data;

    const hasContent = !!(input.htmlContent || input.textContent);
    const hasTemplate = !!input.templateKey;
    if (!hasContent && !hasTemplate) {
      return jsonErr("Provide htmlContent/textContent or templateKey", 422);
    }

    const email = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.email.create({
        data: {
          userId,
          type: input.type ?? "SYSTEM",
          subject: input.subject,
          previewText: input.previewText ?? null,
          htmlContent: input.htmlContent ?? null,
          textContent: input.textContent ?? null,
          templateKey: input.templateKey ?? null,
          templateData: (input.templateData ?? null) as any,
          fromName: input.fromName ?? null,
          fromEmail: input.fromEmail ?? null,

          // optional: store createdBy for audit (if you still keep it)
          createdBy: admin.id,

          totalRecipients: input.recipients.length,
          recipients: {
            create: input.recipients.map((r) => ({
              toEmail: r.toEmail,
              toName: r.toName ?? null,
            })),
          },
        },
        select: {
          id: true,
          userId: true,
          status: true,
          type: true,
          subject: true,
          totalRecipients: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json({ ok: true, data: email }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return jsonErr("Failed to create email", 500);
  }
}
