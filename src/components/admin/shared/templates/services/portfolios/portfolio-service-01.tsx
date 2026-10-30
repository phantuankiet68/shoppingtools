'use client';

import styles from '@/components/admin/shared/templates/services/portfolios/styles/portfolio-service-01.module.css';
import { getLocalizedValue, LocalizedText } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';

type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';
type PortfolioSize = 'tall' | 'wide' | 'normal';
type SupportedLocale = 'en' | 'vi' | 'ja';

interface PortfolioApiItem {
    id: string;
    siteId: string;
    imageUrl: string;
    category: WebsiteType;
    size: PortfolioSize;
    href: string | null;
    sortOrder: number;
    isActive: boolean;
    imageAlt: string;
    title: string;
    description: string | null;
    locale: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PortfolioApiResponse {
    success: boolean;
    portfolios: PortfolioApiItem[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface PortfolioItem {
    id: string;
    imageUrl: string;
    imageAlt: string;
    category: WebsiteType;
    title: string;
    description?: string;
    size: PortfolioSize;
    href?: string;
}

export interface PortfolioService01Props {
    siteId?: string;

    eyebrow?: LocalizedText;
    headline?: LocalizedText;
    headlineAccent?: LocalizedText;
    subheadline?: LocalizedText;

    filterAllText?: LocalizedText;
    detailText?: LocalizedText;

    ctaDescription?: LocalizedText;
    ctaText?: LocalizedText;
    ctaHref?: string;

    showFilters?: boolean;
    showCta?: boolean;
}

const WEBSITE_TYPES: WebsiteType[] = ['landing', 'blog', 'ecommerce', 'booking', 'lms'];

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'vi', 'ja'];

const FALLBACK_ITEMS: PortfolioItem[] = [
    {
        id: 'sample-portfolio',
        imageUrl: '/assets/portfolio/landing-01.jpg',
        imageAlt: 'Modern SaaS Landing Page',
        category: 'landing',
        title: 'AI SaaS Platform',
        description: 'Modern landing page designed to maximize conversions.',
        size: 'tall',
        href: '#',
    },
];

function createLocalizedText(defaultValue: string, vi?: string, ja?: string): LocalizedText {
    return {
        sourceLocale: 'en',
        default: defaultValue,
        translations: {
            ...(vi ? { vi } : {}),
            ...(ja ? { ja } : {}),
        },
    };
}

function normalizeLocale(value: string | null | undefined): SupportedLocale {
    return SUPPORTED_LOCALES.includes(value as SupportedLocale) ? (value as SupportedLocale) : 'en';
}

function isValidImageUrl(url: string) {
    return (
        url.startsWith('/') ||
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('blob:')
    );
}

function isExternalImage(url: string) {
    return url.startsWith('http://') || url.startsWith('https://');
}

function getPlaceholderConfig(category: WebsiteType) {
    switch (category) {
        case 'landing':
            return {
                background: '#EBF5FB',
                icon: 'window-stack',
            };

        case 'blog':
            return {
                background: '#E8F8F5',
                icon: 'journal-richtext',
            };

        case 'ecommerce':
            return {
                background: '#FEF9E7',
                icon: 'bag-check',
            };

        case 'booking':
            return {
                background: '#FDF2F8',
                icon: 'calendar-check',
            };

        case 'lms':
            return {
                background: '#EAF2FF',
                icon: 'mortarboard-fill',
            };

        default:
            return {
                background: '#F0F4FF',
                icon: 'image',
            };
    }
}

function getCategoryLabel(category: WebsiteType, locale: SupportedLocale) {
    const labels: Record<WebsiteType, Record<SupportedLocale, string>> = {
        landing: {
            en: 'Landing Page',
            vi: 'Landing Page',
            ja: 'ランディングページ',
        },
        blog: {
            en: 'Blog',
            vi: 'Blog',
            ja: 'ブログ',
        },
        ecommerce: {
            en: 'E-commerce',
            vi: 'E-commerce',
            ja: 'Eコマース',
        },
        booking: {
            en: 'Booking',
            vi: 'Đặt lịch',
            ja: '予約',
        },
        lms: {
            en: 'LMS',
            vi: 'LMS',
            ja: 'LMS',
        },
    };

    return labels[category][locale] ?? labels[category].en;
}

function useInView(ref: RefObject<HTMLElement | null>, threshold = 0.05) {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element || inView) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    return;
                }

                setInView(true);
                observer.disconnect();
            },
            { threshold },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [inView, ref, threshold]);

    return inView;
}

function PlaceholderCard({ category, title }: { category: WebsiteType; title: string }) {
    const config = getPlaceholderConfig(category);

    return (
        <div className={styles.placeholder} style={{ background: config.background }}>
            <i className={`bi bi-${config.icon}`} aria-hidden="true" />
            <span>{title}</span>
        </div>
    );
}

function isWebsiteType(value: unknown): value is WebsiteType {
    return typeof value === 'string' && WEBSITE_TYPES.includes(value as WebsiteType);
}

function isPortfolioSize(value: unknown): value is PortfolioSize {
    return value === 'tall' || value === 'wide' || value === 'normal';
}

function isPortfolioApiItem(value: unknown): value is PortfolioApiItem {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const item = value as Partial<PortfolioApiItem>;

    return (
        typeof item.id === 'string' &&
        typeof item.imageUrl === 'string' &&
        typeof item.title === 'string' &&
        isWebsiteType(item.category) &&
        isPortfolioSize(item.size) &&
        typeof item.isActive === 'boolean'
    );
}

function mapPortfolioItem(item: PortfolioApiItem): PortfolioItem {
    return {
        id: item.id,
        imageUrl: item.imageUrl.trim(),
        imageAlt:
            typeof item.imageAlt === 'string' && item.imageAlt.trim()
                ? item.imageAlt.trim()
                : item.title,
        category: item.category,
        title: item.title.trim() || 'Untitled Portfolio',
        description:
            typeof item.description === 'string' && item.description.trim()
                ? item.description.trim()
                : undefined,
        size: item.size,
        href: typeof item.href === 'string' && item.href.trim() ? item.href.trim() : undefined,
    };
}

export const DEFAULT_PROPS: Required<Omit<PortfolioService01Props, 'siteId'>> & {
    siteId?: string;
} = {
    siteId: undefined,

    eyebrow: createLocalizedText(
        'Website Builder Platform',
        'Nền tảng xây dựng website',
        'Webサイトビルダープラットフォーム',
    ),

    headline: createLocalizedText(
        'Build Professional Websites',
        'Xây dựng website chuyên nghiệp',
        'プロフェッショナルなWebサイトを構築',
    ),

    headlineAccent: createLocalizedText('10x Faster', 'Nhanh hơn 10 lần', '10倍速く'),

    subheadline: createLocalizedText(
        'Generate beautiful websites with AI, customize every section visually, and publish instantly with your own domain and secure hosting.',
        'Tạo website đẹp bằng AI, tùy chỉnh trực quan từng section và xuất bản ngay với tên miền riêng cùng hệ thống hosting bảo mật.',
        'AIで美しいWebサイトを生成し、各セクションをビジュアルに編集。独自ドメインと安全なホスティングで即座に公開できます。',
    ),

    filterAllText: createLocalizedText('All', 'Tất cả', 'すべて'),

    detailText: createLocalizedText('View details', 'Xem chi tiết', '詳細を見る'),

    ctaDescription: createLocalizedText(
        'Ready to build your next website?',
        'Bạn đã sẵn sàng xây dựng website tiếp theo?',
        '次のWebサイトを構築する準備はできましたか？',
    ),

    ctaText: createLocalizedText('Start Building', 'Bắt đầu xây dựng', '構築を始める'),

    ctaHref: '/services',

    showFilters: true,
    showCta: true,
};

export function PortfolioService01(props: PortfolioService01Props) {
    const mergedProps = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        siteId,
        eyebrow,
        headline,
        headlineAccent,
        subheadline,
        filterAllText,
        detailText,
        ctaDescription,
        ctaText,
        ctaHref,
        showFilters,
        showCta,
    } = mergedProps;

    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>('en');

    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [failedImageKeys, setFailedImageKeys] = useState<Set<string>>(() => new Set());

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedLocale = normalizeLocale(window.localStorage.getItem('locale'));

        setSelectedLocale(storedLocale);

        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            const nextLocale = normalizeLocale(customEvent.detail);

            setSelectedLocale(nextLocale);
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    useEffect(() => {
        setActiveFilter('all');
        setHoveredId(null);

        const normalizedSiteId: string = siteId?.trim() ?? '';

        if (normalizedSiteId.length === 0) {
            setItems([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadPortfolios() {
            // Clear the previous site's data while the next site/locale is loading.
            setItems([]);
            setLoading(true);

            try {
                const params = new URLSearchParams({
                    siteId: normalizedSiteId,
                    locale: selectedLocale,
                    limit: '50',
                });

                const response = await fetch(`/api/v1/portfolios?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Portfolio API failed: ${response.status}`);
                }

                const data: unknown = await response.json();

                if (!data || typeof data !== 'object') {
                    throw new Error('Portfolio API returned an invalid response.');
                }

                const payload = data as Partial<PortfolioApiResponse>;

                if (payload.success !== true || !Array.isArray(payload.portfolios)) {
                    throw new Error('Portfolio API returned an unsuccessful or invalid payload.');
                }

                const nextItems = payload.portfolios
                    .filter(isPortfolioApiItem)
                    .filter((item) => item.isActive && item.imageUrl.trim().length > 0)
                    .map(mapPortfolioItem);

                // Keep only real database records in state. Fallback is applied at render time.
                if (!controller.signal.aborted) {
                    setItems(nextItems);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                console.error('[PORTFOLIO_SERVICE_01]', error);

                if (!controller.signal.aborted) {
                    setItems([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadPortfolios();

        return () => {
            controller.abort();
        };
    }, [siteId, selectedLocale]);

    const t = (value: LocalizedText | undefined, fallback: LocalizedText) =>
        getLocalizedValue(value ?? fallback, selectedLocale);

    const localizedFilterAllText = t(filterAllText, DEFAULT_PROPS.filterAllText);

    const displayItems = useMemo<PortfolioItem[]>(() => {
        if (loading) {
            return [];
        }

        return items.length > 0 ? items : FALLBACK_ITEMS;
    }, [items, loading]);

    const categories = useMemo(
        () => WEBSITE_TYPES.filter((category) => items.some((item) => item.category === category)),
        [items],
    );

    const filteredItems = useMemo(
        () =>
            activeFilter === 'all'
                ? displayItems
                : displayItems.filter((item) => item.category === activeFilter),
        [activeFilter, displayItems],
    );

    useEffect(() => {
        if (activeFilter !== 'all' && !categories.includes(activeFilter as WebsiteType)) {
            setActiveFilter('all');
        }
    }, [activeFilter, categories]);

    function sizeClass(item: PortfolioItem) {
        switch (item.size) {
            case 'tall':
                return styles.cellTall;

            case 'wide':
                return styles.cellWide;

            default:
                return '';
        }
    }

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label={t(headline, DEFAULT_PROPS.headline)}
        >
            <div className={styles.wrap}>
                <div
                    className={`${styles.header} ${styles.r}`}
                    style={
                        {
                            '--i': 0,
                        } as CSSProperties
                    }
                >
                    <div className={styles.headerLeft}>
                        <span className={styles.eyebrow}>
                            <i className="bi bi-grid-3x3-gap-fill" aria-hidden="true" />
                            {t(eyebrow, DEFAULT_PROPS.eyebrow)}
                        </span>

                        <h2 className={styles.headline}>
                            {t(headline, DEFAULT_PROPS.headline)}{' '}
                            <span className={styles.accent}>
                                {t(headlineAccent, DEFAULT_PROPS.headlineAccent)}
                            </span>
                        </h2>

                        <p className={styles.sub}>{t(subheadline, DEFAULT_PROPS.subheadline)}</p>
                    </div>

                    {showFilters && categories.length > 0 && (
                        <div
                            className={`${styles.filters} ${styles.r}`}
                            style={
                                {
                                    '--i': 1,
                                } as CSSProperties
                            }
                            role="tablist"
                            aria-label="Portfolio filters"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeFilter === 'all'}
                                onClick={() => setActiveFilter('all')}
                                className={`${styles.filterBtn} ${
                                    activeFilter === 'all' ? styles.filterActive : ''
                                }`}
                            >
                                <span className={styles.filterLabel}>{localizedFilterAllText}</span>

                                <span className={styles.filterBadge}>{items.length}</span>
                            </button>

                            {categories.map((category) => {
                                const count = items.filter(
                                    (item) => item.category === category,
                                ).length;

                                const active = activeFilter === category;

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveFilter(category)}
                                        className={`${styles.filterBtn} ${
                                            active ? styles.filterActive : ''
                                        }`}
                                    >
                                        <span className={styles.filterLabel}>
                                            {getCategoryLabel(category, selectedLocale)}
                                        </span>

                                        <span className={styles.filterBadge}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {showCta && (
                        <div
                            className={`${styles.bottomCta} ${styles.r}`}
                            style={
                                {
                                    '--i': 3,
                                } as CSSProperties
                            }
                        >
                            <div className={styles.bottomCtaInner}>
                                <div className={styles.bottomCtaCopy}>
                                    <i className="bi bi-stars" aria-hidden="true" />

                                    <span>{t(ctaDescription, DEFAULT_PROPS.ctaDescription)}</span>
                                </div>

                                <Link
                                    href={ctaHref || DEFAULT_PROPS.ctaHref}
                                    className={styles.bottomCtaLink}
                                >
                                    {t(ctaText, DEFAULT_PROPS.ctaText)}

                                    <i className="bi bi-arrow-right" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className={`${styles.bentoGrid} ${styles.r}`}
                    style={
                        {
                            '--i': 2,
                        } as CSSProperties
                    }
                >
                    {filteredItems.map((item, index) => (
                        <article
                            key={item.id}
                            className={`${styles.cell} ${sizeClass(item)}`}
                            style={
                                {
                                    '--delay': `${index * 60}ms`,
                                } as CSSProperties
                            }
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className={styles.cellMedia}>
                                {isValidImageUrl(item.imageUrl) &&
                                !failedImageKeys.has(`${item.id}:${item.imageUrl}`) ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.imageAlt || item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className={styles.cellImg}
                                        unoptimized={
                                            isExternalImage(item.imageUrl) ||
                                            item.imageUrl.startsWith('blob:')
                                        }
                                        onError={() => {
                                            const imageKey = `${item.id}:${item.imageUrl}`;
                                            setFailedImageKeys((current) => {
                                                if (current.has(imageKey)) {
                                                    return current;
                                                }

                                                const next = new Set(current);
                                                next.add(imageKey);
                                                return next;
                                            });
                                        }}
                                    />
                                ) : (
                                    <PlaceholderCard category={item.category} title={item.title} />
                                )}

                                <div className={styles.overlay} aria-hidden="true" />

                                <div
                                    className={`${styles.hoverOverlay} ${
                                        hoveredId === item.id ? styles.hoverVisible : ''
                                    }`}
                                >
                                    <div className={styles.hoverContent}>
                                        <h3 className={styles.hoverTitle}>{item.title}</h3>

                                        {item.description && (
                                            <p className={styles.hoverDesc}>{item.description}</p>
                                        )}

                                        {item.href && (
                                            <Link href={item.href} className={styles.hoverLink}>
                                                {t(detailText, DEFAULT_PROPS.detailText)}

                                                <i
                                                    className="bi bi-arrow-up-right"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.badge}>
                                <i
                                    className={`bi bi-${getPlaceholderConfig(item.category).icon}`}
                                    aria-hidden="true"
                                />

                                {getCategoryLabel(item.category, selectedLocale)}
                            </div>
                        </article>
                    ))}

                    {loading && (
                        <div className={styles.r} aria-live="polite" role="status">
                            Loading portfolio...
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────
   Inspector
───────────────────────────────────────────────── */

function createLocalizedTextField(
    key: keyof PortfolioService01Props,
    label: string,
    kind: 'localized-text' | 'textarea' = 'localized-text',
): InspectorField {
    return {
        key,
        label,
        kind,
    };
}

function createTextField(key: keyof PortfolioService01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'text',
    };
}

function createCheckField(key: keyof PortfolioService01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'check',
    };
}

function createInspector(): InspectorField[] {
    return [
        createLocalizedTextField('eyebrow', 'Eyebrow'),
        createLocalizedTextField('headline', 'Headline'),
        createLocalizedTextField('headlineAccent', 'Headline Accent'),
        createLocalizedTextField('subheadline', 'Subheadline', 'textarea'),
        createLocalizedTextField('filterAllText', 'Filter All Text'),
        createLocalizedTextField('detailText', 'Detail Button Text'),
        createLocalizedTextField('ctaDescription', 'CTA Description', 'textarea'),
        createLocalizedTextField('ctaText', 'CTA Text'),
        createTextField('ctaHref', 'CTA Link'),
        createCheckField('showFilters', 'Show Filter Tabs'),
        createCheckField('showCta', 'Show CTA'),
    ];
}

export const PORTFOLIO_SERVICE_01: RegItem = {
    kind: 'portfolio-service-01',
    label: 'Portfolio Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <PortfolioService01 {...(props as PortfolioService01Props)} />,
};

export default PortfolioService01;
