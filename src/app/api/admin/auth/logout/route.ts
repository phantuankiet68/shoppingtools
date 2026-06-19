import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/session';

const SESSION_COOKIE = 'admin_session';

function expireCookie(res: NextResponse, name: string) {
    res.cookies.set(name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
}

export async function POST(req: NextRequest) {
    const rawSession = req.cookies.get(SESSION_COOKIE)?.value ?? null;

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        null;

    const userAgent = req.headers.get('user-agent') ?? null;

    if (rawSession) {
        const tokenHash = hashToken(rawSession);

        const session = await prisma.userSession.findFirst({
            where: {
                refreshTokenHash: tokenHash,
                revokedAt: null,
            },
            select: {
                id: true,
                userId: true,
            },
        });

        if (session) {
            await prisma.$transaction([
                prisma.userSession.update({
                    where: {
                        id: session.id,
                    },
                    data: {
                        revokedAt: new Date(),
                    },
                }),

                prisma.auditLog.create({
                    data: {
                        actorUserId: session.userId,

                        action: 'ADMIN_LOGOUT',

                        ipAddress: ip,

                        userAgent,

                        metaJson: {
                            source: 'manual_logout',
                        },
                    },
                }),
            ]);
        }
    }

    const res = NextResponse.json({
        ok: true,
    });

    expireCookie(res, SESSION_COOKIE);

    return res;
}
