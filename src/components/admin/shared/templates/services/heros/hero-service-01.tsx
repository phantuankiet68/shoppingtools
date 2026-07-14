'use client';

import styles from '@/components/admin/shared/templates/services/heros/styles/hero-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export interface HeroService01Props {
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

    memberValue?: string;
    memberText?: string;

    publishTitle?: string;
    publishDomain?: string;

    aiBadgeText?: string;

    activityText1?: string;
    activityText2?: string;
    activityText3?: string;
    activityText4?: string;
    activityText5?: string;

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

    memberValue = '+12 New Members',
    memberText = 'Joined this week',

    publishTitle = 'Website Published',
    publishDomain = 'mycompany.com',

    aiBadgeText = 'AI Generated',

    activityText1 = '🚀 Hero Section Updated',
    activityText2 = '🎨 New Template Imported',
    activityText3 = '🌐 Domain Connected',
    activityText4 = '⚡ Website Published',
    activityText5 = '🤖 AI Generated Content',

    imageSrc = '/assets/images/hero.png',
    imageAlt = 'Kbuilder Website Builder',
}: HeroService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
    const headlineLines = headline.split('\n');
    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Hero"
        >
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
                    <div className={styles.overlay}>
                        <div className={`${styles.floatingCard} ${styles.topRight}`}>
                            <div className={styles.avatarStack}>
                                <span />
                                <span />
                                <span />
                            </div>
                            <div className={styles.successText}>
                                <strong>{memberValue}</strong>
                                <p>{memberText}</p>
                            </div>
                        </div>
                        <div className={`${styles.floatingCard} ${styles.bottomLeft}`}>
                            <div className={styles.successIcon}>
                                <i className="bi bi-check-lg" />
                            </div>
                            <div className={styles.successText}>
                                <strong>{publishTitle}</strong>
                                <p>{publishDomain}</p>
                            </div>
                        </div>
                        <div className={`${styles.badgeFloat} ${styles.centerRight}`}>
                            <i className="bi bi-lightning-charge-fill" />
                            {aiBadgeText}
                        </div>
                        <div className={styles.activityBar}>
                            <div className={styles.activityTrack}>
                                <span>{activityText1}</span>
                                <span>{activityText2}</span>
                                <span>{activityText3}</span>
                                <span>{activityText4}</span>
                                <span>{activityText5}</span>
                            </div>
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

        memberValue: '+12 New Members',
        memberText: 'Joined this week',

        publishTitle: 'Website Published',
        publishDomain: 'mycompany.com',

        aiBadgeText: 'AI Generated',

        activityText1: '🚀 Hero Section Updated',
        activityText2: '🎨 New Template Imported',
        activityText3: '🌐 Domain Connected',
        activityText4: '⚡ Website Published',
        activityText5: '🤖 AI Generated Content',

        imageSrc: '/assets/images/hero.png',
        imageAlt: 'Kbuilder Website Builder',
    },

    inspector: [
        { key: 'badge', label: 'Badge Text', kind: 'text' },
        { key: 'badgeHref', label: 'Badge Link', kind: 'text' },

        { key: 'headline', label: 'Headline', kind: 'textarea' },
        {
            key: 'headlineAccent',
            label: 'Headline Accent',
            kind: 'text',
        },
        {
            key: 'subheadline',
            label: 'Subheadline',
            kind: 'textarea',
        },

        {
            key: 'primaryCtaText',
            label: 'Primary CTA Text',
            kind: 'text',
        },
        {
            key: 'primaryCtaHref',
            label: 'Primary CTA Link',
            kind: 'text',
        },

        {
            key: 'secondaryCtaText',
            label: 'Secondary CTA Text',
            kind: 'text',
        },
        {
            key: 'secondaryCtaHref',
            label: 'Secondary CTA Link',
            kind: 'text',
        },

        {
            key: 'trustText',
            label: 'Trust Text',
            kind: 'textarea',
        },

        {
            key: 'memberValue',
            label: 'Member Value',
            kind: 'text',
        },
        {
            key: 'memberText',
            label: 'Member Description',
            kind: 'text',
        },

        {
            key: 'publishTitle',
            label: 'Publish Title',
            kind: 'text',
        },
        {
            key: 'publishDomain',
            label: 'Publish Domain',
            kind: 'text',
        },

        {
            key: 'aiBadgeText',
            label: 'AI Badge Text',
            kind: 'text',
        },

        {
            key: 'activityText1',
            label: 'Activity Text 1',
            kind: 'text',
        },
        {
            key: 'activityText2',
            label: 'Activity Text 2',
            kind: 'text',
        },
        {
            key: 'activityText3',
            label: 'Activity Text 3',
            kind: 'text',
        },
        {
            key: 'activityText4',
            label: 'Activity Text 4',
            kind: 'text',
        },
        {
            key: 'activityText5',
            label: 'Activity Text 5',
            kind: 'text',
        },

        {
            key: 'imageSrc',
            label: 'Hero Image',
            kind: 'image',
            folder: 'services/heros',
            accept: 'image/*',
        },
        {
            key: 'imageAlt',
            label: 'Image Alt',
            kind: 'text',
        },
    ],

    render: (props) => {
        const d = props as Record<string, any>;

        return (
            <HeroService01
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
                memberValue={d.memberValue}
                memberText={d.memberText}
                publishTitle={d.publishTitle}
                publishDomain={d.publishDomain}
                aiBadgeText={d.aiBadgeText}
                activityText1={d.activityText1}
                activityText2={d.activityText2}
                activityText3={d.activityText3}
                activityText4={d.activityText4}
                activityText5={d.activityText5}
                imageSrc={d.imageSrc}
                imageAlt={d.imageAlt}
            />
        );
    },
};

export default HeroService01;
