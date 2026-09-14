'use client';

import { useCallback, useMemo } from 'react';
import styles from '@/styles/admin/menus/menu.module.css';

import { useMenuStore } from '@/components/admin/menus/state/useMenuStore';
import { useAllowedBlocksStore } from '@/store/menus/useAllowedBlocksStore';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';

import { forcedTabFromSet, pickBaseNames } from '@/services/menus/allowedBlocks.service';

import { useModal } from '@/components/admin/shared/common/modal';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';

type TabKey = 'home' | 'dashboard';

function countMenus(items: any[]): number {
    if (!Array.isArray(items)) return 0;

    return items.reduce((total, item) => {
        const childCount = item?.children?.length > 0 ? countMenus(item.children) : 0;

        return total + 1 + childCount;
    }, 0);
}

export default function AllowedBlocks() {
    const modal = useModal();

    const { t, locale } = useAdminI18n();
    const { currentWorkspace } = useAdminAuth();

    const workspacePolicy = (currentWorkspace as any)?.accessPolicy;
    const maxMenus = workspacePolicy?.maxMenus ?? Number.MAX_SAFE_INTEGER;

    const { TEMPLATE_ALLOWED, templateKey, activeMenu, setActiveMenu, INTERNAL_PAGES, currentSet } =
        useMenuStore();

    const { addByName, onDragStart } = useAllowedBlocksStore();

    const currentLocale = (locale ?? 'en') as 'en' | 'vi' | 'ja';

    const tpl = TEMPLATE_ALLOWED[templateKey];

    const forcedTab: TabKey = forcedTabFromSet(currentSet);

    const menuItems = activeMenu || [];

    const baseKeys = useMemo(() => pickBaseNames(tpl, forcedTab), [tpl, forcedTab]);

    const baseNames = useMemo(
        () =>
            baseKeys.map((key) => {
                const page = INTERNAL_PAGES.find((p) => p.id === key);

                return page?.labelKey ? t(page.labelKey) : key;
            }),
        [baseKeys, INTERNAL_PAGES, t],
    );

    const currentMenuCount = useMemo(() => countMenus(menuItems), [menuItems]);

    const isLimitReached = currentMenuCount >= maxMenus;

    const handleAddName = useCallback(
        (name: string) => {
            try {
                const currentMenus = activeMenu || [];
                const latestMenuCount = countMenus(currentMenus);

                if (latestMenuCount >= maxMenus) {
                    modal.error(`Maximum menu limit is ${maxMenus}`);
                    return;
                }

                addByName({
                    name,
                    activeMenu: currentMenus,
                    setActiveMenu,
                    internalPages: INTERNAL_PAGES,
                    locale: currentLocale,
                    t,
                });
            } catch (e: unknown) {
                modal.error(
                    t('menus.allowedBlocks.addErrorTitle'),
                    (e as Error)?.message || t('menus.allowedBlocks.addErrorMessage'),
                );
            }
        },
        [activeMenu, maxMenus, addByName, setActiveMenu, INTERNAL_PAGES, currentLocale, t, modal],
    );

    return (
        <div className={styles.cardform}>
            <div className={styles.blocksGrid}>
                {baseNames.map((name) => (
                    <div key={name} className={styles.blockCell}>
                        <div
                            className={`${styles.blockCard} ${styles.appCard}`}
                            draggable={!isLimitReached}
                            onDragStart={(e) =>
                                onDragStart(e, {
                                    name,
                                    internalPages: INTERNAL_PAGES,
                                    locale: currentLocale,
                                    t,
                                })
                            }
                            onClick={() => handleAddName(name)}
                            title={t('menus.allowedBlocks.baseBlockTooltip')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleAddName(name);
                                }
                            }}
                        >
                            <div className={styles.blockIconWrap}>
                                <i className="bi bi-cursor" />
                            </div>

                            <div>
                                <div className={styles.blockTitle}>{name}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.divider} />
        </div>
    );
}
