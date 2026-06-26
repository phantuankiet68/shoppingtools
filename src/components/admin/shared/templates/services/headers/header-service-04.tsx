'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-04.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import { Menu, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type ServiceNavItem = {
    label: string;
    href: string;

    description?: string;
    icon?: string | null;

    children?: ServiceNavItem[];
};

export interface HeaderService04Props {
    siteId?: string;

    brandHref?: string;

    announcementText?: string;
    primaryHref?: string;

    secondaryText?: string;
    secondaryHref?: string;
}

function useSiteMenus(siteId?: string) {
    const [menus, setMenus] = useState<ServiceNavItem[]>([]);

    useEffect(() => {
        if (!siteId) {
            setMenus([]);
            return;
        }

        fetch(`/api/v1/sites/${siteId}/menus`)
            .then((res) => res.json())
            .then((data) => {
                setMenus(Array.isArray(data?.data) ? data.data : []);
            })
            .catch(() => {
                setMenus([]);
            });
    }, [siteId]);

    return menus;
}

export function HeaderService04({
    siteId,
    brandHref = '/',
    announcementText = 'Watch all courses for just $12/month',
    primaryHref = '#',
    secondaryText = 'Log in',
    secondaryHref = '/login',
}: HeaderService04Props) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    return (
        <>
            <div className={styles.topBar}>
                <div className={styles.topBarContent}>
                    <div className={styles.topBarBadge}>
                        <i className="bi bi-stars"></i>
                        <span>Ưu đãi</span>
                    </div>

                    <span className={styles.topBarText}>{announcementText}</span>

                    <Link href="/pricing" className={styles.topBarAction}>
                        Xem ngay
                        <i className="bi bi-arrow-right"></i>
                    </Link>
                </div>
            </div>

            <header className={styles.header}>
                <div className={styles.container}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <Link href={brandHref} className={styles.brand}>
                            <Image
                                src={siteLogo}
                                alt={siteName}
                                width={42}
                                height={42}
                                className={styles.logo}
                            />

                            <span className={styles.brandName}>{siteName}</span>
                        </Link>

                        <nav className={styles.nav}>
                            {menus.map((item) => (
                                <Link
                                    key={`${item.label}-${item.href}`}
                                    href={item.href}
                                    className={styles.navLink}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className={styles.actions}>
                        <div className={styles.searchBox}>
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search by Websites"
                                className={styles.searchInput}
                            />
                        </div>
                        <Link href={secondaryHref} className={styles.loginButton}>
                            <i className="bi bi-box-arrow-in-right"></i>

                            <span>{secondaryText}</span>
                        </Link>

                        <Link href="/register" className={styles.signupButton}>
                            <i className="bi bi-person-plus"></i>

                            <span>Sign Up</span>
                        </Link>
                    </div>

                    <button
                        type="button"
                        className={styles.mobileToggle}
                        onClick={() => setMobileOpen((prev) => !prev)}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className={styles.mobileMenu}>
                        {menus.map((item) => (
                            <Link
                                key={`${item.label}-${item.href}`}
                                href={item.href}
                                className={styles.mobileLink}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link href={secondaryHref} className={styles.mobileSecondary}>
                            {secondaryText}
                        </Link>
                    </div>
                )}
            </header>
        </>
    );
}

export const HEADER_SERVICE_04: RegItem = {
    kind: 'HeaderService04',
    label: 'Header Service 04',

    defaults: {
        brandHref: '/',

        announcementText: 'Watch all courses for just $12/month',
        primaryHref: '#',

        secondaryText: 'Log in',
        secondaryHref: '/login',
    },

    inspector: [
        {
            key: 'brandHref',
            label: 'Brand Href',
            kind: 'text',
        },
        {
            key: 'announcementText',
            label: 'Announcement Text',
            kind: 'text',
        },
        {
            key: 'primaryHref',
            label: 'Primary Href',
            kind: 'text',
        },
        {
            key: 'secondaryText',
            label: 'Secondary Text',
            kind: 'text',
        },
        {
            key: 'secondaryHref',
            label: 'Secondary Href',
            kind: 'text',
        },
    ],

    render: (props) => {
        const data = props as Record<string, any>;

        return (
            <HeaderService04
                siteId={data.siteId}
                brandHref={data.brandHref}
                announcementText={data.announcementText}
                primaryHref={data.primaryHref}
                secondaryText={data.secondaryText}
                secondaryHref={data.secondaryHref}
            />
        );
    },
};

export default HeaderService04;
