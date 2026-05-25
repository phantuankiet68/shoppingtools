import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

type Ctx = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await params;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        key: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await prisma.file.delete({
      where: {
        id: file.id,
      },
    });

    const absPath = path.join(process.cwd(), "public", "upload", "files", file.key);

    try {
      await fs.unlink(absPath);
    } catch {
      // ignore
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("DELETE FILE ERROR:", error);

    return NextResponse.json(
      {
        error: "Delete failed",
      },
      { status: 500 },
    );
  }
}
