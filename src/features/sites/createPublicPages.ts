import { prisma } from '@/lib/prisma';

type PublicPageInput = {
    title: string;
    path: string;
    sortOrder?: number;
};

type CreatePublicPagesInput = {
    siteId: string;
    pages: PublicPageInput[];
};

function buildSlug(path: string) {
    if (path === '/') {
        return 'home';
    }

    return path.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\//g, '-').toLowerCase();
}

export async function createPublicPages({ siteId, pages }: CreatePublicPagesInput) {
    if (!pages.length) {
        return {
            siteId,
            count: 0,
            pages: [],
        };
    }

    const invalidPage = pages.find((page) => !page.title?.trim() || !page.path?.trim());

    if (invalidPage) {
        throw new Error('Public page title and path are required.');
    }

    const existingPages = await prisma.page.findMany({
        where: {
            siteId,
        },
        select: {
            id: true,
            path: true,
            slug: true,
        },
    });

    const existingPaths = new Set(existingPages.map((page) => page.path));

    const pagesToCreate = pages.filter((page) => !existingPaths.has(page.path));

    if (pagesToCreate.length) {
        await prisma.$transaction(
            pagesToCreate.map((page, index) =>
                prisma.page.create({
                    data: {
                        siteId,
                        title: page.title.trim(),
                        slug: buildSlug(page.path),
                        path: page.path.trim(),
                        status: 'DRAFT',
                        sortOrder: page.sortOrder ?? index + 10,
                    },
                }),
            ),
        );
    }

    const createdPages = await prisma.page.findMany({
        where: {
            siteId,
            slug: {
                notIn: ['__header', '__footer', '__404'],
            },
        },
        orderBy: {
            sortOrder: 'asc',
        },
    });

    return {
        siteId,
        count: createdPages.length,
        pages: createdPages,
    };
}
