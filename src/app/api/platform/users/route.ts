import { Prisma, SystemRole, UserStatus } from '@/generated/prisma';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
    try {
        const auth = await getUserFromRequest();

        if (!auth || !hasRole(auth.systemRole, 'SUPER_ADMIN')) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Forbidden',
                },
                {
                    status: 403,
                },
            );
        }

        const { searchParams } = new URL(req.url);

        const page = Math.max(Number(searchParams.get('page') ?? DEFAULT_PAGE), 1);

        const limit = Math.min(
            Math.max(Number(searchParams.get('limit') ?? DEFAULT_LIMIT), 1),
            MAX_LIMIT,
        );

        const search = searchParams.get('search')?.trim() ?? '';

        const role = searchParams.get('role');

        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};

        if (role && role !== 'ALL' && Object.values(SystemRole).includes(role as SystemRole)) {
            where.systemRole = role as SystemRole;
        }

        if (status && Object.values(UserStatus).includes(status as UserStatus)) {
            where.status = status as UserStatus;
        }

        if (search.length > 0) {
            where.OR = [
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    profile: {
                        firstName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    profile: {
                        lastName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    profile: {
                        username: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
            ];
        }

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    email: true,
                    image: true,
                    systemRole: true,
                    status: true,
                    lastLoginAt: true,
                    createdAt: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            username: true,
                            avatar: true,
                            contactEmail: true,
                            contactPhone: true,
                            status: true,
                        },
                    },
                },
            }),

            prisma.user.count({
                where,
            }),
        ]);

        const data = users.map((user) => {
            const fullName = [user.profile?.firstName, user.profile?.lastName]
                .filter(Boolean)
                .join(' ');

            return {
                id: user.id,
                name: fullName || user.profile?.username || user.email,
                email: user.email,
                avatar: user.profile?.avatar ?? user.image,
                role: user.systemRole,
                status: user.status,
                profileStatus: user.profile?.status ?? null,
                contactEmail: user.profile?.contactEmail ?? null,
                contactPhone: user.profile?.contactPhone ?? null,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            };
        });

        return NextResponse.json({
            ok: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrevious: page > 1,
            },
        });
    } catch (error) {
        console.error('GET_USERS_ERROR', error);

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    ok: false,
                    message: error.message,
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json(
            {
                ok: false,
                message: 'Internal server error',
            },
            {
                status: 500,
            },
        );
    }
}
