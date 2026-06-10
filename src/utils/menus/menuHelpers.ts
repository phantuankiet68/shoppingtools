import { MENU_TEMPLATES } from '@/constants/menus/menuConstants';

export function getMenuTemplate(type?: string | null, category?: string | null) {
    if (!type) return [];

    const typeTemplates = MENU_TEMPLATES[type as keyof typeof MENU_TEMPLATES];

    if (!typeTemplates) return [];

    return typeTemplates[category ?? ''] ?? [];
}
