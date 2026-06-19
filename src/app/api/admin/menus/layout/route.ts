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

function resolveAreaByRole(role: SystemRole): MenuArea | null {
    switch (role) {
        case 'SUPER_ADMIN':
            return 'PLATFORM';

        case 'ADMIN':
            return 'ADMIN';

        case 'CUSTOMER':
            return 'SITE';

        default:
            return null;
    }
}

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

async function requireBackofficeUser() {
    const user = await getUserFromRequest();

    if (!user) {
        return null;
    }

    if (user.status !== 'ACTIVE') {
        return null;
    }

    if (!isAdmin(user.systemRole)) {
        return null;
    }

    return user;
}

export async function GET(req: NextRequest) {
    try {
        const authUser = await requireBackofficeUser();

        if (!authUser) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const url = new URL(req.url);

        const includeHidden = url.searchParams.get('includeHidden') === '1';

        const tree = url.searchParams.get('tree') === '1';

        const area = resolveAreaByRole(authUser.systemRole);

        if (!area) {
            return NextResponse.json(
                {
                    message: 'Unsupported system role',
                },
                {
                    status: 403,
                },
            );
        }

        const where: Prisma.MenuItemWhereInput = {
            area,

            ...(includeHidden ? {} : { visible: true }),

            rolePermissions: {
                some: {
                    systemRole: authUser.systemRole,
                    enabled: true,
                },
            },
        };

        const items = await prisma.menuItem.findMany({
            where,

            orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],

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

        return NextResponse.json(
            tree
                ? {
                      area,
                      systemRole: authUser.systemRole,
                      tree: buildTree(items),
                  }
                : {
                      area,
                      systemRole: authUser.systemRole,
                      items,
                  },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error) {
        console.error('GET /api/admin/menus/layout error:', error);

        return NextResponse.json(
            {
                message: 'Internal server error',
            },
            {
                status: 500,
            },
        );
    }
}
