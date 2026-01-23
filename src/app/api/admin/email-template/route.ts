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

const EmailTemplateCreateSchema = z.object({
  key: z.string().trim().min(2).max(100),
  name: z.string().trim().min(2).max(200),
  subject: z.string().trim().min(1).max(500),
  htmlContent: z.string().optional().nullable(),
  textContent: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam === null ? undefined : isActiveParam === "true";

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
    const skip = (page - 1) * limit;

    const where: any = {
      userId: admin.id,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(q
        ? {
            OR: [
              { key: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { subject: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          key: true,
          name: true,
          subject: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.emailTemplate.count({ where }),
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
    return jsonErr("Failed to fetch email templates", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const body = await req.json();

    const parsed = EmailTemplateCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonErr("Validation failed", 422, parsed.error.flatten());
    }

    const input = parsed.data;

    // Require at least one content
    if (!input.htmlContent && !input.textContent) {
      return jsonErr("Provide htmlContent or textContent", 422);
    }

    const created = await prisma.emailTemplate.create({
      data: {
        userId: admin.id,
        key: input.key,
        name: input.name,
        subject: input.subject,
        htmlContent: input.htmlContent ?? null,
        textContent: input.textContent ?? null,
        description: input.description ?? null,
        isActive: input.isActive ?? true,
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

    return jsonOk(created, { status: 201 });
  } catch (e: any) {
    // Prisma unique constraint
    if (e?.code === "P2002") {
      return jsonErr("Template key already exists", 409, e?.meta);
    }
    console.error(e);
    return jsonErr("Failed to create email template", 500);
  }
}
