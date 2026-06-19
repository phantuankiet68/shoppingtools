import { SystemRole, type AccessTier } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';

function hashSessionToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

function getRoleLabel(role: SystemRole): string {
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

export type AdminSessionUser = {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    systemRole: SystemRole;
    status: 'ACTIVE' | 'SUSPENDED';
    emailVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    roleLabel: string;
    profile: unknown | null;
};

export type AdminCurrentWorkspace = {
    id: string;
    name: string;
    slug: string;
    role: string;
    tier: AccessTier;

    accessPolicy: {
        maxSites: number;
        maxPages: number;
        maxMenus: number;
        maxCategories: number;
        maxBrands: number;
        maxProducts: number;
        maxUsers: number;
        maxTemplates: number;
        maxCustomDomains: number;

        allowSeoBasic: boolean;
        allowSeoPremium: boolean;

        allowAnalytics: boolean;
        allowAdvancedAnalytics: boolean;

        allowBlog: boolean;
        allowEcommerce: boolean;
        allowBooking: boolean;
        allowNews: boolean;
        allowLms: boolean;
        allowDirectory: boolean;
    } | null;
} | null;

export type AdminMembership = {
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
    role: string;
    tier: AccessTier;

    accessPolicy: {
        maxSites: number;
        maxPages: number;
        maxMenus: number;
        maxCategories: number;
        maxBrands: number;
        maxProducts: number;
        maxUsers: number;
        maxTemplates: number;
        maxCustomDomains: number;

        allowSeoBasic: boolean;
        allowSeoPremium: boolean;

        allowAnalytics: boolean;
        allowAdvancedAnalytics: boolean;

        allowBlog: boolean;
        allowEcommerce: boolean;
        allowBooking: boolean;
        allowNews: boolean;
        allowLms: boolean;
        allowDirectory: boolean;
    } | null;
};

export type AdminSession = {
    user: AdminSessionUser;
    currentWorkspace: AdminCurrentWorkspace;
    memberships: AdminMembership[];
} | null;

export async function getCurrentSession(): Promise<AdminSession> {
    try {
        const cookieStore = await cookies();

        const rawSessionToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;

        if (!rawSessionToken) {
            return null;
        }

        const refreshTokenHash = hashSessionToken(rawSessionToken);

        const now = new Date();

        const dbSession = await prisma.userSession.findFirst({
            where: {
                refreshTokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: now,
                },
            },
            select: {
                id: true,
                userId: true,
            },
        });

        if (!dbSession?.userId) {
            return null;
        }

        await prisma.userSession
            .update({
                where: {
                    id: dbSession.id,
                },
                data: {
                    lastSeenAt: new Date(),
                },
            })
            .catch(() => {});

        const user = await prisma.user.findUnique({
            where: {
                id: dbSession.userId,
            },
            select: {
                id: true,
                email: true,
                image: true,
                systemRole: true,
                status: true,
                emailVerifiedAt: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                profile: true,

                memberships: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        role: true,
                        tier: true,

                        workspace: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,

                                accessPolicy: {
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

                                        allowBlog: true,
                                        allowEcommerce: true,
                                        allowBooking: true,
                                        allowNews: true,
                                        allowLms: true,
                                        allowDirectory: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (
            !user ||
            user.status !== 'ACTIVE' ||
            (user.systemRole !== 'ADMIN' && user.systemRole !== 'SUPER_ADMIN')
        ) {
            return null;
        }

        const memberships: AdminMembership[] = user.memberships.map((membership) => ({
            workspaceId: membership.workspace.id,
            workspaceName: membership.workspace.name,
            workspaceSlug: membership.workspace.slug,
            role: membership.role,
            tier: membership.tier,

            accessPolicy: membership.workspace.accessPolicy ?? null,
        }));

        const firstMembership = memberships[0];

        const currentWorkspace: AdminCurrentWorkspace = firstMembership
            ? {
                  id: firstMembership.workspaceId,
                  name: firstMembership.workspaceName,
                  slug: firstMembership.workspaceSlug,
                  role: firstMembership.role,
                  tier: firstMembership.tier,

                  accessPolicy: firstMembership.accessPolicy,
              }
            : null;

        return {
            user: {
                id: user.id,

                name:
                    user.profile && typeof user.profile === 'object' && 'name' in user.profile
                        ? ((
                              user.profile as {
                                  name?: string | null;
                              }
                          ).name ?? null)
                        : null,

                email: user.email,
                image: user.image ?? null,
                systemRole: user.systemRole,
                status: user.status,
                emailVerifiedAt: user.emailVerifiedAt ?? null,
                lastLoginAt: user.lastLoginAt ?? null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                roleLabel: getRoleLabel(user.systemRole),
                profile: user.profile ?? null,
            },

            currentWorkspace,
            memberships,
        };
    } catch (error) {
        console.error('getCurrentSession error:', error);

        return null;
    }
}
