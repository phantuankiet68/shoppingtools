import { NextRequest, NextResponse } from "next/server";
import { WebsiteType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
type Context = {
  params: Promise<{ workspaceId: string; id: string }>;
};

type UpdateSitePayload = {
  name?: string;
  domain?: string;
  type?: WebsiteType;
  status?: "DRAFT" | "ACTIVE" | "SUSPENDED";
  isPublic?: boolean;
  publishedAt?: string | null;
};

function normalizeDomain(value: string) {
  return value.trim().toLowerCase();
}

function isAllowedWebsiteType(
  type: WebsiteType,
  policy: {
    allowBlog: boolean;
    allowEcommerce: boolean;
    allowBooking: boolean;
    allowNews: boolean;
    allowLms: boolean;
    allowDirectory: boolean;
  },
) {
  switch (type) {
    case "landing":
    case "company":
      return true;
    case "blog":
      return policy.allowBlog;
    case "ecommerce":
      return policy.allowEcommerce;
    case "booking":
      return policy.allowBooking;
    case "news":
      return policy.allowNews;
    case "lms":
      return policy.allowLms;
    case "directory":
      return policy.allowDirectory;
    default:
      return false;
  }
}

export async function GET(_: NextRequest, { params }: Context) {
  try {
    const { workspaceId, id } = await params;

    const site = await prisma.site.findFirst({
      where: {
        id,
        workspaceId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        type: true,
        status: true,
        isPublic: true,
        publishedAt: true,
        ownerUserId: true,
        createdByUserId: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    return NextResponse.json(site, { status: 200 });
  } catch (error) {
    console.error("[GET /api/platform/permission/workspaces/[workspaceId]/sites/[id]]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { workspaceId, id } = await params;
    const body = (await req.json()) as UpdateSitePayload;

    const existingSite = await prisma.site.findFirst({
      where: {
        id,
        workspaceId,
        deletedAt: null,
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!existingSite) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        accessPolicy: {
          select: {
            allowBlog: true,
            allowEcommerce: true,
            allowBooking: true,
            allowNews: true,
            allowLms: true,
            allowDirectory: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    if (!workspace.accessPolicy) {
      return NextResponse.json({ message: "Workspace policy not found" }, { status: 404 });
    }

    const nextType = body.type ?? existingSite.type;

    if (!isAllowedWebsiteType(nextType, workspace.accessPolicy)) {
      return NextResponse.json({ message: `Workspace is not allowed to use ${nextType} sites` }, { status: 403 });
    }

    const data: {
      name?: string;
      domain?: string;
      type?: WebsiteType;
      status?: "DRAFT" | "ACTIVE" | "SUSPENDED";
      isPublic?: boolean;
      publishedAt?: Date | null;
    } = {};

    if (body.name !== undefined) {
      const nextName = String(body.name).trim();

      if (!nextName) {
        return NextResponse.json({ message: "Site name is required" }, { status: 400 });
      }

      data.name = nextName;
    }

    if (body.domain !== undefined) {
      const nextDomain = normalizeDomain(String(body.domain));

      if (!nextDomain) {
        return NextResponse.json({ message: "Domain is required" }, { status: 400 });
      }

      data.domain = nextDomain;
    }

    if (body.type !== undefined) {
      data.type = body.type;
    }

    if (body.status !== undefined) {
      data.status = body.status;
    }

    if (body.isPublic !== undefined) {
      data.isPublic = Boolean(body.isPublic);
    }

    if (body.publishedAt !== undefined) {
      data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    }

    const updatedSite = await prisma.site.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        domain: true,
        type: true,
        status: true,
        isPublic: true,
        publishedAt: true,
        ownerUserId: true,
        createdByUserId: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedSite, { status: 200 });
  } catch (error: any) {
    console.error("[PUT /api/platform/permission/workspaces/[workspaceId]/sites/[id]]", error);

    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Domain already exists" }, { status: 409 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Context) {
  try {
    const { workspaceId, id } = await params;

    const site = await prisma.site.findFirst({
      where: {
        id,
        workspaceId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    await prisma.site.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "SUSPENDED",
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/platform/permission/workspaces/[workspaceId]/sites/[id]]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
