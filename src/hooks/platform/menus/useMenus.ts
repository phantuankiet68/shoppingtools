import type { SiteOption } from '@/components/platform/menus/modalAddMenus';
import {
    EMPTY_PAGINATION,
    EMPTY_SUMMARY,
    PAGE_SIZE,
} from '@/constants/platform/menus/menuConstants';
import type {
    AreaFilter,
    FilterMode,
    MenuRecord,
    PaginatedMenuResponse,
    PaginationState,
    SiteOptionsResponse,
    SortDirection,
    SortKey,
    SummaryState,
} from '@/features/platform/types/menus/menu';
import { useCallback, useRef, useState } from 'react';
export function useMenus() {
    const [menus, setMenus] = useState<MenuRecord[]>([]);
    const [siteOptions, setSiteOptions] = useState<SiteOption[]>([]);

    const [loadingMenus, setLoadingMenus] = useState(false);
    const [loadingSites, setLoadingSites] = useState(false);

    const [error, setError] = useState('');

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [statusFilter, setStatusFilter] = useState<FilterMode>('all');

    const [areaFilter, setAreaFilter] = useState<AreaFilter>('ALL');

    const [sortKey, setSortKey] = useState<SortKey>('title');

    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState<PaginationState>(EMPTY_PAGINATION);

    const [summary, setSummary] = useState<SummaryState>(EMPTY_SUMMARY);

    const menuAbortRef = useRef<AbortController | null>(null);

    const siteAbortRef = useRef<AbortController | null>(null);

    const activeMenuRequestIdRef = useRef(0);

    const fetchMenus = useCallback(async () => {
        const requestId = ++activeMenuRequestIdRef.current;

        menuAbortRef.current?.abort();

        const controller = new AbortController();
        menuAbortRef.current = controller;

        try {
            setLoadingMenus(true);
            setError('');

            const params = new URLSearchParams({
                systemRole: 'ADMIN',
                page: String(page),
                size: String(PAGE_SIZE),
                sortKey,
                sortDirection,
            });

            if (debouncedQuery) {
                params.set('q', debouncedQuery);
            }

            if (areaFilter !== 'ALL') {
                params.set('area', areaFilter);
            }

            if (statusFilter !== 'all') {
                params.set('enabled', statusFilter === 'enabled' ? 'true' : 'false');
            }

            const response = await fetch(`/api/platform/menus?${params.toString()}`, {
                cache: 'no-store',
                signal: controller.signal,
            });

            const contentType = response.headers.get('content-type') || '';

            const data: PaginatedMenuResponse | { message?: string } | null = contentType.includes(
                'application/json',
            )
                ? await response.json()
                : null;

            if (!response.ok) {
                throw new Error(
                    (data as { message?: string } | null)?.message || 'Failed to load menus',
                );
            }

            if (requestId !== activeMenuRequestIdRef.current) {
                return;
            }

            const normalized = data as PaginatedMenuResponse;

            setMenus(Array.isArray(normalized.items) ? normalized.items : []);

            setPagination(normalized.pagination ?? EMPTY_PAGINATION);

            setSummary(normalized.summary ?? EMPTY_SUMMARY);
        } catch (err) {
            if ((err as Error)?.name === 'AbortError') {
                return;
            }

            console.error(err);

            if (requestId !== activeMenuRequestIdRef.current) {
                return;
            }

            setMenus([]);
            setPagination(EMPTY_PAGINATION);
            setSummary(EMPTY_SUMMARY);

            setError(err instanceof Error ? err.message : 'Failed to load menus');
        } finally {
            if (requestId === activeMenuRequestIdRef.current) {
                setLoadingMenus(false);
            }
        }
    }, [page, debouncedQuery, statusFilter, areaFilter, sortKey, sortDirection]);

    const fetchSiteOptions = useCallback(async () => {
        siteAbortRef.current?.abort();

        const controller = new AbortController();

        siteAbortRef.current = controller;

        try {
            setLoadingSites(true);

            const response = await fetch('/api/platform/sites/options', {
                method: 'GET',
                credentials: 'same-origin',
                cache: 'no-store',
                signal: controller.signal,
            });

            const data = (await response.json().catch(() => null)) as SiteOptionsResponse | null;

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to load sites');
            }

            setSiteOptions(Array.isArray(data?.data) ? data.data : []);
        } catch (err) {
            if ((err as Error)?.name === 'AbortError') {
                return;
            }

            console.error(err);
        } finally {
            if (!controller.signal.aborted) {
                setLoadingSites(false);
            }
        }
    }, []);

    return {
        menus,
        setMenus,

        siteOptions,

        loadingMenus,
        loadingSites,
        setLoadingMenus,
        error,

        query,
        setQuery,

        statusFilter,
        setStatusFilter,

        areaFilter,
        setAreaFilter,

        sortKey,
        setSortKey,

        sortDirection,
        setSortDirection,

        page,
        setPage,

        pagination,
        setPagination,

        summary,
        setSummary,

        fetchMenus,
        fetchSiteOptions,
    };
}
