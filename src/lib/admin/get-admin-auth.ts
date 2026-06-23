import 'server-only';

import type { AdminAuthData } from '@/components/admin/providers/AdminAuthProvider';

import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function getAdminAuth(): Promise<AdminAuthData | null> {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const workspaceId = session.currentWorkspace?.id;

    const sites = workspaceId
        ? await prisma.site.findMany({
              where: {
                  workspaceId,
                  deletedAt: null,
              },
              select: {
                  id: true,
                  name: true,
                  domain: true,
                  type: true,
                  category: true,
                  logoUrl: true,
                  faviconUrl: true,
                  contactEmail: true,
                  contactPhone: true,
                  seoTitle: true,
                  seoDescription: true,
              },
              orderBy: {
                  createdAt: 'desc',
              },
          })
        : [];

    const currentSite = sites[0] ?? null;

    return {
        user: {
            id: session.user.id,
            name: session.user.name ?? '',
            email: session.user.email,
            image: session.user.image,
            systemRole: session.user.systemRole,
            roleLabel: session.user.roleLabel,
        },

        currentWorkspace: session.currentWorkspace,

        memberships: session.memberships ?? [],

        sites,

        currentSite,
    };
}
