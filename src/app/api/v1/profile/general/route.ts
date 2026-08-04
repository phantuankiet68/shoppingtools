import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        {
            status,
        },
    );
}

function trimString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const result = value.trim();

    return result.length ? result : null;
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized', 401);
        }

        const body = await request.json();

        const data = {
            firstName: trimString(body.firstName),

            lastName: trimString(body.lastName),

            username: trimString(body.username)?.toLowerCase() ?? null,

            email: trimString(body.email)?.toLowerCase() ?? null,

            phone: trimString(body.phone),

            gender: trimString(body.gender),

            dobMonth: trimString(body.dobMonth),

            dobDay: typeof body.dobDay === 'number' ? body.dobDay : null,

            dobYear: typeof body.dobYear === 'number' ? body.dobYear : null,

            bio: trimString(body.bio),
        };
        if (data.username) {
            const exists = await prisma.profile.findFirst({
                where: {
                    username: data.username,

                    NOT: {
                        userId: auth.user.id,
                    },
                },

                select: {
                    id: true,
                },
            });

            if (exists) {
                return error('Username already exists.', 409);
            }
        }

        const user = await prisma.user.findUnique({
            where: {
                id: auth.user.id,
            },

            select: {
                id: true,
                email: true,
                image: true,
            },
        });

        if (!user) {
            return error('User not found.', 404);
        }
        const profile = await prisma.profile.upsert({
            where: {
                userId: user.id,
            },

            update: {
                firstName: data.firstName,

                lastName: data.lastName,

                username: data.username,

                email: data.email,

                phone: data.phone,

                gender: data.gender,

                dobMonth: data.dobMonth,

                dobDay: data.dobDay,

                dobYear: data.dobYear,

                bio: data.bio,
            },

            create: {
                userId: user.id,

                email: data.email ?? user.email,

                avatar: user.image,

                firstName: data.firstName,

                lastName: data.lastName,

                username: data.username,

                phone: data.phone,

                gender: data.gender,

                dobMonth: data.dobMonth,

                dobDay: data.dobDay,

                dobYear: data.dobYear,

                bio: data.bio,
            },
        });

        return NextResponse.json({
            success: true,

            message: 'General profile updated successfully.',

            profile,
        });
    } catch (err) {
        console.error('[PROFILE_GENERAL]', err);

        return error('Internal server error.', 500);
    }
}
