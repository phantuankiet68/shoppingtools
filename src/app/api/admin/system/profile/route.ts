import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { validateProfileInput } from "@/lib/validators/profile";
import { ProfileRole, ProfileStatus } from "@prisma/client";

export const runtime = "nodejs";

// -------- helpers: map FE values -> Prisma enums --------
function toProfileRole(v: unknown): ProfileRole | null {
  if (v === undefined || v === null || v === "") return null;

  const s = String(v).trim().toUpperCase();

  if (s === "ADMIN") return ProfileRole.ADMIN;
  if (s === "STAFF") return ProfileRole.STAFF;
  if (s === "USER") return ProfileRole.USER;

  if (s === "VIEWER") return ProfileRole.USER;
  if (s === "MEMBER") return ProfileRole.USER;

  return null;
}

function toProfileStatus(v: unknown): ProfileStatus | null {
  if (v === undefined || v === null || v === "") return null;

  const s = String(v).trim().toUpperCase();

  if (s === "ACTIVE") return ProfileStatus.ACTIVE;
  if (s === "INACTIVE") return ProfileStatus.INACTIVE;
  if (s === "SUSPENDED") return ProfileStatus.SUSPENDED;

  if (s === "DISABLED") return ProfileStatus.INACTIVE;
  if (s === "BLOCKED") return ProfileStatus.SUSPENDED;

  return null;
}

function parseDateOrNull(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function toSiteIdOrNull(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  const s = String(v).trim();
  return s ? s : null;
}

const PROFILE_SELECT = {
  id: true,
  userId: true,
  siteId: true,
  firstName: true,
  lastName: true,
  username: true,
  role: true,
  status: true,
  email: true,
  backupEmail: true,
  phone: true,
  address: true,
  city: true,
  country: true,
  company: true,
  department: true,
  jobTitle: true,
  manager: true,
  hireDate: true,
  gender: true,
  locale: true,
  timezone: true,
  dobMonth: true,
  dobDay: true,
  dobYear: true,
  twitter: true,
  linkedin: true,
  facebook: true,
  github: true,
  website: true,
  slogan: true,
  bio: true,
  twoFA: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET() {
  try {
    const user = await requireAdminAuthUser();

    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        profile: { select: PROFILE_SELECT },
      },
    });

    if (!data) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ user: data });
  } catch (e) {
    console.error("GET /api/admin/system/profile error:", e);
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  let userId: string;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;
  } catch (e) {
    console.error("PATCH /api/admin/system/profile auth error:", e);
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const errors = validateProfileInput({
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,
      role: body.role,
      status: body.status,
      email: body.email,
      backupEmail: body.backupEmail,
      phone: body.phone,
      address: body.address,
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: "VALIDATION_ERROR", errors }, { status: 400 });
    }

    const mappedRole = toProfileRole(body.role);
    const mappedStatus = toProfileStatus(body.status);

    if (body.role !== undefined && mappedRole === null) {
      return NextResponse.json(
        { error: "INVALID_ROLE", allowed: ["ADMIN", "STAFF", "USER"], received: body.role },
        { status: 400 },
      );
    }

    if (body.status !== undefined && mappedStatus === null) {
      return NextResponse.json(
        { error: "INVALID_STATUS", allowed: ["ACTIVE", "INACTIVE", "SUSPENDED"], received: body.status },
        { status: 400 },
      );
    }

    const hireDate = body.hireDate !== undefined ? parseDateOrNull(body.hireDate) : undefined;

    // ✅ siteId nằm ở Profile
    const siteId = body.siteId !== undefined ? toSiteIdOrNull(body.siteId) : undefined;

    // ✅ Nếu có gửi siteId (khác undefined) và khác null => check site tồn tại
    if (siteId !== undefined && siteId !== null) {
      const exists = await prisma.site.findUnique({
        where: { id: siteId },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json({ error: "SITE_NOT_FOUND" }, { status: 400 });
      }
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,

        ...(siteId !== undefined ? { siteId } : {}),

        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        username: body.username ?? null,

        email: body.email ?? null,
        backupEmail: body.backupEmail ?? null,
        phone: body.phone ?? null,
        address: body.address ?? null,

        city: body.city ?? null,
        country: body.country ?? null,

        role: mappedRole ?? undefined,
        status: mappedStatus ?? undefined,

        company: body.company ?? null,
        department: body.department ?? null,
        jobTitle: body.jobTitle ?? null,
        manager: body.manager ?? null,
        hireDate: hireDate ?? null,

        gender: body.gender ?? null,
        locale: body.locale ?? null,
        timezone: body.timezone ?? null,

        dobMonth: body.dobMonth ?? null,
        dobDay: typeof body.dobDay === "number" ? body.dobDay : null,
        dobYear: typeof body.dobYear === "number" ? body.dobYear : null,

        twitter: body.twitter ?? null,
        linkedin: body.linkedin ?? null,
        facebook: body.facebook ?? null,
        github: body.github ?? null,
        website: body.website ?? null,

        slogan: body.slogan ?? null,
        bio: body.bio ?? null,

        twoFA: typeof body.twoFA === "boolean" ? body.twoFA : false,
      },
      update: {
        ...(siteId !== undefined ? { siteId } : {}),

        ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
        ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
        ...(body.username !== undefined ? { username: body.username } : {}),

        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.backupEmail !== undefined ? { backupEmail: body.backupEmail } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),

        ...(body.city !== undefined ? { city: body.city } : {}),
        ...(body.country !== undefined ? { country: body.country } : {}),

        ...(body.role !== undefined ? { role: mappedRole ?? undefined } : {}),
        ...(body.status !== undefined ? { status: mappedStatus ?? undefined } : {}),

        ...(body.company !== undefined ? { company: body.company } : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.jobTitle !== undefined ? { jobTitle: body.jobTitle } : {}),
        ...(body.manager !== undefined ? { manager: body.manager } : {}),
        ...(body.hireDate !== undefined ? { hireDate: hireDate ?? null } : {}),

        ...(body.gender !== undefined ? { gender: body.gender } : {}),
        ...(body.locale !== undefined ? { locale: body.locale } : {}),
        ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),

        ...(body.dobMonth !== undefined ? { dobMonth: body.dobMonth } : {}),
        ...(body.dobDay !== undefined ? { dobDay: typeof body.dobDay === "number" ? body.dobDay : null } : {}),
        ...(body.dobYear !== undefined ? { dobYear: typeof body.dobYear === "number" ? body.dobYear : null } : {}),

        ...(body.twitter !== undefined ? { twitter: body.twitter } : {}),
        ...(body.linkedin !== undefined ? { linkedin: body.linkedin } : {}),
        ...(body.facebook !== undefined ? { facebook: body.facebook } : {}),
        ...(body.github !== undefined ? { github: body.github } : {}),
        ...(body.website !== undefined ? { website: body.website } : {}),

        ...(body.slogan !== undefined ? { slogan: body.slogan } : {}),
        ...(body.bio !== undefined ? { bio: body.bio } : {}),

        ...(body.twoFA !== undefined ? { twoFA: !!body.twoFA } : {}),
      },
      select: PROFILE_SELECT,
    });

    // ✅ Trả kèm user tối giản để FE sync dễ
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, status: true },
    });

    return NextResponse.json({ user, profile });
  } catch (e) {
    console.error("PATCH /api/admin/system/profile error:", e);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE() {
  let userId: string;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;
  } catch (e) {
    console.error("DELETE /api/admin/system/profile auth error:", e);
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    await prisma.profile.delete({ where: { userId } }).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/system/profile error:", e);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
