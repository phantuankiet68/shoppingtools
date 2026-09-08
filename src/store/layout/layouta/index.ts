'use client';

import type { AdminUser } from '@/services/layout/auth.service';
import { adminAuthService } from '@/services/layout/auth.service';
import { adminMenuService, platformMenuService } from '@/services/layout/menu.service';
import { bestMatchWithTrail, buildTree, type Item } from '@/utils/layout/menu.utils';
import { stripLocale } from '@/utils/layout/path.utils';
import { create } from 'zustand';

type NotiTab = 'all' | 'messages' | 'tasks' | 'alerts';

export type LayoutArea = 'PLATFORM' | 'ADMIN';

export type LoadMenuOptions = {
    area: LayoutArea;
    siteId?: string;
};

type State = {
    sidebarOpen: boolean;
    collapsed: boolean;

    user: AdminUser | null;
    items: Item[];
    openGroups: Record<string, boolean>;
    activeKey: string;

    userMenuOpen: boolean;
    notiOpen: boolean;
    notiTab: NotiTab;

    toggleSidebar: () => void;
    setSidebarOpen: (value: boolean) => void;

    toggleCollapsed: () => void;
    setCollapsed: (value: boolean) => void;

    setUserMenuOpen: (value: boolean) => void;
    setNotiOpen: (value: boolean) => void;
    setNotiTab: (value: NotiTab) => void;

    loadMe: () => Promise<void>;
    loadMenu: (options: LoadMenuOptions) => Promise<void>;

    setActiveKey: (key: string) => void;
    syncActiveByPathname: (pathname: string) => void;

    toggleGroupExclusive: (key: string) => void;

    openGroupExclusive: (key: string) => void;

    logout: () => Promise<void>;
};

const ACTIVE_STORAGE_KEYS: Record<LayoutArea, string> = {
    PLATFORM: 'platform_sb_active_key',
    ADMIN: 'admin_sb_active_key',
};

export const useAdminLayoutStore = create<State>((set, get) => {
    let menuRequestId = 0;
    let currentMenuArea: LayoutArea = 'PLATFORM';

    const resetMenu = () => {
        set({
            items: [],
            openGroups: {},
            activeKey: '',
        });
    };

    const setMenuItems = (items: Item[]) => {
        set({
            items,
            openGroups: {},
            activeKey: '',
        });
    };

    return {
        /*
         * Sidebar state
         *
         * sidebarOpen:
         * Used for opening/closing the sidebar
         * drawer, mainly useful on mobile.
         *
         * collapsed:
         * Used for desktop sidebar collapse:
         *
         * false → 248px
         * true  → 84px
         */
        sidebarOpen: true,
        collapsed: false,

        user: null,
        items: [],
        openGroups: {},
        activeKey: '',

        userMenuOpen: false,
        notiOpen: false,
        notiTab: 'all',

        toggleSidebar: () =>
            set((state) => ({
                sidebarOpen: !state.sidebarOpen,
            })),

        setSidebarOpen: (value) =>
            set({
                sidebarOpen: value,
            }),

        toggleCollapsed: () =>
            set((state) => ({
                collapsed: !state.collapsed,
            })),

        setCollapsed: (value) =>
            set({
                collapsed: value,
            }),

        setUserMenuOpen: (value) =>
            set({
                userMenuOpen: value,
            }),

        setNotiOpen: (value) =>
            set({
                notiOpen: value,
            }),

        setNotiTab: (value) =>
            set({
                notiTab: value,
            }),

        loadMe: async () => {
            try {
                const data = await adminAuthService.me();

                set({
                    user: data?.user ?? null,
                });
            } catch (error) {
                console.error('[LayoutStore] Failed to load user:', error);

                set({
                    user: null,
                });
            }
        },

        loadMenu: async ({ area, siteId }) => {
            const requestId = ++menuRequestId;

            currentMenuArea = area;

            if (area === 'ADMIN' && !siteId) {
                console.warn('[LayoutStore] Cannot load ADMIN menu without siteId.');

                resetMenu();
                return;
            }

            try {
                const data =
                    area === 'PLATFORM'
                        ? await platformMenuService.layoutMenu()
                        : await adminMenuService.layoutMenu({
                              siteId: siteId!,
                          });

                if (requestId !== menuRequestId) {
                    return;
                }

                const tree = buildTree(data.items || []);

                setMenuItems(tree);
            } catch (error) {
                if (requestId !== menuRequestId) {
                    return;
                }

                console.error(`[LayoutStore] Failed to load ${area} menu:`, error);

                resetMenu();
            }
        },

        setActiveKey: (key) =>
            set({
                activeKey: key,
            }),

        syncActiveByPathname: (pathname) => {
            const { items } = get();

            if (!pathname || !items.length) {
                return;
            }

            const current = stripLocale(pathname);

            const result = bestMatchWithTrail(items, current);

            if (result?.hit) {
                const activeKey = result.hit.key;

                set((state) => ({
                    activeKey,
                    openGroups: {
                        ...state.openGroups,
                        ...Object.fromEntries(result.trail.map((key) => [key, true])),
                    },
                }));

                try {
                    localStorage.setItem(ACTIVE_STORAGE_KEYS[currentMenuArea], activeKey);
                } catch {}

                return;
            }

            try {
                const savedKey = localStorage.getItem(ACTIVE_STORAGE_KEYS[currentMenuArea]);

                if (!savedKey) {
                    return;
                }

                if (!findItem(items, savedKey)) {
                    return;
                }

                set({
                    activeKey: savedKey,
                });
            } catch {}
        },

        toggleGroupExclusive: (groupKey) =>
            set((state) => {
                const isOpen = !!state.openGroups[groupKey];

                return {
                    openGroups: isOpen
                        ? {}
                        : {
                              [groupKey]: true,
                          },
                };
            }),

        openGroupExclusive: (groupKey) =>
            set((state) => {
                if (state.openGroups[groupKey]) {
                    return state;
                }

                return {
                    openGroups: {
                        [groupKey]: true,
                    },
                };
            }),

        logout: async () => {
            try {
                await adminAuthService.logout();
            } catch (error) {
                console.error('[LayoutStore] Failed to logout:', error);

                throw error;
            } finally {
                set({
                    user: null,
                    items: [],
                    openGroups: {},
                    activeKey: '',
                    userMenuOpen: false,
                    notiOpen: false,
                });

                try {
                    localStorage.removeItem(ACTIVE_STORAGE_KEYS.PLATFORM);

                    localStorage.removeItem(ACTIVE_STORAGE_KEYS.ADMIN);
                } catch {}
            }
        },
    };
});

function findItem(items: Item[], key: string): Item | null {
    for (const item of items) {
        if (item.key === key) {
            return item;
        }

        if (item.children?.length) {
            const found = findItem(item.children, key);

            if (found) {
                return found;
            }
        }
    }

    return null;
}
