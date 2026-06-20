import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminAuthUser();

        const { id } = await ctx.params;

        const current = await prisma.product.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                isVisible: true,
            },
        });

        if (!current) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const updated = await prisma.product.update({
            where: {
                id,
            },
            data: {
                isVisible: !current.isVisible,
            },
            select: {
                id: true,
                isVisible: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            item: updated,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: 'Unauthorized',
            },
            {
                status: 401,
            },
        );
    }
}
