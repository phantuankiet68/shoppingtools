import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';
import { UserStatus } from '@/generated/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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

        if (id === auth.userId) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'You cannot change your own account status.',
                },
                {
                    status: 400,
                },
            );
        }

        const body = await req.json();

        const status = body.status as UserStatus;

        if (status !== UserStatus.ACTIVE && status !== UserStatus.SUSPENDED) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Invalid status.',
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
                systemRole: true,
                status: true,
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

        if (user.systemRole === 'SUPER_ADMIN') {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Cannot change Super Admin status.',
                },
                {
                    status: 403,
                },
            );
        }

        if (user.status === status) {
            return NextResponse.json({
                ok: true,
                message: 'Status is already up to date.',
                data: {
                    id: user.id,
                    status: user.status,
                },
            });
        }

        const updated = await prisma.user.update({
            where: {
                id,
            },
            data: {
                status,
            },
            select: {
                id: true,
                status: true,
            },
        });

        return NextResponse.json({
            ok: true,
            message: 'User status updated successfully.',
            data: updated,
        });
    } catch (error) {
        console.error('UPDATE_USER_STATUS_ERROR', error);

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
