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

        const sites = await prisma.site.findMany({
            where: {
                ownerUserId: id,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                domain: true,
                type: true,
                category: true,
                logoUrl: true,
                faviconUrl: true,
                contactEmail: true,
                contactPhone: true,
                status: true,
                isPublic: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            ok: true,
            data: sites,
        });
    } catch (error) {
        console.error('GET_USER_SITES_ERROR', error);

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
