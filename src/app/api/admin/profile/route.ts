import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuthUser } from '@/lib/auth/auth';
import { ProfileStatus } from '@/generated/prisma';

export const runtime = 'nodejs';

const PROFILE_SELECT = {
    id: true,
    userId: true,

    firstName: true,
    lastName: true,
    username: true,

    avatar: true,
    banner: true,

    contactEmail: true,
    contactPhone: true,

    gender: true,
    dob: true,

    bio: true,

    address: true,

    locale: true,
    timezone: true,

    status: true,

    createdAt: true,
    updatedAt: true,

    socialLinks: {
        select: {
            id: true,
            type: true,
            url: true,
        },
    },
} as const;

function parseStatus(value?: string): ProfileStatus {
    switch (value?.toUpperCase()) {
        case 'INACTIVE':
            return ProfileStatus.INACTIVE;

        case 'SUSPENDED':
            return ProfileStatus.SUSPENDED;

        case 'PENDING_VERIFICATION':
            return ProfileStatus.PENDING_VERIFICATION;

        default:
            return ProfileStatus.ACTIVE;
    }
}

export async function GET() {
    try {
        const authUser = await requireAdminAuthUser();

        const profile = await prisma.profile.findUnique({
            where: {
                userId: authUser.id,
            },
            select: PROFILE_SELECT,
        });

        return NextResponse.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authUser = await requireAdminAuthUser();

        const body = await req.json();

        const normalizeString = (value: unknown): string | null => {
            if (typeof value !== 'string') return null;

            const trimmed = value.trim();

            return trimmed.length > 0 ? trimmed : null;
        };

        const firstName = normalizeString(body.firstName);
        const lastName = normalizeString(body.lastName);
        const username = normalizeString(body.username);

        const contactEmail = normalizeString(body.contactEmail);
        const contactPhone = normalizeString(body.contactPhone);

        const avatar = normalizeString(body.avatar);
        const banner = normalizeString(body.banner);

        const bio = normalizeString(body.bio);
        const locale = normalizeString(body.locale);
        const timezone = normalizeString(body.timezone);
        const address = normalizeString(body.address);

        if (username) {
            const existing = await prisma.profile.findFirst({
                where: {
                    username,
                    NOT: {
                        userId: authUser.id,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (existing) {
                return NextResponse.json(
                    {
                        error: 'USERNAME_ALREADY_EXISTS',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        const profileData = {
            firstName,
            lastName,
            username,

            avatar,
            banner,

            contactEmail,
            contactPhone,

            gender: body.gender ?? null,

            dob: body.dob ? new Date(body.dob) : null,

            bio,

            locale,
            timezone,
            address,

            status: parseStatus(body.status),
        };

        const profile = await prisma.profile.upsert({
            where: {
                userId: authUser.id,
            },

            create: {
                userId: authUser.id,
                ...profileData,
            },

            update: profileData,

            select: PROFILE_SELECT,
        });

        return NextResponse.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error('PATCH /api/admin/profile error:', error);

        return NextResponse.json(
            {
                error: 'INTERNAL_SERVER_ERROR',
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE() {
    try {
        const authUser = await requireAdminAuthUser();

        await prisma.profile.deleteMany({
            where: {
                userId: authUser.id,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: 'INTERNAL_SERVER_ERROR',
            },
            {
                status: 500,
            },
        );
    }
}
