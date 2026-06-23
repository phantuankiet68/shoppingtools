'use client';

import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-01.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import { ChevronDown, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export type ServiceNavItem = {
    label: string;
    href: string;
    children?: ServiceNavItem[];
};

export interface HeaderService01Props {
    siteId?: string;

    brandHref?: string;

    trialText?: string;
    trialHref?: string;

    signInText?: string;
    signInHref?: string;
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

export function HeaderService01({
    siteId,
    brandHref = '/',
    trialText = 'Free 14-day trial',
    trialHref = '/trial',
    signInText = 'Sign in',
    signInHref = '/login',
}: HeaderService01Props) {
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
                        width={28}
                        height={28}
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

                                    <div className={styles.dropdown}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={`${child.label}-${child.href}`}
                                                href={child.href}
                                                className={styles.dropdownItem}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <Link href={trialHref} className={styles.trialButton}>
                        {trialText}
                    </Link>

                    <Link href={signInHref} className={styles.signInButton}>
                        {signInText}
                    </Link>
                </div>

                <button
                    type="button"
                    className={styles.mobileToggle}
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label="Toggle Menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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

                    <Link href={trialHref} className={styles.mobileTrial}>
                        {trialText}
                    </Link>

                    <Link href={signInHref} className={styles.mobileSignIn}>
                        {signInText}
                    </Link>
                </div>
            )}
        </header>
    );
}

export const HEADER_BASIC_01: RegItem = {
    kind: 'HeaderBasic01',
    label: 'Header Basic 01',

    defaults: {
        brandHref: '/',

        trialText: 'Free 14-day trial',
        trialHref: '/trial',

        signInText: 'Sign in',
        signInHref: '/login',
    },

    inspector: [
        {
            key: 'brandHref',
            label: 'Brand Href',
            kind: 'text',
        },
        {
            key: 'trialText',
            label: 'Trial Text',
            kind: 'text',
        },
        {
            key: 'trialHref',
            label: 'Trial Href',
            kind: 'text',
        },
        {
            key: 'signInText',
            label: 'Sign In Text',
            kind: 'text',
        },
        {
            key: 'signInHref',
            label: 'Sign In Href',
            kind: 'text',
        },
    ],

    render: (props) => {
        const data = props as Record<string, any>;

        return (
            <HeaderService01
                siteId={data.siteId}
                brandHref={data.brandHref}
                trialText={data.trialText}
                trialHref={data.trialHref}
                signInText={data.signInText}
                signInHref={data.signInHref}
            />
        );
    },
};

export default HeaderService01;
