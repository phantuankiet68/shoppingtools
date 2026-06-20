import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest();

        if (
            !user ||
            !(hasRole(user.systemRole, 'SUPER_ADMIN') || hasRole(user.systemRole, 'ADMIN'))
        ) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const sites = await prisma.site.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                domain: true,
                status: true,
                isPublic: true,
            },
            orderBy: [{ name: 'asc' }, { domain: 'asc' }],
        });

        return NextResponse.json({
            ok: true,
            data: sites,
        });
    } catch (err: unknown) {
        console.error('GET_SITE_OPTIONS_ERROR', err);

        if (err instanceof Error) {
            return NextResponse.json({ message: err.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
