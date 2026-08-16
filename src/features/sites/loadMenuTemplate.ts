import { getMenuTemplate } from '@/utils/menus/menuHelpers';

type LoadMenuTemplateInput = {
    type?: string;
    category?: string | null;
};

export function loadMenuTemplate({ type, category }: LoadMenuTemplateInput) {
    const menus = getMenuTemplate(type ?? '', category ?? null);

    return {
        type: type ?? null,
        category: category ?? null,
        menus,
    };
}
