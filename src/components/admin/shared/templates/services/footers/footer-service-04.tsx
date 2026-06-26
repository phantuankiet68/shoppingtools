'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-04.module.css';
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

export interface FooterService04Props {
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

export function FooterService04({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
    ctaTitle = 'Subscribe to our newsletter',
    ctaButtonText = 'Subscribe',
    ctaButtonHref = '/contact',
}: FooterService04Props) {
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
                    <span className={styles.heroBadge}>Digital Partner</span>

                    <h2>
                        Build your next
                        <br />
                        digital experience.
                    </h2>

                    <p>
                        We create modern websites, scalable platforms and digital solutions that
                        help businesses grow faster.
                    </p>

                    <div className={styles.heroActions}>
                        <Link href={ctaButtonHref} className={styles.primaryButton}>
                            {ctaButtonText}
                        </Link>

                        <Link href="/contact" className={styles.secondaryButton}>
                            Contact Us
                        </Link>
                    </div>
                </section>

                <section className={styles.grid}>
                    <div className={styles.brand}>
                        <Link href="/" className={styles.brandInfo}>
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

                                <span>Professional Digital Studio</span>
                            </div>
                        </Link>

                        <p>
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

                    <div className={styles.navigation}>
                        <h4>Company</h4>

                        {companyMenus.map((item) => (
                            <Link key={`${item.label}-${item.href}`} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.resources}>
                        <h4>Resources</h4>

                        {resourceMenus.map((item) => (
                            <Link key={`${item.label}-${item.href}`} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.contact}>
                        <h4>Contact</h4>

                        <a href={`tel:${site?.contactPhone ?? ''}`}>
                            <i className="bi bi-telephone"></i>

                            <span>{site?.contactPhone}</span>
                        </a>

                        <a href={`mailto:${site?.contactEmail ?? ''}`}>
                            <i className="bi bi-envelope"></i>

                            <span>{site?.contactEmail}</span>
                        </a>

                        <div>
                            <i className="bi bi-geo-alt"></i>

                            <span>{address}</span>
                        </div>
                    </div>

                    <div className={styles.newsletter}>
                        <h4>Stay Updated</h4>

                        <p>Receive product updates, articles and exclusive resources.</p>

                        <div className={styles.newsletterForm}>
                            <input
                                type="email"
                                placeholder="Email address"
                                className={styles.input}
                            />

                            <button className={styles.subscribeButton}>Subscribe</button>
                        </div>
                    </div>
                </section>

                <div className={styles.bottomBar}>
                    <span>
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </span>

                    <div className={styles.bottomLinks}>
                        <Link href="/privacy">Privacy</Link>

                        <Link href="/terms">Terms</Link>

                        <Link href="/cookies">Cookies</Link>
                    </div>

                    <button className={styles.toTop}>
                        <i className="bi bi-arrow-up"></i>
                    </button>
                </div>
            </div>
        </footer>
    );
}

export const FOOTER_SERVICE_04: RegItem = {
    kind: 'FooterService04',

    label: 'Footer Service 04',

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
            <FooterService04
                siteId={data.siteId}
                address={data.address}
                ctaTitle={data.ctaTitle}
                ctaButtonText={data.ctaButtonText}
                ctaButtonHref={data.ctaButtonHref}
            />
        );
    },
};

export default FooterService04;
