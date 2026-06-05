import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Ctx = {
    params: Promise<{
        id: string;
    }>;
};

const USER_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'] as const);

const USER_STATUS = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] as const);

function cleanStr(v: unknown): string | null {
    if (typeof v !== 'string') return null;
    const s = v.trim();
    return s.length ? s : null;
}

export async function GET(_req: Request, ctx: Ctx) {
    try {
        await requireAdminAuthUser();

        const { id } = await ctx.params;

        const item = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                image: true,
                systemRole: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });

        if (!item) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            item: {
                ...item,
                createdAt: item.createdAt.toISOString(),
                updatedAt: item.updatedAt.toISOString(),
                lastLoginAt: item.lastLoginAt ? item.lastLoginAt.toISOString() : null,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function PATCH(req: Request, ctx: Ctx) {
    try {
        await requireAdminAuthUser();

        const { id } = await ctx.params;

        const body = await req.json();

        const systemRole = body?.systemRole;
        const status = body?.status;
        const image = body?.image === undefined ? undefined : cleanStr(body.image);

        if (systemRole && !USER_ROLES.has(systemRole)) {
            return NextResponse.json({ error: 'Invalid system role' }, { status: 400 });
        }

        if (status && !USER_STATUS.has(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const data: Record<string, unknown> = {};

        if (systemRole !== undefined) {
            data.systemRole = systemRole;
        }

        if (status !== undefined) {
            data.status = status;
        }

        if (image !== undefined) {
            data.image = image;
        }

        const updated = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                image: true,
                systemRole: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            ok: true,
            item: updated,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Update failed';

        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(_req: Request, ctx: Ctx) {
    try {
        await requireAdminAuthUser();

        const { id } = await ctx.params;

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({
            ok: true,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Delete failed';

        return NextResponse.json({ error: message }, { status: 400 });
    }
}
