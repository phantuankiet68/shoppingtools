import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.site.update({
      where: { id },
      data: {
        name: body.name,
        domain: body.domain,
        status: body.status,
        isPublic: body.isPublic,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        seoTitleDefault: body.seoTitleDefault,
        seoDescDefault: body.seoDescDefault,
      },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.site.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
