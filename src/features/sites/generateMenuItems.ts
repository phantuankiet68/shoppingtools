import { MenuArea } from '@/generated/prisma';

type MenuTemplateData = {
    id: string;
    parentId?: string | null;
    key: string;
    title: string;
    path?: string | null;
    icon?: string | null;
    area: MenuArea;
    sortOrder?: number;
    visible?: boolean;
};

export type GeneratedMenuItem = {
    templateId: string;
    parentTemplateId: string | null;
    key: string;
    title: string;
    path: string | null;
    icon: string | null;
    area: MenuArea;
    sortOrder: number;
    visible: boolean;
};

type GenerateMenuItemsInput = {
    siteId: string;
    menus: MenuTemplateData[];
};

export function generateMenuItems({
    siteId: _siteId,
    menus,
}: GenerateMenuItemsInput): GeneratedMenuItem[] {
    return menus.map((menu, index) => ({
        templateId: menu.id,
        parentTemplateId: menu.parentId ?? null,
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
