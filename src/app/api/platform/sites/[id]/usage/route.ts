import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;

        const site = await prisma.site.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                subscription: {
                    include: {
                        plan: true,
                    },
                },
                _count: {
                    select: {
                        pages: true,
                        products: true,
                        customers: true,
                        orders: true,
                        users: true,
                    },
                },
            },
        });

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Site not found.',
                },
                {
                    status: 404,
                },
            );
        }

        const plan = site.subscription?.plan;

        return NextResponse.json(
            {
                success: true,
                data: {
                    pages: {
                        used: site._count.pages,
                        limit: plan?.maxPages ?? null,
                    },

                    products: {
                        used: site._count.products,
                        limit: plan?.maxProducts ?? null,
                    },

                    users: {
                        used: site._count.users,
                        limit: plan?.maxUsers ?? null,
                    },

                    customers: {
                        total: site._count.customers,
                    },

                    orders: {
                        total: site._count.orders,
                    },

                    storage: {
                        used: site.storageUsedBytes,
                        limit: plan?.maxStorageBytes ?? null,
                    },

                    bandwidth: {
                        used: site.bandwidthUsedBytes,
                        limit: plan?.maxBandwidthBytes ?? null,
                    },

                    visits: {
                        total: site.totalVisits,
                    },
                },
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('GET /api/platform/sites/[id]/usage', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
            },
            {
                status: 500,
            },
        );
    }
}
