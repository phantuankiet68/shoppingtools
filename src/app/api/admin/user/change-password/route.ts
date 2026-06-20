import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function hashToken(rawToken: string) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function validatePassword(password: string) {
    const atLeast8 = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);

    return {
        atLeast8,
        upper,
        lower,
        number,
        special,
        all: atLeast8 && upper && lower && number && special,
    };
}

function bad(message: string, status = 400) {
    return NextResponse.json(
        {
            error: message,
        },
        {
            status,
        },
    );
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();

        const rawToken = cookieStore.get('admin_session')?.value;

        if (!rawToken) {
            return bad('Unauthorized', 401);
        }

        const refreshTokenHash = hashToken(rawToken);

        const session = await prisma.userSession.findFirst({
            where: {
                refreshTokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            select: {
                id: true,
                userId: true,

                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true,
                        passwordHash: true,
                    },
                },
            },
        });

        if (!session?.user || session.user.status !== 'ACTIVE') {
            return bad('Unauthorized', 401);
        }

        const body = await req.json().catch(() => ({}));

        const confirmEmail = String(body.confirmEmail ?? '')
            .trim()
            .toLowerCase();

        const currentPassword = String(body.currentPassword ?? '');

        const newPassword = String(body.newPassword ?? '');

        const signOutAll = Boolean(body.signOutAll);

        if (!confirmEmail) {
            return bad('confirmEmail is required');
        }

        if (confirmEmail !== session.user.email.toLowerCase()) {
            return bad('Email confirmation does not match your account email');
        }

        if (!currentPassword) {
            return bad('Current password is required');
        }

        const passwordMatched = await bcrypt.compare(currentPassword, session.user.passwordHash);

        if (!passwordMatched) {
            return bad('Current password is incorrect', 403);
        }

        const rules = validatePassword(newPassword);

        if (!rules.all) {
            return NextResponse.json(
                {
                    error: 'Password policy not satisfied',
                    rules,
                },
                {
                    status: 400,
                },
            );
        }

        const nextHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                passwordHash: nextHash,
            },
        });

        if (signOutAll) {
            await prisma.userSession.updateMany({
                where: {
                    userId: session.user.id,
                    revokedAt: null,
                    id: {
                        not: session.id,
                    },
                },
                data: {
                    revokedAt: new Date(),
                },
            });
        }

        await prisma.userSession.update({
            where: {
                id: session.id,
            },
            data: {
                lastSeenAt: new Date(),
            },
        });

        return NextResponse.json({
            ok: true,
        });
    } catch (error) {
        console.error('CHANGE_PASSWORD_ERROR', error);

        return bad('Server error', 500);
    }
}
