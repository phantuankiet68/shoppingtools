type GenerateMenuItemsInput = {
    siteId: string;
    menus: any[];
};

export function generateMenuItems({ siteId, menus }: GenerateMenuItemsInput) {
    return menus.map((menu, index) => ({
        siteId,
        key: buildMenuKey(menu, index),
        title: String(menu.title ?? '').trim(),
        path: menu.path ?? null,
        icon: menu.icon ?? null,
        area: menu.area ?? 'SITE',
        sortOrder: menu.sortOrder ?? index,
        visible: menu.visible ?? true,
        parentKey: menu.parentKey ?? null,
    }));
}

function buildMenuKey(menu: any, index: number) {
    const rawKey = String(menu.key ?? '').trim();

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
