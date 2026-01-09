import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const body = await req.json().catch(() => ({}));

    const name = String(body?.name ?? "").trim();
    const parentId = (body?.parentId ?? null) as string | null;

    if (!name) return NextResponse.json({ error: "Folder name is required" }, { status: 400 });

    if (parentId) {
      const parent = await prisma.fileFolder.findFirst({
        where: { id: parentId, ownerId: user.id },
        select: { id: true },
      });
      if (!parent) return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
    }

    const folder = await prisma.fileFolder.create({
      data: { name, parentId, ownerId: user.id },
      select: { id: true, name: true, parentId: true, updatedAt: true },
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (e: any) {
    if (String(e?.code) === "P2002") {
      return NextResponse.json({ error: "Folder name already exists in this location" }, { status: 409 });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
