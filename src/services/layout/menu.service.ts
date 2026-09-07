import type { MenuArea } from '@/generated/prisma';

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
    success?: boolean;
    siteId?: string | null;
    area: MenuArea;
    systemRole?: string;
    items: ApiMenuItem[];
};

export type LayoutMenuTreeResponse = {
    success?: boolean;
    siteId?: string | null;
    area: MenuArea;
    systemRole?: string;
    tree: ApiMenuTreeNode[];
};

type AdminMenuOptions = {
    siteId: string;
    includeHidden?: boolean;
};

type PlatformMenuOptions = {
    includeHidden?: boolean;
};

async function fetchMenu<T>(url: string, errorMessage: string): Promise<T> {
    const res = await fetch(url, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(errorMessage);
    }

    return (await res.json()) as T;
}

export const adminMenuService = {
    async layoutMenu({ siteId, includeHidden }: AdminMenuOptions) {
        const params = new URLSearchParams();

        params.set('siteId', siteId);

        if (includeHidden) {
            params.set('includeHidden', '1');
        }

        return fetchMenu<LayoutMenuResponse>(
            `/api/admin/menus/layout?${params.toString()}`,
            'Failed to load admin menu',
        );
    },

    async layoutMenuTree({ siteId, includeHidden }: AdminMenuOptions) {
        const params = new URLSearchParams();

        params.set('siteId', siteId);
        params.set('tree', '1');

        if (includeHidden) {
            params.set('includeHidden', '1');
        }

        return fetchMenu<LayoutMenuTreeResponse>(
            `/api/admin/menus/layout?${params.toString()}`,
            'Failed to load admin menu tree',
        );
    },
};

export const platformMenuService = {
    async layoutMenu({ includeHidden }: PlatformMenuOptions = {}) {
        const params = new URLSearchParams();

        if (includeHidden) {
            params.set('includeHidden', '1');
        }

        const query = params.toString();

        return fetchMenu<LayoutMenuResponse>(
            `/api/platform/menus/layout${query ? `?${query}` : ''}`,
            'Failed to load platform menu',
        );
    },

    async layoutMenuTree({ includeHidden }: PlatformMenuOptions = {}) {
        const params = new URLSearchParams();

        params.set('tree', '1');

        if (includeHidden) {
            params.set('includeHidden', '1');
        }

        return fetchMenu<LayoutMenuTreeResponse>(
            `/api/platform/menus/layout?${params.toString()}`,
            'Failed to load platform menu tree',
        );
    },
};
