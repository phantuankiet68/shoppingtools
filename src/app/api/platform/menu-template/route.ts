import { NextRequest, NextResponse } from 'next/server';
import { Prisma, WebsiteType, MenuArea } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);

        const page = Math.max(Number(searchParams.get('page') ?? 1), 1);
        const limit = Math.max(Number(searchParams.get('limit') ?? 20), 1);

        const search = searchParams.get('search')?.trim();

        const websiteType = searchParams.get('websiteType') as WebsiteType | null;

        const categoryId = searchParams.get('categoryId');

        const area = searchParams.get('area') as MenuArea | null;

        const visibleParam = searchParams.get('visible');

        const sortBy = searchParams.get('sortBy') ?? 'sortOrder';

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

        if (visibleParam !== null) {
            where.visible = visibleParam === 'true';
        }

        const allowSort = ['title', 'sortOrder', 'createdAt', 'updatedAt'];

        const orderBy: Prisma.MenuTemplateOrderByWithRelationInput = {
            [allowSort.includes(sortBy) ? sortBy : 'sortOrder']: sortOrder,
        };

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
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.menuTemplate.count({ where }),
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
            return NextResponse.json(
                {
                    success: false,
                    message: 'Website type is required.',
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

        const category = await prisma.templateCategory.findUnique({
            where: {
                id: categoryId,
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

        const existed = await prisma.menuTemplate.findFirst({
            where: {
                websiteType,
                categoryId,
                key,
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
                    parentId: parentId ?? null,
                },
                orderBy: {
                    sortOrder: 'desc',
                },
            });

            nextSortOrder = (lastMenu?.sortOrder ?? 0) + 1;
        }

        const menu = await prisma.menuTemplate.create({
            data: {
                websiteType,
                categoryId,
                parentId: parentId ?? null,
                key: key.trim(),
                title: title.trim(),
                path: path?.trim() || null,
                icon: icon?.trim() || null,
                area,
                sortOrder: nextSortOrder,
                visible: visible ?? true,
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
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create menu template.',
            },
            {
                status: 500,
            },
        );
    }
}
