import { getSessionUser, pickCurrentMembership } from "@/lib/auth/auth-workspace";
import { prisma } from "@/lib/prisma";

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
  try {
    const user = await getSessionUser();

    if (!user) {
      return Response.json({ user: null }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedWorkspaceId = searchParams.get("workspaceId");

    const currentMembership = pickCurrentMembership(user, requestedWorkspaceId);

    const displayName = user.email.includes("@") ? user.email.split("@")[0] : user.email;

    // =========================
    // ✅ 1. GET SITES
    // =========================
    let sites: any[] = [];

    if (currentMembership?.workspaceId) {
      sites = await prisma.site.findMany({
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

    const currentSite = sites.length > 0 ? sites[0] : null;

    // =========================
    // ✅ 2. GET WORKSPACE POLICY
    // =========================
    let accessPolicy = null;

    if (currentMembership?.workspaceId) {
      accessPolicy = await prisma.workspaceAccessPolicy.findFirst({
        where: {
          workspaceId: currentMembership.workspaceId,
        },
        select: {
          maxSites: true,
          maxPages: true,
          maxMenus: true,
          maxCategories: true,
          maxProducts: true,
          maxCustomDomains: true,
          allowBlog: true,
          allowEcommerce: true,
          allowBooking: true,
          allowNews: true,
          allowLms: true,
          allowDirectory: true,
        },
      });
    }

    // =========================
    // ✅ RESPONSE
    // =========================
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
            tier: currentMembership.tier,

            // 🔥 NEW: policy ở đây
            accessPolicy,
          }
        : null,

      sites,
      currentSite,

      memberships: user.memberships.map((membership) => ({
        workspaceId: membership.workspaceId,
        workspaceName: membership.workspaceName,
        workspaceSlug: membership.workspaceSlug,
        role: membership.role,
        tier: membership.tier,
      })),
    });
  } catch (error) {
    console.error("Auth API error:", error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
