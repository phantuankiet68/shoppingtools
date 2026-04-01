import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        systemRole: {
          in: ["ADMIN"],
        },
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const ownerIds = admins.map((user) => user.id);

    const workspaces =
      ownerIds.length > 0
        ? await prisma.workspace.findMany({
            where: {
              ownerUserId: {
                in: ownerIds,
              },
            },
            select: {
              id: true,
              ownerUserId: true,
              name: true,
              slug: true,
            },
          })
        : [];

    const workspaceByOwnerId = new Map(workspaces.map((workspace) => [workspace.ownerUserId, workspace]));

    const staffMembers = admins.map((user) => {
      const profile = user.profile as
        | {
            firstName?: string | null;
            lastName?: string | null;
            phone?: string | null;
            jobTitle?: string | null;
            bio?: string | null;
          }
        | null
        | undefined;

      const firstName = profile?.firstName ?? "";
      const lastName = profile?.lastName ?? "";
      const phone = profile?.phone ?? "N/A";
      const jobTitle = profile?.jobTitle ?? "Administration";
      const bio = profile?.bio ?? "Administrator of the system.";

      const fullName = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Unknown User";

      const initials =
        fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join("") || "NA";

      const workspace = workspaceByOwnerId.get(user.id);

      return {
        id: user.id,
        workspaceId: workspace?.id ?? null,
        workspaceName: workspace?.name ?? null,
        workspaceSlug: workspace?.slug ?? null,
        name: fullName,
        role: "Manager",
        avatar: initials,
        email: user.email ?? "",
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
    console.error("[API /api/platform/permission/staff] Failed to fetch admin staff");
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
