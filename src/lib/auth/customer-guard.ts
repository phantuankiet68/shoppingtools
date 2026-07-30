import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { AUTH } from '@/constants/auth';
import { verifyAccessToken } from '@/services/auth/jwt.service';

export type CustomerAuthUser = {
    id: string;
    email: string;
    systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
    status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
};

export type CustomerAuthResult =
    | {
          ok: true;
          user: CustomerAuthUser;
          clearCookie: false;
      }
    | {
          ok: false;
          clearCookie: boolean;
      };

export async function getCustomerContextFromRequest(
    request: NextRequest,
): Promise<CustomerAuthResult> {
    try {
        /**
         * Read Access Token
         */
        const accessToken = request.cookies.get(AUTH.ACCESS_COOKIE_NAME)?.value;

        if (!accessToken) {
            return {
                ok: false,
                clearCookie: false,
            };
        }

        /**
         * Verify JWT
         */
        const payload = await verifyAccessToken(accessToken);

        /**
         * Find Session
         */
        const session = await prisma.userSession.findUnique({
            where: {
                id: payload.sid,
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

        if (!session || !session.user) {
            return {
                ok: false,
                clearCookie: true,
            };
        }

        if (session.revokedAt) {
            return {
                ok: false,
                clearCookie: true,
            };
        }

        if (session.expiresAt <= new Date()) {
            return {
                ok: false,
                clearCookie: true,
            };
        }

        if (session.user.status !== 'ACTIVE') {
            return {
                ok: false,
                clearCookie: true,
            };
        }

        await prisma.userSession.update({
            where: {
                id: session.id,
            },
            data: {
                lastSeenAt: new Date(),
            },
        });

        return {
            ok: true,
            user: {
                id: session.user.id,
                email: session.user.email,
                systemRole: session.user.systemRole,
                status: session.user.status,
            },
            clearCookie: false,
        };
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            clearCookie: true,
        };
    }
}
