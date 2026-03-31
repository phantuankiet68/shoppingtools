import { getSessionUser, pickCurrentMembership } from "@/lib/auth/auth-workspace";

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
    memberships: user.memberships.map((membership) => ({
      workspaceId: membership.workspaceId,
      workspaceName: membership.workspaceName,
      workspaceSlug: membership.workspaceSlug,
      role: membership.role,
    })),
  });
}
