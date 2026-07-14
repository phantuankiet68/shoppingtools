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

    exploreText?: string;

    // Benefit 1
    benefit1Title?: string;
    benefit1Description?: string;
    benefit1Tag1?: string;
    benefit1Tag2?: string;
    benefit1Tag3?: string;

    // Benefit 2
    benefit2Title?: string;
    benefit2Description?: string;
    benefit2Tag1?: string;
    benefit2Tag2?: string;
    benefit2Tag3?: string;

    // Benefit 3
    benefit3Title?: string;
    benefit3Description?: string;
    benefit3Tag1?: string;
    benefit3Tag2?: string;
    benefit3Tag3?: string;

    // Benefit 4
    benefit4Title?: string;
    benefit4Description?: string;
    benefit4Tag1?: string;
    benefit4Tag2?: string;
    benefit4Tag3?: string;

    // Benefit 5
    benefit5Title?: string;
    benefit5Description?: string;
    benefit5Tag1?: string;
    benefit5Tag2?: string;
    benefit5Tag3?: string;

    // Benefit 6
    benefit6Title?: string;
    benefit6Description?: string;
    benefit6Tag1?: string;
    benefit6Tag2?: string;
    benefit6Tag3?: string;

    // Benefit 7
    benefit7Title?: string;
    benefit7Description?: string;
    benefit7Tag1?: string;
    benefit7Tag2?: string;
    benefit7Tag3?: string;

    // Benefit 8
    benefit8Title?: string;
    benefit8Description?: string;
    benefit8Tag1?: string;
    benefit8Tag2?: string;
    benefit8Tag3?: string;

    showcaseImage?: string;
    showcaseImageAlt?: string;

    floating1Title?: string;
    floating1Description?: string;

    floating2Title?: string;
    floating2Description?: string;

    floating3Title?: string;
    floating3Description?: string;

    showcaseBadge?: string;
    showcaseHeadline?: string;
    showcaseHeadlineAccent?: string;

    feature1Text?: string;
    feature2Text?: string;
    feature3Text?: string;
    feature4Text?: string;

    showcaseCtaText?: string;

    ctaBadgeText?: string;
    ctaText?: string;
    ctaHref?: string;
    ctaSubText?: string;

    stat1Value?: string;
    stat1Label?: string;

    stat2Value?: string;
    stat2Label?: string;

    stat3Value?: string;
    stat3Label?: string;

    stat4Value?: string;
    stat4Label?: string;

    layout?: 'grid-2' | 'grid-3' | 'grid-4';
}

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

    exploreText = 'Explore All Features',

    showcaseImage = '/assets/images/service-banner.png',
    showcaseImageAlt = 'Workspace',

    floating1Title = '10-Minute Website',
    floating1Description = 'Generate a complete website in minutes.',

    floating2Title = 'Smart Page Builder',
    floating2Description = 'Create pages with reusable sections and templates.',

    floating3Title = 'AI + No-Code',
    floating3Description = 'Build, customize and publish without coding.',

    showcaseBadge = 'AI WEBSITE BUILDER',
    showcaseHeadline = 'Build professional websites',
    showcaseHeadlineAccent = 'in just 10 minutes',

    feature1Text = 'AI generates complete page structures automatically.',
    feature2Text = 'Drag & Drop builder with reusable components.',
    feature3Text = 'Landing, Blog, Store, Booking and LMS templates.',
    feature4Text = 'Connect your domain and publish with one click.',

    showcaseCtaText = 'Start Building',

    ctaBadgeText = 'Ready to get started?',
    ctaText = 'Start Building Free',
    ctaHref = '/contact',
    ctaSubText = 'No credit card required · Setup in 10 minutes',

    stat1Value = '12K+',
    stat1Label = 'Active Users',

    stat2Value = '240K+',
    stat2Label = 'Tasks Completed',

    stat3Value = '99.9%',
    stat3Label = 'Uptime',

    stat4Value = '4.9/5',
    stat4Label = 'User Rating',

    benefit1Title = 'Launch in 10 Minutes',
    benefit1Description = 'Kbuilder auto-generates a complete website with pages, navigation, and reusable sections. Pick your type, customize, and publish.',
    benefit1Tag1 = 'Landing Page',
    benefit1Tag2 = 'Blog',
    benefit1Tag3 = 'E-commerce',

    benefit2Title = 'Built for Every Business',
    benefit2Description = 'Start with professionally designed templates tailored to your business — from booking systems to LMS and online stores.',
    benefit2Tag1 = 'Booking',
    benefit2Tag2 = 'LMS',
    benefit2Tag3 = 'Store',

    benefit3Title = 'No Coding Required',
    benefit3Description = 'Create and edit your website visually. Update text, images, layouts, and sections directly on the page without writing a single line of code.',
    benefit3Tag1 = 'Visual Editor',
    benefit3Tag2 = 'Drag & Drop',
    benefit3Tag3 = '',

    benefit4Title = 'Smart Page Generator',
    benefit4Description = 'Generate complete page structures in minutes — Home, About, Services, Blog, FAQ, Policy, and more. Review, edit or remove at any time.',
    benefit4Tag1 = 'Home',
    benefit4Tag2 = 'About',
    benefit4Tag3 = 'Services',

    benefit5Title = 'Professional Templates',
    benefit5Description = 'Choose from a growing library of responsive templates and reusable components designed for modern businesses of all sizes.',
    benefit5Tag1 = 'Responsive',
    benefit5Tag2 = 'Modern UI',
    benefit5Tag3 = 'Reusable',

    benefit6Title = 'Built-in Marketing Tools',
    benefit6Description = 'Everything to grow your business in one platform — Google, Facebook & TikTok integrations, Email Marketing, SEO, Analytics, and Customer Chat.',
    benefit6Tag1 = 'SEO',
    benefit6Tag2 = 'Analytics',
    benefit6Tag3 = 'Email',

    benefit7Title = 'Automated Deployment',
    benefit7Description = 'Connect your domain and Kbuilder automatically configures and publishes your website with minimal setup — no DevOps needed.',
    benefit7Tag1 = 'One Click',
    benefit7Tag2 = 'Auto Deploy',
    benefit7Tag3 = 'Custom Domain',

    benefit8Title = 'Your Website control',
    benefit8Description = 'Each customer receives an independent website with isolated data, users, templates, and settings — manage multiple sites from one platform.',
    benefit8Tag1 = '100% Ownership',
    benefit8Tag2 = 'Private Data',
    benefit8Tag3 = '',
    layout = 'grid-2',
}: BenefitService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    const benefits: BenefitItem[] = [
        {
            id: 'launch',
            icon: 'rocket-takeoff-fill',
            title: benefit1Title,
            description: benefit1Description,
            tags: [benefit1Tag1, benefit1Tag2, benefit1Tag3].filter(Boolean),
            accentColor: '#6366F1',
        },
        {
            id: 'business-type',
            icon: 'diagram-3-fill',
            title: benefit2Title,
            description: benefit2Description,
            tags: [benefit2Tag1, benefit2Tag2, benefit2Tag3].filter(Boolean),
            accentColor: '#0EA5E9',
        },
        {
            id: 'no-code',
            icon: 'display-fill',
            title: benefit3Title,
            description: benefit3Description,
            tags: [benefit3Tag1, benefit3Tag2, benefit3Tag3].filter(Boolean),
            accentColor: '#10B981',
        },
        {
            id: 'page-gen',
            icon: 'lightning-charge-fill',
            title: benefit4Title,
            description: benefit4Description,
            tags: [benefit4Tag1, benefit4Tag2, benefit4Tag3].filter(Boolean),
            accentColor: '#F59E0B',
        },
        {
            id: 'templates',
            icon: 'grid-1x2-fill',
            title: benefit5Title,
            description: benefit5Description,
            tags: [benefit5Tag1, benefit5Tag2, benefit5Tag3].filter(Boolean),
            accentColor: '#EC4899',
        },
        {
            id: 'marketing',
            icon: 'graph-up-arrow',
            title: benefit6Title,
            description: benefit6Description,
            tags: [benefit6Tag1, benefit6Tag2, benefit6Tag3].filter(Boolean),
            accentColor: '#8B5CF6',
        },
        {
            id: 'deployment',
            icon: 'cloud-arrow-up-fill',
            title: benefit7Title,
            description: benefit7Description,
            tags: [benefit7Tag1, benefit7Tag2, benefit7Tag3].filter(Boolean),
            accentColor: '#14B8A6',
        },
        {
            id: 'control',
            icon: 'shield-lock-fill',
            title: benefit8Title,
            description: benefit8Description,
            tags: [benefit8Tag1, benefit8Tag2, benefit8Tag3].filter(Boolean),
            accentColor: '#2563EB',
        },
    ];
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
                            {exploreText}
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
                        <div className={styles.media}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={showcaseImage}
                                    alt={showcaseImageAlt}
                                    className={styles.mainImage}
                                />

                                <div className={styles.floatingCard}>
                                    <div className={styles.floatingItem}>
                                        <span className={styles.floatingIcon}>
                                            <i className="bi bi-lightning-charge-fill" />
                                        </span>

                                        <div>
                                            <h4>{floating1Title}</h4>
                                            <p>{floating1Description}</p>
                                        </div>
                                    </div>

                                    <div className={styles.floatingItem}>
                                        <span className={styles.floatingIcon}>
                                            <i className="bi bi-grid-1x2-fill" />
                                        </span>

                                        <div>
                                            <h4>{floating2Title}</h4>
                                            <p>{floating2Description}</p>
                                        </div>
                                    </div>

                                    <div className={styles.floatingItem}>
                                        <span className={styles.floatingIcon}>
                                            <i className="bi bi-stars" />
                                        </span>

                                        <div>
                                            <h4>{floating3Title}</h4>
                                            <p>{floating3Description}</p>
                                        </div>
                                    </div>
                                </div>

                                <span className={styles.spark1}>
                                    <i className="bi bi-stars" />
                                </span>

                                <span className={styles.spark2}>
                                    <i className="bi bi-pencil" />
                                </span>

                                <span className={styles.spark3}>
                                    <i className="bi bi-lightning-charge-fill" />
                                </span>
                            </div>
                        </div>

                        <div className={styles.content}>
                            <span className={styles.badge}>{showcaseBadge}</span>

                            <h2>
                                {showcaseHeadline}
                                <br />
                                {showcaseHeadlineAccent}
                            </h2>

                            <ul className={styles.featureList}>
                                <li>
                                    <i className="bi bi-check-circle-fill" />
                                    {feature1Text}
                                </li>

                                <li>
                                    <i className="bi bi-check-circle-fill" />
                                    {feature2Text}
                                </li>

                                <li>
                                    <i className="bi bi-check-circle-fill" />
                                    {feature3Text}
                                </li>

                                <li>
                                    <i className="bi bi-check-circle-fill" />
                                    {feature4Text}
                                </li>
                            </ul>

                            <button className={styles.button}>
                                {showcaseCtaText}
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </div>
                </section>
                <div
                    className={`${styles.ctaStrip} ${styles.r}`}
                    style={{ '--i': benefits.length + 1 } as React.CSSProperties}
                >
                    <div className={styles.ctaStripInner}>
                        <div className={styles.ctaCopy}>
                            <span className={styles.ctaBadge}>
                                <i className="bi bi-rocket-takeoff-fill" />
                                {ctaBadgeText}
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
                                    <i className="bi bi-rocket-takeoff-fill" />
                                </div>

                                <div>
                                    <h3>{stat1Value}</h3>
                                    <p>{stat1Label}</p>
                                </div>
                            </div>

                            <div className={styles.statItem}>
                                <div className={styles.statIcon}>
                                    <i className="bi bi-check2-circle" />
                                </div>

                                <div>
                                    <h3>{stat2Value}</h3>
                                    <p>{stat2Label}</p>
                                </div>
                            </div>

                            <div className={styles.statItem}>
                                <div className={styles.statIcon}>
                                    <i className="bi bi-clock-history" />
                                </div>

                                <div>
                                    <h3>{stat3Value}</h3>
                                    <p>{stat3Label}</p>
                                </div>
                            </div>

                            <div className={styles.statItem}>
                                <div className={styles.statIcon}>
                                    <i className="bi bi-star-fill" />
                                </div>

                                <div>
                                    <h3>{stat4Value}</h3>
                                    <p>{stat4Label}</p>
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

        exploreText: 'Explore All Features',

        showcaseImage: '/assets/images/service-banner.png',
        showcaseImageAlt: 'Workspace',

        floating1Title: '10-Minute Website',
        floating1Description: 'Generate a complete website in minutes.',

        floating2Title: 'Smart Page Builder',
        floating2Description: 'Create pages with reusable sections and templates.',

        floating3Title: 'AI + No-Code',
        floating3Description: 'Build, customize and publish without coding.',

        showcaseBadge: 'AI WEBSITE BUILDER',
        showcaseHeadline: 'Build professional websites',
        showcaseHeadlineAccent: 'in just 10 minutes',

        feature1Text: 'AI generates complete page structures automatically.',
        feature2Text: 'Drag & Drop builder with reusable components.',
        feature3Text: 'Landing, Blog, Store, Booking and LMS templates.',
        feature4Text: 'Connect your domain and publish with one click.',

        showcaseCtaText: 'Start Building',

        ctaBadgeText: 'Ready to get started?',
        ctaText: 'Start Building Free',
        ctaHref: '/contact',
        ctaSubText: 'No credit card required · Setup in 10 minutes',

        stat1Value: '12K+',
        stat1Label: 'Active Users',

        stat2Value: '240K+',
        stat2Label: 'Tasks Completed',

        stat3Value: '99.9%',
        stat3Label: 'Uptime',

        stat4Value: '4.9/5',
        stat4Label: 'User Rating',

        layout: 'grid-2',
        // Benefit 1
        benefit1Title: 'Launch in 10 Minutes',
        benefit1Description:
            'Kbuilder auto-generates a complete website with pages, navigation, and reusable sections. Pick your type, customize, and publish.',
        benefit1Tag1: 'Landing Page',
        benefit1Tag2: 'Blog',
        benefit1Tag3: 'E-commerce',

        // Benefit 2
        benefit2Title: 'Built for Every Business',
        benefit2Description:
            'Start with professionally designed templates tailored to your business — from booking systems to LMS and online stores.',
        benefit2Tag1: 'Booking',
        benefit2Tag2: 'LMS',
        benefit2Tag3: 'Store',

        // Benefit 3
        benefit3Title: 'No Coding Required',
        benefit3Description:
            'Create and edit your website visually. Update text, images, layouts, and sections directly on the page without writing a single line of code.',
        benefit3Tag1: 'Visual Editor',
        benefit3Tag2: 'Drag & Drop',
        benefit3Tag3: '',

        // Benefit 4
        benefit4Title: 'Smart Page Generator',
        benefit4Description:
            'Generate complete page structures in minutes — Home, About, Services, Blog, FAQ, Policy, and more. Review, edit or remove at any time.',
        benefit4Tag1: 'Home',
        benefit4Tag2: 'About',
        benefit4Tag3: 'Services',

        // Benefit 5
        benefit5Title: 'Professional Templates',
        benefit5Description:
            'Choose from a growing library of responsive templates and reusable components designed for modern businesses of all sizes.',
        benefit5Tag1: 'Responsive',
        benefit5Tag2: 'Modern UI',
        benefit5Tag3: 'Reusable',

        // Benefit 6
        benefit6Title: 'Built-in Marketing Tools',
        benefit6Description:
            'Everything to grow your business in one platform — Google, Facebook & TikTok integrations, Email Marketing, SEO, Analytics, and Customer Chat.',
        benefit6Tag1: 'SEO',
        benefit6Tag2: 'Analytics',
        benefit6Tag3: 'Email',

        // Benefit 7
        benefit7Title: 'Automated Deployment',
        benefit7Description:
            'Connect your domain and Kbuilder automatically configures and publishes your website with minimal setup — no DevOps needed.',
        benefit7Tag1: 'One Click',
        benefit7Tag2: 'Auto Deploy',
        benefit7Tag3: 'Custom Domain',

        // Benefit 8
        benefit8Title: 'Your Website control',
        benefit8Description:
            'Each customer receives an independent website with isolated data, users, templates, and settings — manage multiple sites from one platform.',
        benefit8Tag1: '100% Ownership',
        benefit8Tag2: 'Private Data',
        benefit8Tag3: '',
    },

    inspector: [
        { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
        { key: 'headline', label: 'Headline', kind: 'text' },
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
            key: 'exploreText',
            label: 'Explore Button Text',
            kind: 'text',
        },

        {
            key: 'showcaseImage',
            label: 'Showcase Image',
            kind: 'image',
            folder: 'services/benefits',
            accept: 'image/*',
        },
        {
            key: 'showcaseImageAlt',
            label: 'Showcase Image Alt',
            kind: 'text',
        },

        {
            key: 'floating1Title',
            label: 'Floating 1 Title',
            kind: 'text',
        },
        {
            key: 'floating1Description',
            label: 'Floating 1 Description',
            kind: 'textarea',
        },

        {
            key: 'floating2Title',
            label: 'Floating 2 Title',
            kind: 'text',
        },
        {
            key: 'floating2Description',
            label: 'Floating 2 Description',
            kind: 'textarea',
        },

        {
            key: 'floating3Title',
            label: 'Floating 3 Title',
            kind: 'text',
        },
        {
            key: 'floating3Description',
            label: 'Floating 3 Description',
            kind: 'textarea',
        },

        {
            key: 'showcaseBadge',
            label: 'Showcase Badge',
            kind: 'text',
        },
        {
            key: 'showcaseHeadline',
            label: 'Showcase Headline',
            kind: 'text',
        },
        {
            key: 'showcaseHeadlineAccent',
            label: 'Showcase Headline Accent',
            kind: 'text',
        },

        {
            key: 'feature1Text',
            label: 'Feature 1',
            kind: 'text',
        },
        {
            key: 'feature2Text',
            label: 'Feature 2',
            kind: 'text',
        },
        {
            key: 'feature3Text',
            label: 'Feature 3',
            kind: 'text',
        },
        {
            key: 'feature4Text',
            label: 'Feature 4',
            kind: 'text',
        },

        {
            key: 'showcaseCtaText',
            label: 'Showcase CTA Text',
            kind: 'text',
        },

        {
            key: 'ctaBadgeText',
            label: 'CTA Badge Text',
            kind: 'text',
        },
        {
            key: 'ctaText',
            label: 'CTA Text',
            kind: 'text',
        },
        {
            key: 'ctaHref',
            label: 'CTA Link',
            kind: 'text',
        },
        {
            key: 'ctaSubText',
            label: 'CTA Sub Text',
            kind: 'text',
        },

        { key: 'stat1Value', label: 'Stat 1 Value', kind: 'text' },
        { key: 'stat1Label', label: 'Stat 1 Label', kind: 'text' },

        { key: 'stat2Value', label: 'Stat 2 Value', kind: 'text' },
        { key: 'stat2Label', label: 'Stat 2 Label', kind: 'text' },

        { key: 'stat3Value', label: 'Stat 3 Value', kind: 'text' },
        { key: 'stat3Label', label: 'Stat 3 Label', kind: 'text' },

        { key: 'stat4Value', label: 'Stat 4 Value', kind: 'text' },
        { key: 'stat4Label', label: 'Stat 4 Label', kind: 'text' },

        {
            key: 'layout',
            label: 'Grid Layout',
            kind: 'select',
            options: [
                {
                    label: '2 Columns',
                    value: 'grid-2',
                },
                {
                    label: '3 Columns',
                    value: 'grid-3',
                },
                {
                    label: '4 Columns',
                    value: 'grid-4',
                },
            ],
        },
        // Benefit 1
        { key: 'benefit1Title', label: 'Benefit 1 Title', kind: 'text' },
        {
            key: 'benefit1Description',
            label: 'Benefit 1 Description',
            kind: 'textarea',
        },
        { key: 'benefit1Tag1', label: 'Benefit 1 Tag 1', kind: 'text' },
        { key: 'benefit1Tag2', label: 'Benefit 1 Tag 2', kind: 'text' },
        { key: 'benefit1Tag3', label: 'Benefit 1 Tag 3', kind: 'text' },

        // Benefit 2
        { key: 'benefit2Title', label: 'Benefit 2 Title', kind: 'text' },
        {
            key: 'benefit2Description',
            label: 'Benefit 2 Description',
            kind: 'textarea',
        },
        { key: 'benefit2Tag1', label: 'Benefit 2 Tag 1', kind: 'text' },
        { key: 'benefit2Tag2', label: 'Benefit 2 Tag 2', kind: 'text' },
        { key: 'benefit2Tag3', label: 'Benefit 2 Tag 3', kind: 'text' },

        // Benefit 3
        { key: 'benefit3Title', label: 'Benefit 3 Title', kind: 'text' },
        {
            key: 'benefit3Description',
            label: 'Benefit 3 Description',
            kind: 'textarea',
        },
        { key: 'benefit3Tag1', label: 'Benefit 3 Tag 1', kind: 'text' },
        { key: 'benefit3Tag2', label: 'Benefit 3 Tag 2', kind: 'text' },
        { key: 'benefit3Tag3', label: 'Benefit 3 Tag 3', kind: 'text' },

        // Benefit 4
        { key: 'benefit4Title', label: 'Benefit 4 Title', kind: 'text' },
        {
            key: 'benefit4Description',
            label: 'Benefit 4 Description',
            kind: 'textarea',
        },
        { key: 'benefit4Tag1', label: 'Benefit 4 Tag 1', kind: 'text' },
        { key: 'benefit4Tag2', label: 'Benefit 4 Tag 2', kind: 'text' },
        { key: 'benefit4Tag3', label: 'Benefit 4 Tag 3', kind: 'text' },

        // Benefit 5
        { key: 'benefit5Title', label: 'Benefit 5 Title', kind: 'text' },
        {
            key: 'benefit5Description',
            label: 'Benefit 5 Description',
            kind: 'textarea',
        },
        { key: 'benefit5Tag1', label: 'Benefit 5 Tag 1', kind: 'text' },
        { key: 'benefit5Tag2', label: 'Benefit 5 Tag 2', kind: 'text' },
        { key: 'benefit5Tag3', label: 'Benefit 5 Tag 3', kind: 'text' },

        // Benefit 6
        { key: 'benefit6Title', label: 'Benefit 6 Title', kind: 'text' },
        {
            key: 'benefit6Description',
            label: 'Benefit 6 Description',
            kind: 'textarea',
        },
        { key: 'benefit6Tag1', label: 'Benefit 6 Tag 1', kind: 'text' },
        { key: 'benefit6Tag2', label: 'Benefit 6 Tag 2', kind: 'text' },
        { key: 'benefit6Tag3', label: 'Benefit 6 Tag 3', kind: 'text' },

        // Benefit 7
        { key: 'benefit7Title', label: 'Benefit 7 Title', kind: 'text' },
        {
            key: 'benefit7Description',
            label: 'Benefit 7 Description',
            kind: 'textarea',
        },
        { key: 'benefit7Tag1', label: 'Benefit 7 Tag 1', kind: 'text' },
        { key: 'benefit7Tag2', label: 'Benefit 7 Tag 2', kind: 'text' },
        { key: 'benefit7Tag3', label: 'Benefit 7 Tag 3', kind: 'text' },

        // Benefit 8
        { key: 'benefit8Title', label: 'Benefit 8 Title', kind: 'text' },
        {
            key: 'benefit8Description',
            label: 'Benefit 8 Description',
            kind: 'textarea',
        },
        { key: 'benefit8Tag1', label: 'Benefit 8 Tag 1', kind: 'text' },
        { key: 'benefit8Tag2', label: 'Benefit 8 Tag 2', kind: 'text' },
        { key: 'benefit8Tag3', label: 'Benefit 8 Tag 3', kind: 'text' },
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
                exploreText={d.exploreText}
                showcaseImage={d.showcaseImage}
                showcaseImageAlt={d.showcaseImageAlt}
                floating1Title={d.floating1Title}
                floating1Description={d.floating1Description}
                floating2Title={d.floating2Title}
                floating2Description={d.floating2Description}
                floating3Title={d.floating3Title}
                floating3Description={d.floating3Description}
                showcaseBadge={d.showcaseBadge}
                showcaseHeadline={d.showcaseHeadline}
                showcaseHeadlineAccent={d.showcaseHeadlineAccent}
                feature1Text={d.feature1Text}
                feature2Text={d.feature2Text}
                feature3Text={d.feature3Text}
                feature4Text={d.feature4Text}
                showcaseCtaText={d.showcaseCtaText}
                ctaBadgeText={d.ctaBadgeText}
                ctaText={d.ctaText}
                ctaHref={d.ctaHref}
                ctaSubText={d.ctaSubText}
                stat1Value={d.stat1Value}
                stat1Label={d.stat1Label}
                stat2Value={d.stat2Value}
                stat2Label={d.stat2Label}
                stat3Value={d.stat3Value}
                stat3Label={d.stat3Label}
                stat4Value={d.stat4Value}
                stat4Label={d.stat4Label}
                layout={d.layout}
                benefit1Title={d.benefit1Title}
                benefit1Description={d.benefit1Description}
                benefit1Tag1={d.benefit1Tag1}
                benefit1Tag2={d.benefit1Tag2}
                benefit1Tag3={d.benefit1Tag3}
                benefit2Title={d.benefit2Title}
                benefit2Description={d.benefit2Description}
                benefit2Tag1={d.benefit2Tag1}
                benefit2Tag2={d.benefit2Tag2}
                benefit2Tag3={d.benefit2Tag3}
                benefit3Title={d.benefit3Title}
                benefit3Description={d.benefit3Description}
                benefit3Tag1={d.benefit3Tag1}
                benefit3Tag2={d.benefit3Tag2}
                benefit3Tag3={d.benefit3Tag3}
                benefit4Title={d.benefit4Title}
                benefit4Description={d.benefit4Description}
                benefit4Tag1={d.benefit4Tag1}
                benefit4Tag2={d.benefit4Tag2}
                benefit4Tag3={d.benefit4Tag3}
                benefit5Title={d.benefit5Title}
                benefit5Description={d.benefit5Description}
                benefit5Tag1={d.benefit5Tag1}
                benefit5Tag2={d.benefit5Tag2}
                benefit5Tag3={d.benefit5Tag3}
                benefit6Title={d.benefit6Title}
                benefit6Description={d.benefit6Description}
                benefit6Tag1={d.benefit6Tag1}
                benefit6Tag2={d.benefit6Tag2}
                benefit6Tag3={d.benefit6Tag3}
                benefit7Title={d.benefit7Title}
                benefit7Description={d.benefit7Description}
                benefit7Tag1={d.benefit7Tag1}
                benefit7Tag2={d.benefit7Tag2}
                benefit7Tag3={d.benefit7Tag3}
                benefit8Title={d.benefit8Title}
                benefit8Description={d.benefit8Description}
                benefit8Tag1={d.benefit8Tag1}
                benefit8Tag2={d.benefit8Tag2}
                benefit8Tag3={d.benefit8Tag3}
            />
        );
    },
};

export default BenefitService01;
