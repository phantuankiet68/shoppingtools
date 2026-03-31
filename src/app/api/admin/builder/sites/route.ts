import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertWorkspaceRole, pickCurrentMembership, requireSessionUser } from "@/lib/auth/auth-workspace";

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

export async function GET(req: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(req.url);
    const requestedWorkspaceId = searchParams.get("workspaceId");
    const membership = pickCurrentMembership(user, requestedWorkspaceId);

    if (!membership) {
      return NextResponse.json({ error: "No workspace access." }, { status: 403 });
    }

    const items = await prisma.site.findMany({
      where: {
        deletedAt: null,
        OR: [
          { workspaceId: membership.workspaceId },
          {
            workspaceId: null,
            ownerUserId: user.id,
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      workspace: {
        id: membership.workspaceId,
        name: membership.workspaceName,
        slug: membership.workspaceSlug,
        role: membership.role,
      },
      items,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to fetch sites." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireSessionUser();
    const body = await req.json().catch(() => ({}));
    const parsed = CreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const membership = pickCurrentMembership(user, parsed.data.workspaceId ?? null);
    if (!membership) {
      return NextResponse.json({ error: "No workspace access." }, { status: 403 });
    }

    assertWorkspaceRole(membership.role, ["OWNER", "ADMIN"]);

    const id = await nextSiteId("sitea");

    const created = await prisma.site.create({
      data: {
        id,
        domain: parsed.data.domain,
        name: parsed.data.name,
        owner: { connect: { id: user.id } },
        createdBy: { connect: { id: user.id } },
        workspace: { connect: { id: membership.workspaceId } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

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
