import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim().toLowerCase())
    .refine((s) => !s.startsWith("http://") && !s.startsWith("https://"), "Domain should not include protocol")
    .refine((s) => /^[a-z0-9.-]+$/.test(s), "Domain only allows a-z, 0-9, dot, dash"),
  name: z
    .string()
    .min(2)
    .max(100)
    .transform((s) => s.trim()),
  workspaceId: z.string().min(1).optional(),
});

async function nextSiteId(prefix = "sitea") {
  const rows = await prisma.site.findMany({
    where: { id: { startsWith: prefix } },
    select: { id: true },
    orderBy: { id: "desc" },
    take: 50,
  });

  let max = 0;
  const re = new RegExp(`^${prefix}(\\d{2})$`, "i");

  for (const row of rows) {
    const match = row.id.match(re);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > max) max = value;
  }

  const next = max + 1;
  const suffix = String(next).padStart(2, "0");
  return `${prefix}${suffix}`.toLowerCase();
}

function isMissingWorkspaceColumn(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("workspace_id") || message.includes("workspaceid");
}

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const workspaceId = session.currentWorkspace?.id ?? null;

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace selected." }, { status: 400 });
    }

    const items = await prisma.site.findMany({
      where: {
        deletedAt: null,
        workspaceId,
        ownerUserId: userId,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        domain: true,
        name: true,
        type: true,

        status: true,
        isPublic: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      currentWorkspace: session.currentWorkspace,
      items,
    });
  } catch (error) {
    console.error("GET /api/admin/sites error:", error);
    return NextResponse.json({ error: "Failed to fetch sites." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = CreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const workspaceId = parsed.data.workspaceId ?? session.currentWorkspace?.id ?? null;

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace selected." }, { status: 400 });
    }

    const duplicate = await prisma.site.findFirst({
      where: {
        domain: parsed.data.domain,
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json({ error: "Domain already exists." }, { status: 409 });
    }

    const id = await nextSiteId("sitea");

    const created = await prisma.site.create({
      data: {
        id,
        domain: parsed.data.domain,
        name: parsed.data.name,
        owner: { connect: { id: session.user.id } },
        createdBy: { connect: { id: session.user.id } },
        workspace: { connect: { id: workspaceId } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("unique") || message.includes("constraint")) {
        return NextResponse.json({ error: "Domain already exists." }, { status: 409 });
      }

      if (isMissingWorkspaceColumn(error)) {
        return NextResponse.json(
          { error: "Database migration for workspace_id has not been applied yet." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ error: "Failed to create site." }, { status: 500 });
  }
}
