// app/api/menu-items/save-tree/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Locale, MenuSetKey } from "@prisma/client";

export const runtime = "nodejs";

type InItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: "en";
  setKey: "home" | "v1";
};

type Body = {
  locale: "en";
  setKey: "home" | "v1";
  items: InItem[];
  overwrite?: boolean;
  siteId?: string; // ✅ mới
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.locale || !body?.setKey || !Array.isArray(body.items)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const loc = body.locale as Locale;
    const setKey = body.setKey as MenuSetKey;
    const items = body.items ?? [];
    const overwrite = !!body.overwrite;

    // ===== siteId: dùng siteId truyền vào, nếu không có -> chọn site đầu tiên theo createdAt =====
    let siteId = body.siteId?.trim() || "";

    if (!siteId) {
      const firstSite = await prisma.site.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (!firstSite) {
        return new NextResponse("No Site found. Please create a Site first.", { status: 400 });
      }
      siteId = firstSite.id;
    } else {
      const siteExists = await prisma.site.findUnique({
        where: { id: siteId },
        select: { id: true },
      });
      if (!siteExists) {
        return new NextResponse("Invalid siteId", { status: 400 });
      }
    }

    // ===== Chuẩn hoá parentId rỗng về null =====
    for (const it of items) {
      if (!it.parentId || it.parentId === "" || it.parentId === "null") {
        it.parentId = null;
      }
    }

    // ===== Guard: parentId phải nằm trong tập items hoặc đã tồn tại ở DB (cùng site/locale/setKey) =====
    const keepIds = new Set(items.map((i) => i.id));
    const orphanParents = new Set<string>();
    const parentIds = Array.from(new Set(items.map((i) => i.parentId).filter((v): v is string => !!v)));

    if (parentIds.length) {
      const existingParents = await prisma.menuItem.findMany({
        where: {
          id: { in: parentIds },
          siteId,
          locale: loc,
          setKey,
        },
        select: { id: true },
      });
      const existingParentIdSet = new Set(existingParents.map((x) => x.id));
      for (const pid of parentIds) {
        if (!keepIds.has(pid) && !existingParentIdSet.has(pid)) {
          orphanParents.add(pid);
        }
      }
    }

    if (orphanParents.size > 0) {
      // Bạn có thể đổi sang tự động set null cho các parentId mồ côi,
      // nhưng ở đây mình báo lỗi rõ để bạn xử lý dữ liệu đầu vào cho chắc.
      return new NextResponse(`Invalid parentId detected: ${Array.from(orphanParents).join(", ")}`, { status: 400 });
    }

    // ===== Transaction: delete (nếu overwrite), rồi upsert theo siteId+locale+setKey =====
    const result = await prisma.$transaction(async (tx) => {
      let deleted = 0;

      if (overwrite) {
        const existing = await tx.menuItem.findMany({
          where: { siteId, locale: loc, setKey },
          select: { id: true },
        });

        const toDelete = existing.map((e) => e.id).filter((id) => !keepIds.has(id));

        if (toDelete.length) {
          const delRes = await tx.menuItem.deleteMany({
            where: { id: { in: toDelete } },
          });
          deleted = delRes.count;
        }
      }

      let upserted = 0;

      for (const it of items) {
        await tx.menuItem.upsert({
          where: { id: it.id }, // (id) là unique/PK hiện tại
          update: {
            siteId,
            parentId: it.parentId,
            title: it.title,
            path: it.path,
            icon: it.icon,
            sortOrder: it.sortOrder,
            visible: it.visible,
            locale: loc,
            setKey,
          },
          create: {
            id: it.id,
            siteId,
            parentId: it.parentId,
            title: it.title,
            path: it.path,
            icon: it.icon,
            sortOrder: it.sortOrder,
            visible: it.visible,
            locale: loc,
            setKey,
          },
        });
        upserted++;
      }

      return { deleted, upserted };
    });

    return NextResponse.json({ ok: true, ...result, siteId });
  } catch (e: any) {
    console.error("POST /api/menu-items/save-tree error:", e);
    return new NextResponse(e?.message || "Internal Server Error", { status: 500 });
  }
}
