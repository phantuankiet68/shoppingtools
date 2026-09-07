import { MenuArea, Prisma, SystemRole } from '@/generated/prisma';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { isAdmin } from '@/lib/auth/roles';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type LayoutItem = {
    id: string;
    parentId: string | null;
    title: string;
    path: string | null;
    icon: string | null;
    sortOrder: number;
    visible: boolean;
    area: MenuArea;
};

type TreeNode = {
    key: string;
    title: string;
    icon: string;
    path: string | null;
    parentKey: string | null;
    children?: TreeNode[];
};

function buildTree(rows: LayoutItem[]): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();
    const sortMap = new Map<string, number>();

    for (const row of rows) {
        nodeMap.set(row.id, {
            key: row.id,
            title: row.title,
            icon: row.icon ?? 'bi bi-dot',
            path: row.path,
            parentKey: row.parentId,
            children: [],
        });

        sortMap.set(row.id, row.sortOrder);
    }

    const roots: TreeNode[] = [];

    for (const row of rows) {
        const node = nodeMap.get(row.id);

        if (!node) {
            continue;
        }

        if (row.parentId && nodeMap.has(row.parentId)) {
            nodeMap.get(row.parentId)?.children?.push(node);
        } else {
            roots.push(node);
        }
    }

    const sortRecursive = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            const aSort = sortMap.get(a.key) ?? 0;
            const bSort = sortMap.get(b.key) ?? 0;

            if (aSort !== bSort) {
                return aSort - bSort;
            }

            return a.title.localeCompare(b.title);
        });

        for (const node of nodes) {
            if (node.children?.length) {
                sortRecursive(node.children);
            }
        }
    };

    sortRecursive(roots);

    return roots;
}

async function requirePlatformUser() {
    const user = await getUserFromRequest();

    if (!user) {
        return null;
    }

    if (user.status !== 'ACTIVE') {
        return null;
    }

    /**
     * Platform menu chỉ dành cho backoffice roles.
     *
     * SUPER_ADMIN:
     * - Có quyền Platform mặc định.
     *
     * ADMIN:
     * - Có thể xem Platform menu nếu rolePermissions
     *   của menu đó được bật cho ADMIN.
     *
     * CUSTOMER:
     * - Không được vào Platform.
     */
    if (!isAdmin(user.systemRole)) {
        return null;
    }

    return user;
}

export async function GET(req: NextRequest) {
    try {
        const authUser = await requirePlatformUser();

        if (!authUser) {
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

        const url = new URL(req.url);

        const includeHidden = url.searchParams.get('includeHidden') === '1';

        const tree = url.searchParams.get('tree') === '1';

        /**
         * PLATFORM menu là global menu.
         *
         * Không filter siteId ở đây.
         *
         * Một bộ PLATFORM menu được dùng chung
         * cho toàn bộ Platform.
         */
        const where: Prisma.MenuItemWhereInput = {
            area: MenuArea.PLATFORM,

            ...(includeHidden
                ? {}
                : {
                      visible: true,
                  }),

            rolePermissions: {
                some: {
                    systemRole: authUser.systemRole as SystemRole,
                    enabled: true,
                },
            },
        };

        const items = await prisma.menuItem.findMany({
            where,
            orderBy: [
                {
                    sortOrder: 'asc',
                },
                {
                    title: 'asc',
                },
            ],
            select: {
                id: true,
                parentId: true,
                title: true,
                path: true,
                icon: true,
                sortOrder: true,
                visible: true,
                area: true,
            },
        });

        const menuTree = buildTree(items);

        return NextResponse.json(
            {
                success: true,
                area: MenuArea.PLATFORM,
                systemRole: authUser.systemRole,
                items,
                ...(tree
                    ? {
                          tree: menuTree,
                      }
                    : {}),
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error) {
        console.error('GET /api/platform/menus/layout error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
            },
            {
                status: 500,
            },
        );
    }
}
