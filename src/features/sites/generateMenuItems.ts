import { MenuArea } from '@/generated/prisma';

type MenuTemplateData = {
    key: string;
    title: string;
    path?: string | null;
    icon?: string | null;
    area: MenuArea;
    sortOrder?: number;
    visible?: boolean;
};

type GenerateMenuItemsInput = {
    siteId: string;
    menus: MenuTemplateData[];
};

export function generateMenuItems({ siteId, menus }: GenerateMenuItemsInput) {
    return menus.map((menu, index) => ({
        siteId,
        key: buildMenuKey(menu, index),
        title: menu.title.trim(),
        path: menu.path ?? null,
        icon: menu.icon ?? null,
        area: menu.area,
        sortOrder: menu.sortOrder ?? index,
        visible: menu.visible ?? true,
    }));
}

function buildMenuKey(menu: MenuTemplateData, index: number) {
    const rawKey = menu.key.trim();

    if (rawKey) {
        return rawKey;
    }

    const path = String(menu.path ?? '').trim();

    if (path === '/') {
        return 'home';
    }

    if (path) {
        const slug = path
            .replace(/^\/+/, '')
            .replace(/\/+$/, '')
            .replace(/\//g, '-')
            .replace(/[^a-zA-Z0-9-_]/g, '')
            .toLowerCase();

        if (slug) {
            return slug;
        }
    }

    return `menu-${index + 1}`;
}
