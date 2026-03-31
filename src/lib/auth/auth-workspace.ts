import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/session";

export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export type SessionMembership = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: WorkspaceRole;
};

export type SessionUser = {
  id: string;
  email: string;
  systemRole: string;
  status: string;
  image: string | null;
  memberships: SessionMembership[];
};

function getRoleRank(role: WorkspaceRole): number {
  switch (role) {
    case "OWNER":
      return 4;
    case "ADMIN":
      return 3;
    case "EDITOR":
      return 2;
    case "VIEWER":
      return 1;
    default:
      return 0;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session")?.value ?? null;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          email: true,
          systemRole: true,
          status: true,
          image: true,
          memberships: {
            select: {
              role: true,
              workspace: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session?.user) return null;
  if (session.user.status !== "ACTIVE") return null;

  await prisma.userSession
    .update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => {});

  return {
    id: session.user.id,
    email: session.user.email,
    systemRole: session.user.systemRole,
    status: session.user.status,
    image: session.user.image ?? null,
    memberships: session.user.memberships.map((membership) => ({
      workspaceId: membership.workspace.id,
      workspaceName: membership.workspace.name,
      workspaceSlug: membership.workspace.slug,
      role: membership.role as WorkspaceRole,
    })),
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function pickCurrentMembership(user: SessionUser, requestedWorkspaceId?: string | null) {
  if (requestedWorkspaceId) {
    return user.memberships.find((item) => item.workspaceId === requestedWorkspaceId) ?? null;
  }

  return user.memberships[0] ?? null;
}

export function hasWorkspaceRole(actualRole: WorkspaceRole, allowedRoles: WorkspaceRole[]): boolean {
  return allowedRoles.some((role) => getRoleRank(actualRole) >= getRoleRank(role));
}

export function assertWorkspaceRole(actualRole: WorkspaceRole, allowedRoles: WorkspaceRole[]): void {
  if (!hasWorkspaceRole(actualRole, allowedRoles)) {
    throw new Error("FORBIDDEN");
  }
}
