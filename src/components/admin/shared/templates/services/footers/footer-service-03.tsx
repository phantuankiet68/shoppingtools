'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-03.module.css';
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

export interface FooterService03Props {
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

export function FooterService03({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
    ctaTitle = 'Subscribe to our newsletter',
    ctaButtonText = 'Subscribe',
    ctaButtonHref = '/contact',
}: FooterService03Props) {
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    const companyMenus = menus.slice(0, Math.ceil(menus.length / 2));
    const resourceMenus = menus.slice(Math.ceil(menus.length / 2));

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <span className={styles.heroBadge}>Let's Build Together</span>

                        <h2>{ctaTitle}</h2>

                        <p>
                            Build modern digital experiences with confidence. Join our newsletter
                            and receive product updates, design inspiration and exclusive resources.
                        </p>
                    </div>

                    <div className={styles.heroAction}>
                        <div className={styles.newsletterForm}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={styles.input}
                            />

                            <Link href={ctaButtonHref} className={styles.subscribeButton}>
                                {ctaButtonText}
                                <i className="bi bi-arrow-right-short"></i>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className={styles.content}>
                    <div className={styles.brandCard}>
                        <Link href="/" className={styles.brand}>
                            <div className={styles.logoWrapper}>
                                <Image
                                    src={siteLogo}
                                    alt={siteName}
                                    fill
                                    sizes="64px"
                                    className={styles.logo}
                                />
                            </div>

                            <div>
                                <h3>{siteName}</h3>

                                <span>Professional Digital Solution</span>
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

                    <div className={styles.menuCard}>
                        <div className={styles.linksColumn}>
                            <div className={styles.columnHeader}>
                                <h4>Company</h4>
                                <span className={styles.columnLabel}>Navigation</span>
                            </div>

                            {companyMenus.map((item) => (
                                <Link key={`${item.label}-${item.href}`} href={item.href}>
                                    <i className="bi bi-arrow-right-short"></i>

                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className={styles.linksColumn}>
                            <div className={styles.columnHeader}>
                                <h4>Resources</h4>
                                <span className={styles.columnLabel}>Support</span>
                            </div>

                            {resourceMenus.map((item) => (
                                <Link key={`${item.label}-${item.href}`} href={item.href}>
                                    <i className="bi bi-arrow-right-short"></i>

                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className={styles.contactColumn}>
                            <div className={styles.columnHeader}>
                                <h4>Resources</h4>
                                <span className={styles.columnLabel}>Support</span>
                            </div>
                            <a
                                href={`tel:${site?.contactPhone ?? ''}`}
                                className={styles.contactCard}
                            >
                                <div className={styles.contactIcon}>
                                    <i className="bi bi-telephone"></i>
                                </div>

                                <div className={styles.contactContent}>
                                    <small>Phone</small>
                                    <span>{site?.contactPhone ?? '+84 123 456 789'}</span>
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
                                    <small>Email</small>
                                    <span>{site?.contactEmail ?? 'support@company.com'}</span>
                                </div>
                            </a>

                            <div className={styles.contactCard}>
                                <div className={styles.contactIcon}>
                                    <i className="bi bi-geo-alt"></i>
                                </div>

                                <div className={styles.contactContent}>
                                    <small>Location</small>
                                    <span>{address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className={styles.bottomBar}>
                    <div className={styles.copyright}>
                        <span>
                            © {new Date().getFullYear()} {siteName}
                        </span>

                        <p>Crafted with passion for modern businesses.</p>
                    </div>

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

export const FOOTER_SERVICE_03: RegItem = {
    kind: 'FooterService03',

    label: 'Footer Service 03',

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
            <FooterService03
                siteId={data.siteId}
                address={data.address}
                ctaTitle={data.ctaTitle}
                ctaButtonText={data.ctaButtonText}
                ctaButtonHref={data.ctaButtonHref}
            />
        );
    },
};

export default FooterService03;
