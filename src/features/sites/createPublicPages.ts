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

function cloneTemplateBlocks(
    blocks: Prisma.JsonValue | null,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
    if (blocks === null) {
        return Prisma.JsonNull;
    }

    return structuredClone(blocks) as Prisma.InputJsonValue;
}

export async function createPublicPages({ siteId }: CreatePublicPagesInput) {
    /**
     * 1. Lấy Site.
     *
     * Site hiện không có categoryId.
     * Site lưu category dưới dạng:
     *
     * category = "Service"
     * type     = "landing"
     */
    const site = await prisma.site.findUnique({
        where: {
            id: siteId,
        },
        select: {
            id: true,
            category: true,
            type: true,
        },
    });

    if (!site) {
        throw new Error('SITE_NOT_FOUND');
    }

    if (!site.category?.trim()) {
        throw new Error('SITE_CATEGORY_REQUIRED');
    }

    /**
     * 2. Tìm TemplateCategory tương ứng với Site.
     *
     * Ví dụ:
     *
     * Site:
     *   category = "Service"
     *   type = landing
     *
     * TemplateCategory:
     *   name = "Service"
     *   websiteType = landing
     */
    const category = await prisma.templateCategory.findFirst({
        where: {
            name: {
                equals: site.category.trim(),
                mode: 'insensitive',
            },
            websiteType: site.type,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            websiteType: true,
        },
    });

    if (!category) {
        throw new Error('SITE_TEMPLATE_CATEGORY_NOT_FOUND');
    }

    /**
     * 3. Lấy MenuItem của Site.
     *
     * Menu đã được tạo theo TemplateCategory.
     * Menu path sẽ quyết định Page nào được tạo.
     */
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
            title: true,
            path: true,
            sortOrder: true,
        },
    });

    if (!menuItems.length) {
        return {
            siteId,
            categoryId: category.id,
            categoryName: category.name,
            websiteType: category.websiteType,
            count: 0,
            templates: 0,
            matchedTemplates: 0,
            pages: [],
        };
    }

    /**
     * 4. Lấy PageTemplate thuộc đúng:
     *
     * categoryId
     * +
     * websiteType
     *
     * Không dùng key.
     * Không dùng minTier.
     * Không dùng menu key.
     */
    const pageTemplates = await prisma.pageTemplate.findMany({
        where: {
            categoryId: category.id,
            websiteType: site.type,
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
            title: true,
            slug: true,
            path: true,
            blocks: true,
            sortOrder: true,
        },
    });

    /**
     * 5. Map PageTemplate theo path.
     *
     * MenuItem:
     *   /service
     *
     * PageTemplate:
     *   /service
     *
     * => match.
     */
    const templateByPath = new Map<string, (typeof pageTemplates)[number]>();

    for (const template of pageTemplates) {
        const templatePath = template.path.trim();

        if (!templatePath) {
            continue;
        }

        templateByPath.set(templatePath.toLowerCase(), template);
    }

    /**
     * 6. Tạo Page từ MenuItem.
     *
     * Có PageTemplate:
     *   Page.blocks = clone(PageTemplate.blocks)
     *
     * Không có PageTemplate:
     *   Page.blocks = null
     */
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

            const template = templateByPath.get(path.toLowerCase());

            /**
             * Ưu tiên slug của PageTemplate.
             * Nếu PageTemplate chưa có slug thì
             * tự tạo slug từ path.
             */
            const pageSlug = template?.slug?.trim() || slug;

            const pageData = {
                title: menu.title.trim(),
                slug: pageSlug,
                path,
                sortOrder: menu.sortOrder,
            };

            /**
             * Có PageTemplate.
             */
            if (template) {
                const blocks = cloneTemplateBlocks(template.blocks);

                await tx.page.upsert({
                    where: {
                        siteId_slug: {
                            siteId,
                            slug: pageSlug,
                        },
                    },
                    update: {
                        title: pageData.title,
                        path: pageData.path,
                        sortOrder: pageData.sortOrder,
                        blocks,
                    },
                    create: {
                        siteId,
                        title: pageData.title,
                        slug: pageData.slug,
                        path: pageData.path,
                        status: 'DRAFT',
                        sortOrder: pageData.sortOrder,
                        blocks,
                    },
                });

                continue;
            }

            /**
             * Không có PageTemplate.
             *
             * Vẫn tạo Page nhưng không có
             * nội dung mẫu.
             */
            await tx.page.upsert({
                where: {
                    siteId_slug: {
                        siteId,
                        slug: pageSlug,
                    },
                },
                update: {
                    title: pageData.title,
                    path: pageData.path,
                    sortOrder: pageData.sortOrder,
                },
                create: {
                    siteId,
                    title: pageData.title,
                    slug: pageData.slug,
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
                deletedAt: null,
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

    /**
     * 7. Đếm số PageTemplate đã match với MenuItem.
     */
    const matchedTemplates = menuItems.reduce((count, menu) => {
        if (!menu.path) {
            return count;
        }

        const path = menu.path.trim();

        if (!path) {
            return count;
        }

        return templateByPath.has(path.toLowerCase()) ? count + 1 : count;
    }, 0);

    return {
        siteId,
        categoryId: category.id,
        categoryName: category.name,
        websiteType: category.websiteType,
        count: pages.length,
        templates: pageTemplates.length,
        matchedTemplates,
        pages,
    };
}
