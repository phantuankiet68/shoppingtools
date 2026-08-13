'use client';

import { useCallback, useEffect, useState } from 'react';

import ApiHealthToolbar from '@/components/platform/api-health/api-health-toolbar';
import ApiHealthList from '@/components/platform/api-health/api-health-list';
import ApiHealthDetail from '@/components/platform/api-health/api-health-detail';
import ApiHealthCreateModal from '@/components/platform/api-health/api-health-create-modal';

import type { ApiHealthSearchFilters } from '@/components/platform/api-health/api-health-search';
import type {
    ApiHealthDetailResponse,
    ApiHealthEndpoint,
} from '@/services/platform/api-health/index.service';

import {
    getApiHealth,
    getApiHealthList,
    testAllApiHealth,
} from '@/services/platform/api-health/index.service';

import styles from '@/styles/platform/api-health/api-health-manager.module.css';

export default function ApiHealthManager() {
    const [items, setItems] = useState<ApiHealthEndpoint[]>([]);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [detail, setDetail] = useState<ApiHealthDetailResponse | null>(null);

    const [filters, setFilters] = useState<ApiHealthSearchFilters>({
        q: '',
    });

    const [createOpen, setCreateOpen] = useState(false);

    const [summary, setSummary] = useState({
        total: 0,
        healthy: 0,
        failed: 0,
        timeout: 0,
    });

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [checkingAll, setCheckingAll] = useState(false);

    const [error, setError] = useState<string | null>(null);

    /*
     * Load API health list
     */
    const loadList = useCallback(async (nextFilters: ApiHealthSearchFilters = { q: '' }) => {
        try {
            setLoading(true);
            setError(null);

            const data = await getApiHealthList({
                q: nextFilters.q.trim() || undefined,
                method: nextFilters.method,
                status: nextFilters.status,
                category: nextFilters.category,
                page: 1,
                pageSize: 8,
            });

            setItems(data.items);

            const healthy = data.items.filter((item) => item.lastStatus === 'SUCCESS').length;

            const failed = data.items.filter((item) => item.lastStatus === 'FAILED').length;

            const timeout = data.items.filter((item) => item.lastStatus === 'TIMEOUT').length;

            setSummary({
                total: data.total,
                healthy,
                failed,
                timeout,
            });

            setSelectedId((currentId) => {
                if (currentId && data.items.some((item) => item.id === currentId)) {
                    return currentId;
                }

                return data.items[0]?.id ?? null;
            });
        } catch (error) {
            setError(
                error instanceof Error ? error.message : 'Failed to load API health endpoints.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    /*
     * Load selected API detail
     */
    const loadDetail = useCallback(async (id: string) => {
        try {
            setDetailLoading(true);
            setError(null);

            const data = await getApiHealth(id);

            setDetail(data);
        } catch (error) {
            setDetail(null);

            setError(error instanceof Error ? error.message : 'Failed to load API health details.');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    /*
     * Initial load
     */
    useEffect(() => {
        loadList({
            q: '',
        });
    }, [loadList]);

    /*
     * Load detail whenever selected API changes
     */
    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }

        loadDetail(selectedId);
    }, [selectedId, loadDetail]);

    /*
     * Search / filter
     */
    const handleSearch = useCallback(
        (nextFilters: ApiHealthSearchFilters) => {
            setFilters(nextFilters);
            loadList(nextFilters);
        },
        [loadList],
    );

    /*
     * Select API
     */
    const handleSelect = useCallback((id: string) => {
        setSelectedId(id);
    }, []);

    /*
     * Open create modal
     */
    const handleCreate = useCallback(() => {
        setCreateOpen(true);
    }, []);

    /*
     * Check all APIs
     */
    const handleCheckAll = useCallback(async () => {
        if (checkingAll) {
            return;
        }

        try {
            setCheckingAll(true);
            setError(null);

            await testAllApiHealth();

            /*
             * Reload list after all API tests finish.
             * This updates status, response time and checked time.
             */
            await loadList(filters);

            /*
             * Reload currently selected API detail.
             */
            if (selectedId) {
                await loadDetail(selectedId);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to check all APIs.');
        } finally {
            setCheckingAll(false);
        }
    }, [checkingAll, filters, selectedId, loadList, loadDetail]);

    /*
     * Refresh current list + detail
     */
    const handleRefresh = useCallback(async () => {
        await loadList(filters);

        if (selectedId) {
            await loadDetail(selectedId);
        }
    }, [loadList, loadDetail, filters, selectedId]);

    /*
     * Retry loading
     */
    const handleRetry = useCallback(() => {
        loadList(filters);
    }, [loadList, filters]);

    return (
        <section className={styles.wrapper}>
            <ApiHealthToolbar
                checkingAll={checkingAll}
                summary={summary}
                onCreate={handleCreate}
                onCheckAll={handleCheckAll}
            />

            {error && (
                <div className={styles.error}>
                    <i className="bi bi-exclamation-circle" />

                    <span>{error}</span>

                    <button type="button" onClick={handleRetry}>
                        Retry
                    </button>
                </div>
            )}

            <div className={styles.content}>
                <div className={styles.list}>
                    <ApiHealthList
                        items={items}
                        selectedId={selectedId}
                        loading={loading}
                        filters={filters}
                        onSearch={handleSearch}
                        onSelect={handleSelect}
                    />
                </div>

                <aside className={styles.detail}>
                    <ApiHealthDetail
                        data={detail}
                        loading={detailLoading}
                        onRefresh={handleRefresh}
                    />
                </aside>
            </div>

            <ApiHealthCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={async (item) => {
                    await loadList(filters);

                    setSelectedId(item.id);
                }}
            />
        </section>
    );
}
