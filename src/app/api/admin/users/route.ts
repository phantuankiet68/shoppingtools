import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { hashPassword } from "@/lib/password";

const USER_ROLES = new Set(["ADMIN", "USER"] as const);
const PROFILE_ROLES = new Set(["admin", "staff", "viewer"] as const);
const PROFILE_STATUS = new Set(["active", "suspended"] as const);

function cleanStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();

    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const role = (searchParams.get("role") || "").trim(); // USER | ADMIN
    const status = (searchParams.get("status") || "").trim(); // active | suspended
    const isActive = (searchParams.get("isActive") || "").trim(); // true | false (optional)

    const where: any = {};

    // User.role (enum UserRole)
    if (role === "ADMIN" || role === "USER") where.role = role;

    // User.isActive (boolean)
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;

    // Profile.status (enum AccountStatus)
    if (status === "active" || status === "suspended") {
      where.profile = { is: { status } };
    }

    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { profile: { is: { username: { contains: q, mode: "insensitive" } } } },
        { profile: { is: { firstName: { contains: q, mode: "insensitive" } } } },
        { profile: { is: { lastName: { contains: q, mode: "insensitive" } } } },
        { profile: { is: { phone: { contains: q, mode: "insensitive" } } } },
        { profile: { is: { company: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              phone: true,
              address: true,
              city: true,
              country: true,

              backupEmail: true,
              role: true, // ProfileRole
              status: true, // AccountStatus

              company: true,
              department: true,
              jobTitle: true,

              dobMonth: true,
              dobDay: true,
              dobYear: true,

              lastLoginAt: true,
              lastLoginIp: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((x) => ({
        ...x,
        createdAt: x.createdAt.toISOString(),
        updatedAt: x.updatedAt.toISOString(),
        profile: x.profile
          ? {
              ...x.profile,
              hireDate: undefined, // (không select nên bỏ qua)
              lastLoginAt: x.profile.lastLoginAt ? x.profile.lastLoginAt.toISOString() : null,
            }
          : null,
      })),
      total,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const body = await req.json().catch(() => ({}));

    const email = cleanStr(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role;
    const isActive = body?.isActive === undefined ? true : !!body.isActive;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email is invalid" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (role !== undefined && !USER_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
    }

    // ✅ Optional: check duplicate email early (nice error)
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const profile = body?.profile ?? {};
    const username = cleanStr(profile.username);

    // ✅ Optional: check duplicate username early (unique in Profile)
    if (username) {
      const u2 = await prisma.profile.findUnique({ where: { username }, select: { id: true } });
      if (u2) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }
    }

    const profileRole = profile?.role && PROFILE_ROLES.has(profile.role) ? profile.role : "viewer";
    const profileStatus = profile?.status && PROFILE_STATUS.has(profile.status) ? profile.status : "active";

    // ✅ bcrypt hash
    const passwordHash = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        email,
        role: role ?? "USER",
        isActive,
        passwordHash,
        passwordUpdatedAt: new Date(),
        image: cleanStr(body?.image),

        profile: {
          create: {
            firstName: cleanStr(profile.firstName),
            lastName: cleanStr(profile.lastName),
            username,
            backupEmail: cleanStr(profile.backupEmail),
            phone: cleanStr(profile.phone),
            address: cleanStr(profile.address),
            city: cleanStr(profile.city),
            country: cleanStr(profile.country),

            role: profileRole,
            status: profileStatus,

            company: cleanStr(profile.company),
            department: cleanStr(profile.department),
            jobTitle: cleanStr(profile.jobTitle),
            manager: cleanStr(profile.manager),

            gender: profile.gender === "male" || profile.gender === "female" || profile.gender === "other" ? profile.gender : "other",
            timezone: cleanStr(profile.timezone) ?? "Asia/Ho_Chi_Minh",
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    // ✅ Prisma unique constraint (P2002) -> email/username duplicates
    if (e?.code === "P2002") {
      const target = Array.isArray(e?.meta?.target) ? e.meta.target.join(", ") : String(e?.meta?.target || "");
      if (target.includes("email")) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      if (target.includes("username")) return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      return NextResponse.json({ error: "Duplicate value" }, { status: 400 });
    }

    return NextResponse.json({ error: e?.message || "Create failed" }, { status: 400 });
  }
}
