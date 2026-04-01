import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type CreateTenantPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function buildName(firstName: string, lastName: string, fallbackEmail: string) {
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || fallbackEmail.split("@")[0] || "Unknown User";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTenantPayload;

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ message: "email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          systemRole: "ADMIN",
          status: "ACTIVE",
          profile: {
            create: {
              firstName: firstName || null,
              lastName: lastName || null,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      return user;
    });

    const fullName = buildName(firstName, lastName, email);
    const initials =
      fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "NA";

    return NextResponse.json(
      {
        id: createdUser.id,
        workspaceId: null,
        workspaceName: null,
        workspaceSlug: null,
        name: fullName,
        role: "Manager",
        avatar: initials,
        email: createdUser.email,
        phone: createdUser.profile?.phone ?? "N/A",
        subject: createdUser.profile?.jobTitle ?? "Administration",
        experience: "N/A",
        qualification: "N/A",
        bio: createdUser.profile?.bio ?? "Administrator of the system.",
        teachingProfile: false,
        verified: Boolean(createdUser.emailVerifiedAt),
        image: createdUser.image ?? null,
        systemRole: createdUser.systemRole,
        status: createdUser.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/platform/permission/create-tenants]", error);

    return NextResponse.json(
      {
        message: "Failed to create tenant access",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
