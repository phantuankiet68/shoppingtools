import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AccessTier } from "@/generated/prisma/client";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

// ✅ NEW: mapping tier → policy
function getPolicyByTier(tier: string) {
  switch (tier) {
    case "PRO":
      return {
        planCode: "PRO",
        maxSites: 10,
        maxPages: 100,
        maxMenus: 31,
        maxProductCategories: 200,
        maxProducts: 1000,
        maxCustomDomains: 5,
        allowBlog: true,
        allowEcommerce: true,
        allowBooking: true,
        allowNews: true,
        allowLms: true,
        allowDirectory: true,
        hiddenMenuKeys: [],
      };

    case "NORMAL":
      return {
        planCode: "NORMAL",
        maxSites: 3,
        maxPages: 30,
        maxMenus: 20,
        maxProductCategories: 50,
        maxProducts: 300,
        maxCustomDomains: 2,
        allowBlog: true,
        allowEcommerce: true,
        allowBooking: false,
        allowNews: false,
        allowLms: false,
        allowDirectory: false,
        hiddenMenuKeys: [],
      };

    default:
      return {
        planCode: "BASIC",
        maxSites: 1,
        maxPages: 10,
        maxMenus: 10,
        maxProductCategories: 20,
        maxProducts: 100,
        maxCustomDomains: 1,
        allowBlog: true,
        allowEcommerce: false,
        allowBooking: false,
        allowNews: false,
        allowLms: false,
        allowDirectory: false,
        hiddenMenuKeys: [],
      };
  }
}

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.nextUrl.searchParams.get("workspaceId")?.trim();

    if (!workspaceId) {
      return NextResponse.json({ message: "workspaceId is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        accessPolicy: true,
        sites: {
          select: { id: true },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    const usage = {
      sites: workspace.sites.length,
      pages: 0,
      menus: 0,
      productCategories: 0,
      products: 0,
    };

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        ownerUserId: workspace.ownerUserId,
      },
      policy: workspace.accessPolicy,
      usage,
    });
  } catch (error) {
    console.error("[GET workspaces]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const ownerUserId = String(body.ownerUserId ?? "").trim();
    const inputSlug = String(body.slug ?? "").trim();

    // ✅ FIX: khai báo tier TRƯỚC
    const tier: AccessTier = ["BASIC", "NORMAL", "PRO"].includes(body.tier)
      ? body.tier
      : "BASIC";

    if (!name || !ownerUserId) {
      return NextResponse.json({ message: "name and ownerUserId are required" }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerUserId },
    });

    if (!owner) {
      return NextResponse.json({ message: "Owner user not found" }, { status: 404 });
    }

    const existingWorkspace = await prisma.workspace.findFirst({
      where: { ownerUserId },
    });

    if (existingWorkspace) {
      return NextResponse.json({ message: "This user already has a workspace" }, { status: 409 });
    }

    const rawBaseSlug = toSlug(inputSlug || name);
    const safeBaseSlug = rawBaseSlug || `workspace-${ownerUserId.slice(0, 6)}`;

    let finalSlug = safeBaseSlug;
    let counter = 1;

    while (await prisma.workspace.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${safeBaseSlug}-${counter++}`;
    }

    // ✅ OK rồi
    const policyData = getPolicyByTier(tier);

    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name,
          slug: finalSlug,
          ownerUserId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerUserId,
          role: "OWNER",
          tier,
        },
      });

      const policy = await tx.workspaceAccessPolicy.create({
        data: {
          workspaceId: workspace.id,
          ...policyData,
        },
      });

      return { workspace, policy };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST workspaces]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const workspaceId = String(body.workspaceId ?? "").trim();

    if (!workspaceId) {
      return NextResponse.json({ message: "workspaceId is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { accessPolicy: true },
    });

    if (!workspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    const hasWorkspaceInfoPayload =
      body.name !== undefined || body.slug !== undefined;

    const hasPolicyPayload =
      body.maxSites !== undefined ||
      body.maxPages !== undefined ||
      body.maxMenus !== undefined ||
      body.maxProductCategories !== undefined ||
      body.maxProducts !== undefined;

    if (!hasWorkspaceInfoPayload && !hasPolicyPayload) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    // update workspace info
    if (hasWorkspaceInfoPayload) {
      const nextName = String(body.name ?? workspace.name).trim();
      const nextSlugInput = String(body.slug ?? workspace.slug).trim();
      const nextSlugBase = toSlug(nextSlugInput || nextName);

      if (!nextName) {
        return NextResponse.json({ message: "Workspace name is required" }, { status: 400 });
      }

      let finalSlug = nextSlugBase;
      let counter = 1;

      while (true) {
        const existingSlug = await prisma.workspace.findUnique({
          where: { slug: finalSlug },
        });

        if (!existingSlug || existingSlug.id === workspaceId) break;
        finalSlug = `${nextSlugBase}-${counter++}`;
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          name: nextName,
          slug: finalSlug,
        },
      });

      return NextResponse.json({ workspace: updatedWorkspace });
    }

    // update policy
    if (!workspace.accessPolicy) {
      return NextResponse.json({ message: "Workspace policy not found" }, { status: 404 });
    }

    const updatedPolicy = await prisma.workspaceAccessPolicy.update({
      where: { workspaceId },
      data: {
        maxSites: Number(body.maxSites ?? workspace.accessPolicy.maxSites),
        maxPages: Number(body.maxPages ?? workspace.accessPolicy.maxPages),
        maxMenus: Number(body.maxMenus ?? workspace.accessPolicy.maxMenus),
        maxProductCategories: Number(
          body.maxProductCategories ?? workspace.accessPolicy.maxProductCategories
        ),
        maxProducts: Number(body.maxProducts ?? workspace.accessPolicy.maxProducts),
      },
    });

    return NextResponse.json(updatedPolicy);
  } catch (error) {
    console.error("[PUT workspaces]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}