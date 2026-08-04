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
            website: trimString(body.website),
            facebook: trimString(body.facebook),
            instagram: trimString(body.instagram),
            tiktok: trimString(body.tiktok),
            youtube: trimString(body.youtube),
            linkedin: trimString(body.linkedin),
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
                website: data.website,
                facebook: data.facebook,
                instagram: data.instagram,
                tiktok: data.tiktok,
                youtube: data.youtube,
                linkedin: data.linkedin,
            },
            create: {
                userId: user.id,
                email: user.email,
                avatar: user.image,
                website: data.website,
                facebook: data.facebook,
                instagram: data.instagram,
                tiktok: data.tiktok,
                youtube: data.youtube,
                linkedin: data.linkedin,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Social links updated successfully.',
            profile,
        });
    } catch (err) {
        console.error('[PROFILE_SOCIAL]', err);

        return error('Internal server error.', 500);
    }
}
