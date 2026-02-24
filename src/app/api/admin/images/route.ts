import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { makeImageFileName, savePublicImage } from "@/lib/storage/publicImages";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

type ImageAssetListRow = {
  id: string;
  originalName: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  tag: string | null;
  folderId: string | null;
  createdAt: Date;
  fileName: string;
  userId: string;
};

// =======================
// GET: list images
// =======================
export async function GET(req: NextRequest) {
  try {
    const user = await requireAdminAuthUser();
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const filter = (searchParams.get("filter") ?? "all") as "all" | "recent" | "tagged";
    const folderId = searchParams.get("folderId");

    const where: any = { userId: user.id };

    if (folderId === "root") where.folderId = null;
    else if (folderId) where.folderId = folderId;

    if (q) where.originalName = { contains: q, mode: "insensitive" };
    if (filter === "tagged") where.tag = { not: null };

    if (filter === "recent") {
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: since };
    }

    const items = (await prisma.imageAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalName: true,
        sizeBytes: true,
        width: true,
        height: true,
        tag: true,
        folderId: true,
        createdAt: true,
        fileName: true,
        userId: true,
      },
    })) as ImageAssetListRow[];

    // map public url
    const mapped = items.map((it: ImageAssetListRow) => ({
      ...it,
      url: `/upload/images/${it.userId}/${it.fileName}`,
    }));

    return NextResponse.json({ items: mapped });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// =======================
// POST: upload image
// =======================
export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminAuthUser();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folderId = (form.get("folderId") as string | null) ?? null;
    const tag = (form.get("tag") as string | null) ?? null;

    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Max size 10MB" }, { status: 400 });
    }

    // check folder ownership
    if (folderId) {
      const ok = await prisma.imageFolder.findFirst({
        where: { id: folderId, userId: user.id },
        select: { id: true },
      });
      if (!ok) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = makeImageFileName(file.type);

    const publicUrl = await savePublicImage(user.id, fileName, buffer);

    const created = await prisma.imageAsset.create({
      data: {
        userId: user.id,
        folderId,
        originalName: file.name,
        fileName,
        mimeType: file.type,
        sizeBytes: file.size,
        tag:
          tag === "NEW" ||
          tag === "HDR" ||
          tag === "AI" ||
          tag === "FAVORITE" ||
          tag === "COVER" ||
          tag === "BANNER" ||
          tag === "AVATAR" ||
          tag === "PRODUCT"
            ? (tag as any)
            : null,
      },
    });

    return NextResponse.json(
      {
        item: {
          ...created,
          url: publicUrl,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
