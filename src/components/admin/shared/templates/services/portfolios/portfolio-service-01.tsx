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

    filterAllText?: string;
    detailText?: string;

    ctaDescription?: string;
    ctaText?: string;
    ctaHref?: string;

    // Portfolio 1
    item1Image?: string;
    item1ImageAlt?: string;
    item1Category?: string;
    item1Title?: string;
    item1Description?: string;
    item1Href?: string;

    // Portfolio 2
    item2Image?: string;
    item2ImageAlt?: string;
    item2Category?: string;
    item2Title?: string;
    item2Description?: string;
    item2Href?: string;

    // Portfolio 3
    item3Image?: string;
    item3ImageAlt?: string;
    item3Category?: string;
    item3Title?: string;
    item3Description?: string;
    item3Href?: string;

    // Portfolio 4
    item4Image?: string;
    item4ImageAlt?: string;
    item4Category?: string;
    item4Title?: string;
    item4Description?: string;
    item4Href?: string;

    // Portfolio 5
    item5Image?: string;
    item5ImageAlt?: string;
    item5Category?: string;
    item5Title?: string;
    item5Description?: string;
    item5Href?: string;

    // Portfolio 6
    item6Image?: string;
    item6ImageAlt?: string;
    item6Category?: string;
    item6Title?: string;
    item6Description?: string;
    item6Href?: string;

    showFilters?: boolean;
    showCta?: boolean;
}

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

    filterAllText = 'Tất cả',
    detailText = 'Xem chi tiết',

    ctaDescription = 'Bạn muốn biết thêm về dịch vụ của chúng tôi?',
    ctaText = 'Start Building',
    ctaHref = '/services',

    // Item 1
    item1Image = '/assets/portfolio/landing-01.jpg',
    item1ImageAlt = 'Modern SaaS Landing Page',
    item1Category = 'Landing Page',
    item1Title = 'AI SaaS Platform',
    item1Description = 'Modern landing page designed to maximize conversions.',
    item1Href = '#',

    // Item 2
    item2Image = '/assets/portfolio/blog-01.jpg',
    item2ImageAlt = 'Technology Blog Website',
    item2Category = 'Blog',
    item2Title = 'Tech Insights',
    item2Description = 'A clean and responsive blog for creators and publishers.',
    item2Href = '#',

    // Item 3
    item3Image = '/assets/portfolio/ecommerce-01.jpg',
    item3ImageAlt = 'Fashion Ecommerce Website',
    item3Category = 'E-commerce',
    item3Title = 'Fashion Store',
    item3Description = 'Complete online store with shopping cart and secure checkout.',
    item3Href = '#',

    // Item 4
    item4Image = '/assets/portfolio/booking-01.jpg',
    item4ImageAlt = 'Hotel Booking Website',
    item4Category = 'Booking',
    item4Title = 'Hotel Reservation',
    item4Description = 'Online booking system with real-time availability.',
    item4Href = '#',

    // Item 5
    item5Image = '/assets/portfolio/lms-01.jpg',
    item5ImageAlt = 'Online Learning Platform',
    item5Category = 'LMS',
    item5Title = 'Online Academy',
    item5Description = 'Learning platform with courses, lessons, and student dashboard.',
    item5Href = '#',

    // Item 6
    item6Image = '/assets/portfolio/landing-02.jpg',
    item6ImageAlt = 'Corporate Business Website',
    item6Category = 'Business',
    item6Title = 'Corporate Website',
    item6Description = 'Professional company website with modern branding and responsive design.',
    item6Href = '#',

    showFilters = true,
    showCta = true,
}: PortfolioService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
    const items: PortfolioItem[] = [
        {
            id: 'p1',
            imageUrl: item1Image,
            imageAlt: item1ImageAlt,
            category: item1Category,
            title: item1Title,
            description: item1Description,
            size: 'tall',
            href: item1Href,
        },
        {
            id: 'p2',
            imageUrl: item2Image,
            imageAlt: item2ImageAlt,
            category: item2Category,
            title: item2Title,
            description: item2Description,
            size: 'normal',
            href: item2Href,
        },
        {
            id: 'p3',
            imageUrl: item3Image,
            imageAlt: item3ImageAlt,
            category: item3Category,
            title: item3Title,
            description: item3Description,
            size: 'normal',
            href: item3Href,
        },
        {
            id: 'p4',
            imageUrl: item4Image,
            imageAlt: item4ImageAlt,
            category: item4Category,
            title: item4Title,
            description: item4Description,
            size: 'wide',
            href: item4Href,
        },
        {
            id: 'p5',
            imageUrl: item5Image,
            imageAlt: item5ImageAlt,
            category: item5Category,
            title: item5Title,
            description: item5Description,
            size: 'normal',
            href: item5Href,
        },
        {
            id: 'p6',
            imageUrl: item6Image,
            imageAlt: item6ImageAlt,
            category: item6Category,
            title: item6Title,
            description: item6Description,
            size: 'normal',
            href: item6Href,
        },
    ];
    /* Filter state */
    const allCategories = [
        filterAllText,
        ...Array.from(new Set(items.map((item) => item.category))),
    ];

    const [activeFilter, setActiveFilter] = useState(filterAllText);

    const filtered =
        activeFilter === filterAllText
            ? items
            : items.filter((item) => item.category === activeFilter);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
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
                                    cat === filterAllText
                                        ? items.length
                                        : items.filter((item) => item.category === cat).length;

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
                                    <span>{ctaDescription}</span>
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
                                                {detailText}
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
    kind: 'portfolio-service-01',
    label: 'Portfolio Service 01',

    defaults: {
        eyebrow: 'Website Builder Platform',
        headline: 'Build Professional Websites',
        headlineAccent: '10x Faster',
        subheadline:
            'Generate beautiful websites with AI, customize every section visually, and publish instantly with your own domain and secure hosting.',

        filterAllText: 'Tất cả',
        detailText: 'Xem chi tiết',

        ctaDescription: 'Bạn muốn biết thêm về dịch vụ của chúng tôi?',
        ctaText: 'Start Building',
        ctaHref: '/services',

        // Item 1
        item1Image: '/assets/portfolio/landing-01.jpg',
        item1ImageAlt: 'Modern SaaS Landing Page',
        item1Category: 'Landing Page',
        item1Title: 'AI SaaS Platform',
        item1Description: 'Modern landing page designed to maximize conversions.',
        item1Href: '#',

        // Item 2
        item2Image: '/assets/portfolio/blog-01.jpg',
        item2ImageAlt: 'Technology Blog Website',
        item2Category: 'Blog',
        item2Title: 'Tech Insights',
        item2Description: 'A clean and responsive blog for creators and publishers.',
        item2Href: '#',

        // Item 3
        item3Image: '/assets/portfolio/ecommerce-01.jpg',
        item3ImageAlt: 'Fashion Ecommerce Website',
        item3Category: 'E-commerce',
        item3Title: 'Fashion Store',
        item3Description: 'Complete online store with shopping cart and secure checkout.',
        item3Href: '#',

        // Item 4
        item4Image: '/assets/portfolio/booking-01.jpg',
        item4ImageAlt: 'Hotel Booking Website',
        item4Category: 'Booking',
        item4Title: 'Hotel Reservation',
        item4Description: 'Online booking system with real-time availability.',
        item4Href: '#',

        // Item 5
        item5Image: '/assets/portfolio/lms-01.jpg',
        item5ImageAlt: 'Online Learning Platform',
        item5Category: 'LMS',
        item5Title: 'Online Academy',
        item5Description: 'Learning platform with courses, lessons, and student dashboard.',
        item5Href: '#',

        // Item 6
        item6Image: '/assets/portfolio/landing-02.jpg',
        item6ImageAlt: 'Corporate Business Website',
        item6Category: 'Business',
        item6Title: 'Corporate Website',
        item6Description:
            'Professional company website with modern branding and responsive design.',
        item6Href: '#',

        showFilters: true,
        showCta: true,
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
            key: 'filterAllText',
            label: 'Filter All Text',
            kind: 'text',
        },
        {
            key: 'detailText',
            label: 'Detail Button Text',
            kind: 'text',
        },

        {
            key: 'ctaDescription',
            label: 'CTA Description',
            kind: 'textarea',
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

        // Item 1
        {
            key: 'item1Image',
            label: 'Portfolio 1 Image',
            kind: 'image',
            folder: 'services/portfolios',
            accept: 'image/*',
        },
        {
            key: 'item1ImageAlt',
            label: 'Portfolio 1 Image Alt',
            kind: 'text',
        },
        {
            key: 'item1Category',
            label: 'Portfolio 1 Category',
            kind: 'text',
        },
        {
            key: 'item1Title',
            label: 'Portfolio 1 Title',
            kind: 'text',
        },
        {
            key: 'item1Description',
            label: 'Portfolio 1 Description',
            kind: 'textarea',
        },
        {
            key: 'item1Href',
            label: 'Portfolio 1 Link',
            kind: 'text',
        },

        // Item 2
        {
            key: 'item2Image',
            label: 'Portfolio 2 Image',
            kind: 'image',
            folder: 'services/portfolios',
            accept: 'image/*',
        },
        {
            key: 'item2ImageAlt',
            label: 'Portfolio 2 Image Alt',
            kind: 'text',
        },
        {
            key: 'item2Category',
            label: 'Portfolio 2 Category',
            kind: 'text',
        },
        {
            key: 'item2Title',
            label: 'Portfolio 2 Title',
            kind: 'text',
        },
        {
            key: 'item2Description',
            label: 'Portfolio 2 Description',
            kind: 'textarea',
        },
        {
            key: 'item2Href',
            label: 'Portfolio 2 Link',
            kind: 'text',
        },

        // Item 3
        {
            key: 'item3Image',
            label: 'Portfolio 3 Image',
            kind: 'image',
            folder: 'services/portfolios',
            accept: 'image/*',
        },
        {
            key: 'item3ImageAlt',
            label: 'Portfolio 3 Image Alt',
            kind: 'text',
        },
        {
            key: 'item3Category',
            label: 'Portfolio 3 Category',
            kind: 'text',
        },
        {
            key: 'item3Title',
            label: 'Portfolio 3 Title',
            kind: 'text',
        },
        {
            key: 'item3Description',
            label: 'Portfolio 3 Description',
            kind: 'textarea',
        },
        {
            key: 'item3Href',
            label: 'Portfolio 3 Link',
            kind: 'text',
        },

        // Item 4
        {
            key: 'item4Image',
            label: 'Portfolio 4 Image',
            kind: 'image',
            folder: 'services/portfolios',
            accept: 'image/*',
        },
        {
            key: 'item4ImageAlt',
            label: 'Portfolio 4 Image Alt',
            kind: 'text',
        },
        {
            key: 'item4Category',
            label: 'Portfolio 4 Category',
            kind: 'text',
        },
        {
            key: 'item4Title',
            label: 'Portfolio 4 Title',
            kind: 'text',
        },
        {
            key: 'item4Description',
            label: 'Portfolio 4 Description',
            kind: 'textarea',
        },
        {
            key: 'item4Href',
            label: 'Portfolio 4 Link',
            kind: 'text',
        },

        // Item 5
        {
            key: 'item5Image',
            label: 'Portfolio 5 Image',
            kind: 'image',
            folder: 'services/portfolios',
            accept: 'image/*',
        },
        {
            key: 'item5ImageAlt',
            label: 'Portfolio 5 Image Alt',
            kind: 'text',
        },
        {
            key: 'item5Category',
            label: 'Portfolio 5 Category',
            kind: 'text',
        },
        {
            key: 'item5Title',
            label: 'Portfolio 5 Title',
            kind: 'text',
        },
        {
            key: 'item5Description',
            label: 'Portfolio 5 Description',
            kind: 'textarea',
        },
        {
            key: 'item5Href',
            label: 'Portfolio 5 Link',
            kind: 'text',
        },

        // Item 6
        {
            key: 'item6Image',
            label: 'Portfolio 6 Image',
            kind: 'image',
            folder: 'services/portfolios',
            accept: 'image/*',
        },
        {
            key: 'item6ImageAlt',
            label: 'Portfolio 6 Image Alt',
            kind: 'text',
        },
        {
            key: 'item6Category',
            label: 'Portfolio 6 Category',
            kind: 'text',
        },
        {
            key: 'item6Title',
            label: 'Portfolio 6 Title',
            kind: 'text',
        },
        {
            key: 'item6Description',
            label: 'Portfolio 6 Description',
            kind: 'textarea',
        },
        {
            key: 'item6Href',
            label: 'Portfolio 6 Link',
            kind: 'text',
        },

        {
            key: 'showFilters',
            label: 'Show Filter Tabs',
            kind: 'toggle',
        },
        {
            key: 'showCta',
            label: 'Show CTA',
            kind: 'toggle',
        },
    ],

    render: (props) => <PortfolioService01 {...(props as unknown as PortfolioService01Props)} />,
};

export default PortfolioService01;
