import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const siteId = searchParams.get('siteId');

        if (!userId || !siteId) {
            return NextResponse.json({ error: 'Missing userId or siteId' }, { status: 400 });
        }

        const [
            totalSites,
            totalPages,
            totalMenus,
            totalCategories,
            totalBrands,
            totalProducts,
            totalUsers,
        ] = await Promise.all([
            prisma.site.count({
                where: {
                    ownerUserId: userId,
                    deletedAt: null,
                },
            }),

            prisma.page.count({
                where: {
                    siteId,
                },
            }),

            prisma.menuItem.count({
                where: {
                    siteId,
                },
            }),

            prisma.category.count({
                where: {
                    siteId,
                },
            }),

            prisma.brand.count({
                where: {
                    siteId,
                },
            }),

            prisma.product.count({
                where: {
                    siteId,
                    deletedAt: null,
                },
            }),

            prisma.user.count({
                where: {
                    siteId,
                },
            }),
        ]);

        return NextResponse.json({
            totalSites,
            totalPages,
            totalMenus,
            totalCategories,
            totalBrands,
            totalProducts,
            totalUsers,
        });
    } catch (error) {
        console.error('STATS API ERROR:', error);

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
