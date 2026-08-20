import { AccessTier, Prisma, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export type GetTemplateCategoriesInput = {
    websiteType?: WebsiteType;
    minTier?: AccessTier;
    search?: string;
    isActive?: boolean;
};

export async function getTemplateCategories({
    websiteType,
    minTier,
    search,
    isActive = true,
}: GetTemplateCategoriesInput = {}) {
    const where: Prisma.TemplateCategoryWhereInput = {
        ...(websiteType && { websiteType }),
        ...(minTier && { minTier }),
        ...(typeof isActive === 'boolean' && { isActive }),
    };

    if (search?.trim()) {
        where.name = {
            contains: search.trim(),
            mode: 'insensitive',
        };
    }

    return prisma.templateCategory.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: {
            id: true,
            name: true,
            websiteType: true,
            minTier: true,
            sortOrder: true,
            isActive: true,
            _count: {
                select: {
                    templates: true,
                    pageTemplates: true,
                },
            },
        },
    });
}
