'use client';

import Sidebar from '@/components/admin/shared/layout/layoutA/Sidebar';
import Topbar from '@/components/admin/shared/layout/layoutA/Topbar';
import { useAdminTitle } from '@/components/admin/AdminTitleContext';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminLayoutStore } from '@/store/layout/layouta/index';
import styles from '@/styles/admin/layouts/LayoutA.module.css';
import { useRipple } from '@/utils/layout/ripple';
import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type Props = {
    children: ReactNode;
};

export default function LayoutA({ children }: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const { meta } = useAdminTitle();
    const { currentSite } = useAdminAuth();

    const navRef = useRef<HTMLDivElement>(null);

    useRipple(navRef);

    const collapsed = useAdminLayoutStore((state) => state.collapsed);
    const loadMe = useAdminLayoutStore((state) => state.loadMe);
    const loadMenu = useAdminLayoutStore((state) => state.loadMenu);
    const syncActiveByPathname = useAdminLayoutStore((state) => state.syncActiveByPathname);
    const setUserMenuOpen = useAdminLayoutStore((state) => state.setUserMenuOpen);
    const setNotiOpen = useAdminLayoutStore((state) => state.setNotiOpen);
    const logout = useAdminLayoutStore((state) => state.logout);

    useEffect(() => {
        void loadMe();
    }, [loadMe]);

    useEffect(() => {
        if (!pathname) {
            return;
        }

        if (pathname.startsWith('/platform')) {
            void loadMenu({
                area: 'PLATFORM',
            });

            return;
        }

        if (pathname.startsWith('/admin')) {
            if (!currentSite?.id) {
                return;
            }

            void loadMenu({
                area: 'ADMIN',
                siteId: currentSite.id,
            });
        }
    }, [pathname, currentSite?.id, loadMenu]);

    useEffect(() => {
        if (!pathname) {
            return;
        }

        syncActiveByPathname(pathname);
    }, [pathname, syncActiveByPathname]);

    useEffect(() => {
        function onEsc(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }

            setUserMenuOpen(false);
            setNotiOpen(false);
        }

        document.addEventListener('keydown', onEsc);

        return () => {
            document.removeEventListener('keydown', onEsc);
        };
    }, [setNotiOpen, setUserMenuOpen]);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            router.replace('/login');
            router.refresh();
        }
    };

    const shellStyle: CSSProperties = {
        gridTemplateColumns: collapsed ? '84px minmax(0, 1fr)' : '248px minmax(0, 1fr)',
    };

    return (
        <div
            className={styles.shell}
            style={shellStyle}
            data-sidebar-collapsed={collapsed ? 'true' : 'false'}
        >
            <div className={styles.background} aria-hidden="true">
                <div className={styles.backgroundImage} />
                <div className={styles.backgroundGlowBlue} />
                <div className={styles.backgroundGlowPurple} />
                <div className={styles.backgroundGlowCyan} />
                <div className={styles.backgroundMist} />
            </div>
            <Sidebar navRef={navRef} />
            <div className={styles.main}>
                <Topbar meta={meta} onLogout={handleLogout} />

                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
