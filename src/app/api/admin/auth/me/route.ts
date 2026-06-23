import { getSessionUser, pickCurrentMembership } from '@/lib/auth/auth-workspace';
import { prisma } from '@/lib/prisma';

function toSystemRoleLabel(role: string) {
    switch (role) {
        case 'SUPER_ADMIN':
            return 'Super Admin';
        case 'ADMIN':
            return 'Admin';
        case 'CUSTOMER':
            return 'Customer';
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
        const requestedWorkspaceId = searchParams.get('workspaceId');

        const currentMembership = pickCurrentMembership(user, requestedWorkspaceId);

        const displayName = user.email.includes('@') ? user.email.split('@')[0] : user.email;

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
                    maxBrands: true,
                    maxProducts: true,
                    maxUsers: true,
                    maxTemplates: true,
                    maxCustomDomains: true,

                    allowSeoBasic: true,
                    allowSeoPremium: true,

                    allowAnalytics: true,
                    allowAdvancedAnalytics: true,
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
        console.error('Auth API error:', error);

        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
