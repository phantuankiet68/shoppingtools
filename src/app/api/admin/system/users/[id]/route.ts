import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type Ctx = { params: Promise<{ id: string }> };

const PROFILE_ROLES = new Set(["admin", "staff", "viewer"] as const);
const PROFILE_STATUS = new Set(["active", "suspended"] as const);
const USER_ROLES = new Set(["ADMIN", "USER"] as const);

function cleanStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function cleanInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Remove keys with value === undefined (keeps null) */
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    await requireAdminAuthUser();
    const { id } = await ctx.params;

    const item = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        role: true,
        isActive: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      item: {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        emailVerifiedAt: item.emailVerifiedAt ? item.emailVerifiedAt.toISOString() : null,
        profile: item.profile
          ? {
              ...item.profile,
              hireDate: item.profile.hireDate ? item.profile.hireDate.toISOString() : null,
              lastLoginAt: item.profile.lastLoginAt ? item.profile.lastLoginAt.toISOString() : null,
            }
          : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAdminAuthUser();
    const { id } = await ctx.params;

    const body = await req.json().catch(() => ({}));

    // ----- User fields -----
    const userRole = body?.role as unknown;
    if (userRole !== undefined && !USER_ROLES.has(userRole as any)) {
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
    }

    const isActive = body?.isActive === undefined ? undefined : !!body.isActive;
    const image = body?.image === undefined ? undefined : cleanStr(body.image);

    // ----- Profile fields -----
    const p = (body?.profile ?? null) as any;

    const rawProfileData = p
      ? {
          firstName: cleanStr(p.firstName),
          lastName: cleanStr(p.lastName),
          username: cleanStr(p.username),
          backupEmail: cleanStr(p.backupEmail),
          phone: cleanStr(p.phone),
          address: cleanStr(p.address),
          city: cleanStr(p.city),
          country: cleanStr(p.country),

          company: cleanStr(p.company),
          department: cleanStr(p.department),
          jobTitle: cleanStr(p.jobTitle),
          manager: cleanStr(p.manager),

          // enums (only set when valid)
          role: p.role && PROFILE_ROLES.has(p.role) ? p.role : undefined,
          status: p.status && PROFILE_STATUS.has(p.status) ? p.status : undefined,

          // DOB parts
          dobMonth: cleanStr(p.dobMonth),
          dobDay: cleanInt(p.dobDay),
          dobYear: cleanInt(p.dobYear),

          // socials
          twitter: cleanStr(p.twitter),
          linkedin: cleanStr(p.linkedin),
          facebook: cleanStr(p.facebook),
          github: cleanStr(p.github),
          website: cleanStr(p.website),

          slogan: cleanStr(p.slogan),
          bio: cleanStr(p.bio),
        }
      : null;

    // Prisma update payload
    const data: Parameters<typeof prisma.user.update>[0]["data"] = {};

    if (userRole !== undefined) data.role = userRole as any;
    if (isActive !== undefined) data.isActive = isActive;
    if (image !== undefined) data.image = image;

    if (rawProfileData) {
      const profileData = stripUndefined(rawProfileData);

      data.profile = {
        upsert: {
          create: profileData as any,
          update: profileData as any,
        },
      };
    }

    await prisma.user.update({
      where: { id },
      data,
      select: { id: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 400 });
  }
}
