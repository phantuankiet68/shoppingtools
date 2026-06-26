'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-02.module.css';
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

export interface FooterService02Props {
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

export function FooterService02({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
    ctaTitle = 'Subscribe to our newsletter',
    ctaButtonText = 'Subscribe',
    ctaButtonHref = '/contact',
}: FooterService02Props) {
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    const companyMenus = menus.slice(0, Math.ceil(menus.length / 2));
    const resourceMenus = menus.slice(Math.ceil(menus.length / 2));

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Newsletter */}

                <section className={styles.newsletter}>
                    <div className={styles.newsletterContent}>
                        <div>
                            <span className={styles.badge}>Stay Connected</span>

                            <h2>{ctaTitle}</h2>

                            <p>Receive useful tips, updates and new services every month.</p>
                        </div>

                        <div className={styles.newsletterForm}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                className={styles.input}
                            />

                            <Link href={ctaButtonHref} className={styles.subscribeButton}>
                                {ctaButtonText}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Main */}

                <section className={styles.mainGrid}>
                    <div className={styles.brandColumn}>
                        <Link href="/" className={styles.brand}>
                            <div className={styles.logoWrapper}>
                                <Image
                                    src={siteLogo}
                                    alt={siteName}
                                    fill
                                    sizes="56px"
                                    className={styles.logo}
                                />
                            </div>

                            <div>
                                <h3>{siteName}</h3>

                                <span>Professional Service</span>
                            </div>
                        </Link>

                        <p className={styles.description}>
                            {site?.seoDescription ??
                                'Professional digital services that help businesses grow with modern technology.'}
                        </p>

                        <div className={styles.socials}>
                            <a href="#">
                                <i className="bi bi-facebook"></i>
                            </a>

                            <a href="#">
                                <i className="bi bi-instagram"></i>
                            </a>

                            <a href="#">
                                <i className="bi bi-linkedin"></i>
                            </a>

                            <a href="#">
                                <i className="bi bi-youtube"></i>
                            </a>
                        </div>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4>Company</h4>

                        {companyMenus.map((item) => (
                            <Link key={`${item.label}-${item.href}`} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.linksColumn}>
                        <h4>Resources</h4>

                        {resourceMenus.map((item) => (
                            <Link key={`${item.label}-${item.href}`} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.contactColumn}>
                        <h4>Contact</h4>

                        <a href={`tel:${site?.contactPhone ?? ''}`}>
                            <i className="bi bi-telephone"></i>

                            <span>{site?.contactPhone ?? '+84 123 456 789'}</span>
                        </a>

                        <a href={`mailto:${site?.contactEmail ?? ''}`}>
                            <i className="bi bi-envelope"></i>

                            <span>{site?.contactEmail ?? 'support@company.com'}</span>
                        </a>

                        <div>
                            <i className="bi bi-geo-alt"></i>

                            <span>{address}</span>
                        </div>
                    </div>
                </section>

                {/* Bottom */}

                <div className={styles.bottomBar}>
                    <span>
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </span>

                    <div className={styles.bottomLinks}>
                        <Link href="/privacy">Privacy Policy</Link>

                        <Link href="/terms">Terms of Service</Link>

                        <Link href="/cookies">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export const FOOTER_SERVICE_02: RegItem = {
    kind: 'FooterService02',

    label: 'Footer Service 02',

    defaults: {
        address: 'Ho Chi Minh City, Vietnam',
        ctaTitle: 'Subscribe to our newsletter',
        ctaButtonText: 'Subscribe',
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
            <FooterService02
                siteId={data.siteId}
                address={data.address}
                ctaTitle={data.ctaTitle}
                ctaButtonText={data.ctaButtonText}
                ctaButtonHref={data.ctaButtonHref}
            />
        );
    },
};

export default FooterService02;
