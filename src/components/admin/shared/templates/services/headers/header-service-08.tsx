'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-08.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';

import { CalendarDays, ChevronDown, Mail, Menu, Phone, X } from 'lucide-react';

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

export interface HeaderService08Props {
    siteId?: string;

    announcementText?: string;

    demoText?: string;
    demoHref?: string;

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

function HeaderService08({
    siteId,

    announcementText = 'Trusted by 10,000+ businesses worldwide',

    demoText = 'Book Demo',
    demoHref = '/demo',

    loginText = 'Login',
    loginHref = '/login',

    registerText = 'Start Free',
    registerHref = '/register',
}: HeaderService08Props) {
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
                        <div className={styles.contactItem}>
                            <Phone size={14} />
                            <span>{site?.contactPhone || '+84 123 456 789'}</span>
                        </div>

                        <div className={styles.contactItem}>
                            <Mail size={14} />
                            <span>{site?.contactEmail || 'support@company.com'}</span>
                        </div>
                    </div>

                    <div className={styles.topbarCenter}>🚀 {announcementText}</div>

                    <Link href={demoHref} className={styles.demoBtn}>
                        <CalendarDays size={14} />
                        {demoText}
                    </Link>
                </div>
            </div>

            <header className={styles.header}>
                <div className={styles.container}>
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

                            <span>Trusted Professional Services</span>
                        </div>
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

                                    {!!item.children?.length && <ChevronDown size={14} />}
                                </Link>

                                {!!item.children?.length && activeMenu === item.label && (
                                    <div
                                        className={styles.megaMenu}
                                        onMouseEnter={() => setActiveMenu(item.label)}
                                        onMouseLeave={() => setActiveMenu(null)}
                                    >
                                        <div className={styles.megaContent}>
                                            <div className={styles.megaGrid}>
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={`${child.label}-${child.href}`}
                                                        href={child.href}
                                                        className={styles.megaItem}
                                                    >
                                                        <div className={styles.megaIcon}>
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

                                            <div className={styles.megaAside}>
                                                <h3>Need a custom solution?</h3>

                                                <p>
                                                    Let's discuss how we can help your business
                                                    grow.
                                                </p>

                                                <Link href="/contact" className={styles.megaButton}>
                                                    Talk to an Expert →
                                                </Link>
                                            </div>
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
                            Start Free Trial
                        </Link>
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
                            Start Free Trial
                        </Link>
                    </div>
                )}
            </header>
        </>
    );
}

export const HEADER_SERVICE_08: RegItem = {
    kind: 'HeaderService08',

    label: 'Header Service 08 Enterprise',

    defaults: {
        announcementText: 'Trusted by 10,000+ businesses worldwide',

        demoText: 'Book Demo',
        demoHref: '/demo',

        salesText: 'Talk To Sales',
        salesHref: '/contact',

        loginText: 'Login',
        loginHref: '/login',

        registerText: 'Start Free',
        registerHref: '/register',

        searchPlaceholder: 'Search products, services, solutions...',
    },

    inspector: [
        {
            key: 'announcementText',
            label: 'Announcement',
            kind: 'text',
        },
        {
            key: 'demoText',
            label: 'Demo Text',
            kind: 'text',
        },
        {
            key: 'demoHref',
            label: 'Demo URL',
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

    render: (props) => <HeaderService08 {...(props as Record<string, any>)} />,
};

export default HeaderService08;
