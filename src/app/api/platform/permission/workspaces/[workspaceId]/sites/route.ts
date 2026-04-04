import { NextRequest, NextResponse } from "next/server";
import { WebsiteType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ workspaceId: string }>;
};

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED";

type CreateSitePayload = {
  name?: string;
  domain?: string;
  type?: WebsiteType;
  status?: SiteStatus;
  isPublic?: boolean;
  createdByUserId?: string | null;
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

const siteSelect = {
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
} as const;

export async function GET(_: NextRequest, { params }: Context) {
  try {
    const { workspaceId } = await params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });

    if (!workspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    const sites = await prisma.site.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: siteSelect,
    });

    return NextResponse.json(sites, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/platform/permission/workspaces/[workspaceId]/sites]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const { workspaceId } = await params;
    const body = (await req.json()) as CreateSitePayload;

    const name = String(body.name ?? "").trim();
    const domain = normalizeDomain(String(body.domain ?? ""));
    const type = body.type;
    const status: SiteStatus = body.status ?? "DRAFT";
    const isPublic = Boolean(body.isPublic);
    const createdByUserId = body.createdByUserId ? String(body.createdByUserId).trim() : null;

    if (!name || !domain || !type) {
      return NextResponse.json({ message: "name, domain and type are required" }, { status: 400 });
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

    if (!isAllowedWebsiteType(type, workspace.accessPolicy)) {
      return NextResponse.json(
        { message: `Workspace is not allowed to create ${type} sites` },
        { status: 403 },
      );
    }

    const existingDomain = await prisma.site.findFirst({
      where: {
        domain,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (existingDomain) {
      return NextResponse.json({ message: "Domain already exists" }, { status: 409 });
    }

    const createdSite = await prisma.site.create({
      data: {
        name,
        domain,
        type,
        status,
        isPublic,
        workspaceId,
        ownerUserId: workspace.ownerUserId,
        createdByUserId,
      },
      select: siteSelect,
    });

    return NextResponse.json(createdSite, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/platform/permission/workspaces/[workspaceId]/sites]", error);

    const prismaError = error as { code?: string };

    if (prismaError?.code === "P2002") {
      return NextResponse.json({ message: "Domain already exists" }, { status: 409 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}