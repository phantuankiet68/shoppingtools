import { NextRequest, NextResponse } from 'next/server';
import { MenuArea, Prisma, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

const SORT_FIELDS = ['title', 'key', 'sortOrder', 'createdAt', 'updatedAt'] as const;

type SortField = (typeof SORT_FIELDS)[number];

function isWebsiteType(value: string): value is WebsiteType {
    return Object.values(WebsiteType).includes(value as WebsiteType);
}

function isMenuArea(value: string): value is MenuArea {
    return Object.values(MenuArea).includes(value as MenuArea);
}

function isSortField(value: string): value is SortField {
    return SORT_FIELDS.includes(value as SortField);
}

function errorResponse(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

function handleAuthError(error: unknown) {
    if (!(error instanceof Error)) return null;

    if (error.message === 'UNAUTHORIZED') {
        return errorResponse('Unauthorized', 401);
    }

    if (error.message === 'FORBIDDEN') {
        return errorResponse('Forbidden', 403);
    }

    return null;
}

function parsePositiveInt(value: string | null, fallback: number, max?: number) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
        return fallback;
    }

    return max !== undefined ? Math.min(parsed, max) : parsed;
}

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);

        const search = searchParams.get('search')?.trim() || undefined;

        const websiteTypeParam = searchParams.get('websiteType');

        const categoryId = searchParams.get('categoryId')?.trim() || undefined;

        const areaParam = searchParams.get('area');

        const visibleParam = searchParams.get('visible');

        const page = parsePositiveInt(searchParams.get('page'), 1);

        const limit = parsePositiveInt(searchParams.get('limit'), 20, 100);

        const sortByParam = searchParams.get('sortBy') || 'sortOrder';

        const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

        if (websiteTypeParam && !isWebsiteType(websiteTypeParam)) {
            return errorResponse('Invalid website type.');
        }

        if (areaParam && !isMenuArea(areaParam)) {
            return errorResponse('Invalid menu area.');
        }

        if (visibleParam !== null && visibleParam !== 'true' && visibleParam !== 'false') {
            return errorResponse('Invalid visible value.');
        }

        const websiteType = websiteTypeParam ? (websiteTypeParam as WebsiteType) : undefined;

        const area = areaParam ? (areaParam as MenuArea) : undefined;

        const visible = visibleParam === null ? undefined : visibleParam === 'true';

        const sortBy: SortField = isSortField(sortByParam) ? sortByParam : 'sortOrder';

        const where: Prisma.MenuTemplateWhereInput = {};

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    key: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    path: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    icon: {
                        contains: search,
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

        if (area) {
            where.area = area;
        }

        if (visible !== undefined) {
            where.visible = visible;
        }

        const [items, total, categories] = await prisma.$transaction([
            prisma.menuTemplate.findMany({
                where,
                include: {
                    category: true,
                    parent: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
                orderBy: {
                    [sortBy]: sortOrder,
                },
                skip: (page - 1) * limit,
                take: limit,
            }),

            prisma.menuTemplate.count({
                where,
            }),

            prisma.templateCategory.findMany({
                where: {
                    isActive: true,
                },
                orderBy: {
                    sortOrder: 'asc',
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            categories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        const authError = handleAuthError(error);

        if (authError) {
            return authError;
        }

        console.error('[GET /api/platform/menu-template]', error);

        return errorResponse('Internal Server Error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();

        const body = await req.json();

        const {
            websiteType,
            categoryId,
            parentId,
            key,
            title,
            path,
            icon,
            area,
            sortOrder,
            visible,
        } = body;

        if (!websiteType) {
            return errorResponse('Website type is required.');
        }

        if (!isWebsiteType(websiteType)) {
            return errorResponse('Invalid website type.');
        }

        if (typeof categoryId !== 'string' || !categoryId.trim()) {
            return errorResponse('Category is required.');
        }

        if (typeof key !== 'string' || !key.trim()) {
            return errorResponse('Key is required.');
        }

        if (typeof title !== 'string' || !title.trim()) {
            return errorResponse('Title is required.');
        }

        if (!area) {
            return errorResponse('Area is required.');
        }

        if (!isMenuArea(area)) {
            return errorResponse('Invalid menu area.');
        }

        if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
            return errorResponse('Sort order must be a non-negative integer.');
        }

        if (parentId !== undefined && parentId !== null && typeof parentId !== 'string') {
            return errorResponse('Invalid parent menu.');
        }

        const normalizedCategoryId = categoryId.trim();

        const normalizedKey = key.trim();

        const normalizedTitle = title.trim();

        const normalizedPath = typeof path === 'string' && path.trim() ? path.trim() : null;

        const normalizedIcon = typeof icon === 'string' && icon.trim() ? icon.trim() : null;

        const normalizedParentId =
            typeof parentId === 'string' && parentId.trim() ? parentId.trim() : null;

        const category = await prisma.templateCategory.findUnique({
            where: {
                id: normalizedCategoryId,
            },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (!category) {
            return errorResponse('Category not found.', 404);
        }

        if (!category.isActive) {
            return errorResponse('Category is inactive.');
        }

        if (normalizedParentId) {
            const parent = await prisma.menuTemplate.findUnique({
                where: {
                    id: normalizedParentId,
                },
                select: {
                    id: true,
                    categoryId: true,
                },
            });

            if (!parent) {
                return errorResponse('Parent menu not found.', 404);
            }

            if (parent.categoryId !== normalizedCategoryId) {
                return errorResponse('Parent menu must belong to the selected category.');
            }
        }

        const existed = await prisma.menuTemplate.findUnique({
            where: {
                websiteType_categoryId_area_key: {
                    websiteType,
                    categoryId: normalizedCategoryId,
                    area,
                    key: normalizedKey,
                },
            },
            select: {
                id: true,
            },
        });

        if (existed) {
            return errorResponse('Menu template key already exists.', 409);
        }

        let nextSortOrder = sortOrder;

        if (nextSortOrder === undefined) {
            const lastMenu = await prisma.menuTemplate.findFirst({
                where: {
                    websiteType,
                    categoryId: normalizedCategoryId,
                    area,
                },
                orderBy: {
                    sortOrder: 'desc',
                },
                select: {
                    sortOrder: true,
                },
            });

            nextSortOrder = (lastMenu?.sortOrder ?? -1) + 1;
        }

        const menu = await prisma.menuTemplate.create({
            data: {
                websiteType,
                categoryId: normalizedCategoryId,
                parentId: normalizedParentId,
                key: normalizedKey,
                title: normalizedTitle,
                path: normalizedPath,
                icon: normalizedIcon,
                area,
                sortOrder: nextSortOrder,
                visible: typeof visible === 'boolean' ? visible : true,
            },
            include: {
                category: true,
                parent: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Menu template created successfully.',
                data: menu,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        const authError = handleAuthError(error);

        if (authError) {
            return authError;
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return errorResponse('Menu template key already exists.', 409);
        }

        console.error('[POST /api/platform/menu-template]', error);

        return errorResponse('Failed to create menu template.', 500);
    }
}
