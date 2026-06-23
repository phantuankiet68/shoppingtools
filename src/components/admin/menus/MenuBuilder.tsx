'use client';

import AllowedBlocks from '@/components/admin/menus/state/AllowedBlocks';
import MenuStructure from '@/components/admin/menus/state/MenuStructure';
import { useMenuStore, type SiteKind } from '@/components/admin/menus/state/useMenuStore';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';
import { usePageFunctionKeys } from '@/components/admin/shared/hooks/usePageFunctionKeys';
import { flattenTriples } from '@/lib/menu/deriveTitleSlugPath';
import { syncPagesFromMenu } from '@/services/menus/menuBuilder.service';
import { useMenuBuilderUIStore } from '@/store/menus/useMenuBuilderUIStore';
import styles from '@/styles/admin/menus/menu.module.css';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function MenuBuilder() {
    const modal = useModal();
    const { t } = useAdminI18n();
    const { currentSite, sites, currentWorkspace } = useAdminAuth();
    const [q, setQ] = useState('');

    const {
        currentSet,
        setCurrentSet,
        activeMenu,
        setActiveMenu,
        loadFromServer,
        saveToServer,
        siteKind,
        setSiteKind,
        INTERNAL_PAGES,
        addBlankItem,
        generateMenusBySiteKind,
    } = useMenuStore();

    const { saving, loading, refreshing, setSaving, setLoading } = useMenuBuilderUIStore();

    const [selectedSiteId, setSelectedSiteId] = useState(currentSite?.id ?? '');
    const workspacePolicy = (currentWorkspace as any)?.accessPolicy;
    const maxMenus = workspacePolicy?.maxMenus ?? Number.MAX_SAFE_INTEGER;
    const countMenus = useCallback((items: any[]): number => {
        if (!Array.isArray(items)) {
            return 0;
        }
        return items.reduce((total, item) => {
            const childCount = item?.children?.length > 0 ? countMenus(item.children) : 0;
            return total + 1 + childCount;
        }, 0);
    }, []);

    const currentMenuCount = useMemo(() => {
        return countMenus(activeMenu || []);
    }, [activeMenu, countMenus]);

    const remainingMenus = Math.max(maxMenus - currentMenuCount, 0);
    const isMenuLimitReached = currentMenuCount >= maxMenus;

    const selectedSite = useMemo(() => {
        return sites.find((s) => s.id === selectedSiteId);
    }, [sites, selectedSiteId]);

    useEffect(() => {
        if (!selectedSiteId) {
            return;
        }

        void loadFromServer(currentSet, selectedSiteId, maxMenus);
    }, [selectedSiteId, currentSet]);

    useEffect(() => {
        if (!selectedSite?.type) return;
        setSiteKind(selectedSite.type as SiteKind);
    }, [selectedSite?.type, setSiteKind]);

    useEffect(() => {
        if (currentSite?.id && currentSite.id !== selectedSiteId) {
            setSelectedSiteId(currentSite.id);
            return;
        }

        if (sites.length > 0 && !sites.some((s) => s.id === selectedSiteId)) {
            setSelectedSiteId(sites[0].id);
        }
    }, [currentSite?.id, selectedSiteId, sites]);

    const handleAddMenu = useCallback(() => {
        if (currentMenuCount >= maxMenus) {
            modal.error(`Maximum menu limit is ${maxMenus}`);
            return;
        }
        addBlankItem();
    }, [currentMenuCount, maxMenus, modal, addBlankItem]);

    const handleAutoCreateMenu = useCallback(() => {
        if (currentMenuCount >= maxMenus) {
            modal.error(`Maximum menu limit is ${maxMenus}`);
            return;
        }
        generateMenusBySiteKind(siteKind, maxMenus);
        setCurrentSet('home');
    }, [currentMenuCount, maxMenus, modal, generateMenusBySiteKind, siteKind, setCurrentSet]);

    const handleSaveAll = useCallback(async () => {
        if (!selectedSiteId) return;
        try {
            setSaving(true);
            const totalMenus = countMenus(activeMenu || []);
            if (totalMenus > maxMenus) {
                modal.error(
                    `Maximum menu limit is ${maxMenus}. Please remove ${totalMenus - maxMenus} menu(s).`,
                );
                return;
            }
            const safeMenus = (activeMenu || []).slice(0, maxMenus);
            setActiveMenu(safeMenus);
            await saveToServer(currentSet, selectedSiteId, maxMenus);
            const triples = flattenTriples(safeMenus, INTERNAL_PAGES);
            if (triples.length > 0) {
                await syncPagesFromMenu({
                    siteId: selectedSiteId,
                    items: triples,
                });
            }
            await loadFromServer(currentSet, selectedSiteId, maxMenus);
            modal.success('Menu saved successfully');
        } catch (e) {
            console.error(e);

            modal.error((e as Error).message);
        } finally {
            setSaving(false);
        }
    }, [
        selectedSiteId,
        currentSet,
        activeMenu,
        INTERNAL_PAGES,
        saveToServer,
        loadFromServer,
        setSaving,
        setActiveMenu,
        modal,
        countMenus,
        maxMenus,
    ]);

    const pageFunctionKeys = useMemo(
        () => ({
            F5: () => handleAddMenu(),
            F10: () => handleSaveAll(),
        }),
        [handleAddMenu, handleSaveAll],
    );
    usePageFunctionKeys(pageFunctionKeys);

    return (
        <div className={styles.container}>
            <header className={styles.topbar}>
                <div className={styles.topbarRight}>
                    <div className={styles.inline}>
                        <i className="bi bi-globe2" />
                        <select
                            className={`${styles.formSelectSm} ${styles.selectStyled}`}
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(e.target.value)}
                            disabled={sites.length === 0}
                        >
                            {sites.length === 0 ? (
                                <option value="">No site available</option>
                            ) : (
                                sites.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name || s.domain}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className={styles.inline}>
                        <i className="bi bi-layers" />
                        <button
                            className={`${styles.btn} ${styles.btnOutlineSecondary}`}
                            onClick={handleAutoCreateMenu}
                        >
                            ⚡ {t('menus.actions.autoGenerate')}
                        </button>
                        <div
                            className={styles.inlineLimit}
                            style={{
                                color: isMenuLimitReached ? '#dc2626' : '#188be3ff',
                            }}
                        >
                            <i className="bi bi-diagram-3" />
                            <span>
                                Menus: {currentMenuCount}/{maxMenus}
                            </span>
                            {!isMenuLimitReached && (
                                <small className={styles.inlineSmall}>
                                    Remaining: {remainingMenus}
                                </small>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.topbarRight}>
                    <div className={styles.searchWrap}>
                        <i className={`bi bi-search ${styles.searchIcon}`} />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={t('menus.search.placeholder')}
                            className={styles.searchInput}
                        />
                    </div>

                    <button
                        className={`${styles.btn} ${styles.btnOutlineSuccess}`}
                        onClick={handleAddMenu}
                        disabled={isMenuLimitReached}
                    >
                        <i className="bi bi-plus"></i>
                        {t('menus.actions.addNewItem')}
                    </button>

                    <button
                        className={`${styles.btn} ${styles.btnOutlinePrimary}`}
                        onClick={handleSaveAll}
                        disabled={currentMenuCount > maxMenus}
                    >
                        <i className="bi bi-save"></i>
                        {t('menus.actions.saveChanges')}
                    </button>
                    {saving && <span>Saving...</span>}
                    {(loading || refreshing) && <span>Loading...</span>}
                </div>
            </header>
            <div className={styles.grid}>
                <div className={styles.leftCol}>
                    <AllowedBlocks />
                </div>
                <div className={styles.rightCol}>
                    <MenuStructure q={q} setQ={setQ} />
                </div>
            </div>
        </div>
    );
}
