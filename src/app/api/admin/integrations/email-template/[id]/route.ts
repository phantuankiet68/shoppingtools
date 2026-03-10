import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 100), 100);
    const q = (searchParams.get("q") || "").trim();
    const isActiveParam = searchParams.get("isActive");

    // TODO: thay bằng auth thật
    const admin = { id: "YOUR_ADMIN_USER_ID" };

    const where: any = {
      userId: admin.id,
    };

    if (q) {
      where.OR = [
        { key: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
      ];
    }

    if (isActiveParam === "true") where.isActive = true;
    if (isActiveParam === "false") where.isActive = false;

    const items = await prisma.emailTemplate.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
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

    return NextResponse.json({
      ok: true,
      data: {
        items,
        pagination: {
          total: items.length,
          limit,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to load templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: thay bằng auth thật
    const admin = { id: "YOUR_ADMIN_USER_ID" };

    const key = String(body?.key || "").trim();
    const name = String(body?.name || "").trim();
    const subject = String(body?.subject || "").trim();
    const htmlContent = typeof body?.htmlContent === "string" ? body.htmlContent.trim() : null;
    const textContent = typeof body?.textContent === "string" ? body.textContent.trim() : null;
    const description = typeof body?.description === "string" ? body.description.trim() : null;
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;

    if (!key) return badRequest("key is required");
    if (!name) return badRequest("name is required");
    if (!subject) return badRequest("subject is required");
    if (!htmlContent && !textContent) {
      return badRequest("htmlContent or textContent is required");
    }

    const existed = await prisma.emailTemplate.findFirst({
      where: {
        userId: admin.id,
        key,
      },
      select: { id: true },
    });

    if (existed) {
      return badRequest("Template key already exists");
    }

    const created = await prisma.emailTemplate.create({
      data: {
        userId: admin.id,
        key,
        name,
        subject,
        htmlContent,
        textContent,
        description,
        isActive,
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

    return NextResponse.json({
      ok: true,
      data: created,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to create template" }, { status: 500 });
  }
}
