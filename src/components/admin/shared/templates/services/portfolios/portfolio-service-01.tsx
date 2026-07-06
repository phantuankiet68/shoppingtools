'use client';

import styles from '@/components/admin/shared/templates/services/portfolios/styles/portfolio-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export interface PortfolioItem {
    id: string;
    imageUrl: string;
    imageAlt: string;
    category: string;
    title: string;
    description?: string;
    /** 'tall' = spans 2 rows; 'wide' = spans 2 cols; 'normal' = 1×1 */
    size?: 'tall' | 'wide' | 'normal';
    href?: string;
}

export interface PortfolioService01Props {
    siteId?: string;

    eyebrow?: string;
    headline?: string;
    headlineAccent?: string;
    subheadline?: string;

    ctaText?: string;
    ctaHref?: string;

    items?: PortfolioItem[];

    showFilters?: boolean;
    showCta?: boolean;
}

const DEFAULT_ITEMS: PortfolioItem[] = [
    {
        id: 'p1',
        imageUrl: '/assets/portfolio/landing-01.jpg',
        imageAlt: 'Modern SaaS Landing Page',
        category: 'Landing Page',
        title: 'AI SaaS Platform',
        description: 'Modern landing page designed to maximize conversions.',
        size: 'tall',
        href: '#',
    },
    {
        id: 'p2',
        imageUrl: '/assets/portfolio/blog-01.jpg',
        imageAlt: 'Technology Blog Website',
        category: 'Blog',
        title: 'Tech Insights',
        description: 'A clean and responsive blog for creators and publishers.',
        size: 'normal',
        href: '#',
    },
    {
        id: 'p3',
        imageUrl: '/assets/portfolio/ecommerce-01.jpg',
        imageAlt: 'Fashion Ecommerce Website',
        category: 'E-commerce',
        title: 'Fashion Store',
        description: 'Complete online store with shopping cart and secure checkout.',
        size: 'normal',
        href: '#',
    },
    {
        id: 'p4',
        imageUrl: '/assets/portfolio/booking-01.jpg',
        imageAlt: 'Hotel Booking Website',
        category: 'Booking',
        title: 'Hotel Reservation',
        description: 'Online booking system with real-time availability.',
        size: 'wide',
        href: '#',
    },
    {
        id: 'p5',
        imageUrl: '/assets/portfolio/lms-01.jpg',
        imageAlt: 'Online Learning Platform',
        category: 'LMS',
        title: 'Online Academy',
        description: 'Learning platform with courses, lessons, and student dashboard.',
        size: 'normal',
        href: '#',
    },
    {
        id: 'p6',
        imageUrl: '/assets/portfolio/landing-02.jpg',
        imageAlt: 'Corporate Business Website',
        category: 'Business',
        title: 'Corporate Website',
        description: 'Professional company website with modern branding and responsive design.',
        size: 'normal',
        href: '#',
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
   Placeholder image (when no real image provided)
───────────────────────────────────────────────── */
const PLACEHOLDER_COLORS: Record<string, string> = {
    'Khám tổng quát': '#EBF5FB',
    'Tẩy trắng răng': '#E8F8F5',
    Implant: '#FEF9E7',
    'Veneer sứ': '#FDF2F8',
    'Niềng răng': '#EAF2FF',
    'Bọc răng sứ': '#F9F9F9',
};

const PLACEHOLDER_ICONS: Record<string, string> = {
    'Khám tổng quát': 'heart-pulse-fill',
    'Tẩy trắng răng': 'brightness-high-fill',
    Implant: 'tools',
    'Veneer sứ': 'gem',
    'Niềng răng': 'stars',
    'Bọc răng sứ': 'shield-fill-check',
};

function PlaceholderCard({ category, title }: { category: string; title: string }) {
    const bg = PLACEHOLDER_COLORS[category] ?? '#F0F4FF';
    const icon = PLACEHOLDER_ICONS[category] ?? 'image';

    return (
        <div className={styles.placeholder} style={{ background: bg }}>
            <i className={`bi bi-${icon}`} />
            <span>{title}</span>
        </div>
    );
}

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function PortfolioService01({
    eyebrow = 'Website Builder Platform',
    headline = 'Build Professional Websites',
    headlineAccent = '10x Faster',
    subheadline = 'Generate beautiful websites with AI, customize every section visually, and publish instantly with your own domain and secure hosting.',
    ctaText = 'Start Building',
    ctaHref = '/services',
    items = DEFAULT_ITEMS,
    showFilters = true,
    showCta = true,
}: PortfolioService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    /* Filter state */
    const allCategories = ['Tất cả', ...Array.from(new Set(items.map((i) => i.category)))];
    const [activeFilter, setActiveFilter] = useState('Tất cả');
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const filtered =
        activeFilter === 'Tất cả' ? items : items.filter((i) => i.category === activeFilter);

    /* Determine grid cell class */
    function sizeClass(item: PortfolioItem) {
        if (item.size === 'tall') return styles.cellTall;
        if (item.size === 'wide') return styles.cellWide;
        return '';
    }

    /* Check if image is a real URL (not placeholder path) */
    function isRealImage(url: string) {
        return url.startsWith('http') || url.startsWith('https') || url.startsWith('blob');
    }

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Portfolio"
        >
            <div className={styles.wrap}>
                {/* ─── Section header ─── */}
                <div
                    className={`${styles.header} ${styles.r}`}
                    style={{ '--i': 0 } as React.CSSProperties}
                >
                    <div className={styles.headerLeft}>
                        <span className={styles.eyebrow}>
                            <i className="bi bi-grid-3x3-gap-fill" />
                            {eyebrow}
                        </span>

                        <h2 className={styles.headline}>
                            {headline} <span className={styles.accent}>{headlineAccent}</span>
                        </h2>

                        <p className={styles.sub}>{subheadline}</p>
                    </div>
                    {showFilters && allCategories.length > 2 && (
                        <div
                            className={`${styles.filters} ${styles.r}`}
                            style={{ '--i': 1 } as React.CSSProperties}
                            role="tablist"
                            aria-label="Filter website type"
                        >
                            {allCategories.map((cat) => {
                                const count =
                                    cat === 'All'
                                        ? items.length
                                        : items.filter((i) => i.category === cat).length;

                                const active = activeFilter === cat;

                                return (
                                    <button
                                        key={cat}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveFilter(cat)}
                                        className={`${styles.filterBtn} ${
                                            active ? styles.filterActive : ''
                                        }`}
                                    >
                                        <span className={styles.filterLabel}>{cat}</span>

                                        <span className={styles.filterBadge}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {/* ─── Bottom CTA (mobile-friendly) ─── */}
                    {showCta && (
                        <div
                            className={`${styles.bottomCta} ${styles.r}`}
                            style={{ '--i': 3 } as React.CSSProperties}
                        >
                            <div className={styles.bottomCtaInner}>
                                <div className={styles.bottomCtaCopy}>
                                    <i className="bi bi-stars" />
                                    <span>Bạn muốn biết thêm về dịch vụ của chúng tôi?</span>
                                </div>
                                <Link href={ctaHref} className={styles.bottomCtaLink}>
                                    {ctaText}
                                    <i className="bi bi-arrow-right" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Bento grid ─── */}
                <div
                    className={`${styles.bentoGrid} ${styles.r}`}
                    style={{ '--i': 2 } as React.CSSProperties}
                >
                    {filtered.map((item, idx) => (
                        <article
                            key={item.id}
                            className={`${styles.cell} ${sizeClass(item)}`}
                            style={{ '--delay': `${idx * 60}ms` } as React.CSSProperties}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Image or placeholder */}
                            <div className={styles.cellMedia}>
                                {isRealImage(item.imageUrl) ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.imageAlt}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className={styles.cellImg}
                                    />
                                ) : (
                                    <PlaceholderCard category={item.category} title={item.title} />
                                )}

                                {/* Gradient overlay */}
                                <div className={styles.overlay} />

                                {/* Hover reveal overlay */}
                                <div
                                    className={`${styles.hoverOverlay} ${hoveredId === item.id ? styles.hoverVisible : ''}`}
                                >
                                    <div className={styles.hoverContent}>
                                        <h3 className={styles.hoverTitle}>{item.title}</h3>
                                        {item.description && (
                                            <p className={styles.hoverDesc}>{item.description}</p>
                                        )}
                                        {item.href && (
                                            <Link href={item.href} className={styles.hoverLink}>
                                                Xem chi tiết
                                                <i className="bi bi-arrow-up-right" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Category badge — always visible */}
                            <div className={styles.badge}>
                                <i
                                    className={`bi bi-${PLACEHOLDER_ICONS[item.category] ?? 'circle-fill'}`}
                                />
                                {item.category}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const PORTFOLIO_SERVICE_01: RegItem = {
    kind: 'PortfolioService01',
    label: 'Portfolio Service 01',

    defaults: {
        eyebrow: 'Website Builder Platform',
        headline: 'Build Professional Websites',
        headlineAccent: '10x Faster',
        subheadline:
            'Generate beautiful websites with AI, customize every section visually, and publish instantly with your own domain and secure hosting.',
        ctaText: 'Start Building',
        ctaHref: '/services',
        showFilters: true,
        showCta: true,
        items: DEFAULT_ITEMS,
    },

    inspector: [
        { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
        { key: 'headline', label: 'Headline', kind: 'text' },
        { key: 'headlineAccent', label: 'Headline Accent', kind: 'text' },
        { key: 'subheadline', label: 'Subheadline', kind: 'text' },
        { key: 'ctaText', label: 'CTA Text', kind: 'text' },
        { key: 'ctaHref', label: 'CTA Link', kind: 'text' },
        { key: 'showFilters', label: 'Show Filter Tabs', kind: 'toggle' },
        { key: 'showCta', label: 'Show CTA', kind: 'toggle' },
    ],

    render: (props) => {
        const d = props as Record<string, any>;
        return (
            <PortfolioService01
                siteId={d.siteId}
                eyebrow={d.eyebrow}
                headline={d.headline}
                headlineAccent={d.headlineAccent}
                subheadline={d.subheadline}
                ctaText={d.ctaText}
                ctaHref={d.ctaHref}
                showFilters={d.showFilters}
                showCta={d.showCta}
                items={d.items}
            />
        );
    },
};

export default PortfolioService01;
