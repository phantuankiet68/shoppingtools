import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { validateProfileInput } from "@/lib/validators/profile";
export async function GET() {
  try {
    const user = await requireAdminAuthUser();

    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        profile: true,
      },
    });

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAdminAuthUser();
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
      return Response.json({ error: "VALIDATION_ERROR", errors }, { status: 400 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        username: body.username ?? null,
        backupEmail: body.backupEmail ?? null,
        phone: body.phone ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        country: body.country ?? null,

        role: body.role ?? undefined,
        status: body.status ?? undefined,

        company: body.company ?? null,
        department: body.department ?? null,
        jobTitle: body.jobTitle ?? null,
        manager: body.manager ?? null,
        hireDate: body.hireDate ? new Date(body.hireDate) : null,

        gender: body.gender ?? null,
        locale: body.locale ?? undefined,
        timezone: body.timezone ?? undefined,

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
        ...(body.backupEmail !== undefined ? { backupEmail: body.backupEmail } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.city !== undefined ? { city: body.city } : {}),
        ...(body.country !== undefined ? { country: body.country } : {}),
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.company !== undefined ? { company: body.company } : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.jobTitle !== undefined ? { jobTitle: body.jobTitle } : {}),
        ...(body.manager !== undefined ? { manager: body.manager } : {}),
        ...(body.hireDate !== undefined ? { hireDate: body.hireDate ? new Date(body.hireDate) : null } : {}),
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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAdminAuthUser();
    await prisma.profile.delete({ where: { userId: user.id } }).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
