import { NextRequest, NextResponse } from 'next/server';
import { MenuArea, Prisma, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

const ALLOWED_SORT_FIELDS = ['title', 'key', 'sortOrder', 'createdAt', 'updatedAt'] as const;

function isWebsiteType(value: string): value is WebsiteType {
    return Object.values(WebsiteType).includes(value as WebsiteType);
}

function isMenuArea(value: string): value is MenuArea {
    return Object.values(MenuArea).includes(value as MenuArea);
}

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);

        const page = Math.max(Number(searchParams.get('page') ?? 1), 1);
        const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 20), 1), 100);

        const search = searchParams.get('search')?.trim();
        const websiteTypeParam = searchParams.get('websiteType');
        const categoryId = searchParams.get('categoryId');
        const areaParam = searchParams.get('area');
        const visibleParam = searchParams.get('visible');

        const sortByParam = searchParams.get('sortBy') ?? 'sortOrder';
        const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

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

        if (websiteTypeParam) {
            if (!isWebsiteType(websiteTypeParam)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Invalid website type.',
                    },
                    { status: 400 },
                );
            }

            where.websiteType = websiteTypeParam;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (areaParam) {
            if (!isMenuArea(areaParam)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Invalid menu area.',
                    },
                    { status: 400 },
                );
            }

            where.area = areaParam;
        }

        if (visibleParam !== null) {
            where.visible = visibleParam === 'true';
        }

        const sortBy = ALLOWED_SORT_FIELDS.includes(
            sortByParam as (typeof ALLOWED_SORT_FIELDS)[number],
        )
            ? sortByParam
            : 'sortOrder';

        const orderBy: Prisma.MenuTemplateOrderByWithRelationInput = {
            [sortBy]: sortOrder,
        };

        const [items, total, categories] = await prisma.$transaction([
            prisma.menuTemplate.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy,
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
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Unauthorized',
                    },
                    { status: 401 },
                );
            }

            if (error.message === 'FORBIDDEN') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Forbidden',
                    },
                    { status: 403 },
                );
            }
        }

        console.error('[GET /api/platform/menu-template]', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Internal Server Error',
            },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();

        const body = await req.json();

        const { websiteType, categoryId, key, title, path, icon, area, sortOrder, visible } = body;

        if (!websiteType) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Website type is required.',
                },
                { status: 400 },
            );
        }

        if (!isWebsiteType(websiteType)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid website type.',
                },
                { status: 400 },
            );
        }

        if (!categoryId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category is required.',
                },
                { status: 400 },
            );
        }

        if (!key?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Key is required.',
                },
                { status: 400 },
            );
        }

        if (!title?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Title is required.',
                },
                { status: 400 },
            );
        }

        if (!area) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Area is required.',
                },
                { status: 400 },
            );
        }

        if (!isMenuArea(area)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid menu area.',
                },
                { status: 400 },
            );
        }

        const category = await prisma.templateCategory.findUnique({
            where: {
                id: categoryId,
            },
            select: {
                id: true,
                name: true,
                isActive: true,
            },
        });

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category not found.',
                },
                { status: 404 },
            );
        }

        if (!category.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category is inactive.',
                },
                { status: 400 },
            );
        }

        const normalizedKey = key.trim();
        const normalizedTitle = title.trim();
        const normalizedPath = path?.trim() || null;
        const normalizedIcon = icon?.trim() || null;

        const existed = await prisma.menuTemplate.findUnique({
            where: {
                websiteType_categoryId_area_key: {
                    websiteType,
                    categoryId,
                    area,
                    key: normalizedKey,
                },
            },
            select: {
                id: true,
            },
        });

        if (existed) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Menu template key already exists.',
                },
                { status: 409 },
            );
        }

        let nextSortOrder = sortOrder;

        if (nextSortOrder == null) {
            const lastMenu = await prisma.menuTemplate.findFirst({
                where: {
                    websiteType,
                    categoryId,
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
                categoryId,
                key: normalizedKey,
                title: normalizedTitle,
                path: normalizedPath,
                icon: normalizedIcon,
                area,
                sortOrder: nextSortOrder,
                visible: visible ?? true,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Menu template created successfully.',
                data: menu,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Unauthorized',
                    },
                    { status: 401 },
                );
            }

            if (error.message === 'FORBIDDEN') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Forbidden',
                    },
                    { status: 403 },
                );
            }
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Menu template key already exists.',
                },
                { status: 409 },
            );
        }

        console.error('[POST /api/platform/menu-template]', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create menu template.',
            },
            { status: 500 },
        );
    }
}
