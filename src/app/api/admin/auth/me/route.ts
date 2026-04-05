import { getSessionUser, pickCurrentMembership } from "@/lib/auth/auth-workspace";
import { prisma } from '@/lib/prisma';

function toSystemRoleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "CUSTOMER":
      return "Customer";
    default:
      return role;
  }
}

export async function GET(req: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestedWorkspaceId = searchParams.get("workspaceId");
  const currentMembership = pickCurrentMembership(user, requestedWorkspaceId);
  const displayName = user.email.includes("@") ? user.email.split("@")[0] : user.email;

  let site = null;

  if (currentMembership?.workspaceId) {
    site = await prisma.site.findFirst({
      where: {
        workspaceId: currentMembership.workspaceId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        ownerUserId: true,
        status: true,
        isPublic: true,
        publishedAt: true,
        themeConfig: true,
        seoTitleDefault: true,
        seoDescDefault: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        createdByUserId: true,
        workspaceId: true,
        type: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return Response.json({
    user: {
      id: user.id,
      name: displayName,
      email: user.email,
      image: user.image,
      systemRole: user.systemRole,
      roleLabel: toSystemRoleLabel(user.systemRole),
    },
    currentWorkspace: currentMembership
      ? {
          id: currentMembership.workspaceId,
          name: currentMembership.workspaceName,
          slug: currentMembership.workspaceSlug,
          role: currentMembership.role,
        }
      : null,
    site,
    memberships: user.memberships.map((membership) => ({
      workspaceId: membership.workspaceId,
      workspaceName: membership.workspaceName,
      workspaceSlug: membership.workspaceSlug,
      role: membership.role,
    })),
  });
}