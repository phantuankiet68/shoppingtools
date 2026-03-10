import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json();
    const admin = { id: "YOUR_ADMIN_USER_ID" };

    const found = await prisma.emailTemplate.findFirst({
      where: {
        id,
        userId: admin.id,
      },
      select: { id: true },
    });

    if (!found) {
      return NextResponse.json({ ok: false, message: "Template not found" }, { status: 404 });
    }

    const data: any = {};

    if (typeof body?.name === "string") data.name = body.name.trim();
    if (typeof body?.subject === "string") data.subject = body.subject.trim();
    if (typeof body?.htmlContent === "string" || body?.htmlContent === null) {
      data.htmlContent = body.htmlContent ? String(body.htmlContent).trim() : null;
    }
    if (typeof body?.textContent === "string" || body?.textContent === null) {
      data.textContent = body.textContent ? String(body.textContent).trim() : null;
    }
    if (typeof body?.description === "string" || body?.description === null) {
      data.description = body.description ? String(body.description).trim() : null;
    }
    if (typeof body?.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if ("name" in data && !data.name) return badRequest("name is invalid");
    if ("subject" in data && !data.subject) return badRequest("subject is invalid");

    if (
      Object.prototype.hasOwnProperty.call(data, "htmlContent") ||
      Object.prototype.hasOwnProperty.call(data, "textContent")
    ) {
      const current = await prisma.emailTemplate.findUnique({
        where: { id },
        select: {
          htmlContent: true,
          textContent: true,
        },
      });

      const nextHtml = Object.prototype.hasOwnProperty.call(data, "htmlContent")
        ? data.htmlContent
        : current?.htmlContent;
      const nextText = Object.prototype.hasOwnProperty.call(data, "textContent")
        ? data.textContent
        : current?.textContent;

      if (!nextHtml && !nextText) {
        return badRequest("htmlContent or textContent is required");
      }
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data,
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
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    // TODO: thay bằng auth thật
    const admin = { id: "YOUR_ADMIN_USER_ID" };

    const found = await prisma.emailTemplate.findFirst({
      where: {
        id,
        userId: admin.id,
      },
      select: { id: true },
    });

    if (!found) {
      return NextResponse.json({ ok: false, message: "Template not found" }, { status: 404 });
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        isActive: false,
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
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to disable template" }, { status: 500 });
  }
}
