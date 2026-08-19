import { AccessTier, Prisma, TemplateStatus, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export type GetPageTemplatesInput = {
    page?: number;
    limit?: number;
    search?: string;
    websiteType?: WebsiteType;
    categoryId?: string;
    minTier?: AccessTier;
    status?: TemplateStatus;
    isActive?: boolean;
    isPublic?: boolean;
};

export type CreatePageTemplateInput = {
    title: string;
    key: string;
    categoryId: string;
    websiteType: WebsiteType;
    minTier?: AccessTier;
    status?: TemplateStatus;
    path?: string | null;
    blocks: Prisma.InputJsonValue;
    previewImageUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    isPublic?: boolean;
};

function normalizeKey(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function normalizePath(value?: string | null) {
    if (!value?.trim()) {
        return null;
    }

    const path = value.trim();

    return path.startsWith('/') ? path : `/${path}`;
}

function categoryIdIsValid(value: string) {
    return Boolean(value?.trim());
}

export async function getPageTemplates({
    page = 1,
    limit = 10,
    search,
    websiteType,
    categoryId,
    minTier,
    status,
    isActive,
    isPublic,
}: GetPageTemplatesInput = {}) {
    const currentPage = Math.max(1, Math.floor(page));
    const currentLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
    const skip = (currentPage - 1) * currentLimit;

    const where: Prisma.PageTemplateWhereInput = {
        deletedAt: null,
    };

    if (search?.trim()) {
        const keyword = search.trim();

        where.OR = [
            {
                title: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            },
            {
                key: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            },
            {
                path: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            },
        ];
    }

    if (websiteType) {
        where.websiteType = websiteType;
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (minTier) {
        where.minTier = minTier;
    }

    if (status) {
        where.status = status;
    }

    if (typeof isActive === 'boolean') {
        where.isActive = isActive;
    }

    if (typeof isPublic === 'boolean') {
        where.isPublic = isPublic;
    }

    const [items, total, published, draft, archived] = await prisma.$transaction([
        prisma.pageTemplate.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
            skip,
            take: currentLimit,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        websiteType: true,
                        minTier: true,
                    },
                },
            },
        }),

        prisma.pageTemplate.count({
            where,
        }),

        prisma.pageTemplate.count({
            where: {
                ...where,
                status: TemplateStatus.PUBLISHED,
            },
        }),

        prisma.pageTemplate.count({
            where: {
                ...where,
                status: TemplateStatus.DRAFT,
            },
        }),

        prisma.pageTemplate.count({
            where: {
                ...where,
                status: TemplateStatus.ARCHIVED,
            },
        }),
    ]);

    return {
        items,
        pagination: {
            page: currentPage,
            limit: currentLimit,
            total,
            totalPages: Math.ceil(total / currentLimit),
        },
        stats: {
            total,
            published,
            draft,
            archived,
        },
    };
}

export async function createPageTemplate(input: CreatePageTemplateInput) {
    const title = input.title.trim();
    const key = normalizeKey(input.key);
    const path = normalizePath(input.path);

    if (!title) {
        throw new Error('Template title is required.');
    }

    if (!key) {
        throw new Error('Template key is required.');
    }

    if (!categoryIdIsValid(input.categoryId)) {
        throw new Error('Template category is required.');
    }

    if (!Array.isArray(input.blocks)) {
        throw new Error('Page blocks must be a JSON array.');
    }

    if (!input.blocks.length) {
        throw new Error('Page blocks are required.');
    }

    const category = await prisma.templateCategory.findFirst({
        where: {
            id: input.categoryId,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            websiteType: true,
        },
    });

    if (!category) {
        throw new Error('Template category not found or inactive.');
    }

    if (category.websiteType !== input.websiteType) {
        throw new Error('Template category does not belong to the selected website type.');
    }

    const existing = await prisma.pageTemplate.findFirst({
        where: {
            websiteType: input.websiteType,
            categoryId: input.categoryId,
            key,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });

    if (existing) {
        throw new Error('A page template with this key already exists in this category.');
    }

    const template = await prisma.pageTemplate.create({
        data: {
            title,
            key,
            categoryId: input.categoryId,
            websiteType: input.websiteType,
            minTier: input.minTier ?? AccessTier.BASIC,
            status: input.status ?? TemplateStatus.DRAFT,
            path,
            blocks: input.blocks,
            previewImageUrl: input.previewImageUrl ?? null,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive ?? true,
            isPublic: input.isPublic ?? true,
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    websiteType: true,
                    minTier: true,
                },
            },
        },
    });

    return template;
}
