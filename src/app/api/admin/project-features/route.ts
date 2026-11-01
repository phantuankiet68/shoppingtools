import { NextRequest, NextResponse } from 'next/server';
import { Locale, Prisma, ProjectFeatureCategory, ProjectFeatureStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// ======================================================
// CONFIGURATION
// ======================================================

const DEFAULT_LIMIT = 7;
const MAX_LIMIT = 100;

const LOCALES = Object.values(Locale);
const CATEGORIES = Object.values(ProjectFeatureCategory);
const STATUSES = Object.values(ProjectFeatureStatus);

// ======================================================
// TYPES
// ======================================================

type TranslationInput = {
    locale?: string;
    title?: string;
    description?: unknown;
};

type ImageInput = {
    image?: string;
    sortOrder?: number;
    isPrimary?: boolean;
};

type ProjectFeatureInput = {
    siteId?: string;
    category?: string;
    status?: string;
    developer?: string | null;
    tags?: unknown;
    slug?: string;
    sortOrder?: number;
    isFeatured?: boolean;
    translations?: TranslationInput[];
    images?: ImageInput[];
};

type SortField = 'sortOrder' | 'createdAt' | 'viewCount' | 'favoriteCount';

// ======================================================
// COMMON HELPERS
// ======================================================

const errorResponse = (message: string, status = 400) => {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
};

const isOneOf = <T extends string>(values: readonly T[], value: string): value is T => {
    return values.includes(value as T);
};

const parseLimit = (value: string | null): number => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return DEFAULT_LIMIT;
    }

    return Math.min(parsed, MAX_LIMIT);
};

const parsePage = (value: string | null): number => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
        return 1;
    }

    return parsed;
};

// ======================================================
// WORKSPACE & SITE
// ======================================================

async function getWorkspace() {
    const session = await getCurrentSession();

    return {
        session,
        workspaceId: session?.currentWorkspace?.id ?? null,
    };
}

async function getSite(siteId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: {
            id: siteId,
            workspaceId,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });
}

async function getFeature(id: string, workspaceId: string) {
    return prisma.projectFeature.findFirst({
        where: {
            id,
            site: {
                workspaceId,
                deletedAt: null,
            },
        },
        include: {
            translations: {
                orderBy: {
                    locale: 'asc',
                },
            },
            images: {
                orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            },
        },
    });
}

// ======================================================
// JSON & TRANSLATION HELPERS
// ======================================================

function jsonValue(value: unknown): Prisma.InputJsonValue {
    return value == null || value === '' ? {} : (value as Prisma.InputJsonValue);
}

function normalizeTranslations(items: TranslationInput[] = []) {
    const map = new Map<
        Locale,
        {
            locale: Locale;
            title: string;
            description: Prisma.InputJsonValue;
        }
    >();

    for (const item of items) {
        const locale = String(item.locale ?? '').trim();

        const title = String(item.title ?? '').trim();

        if (!isOneOf(LOCALES, locale)) {
            throw new Error(`Invalid locale: ${locale}`);
        }

        if (!title) {
            throw new Error(`Title is required for locale: ${locale}`);
        }

        map.set(locale, {
            locale,
            title,
            description: jsonValue(item.description),
        });
    }

    return [...map.values()];
}

// ======================================================
// IMAGE HELPERS
// ======================================================

function normalizeImages(items: ImageInput[] = []) {
    if (items.length > 5) {
        throw new Error('A project feature can have a maximum of 5 images.');
    }

    const images = items.map((item, index) => {
        const image = String(item.image ?? '').trim();

        const sortOrder = item.sortOrder == null ? index : Number(item.sortOrder);

        if (!image) {
            throw new Error(`Image is required at position ${index + 1}.`);
        }

        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            throw new Error(`Invalid image sortOrder at position ${index + 1}.`);
        }

        return {
            image,
            sortOrder,
            isPrimary: Boolean(item.isPrimary),
        };
    });

    // Chỉ cho phép một ảnh chính.
    const primary = images.findIndex((item) => item.isPrimary);

    images.forEach((item, index) => {
        item.isPrimary = primary === -1 ? index === 0 : index === primary;
    });

    return images;
}

// ======================================================
// PROJECT FEATURE SELECT
// ======================================================

const featureSelect = {
    id: true,
    siteId: true,
    category: true,
    status: true,
    developer: true,
    tags: true,
    slug: true,
    viewCount: true,
    favoriteCount: true,
    shareCount: true,
    sortOrder: true,
    isFeatured: true,
    createdAt: true,
    updatedAt: true,

    translations: {
        orderBy: {
            locale: 'asc' as const,
        },
        select: {
            id: true,
            locale: true,
            title: true,
            description: true,
        },
    },

    images: {
        orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
        take: 5,
        select: {
            id: true,
            featureId: true,
            image: true,
            sortOrder: true,
            isPrimary: true,
        },
    },
} satisfies Prisma.ProjectFeatureSelect;

// ======================================================
// GET - LIST PROJECT FEATURES
// ======================================================

export async function GET(request: NextRequest) {
    try {
        // ----------------------------------------------
        // 1. Authentication
        // ----------------------------------------------

        const { session, workspaceId } = await getWorkspace();

        if (!session) {
            return errorResponse('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return errorResponse('Workspace not found.');
        }

        // ----------------------------------------------
        // 2. Query parameters
        // ----------------------------------------------

        const { searchParams } = new URL(request.url);

        const siteId = searchParams.get('siteId')?.trim() ?? '';

        const search = searchParams.get('search')?.trim() ?? '';

        const category = searchParams.get('category')?.trim() ?? '';

        const status = searchParams.get('status')?.trim() ?? '';

        const locale = searchParams.get('locale')?.trim() ?? '';

        const requestedPage = parsePage(searchParams.get('page'));

        const limit = parseLimit(searchParams.get('limit'));

        // ----------------------------------------------
        // 3. Sorting
        // ----------------------------------------------

        const sortFieldMap: Record<string, SortField> = {
            sortOrder: 'sortOrder',
            createdAt: 'createdAt',
            views: 'viewCount',
            favorites: 'favoriteCount',
        };

        const requestedSort = searchParams.get('sortBy') ?? 'sortOrder';

        const sortBy: SortField = sortFieldMap[requestedSort] ?? 'sortOrder';

        const sortOrder: Prisma.SortOrder =
            searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

        // ----------------------------------------------
        // 4. Validate parameters
        // ----------------------------------------------

        if (!siteId) {
            return errorResponse('siteId is required.');
        }

        if (category && !isOneOf(CATEGORIES, category)) {
            return errorResponse('Invalid category.');
        }

        if (status && !isOneOf(STATUSES, status)) {
            return errorResponse('Invalid status.');
        }

        if (locale && !isOneOf(LOCALES, locale)) {
            return errorResponse('Invalid locale.');
        }

        // ----------------------------------------------
        // 5. Validate site access
        // ----------------------------------------------

        const site = await getSite(siteId, workspaceId);

        if (!site) {
            return errorResponse('Site not found or access denied.', 404);
        }

        // ----------------------------------------------
        // 6. Build common filters
        // ----------------------------------------------

        const statsWhere: Prisma.ProjectFeatureWhereInput = {
            siteId: site.id,

            ...(category && {
                category: category as ProjectFeatureCategory,
            }),

            ...(search && {
                OR: [
                    {
                        slug: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        developer: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        translations: {
                            some: {
                                title: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                ],
            }),
        };

        // Status chỉ áp dụng cho danh sách.
        // Không áp dụng vào thống kê các tab.
        const where: Prisma.ProjectFeatureWhereInput = {
            ...statsWhere,

            ...(status && {
                status: status as ProjectFeatureStatus,
            }),
        };

        // ----------------------------------------------
        // 7. Get total & statistics
        // ----------------------------------------------

        const [total, groupedStatuses, aggregates] = await prisma.$transaction([
            prisma.projectFeature.count({
                where,
            }),

            prisma.projectFeature.groupBy({
                by: ['status'],
                where: statsWhere,
                _count: {
                    _all: true,
                },
            }),

            prisma.projectFeature.aggregate({
                where: statsWhere,

                _sum: {
                    viewCount: true,
                    favoriteCount: true,
                    shareCount: true,
                },

                _count: {
                    _all: true,
                },
            }),
        ]);

        // ----------------------------------------------
        // 8. Calculate pagination
        // ----------------------------------------------

        const totalPages = Math.ceil(total / limit);

        // Không cho phép truy cập trang vượt giới hạn.
        const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);

        const skip = (page - 1) * limit;

        // ----------------------------------------------
        // 9. Get status counts
        // ----------------------------------------------

        const statusCounts = {
            PUBLISHED: 0,
            DRAFT: 0,
            ARCHIVED: 0,
        };

        for (const group of groupedStatuses) {
            const statusKey = group.status as keyof typeof statusCounts;

            statusCounts[statusKey] = group._count._all;
        }

        // ----------------------------------------------
        // 10. Get paginated data
        // ----------------------------------------------

        const translationWhere = locale
            ? {
                  locale: locale as Locale,
              }
            : undefined;

        const items = await prisma.projectFeature.findMany({
            where,

            orderBy: [
                {
                    [sortBy]: sortOrder,
                },
                {
                    createdAt: 'desc',
                },
            ],

            skip,
            take: limit,

            select: {
                ...featureSelect,

                translations: {
                    where: translationWhere,

                    orderBy: {
                        locale: 'asc',
                    },

                    select: featureSelect.translations.select,
                },
            },
        });

        // ----------------------------------------------
        // 11. Response
        // ----------------------------------------------

        return NextResponse.json({
            success: true,

            projectFeatures: items,

            stats: {
                total: aggregates._count._all,

                published: statusCounts.PUBLISHED,

                draft: statusCounts.DRAFT,

                archived: statusCounts.ARCHIVED,

                views: aggregates._sum.viewCount ?? 0,

                favorites: aggregates._sum.favoriteCount ?? 0,

                shares: aggregates._sum.shareCount ?? 0,
            },

            pagination: {
                page,
                limit,
                total,
                totalPages,

                hasNextPage: page < totalPages,

                hasPreviousPage: page > 1 && total > 0,
            },
        });
    } catch (error) {
        console.error('[GET /api/admin/project-features]', error);

        return errorResponse('Internal server error.', 500);
    }
}

// ======================================================
// POST - CREATE PROJECT FEATURE
// ======================================================

export async function POST(request: NextRequest) {
    try {
        // ----------------------------------------------
        // 1. Authentication
        // ----------------------------------------------

        const { session, workspaceId } = await getWorkspace();

        if (!session) {
            return errorResponse('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return errorResponse('Workspace not found.');
        }

        // ----------------------------------------------
        // 2. Parse request body
        // ----------------------------------------------

        let body: ProjectFeatureInput;

        try {
            body = await request.json();
        } catch {
            return errorResponse('Invalid JSON body.');
        }

        // ----------------------------------------------
        // 3. Normalize fields
        // ----------------------------------------------

        const siteId = String(body.siteId ?? '').trim();

        const category = String(body.category ?? 'OTHER').trim();

        const status = String(body.status ?? 'DRAFT').trim();

        const slug = String(body.slug ?? '').trim();

        const developer = body.developer == null ? null : String(body.developer).trim() || null;

        const sortOrder = body.sortOrder == null ? 0 : Number(body.sortOrder);

        const isFeatured = body.isFeatured ?? false;

        // ----------------------------------------------
        // 4. Validate fields
        // ----------------------------------------------

        if (!siteId) {
            return errorResponse('siteId is required.');
        }

        if (!isOneOf(CATEGORIES, category)) {
            return errorResponse('Invalid category.');
        }

        if (!isOneOf(STATUSES, status)) {
            return errorResponse('Invalid status.');
        }

        if (!slug) {
            return errorResponse('slug is required.');
        }

        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            return errorResponse('sortOrder must be a non-negative integer.');
        }

        if (typeof isFeatured !== 'boolean') {
            return errorResponse('isFeatured must be a boolean.');
        }

        // ----------------------------------------------
        // 5. Validate site
        // ----------------------------------------------

        const site = await getSite(siteId, workspaceId);

        if (!site) {
            return errorResponse('Site not found or access denied.', 404);
        }

        // ----------------------------------------------
        // 6. Normalize translations & images
        // ----------------------------------------------

        const translations = normalizeTranslations(body.translations);

        const images = normalizeImages(body.images);

        // ----------------------------------------------
        // 7. Check duplicate slug
        // ----------------------------------------------

        const existing = await prisma.projectFeature.findUnique({
            where: {
                siteId_slug: {
                    siteId: site.id,
                    slug,
                },
            },

            select: {
                id: true,
            },
        });

        if (existing) {
            return errorResponse('A project feature with this slug already exists.', 409);
        }

        // ----------------------------------------------
        // 8. Create project feature
        // ----------------------------------------------

        const item = await prisma.projectFeature.create({
            data: {
                siteId: site.id,

                category: category as ProjectFeatureCategory,

                status: status as ProjectFeatureStatus,

                developer,

                tags: body.tags == null ? undefined : (body.tags as Prisma.InputJsonValue),

                slug,
                sortOrder,
                isFeatured,

                translations: {
                    create: translations,
                },

                images: {
                    create: images,
                },
            },

            select: featureSelect,
        });

        // ----------------------------------------------
        // 9. Response
        // ----------------------------------------------

        return NextResponse.json(
            {
                success: true,

                message: 'Project feature created successfully.',

                item,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[POST /api/admin/project-features]', error);

        return errorResponse(
            error instanceof Error ? error.message : 'Internal server error.',

            error instanceof Error ? 400 : 500,
        );
    }
}
