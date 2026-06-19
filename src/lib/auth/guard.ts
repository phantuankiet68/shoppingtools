import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'admin_session';

function hashSessionToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

type AuthUser = {
    id: string;
    email: string;
    systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
    status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
};

type AuthResult =
    | {
          ok: true;
          user: AuthUser;
          clearCookie: false;
      }
    | {
          ok: false;
          clearCookie: boolean;
      };

export async function getAuthContextFromRequest(req: NextRequest): Promise<AuthResult> {
    try {
        const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;

        if (!sessionToken) {
            return {
                ok: false,
                clearCookie: false,
            };
        }

        const refreshTokenHash = hashSessionToken(sessionToken);

        const session = await prisma.userSession.findFirst({
            where: {
                refreshTokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
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
            return {
                ok: false,
                clearCookie: true,
            };
        }

        const user = session.user;

        if (user.status !== 'ACTIVE') {
            return {
                ok: false,
                clearCookie: true,
            };
        }

        if (user.systemRole !== 'ADMIN' && user.systemRole !== 'SUPER_ADMIN') {
            return {
                ok: false,
                clearCookie: true,
            };
        }

        await prisma.userSession
            .update({
                where: {
                    id: session.id,
                },
                data: {
                    lastSeenAt: new Date(),
                },
            })
            .catch(() => {});

        return {
            ok: true,
            user: {
                id: user.id,
                email: user.email,
                systemRole: user.systemRole,
                status: user.status,
            },
            clearCookie: false,
        };
    } catch (error) {
        console.error('getAuthContextFromRequest error:', error);

        return {
            ok: false,
            clearCookie: true,
        };
    }
}
