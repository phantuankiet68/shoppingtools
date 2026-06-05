import crypto from 'crypto';
import { cookies } from 'next/headers';

import { prisma } from '@/lib/prisma';

import { SystemRole, UserStatus } from '@/generated/prisma';

function hashToken(rawToken: string) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export type AdminAuthUser = {
    id: string;
    email: string;
    systemRole: SystemRole;
    status: UserStatus;
};

export async function getAdminAuthUser(): Promise<AdminAuthUser | null> {
    try {
        const cookieStore = await cookies();

        const rawToken = cookieStore.get('admin_session')?.value;

        if (!rawToken) {
            return null;
        }

        const tokenHash = hashToken(rawToken);

        const session = await prisma.userSession.findFirst({
            where: {
                refreshTokenHash: tokenHash,

                revokedAt: null,

                expiresAt: {
                    gt: new Date(),
                },

                user: {
                    is: {
                        systemRole: {
                            in: [SystemRole.ADMIN, SystemRole.SUPER_ADMIN],
                        },

                        status: UserStatus.ACTIVE,
                    },
                },
            },

            select: {
                id: true,

                user: {
                    select: {
                        id: true,
                        email: true,
                        systemRole: true,
                        status: true,
                    },
                },
            },
        });

        if (!session?.user) {
            return null;
        }

        await prisma.userSession.update({
            where: {
                id: session.id,
            },

            data: {
                lastSeenAt: new Date(),
            },
        });

        return session.user;
    } catch (error) {
        console.error('[AUTH_ERROR]', error);

        return null;
    }
}

export async function requireAdminAuthUser(): Promise<AdminAuthUser> {
    const user = await getAdminAuthUser();

    if (!user) {
        throw new Error('UNAUTHORIZED');
    }

    return user;
}

export async function getAdminAuthUserId(): Promise<string | null> {
    const user = await getAdminAuthUser();

    return user?.id ?? null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
    const user = await getAdminAuthUser();

    return !!user;
}
