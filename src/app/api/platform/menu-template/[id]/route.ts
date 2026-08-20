import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;

        const menu = await prisma.menuTemplate.findUnique({
            where: {
                id,
            },
            include: {
                category: true,
            },
        });

        if (!menu) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Menu template not found.',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: menu,
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

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch menu template.',
            },
            {
                status: 500,
            },
        );
    }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;
        const body = await req.json();

        const menu = await prisma.menuTemplate.findUnique({
            where: {
                id,
            },
        });

        if (!menu) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Menu template not found.',
                },
                {
                    status: 404,
                },
            );
        }

        if (body.categoryId) {
            const category = await prisma.templateCategory.findUnique({
                where: {
                    id: body.categoryId,
                },
            });

            if (!category) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Category not found.',
                    },
                    {
                        status: 404,
                    },
                );
            }
        }

        const duplicate = await prisma.menuTemplate.findFirst({
            where: {
                id: {
                    not: id,
                },
                websiteType: body.websiteType ?? menu.websiteType,
                categoryId: body.categoryId ?? menu.categoryId,
                key: body.key ?? menu.key,
            },
        });

        if (duplicate) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Menu template key already exists.',
                },
                {
                    status: 409,
                },
            );
        }

        const updated = await prisma.menuTemplate.update({
            where: {
                id,
            },

            data: {
                websiteType: body.websiteType ?? menu.websiteType,

                categoryId: body.categoryId ?? menu.categoryId,

                key: body.key?.trim() ?? menu.key,

                title: body.title?.trim() ?? menu.title,

                path: body.path === undefined ? menu.path : body.path,

                icon: body.icon === undefined ? menu.icon : body.icon,

                area: body.area ?? menu.area,

                sortOrder: body.sortOrder ?? menu.sortOrder,

                visible: body.visible ?? menu.visible,
            },

            include: {
                category: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Menu template updated successfully.',
            data: updated,
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

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update menu template.',
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;

        const menu = await prisma.menuTemplate.findUnique({
            where: {
                id,
            },
        });

        if (!menu) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Menu template not found.',
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.menuTemplate.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Menu template deleted successfully.',
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

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete menu template.',
            },
            {
                status: 500,
            },
        );
    }
}
