import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          currentWorkspace: null,
          memberships: [],
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        systemRole: session.user.systemRole,
        status: session.user.status,
        emailVerifiedAt: session.user.emailVerifiedAt,
        lastLoginAt: session.user.lastLoginAt,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
        roleLabel: session.user.roleLabel,
        profile: session.user.profile,
      },
      currentWorkspace: session.currentWorkspace,
      memberships: session.memberships,
    });
  } catch (error) {
    console.error("ADMIN_ME_ERROR", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        currentWorkspace: null,
        memberships: [],
      },
      { status: 401 },
    );
  }
}
