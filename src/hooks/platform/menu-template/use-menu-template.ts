'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    getMenuTemplates,
    MenuTemplate,
    MenuTemplateCategory,
    MenuTemplateQuery,
} from '@/services/platform/menu-template/index.service';

interface UseMenuTemplateResult {
    loading: boolean;
    error: string | null;
    menus: MenuTemplate[];
    categories: MenuTemplateCategory[];
    setMenus: React.Dispatch<React.SetStateAction<MenuTemplate[]>>;
    refresh: () => Promise<void>;
}

export function useMenuTemplate(query: MenuTemplateQuery): UseMenuTemplateResult {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [menus, setMenus] = useState<MenuTemplate[]>([]);
    const [categories, setCategories] = useState<MenuTemplateCategory[]>([]);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getMenuTemplates(query);
            setMenus(response.data ?? []);
            setCategories(response.categories ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load menu templates.');
            setMenus([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [
        query.search,
        query.websiteType,
        query.categoryId,
        query.area,
        query.visible,
        query.sortBy,
        query.sortOrder,
    ]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return {
        loading,
        error,
        menus,
        categories,
        setMenus,
        refresh,
    };
}
