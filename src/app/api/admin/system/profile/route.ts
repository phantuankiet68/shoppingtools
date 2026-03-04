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

  // Accept exact enum
  if (s === "ADMIN") return ProfileRole.ADMIN;
  if (s === "STAFF") return ProfileRole.STAFF;
  if (s === "USER") return ProfileRole.USER;

  // Accept common UI labels (customize as you like)
  if (s === "VIEWER") return ProfileRole.USER;
  if (s === "MEMBER") return ProfileRole.USER;

  return null;
}

function toProfileStatus(v: unknown): ProfileStatus | null {
  if (v === undefined || v === null || v === "") return null;

  const s = String(v).trim().toUpperCase();

  // Accept exact enum
  if (s === "ACTIVE") return ProfileStatus.ACTIVE;
  if (s === "INACTIVE") return ProfileStatus.INACTIVE;
  if (s === "SUSPENDED") return ProfileStatus.SUSPENDED;

  // Accept common UI labels
  if (s === "DISABLED") return ProfileStatus.INACTIVE;
  if (s === "BLOCKED") return ProfileStatus.SUSPENDED;

  return null;
}

function parseDateOrNull(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  try {
    const user = await requireAdminAuthUser();

    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
      },
    });

    return NextResponse.json({ user: data });
  } catch (e) {
    // Unauthorized (auth fail) OR other errors
    console.error("GET /api/admin/system/profile error:", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  // Auth fail -> 401
  let userId: string;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;
  } catch (e) {
    console.error("PATCH /api/admin/system/profile auth error:", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Validate basic inputs (your existing validator)
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

    // Map enums safely
    const mappedRole = toProfileRole(body.role);
    const mappedStatus = toProfileStatus(body.status);

    // If role/status provided but invalid -> 400
    if (body.role !== undefined && mappedRole === null) {
      return NextResponse.json(
        {
          error: "INVALID_ROLE",
          allowed: ["ADMIN", "STAFF", "USER"],
          received: body.role,
        },
        { status: 400 },
      );
    }

    if (body.status !== undefined && mappedStatus === null) {
      return NextResponse.json(
        {
          error: "INVALID_STATUS",
          allowed: ["ACTIVE", "INACTIVE", "SUSPENDED"],
          received: body.status,
        },
        { status: 400 },
      );
    }

    const hireDate = parseDateOrNull(body.hireDate);

    const profile = await prisma.profile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,

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
        hireDate,

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
        ...(body.hireDate !== undefined ? { hireDate } : {}),

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
    });

    return NextResponse.json({ profile });
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.profile.delete({ where: { userId } }).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/system/profile error:", e);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
