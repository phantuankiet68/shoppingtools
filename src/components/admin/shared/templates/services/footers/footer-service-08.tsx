'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-08.module.css';
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

export interface FooterService08Props {
    siteId?: string;

    address?: string;

    ctaTitle?: string;
    ctaDescription?: string;
    ctaButtonText?: string;
    ctaButtonHref?: string;

    tagline?: string;

    appStoreHref?: string;
    googlePlayHref?: string;
    appStoreQrUrl?: string;
    googlePlayQrUrl?: string;
    showAppDownload?: boolean;
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
            .catch(() => setMenus([]));
    }, [siteId]);

    return menus;
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.08) {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    obs.disconnect();
                }
            },
            { threshold },
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [ref, threshold]);

    return inView;
}

export function FooterService08({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
    ctaTitle = 'Stay ahead of the curve',
    ctaDescription = 'Join thousands of designers and developers who get our weekly digest on product, design, and technology.',
    ctaButtonText = 'Subscribe free',
    tagline = 'We build digital products that are fast, beautiful, and built to last.',
    appStoreHref = '#',
    googlePlayHref = '#',
    showAppDownload = true,
}: FooterService08Props) {
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);

    const footerRef = useRef<HTMLElement>(null);
    const inView = useInView(footerRef);

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    const half = Math.ceil(menus.length / 2);
    const companyMenus = menus.slice(0, half);
    const resourceMenus = menus.slice(half);

    const handleSubscribe = () => {
        if (email.trim()) {
            setStatus('success');
            setEmail('');
        }
    };

    const socialLinks = [
        { icon: 'facebook', label: 'Facebook', href: '#' },
        { icon: 'instagram', label: 'Instagram', href: '#' },
        { icon: 'linkedin', label: 'LinkedIn', href: '#' },
        { icon: 'youtube', label: 'YouTube', href: '#' },
        { icon: 'twitter-x', label: 'Twitter / X', href: '#' },
        { icon: 'tiktok', label: 'TikTok', href: '#' },
    ];

    return (
        <footer ref={footerRef} className={`${styles.footer} ${inView ? styles.inView : ''}`}>
            {/* ── Background decorations (replicated via CSS ::before / ::after on .footer) ── */}

            <div className={styles.inner}>
                {/* ══════════════ CTA STRIP ══════════════ */}
                <div className={styles.ctaStrip}>
                    <div className={styles.ctaStripLeft}>
                        <span className={styles.ctaEyebrow}>
                            <i className="bi bi-lightning-charge-fill" />
                            Newsletter
                        </span>
                        <h2 className={styles.ctaHeading}>{ctaTitle}</h2>
                        <p className={styles.ctaBody}>{ctaDescription}</p>
                    </div>

                    <div className={styles.ctaStripRight}>
                        {status === 'success' ? (
                            <div className={styles.successCard}>
                                <i className="bi bi-check-circle-fill" />
                                <p>You're in! Check your inbox for a confirmation.</p>
                            </div>
                        ) : (
                            <div className={styles.ctaFormWrap}>
                                <div className={styles.inputGroup}>
                                    <i className={`bi bi-envelope ${styles.inputIcon}`} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                                        placeholder="Enter your email"
                                        className={styles.emailInput}
                                    />
                                </div>
                                <button className={styles.subBtn} onClick={handleSubscribe}>
                                    {ctaButtonText}
                                    <i className="bi bi-arrow-right-short" />
                                </button>
                            </div>
                        )}
                        <p className={styles.ctaNote}>
                            <i className="bi bi-shield-check" />
                            No spam, ever. Unsubscribe anytime.
                        </p>
                    </div>
                </div>

                {/* ══════════════ MAIN GRID ══════════════ */}
                <div className={styles.mainGrid}>
                    {/* ── Brand ── */}
                    <div
                        className={`${styles.brandCol} ${styles.reveal}`}
                        style={{ '--i': 0 } as React.CSSProperties}
                    >
                        <Link href="/" className={styles.brandMark}>
                            <div className={styles.logoBox}>
                                <Image
                                    src={siteLogo}
                                    alt={siteName}
                                    fill
                                    sizes="48px"
                                    className={styles.logoImg}
                                />
                            </div>
                            <span className={styles.brandName}>{siteName}</span>
                        </Link>

                        <p className={styles.brandTagline}>{site?.seoDescription ?? tagline}</p>

                        {/* Socials */}
                        <div className={styles.socialRow}>
                            {socialLinks.map(({ icon, label, href }) => (
                                <a
                                    key={icon}
                                    href={href}
                                    className={styles.socialBtn}
                                    aria-label={label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className={`bi bi-${icon}`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Company nav ── */}
                    {companyMenus.length > 0 && (
                        <nav
                            className={`${styles.navCol} ${styles.reveal}`}
                            style={{ '--i': 1 } as React.CSSProperties}
                            aria-label="Company links"
                        >
                            <h3 className={styles.navHeading}>Company</h3>
                            <ul className={styles.navList}>
                                {companyMenus.map((item) => (
                                    <li key={`${item.label}-${item.href}`}>
                                        <Link href={item.href} className={styles.navLink}>
                                            <span className={styles.navDot} />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {/* ── Resources nav ── */}
                    {resourceMenus.length > 0 && (
                        <nav
                            className={`${styles.navCol} ${styles.reveal}`}
                            style={{ '--i': 2 } as React.CSSProperties}
                            aria-label="Resources links"
                        >
                            <h3 className={styles.navHeading}>Resources</h3>
                            <ul className={styles.navList}>
                                {resourceMenus.map((item) => (
                                    <li key={`${item.label}-${item.href}`}>
                                        <Link href={item.href} className={styles.navLink}>
                                            <span className={styles.navDot} />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {/* ── Contact ── */}
                    <div
                        className={`${styles.contactCol} ${styles.reveal}`}
                        style={{ '--i': 3 } as React.CSSProperties}
                    >
                        <h3 className={styles.navHeading}>Contact</h3>

                        <ul className={styles.contactList}>
                            {site?.contactPhone && (
                                <li>
                                    <a
                                        href={`tel:${site.contactPhone}`}
                                        className={styles.contactRow}
                                    >
                                        <span className={styles.contactIconWrap}>
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
                                        className={styles.contactRow}
                                    >
                                        <span className={styles.contactIconWrap}>
                                            <i className="bi bi-envelope-fill" />
                                        </span>
                                        <span>{site.contactEmail}</span>
                                    </a>
                                </li>
                            )}
                            <li>
                                <div className={styles.contactRow}>
                                    <span className={styles.contactIconWrap}>
                                        <i className="bi bi-geo-alt-fill" />
                                    </span>
                                    <span>{address}</span>
                                </div>
                            </li>
                        </ul>

                        <Link href="/blog" className={styles.blogCta}>
                            <i className="bi bi-journal-bookmark-fill" />
                            Read our blog
                            <i className="bi bi-arrow-right" />
                        </Link>
                    </div>
                    {/* App download */}
                    {showAppDownload && (
                        <div className={styles.appSection}>
                            <span className={styles.appLabel}>Download our app</span>
                            <div className={styles.appBadges}>
                                <a
                                    href={googlePlayHref}
                                    className={styles.appBadge}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Get it on Google Play"
                                >
                                    <i className={`bi bi-google-play ${styles.appBadgeIcon}`} />
                                    <span className={styles.appBadgeText}>
                                        <small>Get it on</small>
                                        Google Play
                                    </span>
                                </a>

                                <a
                                    href={appStoreHref}
                                    className={styles.appBadge}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Download on the App Store"
                                >
                                    <i className={`bi bi-apple ${styles.appBadgeIcon}`} />
                                    <span className={styles.appBadgeText}>
                                        <small>Download on the</small>
                                        App Store
                                    </span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* ══════════════ BOTTOM BAR ══════════════ */}
                <div className={styles.bottomBar}>
                    <span className={styles.copyright}>
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </span>

                    <div className={styles.legalLinks}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <span className={styles.legalDot} />
                        <Link href="/terms">Terms of Use</Link>
                        <span className={styles.legalDot} />
                        <Link href="/cookies">Cookie Settings</Link>
                    </div>

                    <button
                        className={styles.backTop}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        aria-label="Back to top"
                    >
                        <i className="bi bi-arrow-up" />
                    </button>
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────
   Registry
───────────────────────────────────────── */
export const FOOTER_SERVICE_08: RegItem = {
    kind: 'FooterService08',
    label: 'Footer Service 08',

    defaults: {
        address: 'Ho Chi Minh City, Vietnam',
        tagline: 'We build digital products that are fast, beautiful, and built to last.',
        ctaTitle: 'Stay ahead of the curve',
        ctaDescription:
            'Join thousands of designers and developers who get our weekly digest on product, design, and technology.',
        ctaButtonText: 'Subscribe free',
        ctaButtonHref: '/contact',
        appStoreHref: '#',
        googlePlayHref: '#',
        showAppDownload: true,
    },

    inspector: [
        { key: 'address', label: 'Address', kind: 'text' },
        { key: 'tagline', label: 'Brand Tagline', kind: 'text' },
        { key: 'ctaTitle', label: 'CTA Title', kind: 'text' },
        { key: 'ctaDescription', label: 'CTA Description', kind: 'text' },
        { key: 'ctaButtonText', label: 'CTA Button Text', kind: 'text' },
        { key: 'ctaButtonHref', label: 'CTA Button Href', kind: 'text' },
        { key: 'googlePlayHref', label: 'Google Play URL', kind: 'text' },
        { key: 'appStoreHref', label: 'App Store URL', kind: 'text' },
    ],

    render: (props) => {
        const d = props as Record<string, any>;
        return (
            <FooterService08
                siteId={d.siteId}
                address={d.address}
                tagline={d.tagline}
                ctaTitle={d.ctaTitle}
                ctaDescription={d.ctaDescription}
                ctaButtonText={d.ctaButtonText}
                ctaButtonHref={d.ctaButtonHref}
                googlePlayHref={d.googlePlayHref}
                appStoreHref={d.appStoreHref}
                showAppDownload={d.showAppDownload}
            />
        );
    },
};

export default FooterService08;
