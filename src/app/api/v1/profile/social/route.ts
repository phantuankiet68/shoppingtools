import { NextRequest, NextResponse } from 'next/server';

import { SocialType } from '@/generated/prisma';

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
            return error('Unauthorized.', 401);
        }

        const body = await request.json();

        const socials = [
            {
                type: SocialType.WEBSITE,
                url: trimString(body.website),
            },
            {
                type: SocialType.FACEBOOK,
                url: trimString(body.facebook),
            },
            {
                type: SocialType.INSTAGRAM,
                url: trimString(body.instagram),
            },
            {
                type: SocialType.TIKTOK,
                url: trimString(body.tiktok),
            },
            {
                type: SocialType.YOUTUBE,
                url: trimString(body.youtube),
            },
            {
                type: SocialType.LINKEDIN,
                url: trimString(body.linkedin),
            },
        ].filter((item) => item.url);

        const user = await prisma.user.findUnique({
            where: {
                id: auth.user.id,
            },
            select: {
                id: true,
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

            update: {},

            create: {
                userId: user.id,
                avatar: user.image,
            },

            select: {
                id: true,
            },
        });

        await prisma.socialLink.deleteMany({
            where: {
                profileId: profile.id,
            },
        });

        if (socials.length > 0) {
            await prisma.socialLink.createMany({
                data: socials.map((item) => ({
                    profileId: profile.id,
                    type: item.type,
                    url: item.url!,
                })),
            });
        }

        const result = await prisma.profile.findUnique({
            where: {
                id: profile.id,
            },
            include: {
                socialLinks: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Social links updated successfully.',
            profile: result,
        });
    } catch (err) {
        console.error('[PROFILE_SOCIAL]', err);

        return error('Internal server error.', 500);
    }
}
