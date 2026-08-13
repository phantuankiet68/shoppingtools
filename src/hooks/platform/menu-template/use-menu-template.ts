'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    getMenuTemplates,
    MenuTemplate,
    MenuTemplateCategory,
    MenuTemplateQuery,
    Pagination,
} from '@/services/platform/menu-template/index.service';

interface UseMenuTemplateResult {
    loading: boolean;
    error: string | null;
    menus: MenuTemplate[];
    categories: MenuTemplateCategory[];
    setMenus: React.Dispatch<React.SetStateAction<MenuTemplate[]>>;
    pagination: Pagination | null;
    refresh: () => Promise<void>;
}

export function useMenuTemplate(query: MenuTemplateQuery): UseMenuTemplateResult {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [menus, setMenus] = useState<MenuTemplate[]>([]);
    const [categories, setCategories] = useState<MenuTemplateCategory[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getMenuTemplates(query);

            setMenus(response.data);
            setCategories(response.categories);
            setPagination(response.pagination);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to load menu templates.');
            }
        } finally {
            setLoading(false);
        }
    }, [
        query.page,
        query.limit,
        query.search,
        query.websiteType,
        query.categoryId,
        query.area,
        query.visible,
        query.sortBy,
        query.sortOrder,
    ]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        loading,
        error,
        menus,
        categories,
        setMenus,
        pagination,
        refresh,
    };
}
