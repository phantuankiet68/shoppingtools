'use client';

import styles from '@/components/admin/shared/templates/services/heros/styles/hero-service-01.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export interface HeroService01Props {
    siteId?: string;

    badge?: string;
    badgeHref?: string;

    headline?: string;
    headlineAccent?: string;

    subheadline?: string;

    primaryCtaText?: string;
    primaryCtaHref?: string;

    secondaryCtaText?: string;
    secondaryCtaHref?: string;

    trustText?: string;

    stat1Value?: string;
    stat1Label?: string;
    stat2Value?: string;
    stat2Label?: string;
    stat3Value?: string;
    stat3Label?: string;

    imageSrc: string;
    imageAlt: string;
}

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.05) {
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

/* Animated counter */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref as React.RefObject<HTMLElement | null>);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = Math.ceil(to / 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= to) {
                setVal(to);
                clearInterval(timer);
            } else setVal(start);
        }, 18);
        return () => clearInterval(timer);
    }, [inView, to]);

    return (
        <span ref={ref}>
            {val.toLocaleString()}
            {suffix}
        </span>
    );
}

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function HeroService01({
    siteId,
    badge = '🚀 Kbuilder AI Website Builder',
    badgeHref = '#',

    headline = 'Build Stunning Websites\nWithout Writing Code',
    headlineAccent = 'Launch in Just 10 Minutes',

    subheadline = 'Design visually with our drag-and-drop canvas, customize professional templates, connect your own domain, and publish a fully responsive website in minutes.',

    primaryCtaText = 'Start Building Free',
    primaryCtaHref = '/signup',

    secondaryCtaText = 'Explore Templates',
    secondaryCtaHref = '/templates',

    trustText = 'No Coding Required · Custom Domain Support · Publish in 10 Minutes',

    stat1Value = '120',
    stat1Label = 'Premium Templates',

    stat2Value = '500',
    stat2Label = 'Drag & Drop Components',

    stat3Value = '10',
    stat3Label = 'Minutes to Launch',
    imageSrc = '/assets/images/hero.png',
    imageAlt = 'Kbuilder Website Builder',
}: HeroService01Props) {
    const site = useSite(siteId);
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    const siteName = site?.name ?? 'Nexora';

    const headlineLines = headline.split('\n');

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Hero"
        >
            {/* ── Background layers ── */}
            <div className={styles.bgGrid} aria-hidden="true" />
            <div className={styles.orbA} aria-hidden="true" />
            <div className={styles.orbB} aria-hidden="true" />
            <div className={styles.orbC} aria-hidden="true" />

            <div className={styles.wrap}>
                <div className={styles.copy}>
                    {/* Badge */}
                    <a
                        href={badgeHref}
                        className={`${styles.badge} ${styles.r}`}
                        style={{ '--i': 0 } as React.CSSProperties}
                    >
                        <span className={styles.badgeDot}></span>

                        <span>{badge}</span>

                        <i className="bi bi-arrow-right-short"></i>
                    </a>

                    {/* Hero */}
                    <div
                        className={`${styles.heroTitle} ${styles.r}`}
                        style={{ '--i': 1 } as React.CSSProperties}
                    >
                        <h1 className={styles.headline}>
                            {headlineLines.map((line, index) => (
                                <span key={index} className={styles.headlineLine}>
                                    {line}
                                </span>
                            ))}

                            <span className={styles.headlineAccent}>{headlineAccent}</span>
                        </h1>

                        <p className={styles.sub}>{subheadline}</p>
                    </div>

                    {/* CTA */}

                    <div
                        className={`${styles.ctaRow} ${styles.r}`}
                        style={{ '--i': 2 } as React.CSSProperties}
                    >
                        <Link href={primaryCtaHref} className={styles.btnPrimary}>
                            <span>{primaryCtaText}</span>

                            <i className="bi bi-arrow-right"></i>
                        </Link>

                        <Link href={secondaryCtaHref} className={styles.btnSecondary}>
                            <span className={styles.playRing}>
                                <i className="bi bi-play-fill"></i>
                            </span>

                            <span>{secondaryCtaText}</span>
                        </Link>
                    </div>

                    {/* Feature Pills */}

                    <div
                        className={`${styles.features} ${styles.r}`}
                        style={{ '--i': 3 } as React.CSSProperties}
                    >
                        {trustText.split(' · ').map((item) => (
                            <div key={item} className={styles.feature}>
                                <i className="bi bi-check-circle-fill"></i>

                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}

                    <div
                        className={`${styles.stats} ${styles.r}`}
                        style={{ '--i': 4 } as React.CSSProperties}
                    >
                        {[
                            {
                                value: stat1Value,
                                label: stat1Label,
                            },
                            {
                                value: stat2Value,
                                label: stat2Label,
                            },
                            {
                                value: stat3Value,
                                label: stat3Label,
                            },
                        ].map((item) => (
                            <div key={item.label} className={styles.stat}>
                                <strong>
                                    <Counter to={Number(item.value.replace(/\D/g, ''))} />

                                    <p>{item.value.replace(/\d/g, '') || '+'}</p>
                                </strong>

                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Card */}

                    <div
                        className={`${styles.highlightCard} ${styles.r}`}
                        style={{ '--i': 5 } as React.CSSProperties}
                    >
                        <div className={styles.highlightIcon}>
                            <i className="bi bi-stars"></i>
                        </div>

                        <div>
                            <strong>AI Powered Builder</strong>

                            <p>Build, customize and publish your website in under 10 minutes.</p>
                        </div>
                    </div>
                </div>
                <div className={styles.heroVisual}>
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        width={760}
                        height={560}
                        priority
                        className={styles.heroImage}
                    />

                    {/* Top Right */}

                    <div className={`${styles.floatingCard} ${styles.topRight}`}>
                        <div className={styles.avatarStack}>
                            <span />
                            <span />
                            <span />
                        </div>

                        <div>
                            <strong>+12 New Members</strong>

                            <p>Joined this week</p>
                        </div>
                    </div>

                    {/* Bottom Left */}

                    <div className={`${styles.floatingCard} ${styles.bottomLeft}`}>
                        <div className={styles.successIcon}>
                            <i className="bi bi-check-lg" />
                        </div>

                        <div>
                            <strong>Website Published</strong>

                            <p>mycompany.com</p>
                        </div>
                    </div>

                    {/* Floating Badge */}

                    <div className={`${styles.badgeFloat} ${styles.centerRight}`}>
                        <i className="bi bi-lightning-charge-fill" />
                        AI Generated
                    </div>

                    {/* Live Activity */}

                    <div className={styles.activityBar}>
                        <div className={styles.activityTrack}>
                            <span>🚀 Hero Section Updated</span>

                            <span>🎨 New Template Imported</span>

                            <span>🌐 Domain Connected</span>

                            <span>⚡ Website Published</span>

                            <span>🤖 AI Generated Content</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const HERO_SERVICE_01: RegItem = {
    kind: 'HeroService01',
    label: 'Hero Service 01',

    defaults: {
        badge: '🚀 Kbuilder AI Website Builder',
        badgeHref: '#',

        headline: 'Build Stunning Websites\nWithout Writing Code',
        headlineAccent: 'Launch in Just 10 Minutes',

        subheadline:
            'Design visually with an intuitive drag-and-drop canvas, customize professional templates, connect your own domain, and publish a fully responsive website in minutes.',

        primaryCtaText: 'Start Building Free',
        primaryCtaHref: '/signup',

        secondaryCtaText: 'Explore Templates',
        secondaryCtaHref: '/templates',

        trustText: 'No Coding Required · Custom Domain · Publish in 10 Minutes',

        stat1Value: '150',
        stat1Label: 'Premium Templates',

        stat2Value: '500',
        stat2Label: 'Reusable Components',

        stat3Value: '10',
        stat3Label: 'Minutes to Launch',

        imageSrc: '/assets/images/hero.png',
        imageAlt: 'Kbuilder Website Builder',
    },

    inspector: [
        { key: 'badge', label: 'Badge Text', kind: 'text' },
        { key: 'badgeHref', label: 'Badge Link', kind: 'text' },
        { key: 'headline', label: 'Headline', kind: 'text' },
        { key: 'headlineAccent', label: 'Headline Accent', kind: 'text' },
        { key: 'subheadline', label: 'Subheadline', kind: 'text' },
        { key: 'primaryCtaText', label: 'Primary CTA Text', kind: 'text' },
        { key: 'primaryCtaHref', label: 'Primary CTA Href', kind: 'text' },
        { key: 'secondaryCtaText', label: 'Secondary CTA Text', kind: 'text' },
        { key: 'secondaryCtaHref', label: 'Secondary CTA Href', kind: 'text' },
        { key: 'trustText', label: 'Trust Text', kind: 'text' },
        { key: 'stat1Value', label: 'Stat 1 Value', kind: 'text' },
        { key: 'stat1Label', label: 'Stat 1 Label', kind: 'text' },
        { key: 'stat2Value', label: 'Stat 2 Value', kind: 'text' },
        { key: 'stat2Label', label: 'Stat 2 Label', kind: 'text' },
        { key: 'stat3Value', label: 'Stat 3 Value', kind: 'text' },
        { key: 'stat3Label', label: 'Stat 3 Label', kind: 'text' },
    ],

    render: (props) => {
        const d = props as Record<string, any>;
        return (
            <HeroService01
                siteId={d.siteId}
                badge={d.badge}
                badgeHref={d.badgeHref}
                headline={d.headline}
                headlineAccent={d.headlineAccent}
                subheadline={d.subheadline}
                primaryCtaText={d.primaryCtaText}
                primaryCtaHref={d.primaryCtaHref}
                secondaryCtaText={d.secondaryCtaText}
                secondaryCtaHref={d.secondaryCtaHref}
                trustText={d.trustText}
                stat1Value={d.stat1Value}
                stat1Label={d.stat1Label}
                stat2Value={d.stat2Value}
                stat2Label={d.stat2Label}
                stat3Value={d.stat3Value}
                stat3Label={d.stat3Label}
                imageSrc={d.imageSrc}
                imageAlt={d.imageAlt}
            />
        );
    },
};

export default HeroService01;
