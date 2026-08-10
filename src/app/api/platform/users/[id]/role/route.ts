import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';
import { SystemRole } from '@/generated/prisma';

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
                    message: 'You cannot change your own role.',
                },
                {
                    status: 400,
                },
            );
        }

        const body = await req.json();

        const role = body.role as SystemRole;

        if (role !== SystemRole.ADMIN && role !== SystemRole.CUSTOMER) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Invalid role.',
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

        if (user.systemRole === SystemRole.SUPER_ADMIN) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Cannot modify a Super Admin.',
                },
                {
                    status: 403,
                },
            );
        }

        const updated = await prisma.user.update({
            where: {
                id,
            },
            data: {
                systemRole: role,
            },
            select: {
                id: true,
                systemRole: true,
            },
        });

        return NextResponse.json({
            ok: true,
            message: 'Role updated successfully.',
            data: updated,
        });
    } catch (error) {
        console.error('UPDATE_USER_ROLE_ERROR', error);

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
