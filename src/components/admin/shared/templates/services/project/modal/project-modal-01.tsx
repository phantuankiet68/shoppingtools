'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './project-modal-01.module.css';

type SupportedLocale = 'en' | 'vi' | 'ja';

type ProjectFeatureImage = {
    id: string;
    image: string;
    sortOrder: number;
    isPrimary: boolean;
};

type ProjectFeatureTranslation = {
    id: string;
    locale: string;
    title: string;
    description: unknown;
};

type ProjectFeatureDetail = {
    id: string;
    siteId: string;
    slug: string;
    category: string;
    status: string;
    developer: string | null;
    tags: unknown;
    viewCount: number;
    favoriteCount: number;
    shareCount: number;
    sortOrder: number;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    translations: ProjectFeatureTranslation[];
    images: ProjectFeatureImage[];
};

type ProjectFeatureResponse = {
    success: boolean;
    projectFeature?: ProjectFeatureDetail;
    message?: string;
};

type FallbackFeature = {
    id: string;
    title: string;
    description: string;
    subtitle: string;
    category: string;
    icon: string;
    image: string | null;
    developer: string | null;
};

type ProjectFeatureModalProps = {
    featureId: string | null;
    locale: SupportedLocale;
    fallbackFeature?: FallbackFeature | null;
    onClose: () => void;
};

function extractRichText(value: unknown): string {
    if (typeof value === 'string') {
        return value
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    if (Array.isArray(value)) {
        return value.map(extractRichText).filter(Boolean).join(' ').trim();
    }

    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;

        if (typeof record.text === 'string') {
            return record.text.trim();
        }

        if (Array.isArray(record.content)) {
            return extractRichText(record.content);
        }

        return Object.values(record).map(extractRichText).filter(Boolean).join(' ').trim();
    }

    return '';
}

function getTags(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );
}

function formatDate(value: string, locale: SupportedLocale): string {
    if (!value) return '—';

    try {
        return new Intl.DateTimeFormat(
            locale === 'vi' ? 'vi-VN' : locale === 'ja' ? 'ja-JP' : 'en-US',
            { year: 'numeric', month: 'short', day: 'numeric' },
        ).format(new Date(value));
    } catch {
        return value;
    }
}

function getCategoryLabel(category: string, locale: SupportedLocale): string {
    const labels: Record<string, Record<SupportedLocale, string>> = {
        WEBSITE_BUILDER: {
            en: 'Website Builder',
            vi: 'Trình tạo Website',
            ja: 'Webサイトビルダー',
        },
        SAAS: { en: 'SaaS', vi: 'SaaS', ja: 'SaaS' },
        ECOMMERCE: { en: 'E-commerce', vi: 'Thương mại điện tử', ja: 'Eコマース' },
        MOBILE_APP: { en: 'Mobile App', vi: 'Ứng dụng di động', ja: 'モバイルアプリ' },
        AI: { en: 'Artificial Intelligence', vi: 'Trí tuệ nhân tạo', ja: '人工知能' },
        DESIGN: { en: 'Design', vi: 'Thiết kế', ja: 'デザイン' },
        DEVELOPMENT: { en: 'Development', vi: 'Phát triển', ja: '開発' },
        OTHER: { en: 'Other', vi: 'Khác', ja: 'その他' },
    };

    return labels[category]?.[locale] ?? labels[category]?.en ?? category;
}

function getText(locale: SupportedLocale) {
    return {
        featured:
            locale === 'vi'
                ? 'Dự án tiêu biểu'
                : locale === 'ja'
                  ? '注目のプロジェクト'
                  : 'Featured Project',
        favorite: locale === 'vi' ? 'Yêu thích' : locale === 'ja' ? 'お気に入り' : 'Favorite',
        share: locale === 'vi' ? 'Chia sẻ' : locale === 'ja' ? '共有' : 'Share',
        overview:
            locale === 'vi'
                ? 'Tổng quan dự án'
                : locale === 'ja'
                  ? 'プロジェクト概要'
                  : 'Project Overview',
        updated: locale === 'vi' ? 'Cập nhật' : locale === 'ja' ? '最終更新' : 'Last updated',
        category: locale === 'vi' ? 'Danh mục' : locale === 'ja' ? 'カテゴリー' : 'Category',
        developer: locale === 'vi' ? 'Phát triển bởi' : locale === 'ja' ? '開発者' : 'Developer',
        status: locale === 'vi' ? 'Trạng thái' : locale === 'ja' ? 'ステータス' : 'Status',
        tags:
            locale === 'vi'
                ? 'Công nghệ & Tags'
                : locale === 'ja'
                  ? 'テクノロジー・タグ'
                  : 'Technology & Tags',
        views: locale === 'vi' ? 'Lượt xem' : locale === 'ja' ? '閲覧数' : 'Views',
        favorites: locale === 'vi' ? 'Yêu thích' : locale === 'ja' ? 'お気に入り' : 'Favorites',
        shares: locale === 'vi' ? 'Chia sẻ' : locale === 'ja' ? '共有' : 'Shares',
        close: locale === 'vi' ? 'Đóng' : locale === 'ja' ? '閉じる' : 'Close',
        previous: locale === 'vi' ? 'Ảnh trước' : locale === 'ja' ? '前の画像' : 'Previous image',
        next: locale === 'vi' ? 'Ảnh tiếp theo' : locale === 'ja' ? '次の画像' : 'Next image',
        loading:
            locale === 'vi'
                ? 'Đang tải project...'
                : locale === 'ja'
                  ? 'プロジェクトを読み込んでいます...'
                  : 'Loading project...',
        error:
            locale === 'vi'
                ? 'Không thể tải thông tin project.'
                : locale === 'ja'
                  ? 'プロジェクト情報を読み込めませんでした。'
                  : 'Unable to load project details.',
    };
}

export default function ProjectFeatureModal({
    featureId,
    locale,
    fallbackFeature,
    onClose,
}: ProjectFeatureModalProps) {
    const [data, setData] = useState<ProjectFeatureDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [favorite, setFavorite] = useState(false);
    const text = getText(locale);

    useEffect(() => {
        if (!featureId || !locale) return;

        const currentFeatureId = featureId;
        const currentLocale = locale;
        const controller = new AbortController();

        setData(null);
        setError(null);
        setLoading(true);
        setActiveImage(0);
        setFavorite(false);

        async function loadFeature() {
            try {
                const params = new URLSearchParams({
                    locale: currentLocale,
                });

                const response = await fetch(
                    `/api/v1/project-feature/${encodeURIComponent(currentFeatureId)}?${params.toString()}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        cache: 'no-store',
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(`Project Feature API failed: ${response.status}`);
                }

                const result: ProjectFeatureResponse = await response.json();

                if (!result.success || !result.projectFeature) {
                    throw new Error(result.message || 'Invalid Project Feature API response.');
                }

                if (!controller.signal.aborted) {
                    setData(result.projectFeature);
                }
            } catch (requestError) {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return;
                }

                console.error('[PROJECT_FEATURE_MODAL]', requestError);

                if (!controller.signal.aborted) {
                    setError(text.error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadFeature();

        return () => {
            controller.abort();
        };
    }, [featureId, locale, text.error]);

    useEffect(() => {
        if (!featureId) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (!data?.images.length) return;
            if (event.key === 'ArrowLeft')
                setActiveImage((index) => (index - 1 + data.images.length) % data.images.length);
            if (event.key === 'ArrowRight')
                setActiveImage((index) => (index + 1) % data.images.length);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [featureId, data?.images.length, onClose]);

    const translation = useMemo(() => {
        if (!data) return null;
        return (
            data.translations.find((item) => item.locale === locale) ?? data.translations[0] ?? null
        );
    }, [data, locale]);

    if (!featureId) return null;

    const images = data?.images?.slice().sort((a, b) => a.sortOrder - b.sortOrder) ?? [];
    const fallbackImage = fallbackFeature?.image ?? null;
    const displayImages =
        images.length > 0
            ? images
            : fallbackImage
              ? [{ id: 'fallback', image: fallbackImage, sortOrder: 0, isPrimary: true }]
              : [];
    const currentImage = displayImages[activeImage] ?? displayImages[0];
    const title = translation?.title || fallbackFeature?.title || 'Project';
    const description = translation
        ? extractRichText(translation.description)
        : fallbackFeature?.description || '';
    const category = data?.category ?? fallbackFeature?.category ?? 'OTHER';
    const tags = getTags(data?.tags);

    const handleShare = async () => {
        const shareData = { title, text: description, url: window.location.href };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }

            await navigator.clipboard?.writeText(window.location.href);
        } catch {
            // User cancelled native share or clipboard is unavailable.
        }
    };

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-feature-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className={styles.modal}>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label={text.close}
                    title={text.close}
                >
                    <i className="bi bi-x-lg" />
                </button>

                <div className={styles.modalBody}>
                    <div className={styles.mainColumn}>
                        <div className={styles.breadcrumb}>
                            <span>{text.featured}</span>
                            <i className="bi bi-chevron-right" />
                            <span>{getCategoryLabel(category, locale)}</span>
                            <i className="bi bi-chevron-right" />
                            <strong>{title}</strong>
                        </div>

                        <div className={styles.projectHeading}>
                            <div className={styles.projectIcon}>
                                <i className={`bi ${fallbackFeature?.icon ?? 'bi-window-stack'}`} />
                            </div>
                            <div className={styles.headingContent}>
                                <div className={styles.featuredBadge}>
                                    <i className="bi bi-stars" /> {text.featured}
                                </div>
                                <h2 id="project-feature-title">{title}</h2>
                                <p>{description}</p>
                            </div>
                            <div className={styles.headingActions}>
                                <button
                                    type="button"
                                    className={`${styles.actionButton} ${favorite ? styles.actionButtonActive : ''}`}
                                    onClick={() => setFavorite((value) => !value)}
                                >
                                    <i className={favorite ? 'bi bi-heart-fill' : 'bi bi-heart'} />
                                    <span>{text.favorite}</span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.actionButton}
                                    onClick={handleShare}
                                >
                                    <i className="bi bi-share" />
                                    <span>{text.share}</span>
                                </button>
                            </div>
                        </div>
                        <div className={styles.projectContent}>
                            <div className={styles.galleryCard}>
                                {loading ? (
                                    <div className={styles.galleryLoading}>
                                        <span className={styles.spinner} />
                                        <span>{text.loading}</span>
                                    </div>
                                ) : error && !currentImage ? (
                                    <div className={styles.galleryError}>{error}</div>
                                ) : currentImage ? (
                                    <>
                                        <div className={styles.galleryMain}>
                                            <div className={styles.galleryGlow} />
                                            <img
                                                src={currentImage.image}
                                                alt={title}
                                                className={styles.galleryImage}
                                            />
                                            {displayImages.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
                                                        onClick={() =>
                                                            setActiveImage(
                                                                (index) =>
                                                                    (index -
                                                                        1 +
                                                                        displayImages.length) %
                                                                    displayImages.length,
                                                            )
                                                        }
                                                        aria-label={text.previous}
                                                    >
                                                        <i className="bi bi-chevron-left" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
                                                        onClick={() =>
                                                            setActiveImage(
                                                                (index) =>
                                                                    (index + 1) %
                                                                    displayImages.length,
                                                            )
                                                        }
                                                        aria-label={text.next}
                                                    >
                                                        <i className="bi bi-chevron-right" />
                                                    </button>
                                                </>
                                            )}
                                            <div className={styles.imageCounter}>
                                                {String(activeImage + 1).padStart(2, '0')} /{' '}
                                                {String(displayImages.length).padStart(2, '0')}
                                            </div>
                                        </div>

                                        {displayImages.length > 1 && (
                                            <div className={styles.thumbnailList}>
                                                {displayImages.map((image, index) => (
                                                    <button
                                                        type="button"
                                                        key={image.id}
                                                        className={`${styles.thumbnail} ${index === activeImage ? styles.thumbnailActive : ''}`}
                                                        onClick={() => setActiveImage(index)}
                                                        aria-label={`${text.featured} ${index + 1}`}
                                                    >
                                                        <img src={image.image} alt="" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.galleryEmpty}>
                                        <i
                                            className={`bi ${fallbackFeature?.icon ?? 'bi-image'}`}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.overviewCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <span className={styles.cardEyebrow}>{text.featured}</span>
                                        <h3>{text.overview}</h3>
                                    </div>
                                    <span className={styles.statusBadge}>
                                        <span />
                                        {data?.status ?? 'PUBLISHED'}
                                    </span>
                                </div>
                                <p>{description}</p>
                                {tags.length > 0 && (
                                    <div className={styles.tagsSection}>
                                        <span className={styles.metaLabel}>{text.tags}</span>
                                        <div className={styles.tags}>
                                            {tags.map((tag) => (
                                                <span key={tag}>{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarCard}>
                            <div className={styles.sidebarTopIcon}>
                                <i className="bi bi-rocket-takeoff-fill" />
                            </div>
                            <div className={styles.infoList}>
                                <div className={styles.infoItem}>
                                    <span>
                                        <i className="bi bi-grid" />
                                        {text.category}
                                    </span>
                                    <strong>{getCategoryLabel(category, locale)}</strong>
                                </div>
                                <div className={styles.infoItem}>
                                    <span>
                                        <i className="bi bi-person" />
                                        {text.developer}
                                    </span>
                                    <strong>
                                        {data?.developer ||
                                            fallbackFeature?.developer ||
                                            'KBuilder'}
                                    </strong>
                                </div>
                                <div className={styles.infoItem}>
                                    <span>
                                        <i className="bi bi-clock-history" />
                                        {text.updated}
                                    </span>
                                    <strong>
                                        {data ? formatDate(data.updatedAt, locale) : '—'}
                                    </strong>
                                </div>
                                <div className={styles.infoItem}>
                                    <span>
                                        <i className="bi bi-check-circle" />
                                        {text.status}
                                    </span>
                                    <strong>{data?.status ?? 'PUBLISHED'}</strong>
                                </div>
                            </div>
                        </div>

                        <div className={styles.statsCard}>
                            <div className={styles.statItem}>
                                <strong>{data?.viewCount ?? 0}</strong>
                                <span>{text.views}</span>
                            </div>
                            <div className={styles.statItem}>
                                <strong>{data?.favoriteCount ?? 0}</strong>
                                <span>{text.favorites}</span>
                            </div>
                            <div className={styles.statItem}>
                                <strong>{data?.shareCount ?? 0}</strong>
                                <span>{text.shares}</span>
                            </div>
                        </div>

                        <div className={styles.sidebarCard}>
                            <div className={styles.sidebarHeading}>
                                <i className="bi bi-info-circle" />
                                <strong>{text.overview}</strong>
                            </div>
                            <p>{description || text.loading}</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
