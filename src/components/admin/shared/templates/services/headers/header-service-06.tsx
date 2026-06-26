'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-06.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import { ChevronDown, Mail, Menu, Phone, X } from 'lucide-react';
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

export interface HeaderService06Props {
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
function HeaderService06({
    siteId,
    secondaryText = 'Sign In',
    secondaryHref = '/login',
    ctaText = 'Get Started',
    ctaHref = '/register',
}: HeaderService06Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const site = useSite(siteId);

    const menus = useSiteMenus(siteId);

    const siteLogo = site?.logoUrl || '/assets/images/logo.png';
    const siteName = site?.name || 'KBuilder';

    const phoneNumber = site?.contactPhone || '+84 987 654 321';

    const emailAddress = site?.contactEmail || 'hello@sitea.com';

    const announcementText = site?.seoTitle || '🚀 Free consultation available for new customers';

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <div className={styles.topBar}>
                <div className={styles.topBarContent}>
                    <div className={styles.topBarLeft}>
                        <div className={styles.contactItem}>
                            <div className={styles.contactIcon}>
                                <Phone size={14} />
                            </div>

                            <span>{phoneNumber}</span>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.contactIcon}>
                                <Mail size={14} />
                            </div>

                            <span>{emailAddress}</span>
                        </div>
                    </div>
                    <div className={styles.topBarRight}>
                        <span>🚀 {announcementText}</span>
                    </div>
                </div>
            </div>

            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href="/" className={styles.logo}>
                        {siteLogo ? (
                            <Image
                                src={siteLogo}
                                alt={siteName}
                                width={48}
                                height={37}
                                className={styles.logo}
                                unoptimized
                            />
                        ) : (
                            <div className={styles.logoFallback}>{siteName.charAt(0)}</div>
                        )}

                        <span>{siteName}</span>
                    </Link>

                    <nav className={styles.nav}>
                        {menus.map((item) => (
                            <div
                                key={`${item.label}-${item.href}`}
                                className={styles.navItem}
                                onMouseEnter={() => setActiveMenu(item.label)}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <Link href={item.href} className={styles.navLink}>
                                    {item.label}

                                    {!!item.children?.length && <ChevronDown size={16} />}
                                </Link>

                                {!!item.children?.length && activeMenu === item.label && (
                                    <div className={styles.megaMenu}>
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

                                                    <div>
                                                        <h4>{child.label}</h4>

                                                        <p>
                                                            {child.description ||
                                                                'Professional business solution'}
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
                        <Link href={secondaryHref} className={styles.loginButton}>
                            {secondaryText}
                        </Link>

                        <Link href={ctaHref} className={styles.ctaButton}>
                            {ctaText}
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

                        <Link href={secondaryHref} className={styles.mobileItem}>
                            {secondaryText}
                        </Link>

                        <Link href={ctaHref} className={styles.mobileCta}>
                            {ctaText}
                        </Link>
                    </div>
                )}
            </header>
        </>
    );
}
export const HEADER_SERVICE_06: RegItem = {
    kind: 'HeaderService06',

    label: 'Header Service 06',

    defaults: {
        announcementText: '🚀 Build your business faster with our platform',

        phoneNumber: '+84 987 654 321',

        emailAddress: 'hello@sitea.com',

        ctaText: 'Get Started Free',

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

    render: (props) => <HeaderService06 {...(props as Record<string, any>)} />,
};

export default HeaderService06;
