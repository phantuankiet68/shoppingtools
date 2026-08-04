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

export async function GET(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized', 401);
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
            return error('User not found', 404);
        }

        const profile = await prisma.profile.upsert({
            where: {
                userId: user.id,
            },
            update: {},
            create: {
                userId: user.id,
                email: user.email,
                avatar: user.image,
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return success(profile);
    } catch (err) {
        console.error('[PROFILE_GET]', err);

        return error('Internal server error', 500);
    }
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

            avatar: trimString(body.avatar),
            banner: trimString(body.banner),

            email: trimString(body.email)?.toLowerCase() ?? null,
            phone: trimString(body.phone),

            gender: trimString(body.gender),

            dobMonth: trimString(body.dobMonth),
            dobDay: typeof body.dobDay === 'number' ? body.dobDay : null,
            dobYear: typeof body.dobYear === 'number' ? body.dobYear : null,

            shopName: trimString(body.shopName),
            shopSlug: trimString(body.shopSlug)?.toLowerCase() ?? null,
            shopDescription: trimString(body.shopDescription),

            slogan: trimString(body.slogan),

            bio: trimString(body.bio),

            address: trimString(body.address),
            ward: trimString(body.ward),
            district: trimString(body.district),
            city: trimString(body.city),
            country: trimString(body.country),

            logo: trimString(body.logo),
            cover: trimString(body.cover),

            website: trimString(body.website),
            facebook: trimString(body.facebook),
            instagram: trimString(body.instagram),
            tiktok: trimString(body.tiktok),
            youtube: trimString(body.youtube),
            linkedin: trimString(body.linkedin),

            companyName: trimString(body.companyName),
            taxCode: trimString(body.taxCode),
            businessLicense: trimString(body.businessLicense),

            locale: trimString(body.locale),
            timezone: trimString(body.timezone),
        };
        if (data.username) {
            const existingUsername = await prisma.profile.findFirst({
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

            if (existingUsername) {
                return error('Username already exists.', 409);
            }
        }

        if (data.shopSlug) {
            const existingShopSlug = await prisma.profile.findFirst({
                where: {
                    shopSlug: data.shopSlug,
                    NOT: {
                        userId: auth.user.id,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (existingShopSlug) {
                return error('Shop slug already exists.', 409);
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
            update: data,
            create: {
                userId: user.id,

                email: data.email ?? user.email,

                avatar: data.avatar ?? user.image,

                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,

                banner: data.banner,

                phone: data.phone,

                gender: data.gender,

                dobMonth: data.dobMonth,
                dobDay: data.dobDay,
                dobYear: data.dobYear,

                shopName: data.shopName,
                shopSlug: data.shopSlug,
                shopDescription: data.shopDescription,

                slogan: data.slogan,

                bio: data.bio,

                address: data.address,
                ward: data.ward,
                district: data.district,
                city: data.city,
                country: data.country,

                logo: data.logo,
                cover: data.cover,

                website: data.website,
                facebook: data.facebook,
                instagram: data.instagram,
                tiktok: data.tiktok,
                youtube: data.youtube,
                linkedin: data.linkedin,

                companyName: data.companyName,
                taxCode: data.taxCode,
                businessLicense: data.businessLicense,

                locale: data.locale,
                timezone: data.timezone,
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
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
