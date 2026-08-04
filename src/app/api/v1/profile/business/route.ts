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
            shopName: trimString(body.shopName),

            shopSlug: trimString(body.shopSlug)?.toLowerCase() ?? null,

            shopDescription: trimString(body.shopDescription),

            slogan: trimString(body.slogan),

            companyName: trimString(body.companyName),

            taxCode: trimString(body.taxCode),

            businessLicense: trimString(body.businessLicense),
        };
        if (data.shopSlug) {
            const exists = await prisma.profile.findFirst({
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

            if (exists) {
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

            update: {
                shopName: data.shopName,

                shopSlug: data.shopSlug,

                shopDescription: data.shopDescription,

                slogan: data.slogan,

                companyName: data.companyName,

                taxCode: data.taxCode,

                businessLicense: data.businessLicense,
            },

            create: {
                userId: user.id,

                email: user.email,

                avatar: user.image,

                shopName: data.shopName,

                shopSlug: data.shopSlug,

                shopDescription: data.shopDescription,

                slogan: data.slogan,

                companyName: data.companyName,

                taxCode: data.taxCode,

                businessLicense: data.businessLicense,
            },
        });

        return NextResponse.json({
            success: true,

            message: 'Business information updated successfully.',

            profile,
        });
    } catch (err) {
        console.error('[PROFILE_BUSINESS]', err);

        return error('Internal server error.', 500);
    }
}
