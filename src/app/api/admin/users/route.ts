import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await requireAdminAuthUser();

        const { searchParams } = new URL(req.url);

        const siteId = searchParams.get('siteId');
        const q = searchParams.get('q')?.trim() ?? '';

        if (!siteId) {
            return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
        }

        const where: any = {
            siteId,
            deletedAt: null,
        };

        if (q) {
            where.OR = [
                {
                    name: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
                {
                    phone: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                take: 200,

                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            image: true,
                            systemRole: true,
                            status: true,
                            createdAt: true,
                        },
                    },

                    addresses: {
                        where: {
                            deletedAt: null,
                        },
                    },
                },
            }),

            prisma.customer.count({
                where,
            }),
        ]);

        return NextResponse.json({
            items: customers.map((customer) => ({
                ...customer,

                totalSpent: Number(customer.totalSpent),

                createdAt: customer.createdAt.toISOString(),
                updatedAt: customer.updatedAt.toISOString(),

                lastOrderAt: customer.lastOrderAt ? customer.lastOrderAt.toISOString() : null,

                user: customer.user
                    ? {
                          ...customer.user,
                          createdAt:
                              customer.user.createdAt?.toISOString?.() ?? customer.user.createdAt,
                      }
                    : null,
            })),

            total,
        });
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            {
                error: error?.message || 'Unauthorized',
            },
            {
                status: 401,
            },
        );
    }
}
export async function POST(req: NextRequest) {
    try {
        await requireAdminAuthUser();

        const body = await req.json();

        const { siteId, userId, name, email, phone, notes } = body;

        if (!siteId) {
            return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
        }

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const customer = await prisma.customer.create({
            data: {
                siteId,
                userId: userId || null,
                name: name.trim(),
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                notes: notes?.trim() || null,
            },

            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        image: true,
                        systemRole: true,
                        status: true,
                    },
                },
            },
        });

        return NextResponse.json({
            ok: true,
            item: customer,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create customer failed';

        return NextResponse.json({ error: message }, { status: 400 });
    }
}
