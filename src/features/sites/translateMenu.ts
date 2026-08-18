import { MenuArea } from '@/generated/prisma';
import { resolveMenuValue } from '@/utils/menus/menuResolver';
import en from '@/lib/admin/i18n/messages/en';
import ja from '@/lib/admin/i18n/messages/ja';
import vi from '@/lib/admin/i18n/messages/vi';

const messagesMap = {
    vi,
    en,
    ja,
} as const;

export type SiteLocale = keyof typeof messagesMap;

export type TranslateMenuItem = {
    id: string;
    websiteType: string;
    categoryId: string;
    key: string;
    title: string;
    path: string | null;
    icon: string | null;
    area: MenuArea;
    sortOrder: number;
    visible: boolean;
};

type TranslateMenuInput = {
    menus: TranslateMenuItem[];
    locale: SiteLocale;
};

export function translateMenu({ menus, locale }: TranslateMenuInput) {
    const messages = messagesMap[locale];

    return menus.map((menu) => ({
        ...menu,
        title: resolveMenuValue(messages, menu.title),
        path: menu.path ? resolveMenuValue(messages, menu.path) : null,
    }));
}
