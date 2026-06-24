'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-03.module.css';
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
    children?: ServiceNavItem[];
};

export interface HeaderService03Props {
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

export function HeaderService03({
    siteId,
    brandHref = '/',
    primaryText = 'Hỏi AI',
    primaryHref = '#',
    secondaryText = 'Đăng nhập',
    secondaryHref = '/login',
}: HeaderService03Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);
    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.brand}>
                    <Image
                        src={siteLogo}
                        alt={siteName}
                        width={48}
                        height={48}
                        className={styles.logo}
                    />

                    <span className={styles.siteName}>{siteName}</span>
                </Link>

                <nav className={styles.nav}>
                    {menus.map((item) => {
                        const children = item.children ?? [];

                        return (
                            <div key={`${item.label}-${item.href}`} className={styles.navItem}>
                                <Link href={item.href}>{item.label}</Link>

                                {children.length > 0 && (
                                    <>
                                        <ChevronDown size={14} />

                                        <div className={styles.megaMenu}>
                                            <div className={styles.megaGrid}>
                                                {children.map((child) => (
                                                    <Link
                                                        key={`${child.label}-${child.href}`}
                                                        href={child.href}
                                                        className={styles.megaItem}
                                                    >
                                                        <div className={styles.iconWrapper}>
                                                            <span className={styles.iconCircle}>
                                                                🚀
                                                            </span>
                                                        </div>

                                                        <div className={styles.content}>
                                                            <div className={styles.megaTitle}>
                                                                {child.label}
                                                            </div>

                                                            <div className={styles.megaDescription}>
                                                                {child.description ??
                                                                    `Khám phá ${child.label} và các tính năng liên quan`}
                                                            </div>
                                                        </div>

                                                        <div className={styles.arrow}>→</div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className={styles.actions}>
                    <Link href={primaryHref} className={styles.aiButton}>
                        ✨ {primaryText}
                    </Link>
                </div>

                <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileOpen && (
                <div className={styles.mobileMenu}>
                    {menus.map((item) => (
                        <Link key={item.label} href={item.href} className={styles.mobileLink}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
export const HEADER_BASIC_03: RegItem = {
    kind: 'HeaderService03',

    label: 'Header Service 03',

    defaults: {
        logo: '/logo.png',
        siteName: 'Site A',

        primaryText: 'Hỏi AI',
        primaryHref: '#',

        navItems: [
            {
                label: 'Home',
                href: '/',
            },
            {
                label: 'Services',
                href: '/services',
                children: [
                    {
                        label: 'Website Design',
                        href: '/website-design',
                        description: 'Thiết kế website chuyên nghiệp',
                    },
                    {
                        label: 'SEO',
                        href: '/seo',
                        description: 'Tối ưu hóa công cụ tìm kiếm',
                    },
                ],
            },
            {
                label: 'Pricing',
                href: '/pricing',
            },
        ],
    },

    inspector: [
        {
            key: 'siteName',
            label: 'Site Name',
            kind: 'text',
        },
        {
            key: 'primaryText',
            label: 'Button Text',
            kind: 'text',
        },
        {
            key: 'primaryHref',
            label: 'Button Link',
            kind: 'text',
        },
    ],

    render: (props) => <HeaderService03 {...(props as HeaderService03Props)} />,
};
