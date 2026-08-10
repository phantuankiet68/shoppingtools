import { NextRequest, NextResponse } from 'next/server';
import { Gender } from '@/generated/prisma';
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

const genderMap: Record<string, Gender> = {
    MALE: Gender.MALE,
    Male: Gender.MALE,

    FEMALE: Gender.FEMALE,
    Female: Gender.FEMALE,

    OTHER: Gender.OTHER,
    Other: Gender.OTHER,

    UNKNOWN: Gender.UNKNOWN,
    Unknown: Gender.UNKNOWN,
};

export async function PATCH(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const body = await request.json();

        let dob: Date | null = null;

        if (body.dob) {
            const date = new Date(body.dob);

            if (!Number.isNaN(date.getTime())) {
                dob = date;
            }
        } else if (body.dobMonth && body.dobDay && body.dobYear) {
            const date = new Date(`${body.dobMonth} ${body.dobDay}, ${body.dobYear}`);

            if (!Number.isNaN(date.getTime())) {
                dob = date;
            }
        }

        const data = {
            firstName: trimString(body.firstName),

            lastName: trimString(body.lastName),

            username: trimString(body.username)?.toLowerCase() ?? null,

            contactEmail: trimString(body.email)?.toLowerCase() ?? null,

            contactPhone: trimString(body.phone),

            gender: body.gender ? (genderMap[body.gender] ?? Gender.UNKNOWN) : Gender.UNKNOWN,

            dob,

            bio: trimString(body.bio),

            avatar: trimString(body.avatar),

            banner: trimString(body.banner),

            locale: trimString(body.locale),

            timezone: trimString(body.timezone),

            address: trimString(body.address),
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

                contactEmail: data.contactEmail,

                contactPhone: data.contactPhone,

                gender: data.gender,

                dob: data.dob,

                bio: data.bio,

                avatar: data.avatar,

                banner: data.banner,

                locale: data.locale,

                timezone: data.timezone,

                address: data.address,
            },

            create: {
                userId: user.id,

                firstName: data.firstName,

                lastName: data.lastName,

                username: data.username,

                contactEmail: data.contactEmail,

                contactPhone: data.contactPhone,

                gender: data.gender,

                dob: data.dob,

                bio: data.bio,

                avatar: data.avatar ?? user.image,

                banner: data.banner,

                locale: data.locale,

                timezone: data.timezone,

                address: data.address,
            },

            include: {
                socialLinks: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'General profile updated successfully.',
            profile: {
                ...profile,

                email: profile.contactEmail,

                phone: profile.contactPhone,

                dobMonth: profile.dob
                    ? profile.dob.toLocaleString('en-US', {
                          month: 'long',
                      })
                    : '',

                dobDay: profile.dob ? profile.dob.getDate() : null,

                dobYear: profile.dob ? profile.dob.getFullYear() : null,

                gender:
                    profile.gender === Gender.MALE
                        ? 'Male'
                        : profile.gender === Gender.FEMALE
                          ? 'Female'
                          : profile.gender === Gender.OTHER
                            ? 'Other'
                            : 'Unknown',
            },
        });
    } catch (err) {
        console.error('[PROFILE_GENERAL]', err);

        return error('Internal server error.', 500);
    }
}
