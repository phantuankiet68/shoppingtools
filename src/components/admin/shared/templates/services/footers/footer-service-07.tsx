'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-07.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type FooterNavItem = {
    label: string;
    href: string;
    children?: FooterNavItem[];
};

export interface FooterService07Props {
    siteId?: string;

    phone?: string;
    email?: string;
    address?: string;

    ctaTitle?: string;
    ctaDescription?: string;
    ctaButtonText?: string;
    ctaButtonHref?: string;

    tagline?: string;
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

function useScrollReveal(ref: React.RefObject<HTMLElement | null>) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);

    return visible;
}

export function FooterService07({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
    ctaTitle = 'Stay in the loop',
    ctaDescription = 'Get the latest insights on design, tech, and digital growth — straight to your inbox.',
    ctaButtonText = 'Subscribe',
    tagline = 'Crafting digital experiences that leave a lasting impression.',
}: FooterService07Props) {
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);
    const footerRef = useRef<HTMLElement>(null);
    const visible = useScrollReveal(footerRef);

    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    const companyMenus = menus.slice(0, Math.ceil(menus.length / 2));
    const resourceMenus = menus.slice(Math.ceil(menus.length / 2));

    const handleSubscribe = () => {
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <footer ref={footerRef} className={`${styles.footer} ${visible ? styles.visible : ''}`}>
            {/* Decorative blobs */}
            <div className={styles.blob1} aria-hidden="true" />
            <div className={styles.blob2} aria-hidden="true" />

            <div className={styles.container}>
                {/* ── CTA Banner ── */}
                <div className={styles.ctaBanner}>
                    <div className={styles.ctaContent}>
                        <h2 className={styles.ctaTitle}>{ctaTitle}</h2>
                        <p className={styles.ctaDesc}>{ctaDescription}</p>
                    </div>

                    <div className={styles.ctaForm}>
                        {subscribed ? (
                            <p className={styles.successMsg}>
                                <i className="bi bi-check-circle-fill" />
                                &nbsp;You're on the list — welcome aboard!
                            </p>
                        ) : (
                            <>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className={styles.input}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                                />
                                <button className={styles.ctaButton} onClick={handleSubscribe}>
                                    {ctaButtonText}
                                    <i className="bi bi-arrow-right" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.divider} />

                {/* ── Main Grid ── */}
                <div className={styles.grid}>
                    {/* Brand column */}
                    <div
                        className={`${styles.brand} ${styles.fadeUp}`}
                        style={{ '--delay': '0ms' } as React.CSSProperties}
                    >
                        <Link href="/" className={styles.brandLink}>
                            <div className={styles.logoWrapper}>
                                <Image
                                    src={siteLogo}
                                    alt={siteName}
                                    fill
                                    sizes="56px"
                                    className={styles.logo}
                                />
                            </div>
                            <span className={styles.siteName}>{siteName}</span>
                        </Link>

                        <p className={styles.tagline}>{site?.seoDescription ?? tagline}</p>

                        <div className={styles.socials}>
                            {[
                                { icon: 'facebook', href: '#' },
                                { icon: 'instagram', href: '#' },
                                { icon: 'linkedin', href: '#' },
                                { icon: 'youtube', href: '#' },
                                { icon: 'twitter-x', href: '#' },
                                { icon: 'tiktok', href: '#' },
                            ].map(({ icon, href }) => (
                                <a
                                    key={icon}
                                    href={href}
                                    className={styles.socialIcon}
                                    aria-label={icon}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className={`bi bi-${icon}`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company links */}
                    {companyMenus.length > 0 && (
                        <div
                            className={`${styles.navCol} ${styles.fadeUp}`}
                            style={{ '--delay': '80ms' } as React.CSSProperties}
                        >
                            <h3 className={styles.colHeading}>Company</h3>
                            <ul className={styles.navList}>
                                {companyMenus.map((item) => (
                                    <li key={`${item.label}-${item.href}`}>
                                        <Link href={item.href} className={styles.navLink}>
                                            <i className="bi bi-chevron-right" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Resources links */}
                    {resourceMenus.length > 0 && (
                        <div
                            className={`${styles.navCol} ${styles.fadeUp}`}
                            style={{ '--delay': '160ms' } as React.CSSProperties}
                        >
                            <h3 className={styles.colHeading}>Resources</h3>
                            <ul className={styles.navList}>
                                {resourceMenus.map((item) => (
                                    <li key={`${item.label}-${item.href}`}>
                                        <Link href={item.href} className={styles.navLink}>
                                            <i className="bi bi-chevron-right" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contact column */}
                    <div
                        className={`${styles.contactCol} ${styles.fadeUp}`}
                        style={{ '--delay': '240ms' } as React.CSSProperties}
                    >
                        <h3 className={styles.colHeading}>Get in touch</h3>

                        <ul className={styles.contactList}>
                            {site?.contactPhone && (
                                <li>
                                    <a
                                        href={`tel:${site.contactPhone}`}
                                        className={styles.contactItem}
                                    >
                                        <span className={styles.contactIcon}>
                                            <i className="bi bi-telephone-fill" />
                                        </span>
                                        <span>{site.contactPhone}</span>
                                    </a>
                                </li>
                            )}

                            {site?.contactEmail && (
                                <li>
                                    <a
                                        href={`mailto:${site.contactEmail}`}
                                        className={styles.contactItem}
                                    >
                                        <span className={styles.contactIcon}>
                                            <i className="bi bi-envelope-fill" />
                                        </span>
                                        <span>{site.contactEmail}</span>
                                    </a>
                                </li>
                            )}

                            <li>
                                <div className={styles.contactItem}>
                                    <span className={styles.contactIcon}>
                                        <i className="bi bi-geo-alt-fill" />
                                    </span>
                                    <span>{address}</span>
                                </div>
                            </li>
                        </ul>

                        <Link href="/blog" className={styles.blogPill}>
                            <i className="bi bi-stars" />
                            Latest articles
                        </Link>
                    </div>
                </div>

                <div className={styles.divider} />

                {/* ── Bottom bar ── */}
                <div className={styles.bottom}>
                    <span className={styles.copyright}>
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </span>

                    <div className={styles.bottomLinks}>
                        <Link href="/privacy">Privacy</Link>
                        <Link href="/terms">Terms</Link>
                        <Link href="/cookies">Cookies</Link>
                    </div>

                    <button
                        className={styles.toTop}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        aria-label="Back to top"
                    >
                        <i className="bi bi-arrow-up" />
                        <span>Top</span>
                    </button>
                </div>
            </div>
        </footer>
    );
}

export const FOOTER_SERVICE_07: RegItem = {
    kind: 'FooterService07',

    label: 'Footer Service 07',

    defaults: {
        address: 'Ho Chi Minh City, Vietnam',
        ctaTitle: 'Stay in the loop',
        ctaDescription:
            'Get the latest insights on design, tech, and digital growth — straight to your inbox.',
        ctaButtonText: 'Subscribe',
        tagline: 'Crafting digital experiences that leave a lasting impression.',
    },

    inspector: [
        {
            key: 'address',
            label: 'Address',
            kind: 'text',
        },
        {
            key: 'tagline',
            label: 'Brand Tagline',
            kind: 'text',
        },
        {
            key: 'ctaTitle',
            label: 'CTA Title',
            kind: 'text',
        },
        {
            key: 'ctaDescription',
            label: 'CTA Description',
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
            <FooterService07
                siteId={data.siteId}
                address={data.address}
                tagline={data.tagline}
                ctaTitle={data.ctaTitle}
                ctaDescription={data.ctaDescription}
                ctaButtonText={data.ctaButtonText}
                ctaButtonHref={data.ctaButtonHref}
            />
        );
    },
};

export default FooterService07;
