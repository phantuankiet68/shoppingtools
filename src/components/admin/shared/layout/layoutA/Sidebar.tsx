'use client';

import type { CSSProperties, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';

import styles from './Sidebar.module.css';

import { useAdminLayoutStore } from '@/store/layout/layouta/index';

import {
    SECTION_ORDER,
    SECTION_TITLES,
    bestMatchWithTrail,
    sectionOfTopItem,
    type Item,
    type SectionKey,
} from '@/utils/layout/menu.utils';

import type { MenuArea } from '@/generated/prisma';

type SectionBucket = {
    flats: Item[];
    groups: Item[];
};

type CloseTimerMap = Record<string, ReturnType<typeof setTimeout> | number | undefined>;

const DEFAULT_DASHBOARD: Item = {
    area: 'ADMIN',
    id: 'default-dashboard',
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'bi-house',
    path: '/admin/dashboard',
    parentId: null,
    children: [],
};

const DEFAULT_WEBSITE: Item = {
    area: 'ADMIN',
    id: 'default-website',
    key: 'website',
    title: 'Website',
    icon: 'bi-window-stack',
    path: null,
    parentId: null,
    children: [
        {
            area: 'ADMIN',
            id: 'default-sites',
            key: 'sites',
            title: 'Sites',
            icon: 'bi-globe2',
            path: '/admin/sites',
            parentId: 'default-website',
            children: [],
        },
        {
            area: 'ADMIN',
            id: 'default-menus',
            key: 'menus',
            title: 'Menus',
            icon: 'bi-list-ul',
            path: '/admin/menus',
            parentId: 'default-website',
            children: [],
        },
        {
            area: 'ADMIN',
            id: 'default-pages',
            key: 'pages',
            title: 'Pages',
            icon: 'bi-file-earmark-text',
            path: '/admin/pages',
            parentId: 'default-website',
            children: [],
        },
    ],
};

const DEFAULT_ADMIN_ITEMS: Item[] = [DEFAULT_DASHBOARD, DEFAULT_WEBSITE];

function isDashboard(item: Item) {
    return item.key === 'dashboard' || item.title.trim().toLowerCase() === 'dashboard';
}

function isWebsite(item: Item) {
    return item.key === 'website' || item.title.trim().toLowerCase() === 'website';
}

function createEmptySectionBuckets(): Record<SectionKey, SectionBucket> {
    return {
        overview: {
            flats: [],
            groups: [],
        },
        marketing: {
            flats: [],
            groups: [],
        },
        content: {
            flats: [],
            groups: [],
        },
        account: {
            flats: [],
            groups: [],
        },
    };
}

function positionFlyout(groupEl: HTMLElement, flyEl: HTMLElement) {
    const groupRect = groupEl.getBoundingClientRect();
    const flyRect = flyEl.getBoundingClientRect();

    const viewportHeight = window.innerHeight;
    const margin = 12;

    const centerY = groupRect.top + groupRect.height / 2;

    let top = centerY - flyRect.height / 2;

    if (top < margin) {
        top = margin;
    }

    if (top + flyRect.height > viewportHeight - margin) {
        top = Math.max(margin, viewportHeight - margin - flyRect.height);
    }

    flyEl.style.top = `${top}px`;
    flyEl.style.left = `${groupRect.right + 12}px`;
}

type MenuNodeProps = {
    item: Item;
    depth: number;
    collapsed: boolean;
    activeKey: string;
    openGroups: Record<string, boolean>;
    onItemClick: (item: Item) => void;
    onToggleGroup: (item: Item, depth: number) => void;
};

function MenuNode({
    item,
    depth,
    collapsed,
    activeKey,
    openGroups,
    onItemClick,
    onToggleGroup,
}: MenuNodeProps) {
    const children = item.children ?? [];
    const hasChildren = children.length > 0;

    const isOpen = Boolean(openGroups[item.key]);

    const isActive = activeKey === item.key;

    const icon = item.icon || 'bi bi-dot';

    if (!hasChildren) {
        return (
            <Link
                href={item.path ?? '#'}
                className={
                    depth === 0
                        ? `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                        : `${styles.subItem} ${isActive ? styles.subItemActive : ''}`
                }
                title={collapsed ? item.title : undefined}
                aria-label={item.title}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                    if (!item.path || item.path === '#') {
                        event.preventDefault();
                    }

                    onItemClick(item);
                }}
            >
                <span className={styles.navIcon}>
                    <i className={icon} />
                </span>

                {!collapsed && (
                    <span className={depth === 0 ? styles.navLabel : styles.subLabel}>
                        {item.title}
                    </span>
                )}
            </Link>
        );
    }

    return (
        <div className={depth === 0 ? styles.navGroup : styles.subGroup}>
            <button
                type="button"
                className={`${styles.navItem} ${
                    depth === 0 ? styles.navGroupButton : styles.subItem
                } ${isActive ? styles.navItemActive : ''} ${isOpen ? styles.navGroupOpen : ''}`}
                aria-expanded={isOpen}
                aria-label={item.title}
                title={collapsed ? item.title : undefined}
                onClick={() => onToggleGroup(item, depth)}
            >
                <span className={styles.navIcon}>
                    <i className={icon} />
                </span>

                {!collapsed && (
                    <span className={depth === 0 ? styles.navLabel : styles.subLabel}>
                        {item.title}
                    </span>
                )}

                {!collapsed && (
                    <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                        <i className="bi bi-chevron-down" />
                    </span>
                )}
            </button>

            {!collapsed && isOpen && (
                <div className={styles.submenu}>
                    <div className={styles.submenuLine}>
                        {children.map((child) => (
                            <MenuNode
                                key={child.key}
                                item={child}
                                depth={depth + 1}
                                collapsed={false}
                                activeKey={activeKey}
                                openGroups={openGroups}
                                onItemClick={onItemClick}
                                onToggleGroup={onToggleGroup}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ navRef }: { navRef: RefObject<HTMLDivElement | null> }) {
    const pathname = usePathname();

    const {
        sidebarOpen,
        setSidebarOpen,
        collapsed,
        items,
        openGroups,
        activeKey,
        setActiveKey,
        toggleGroupExclusive,
        openGroupExclusive,
    } = useAdminLayoutStore();

    const asideRef = useRef<HTMLElement | null>(null);

    const closeTimersRef = useRef<CloseTimerMap>({});

    const currentArea: MenuArea = pathname.startsWith('/platform') ? 'PLATFORM' : 'ADMIN';

    const sidebarItems = useMemo(() => {
        const areaItems = items.filter((item) => item.area === currentArea);

        if (currentArea === 'PLATFORM') {
            return areaItems;
        }

        if (areaItems.length === 0) {
            return DEFAULT_ADMIN_ITEMS;
        }

        const result = [...areaItems];

        if (!result.some(isDashboard)) {
            result.unshift(DEFAULT_DASHBOARD);
        }

        if (!result.some(isWebsite)) {
            result.push(DEFAULT_WEBSITE);
        }

        return result;
    }, [items, currentArea]);

    const websiteInitializedRef = useRef(false);

    useEffect(() => {
        if (currentArea !== 'ADMIN') {
            return;
        }

        if (websiteInitializedRef.current) {
            return;
        }

        const website = sidebarItems.find(isWebsite);

        if (!website) {
            return;
        }

        websiteInitializedRef.current = true;

        useAdminLayoutStore.setState((state) => ({
            openGroups: {
                ...state.openGroups,
                [website.key]: true,
            },
        }));
    }, [currentArea, sidebarItems]);

    useEffect(() => {
        if (!pathname) {
            return;
        }

        if (sidebarItems.length === 0) {
            return;
        }

        const result = bestMatchWithTrail(sidebarItems, pathname);

        if (!result) {
            return;
        }

        setActiveKey(result.hit.key);

        if (result.trail.length === 0) {
            return;
        }

        useAdminLayoutStore.setState((state) => {
            const nextOpenGroups = {
                ...state.openGroups,
            };

            for (const key of result.trail) {
                nextOpenGroups[key] = true;
            }

            return {
                openGroups: nextOpenGroups,
            };
        });
    }, [pathname, sidebarItems, setActiveKey]);
    /* =====================================================
       SECTION BUCKETS
       ===================================================== */

    const sectionBuckets = useMemo(() => {
        const buckets = createEmptySectionBuckets();

        for (const item of sidebarItems) {
            let sectionKey: SectionKey;

            /*
             * Dashboard → Overview
             */
            if (isDashboard(item)) {
                sectionKey = 'overview';
            } else if (isWebsite(item)) {
                /*
                 * Website → Overview
                 *
                 * Để Website nằm ngay dưới Dashboard.
                 */
                sectionKey = 'overview';
            } else {
                /*
                 * Các menu còn lại dùng
                 * logic section hiện tại.
                 */
                sectionKey = sectionOfTopItem(item.title);
            }

            if ((item.children ?? []).length > 0) {
                buckets[sectionKey].groups.push(item);
            } else {
                buckets[sectionKey].flats.push(item);
            }
        }

        return buckets;
    }, [sidebarItems]);

    /* =====================================================
       COLLAPSED RAIL
       ===================================================== */

    const railStyle = useMemo<CSSProperties | undefined>(
        () =>
            collapsed
                ? {
                      width: 84,
                  }
                : undefined,
        [collapsed],
    );

    /* =====================================================
       CLOSE TIMER
       ===================================================== */

    const clearCloseTimer = (key: string) => {
        const timer = closeTimersRef.current[key];

        if (!timer) {
            return;
        }

        window.clearTimeout(timer);

        closeTimersRef.current[key] = undefined;
    };

    const clearAllCloseTimers = () => {
        Object.values(closeTimersRef.current).forEach((timer) => {
            if (timer) {
                window.clearTimeout(timer);
            }
        });

        closeTimersRef.current = {};
    };

    /* =====================================================
       MOBILE
       ===================================================== */

    const closeSidebarIfMobile = () => {
        if (typeof window === 'undefined') {
            return;
        }

        if (window.matchMedia('(max-width: 900px)').matches) {
            setSidebarOpen(false);
        }
    };

    /* =====================================================
       ITEM CLICK
       ===================================================== */

    const handleItemClick = (item: Item) => {
        setActiveKey(item.key);
        closeSidebarIfMobile();
    };

    /* =====================================================
       GROUP TOGGLE
       ===================================================== */

    const handleToggleGroup = (item: Item, depth: number) => {
        if (depth === 0) {
            toggleGroupExclusive(item.key);
            return;
        }

        useAdminLayoutStore.setState((state) => ({
            openGroups: {
                ...state.openGroups,
                [item.key]: !state.openGroups[item.key],
            },
        }));
    };

    /* =====================================================
       COLLAPSED FLYOUT CLOSE
       ===================================================== */

    const scheduleCloseGroup = (key: string, delay = 220) => {
        clearCloseTimer(key);

        closeTimersRef.current[key] = window.setTimeout(() => {
            useAdminLayoutStore.setState((state) => ({
                openGroups: {
                    ...state.openGroups,
                    [key]: false,
                },
            }));

            closeTimersRef.current[key] = undefined;
        }, delay);
    };

    /* =====================================================
       COLLAPSED FLYOUT OPEN
       ===================================================== */

    const handleGroupMouseEnter = (groupKey: string, event: ReactMouseEvent<HTMLDivElement>) => {
        if (!collapsed) {
            return;
        }

        clearCloseTimer(groupKey);

        openGroupExclusive(groupKey);

        const groupElement = event.currentTarget;

        const flyoutElement = groupElement.querySelector<HTMLElement>(
            `[data-flyout="${groupKey}"]`,
        );

        if (!flyoutElement) {
            return;
        }

        requestAnimationFrame(() => {
            positionFlyout(groupElement, flyoutElement);
        });
    };

    const handleGroupMouseLeave = (groupKey: string) => {
        if (!collapsed) {
            return;
        }

        scheduleCloseGroup(groupKey);
    };

    /* =====================================================
       CLEANUP
       ===================================================== */

    useEffect(() => {
        return () => {
            clearAllCloseTimers();
        };
    }, []);

    /* =====================================================
       CLOSE FLYOUT WHEN CLICK OUTSIDE
       ===================================================== */

    useEffect(() => {
        if (!collapsed) {
            return;
        }

        const handleDocumentClick = (event: MouseEvent) => {
            const root = asideRef.current;

            if (!root) {
                return;
            }

            if (root.contains(event.target as Node)) {
                return;
            }

            useAdminLayoutStore.setState({
                openGroups: {},
            });
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [collapsed]);

    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <>
            {/* =================================================
                MOBILE BACKDROP
               ================================================= */}

            {sidebarOpen && (
                <button
                    type="button"
                    className={styles.backdrop}
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                ref={(element) => {
                    asideRef.current = element;
                }}
                className={styles.sidebar}
                data-collapsed={collapsed ? 'true' : 'false'}
                style={railStyle}
                aria-label="Sidebar"
            >
                <div className={styles.sidebarPanel}>
                    {/* =================================================
                        BRAND
                       ================================================= */}

                    <div className={styles.brandWrap}>
                        <Link href="/admin" className={styles.brandLink}>
                            <div className={styles.brandLogo}>
                                <span className={styles.brandLogoText}>A</span>
                            </div>

                            {!collapsed && (
                                <div className={styles.brandText}>
                                    <div className={styles.brandName}>Manager</div>

                                    <div className={styles.brandSub}>
                                        <i className="bi bi-shield-check" />
                                        <span>Dashboard Panel</span>
                                    </div>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* =================================================
                        NAVIGATION
                       ================================================= */}

                    <nav ref={navRef} className={styles.nav}>
                        {SECTION_ORDER.map((sectionKey) => {
                            const bucket = sectionBuckets[sectionKey];

                            const hasItems = bucket.flats.length + bucket.groups.length > 0;

                            if (!hasItems) {
                                return null;
                            }

                            return (
                                <section key={sectionKey} className={styles.section}>
                                    {!collapsed && (
                                        <div className={styles.sectionHeader}>
                                            <span>{SECTION_TITLES[sectionKey]}</span>
                                        </div>
                                    )}

                                    <div className={styles.sectionList}>
                                        {/* =================================================
                                                FLAT ITEMS
                                               ================================================= */}

                                        {bucket.flats.map((item) => (
                                            <MenuNode
                                                key={item.key}
                                                item={item}
                                                depth={0}
                                                collapsed={collapsed}
                                                activeKey={activeKey}
                                                openGroups={openGroups}
                                                onItemClick={handleItemClick}
                                                onToggleGroup={handleToggleGroup}
                                            />
                                        ))}

                                        {/* =================================================
                                                GROUP ITEMS
                                               ================================================= */}

                                        {bucket.groups.map((group) => {
                                            const isOpen = Boolean(openGroups[group.key]);

                                            return (
                                                <div
                                                    key={group.key}
                                                    className={styles.navGroup}
                                                    onMouseEnter={(event) =>
                                                        handleGroupMouseEnter(group.key, event)
                                                    }
                                                    onMouseLeave={() =>
                                                        handleGroupMouseLeave(group.key)
                                                    }
                                                >
                                                    <MenuNode
                                                        item={group}
                                                        depth={0}
                                                        collapsed={collapsed}
                                                        activeKey={activeKey}
                                                        openGroups={openGroups}
                                                        onItemClick={handleItemClick}
                                                        onToggleGroup={handleToggleGroup}
                                                    />

                                                    {/* =================================================
                                                                COLLAPSED FLYOUT
                                                               ================================================= */}

                                                    {collapsed && isOpen && (
                                                        <div
                                                            data-flyout={group.key}
                                                            className={styles.flyout}
                                                        >
                                                            <div className={styles.flyoutHeader}>
                                                                <span className={styles.flyoutIcon}>
                                                                    <i
                                                                        className={
                                                                            group.icon ||
                                                                            'bi bi-folder'
                                                                        }
                                                                    />
                                                                </span>

                                                                <span>{group.title}</span>
                                                            </div>

                                                            <div className={styles.flyoutList}>
                                                                {(group.children ?? []).map(
                                                                    (child) => (
                                                                        <MenuNode
                                                                            key={child.key}
                                                                            item={child}
                                                                            depth={1}
                                                                            collapsed={false}
                                                                            activeKey={activeKey}
                                                                            openGroups={openGroups}
                                                                            onItemClick={
                                                                                handleItemClick
                                                                            }
                                                                            onToggleGroup={
                                                                                handleToggleGroup
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {sectionKey !== 'account' && (
                                        <div className={styles.sectionDivider} />
                                    )}
                                </section>
                            );
                        })}
                    </nav>

                    {/* =================================================
                        USER
                       ================================================= */}

                    {!collapsed && (
                        <div className={styles.userArea}>
                            <div className={styles.userAvatar}>N</div>

                            <div className={styles.userInfo}>
                                <strong>Nguyễn Văn A</strong>

                                <span>Administrator</span>
                            </div>

                            <button
                                type="button"
                                className={styles.userMore}
                                aria-label="More options"
                            >
                                <i className="bi bi-three-dots" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
