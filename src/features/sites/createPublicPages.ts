import { MenuArea, Prisma, TemplateStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type CreatePublicPagesInput = {
    siteId: string;
};

const SYSTEM_PAGE_SLUGS = ['__header', '__footer', '__404'] as const;

function buildSlug(path: string) {
    const normalizedPath = path.trim();

    if (normalizedPath === '/') {
        return 'home';
    }

    return normalizedPath.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\//g, '-').toLowerCase();
}

function isSystemPageSlug(slug: string) {
    return SYSTEM_PAGE_SLUGS.includes(slug as (typeof SYSTEM_PAGE_SLUGS)[number]);
}

export async function createPublicPages({ siteId }: CreatePublicPagesInput) {
    const site = await prisma.site.findUnique({
        where: {
            id: siteId,
        },
        select: {
            id: true,
            categoryId: true,
            websiteType: true,
        },
    });

    if (!site) {
        throw new Error('Site not found.');
    }

    if (!site.categoryId) {
        throw new Error('Site category is required.');
    }

    const menuItems = await prisma.menuItem.findMany({
        where: {
            siteId,
            area: MenuArea.SITE,
            visible: true,
            path: {
                not: null,
            },
        },
        orderBy: [
            {
                sortOrder: 'asc',
            },
            {
                title: 'asc',
            },
        ],
        select: {
            key: true,
            title: true,
            path: true,
            sortOrder: true,
        },
    });

    if (!menuItems.length) {
        return {
            siteId,
            count: 0,
            templates: 0,
            pages: [],
        };
    }

    const pageTemplates = await prisma.pageTemplate.findMany({
        where: {
            categoryId: site.categoryId,
            websiteType: site.websiteType,
            status: TemplateStatus.PUBLISHED,
            isActive: true,
            isPublic: true,
            deletedAt: null,
        },
        orderBy: [
            {
                sortOrder: 'asc',
            },
            {
                updatedAt: 'desc',
            },
        ],
        select: {
            id: true,
            key: true,
            title: true,
            path: true,
            blocks: true,
            sortOrder: true,
        },
    });

    const templateByKey = new Map(
        pageTemplates.map((template) => [template.key.trim().toLowerCase(), template]),
    );

    const pages = await prisma.$transaction(async (tx) => {
        for (const menu of menuItems) {
            if (!menu.path) {
                continue;
            }

            const path = menu.path.trim();

            if (!path) {
                continue;
            }

            const slug = buildSlug(path);

            if (isSystemPageSlug(slug)) {
                continue;
            }

            const menuKey = menu.key?.trim().toLowerCase();

            const template = menuKey ? templateByKey.get(menuKey) : undefined;

            const pageData = {
                title: menu.title.trim(),
                path,
                sortOrder: menu.sortOrder,
            };

            if (template) {
                const templateBlocks = structuredClone(template.blocks);

                if (templateBlocks === null || typeof templateBlocks !== 'object') {
                    throw new Error(`Page template "${template.key}" contains invalid blocks.`);
                }

                await tx.page.upsert({
                    where: {
                        siteId_slug: {
                            siteId,
                            slug,
                        },
                    },
                    update: {
                        ...pageData,
                        blocks: templateBlocks as Prisma.InputJsonValue,
                    },
                    create: {
                        siteId,
                        title: pageData.title,
                        slug,
                        path: pageData.path,
                        status: 'DRAFT',
                        sortOrder: pageData.sortOrder,
                        blocks: templateBlocks as Prisma.InputJsonValue,
                    },
                });

                continue;
            }

            await tx.page.upsert({
                where: {
                    siteId_slug: {
                        siteId,
                        slug,
                    },
                },
                update: pageData,
                create: {
                    siteId,
                    title: pageData.title,
                    slug,
                    path: pageData.path,
                    status: 'DRAFT',
                    sortOrder: pageData.sortOrder,
                    blocks: Prisma.JsonNull,
                },
            });
        }

        return tx.page.findMany({
            where: {
                siteId,
                slug: {
                    notIn: [...SYSTEM_PAGE_SLUGS],
                },
            },
            orderBy: [
                {
                    sortOrder: 'asc',
                },
                {
                    title: 'asc',
                },
            ],
        });
    });

    const matchedTemplates = menuItems.reduce((count, menu) => {
        const key = menu.key?.trim().toLowerCase();

        if (!key) {
            return count;
        }

        return templateByKey.has(key) ? count + 1 : count;
    }, 0);

    return {
        siteId,
        count: pages.length,
        templates: pageTemplates.length,
        matchedTemplates,
        pages,
    };
}
