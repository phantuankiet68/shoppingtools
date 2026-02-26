import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function normName(s: string) {
  return s.trim().replace(/\s+/g, " ");
}
export async function GET(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId"); // null => root

    const items = await prisma.imageFolder.findMany({
      where: { userId: user.id, parentId: parentId ? parentId : null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentId: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdminAuthUser(); // ✅ admin auth

    const body = await req.json().catch(() => ({}));
    const name = normName(String(body?.name ?? ""));
    const parentId = (body?.parentId as string | null | undefined) ?? null;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (name.length > 80) return NextResponse.json({ error: "Name is too long (max 80)" }, { status: 400 });

    if (parentId) {
      const parent = await prisma.imageFolder.findFirst({
        where: { id: parentId, userId: user.id },
        select: { id: true },
      });
      if (!parent) return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
    }

    const created = await prisma.imageFolder.create({
      data: { userId: user.id, parentId, name },
      select: { id: true, name: true, parentId: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
