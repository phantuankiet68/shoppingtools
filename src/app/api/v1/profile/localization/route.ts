import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

function error(message: string, status = 400) {
    return NextResponse.json({ success: false, message }, { status });
}

function trimString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
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
            locale: trimString(body.locale),
            timezone: trimString(body.timezone),
        };

        const user = await prisma.user.findUnique({
            where: { id: auth.user.id },
            select: { id: true, email: true, image: true },
        });

        if (!user) {
            return error('User not found.', 404);
        }

        const profile = await prisma.profile.upsert({
            where: {
                userId: user.id,
            },
            update: {
                locale: data.locale,
                timezone: data.timezone,
            },
            create: {
                userId: user.id,
                email: user.email,
                avatar: user.image,
                locale: data.locale,
                timezone: data.timezone,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Localization updated successfully.',
            profile,
        });
    } catch (err) {
        console.error('[PROFILE_LOCALIZATION]', err);

        return error('Internal server error.', 500);
    }
}
