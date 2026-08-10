import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
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

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                },
            );
        }

        const memberships = await prisma.workspaceMember.findMany({
            where: {
                userId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                role: true,

                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        createdAt: true,

                        owner: {
                            select: {
                                profile: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },

                        _count: {
                            select: {
                                members: true,
                                sites: true,
                            },
                        },
                    },
                },
            },
        });

        const data = memberships.map((item) => {
            const owner =
                [item.workspace.owner.profile?.firstName, item.workspace.owner.profile?.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Unknown';

            return {
                id: item.workspace.id,

                name: item.workspace.name,

                slug: item.workspace.slug,

                role: item.role,

                owner,

                members: item.workspace._count.members,

                sites: item.workspace._count.sites,

                createdAt: item.workspace.createdAt,

                plan: 'Free',

                storageUsed: 0,

                storageTotal: 5,

                lastActivity: item.workspace.createdAt,

                icon: 'bi-globe2',

                accent: '#2563eb',
            };
        });

        return NextResponse.json({
            ok: true,
            data,
        });
    } catch (error) {
        console.error('GET_USER_WORKSPACES_ERROR', error);

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
                message: 'Internal server error.',
            },
            {
                status: 500,
            },
        );
    }
}
