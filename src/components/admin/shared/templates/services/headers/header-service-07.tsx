'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-07.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';

import { ChevronDown, Headset, Menu, Phone, Search, ShieldCheck, X } from 'lucide-react';

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

export interface HeaderService07Props {
    siteId?: string;

    announcementText?: string;

    salesText?: string;
    salesHref?: string;

    loginText?: string;
    loginHref?: string;

    registerText?: string;
    registerHref?: string;

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

function HeaderService07({
    siteId,

    announcementText = 'Enterprise Website Platform For Modern Businesses',

    salesText = 'Talk To Sales',
    salesHref = '/contact',

    loginText = 'Login',
    loginHref = '/login',

    registerText = 'Start Free',
    registerHref = '/register',

    searchPlaceholder = 'Search services...',
}: HeaderService07Props) {
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

    const phoneNumber = site?.contactPhone || '+84 987 654 321';

    const emailAddress = site?.contactEmail || 'sales@company.com';

    return (
        <>
            <div className={styles.topbar}>
                <div className={styles.topbarContainer}>
                    <div className={styles.topbarLeft}>
                        <div className={styles.contactItem}>
                            <Phone size={14} />
                            <span>{phoneNumber}</span>
                        </div>

                        <div className={styles.contactItem}>
                            <Headset size={14} />
                            <span>{emailAddress}</span>
                        </div>
                    </div>

                    <div className={styles.topbarCenter}>{announcementText}</div>

                    <Link href={salesHref} className={styles.salesButton}>
                        <ShieldCheck size={16} />
                        {salesText}
                    </Link>
                </div>
            </div>

            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href="/" className={styles.brand}>
                        <Image src={siteLogo} alt={siteName} width={48} height={48} unoptimized />

                        <span>{siteName}</span>
                    </Link>

                    <nav className={styles.nav}>
                        {menus.map((item) => (
                            <div
                                key={`${item.label}-${item.href}`}
                                className={styles.navItem}
                                onMouseEnter={() => setActiveMenu(item.label)}
                            >
                                <Link href={item.href} className={styles.navLink}>
                                    {item.label}

                                    {!!item.children?.length && <ChevronDown size={16} />}
                                </Link>

                                {!!item.children?.length && activeMenu === item.label && (
                                    <div className={styles.megaMenu}>
                                        <div className={styles.megaSidebar}>
                                            <span className={styles.megaBadge}>
                                                Business Solutions
                                            </span>
                                            <p>
                                                Discover our complete suite of professional services
                                                designed to accelerate your business growth.
                                            </p>

                                            <Link href="/services" className={styles.sidebarLink}>
                                                View All Services →
                                            </Link>
                                        </div>

                                        <div className={styles.megaGrid}>
                                            {item.children.map((child) => (
                                                <Link
                                                    key={`${child.label}-${child.href}`}
                                                    href={child.href}
                                                    className={styles.megaCard}
                                                >
                                                    <div className={styles.cardIcon}>
                                                        <i className={child.icon || 'bi bi-grid'} />
                                                    </div>

                                                    <div className={styles.cardContent}>
                                                        <h4>{child.label}</h4>

                                                        <p>{child.description || 'Professional'}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className={styles.rightSide}>
                        <div className={styles.searchBox}>
                            <Search size={18} />
                            <input type="text" placeholder={searchPlaceholder} />
                        </div>

                        <div className={styles.authActions}>
                            <Link href={loginHref} className={styles.loginBtn}>
                                <i className="bi bi-person-circle" />
                                <span>{loginText}</span>
                            </Link>

                            <Link href={registerHref} className={styles.registerBtn}>
                                <i className="bi bi-rocket-takeoff-fill" />
                                <span>{registerText} </span>
                                <i className="bi bi-arrow-right" />
                            </Link>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.mobileButton}
                        onClick={() => setMobileOpen((prev) => !prev)}
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

                        <Link href={loginHref} className={styles.mobileItem}>
                            {loginText}
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

export const HEADER_SERVICE_07: RegItem = {
    kind: 'HeaderService07',

    label: 'Header Service 07',

    defaults: {
        announcementText: 'Enterprise Website Platform For Modern Businesses',

        salesText: 'Talk To Sales',

        salesHref: '/contact',

        loginText: 'Login',

        loginHref: '/login',

        registerText: 'Start Free',

        registerHref: '/register',

        searchPlaceholder: 'Search services...',
    },

    inspector: [
        {
            key: 'announcementText',
            label: 'Announcement',
            kind: 'text',
        },
        {
            key: 'salesText',
            label: 'Sales Button Text',
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

    render: (props) => <HeaderService07 {...(props as Record<string, any>)} />,
};

export default HeaderService07;
