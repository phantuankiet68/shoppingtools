import type { MenuArea, SystemRole } from '@/generated/prisma';

export type ApiMenuItem = {
    id: string;
    parentId: string | null;
    title: string;
    path: string | null;
    icon: string | null;
    sortOrder: number;
    visible: boolean;
    area: MenuArea;
};

export type ApiMenuTreeNode = {
    key: string;
    title: string;
    icon: string;
    path: string | null;
    parentKey: string | null;
    children?: ApiMenuTreeNode[];
};

export type LayoutMenuResponse = {
    success: boolean;
    siteId: string;
    area: MenuArea;
    items: ApiMenuItem[];
};

export type LayoutMenuTreeResponse = {
    success: boolean;
    siteId: string;
    area: MenuArea;
    tree: ApiMenuTreeNode[];
};

type LayoutMenuOptions = {
    siteId: string;
    includeHidden?: boolean;
};

export const adminMenuService = {
    async layoutMenu({ siteId, includeHidden }: LayoutMenuOptions) {
        const params = new URLSearchParams();

        params.set('siteId', siteId);

        if (includeHidden) {
            params.set('includeHidden', '1');
        }

        const res = await fetch(`/api/admin/menus/layout?${params.toString()}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to load menu');
        }

        return (await res.json()) as LayoutMenuResponse;
    },

    async layoutMenuTree({ siteId, includeHidden }: LayoutMenuOptions) {
        const params = new URLSearchParams();

        params.set('siteId', siteId);
        params.set('tree', '1');

        if (includeHidden) {
            params.set('includeHidden', '1');
        }

        const res = await fetch(`/api/admin/menus/layout?${params.toString()}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to load menu tree');
        }

        return (await res.json()) as LayoutMenuTreeResponse;
    },
};
