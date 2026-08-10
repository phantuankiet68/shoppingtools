import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User ID is required.',
                },
                {
                    status: 400,
                },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                email: true,
                image: true,
                systemRole: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true,
                lastLoginAt: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                        avatar: true,
                        contactPhone: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                },
            );
        }
        const fullName =
            [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ').trim() ||
            user.email;

        const avatar = user.profile?.avatar ?? user.image ?? null;

        const profile = user.profile
            ? {
                  firstName: user.profile.firstName,
                  lastName: user.profile.lastName,
                  username: user.profile.username,
                  avatar: avatar,
                  phone: user.profile.contactPhone,
                  city: null,
                  country: null,
                  shopName: null,
              }
            : null;

        const responseData = {
            id: user.id,
            name: fullName,
            email: user.email,
            image: avatar,
            role: user.systemRole,
            status: user.status,
            verified: user.emailVerifiedAt !== null,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            profile,
        };

        return NextResponse.json(
            {
                success: true,
                data: responseData,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[GET_PLATFORM_USER_PROFILE_ERROR]', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to load user profile.',
            },
            {
                status: 500,
            },
        );
    }
}
