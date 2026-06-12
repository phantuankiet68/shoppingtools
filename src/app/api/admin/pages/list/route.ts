import { PageStatus, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type SortKey = 'updatedAt' | 'createdAt' | 'title';

type SortDir = 'asc' | 'desc';

const PAGE_STATUSES: PageStatus[] = [PageStatus.DRAFT, PageStatus.PUBLISHED, PageStatus.ARCHIVED];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const q = (searchParams.get('q') || '').trim();

        const siteId = (searchParams.get('siteId') || '').trim();

        const statusParam = (searchParams.get('status') || '').trim();

        const offset = Math.max(0, Number(searchParams.get('offset') || 0));

        const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 10)));

        const rawSort = (searchParams.get('sort') || 'updatedAt').trim();

        const rawDir = (searchParams.get('dir') || 'desc').trim();

        const sortKey: SortKey =
            rawSort === 'createdAt' || rawSort === 'title' ? rawSort : 'updatedAt';

        const sortDir: SortDir = rawDir === 'asc' ? 'asc' : 'desc';

        const where: Prisma.PageWhereInput = {
            deletedAt: null,
        };

        if (siteId && siteId !== 'all') {
            where.siteId = siteId;
        }

        if (statusParam && statusParam !== 'all') {
            if (PAGE_STATUSES.includes(statusParam as PageStatus)) {
                where.status = statusParam as PageStatus;
            } else {
                return NextResponse.json(
                    {
                        items: [],
                        total: 0,
                        hasMore: false,
                        error: `Invalid status: ${statusParam}`,
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if (q) {
            where.OR = [
                {
                    title: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
                {
                    slug: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
                {
                    path: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const orderBy: Prisma.PageOrderByWithRelationInput = {
            [sortKey]: sortDir,
        };

        const [items, total] = await Promise.all([
            prisma.page.findMany({
                where,
                orderBy,
                skip: offset,
                take: limit,

                select: {
                    id: true,
                    siteId: true,

                    title: true,
                    slug: true,
                    path: true,

                    status: true,

                    publishedAt: true,

                    createdAt: true,
                    updatedAt: true,

                    site: {
                        select: {
                            id: true,
                            name: true,
                            domain: true,
                        },
                    },

                    seo: {
                        select: {
                            metaTitle: true,
                        },
                    },
                },
            }),

            prisma.page.count({
                where,
            }),
        ]);

        const hasMore = offset + items.length < total;

        const currentPage = Math.floor(offset / limit) + 1;

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            items: items.map((page) => ({
                id: page.id,

                siteId: page.siteId,
                siteName: page.site?.name ?? null,
                siteDomain: page.site?.domain ?? null,

                title: page.title,
                slug: page.slug,
                path: page.path,

                status: page.status,

                publishedAt: page.publishedAt,

                createdAt: page.createdAt,

                updatedAt: page.updatedAt,

                hasSeo: !!page.seo?.metaTitle,
            })),

            total,
            hasMore,

            offset,
            limit,

            currentPage,
            totalPages,
        });
    } catch (error) {
        console.error('[PAGE_LIST_ERROR]', error);

        return NextResponse.json(
            {
                items: [],
                total: 0,
                hasMore: false,
                error: error instanceof Error ? error.message : 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}
