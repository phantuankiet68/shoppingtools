'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-09.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export type FooterNavItem = {
    label: string;
    href: string;
    children?: FooterNavItem[];
};

export interface FooterService09Props {
    siteId?: string;

    address?: string;
    tagline?: string;

    ctaTitle?: string;
    ctaDescription?: string;
    ctaButtonText?: string;
    ctaButtonHref?: string;

    appStoreHref?: string;
    googlePlayHref?: string;
    showAppDownload?: boolean;
}

/* ─────────────────────────────────────────────────
   Hooks
───────────────────────────────────────────────── */
function useSiteMenus(siteId?: string) {
    const [menus, setMenus] = useState<FooterNavItem[]>([]);

    useEffect(() => {
        if (!siteId) {
            setMenus([]);
            return;
        }
        fetch(`/api/v1/sites/${siteId}/menus`)
            .then((r) => r.json())
            .then((d) => setMenus(Array.isArray(d?.data) ? d.data : []))
            .catch(() => setMenus([]));
    }, [siteId]);

    return menus;
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.06) {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
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

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function FooterService09({
    siteId,
    address = 'Ho Chi Minh City, Vietnam',
    tagline = 'We craft digital products that perform as well as they look — built for scale, designed for humans.',
    ctaTitle = 'Get the inside edge',
    ctaDescription = 'Weekly insights on product design, engineering, and whats moving the industry. No filler, just signal.',
    ctaButtonText = 'Join the list',
    appStoreHref = '#',
    googlePlayHref = '#',
    showAppDownload = true,
}: FooterService09Props) {
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    const [email, setEmail] = useState('');
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'done'>('idle');

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';
    const siteName = site?.name ?? 'Website';

    const half = Math.ceil(menus.length / 2);
    const companyMenus = menus.slice(0, half);
    const resourceMenus = menus.slice(half);

    const handleSub = async () => {
        if (!email.trim() || subStatus !== 'idle') return;
        setSubStatus('loading');
        await new Promise((r) => setTimeout(r, 800));
        setSubStatus('done');
        setEmail('');
    };

    const socials = [
        { id: 'facebook', label: 'Facebook' },
        { id: 'instagram', label: 'Instagram' },
        { id: 'linkedin', label: 'LinkedIn' },
        { id: 'youtube', label: 'YouTube' },
        { id: 'twitter-x', label: 'X / Twitter' },
        { id: 'tiktok', label: 'TikTok' },
    ];

    return (
        <footer ref={rootRef} className={`${styles.root} ${inView ? styles.inView : ''}`}>
            {/* noise + orbs are CSS ::before / ::after on .root */}

            <div className={styles.wrap}>
                {/* ═══════════════════════════════════════
                    TOP: CTA newsletter
                ═══════════════════════════════════════ */}
                <section
                    className={`${styles.cta} ${styles.r}`}
                    style={{ '--i': 0 } as React.CSSProperties}
                >
                    {/* animated gradient ring — done with CSS @property on .cta::before */}

                    <div className={styles.ctaLeft}>
                        <span className={styles.pill}>
                            <i className="bi bi-stars" />
                            Newsletter
                        </span>
                        <h2 className={styles.ctaH}>{ctaTitle}</h2>
                        <p className={styles.ctaP}>{ctaDescription}</p>
                    </div>

                    <div className={styles.ctaRight}>
                        {subStatus === 'done' ? (
                            <div className={styles.subDone}>
                                <span className={styles.subDoneIcon}>
                                    <i className="bi bi-check-lg" />
                                </span>
                                <div>
                                    <strong>You're in!</strong>
                                    <p>Expect something worth reading in your inbox soon.</p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.subForm}>
                                <div className={styles.inputWrap}>
                                    <i className="bi bi-envelope" />
                                    <input
                                        type="email"
                                        className={styles.subInput}
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSub()}
                                        disabled={subStatus === 'loading'}
                                    />
                                </div>
                                <button
                                    className={`${styles.subBtn} ${subStatus === 'loading' ? styles.subLoading : ''}`}
                                    onClick={handleSub}
                                    disabled={subStatus === 'loading'}
                                >
                                    {subStatus === 'loading' ? (
                                        <span className={styles.spinner} />
                                    ) : (
                                        <>
                                            {ctaButtonText} <i className="bi bi-arrow-right" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <p className={styles.subNote}>
                            <i className="bi bi-lock-fill" />
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </section>

                {/* separator */}
                <div className={styles.sep} />

                {/* ═══════════════════════════════════════
                    MIDDLE: main info grid
                ═══════════════════════════════════════ */}
                <div className={styles.grid}>
                    {/* ── Brand column ── */}
                    <div
                        className={`${styles.brandCol} ${styles.r}`}
                        style={{ '--i': 1 } as React.CSSProperties}
                    >
                        <Link href="/" className={styles.brandMark}>
                            <span className={styles.logoRing}>
                                <div className={styles.logoBox}>
                                    <Image
                                        src={siteLogo}
                                        alt={siteName}
                                        fill
                                        sizes="44px"
                                        className={styles.logoImg}
                                    />
                                </div>
                            </span>
                            <span className={styles.brandName}>{siteName}</span>
                        </Link>

                        <p className={styles.brandTagline}>{site?.seoDescription ?? tagline}</p>

                        {/* ── Socials ── */}
                        <div className={styles.socialGrid}>
                            {socials.map(({ id, label }) => (
                                <a
                                    key={id}
                                    href="#"
                                    aria-label={label}
                                    className={styles.socialBtn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className={`bi bi-${id}`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Company nav ── */}
                    {companyMenus.length > 0 && (
                        <nav
                            className={`${styles.navCol} ${styles.r}`}
                            style={{ '--i': 2 } as React.CSSProperties}
                            aria-label="Company"
                        >
                            <p className={styles.navHead}>Company</p>
                            <ul className={styles.navUl}>
                                {companyMenus.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className={styles.navA}>
                                            <span className={styles.navArrow}>
                                                <i className="bi bi-arrow-right-short" />
                                            </span>
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
                            className={`${styles.navCol} ${styles.r}`}
                            style={{ '--i': 3 } as React.CSSProperties}
                            aria-label="Resources"
                        >
                            <p className={styles.navHead}>Resources</p>
                            <ul className={styles.navUl}>
                                {resourceMenus.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className={styles.navA}>
                                            <span className={styles.navArrow}>
                                                <i className="bi bi-arrow-right-short" />
                                            </span>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {/* ── Contact ── */}
                    <div
                        className={`${styles.contactCol} ${styles.r}`}
                        style={{ '--i': 4 } as React.CSSProperties}
                    >
                        <p className={styles.navHead}>Contact</p>

                        <ul className={styles.contactUl}>
                            {site?.contactPhone && (
                                <li>
                                    <a
                                        href={`tel:${site.contactPhone}`}
                                        className={styles.contactItem}
                                    >
                                        <span className={styles.cIcon}>
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
                                        <span className={styles.cIcon}>
                                            <i className="bi bi-envelope-fill" />
                                        </span>
                                        <span>{site.contactEmail}</span>
                                    </a>
                                </li>
                            )}
                            <li>
                                <div className={styles.contactItem}>
                                    <span className={styles.cIcon}>
                                        <i className="bi bi-geo-alt-fill" />
                                    </span>
                                    <span>{address}</span>
                                </div>
                            </li>
                        </ul>

                        <Link href="/blog" className={styles.blogBtn}>
                            <i className="bi bi-journal-richtext" />
                            <span>Latest articles</span>
                            <i className="bi bi-arrow-up-right" />
                        </Link>
                    </div>
                    {/* ── App Download ── */}
                    {showAppDownload && (
                        <div className={styles.appBlock}>
                            <span className={styles.appBlockLabel}>
                                <i className="bi bi-phone" /> Available on mobile
                            </span>

                            <div className={styles.appBadges}>
                                <a
                                    href={googlePlayHref}
                                    className={styles.appBadge}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Get it on Google Play"
                                >
                                    <i className={`bi bi-google-play ${styles.appIcon}`} />
                                    <span className={styles.appBadgeText}>
                                        <small>Get it on</small>
                                        Google Play
                                    </span>
                                    <i className={`bi bi-arrow-up-right ${styles.appArrow}`} />
                                </a>

                                <a
                                    href={appStoreHref}
                                    className={styles.appBadge}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Download on the App Store"
                                >
                                    <i className={`bi bi-apple ${styles.appIcon}`} />
                                    <span className={styles.appBadgeText}>
                                        <small>Download on the</small>
                                        App Store
                                    </span>
                                    <i className={`bi bi-arrow-up-right ${styles.appArrow}`} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════
                    BOTTOM BAR
                ═══════════════════════════════════════ */}
                <div className={styles.bottomSep} />

                <div className={styles.bottom}>
                    <span className={styles.copy}>
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </span>

                    <nav className={styles.legal} aria-label="Legal">
                        <Link href="/privacy">Privacy Policy</Link>
                        <span className={styles.dot} />
                        <Link href="/terms">Terms of Use</Link>
                        <span className={styles.dot} />
                        <Link href="/cookies">Cookie Settings</Link>
                    </nav>

                    <button
                        className={styles.topBtn}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        aria-label="Back to top"
                    >
                        <i className="bi bi-chevron-up" />
                        <span>Top</span>
                    </button>
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const FOOTER_SERVICE_09: RegItem = {
    kind: 'FooterService09',
    label: 'Footer Service 09',

    defaults: {
        address: 'Ho Chi Minh City, Vietnam',
        tagline:
            'We craft digital products that perform as well as they look — built for scale, designed for humans.',
        ctaTitle: 'Get the inside edge',
        ctaDescription:
            'Weekly insights on product design, engineering, and what moving the industry. No filler, just signal.',
        ctaButtonText: 'Join the list',
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
            <FooterService09
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

export default FooterService09;
