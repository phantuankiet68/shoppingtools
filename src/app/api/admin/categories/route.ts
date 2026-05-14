import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

import type { Prisma } from "@/generated/prisma";

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */

function toInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFKC")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    },
  );
}

async function ensureParentInSite(siteId: string, parentId: string) {
  const parent = await prisma.Category.findFirst({
    where: {
      id: parentId,
      siteId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(parent);
}

async function nextSortOrderForParent(siteId: string, parentId: string | null) {
  const result = await prisma.Category.aggregate({
    where: {
      siteId,
      parentId,
    },
    _max: {
      sortOrder: true,
    },
  });

  return (result._max.sortOrder ?? 0) + 10;
}

function orderByFromSort(sort: string) {
  const normalized = sort.toLowerCase();
  switch (normalized) {
    case "nameasc":
    case "name_asc":
      return {
        name: "asc",
      } as const;

    case "newest":
      return {
        createdAt: "desc",
      } as const;

    default:
      return {
        sortOrder: "asc",
      } as const;
  }
}

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();
    const url = new URL(req.url);
    const siteId = String(url.searchParams.get("siteId") ?? "").trim();
    if (!siteId) {
      return jsonError("Site ID is required");
    }

    const query = String(url.searchParams.get("q") ?? "").trim();
    const sort = String(url.searchParams.get("sort") ?? "sortasc").trim();
    const tree = url.searchParams.get("tree") === "1";
    const lite = url.searchParams.get("lite") === "1";
    const active = String(url.searchParams.get("active") ?? "all").toLowerCase();
    const parentIdRaw = url.searchParams.get("parentId");
    const parentId = parentIdRaw == null || parentIdRaw === "" || parentIdRaw === "null" ? undefined : parentIdRaw;
    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 5000);
    const where: Prisma.CategoryWhereInput = {
      siteId,
    };

    /* SEARCH */

    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },

        {
          slug: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    /* FILTER PARENT */

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    /* FILTER ACTIVE */

    if (active === "active") {
      (
        where as Prisma.CategoryWhereInput & {
          isActive?: boolean;
        }
      ).isActive = true;
    }

    if (active === "inactive") {
      (
        where as Prisma.CategoryWhereInput & {
          isActive?: boolean;
        }
      ).isActive = false;
    }

    const orderBy = orderByFromSort(sort);
    const skip = tree ? 0 : (page - 1) * pageSize;
    const take = tree ? 5000 : pageSize;
    const [categories, total] = await Promise.all([
      prisma.Category.findMany({
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
            select: {
              products: true,
            },
          },
        },
      }),

      prisma.Category.count({
        where,
      }),
    ]);

    const items = categories.map((item) => ({
      id: item.id,
      siteId: item.siteId,
      parentId: item.parentId,
      name: item.name,
      slug: item.slug,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      count: item._count.products,
    }));
    if (sort === "countdesc") {
      items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }
    if (lite) {
      return NextResponse.json({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          count: item.count,
        })),

        page,
        pageSize,
        total,

        totalPages: Math.ceil(total / pageSize),
      });
    }

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,

      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    if (message.toLowerCase().includes("unauth")) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError(message, 500);
  }
}

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 415);
    }
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonError("Invalid JSON body");
    }
    const data = body as Record<string, unknown>;
    const siteId = String(data.siteId ?? "").trim();
    if (!siteId) {
      return jsonError("Site ID is required");
    }
    const name = String(data.name ?? "").trim();
    if (!name) {
      return jsonError("Category name is required");
    }
    const rawSlug = String(data.slug ?? "").trim();
    const slug = slugify(rawSlug || name);
    if (!slug) {
      return jsonError("Slug is required");
    }
    const parentIdRaw = data.parentId;
    const parentId = parentIdRaw == null || parentIdRaw === "" || parentIdRaw === "null" ? null : String(parentIdRaw);
    if (parentId) {
      const validParent = await ensureParentInSite(siteId, parentId);
      if (!validParent) {
        return jsonError("Parent category not found");
      }
    }
    const existing = await prisma.Category.findFirst({
      where: {
        siteId,
        slug,
      },

      select: {
        id: true,
        siteId: true,
        parentId: true,
        name: true,
        slug: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          item: existing,
          existed: true,
        },
        {
          status: 200,
        },
      );
    }
    const sortOrder = Number.isFinite(Number(data.sortOrder))
      ? Math.trunc(Number(data.sortOrder))
      : await nextSortOrderForParent(siteId, parentId);
    const created = await prisma.Category.create({
      data: {
        siteId,
        name,
        slug,
        parentId,
        sortOrder,
      },

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
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        item: {
          id: created.id,
          siteId: created.siteId,
          parentId: created.parentId,
          name: created.name,
          slug: created.slug,
          sortOrder: created.sortOrder,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          count: created._count.products,
        },

        existed: false,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    const prismaError = error as Error & {
      code?: string;

      meta?: {
        target?: string | string[];
      };
    };

    const message = String(prismaError?.message ?? "Server error");
    if (message.toLowerCase().includes("unauth")) {
      return jsonError("Unauthorized", 401);
    }

    if (prismaError?.code === "P2002") {
      const target = prismaError?.meta?.target;
      const targetText = Array.isArray(target) ? target.join(", ") : String(target ?? "");
      if (targetText.includes("slug")) {
        return jsonError("Category slug already exists", 409);
      }
      return jsonError("Category already exists", 409);
    }
    return jsonError(message, 500);
  }
}
