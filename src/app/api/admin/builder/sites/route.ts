import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/session";

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

  for (const r of rows) {
    const m = r.id.match(re);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }

  const next = max + 1;
  const suffix = String(next).padStart(2, "0");
  return `${prefix}${suffix}`.toLowerCase();
}

async function requireAdminUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session")?.value ?? null;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      user: { select: { id: true, role: true, status: true } },
    },
  });

  if (!session?.user) return null;
  if (session.user.role !== "ADMIN" || session.user.status !== "ACTIVE") return null;

  return session.user;
}

export async function GET() {
  const items = await prisma.site.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const id = await nextSiteId("sitea");

    const created = await prisma.site.create({
      data: {
        id,
        domain: parsed.data.domain,
        name: parsed.data.name,
        owner: { connect: { id: admin.id } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("constraint")) {
      return NextResponse.json({ error: "Domain already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create site." }, { status: 500 });
  }
}
