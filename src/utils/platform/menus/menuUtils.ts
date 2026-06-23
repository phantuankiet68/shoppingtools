import type { EditMenuFormState, MenuRecord } from '@/features/platform/types/menus/menu';

import type { SiteOption } from '@/components/platform/menus/modalAddMenus';

export function getInitials(value: string): string {
    return value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

export function formatDate(value?: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function createEditForm(menu: MenuRecord): EditMenuFormState {
    return {
        title: menu.title ?? '',
        path: menu.path ?? '',
        icon: menu.icon ?? '',
        sortOrder: String(menu.sortOrder ?? 0),
        visible: menu.visible,
        area: menu.area,
        siteId: menu.siteId ?? '',
        parentId: menu.parentId ?? '',
    };
}

export function getSiteLabel(site: SiteOption): string {
    if ('name' in site && typeof site.name === 'string' && site.name.trim()) {
        return site.name;
    }

    return site.id;
}
