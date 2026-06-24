import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
type MenuNode = {
    label: string;
    href: string;
    icon: string | null;
    children: MenuNode[];
};
export async function GET(request: NextRequest, context: { params: Promise<{ siteId: string }> }) {
    try {
        const { siteId } = await context.params;

        const menus = await prisma.menuItem.findMany({
            where: {
                siteId,
                area: 'SITE',
                visible: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });

        const menuMap = new Map<string, MenuNode>();

        for (const menu of menus) {
            menuMap.set(menu.id, {
                label: menu.title,
                href: menu.path ?? '#',
                icon: menu.icon,
                children: [],
            });
        }

        const roots: any[] = [];

        for (const menu of menus) {
            const item = menuMap.get(menu.id);

            if (!item) continue;

            if (menu.parentId) {
                const parent = menuMap.get(menu.parentId);

                if (parent) {
                    parent.children.push(item);
                }
            } else {
                roots.push(item);
            }
        }

        return NextResponse.json({
            success: true,
            data: roots,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to load menus',
            },
            {
                status: 500,
            },
        );
    }
}
