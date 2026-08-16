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
    const existingPages = await prisma.page.findMany({
        where: {
            siteId,
            slug: {
                in: SYSTEM_PAGES.map((page) => page.slug),
            },
        },
        select: {
            id: true,
            slug: true,
        },
    });

    const existingSlugs = new Set(existingPages.map((page) => page.slug));

    const pagesToCreate = SYSTEM_PAGES.filter((page) => !existingSlugs.has(page.slug));

    if (pagesToCreate.length) {
        await prisma.$transaction(
            pagesToCreate.map((page) =>
                prisma.page.create({
                    data: {
                        siteId,
                        title: page.title,
                        slug: page.slug,
                        path: page.path,
                        status: 'DRAFT',
                        sortOrder: page.sortOrder,
                    },
                }),
            ),
        );
    }

    const pages = await prisma.page.findMany({
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

    return {
        siteId,
        count: pages.length,
        pages,
    };
}
