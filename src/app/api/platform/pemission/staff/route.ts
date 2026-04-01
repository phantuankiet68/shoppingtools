import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        systemRole: "ADMIN",
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const staffMembers = admins.map((user) => {
      const firstName = (user.profile as any)?.firstName ?? "";
      const lastName = (user.profile as any)?.lastName ?? "";
      const phone = (user.profile as any)?.phone ?? "N/A";
      const jobTitle = (user.profile as any)?.jobTitle ?? "Administration";
      const bio = (user.profile as any)?.bio ?? "Administrator of the system.";

      const fullName = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Unknown User";

      const initials =
        fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join("") || "NA";

      return {
        id: user.id,
        name: fullName,
        role: "Manager",
        avatar: initials,
        email: user.email,
        phone,
        subject: jobTitle,
        experience: "N/A",
        qualification: "N/A",
        bio,
        teachingProfile: false,
        verified: Boolean(user.emailVerifiedAt),
        image: user.image ?? null,
        systemRole: user.systemRole,
        status: user.status,
      };
    });

    return NextResponse.json(staffMembers, { status: 200 });
  } catch (error) {
    console.error("[API /api/platform/pemission/staff] Failed to fetch admin staff");
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch admin staff",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
