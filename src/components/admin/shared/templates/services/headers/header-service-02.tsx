'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-02.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import { ChevronDown, Menu, X } from 'lucide-react';
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
export interface HeaderService02Props {
    siteId?: string;

    brandHref?: string;

    primaryText?: string;
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

export function HeaderService02({
    siteId,
    brandHref = '/',
    primaryText = 'Đăng ký',
    primaryHref = '/register',
    secondaryText = 'Đăng nhập',
    secondaryHref = '/login',
}: HeaderService02Props) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href={brandHref} className={styles.brand}>
                    <Image
                        src={siteLogo}
                        alt={siteName}
                        width={48}
                        height={48}
                        className={styles.logo}
                    />

                    <span className={styles.brandName}>{siteName}</span>
                </Link>

                <nav className={styles.nav}>
                    {menus.map((item) => (
                        <div key={`${item.label}-${item.href}`} className={styles.navItem}>
                            <Link href={item.href}>{item.label}</Link>

                            {item.children?.length ? (
                                <>
                                    <ChevronDown size={14} />

                                    <div className={styles.megaMenu}>
                                        <div className={styles.megaGrid}>
                                            {item.children.map((child) => (
                                                <Link
                                                    key={`${child.label}-${child.href}`}
                                                    href={child.href}
                                                    className={styles.megaItem}
                                                >
                                                    <div className={styles.megaIcon}>
                                                        {child.icon ? (
                                                            <i className={child.icon}></i>
                                                        ) : (
                                                            <i className="bi bi-grid"></i>
                                                        )}
                                                    </div>

                                                    <div className={styles.megaTitle}>
                                                        {child.label}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <Link href={secondaryHref} className={styles.secondaryButton}>
                        {secondaryText}
                    </Link>

                    <Link href={primaryHref} className={styles.primaryButton}>
                        {primaryText}
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

                    <Link href={primaryHref} className={styles.mobilePrimary}>
                        {primaryText}
                    </Link>
                </div>
            )}
        </header>
    );
}

export const HEADER_SERVICE_02: RegItem = {
    kind: 'HeaderService02',
    label: 'Header Service 02',

    defaults: {
        brandHref: '/',

        primaryText: 'Đăng ký',
        primaryHref: '/register',

        secondaryText: 'Đăng nhập',
        secondaryHref: '/login',
    },

    inspector: [
        {
            key: 'brandHref',
            label: 'Brand Href',
            kind: 'text',
        },
        {
            key: 'primaryText',
            label: 'Primary Text',
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
            <HeaderService02
                siteId={data.siteId}
                brandHref={data.brandHref}
                primaryText={data.primaryText}
                primaryHref={data.primaryHref}
                secondaryText={data.secondaryText}
                secondaryHref={data.secondaryHref}
            />
        );
    },
};

export default HeaderService02;
