import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateBrandBody = {
  name?: string;
  slug?: string;
  siteId?: string;
  description?: string | null;
  logoUrl?: string | null;
};

function normalizeRequiredString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeNullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireAdminAuthUser();

    const { id } = await context.params;
    const brandId = id?.trim();

    if (!brandId) {
      return NextResponse.json({ error: "Brand id is required" }, { status: 400 });
    }

    const item = await prisma.productBrand.findUnique({
      where: { id: brandId },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Get brand failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    await requireAdminAuthUser();

    const { id } = await context.params;
    const brandId = id?.trim();

    if (!brandId) {
      return NextResponse.json({ error: "Brand id is required" }, { status: 400 });
    }

    const body = (await req.json()) as UpdateBrandBody;

    const name = normalizeRequiredString(body.name);
    const slug = normalizeRequiredString(body.slug);
    const siteId = normalizeRequiredString(body.siteId);
    const description = normalizeNullableString(body.description);
    const logoUrl = normalizeNullableString(body.logoUrl);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!siteId) {
      return NextResponse.json({ error: "Site is required" }, { status: 400 });
    }

    const existing = await prisma.productBrand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        siteId: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const siteExists = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    });

    if (!siteExists) {
      return NextResponse.json({ error: "Site not found" }, { status: 400 });
    }

    const duplicatedSlug = await prisma.productBrand.findFirst({
      where: {
        siteId,
        slug,
        NOT: {
          id: brandId,
        },
      },
      select: { id: true },
    });

    if (duplicatedSlug) {
      return NextResponse.json({ error: "Slug already exists in this site" }, { status: 409 });
    }

    const duplicatedName = await prisma.productBrand.findFirst({
      where: {
        siteId,
        name,
        NOT: {
          id: brandId,
        },
      },
      select: { id: true },
    });

    if (duplicatedName) {
      return NextResponse.json({ error: "Name already exists in this site" }, { status: 409 });
    }

    const item = await prisma.productBrand.update({
      where: { id: brandId },
      data: {
        siteId,
        name,
        slug,
        description,
        logoUrl,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update brand failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireAdminAuthUser();

    const { id } = await context.params;
    const brandId = id?.trim();

    if (!brandId) {
      return NextResponse.json({ error: "Brand id is required" }, { status: 400 });
    }

    const existing = await prisma.productBrand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    await prisma.productBrand.delete({
      where: { id: brandId },
    });

    return NextResponse.json({
      ok: true,
      deletedId: existing.id,
      deletedName: existing.name,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete brand failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
