'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-09.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';

import { ChevronDown, Headphones, Mail, Menu, Phone, Search, ShieldCheck, X } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type ServiceNavItem = {
    label: string;
    href: string;
    icon?: string | null;
    description?: string;
    children?: ServiceNavItem[];
};

export interface HeaderService09Props {
    siteId?: string;

    announcementText?: string;

    loginText?: string;
    loginHref?: string;

    registerText?: string;
    registerHref?: string;

    salesText?: string;
    salesHref?: string;

    searchPlaceholder?: string;
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

function HeaderService09({
    siteId,

    announcementText = 'Trusted by enterprise customers worldwide',

    loginText = 'Login',
    loginHref = '/login',

    registerText = 'Start Free Trial',
    registerHref = '/register',

    salesText = 'Talk To Sales',
    salesHref = '/contact',

    searchPlaceholder = 'Search products, solutions, services...',
}: HeaderService09Props) {
    const site = useSite(siteId);

    const menus = useSiteMenus(siteId);

    const [mobileOpen, setMobileOpen] = useState(false);

    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const siteLogo = site?.logoUrl || '/assets/images/logo.png';
    const siteName = site?.name || 'KBuilder';

    return (
        <>
            <div className={styles.topbar}>
                <div className={styles.topbarContainer}>
                    <div className={styles.topbarLeft}>
                        <span>
                            <Phone size={14} />
                            {site?.contactPhone || '+84 123 456 789'}
                        </span>

                        <span>
                            <Mail size={14} />
                            {site?.contactEmail || 'support@company.com'}
                        </span>
                    </div>

                    <div className={styles.topbarCenter}>
                        <ShieldCheck size={14} />
                        {announcementText}
                    </div>

                    <div className={styles.topbarRight}>
                        <div className={styles.liveBadge}>
                            <span />
                            Online Support
                        </div>
                    </div>
                </div>
            </div>

            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.headerTop}>
                        <Link href="/" className={styles.brand}>
                            <Image
                                src={siteLogo}
                                alt={siteName}
                                width={48}
                                height={37}
                                unoptimized
                                className={styles.logo}
                            />

                            <div className={styles.brandInfo}>
                                <strong>{siteName}</strong>
                                <span>Enterprise Solutions</span>
                            </div>
                        </Link>

                        <div className={styles.searchBox}>
                            <Search size={18} />
                            <input type="text" placeholder={searchPlaceholder} />
                        </div>

                        <Link href={salesHref} className={styles.salesBtn}>
                            <Headphones size={16} />
                            {salesText}
                        </Link>
                    </div>

                    <div className={styles.headerBottom}>
                        <nav className={styles.nav}>
                            {menus.map((item) => (
                                <div
                                    key={item.label}
                                    className={styles.navItem}
                                    onMouseEnter={() => setActiveMenu(item.label)}
                                    onMouseLeave={() => setActiveMenu(null)}
                                >
                                    <Link href={item.href} className={styles.navLink}>
                                        {item.label}

                                        {!!item.children?.length && <ChevronDown size={14} />}
                                    </Link>

                                    {!!item.children?.length && activeMenu === item.label && (
                                        <div className={styles.megaMenu}>
                                            <div className={styles.megaHeader}>
                                                <div className={styles.headerContent}>
                                                    <span className={styles.headerBadge}>
                                                        Explore
                                                    </span>

                                                    <div>
                                                        <h3>{item.label}</h3>

                                                        <p>
                                                            Discover premium solutions and services
                                                            designed to accelerate your business
                                                            growth.
                                                        </p>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={item.href}
                                                    className={styles.viewAllBtn}
                                                >
                                                    View All →
                                                </Link>
                                            </div>

                                            <div className={styles.megaCards}>
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={`${child.label}-${child.href}`}
                                                        href={child.href}
                                                        className={styles.megaCard}
                                                    >
                                                        <div className={styles.cardIcon}>
                                                            {child.label.charAt(0)}
                                                        </div>

                                                        <div>
                                                            <h4>{child.label}</h4>

                                                            <p>
                                                                {child.description ||
                                                                    'Professional solution'}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        <div className={styles.actions}>
                            <Link href={loginHref} className={styles.loginBtn}>
                                {loginText}
                            </Link>

                            <Link href={registerHref} className={styles.registerBtn}>
                                {registerText}
                            </Link>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.mobileButton}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                {mounted && mobileOpen && (
                    <div className={styles.mobileMenu}>
                        {menus.map((item) => (
                            <Link
                                key={`${item.label}-${item.href}`}
                                href={item.href}
                                className={styles.mobileItem}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link href={salesHref} className={styles.mobileSales}>
                            {salesText}
                        </Link>

                        <Link href={registerHref} className={styles.mobileCta}>
                            {registerText}
                        </Link>
                    </div>
                )}
            </header>
        </>
    );
}

export const HEADER_SERVICE_09: RegItem = {
    kind: 'HeaderService09',

    label: 'Header Service 09',

    defaults: {
        announcementText: 'Trusted by enterprise customers worldwide',

        salesText: 'Talk To Sales',
        salesHref: '/contact',

        loginText: 'Login',
        loginHref: '/login',

        registerText: 'Start Free Trial',
        registerHref: '/register',

        searchPlaceholder: 'Search products, solutions, services...',
    },

    inspector: [
        {
            key: 'announcementText',
            label: 'Announcement',
            kind: 'text',
        },
        {
            key: 'salesText',
            label: 'Sales Text',
            kind: 'text',
        },
        {
            key: 'salesHref',
            label: 'Sales URL',
            kind: 'text',
        },
        {
            key: 'loginText',
            label: 'Login Text',
            kind: 'text',
        },
        {
            key: 'loginHref',
            label: 'Login URL',
            kind: 'text',
        },
        {
            key: 'registerText',
            label: 'Register Text',
            kind: 'text',
        },
        {
            key: 'registerHref',
            label: 'Register URL',
            kind: 'text',
        },
        {
            key: 'searchPlaceholder',
            label: 'Search Placeholder',
            kind: 'text',
        },
    ],

    render: (props) => <HeaderService09 {...(props as Record<string, any>)} />,
};

export default HeaderService09;
