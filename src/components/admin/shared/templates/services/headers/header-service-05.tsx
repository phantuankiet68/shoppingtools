'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-05.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import { ChevronDown, Mail, Menu, Phone, Sparkles, X } from 'lucide-react';
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

export interface HeaderService05Props {
    siteId?: string;
    brandHref?: string;
    secondaryText?: string;
    secondaryHref?: string;
    announcementText?: string;
    phoneNumber?: string;
    emailAddress?: string;
    ctaText?: string;
    ctaHref?: string;
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

export function HeaderService05({
    siteId,
    brandHref = '/',
    secondaryText = 'Sign In',
    secondaryHref = '/login',
    ctaText = 'Start Free Trial',
    ctaHref = '/register',
}: HeaderService05Props) {
    const site = useSite(siteId);

    const menus = useSiteMenus(siteId);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const siteLogo = site?.logoUrl || '/assets/images/logo.png';
    const siteName = site?.name || 'KBuilder';

    const phoneNumber = site?.contactPhone || '+84 987 654 321';

    const emailAddress = site?.contactEmail || 'hello@sitea.com';

    const announcementText = site?.seoTitle || '🚀 Free consultation available for new customers';

    return (
        <>
            <div className={styles.topBar}>
                <div className={styles.topBarContainer}>
                    <div className={styles.topBarLeft}>{announcementText}</div>
                    <div className={styles.topBarRight}>
                        <a
                            href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                            className={styles.topContact}
                        >
                            <Phone size={14} />
                            {phoneNumber}
                        </a>

                        <a href={`mailto:${emailAddress}`} className={styles.topContact}>
                            <Mail size={14} />
                            {emailAddress}
                        </a>
                    </div>
                </div>
            </div>

            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href={brandHref} className={styles.brand}>
                        <Image
                            src={siteLogo}
                            alt={siteName}
                            width={48}
                            height={37}
                            className={styles.logo}
                            unoptimized
                        />

                        <div>
                            <div className={styles.brandTitle}>{siteName}</div>

                            <div className={styles.brandSubtitle}>
                                Professional Digital Solutions
                            </div>
                        </div>
                    </Link>

                    <nav className={styles.nav}>
                        {menus.map((item) => (
                            <div
                                key={`${item.label}-${item.href}`}
                                className={styles.navItem}
                                onMouseEnter={() => setActiveMenu(item.label)}
                                onMouseLeave={() => {
                                    setTimeout(() => {
                                        setActiveMenu(null);
                                    }, 150);
                                }}
                            >
                                <Link href={item.href} className={styles.navLink}>
                                    {item.label}

                                    {!!item.children?.length && (
                                        <ChevronDown size={14} className={styles.navChevron} />
                                    )}
                                </Link>

                                {!!item.children?.length && activeMenu === item.label && (
                                    <div className={styles.megaMenu}>
                                        <div className={styles.megaHeader}>
                                            <div>
                                                <h3>{item.label}</h3>
                                            </div>

                                            <div className={styles.megaBadge}>
                                                <Sparkles size={14} />
                                                Featured
                                            </div>
                                        </div>

                                        <div className={styles.serviceList}>
                                            {item.children.map((child) => (
                                                <Link
                                                    key={`${child.label}-${child.href}`}
                                                    href={child.href}
                                                    className={styles.serviceItem}
                                                >
                                                    <div className={styles.serviceIcon}>
                                                        {child.icon ? (
                                                            <i className={child.icon}></i>
                                                        ) : (
                                                            <i className="bi bi-grid"></i>
                                                        )}
                                                    </div>

                                                    <div className={styles.serviceContent}>
                                                        <div className={styles.serviceHeader}>
                                                            <div className={styles.serviceTitle}>
                                                                {child.label}
                                                            </div>

                                                            <div className={styles.serviceArrow}>
                                                                →
                                                            </div>
                                                        </div>

                                                        <div className={styles.serviceDescription}>
                                                            {child.description ||
                                                                'Professional solution for modern businesses'}
                                                        </div>
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
                        <Link href={secondaryHref} className={styles.loginButton}>
                            {secondaryText}
                        </Link>

                        <Link href={ctaHref} className={styles.ctaButton}>
                            {ctaText}
                        </Link>

                        <button
                            className={styles.mobileButton}
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
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
                    </div>
                )}
            </header>
        </>
    );
}

export const HEADER_SERVICE_05: RegItem = {
    kind: 'HeaderService05',

    label: 'Header Service 05',

    defaults: {
        ctaText: 'Start Free Trial',
        ctaHref: '/register',
    },

    inspector: [
        {
            key: 'announcementText',
            label: 'Announcement Text',
            kind: 'text',
        },
        {
            key: 'phoneNumber',
            label: 'Phone Number',
            kind: 'text',
        },
        {
            key: 'emailAddress',
            label: 'Email Address',
            kind: 'text',
        },
        {
            key: 'ctaText',
            label: 'CTA Text',
            kind: 'text',
        },
        {
            key: 'ctaHref',
            label: 'CTA Href',
            kind: 'text',
        },
    ],

    render: (props) => <HeaderService05 {...(props as Record<string, any>)} />,
};

export default HeaderService05;
