import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

function success(profile: unknown) {
    return NextResponse.json({
        success: true,
        profile,
    });
}

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

export async function GET(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

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
            include: {
                socialLinks: true,
            },
        });

        return success(profile);
    } catch (err) {
        console.error('[PROFILE_GET]', err);

        return error('Internal server error.', 500);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const body = await request.json();

        const data = {
            firstName: trimString(body.firstName),
            lastName: trimString(body.lastName),
            username: trimString(body.username)?.toLowerCase() ?? null,

            avatar: trimString(body.avatar),
            banner: trimString(body.banner),

            contactEmail: trimString(body.contactEmail)?.toLowerCase() ?? null,
            contactPhone: trimString(body.contactPhone),

            gender: body.gender ?? undefined,

            dob: body.dob ? new Date(body.dob) : null,

            bio: trimString(body.bio),

            address: trimString(body.address),

            locale: trimString(body.locale),
            timezone: trimString(body.timezone),

            socialLinks: Array.isArray(body.socialLinks) ? body.socialLinks : [],
        };

        if (data.username) {
            const existing = await prisma.profile.findFirst({
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

            if (existing) {
                return error('Username already exists.', 409);
            }
        }

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

            update: {
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,

                avatar: data.avatar,
                banner: data.banner,

                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,

                gender: data.gender,

                dob: data.dob,

                bio: data.bio,

                address: data.address,

                locale: data.locale,
                timezone: data.timezone,

                socialLinks: {
                    deleteMany: {},

                    create: data.socialLinks
                        .filter((item: any) => item.type && item.url && item.url.trim().length)
                        .map((item: any) => ({
                            type: item.type,
                            url: item.url.trim(),
                        })),
                },
            },

            create: {
                userId: user.id,

                avatar: data.avatar ?? user.image,

                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,

                banner: data.banner,

                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,

                gender: data.gender,

                dob: data.dob,

                bio: data.bio,

                address: data.address,

                locale: data.locale,
                timezone: data.timezone,

                socialLinks: {
                    create: data.socialLinks
                        .filter((item: any) => item.type && item.url && item.url.trim().length)
                        .map((item: any) => ({
                            type: item.type,
                            url: item.url.trim(),
                        })),
                },
            },

            include: {
                socialLinks: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully.',
            profile,
        });
    } catch (err) {
        console.error('[PROFILE_PATCH]', err);

        return error('Internal server error.', 500);
    }
}
