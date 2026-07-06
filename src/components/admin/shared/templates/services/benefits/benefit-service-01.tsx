'use client';

import styles from '@/components/admin/shared/templates/services/benefits/styles/benefit-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export interface BenefitItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    tags?: string[];
    accentColor?: string;
}

export interface BenefitService01Props {
    siteId?: string;

    eyebrow?: string;
    headline?: string;
    headlineAccent?: string;
    subheadline?: string;

    ctaText?: string;
    ctaHref?: string;
    ctaSubText?: string;

    benefits?: BenefitItem[];

    layout?: 'grid-2' | 'grid-3' | 'grid-4';
}

/* ─────────────────────────────────────────────────
   Default data
───────────────────────────────────────────────── */
const DEFAULT_BENEFITS: BenefitItem[] = [
    {
        id: 'launch',
        icon: 'rocket-takeoff-fill',
        title: 'Launch in 10 Minutes',
        description:
            'Kbuilder auto-generates a complete website with pages, navigation, and reusable sections. Pick your type, customize, and publish.',
        tags: ['Landing Page', 'Blog', 'E-commerce'],
        accentColor: '#6366F1',
    },
    {
        id: 'business-type',
        icon: 'diagram-3-fill',
        title: 'Built for Every Business',
        description:
            'Start with professionally designed templates tailored to your business — from booking systems to LMS and online stores.',
        tags: ['Booking', 'LMS', 'Store'],
        accentColor: '#0EA5E9',
    },
    {
        id: 'no-code',
        icon: 'display-fill',
        title: 'No Coding Required',
        description:
            'Create and edit your website visually. Update text, images, layouts, and sections directly on the page without writing a single line of code.',
        tags: ['Visual Editor', 'Drag & Drop'],
        accentColor: '#10B981',
    },
    {
        id: 'page-gen',
        icon: 'lightning-charge-fill',
        title: 'Smart Page Generator',
        description:
            'Generate complete page structures in minutes — Home, About, Services, Blog, FAQ, Policy, and more. Review, edit or remove at any time.',
        tags: ['Home', 'About', 'Services', 'Contact'],
        accentColor: '#F59E0B',
    },
    {
        id: 'templates',
        icon: 'grid-1x2-fill',
        title: 'Professional Templates',
        description:
            'Choose from a growing library of responsive templates and reusable components designed for modern businesses of all sizes.',
        tags: ['Responsive', 'Modern UI', 'Reusable'],
        accentColor: '#EC4899',
    },
    {
        id: 'marketing',
        icon: 'graph-up-arrow',
        title: 'Built-in Marketing Tools',
        description:
            'Everything to grow your business in one platform — Google, Facebook & TikTok integrations, Email Marketing, SEO, Analytics, and Customer Chat.',
        tags: ['SEO', 'Analytics', 'Email'],
        accentColor: '#8B5CF6',
    },
    {
        id: 'deployment',
        icon: 'cloud-arrow-up-fill',
        title: 'Automated Deployment',
        description:
            'Connect your domain and Kbuilder automatically configures and publishes your website with minimal setup — no DevOps needed.',
        tags: ['One Click', 'Auto Deploy', 'Custom Domain'],
        accentColor: '#14B8A6',
    },
    {
        id: 'control',
        icon: 'shield-lock-fill',
        title: 'Your Website control',
        description:
            'Each customer receives an independent website with isolated data, users, templates, and settings — manage multiple sites from one platform.',
        tags: ['100% Ownership', 'Private Data'],
        accentColor: '#2563EB',
    },
];

/* ─────────────────────────────────────────────────
   Hook
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

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function BenefitService01({
    eyebrow = 'Why Choose Us',
    headline = 'Everything you need to',
    headlineAccent = 'build & grow online.',
    subheadline = 'Kbuilder gives you the tools, templates, and integrations to launch a professional website fast — without any technical knowledge.',
    ctaText = 'Start Building Free',
    ctaHref = '/contact',
    ctaSubText = 'No credit card required · Setup in 10 minutes',
    benefits = DEFAULT_BENEFITS,
    layout = 'grid-2',
}: BenefitService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
    const autoplay = useRef(
        Autoplay({
            delay: 3500,
            stopOnInteraction: false,
        }),
    );

    const [emblaRef] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
        },
        [autoplay.current],
    );
    const colClass =
        layout === 'grid-4' ? styles.cols4 : layout === 'grid-3' ? styles.cols3 : styles.cols2;

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Benefits"
        >
            {/* Decorative background */}
            <div className={styles.bgDots} aria-hidden="true" />
            <div className={styles.bgOrbA} aria-hidden="true" />
            <div className={styles.bgOrbB} aria-hidden="true" />

            <div className={styles.wrap}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <span className={styles.badge}> {eyebrow}</span>

                        <h2>
                            {headline} <span className={styles.accent}>{headlineAccent}</span>
                        </h2>

                        <p className={styles.sub}>{subheadline}</p>

                        <button className={styles.button}>
                            Explore All Features
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>

                    <div className={styles.embla} ref={emblaRef}>
                        <div className={styles.emblaContainer}>
                            {benefits.map((b, idx) => {
                                const accent = b.accentColor ?? '#2563EB';

                                return (
                                    <div key={b.id} className={styles.emblaSlide}>
                                        <article
                                            className={`${styles.card} ${styles.r}`}
                                            style={
                                                {
                                                    '--i': idx + 1,
                                                    '--accent': accent,
                                                    background: `linear-gradient(180deg, ${accent}10 0%, #ffffff 65%)`,
                                                } as React.CSSProperties
                                            }
                                        >
                                            <span className={styles.cardNum}>
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>

                                            <div className={styles.cardHead}>
                                                <span
                                                    className={styles.iconWrap}
                                                    style={{
                                                        background: `${accent}14`,
                                                        border: `1.5px solid ${accent}28`,
                                                        color: accent,
                                                    }}
                                                >
                                                    <i className={`bi bi-${b.icon}`} />
                                                </span>

                                                <h3 className={styles.cardTitle}>{b.title}</h3>
                                            </div>

                                            <p className={styles.cardDesc}>{b.description}</p>

                                            {b.tags && (
                                                <div className={styles.tagRow}>
                                                    {b.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className={styles.tag}
                                                            style={{
                                                                color: accent,
                                                                background: `${accent}0E`,
                                                                border: `1px solid ${accent}22`,
                                                            }}
                                                        >
                                                            <i className="bi bi-check2" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div
                                                className={styles.cardLine}
                                                style={{
                                                    background: accent,
                                                }}
                                            />
                                        </article>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <section className={styles.showcase}>
                    <div className={styles.container}>
                        {/* ================= LEFT IMAGE ================= */}
                        <div className={styles.media}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src="/assets/images/service-banner.png"
                                    alt="Workspace"
                                    className={styles.mainImage}
                                />

                                {/* Floating Feature Card */}
                                <div className={styles.floatingCard}>
                                    <div className={styles.floatingItem}>
                                        <span className={styles.floatingIcon}>
                                            <i className="bi bi-lightning-charge-fill"></i>
                                        </span>

                                        <div>
                                            <h4>10-Minute Website</h4>
                                            <p>Generate a complete website in minutes.</p>
                                        </div>
                                    </div>

                                    <div className={styles.floatingItem}>
                                        <span className={styles.floatingIcon}>
                                            <i className="bi bi-grid-1x2-fill"></i>
                                        </span>

                                        <div>
                                            <h4>Smart Page Builder</h4>
                                            <p>
                                                Create pages with reusable sections and templates.
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.floatingItem}>
                                        <span className={styles.floatingIcon}>
                                            <i className="bi bi-stars"></i>
                                        </span>

                                        <div>
                                            <h4>AI + No-Code</h4>
                                            <p>Build, customize and publish without coding.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorations */}
                                <span className={styles.spark1}>
                                    <i className="bi bi-stars"></i>
                                </span>

                                <span className={styles.spark2}>
                                    <i className="bi bi-pencil"></i>
                                </span>

                                <span className={styles.spark3}>
                                    <i className="bi bi-lightning-charge-fill"></i>
                                </span>
                            </div>
                        </div>

                        {/* ================= CONTENT ================= */}
                        <div className={styles.content}>
                            <span className={styles.badge}>AI WEBSITE BUILDER</span>

                            <h2>
                                Build professional websites
                                <br />
                                in just 10 minutes
                            </h2>

                            <ul className={styles.featureList}>
                                <li>
                                    <i className="bi bi-check-circle-fill"></i>
                                    AI generates complete page structures automatically.
                                </li>

                                <li>
                                    <i className="bi bi-check-circle-fill"></i>
                                    Drag & Drop builder with reusable components.
                                </li>

                                <li>
                                    <i className="bi bi-check-circle-fill"></i>
                                    Landing, Blog, Store, Booking and LMS templates.
                                </li>

                                <li>
                                    <i className="bi bi-check-circle-fill"></i>
                                    Connect your domain and publish with one click.
                                </li>
                            </ul>

                            <button className={styles.button}>
                                Start Building
                                <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </section>
                {/* ─── Bottom CTA strip ─── */}
                <div
                    className={`${styles.ctaStrip} ${styles.r}`}
                    style={{ '--i': benefits.length + 1 } as React.CSSProperties}
                >
                    <div className={styles.ctaStripInner}>
                        <div className={styles.ctaCopy}>
                            <span className={styles.ctaBadge}>
                                <i className="bi bi-rocket-takeoff-fill" />
                                Ready to get started?
                            </span>
                            <div className={styles.ctaActions}>
                                <Link href={ctaHref} className={styles.ctaBtn}>
                                    {ctaText}
                                    <i className="bi bi-arrow-right" />
                                </Link>
                                <span className={styles.ctaSub}>
                                    <i className="bi bi-shield-check" />
                                    {ctaSubText}
                                </span>
                            </div>
                        </div>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <div className={styles.statIcon}>
                                    <i className="bi bi-rocket-takeoff-fill"></i>
                                </div>

                                <div>
                                    <h3>12K+</h3>
                                    <p>Active Users</p>
                                </div>
                            </div>

                            <div className={styles.statItem}>
                                <div className={styles.statIcon}>
                                    <i className="bi bi-check2-circle"></i>
                                </div>

                                <div>
                                    <h3>240K+</h3>
                                    <p>Tasks Completed</p>
                                </div>
                            </div>

                            <div className={styles.statItem}>
                                <div className={styles.statIcon}>
                                    <i className="bi bi-clock-history"></i>
                                </div>

                                <div>
                                    <h3>99.9%</h3>
                                    <p>Uptime</p>
                                </div>
                            </div>

                            <div className={styles.statItem}>
                                <div className={styles.statIcon}>
                                    <i className="bi bi-star-fill"></i>
                                </div>

                                <div>
                                    <h3>4.9/5</h3>
                                    <p>User Rating</p>
                                </div>
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
export const BENEFIT_SERVICE_01: RegItem = {
    kind: 'BenefitService01',
    label: 'Benefit Service 01',

    defaults: {
        eyebrow: 'Why Choose Us',
        headline: 'Everything you need to',
        headlineAccent: 'build & grow online.',
        subheadline:
            'Kbuilder gives you the tools, templates, and integrations to launch a professional website fast — without any technical knowledge.',
        ctaText: 'Start Building Free',
        ctaHref: '/contact',
        ctaSubText: 'No credit card required · Setup in 10 minutes',
        layout: 'grid-2',
        benefits: DEFAULT_BENEFITS,
    },

    inspector: [
        { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
        { key: 'headline', label: 'Headline', kind: 'text' },
        { key: 'headlineAccent', label: 'Headline Accent', kind: 'text' },
        { key: 'subheadline', label: 'Subheadline', kind: 'text' },
        { key: 'ctaText', label: 'CTA Text', kind: 'text' },
        { key: 'ctaHref', label: 'CTA Link', kind: 'text' },
        { key: 'ctaSubText', label: 'CTA Sub Text', kind: 'text' },
        {
            key: 'layout',
            label: 'Grid Layout',
            kind: 'select',
            options: [
                { label: '2 Columns', value: 'grid-2' },
                { label: '3 Columns', value: 'grid-3' },
                { label: '4 Columns', value: 'grid-4' },
            ],
        },
    ],

    render: (props) => {
        const d = props as Record<string, any>;
        return (
            <BenefitService01
                siteId={d.siteId}
                eyebrow={d.eyebrow}
                headline={d.headline}
                headlineAccent={d.headlineAccent}
                subheadline={d.subheadline}
                ctaText={d.ctaText}
                ctaHref={d.ctaHref}
                ctaSubText={d.ctaSubText}
                layout={d.layout}
                benefits={d.benefits}
            />
        );
    },
};

export default BenefitService01;
