'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SiteAction } from '@/features/platform/types/sites/site-action';
import SiteFilters from './site-filters';
import SiteGrid from './site-grid';
import { SiteService } from '@/services/platform/sites/index.service';
import type { SiteItem } from '@/features/platform/types/sites/site';

import styles from '@/styles/platform/sites/site-manager.module.css';

export interface SiteFilterState {
    search: string;
    type: string;
    status: string;
    subscription: string;
    provider: string;
}

const DEFAULT_FILTERS: SiteFilterState = {
    search: '',
    type: '',
    status: '',
    subscription: '',
    provider: '',
};

const PAGE_SIZE = 12;

export default function SiteManager() {
    const [filters, setFilters] = useState<SiteFilterState>(DEFAULT_FILTERS);
    const [sites, setSites] = useState<SiteItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const hasSelection = useMemo(() => selectedIds.length > 0, [selectedIds]);

    const allSelected = sites.length > 0 && selectedIds.length === sites.length;

    const loadSites = useCallback(async () => {
        try {
            setLoading(true);

            const response = await SiteService.list({
                page,
                limit: PAGE_SIZE,
                search: filters.search,
                type: filters.type,
                status: filters.status,
                subscription: filters.subscription,
                provider: filters.provider,
            });

            setSites(response.data);
            setTotal(response.pagination.total);
            setSelectedIds([]);
        } catch (error) {
            console.error('Failed to load sites:', error);
            setSites([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        loadSites();
    }, [loadSites]);

    const updateFilter = (key: keyof SiteFilterState, value: string) => {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));

        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setPage(1);
    };

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(sites.map((site) => site.id));
    };

    const handleSelectedChange = (id: string, checked: boolean) => {
        setSelectedIds((current) => {
            if (checked) {
                return current.includes(id) ? current : [...current, id];
            }

            return current.filter((item) => item !== id);
        });
    };

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
            return;
        }

        setPage(nextPage);
        setSelectedIds([]);
    };

    const handleBulkAction = async (action: 'publish' | 'suspend' | 'archive' | 'delete') => {
        if (!selectedIds.length) return;

        console.log('Bulk action:', action, selectedIds);

        // Bulk API sẽ xử lý ở bước tiếp theo.
    };
    const handleSiteAction = async (action: SiteAction, site: SiteItem) => {
        try {
            switch (action) {
                case 'view':
                    console.log(site.id);
                    return;

                case 'publish':
                    await SiteService.publish(site.id);
                    break;

                case 'unpublish':
                    await SiteService.unpublish(site.id);
                    break;

                case 'deploy':
                    await SiteService.deploy(site.id);
                    break;

                case 'ssl':
                    await SiteService.provisionSsl(site.id);
                    break;
            }

            await loadSites();

            await loadSites();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className={styles.wrapper}>
            <SiteFilters
                filters={filters}
                total={total}
                selectedCount={selectedIds.length}
                allSelected={allSelected}
                hasSelection={hasSelection}
                page={page}
                totalPages={totalPages}
                onFilterChange={updateFilter}
                onReset={handleResetFilters}
                onSelectAll={handleSelectAll}
                onBulkAction={handleBulkAction}
                onPageChange={handlePageChange}
            />

            <SiteGrid
                loading={loading}
                sites={sites}
                selectedIds={selectedIds}
                onSelectedChange={handleSelectedChange}
                onAction={handleSiteAction}
            />
        </section>
    );
}
