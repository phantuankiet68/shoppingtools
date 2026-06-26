'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-06.module.css';
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

export interface FooterService06Props {
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

export function FooterService06({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
}: FooterService06Props) {
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    const companyMenus = menus.slice(0, Math.ceil(menus.length / 2));
    const resourceMenus = menus.slice(Math.ceil(menus.length / 2));

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <section className={styles.intro}>
                    <Link href="/" className={styles.brand}>
                        <div className={styles.logoWrapper}>
                            <Image
                                src={siteLogo}
                                alt={siteName}
                                fill
                                sizes="72px"
                                className={styles.logo}
                            />
                        </div>

                        <div>
                            <h2>{siteName}</h2>

                            <span>Professional Digital Studio</span>
                        </div>
                    </Link>

                    <p>
                        {site?.seoDescription ??
                            'Building modern digital experiences that help businesses grow through technology and design.'}
                    </p>
                </section>

                <nav className={styles.navigation}>
                    {companyMenus.map((item) => (
                        <Link key={`${item.label}-${item.href}`} href={item.href}>
                            {item.label}
                        </Link>
                    ))}

                    {resourceMenus.map((item) => (
                        <Link key={`${item.label}-${item.href}`} href={item.href}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <section className={styles.widgets}>
                    <article className={styles.widget}>
                        <span className={styles.widgetLabel}>Contact</span>

                        <a href={`tel:${site?.contactPhone ?? ''}`}>
                            <i className="bi bi-telephone"></i>

                            {site?.contactPhone}
                        </a>

                        <a href={`mailto:${site?.contactEmail ?? ''}`}>
                            <i className="bi bi-envelope"></i>

                            {site?.contactEmail}
                        </a>

                        <div>
                            <i className="bi bi-geo-alt"></i>

                            {address}
                        </div>
                    </article>

                    <article className={styles.widget}>
                        <span className={styles.widgetLabel}>Newsletter</span>
                        <p>Receive product news, design inspiration and exclusive updates.</p>

                        <div className={styles.newsletter}>
                            <input
                                type="email"
                                placeholder="Email address"
                                className={styles.input}
                            />

                            <button className={styles.subscribeButton}>Subscribe</button>
                        </div>
                    </article>

                    <article className={styles.widget}>
                        <span className={styles.widgetLabel}>Community</span>

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

                            <a href="#">
                                <i className="bi bi-twitter-x"></i>
                            </a>
                        </div>

                        <Link href="/blog" className={styles.blogLink}>
                            Explore our latest articles →
                        </Link>
                    </article>
                </section>

                <div className={styles.bottom}>
                    <span>
                        © {new Date().getFullYear()} {siteName}
                    </span>

                    <div className={styles.bottomLinks}>
                        <Link href="/privacy">Privacy</Link>

                        <Link href="/terms">Terms</Link>

                        <Link href="/cookies">Cookies</Link>
                    </div>

                    <button className={styles.toTop}>Back to top</button>
                </div>
            </div>
        </footer>
    );
}

export const FOOTER_SERVICE_06: RegItem = {
    kind: 'FooterService06',

    label: 'Footer Service 06',

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
            <FooterService06
                siteId={data.siteId}
                address={data.address}
                ctaTitle={data.ctaTitle}
                ctaButtonText={data.ctaButtonText}
                ctaButtonHref={data.ctaButtonHref}
            />
        );
    },
};

export default FooterService06;
