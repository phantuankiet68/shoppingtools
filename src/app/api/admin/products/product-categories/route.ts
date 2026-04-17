import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import type { Prisma } from "@/generated/prisma";

/* ----------------------------- helpers ----------------------------- */

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getSiteId(req: Request): Promise<string> {
  const url = new URL(req.url);
  const fromQuery = String(url.searchParams.get("siteId") ?? "").trim();
  if (fromQuery) return fromQuery;

  const cookieStore = await cookies();
  return String(cookieStore.get("siteId")?.value ?? "").trim();
}

function orderByFromSort(sort: string) {
  switch (sort.toLowerCase()) {
    case "nameasc":
      return { name: "asc" } as const;
    case "namedesc":
      return { name: "desc" } as const;
    case "newest":
      return { createdAt: "desc" } as const;
    case "oldest":
      return { createdAt: "asc" } as const;
    default:
      return { sortOrder: "asc" } as const;
  }
}

/* ----------------------------- GET ----------------------------- */

export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();

    const url = new URL(req.url);
    const siteId = await getSiteId(req);

    if (!siteId) return jsonError("siteId is required", 400);

    const q = url.searchParams.get("q") ?? "";
    const sort = url.searchParams.get("sort") ?? "sortasc";

    const tree = url.searchParams.get("tree") === "1";
    const lite = url.searchParams.get("lite") === "1";

    const parentIdRaw = url.searchParams.get("parentId");
    const parentId =
      parentIdRaw == null || parentIdRaw === "" || parentIdRaw === "null"
        ? undefined
        : parentIdRaw;

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 200), 1, 500);

    const where: Prisma.ProductCategoryWhereInput = {
      siteId,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const orderBy = orderByFromSort(sort);

    const skip = tree ? 0 : (page - 1) * pageSize;
    const take = tree ? 5000 : pageSize;

    const [items, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          siteId: true,
          parentId: true,
          name: true,
          slug: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    const formatted = items.map((x) => ({
      ...x,
      count: x._count.products,
    }));

    if (lite) {
      return NextResponse.json({
        items: formatted.map((x) => ({
          id: x.id,
          name: x.name,
          count: x.count,
        })),
        page,
        pageSize,
        total,
      });
    }

    return NextResponse.json({
      items: formatted,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      siteId,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return jsonError("Unauthorized", 401);
    }

    return jsonError(error.message || "Server error", 500);
  }
}