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
    const where: Prisma.TemplateCategoryWhereInput = {};

    if (websiteType) {
        where.websiteType = websiteType;
    }

    if (minTier) {
        where.minTier = minTier;
    }

    if (typeof isActive === 'boolean') {
        where.isActive = isActive;
    }

    if (search?.trim()) {
        where.OR = [
            {
                name: {
                    contains: search.trim(),
                    mode: 'insensitive',
                },
            },
            {
                description: {
                    contains: search.trim(),
                    mode: 'insensitive',
                },
            },
        ];
    }

    const categories = await prisma.templateCategory.findMany({
        where,
        orderBy: [
            {
                sortOrder: 'asc',
            },
            {
                name: 'asc',
            },
        ],
        select: {
            id: true,
            name: true,
            description: true,
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

    return categories;
}
