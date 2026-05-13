import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type BulkCategoryInput = {
  tempId?: string;
  parentTempId?: string | null;
  name: string;
  slug: string;
  sortOrder?: number | null;
};

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */
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

    /* SITE */

    const siteId = String(data.siteId ?? "").trim();

    if (!siteId) {
      return jsonError("Site ID is required");
    }

    /* CATEGORIES */

    const categories = Array.isArray(data.categories) ? (data.categories as BulkCategoryInput[]) : [];

    if (!categories.length) {
      return jsonError("Categories are required");
    }

    /* CREATE */

    const created = await prisma.$transaction(async (tx) => {
      const tempIdMap = new Map<string, string>();

      const results = [];

      for (const category of categories) {
        const name = String(category.name ?? "").trim();

        if (!name) {
          continue;
        }

        const slug = slugify(category.slug || name);

        if (!slug) {
          continue;
        }

        /* PARENT */

        let parentId: string | null = null;

        if (category.parentTempId) {
          parentId = tempIdMap.get(category.parentTempId) ?? null;
        }

        /* EXISTING */

        const existing = await tx.productCategory.findFirst({
          where: {
            siteId,
            slug,
          },

          select: {
            id: true,
          },
        });

        if (existing) {
          if (category.tempId) {
            tempIdMap.set(category.tempId, existing.id);
          }

          results.push({
            id: existing.id,
            slug,
            existed: true,
          });

          continue;
        }

        /* CREATE */

        const createdCategory = await tx.productCategory.create({
          data: {
            siteId,

            name,

            slug,

            parentId,

            sortOrder: Number.isFinite(Number(category.sortOrder)) ? Math.trunc(Number(category.sortOrder)) : 10,
          },

          select: {
            id: true,
            slug: true,
          },
        });

        /* MAP TEMP ID */

        if (category.tempId) {
          tempIdMap.set(category.tempId, createdCategory.id);
        }

        results.push({
          id: createdCategory.id,
          slug: createdCategory.slug,
          existed: false,
        });
      }

      return results;
    });

    return NextResponse.json(
      {
        items: created,
        total: created.length,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return jsonError("Bulk create failed", 500);
  }
}
