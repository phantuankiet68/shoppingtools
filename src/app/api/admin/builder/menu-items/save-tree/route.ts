// app/api/menu-items/save-tree/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MenuSetKey } from "@prisma/client";

export const runtime = "nodejs";

type InItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  setKey: "home" | "v1";
};

type Body = {
  setKey: "home" | "v1";
  items: InItem[];
  overwrite?: boolean;
  siteId?: string;
};

function isMenuSetKey(v: any): v is MenuSetKey {
  return v === "home" || v === "v1";
}

async function resolveSiteId(req: Request, maybeSiteId?: string | null) {
  if (maybeSiteId) {
    const ok = await prisma.site.findUnique({ where: { id: maybeSiteId }, select: { id: true } });
    if (ok) return ok.id;
  }

  const h = req.headers;
  const domain = h.get("x-site-domain") ?? h.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (domain) {
    const s = await prisma.site.findUnique({ where: { domain }, select: { id: true } });
    if (s) return s.id;
  }

  const first = await prisma.site.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } });
  if (!first) throw new Error("No Site found. Seed the Site table first.");
  return first.id;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.setKey || !Array.isArray(body.items)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const setKey: MenuSetKey = isMenuSetKey(body.setKey) ? body.setKey : "home";
    const items = body.items ?? [];
    const overwrite = !!body.overwrite;

    const siteId = await resolveSiteId(req, body.siteId?.trim() || null);

    // ===== Chuẩn hoá parentId rỗng về null =====
    for (const it of items) {
      if (!it.parentId || it.parentId === "" || it.parentId === "null") {
        it.parentId = null;
      }
    }

    // ===== Guard: parentId phải nằm trong tập items hoặc đã tồn tại ở DB (cùng site/setKey) =====
    const keepIds = new Set(items.map((i) => i.id));
    const orphanParents = new Set<string>();
    const parentIds = Array.from(new Set(items.map((i) => i.parentId).filter((v): v is string => !!v)));

    if (parentIds.length) {
      const existingParents = await prisma.menuItem.findMany({
        where: {
          id: { in: parentIds },
          siteId,
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
      return new NextResponse(`Invalid parentId detected: ${Array.from(orphanParents).join(", ")}`, { status: 400 });
    }

    // ===== Transaction: delete (nếu overwrite), rồi upsert theo siteId+setKey =====
    const result = await prisma.$transaction(async (tx) => {
      let deleted = 0;

      if (overwrite) {
        const existing = await tx.menuItem.findMany({
          where: { siteId, setKey },
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
          where: { id: it.id }, // id là PK
          update: {
            siteId,
            parentId: it.parentId,
            title: it.title,
            path: it.path,
            icon: it.icon,
            sortOrder: it.sortOrder,
            visible: it.visible,
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
            setKey,
          },
        });

        upserted++;
      }

      return { deleted, upserted };
    });

    return NextResponse.json({ ok: true, ...result, siteId, setKey });
  } catch (e: any) {
    console.error("POST /api/menu-items/save-tree error:", e);
    return new NextResponse(e?.message || "Internal Server Error", { status: 500 });
  }
}
