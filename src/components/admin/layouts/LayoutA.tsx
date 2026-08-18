'use client';

import { useAdminTitle } from '@/components/admin/AdminTitleContext';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import Sidebar from '@/components/admin/shared/layout/layoutA/Sidebar';
import Topbar from '@/components/admin/shared/layout/layoutA/Topbar';
import { useAdminLayoutStore } from '@/store/layout/layouta/index';
import styles from '@/styles/admin/layouts/LayoutA.module.css';
import { useRipple } from '@/utils/layout/ripple';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
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

    const sidebarOpen = useAdminLayoutStore((s) => s.sidebarOpen);

    const collapsed = useAdminLayoutStore((s) => s.collapsed);

    const setSidebarOpen = useAdminLayoutStore((s) => s.setSidebarOpen);

    const loadMe = useAdminLayoutStore((s) => s.loadMe);

    const loadMenu = useAdminLayoutStore((s) => s.loadMenu);

    const syncActiveByPathname = useAdminLayoutStore((s) => s.syncActiveByPathname);

    const setUserMenuOpen = useAdminLayoutStore((s) => s.setUserMenuOpen);

    const setNotiOpen = useAdminLayoutStore((s) => s.setNotiOpen);

    const logout = useAdminLayoutStore((s) => s.logout);

    useEffect(() => {
        void loadMe();
    }, [loadMe]);

    useEffect(() => {
        if (!currentSite?.id) {
            return;
        }

        void loadMenu(currentSite.id);
    }, [currentSite?.id, loadMenu]);

    useEffect(() => {
        function onEsc(e: KeyboardEvent) {
            if (e.key !== 'Escape') {
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

    useEffect(() => {
        if (!pathname) {
            return;
        }

        syncActiveByPathname(pathname);
    }, [pathname, syncActiveByPathname]);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            router.replace('/login');
            router.refresh();
        }
    };

    return (
        <div
            className={`${styles.shell} ${
                collapsed ? styles.shellSidebarClosed : styles.shellSidebarOpen
            }`}
        >
            <Sidebar navRef={navRef} />

            <div className={styles.main}>
                <Topbar meta={meta} onLogout={handleLogout} />

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}
