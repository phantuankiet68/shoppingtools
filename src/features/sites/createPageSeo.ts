import { prisma } from '@/lib/prisma';

type CreatePageSeoInput = {
    siteId: string;
};

export async function createPageSeo({ siteId }: CreatePageSeoInput) {
    const pages = await prisma.page.findMany({
        where: {
            siteId,
        },
        select: {
            id: true,
            title: true,
            seo: {
                select: {
                    id: true,
                },
            },
        },
        orderBy: {
            sortOrder: 'asc',
        },
    });

    if (!pages.length) {
        return {
            siteId,
            count: 0,
            pages: [],
        };
    }

    const pagesWithoutSeo = pages.filter((page) => !page.seo);

    if (pagesWithoutSeo.length) {
        await prisma.$transaction(
            pagesWithoutSeo.map((page) =>
                prisma.pageSEO.create({
                    data: {
                        pageId: page.id,
                        metaTitle: page.title,
                        ogTitle: page.title,
                        metaDescription: `${page.title} page`,
                        ogDescription: `${page.title} page`,
                    },
                }),
            ),
        );
    }

    const seoPages = await prisma.page.findMany({
        where: {
            siteId,
        },
        select: {
            id: true,
            title: true,
            seo: true,
        },
        orderBy: {
            sortOrder: 'asc',
        },
    });

    return {
        siteId,
        count: seoPages.filter((page) => page.seo).length,
        pages: seoPages,
    };
}
