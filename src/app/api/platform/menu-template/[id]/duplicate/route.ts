import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
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

        let key = `${menu.key}-copy`;
        let title = `${menu.title} Copy`;

        let index = 1;

        while (
            await prisma.menuTemplate.findFirst({
                where: {
                    websiteType: menu.websiteType,
                    categoryId: menu.categoryId,
                    key,
                },
            })
        ) {
            index++;

            key = `${menu.key}-copy-${index}`;
            title = `${menu.title} Copy ${index}`;
        }

        const lastSort = await prisma.menuTemplate.findFirst({
            where: {
                websiteType: menu.websiteType,
                categoryId: menu.categoryId,
                area: menu.area,
            },
            orderBy: {
                sortOrder: 'desc',
            },
        });

        const duplicated = await prisma.menuTemplate.create({
            data: {
                websiteType: menu.websiteType,
                categoryId: menu.categoryId,
                key,
                title,
                path: menu.path,
                icon: menu.icon,
                area: menu.area,
                visible: menu.visible,
                sortOrder: (lastSort?.sortOrder ?? 0) + 1,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Menu template duplicated successfully.',
            data: duplicated,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Unauthorized',
                    },
                    {
                        status: 401,
                    },
                );
            }

            if (error.message === 'FORBIDDEN') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Forbidden',
                    },
                    {
                        status: 403,
                    },
                );
            }
        }

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to duplicate menu template.',
            },
            {
                status: 500,
            },
        );
    }
}
