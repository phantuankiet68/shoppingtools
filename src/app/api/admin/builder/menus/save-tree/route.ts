// app/api/admin/builder/menus/save-tree/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MenuArea } from "@/generated/prisma";

export const runtime = "nodejs";

type InItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
};

type Body = {
  items: InItem[];
  overwrite?: boolean;
  siteId?: string;
};

async function resolveSiteId(req: Request, maybeSiteId?: string | null) {
  if (maybeSiteId) {
    const ok = await prisma.site.findUnique({
      where: { id: maybeSiteId },
      select: { id: true },
    });
    if (ok) return ok.id;
  }

  const h = req.headers;
  const domain = h.get("x-site-domain") ?? h.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  if (domain) {
    const s = await prisma.site.findUnique({
      where: { domain },
      select: { id: true },
    });
    if (s) return s.id;
  }

  const first = await prisma.site.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!first) {
    throw new Error("No Site found. Seed the Site table first.");
  }

  return first.id;
}

function normalizeItems(items: InItem[]): InItem[] {
  return items.map((it) => ({
    id: String(it.id || "").trim(),
    parentId:
      !it.parentId || it.parentId === "" || it.parentId === "null"
        ? null
        : String(it.parentId).trim(),
    title: String(it.title || "").trim(),
    path: it.path ? String(it.path).trim() : null,
    icon: it.icon ? String(it.icon).trim() : null,
    sortOrder: Number.isFinite(it.sortOrder) ? it.sortOrder : 0,
    visible: Boolean(it.visible),
  }));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body || !Array.isArray(body.items)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const overwrite = !!body.overwrite;
    const area = MenuArea.SITE;
    const siteId = await resolveSiteId(req, body.siteId?.trim() || null);
    const items = normalizeItems(body.items);

    for (const it of items) {
      if (!it.id) {
        return new NextResponse("Item id is required", { status: 400 });
      }

      if (!it.title) {
        return new NextResponse(`Item title is required: ${it.id}`, { status: 400 });
      }
    }

    const keepIds = new Set(items.map((i) => i.id));
    const orphanParents = new Set<string>();
    const parentIds = Array.from(
      new Set(items.map((i) => i.parentId).filter((v): v is string => !!v)),
    );

    if (parentIds.length) {
      const existingParents = await prisma.menuItem.findMany({
        where: {
          id: { in: parentIds },
          siteId,
          area,
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
      return new NextResponse(
        `Invalid parentId detected: ${Array.from(orphanParents).join(", ")}`,
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let deleted = 0;

      if (overwrite) {
        const existing = await tx.menuItem.findMany({
          where: { siteId, area },
          select: { id: true },
        });

        const toDelete = existing.map((e) => e.id).filter((id) => !keepIds.has(id));

        if (toDelete.length) {
          const delRes = await tx.menuItem.deleteMany({
            where: {
              id: { in: toDelete },
              siteId,
              area,
            },
          });
          deleted = delRes.count;
        }
      }

      let upserted = 0;

      for (const it of items) {
        await tx.menuItem.upsert({
          where: { id: it.id },
          update: {
            siteId,
            parentId: it.parentId,
            title: it.title,
            path: it.path,
            icon: it.icon,
            sortOrder: it.sortOrder,
            visible: it.visible,
            area,
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
            area,
          },
        });

        upserted++;
      }

      return { deleted, upserted };
    });

    return NextResponse.json({
      ok: true,
      ...result,
      siteId,
      area,
    });
  } catch (e: any) {
    console.error("POST /api/admin/builder/menus/save-tree error:", e);
    return new NextResponse(e?.message || "Internal Server Error", { status: 500 });
  }
}