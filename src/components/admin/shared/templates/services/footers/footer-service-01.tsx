'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-01.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type FooterNavItem = {
    label: string;
    href: string;
    children?: FooterNavItem[];
};

export interface FooterService01Props {
    siteId?: string;
    phone?: string;
    email?: string;
    address?: string;

    ctaTitle?: string;
    ctaButtonText?: string;
    ctaButtonHref?: string;
}

function useSiteMenus(siteId?: string) {
    const [menus, setMenus] = useState<FooterNavItem[]>([]);

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

export function FooterService01({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
    ctaTitle = 'Ready to grow your business?',
    ctaButtonText = 'Get Started',
    ctaButtonHref = '/contact',
}: FooterService01Props) {
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);
    const halfIndex = Math.ceil(menus.length / 2);

    const leftMenus = menus.slice(0, halfIndex);

    const rightMenus = menus.slice(halfIndex);

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brandColumn}>
                        <Link href="/" className={styles.brand}>
                            <div className={styles.logoWrapper}>
                                <Image
                                    src={siteLogo}
                                    alt={siteName}
                                    fill
                                    sizes="52px"
                                    className={styles.logo}
                                />
                            </div>
                            <div>
                                <span className={styles.brandName}>{siteName}</span>

                                <div className={styles.tagline}>Service Website</div>
                            </div>
                        </Link>

                        <p className={styles.description}>
                            {site?.seoDescription ||
                                'Professional service solutions with modern technology and exceptional customer experience.'}
                        </p>

                        <div className={styles.socialWrapper}>
                            <span className={styles.socialTitle}>Follow Us</span>

                            <div className={styles.socials}>
                                <a href="#" aria-label="Facebook">
                                    <i className="bi bi-facebook"></i>
                                </a>

                                <a href="#" aria-label="Instagram">
                                    <i className="bi bi-instagram"></i>
                                </a>

                                <a href="#" aria-label="LinkedIn">
                                    <i className="bi bi-linkedin"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Menu */}
                    <div className={styles.menuColumn}>
                        <h4 className={styles.title}>Quick Links</h4>

                        <div className={styles.menuGrid}>
                            <div className={styles.menuList}>
                                {leftMenus.map((item) => (
                                    <Link
                                        key={`${item.label}-${item.href}`}
                                        href={item.href}
                                        className={styles.link}
                                    >
                                        <i className="bi bi-chevron-right"></i>

                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles.menuColumn}>
                        <h4 className={styles.title}>Quick Links</h4>

                        <div className={styles.menuGrid}>
                            <div className={styles.menuList}>
                                {rightMenus.map((item) => (
                                    <Link
                                        key={`${item.label}-${item.href}`}
                                        href={item.href}
                                        className={styles.link}
                                    >
                                        <i className="bi bi-chevron-right"></i>

                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className={styles.contactColumn}>
                        <h4 className={styles.title}>Contact</h4>

                        <div className={styles.contactList}>
                            <a
                                href={`tel:${site?.contactPhone ?? ''}`}
                                className={styles.contactCard}
                            >
                                <div className={styles.contactIcon}>
                                    <i className="bi bi-telephone"></i>
                                </div>

                                <div className={styles.contactContent}>
                                    <span className={styles.contactLabel}>Phone</span>

                                    <span className={styles.contactValue}>
                                        {site?.contactPhone ?? '+84 123 456 789'}
                                    </span>
                                </div>
                            </a>

                            <a
                                href={`mailto:${site?.contactEmail ?? ''}`}
                                className={styles.contactCard}
                            >
                                <div className={styles.contactIcon}>
                                    <i className="bi bi-envelope"></i>
                                </div>

                                <div className={styles.contactContent}>
                                    <span className={styles.contactLabel}>Email</span>

                                    <span className={styles.contactValue}>
                                        {site?.contactEmail ?? 'support@company.com'}
                                    </span>
                                </div>
                            </a>

                            <div className={styles.contactCard}>
                                <div className={styles.contactIcon}>
                                    <i className="bi bi-geo-alt"></i>
                                </div>

                                <div className={styles.contactContent}>
                                    <span className={styles.contactLabel}>Address</span>

                                    <span className={styles.contactValue}>{address}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className={styles.ctaBox}>
                        <div className={styles.ctaHeader}>
                            <div className={styles.ctaIcon}>
                                <i className="bi bi-stars"></i>
                            </div>
                            <h4>{ctaTitle}</h4>
                        </div>

                        <p className={styles.ctaDescription}>
                            Start building your professional website today and reach more customers
                            with a modern digital experience.
                        </p>

                        <Link href={ctaButtonHref} className={styles.ctaButton}>
                            <span>{ctaButtonText}</span>

                            <i className="bi bi-arrow-right"></i>
                        </Link>

                        <div className={styles.ctaFooter}>
                            <i className="bi bi-check-circle-fill"></i>

                            <span>Free consultation • No credit card required</span>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <div className={styles.copyright}>
                        <i className="bi bi-shield-check"></i>

                        <span>
                            © {new Date().getFullYear()} {siteName}. All rights reserved.
                        </span>
                    </div>

                    <div className={styles.bottomLinks}>
                        <Link href="/privacy">Privacy Policy</Link>

                        <Link href="/terms">Terms of Service</Link>

                        <Link href="/cookies">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export const FOOTER_SERVICE_01: RegItem = {
    kind: 'FooterService01',

    label: 'Footer Service 01',

    defaults: {
        address: 'Ho Chi Minh City, Vietnam',

        ctaTitle: 'Ready to grow your business?',
        ctaButtonText: 'Get Started',
        ctaButtonHref: '/contact',
    },

    inspector: [
        {
            key: 'address',
            label: 'Address',
            kind: 'text',
        },
        {
            key: 'ctaTitle',
            label: 'CTA Title',
            kind: 'text',
        },
        {
            key: 'ctaButtonText',
            label: 'CTA Button Text',
            kind: 'text',
        },
        {
            key: 'ctaButtonHref',
            label: 'CTA Button Href',
            kind: 'text',
        },
    ],

    render: (props) => {
        const data = props as Record<string, any>;

        return (
            <FooterService01
                siteId={data.siteId}
                ctaTitle={data.ctaTitle}
                ctaButtonText={data.ctaButtonText}
                ctaButtonHref={data.ctaButtonHref}
            />
        );
    },
};

export default FooterService01;
