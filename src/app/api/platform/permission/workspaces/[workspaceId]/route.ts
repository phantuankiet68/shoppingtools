import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_: NextRequest, { params }: Context) {
  try {
    const { workspaceId } = await params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        accessPolicy: true,
        _count: {
          select: {
            sites: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    const [pages, menus, categories, products] = await Promise.all([
      prisma.page.count({
        where: {
          site: { workspaceId },
          deletedAt: null,
        },
      }),
      prisma.menuItem.count({
        where: {
          site: { workspaceId },
        },
      }),
      prisma.productCategory.count({
        where: {
          site: { workspaceId },
        },
      }),
      prisma.product.count({
        where: {
          site: { workspaceId },
          deletedAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      policy: workspace.accessPolicy,
      usage: {
        sites: workspace._count.sites,
        pages,
        menus,
        productCategories: categories,
        products,
      },
    });
  } catch (error) {
    console.error("[GET /api/platform/permission/workspaces/[workspaceId]]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
