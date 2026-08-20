import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type CreateSystemPagesInput = {
    siteId: string;
};

const SYSTEM_PAGES = [
    {
        slug: '__header',
        title: 'Header',
        path: '/__header',
        sortOrder: -3,
    },
    {
        slug: '__footer',
        title: 'Footer',
        path: '/__footer',
        sortOrder: -2,
    },
    {
        slug: '__404',
        title: '404',
        path: '/__404',
        sortOrder: -1,
    },
] as const;

export async function createSystemPages({ siteId }: CreateSystemPagesInput) {
    const site = await prisma.site.findUnique({
        where: {
            id: siteId,
        },
        select: {
            id: true,
        },
    });

    if (!site) {
        throw new Error('SITE_NOT_FOUND');
    }

    const pages = await prisma.$transaction(async (tx) => {
        for (const page of SYSTEM_PAGES) {
            await tx.page.upsert({
                where: {
                    siteId_slug: {
                        siteId,
                        slug: page.slug,
                    },
                },
                update: {},
                create: {
                    siteId,
                    title: page.title,
                    slug: page.slug,
                    path: page.path,
                    status: 'DRAFT',
                    sortOrder: page.sortOrder,
                    blocks: Prisma.JsonNull,
                },
            });
        }

        return tx.page.findMany({
            where: {
                siteId,
                slug: {
                    in: SYSTEM_PAGES.map((page) => page.slug),
                },
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
    });

    return {
        siteId,
        count: pages.length,
        pages,
    };
}
