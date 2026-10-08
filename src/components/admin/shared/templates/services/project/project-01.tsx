'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';

import styles from '@/components/admin/shared/templates/services/project/styles/project-01.module.css';
import carouselStyles from '@/components/admin/shared/templates/services/project/styles/project-01-carousel.module.css';
import ProjectModal01 from '@/components/admin/shared/templates/services/project/modal/project-modal-01';

type SupportedLocale = 'en' | 'vi' | 'ja';

type ProjectFeatureCategory =
    | 'WEBSITE_BUILDER'
    | 'SAAS'
    | 'ECOMMERCE'
    | 'MOBILE_APP'
    | 'AI'
    | 'DESIGN'
    | 'DEVELOPMENT'
    | 'OTHER';

type ProjectFeatureImage = {
    id: string;
    featureId?: string;
    image: string;
    sortOrder: number;
    isPrimary: boolean;
};

type ProjectFeatureApiItem = {
    id: string;
    siteId: string;
    slug: string;
    category: ProjectFeatureCategory;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    developer: string | null;
    tags: unknown;
    sortOrder: number;
    isFeatured: boolean;
    title: string;
    description: unknown;
    locale: string | null;
    images: ProjectFeatureImage[];
};

type ProjectFeatureApiResponse = {
    success: boolean;
    projectFeatures: ProjectFeatureApiItem[];
    total?: number;
    message?: string;
};

type FeatureItem = {
    id: string;
    isSample?: boolean;
    category: ProjectFeatureCategory;
    subtitle: string;
    icon: string;
    title: string;
    description: string;
    image: string | null;
    developer: string | null;
};

type SolutionItem = {
    id: string;
    icon: string;
    variant: string;
    title: LocalizedText;
    description: LocalizedText;
};

type CategoryMeta = {
    icon: string;
    label: LocalizedText;
};

type FeatureCardProps = {
    feature: FeatureItem;
    learnMoreLabel: string;
    onOpenFeature: (feature: FeatureItem) => void;
};

export interface ProjectPage01Props {
    siteId?: string;

    heroBadgeTop?: LocalizedText;
    heroBadgeLeft?: LocalizedText;
    heroTitle?: LocalizedText;
    heroTitleAccent?: LocalizedText;
    heroDescription?: LocalizedText;
    heroButtonLabel?: LocalizedText;
    heroDemoLabel?: LocalizedText;

    heroFeature1?: LocalizedText;
    heroFeature2?: LocalizedText;
    heroFeature3?: LocalizedText;

    trust1Title?: LocalizedText;
    trust1Description?: LocalizedText;
    trust2Title?: LocalizedText;
    trust2Description?: LocalizedText;
    trust3Title?: LocalizedText;
    trust3Description?: LocalizedText;
    trust4Title?: LocalizedText;
    trust4Description?: LocalizedText;

    savingLabel?: LocalizedText;
    visualNote?: LocalizedText;

    eyebrow?: LocalizedText;
    title?: LocalizedText;
    highlight?: LocalizedText;
    description?: LocalizedText;
    learnMoreLabel?: LocalizedText;

    ctaEyebrow?: LocalizedText;
    ctaTitle?: LocalizedText;
    ctaDescription?: LocalizedText;
    ctaLabel?: LocalizedText;

    eyebrowText1?: LocalizedText;
    eyebrowAccentText1?: LocalizedText;
    highlightText1?: LocalizedText;

    eyebrowText2?: LocalizedText;
    eyebrowAccentText2?: LocalizedText;
    highlightText2?: LocalizedText;

    sectionBadge?: LocalizedText;
    sectionTitle?: LocalizedText;
    sectionTitleAccent?: LocalizedText;

    loadingProjectsLabel?: LocalizedText;
    noProjectsLabel?: LocalizedText;
    carouselGoToLabel?: LocalizedText;

    categoryLabels?: Record<ProjectFeatureCategory, CategoryMeta>;

    solutions?: SolutionItem[];
}

export const DEFAULT_PROPS: Required<Omit<ProjectPage01Props, 'siteId'>> & {
    siteId?: string;
} = {
    siteId: undefined,

    heroBadgeTop: {
        sourceLocale: 'en',
        default: 'AI Generated',
        translations: {
            vi: 'Được tạo bởi AI',
            ja: 'AI生成',
        },
    },

    heroBadgeLeft: {
        sourceLocale: 'en',
        default: 'No-Code Website Builder',
        translations: {
            vi: 'Trình tạo website không cần code',
            ja: 'ノーコードWebサイトビルダー',
        },
    },

    heroTitle: {
        sourceLocale: 'en',
        default: 'Build Your Website',
        translations: {
            vi: 'Xây dựng website',
            ja: 'Webサイトを構築',
        },
    },

    heroTitleAccent: {
        sourceLocale: 'en',
        default: 'with KBuilder',
        translations: {
            vi: 'với KBuilder',
            ja: 'KBuilderで',
        },
    },

    heroDescription: {
        sourceLocale: 'en',
        default:
            'Create and launch professional websites faster with visual editing, responsive templates, reusable sections and integrated hosting.',
        translations: {
            vi: 'Tạo và xuất bản website chuyên nghiệp nhanh hơn với trình chỉnh sửa trực quan, giao diện responsive, section tái sử dụng và hosting tích hợp.',
            ja: 'ビジュアル編集、レスポンシブテンプレート、再利用可能なセクション、統合ホスティングでWebサイトを素早く公開できます。',
        },
    },

    heroButtonLabel: {
        sourceLocale: 'en',
        default: 'Start Building',
        translations: {
            vi: 'Bắt đầu xây dựng',
            ja: '今すぐ始める',
        },
    },

    heroDemoLabel: {
        sourceLocale: 'en',
        default: 'Live Demo',
        translations: {
            vi: 'Xem demo',
            ja: 'デモを見る',
        },
    },

    heroFeature1: {
        sourceLocale: 'en',
        default: 'Visual Drag & Drop',
        translations: {
            vi: 'Kéo & thả trực quan',
            ja: '直感的なドラッグ＆ドロップ',
        },
    },

    heroFeature2: {
        sourceLocale: 'en',
        default: 'Professional Templates',
        translations: {
            vi: 'Mẫu giao diện chuyên nghiệp',
            ja: 'プロフェッショナルテンプレート',
        },
    },

    heroFeature3: {
        sourceLocale: 'en',
        default: 'Integrated Hosting',
        translations: {
            vi: 'Hosting tích hợp',
            ja: '統合ホスティング',
        },
    },

    trust1Title: {
        sourceLocale: 'en',
        default: 'No credit card',
        translations: {
            vi: 'Không cần thẻ tín dụng',
            ja: 'クレジットカード不要',
        },
    },

    trust1Description: {
        sourceLocale: 'en',
        default: 'Start for free',
        translations: {
            vi: 'Bắt đầu miễn phí',
            ja: '無料で開始',
        },
    },

    trust2Title: {
        sourceLocale: 'en',
        default: 'Secure hosting',
        translations: {
            vi: 'Hosting an toàn',
            ja: '安全なホスティング',
        },
    },

    trust2Description: {
        sourceLocale: 'en',
        default: 'Always reliable',
        translations: {
            vi: 'Luôn ổn định',
            ja: '安定した環境',
        },
    },

    trust3Title: {
        sourceLocale: 'en',
        default: 'Quick setup',
        translations: {
            vi: 'Thiết lập nhanh',
            ja: 'かんたん設定',
        },
    },

    trust3Description: {
        sourceLocale: 'en',
        default: 'Just minutes',
        translations: {
            vi: 'Chỉ vài phút',
            ja: '数分で完了',
        },
    },

    trust4Title: {
        sourceLocale: 'en',
        default: 'Built-in SSL',
        translations: {
            vi: 'SSL tích hợp',
            ja: 'SSL標準搭載',
        },
    },

    trust4Description: {
        sourceLocale: 'en',
        default: 'Included',
        translations: {
            vi: 'Đã bao gồm',
            ja: '標準搭載',
        },
    },

    savingLabel: {
        sourceLocale: 'en',
        default: 'Save up to',
        translations: {
            vi: 'Tiết kiệm đến',
            ja: '最大',
        },
    },

    visualNote: {
        sourceLocale: 'en',
        default: 'Build better together',
        translations: {
            vi: 'Xây dựng tốt hơn cùng nhau',
            ja: 'もっと良く、一緒に',
        },
    },

    eyebrow: {
        sourceLocale: 'en',
        default: 'COMPREHENSIVE AI SOLUTIONS',
        translations: {
            vi: 'GIẢI PHÁP AI TOÀN DIỆN',
            ja: '包括的なAIソリューション',
        },
    },

    title: {
        sourceLocale: 'en',
        default: 'Turn ideas into',
        translations: {
            vi: 'Biến ý tưởng thành',
            ja: 'アイデアを',
        },
    },

    highlight: {
        sourceLocale: 'en',
        default: 'smart products',
        translations: {
            vi: 'sản phẩm thông minh',
            ja: 'スマートな製品へ',
        },
    },

    description: {
        sourceLocale: 'en',
        default:
            'Build, launch and scale digital products faster with the right technology, expertise and tools.',
        translations: {
            vi: 'Xây dựng, triển khai và mở rộng sản phẩm số nhanh hơn với công nghệ, chuyên môn và công cụ phù hợp.',
            ja: '最適なテクノロジー、専門知識、ツールを活用してデジタル製品をより速く構築、展開できます。',
        },
    },

    learnMoreLabel: {
        sourceLocale: 'en',
        default: 'Learn more',
        translations: {
            vi: 'Tìm hiểu thêm',
            ja: '詳しく見る',
        },
    },

    ctaEyebrow: {
        sourceLocale: 'en',
        default: 'BUILD THE FUTURE WITH US',
        translations: {
            vi: 'ĐỒNG HÀNH CÙNG BẠN',
            ja: '私たちと未来を築く',
        },
    },

    ctaTitle: {
        sourceLocale: 'en',
        default: 'Build the future with AI today',
        translations: {
            vi: 'Xây dựng tương lai với AI ngay hôm nay',
            ja: '今すぐAIと未来を創る',
        },
    },

    ctaDescription: {
        sourceLocale: 'en',
        default:
            'From ideas to complete digital products, KBuilder provides the technology and support you need to move forward with confidence.',
        translations: {
            vi: 'Từ ý tưởng đến sản phẩm số hoàn chỉnh, KBuilder cung cấp công nghệ và hỗ trợ cần thiết để bạn phát triển nhanh chóng và hiệu quả.',
            ja: 'アイデアから完成したデジタル製品まで、KBuilderが自信を持って開発を進めるためのテクノロジーとサポートを提供します。',
        },
    },

    ctaLabel: {
        sourceLocale: 'en',
        default: 'Get started',
        translations: {
            vi: 'Bắt đầu ngay',
            ja: '今すぐ始める',
        },
    },

    eyebrowText1: {
        sourceLocale: 'en',
        default: 'Create Professional Websites',
        translations: {
            vi: 'Tạo website chuyên nghiệp',
            ja: 'プロフェッショナルなWebサイトを構築',
        },
    },

    eyebrowAccentText1: {
        sourceLocale: 'en',
        default: 'Without Code',
        translations: {
            vi: 'Không cần lập trình',
            ja: 'コード不要',
        },
    },

    highlightText1: {
        sourceLocale: 'en',
        default: 'Automation Ready',
        translations: {
            vi: 'Sẵn sàng tự động hóa',
            ja: '自動化対応',
        },
    },

    eyebrowText2: {
        sourceLocale: 'en',
        default: 'Research & Development',
        translations: {
            vi: 'Nghiên cứu & phát triển',
            ja: '研究開発',
        },
    },

    eyebrowAccentText2: {
        sourceLocale: 'en',
        default: 'with Modern Technology',
        translations: {
            vi: 'với công nghệ hiện đại',
            ja: '最新テクノロジーで',
        },
    },

    highlightText2: {
        sourceLocale: 'en',
        default: 'Explore Projects',
        translations: {
            vi: 'Khám phá dự án',
            ja: 'プロジェクトを見る',
        },
    },

    sectionBadge: {
        sourceLocale: 'en',
        default: 'What We Build',
        translations: {
            vi: 'Những gì chúng tôi xây dựng',
            ja: '私たちが提供するもの',
        },
    },

    sectionTitle: {
        sourceLocale: 'en',
        default: 'Everything You Need',
        translations: {
            vi: 'Mọi thứ bạn cần',
            ja: '必要なものすべて',
        },
    },

    sectionTitleAccent: {
        sourceLocale: 'en',
        default: 'To Launch Online',
        translations: {
            vi: 'Để phát triển trực tuyến',
            ja: 'オンライン公開のために',
        },
    },

    loadingProjectsLabel: {
        sourceLocale: 'en',
        default: 'Loading projects...',
        translations: {
            vi: 'Đang tải project...',
            ja: 'プロジェクトを読み込んでいます...',
        },
    },

    noProjectsLabel: {
        sourceLocale: 'en',
        default: 'No projects available.',
        translations: {
            vi: 'Chưa có project.',
            ja: 'プロジェクトがありません。',
        },
    },

    carouselGoToLabel: {
        sourceLocale: 'en',
        default: 'Go to slide',
        translations: {
            vi: 'Đến slide',
            ja: 'スライドへ',
        },
    },

    categoryLabels: {
        WEBSITE_BUILDER: {
            icon: 'bi-window-stack',
            label: {
                sourceLocale: 'en',
                default: 'Website Builder',
                translations: {
                    vi: 'Trình tạo Website',
                    ja: 'Webサイトビルダー',
                },
            },
        },

        SAAS: {
            icon: 'bi-cloud-check',
            label: {
                sourceLocale: 'en',
                default: 'SaaS',
                translations: {
                    vi: 'SaaS',
                    ja: 'SaaS',
                },
            },
        },

        ECOMMERCE: {
            icon: 'bi-cart-check',
            label: {
                sourceLocale: 'en',
                default: 'E-commerce',
                translations: {
                    vi: 'Thương mại điện tử',
                    ja: 'Eコマース',
                },
            },
        },

        MOBILE_APP: {
            icon: 'bi-phone',
            label: {
                sourceLocale: 'en',
                default: 'Mobile Apps',
                translations: {
                    vi: 'Ứng dụng di động',
                    ja: 'モバイルアプリ',
                },
            },
        },

        AI: {
            icon: 'bi-cpu',
            label: {
                sourceLocale: 'en',
                default: 'Artificial Intelligence',
                translations: {
                    vi: 'Trí tuệ nhân tạo',
                    ja: '人工知能',
                },
            },
        },

        DESIGN: {
            icon: 'bi-palette',
            label: {
                sourceLocale: 'en',
                default: 'Design',
                translations: {
                    vi: 'Thiết kế',
                    ja: 'デザイン',
                },
            },
        },

        DEVELOPMENT: {
            icon: 'bi-code-slash',
            label: {
                sourceLocale: 'en',
                default: 'Development',
                translations: {
                    vi: 'Phát triển',
                    ja: '開発',
                },
            },
        },

        OTHER: {
            icon: 'bi-stars',
            label: {
                sourceLocale: 'en',
                default: 'Other',
                translations: {
                    vi: 'Khác',
                    ja: 'その他',
                },
            },
        },
    },

    solutions: [
        {
            id: 'website-builder',
            icon: 'bi-window-stack',
            variant: 'solutions01Blue',
            title: {
                sourceLocale: 'en',
                default: 'Website Builder',
                translations: {
                    vi: 'Trình tạo Website',
                    ja: 'Webサイトビルダー',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Build professional websites visually with reusable sections, responsive layouts and modern templates.',
                translations: {
                    vi: 'Xây dựng website chuyên nghiệp bằng giao diện trực quan với section tái sử dụng, responsive và template hiện đại.',
                    ja: '再利用可能なセクション、レスポンシブレイアウト、最新テンプレートでプロフェッショナルなWebサイトを構築できます。',
                },
            },
        },

        {
            id: 'saas',
            icon: 'bi-cloud-check-fill',
            variant: 'solutions01Purple',
            title: {
                sourceLocale: 'en',
                default: 'SaaS Platforms',
                translations: {
                    vi: 'Nền tảng SaaS',
                    ja: 'SaaSプラットフォーム',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Create scalable SaaS products with modern architecture, dashboards, authentication and cloud deployment.',
                translations: {
                    vi: 'Xây dựng sản phẩm SaaS có khả năng mở rộng với kiến trúc hiện đại, dashboard, xác thực và cloud deployment.',
                    ja: '最新アーキテクチャ、ダッシュボード、認証、クラウド展開に対応した拡張性の高いSaaSを構築します。',
                },
            },
        },

        {
            id: 'ecommerce',
            icon: 'bi-cart-check-fill',
            variant: 'solutions01Pink',
            title: {
                sourceLocale: 'en',
                default: 'E-commerce',
                translations: {
                    vi: 'Thương mại điện tử',
                    ja: 'Eコマース',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Launch modern online stores with flexible content, responsive shopping experiences and conversion-focused layouts.',
                translations: {
                    vi: 'Xây dựng cửa hàng trực tuyến hiện đại với nội dung linh hoạt, responsive và bố cục tối ưu chuyển đổi.',
                    ja: '柔軟なコンテンツ、レスポンシブな購買体験、コンバージョン重視のレイアウトでオンラインストアを構築します。',
                },
            },
        },

        {
            id: 'development',
            icon: 'bi-code-slash',
            variant: 'solutions01Green',
            title: {
                sourceLocale: 'en',
                default: 'Custom Development',
                translations: {
                    vi: 'Phát triển theo yêu cầu',
                    ja: 'カスタム開発',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Build reliable digital products with modern frontend, backend, API and database architecture.',
                translations: {
                    vi: 'Xây dựng sản phẩm số ổn định với kiến trúc frontend, backend, API và database hiện đại.',
                    ja: 'モダンなフロントエンド、バックエンド、API、データベース構成で信頼性の高い製品を開発します。',
                },
            },
        },
    ],
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

function getCategoryMeta(
    category: ProjectFeatureCategory,
    categoryLabels: Record<ProjectFeatureCategory, CategoryMeta>,
    locale: SupportedLocale,
    t: (value: LocalizedText) => string,
) {
    const item = categoryLabels[category] ?? categoryLabels.OTHER;

    return {
        icon: item.icon,
        label: t(item.label),
    };
}

function getSampleProjectFeatures(
    locale: SupportedLocale,
    categoryLabels: Record<ProjectFeatureCategory, CategoryMeta>,
    t: (value: LocalizedText) => string,
): FeatureItem[] {
    const samples = [
        {
            id: 'sample-website-builder',
            category: 'WEBSITE_BUILDER' as const,
            icon: 'bi-window-stack',
            title: {
                sourceLocale: 'en',
                default: 'KBuilder Website Builder',
                translations: {
                    vi: 'KBuilder Website Builder',
                    ja: 'KBuilder Webサイトビルダー',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Build professional websites visually with reusable sections, responsive layouts and AI-assisted content.',
                translations: {
                    vi: 'Xây dựng website chuyên nghiệp bằng giao diện trực quan với section tái sử dụng, responsive và AI hỗ trợ nội dung.',
                    ja: '再利用可能なセクション、レスポンシブレイアウト、AI支援コンテンツでWebサイトを構築できます。',
                },
            },
            developer: {
                sourceLocale: 'en',
                default: 'KBuilder Team',
                translations: {
                    vi: 'Đội ngũ KBuilder',
                    ja: 'KBuilderチーム',
                },
            },
        },

        {
            id: 'sample-saas',
            category: 'SAAS' as const,
            icon: 'bi-cloud-check',
            title: {
                sourceLocale: 'en',
                default: 'Business SaaS Platform',
                translations: {
                    vi: 'Nền tảng SaaS doanh nghiệp',
                    ja: '業務向けSaaSプラットフォーム',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'A scalable SaaS foundation with dashboards, authentication and cloud deployment.',
                translations: {
                    vi: 'Nền tảng SaaS có khả năng mở rộng với dashboard, xác thực và triển khai cloud.',
                    ja: 'ダッシュボード、認証、クラウド展開に対応した拡張性の高いSaaS基盤です。',
                },
            },
            developer: {
                sourceLocale: 'en',
                default: 'Product Engineering',
                translations: {
                    vi: 'Product Engineering',
                    ja: 'プロダクトエンジニアリング',
                },
            },
        },
    ];

    return samples.map((item) => ({
        id: item.id,
        isSample: true,
        category: item.category,
        subtitle: getCategoryMeta(item.category, categoryLabels, locale, t).label,
        icon: item.icon,
        title: t(item.title),
        description: t(item.description),
        image: '/assets/images/hero-project-browser.png',
        developer: t(item.developer),
    }));
}

function mapProjectFeature(
    item: ProjectFeatureApiItem,
    categoryLabels: Record<ProjectFeatureCategory, CategoryMeta>,
    t: (value: LocalizedText) => string,
) {
    const category = getCategoryMeta(item.category, categoryLabels, 'en', t);

    const primaryImage =
        item.images.find((image) => image.isPrimary)?.image ?? item.images[0]?.image ?? null;

    return {
        id: item.id,
        category: item.category,
        subtitle: category.label,
        icon: category.icon,
        title: item.title || item.slug,
        description: extractRichText(item.description),
        image: primaryImage,
        developer: item.developer,
    };
}

function FeatureCard({ feature, learnMoreLabel, onOpenFeature }: FeatureCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.imageWrap}>
                <div className={styles.imageGlow} />
                <div className={styles.imageGrid} />

                {feature.image ? (
                    <img
                        src={feature.image}
                        alt={feature.title}
                        className={styles.image}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.image} aria-hidden="true">
                        <i className={`bi ${feature.icon}`} />
                    </div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <div className={styles.titleIcon}>
                        <i className={`bi ${feature.icon}`} />
                    </div>

                    <div className={styles.headerTop}>
                        <h3>{feature.title}</h3>
                        <h4 className={styles.subtitle}>{feature.subtitle}</h4>
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.metaRow}>
                        <div className={styles.metaContent}>
                            <p>{feature.description}</p>
                        </div>
                    </div>

                    <div className={styles.footerActions}>
                        <span className={styles.status}>
                            <span className={styles.statusDot} />
                            {feature.developer || 'KBuilder'}
                        </span>

                        <button
                            type="button"
                            className={styles.learnMore}
                            onClick={() => onOpenFeature(feature)}
                        >
                            {learnMoreLabel}
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function FeatureSectionHeader({
    eyebrow,
    accent,
    highlight,
    t,
}: {
    eyebrow: LocalizedText;
    accent: LocalizedText;
    highlight: LocalizedText;
    t: (value: LocalizedText) => string;
}) {
    return (
        <div className={styles.header}>
            <div className={styles.headerGlow} />
            <div className={styles.headerGrid} />

            <div className={styles.headerLeft}>
                <div className={styles.iconBoxTitle}>
                    <i className="bi bi-rocket-takeoff-fill" />
                </div>

                <div className={styles.textContent}>
                    <div className={styles.eyebrowLabel}>
                        <span>{t(eyebrow)}</span>
                        <i className="bi bi-dash-lg" />
                    </div>

                    <h2 className={styles.eyebrow}>{t(accent)}</h2>
                </div>
            </div>

            <div className={styles.headerRight}>
                <button type="button" className={styles.ctaButton}>
                    <i className="bi bi-stars" />
                    <span>{t(highlight)}</span>
                    <i className="bi bi-arrow-right" />
                </button>
            </div>
        </div>
    );
}

export function ProjectPage01(props: ProjectPage01Props) {
    const mergedProps = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        siteId,
        heroBadgeTop,
        heroBadgeLeft,
        heroTitle,
        heroTitleAccent,
        heroDescription,
        heroButtonLabel,
        heroDemoLabel,
        heroFeature1,
        heroFeature2,
        heroFeature3,
        trust1Title,
        trust1Description,
        trust2Title,
        trust2Description,
        trust3Title,
        trust3Description,
        trust4Title,
        trust4Description,
        savingLabel,
        visualNote,
        eyebrow,
        title,
        highlight,
        description,
        learnMoreLabel,
        ctaEyebrow,
        ctaTitle,
        ctaDescription,
        ctaLabel,
        eyebrowText1,
        eyebrowAccentText1,
        highlightText1,
        eyebrowText2,
        eyebrowAccentText2,
        highlightText2,
        loadingProjectsLabel,
        noProjectsLabel,
        carouselGoToLabel,
        categoryLabels,
        solutions,
    } = mergedProps;

    const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(() => {
        if (typeof window === 'undefined') {
            return 'en';
        }

        const value = localStorage.getItem('locale');

        return value === 'vi' || value === 'ja' ? value : 'en';
    });

    const t = useCallback(
        (value: LocalizedText) => getLocalizedValue(value, selectedLocale),
        [selectedLocale],
    );

    const [features, setFeatures] = useState<FeatureItem[]>([]);
    const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
    const [loadingFeatures, setLoadingFeatures] = useState(false);

    const autoplay = useMemo(
        () =>
            Autoplay({
                delay: 4200,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        [],
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            align: 'start',
            loop: true,
            containScroll: 'trimSnaps',
            duration: 26,
        },
        [autoplay],
    );

    const [selectedSlide, setSelectedSlide] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            const nextLocale = customEvent.detail;

            if (nextLocale === 'en' || nextLocale === 'vi' || nextLocale === 'ja') {
                setSelectedLocale(nextLocale);
            }
        };

        window.addEventListener('locale-change', handleLocaleChange);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange);
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadProjectFeatures() {
            if (!siteId) {
                setFeatures(getSampleProjectFeatures(selectedLocale, categoryLabels, t));
                setLoadingFeatures(false);
                return;
            }

            setLoadingFeatures(true);

            try {
                const params = new URLSearchParams({
                    siteId,
                    locale: selectedLocale,
                    limit: '50',
                });

                const response = await fetch(`/api/v1/project-feature?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Project Feature API failed: ${response.status}`);
                }

                const data: ProjectFeatureApiResponse = await response.json();

                if (!data.success || !Array.isArray(data.projectFeatures)) {
                    throw new Error(data.message || 'Invalid Project Feature API response.');
                }

                const apiFeatures = data.projectFeatures.map((item) =>
                    mapProjectFeature(item, categoryLabels, t),
                );

                setFeatures(
                    apiFeatures.length > 0
                        ? apiFeatures
                        : getSampleProjectFeatures(selectedLocale, categoryLabels, t),
                );
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                console.error('[PROJECT_PAGE_01]', error);

                setFeatures(getSampleProjectFeatures(selectedLocale, categoryLabels, t));
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingFeatures(false);
                }
            }
        }

        void loadProjectFeatures();

        return () => controller.abort();
    }, [siteId, selectedLocale, categoryLabels, t]);

    const onCarouselSelect = useCallback(() => {
        if (!emblaApi) {
            return;
        }

        setSelectedSlide(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        setScrollSnaps(emblaApi.scrollSnapList());
        onCarouselSelect();

        emblaApi.on('select', onCarouselSelect);
        emblaApi.on('reInit', onCarouselSelect);

        return () => {
            emblaApi.off('select', onCarouselSelect);
            emblaApi.off('reInit', onCarouselSelect);
        };
    }, [emblaApi, onCarouselSelect]);

    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            emblaApi.reInit();
            setScrollSnaps(emblaApi.scrollSnapList());
            onCarouselSelect();
        });

        return () => window.cancelAnimationFrame(frame);
    }, [emblaApi, features, selectedLocale, onCarouselSelect]);

    const carouselFeatures = useMemo(() => features.slice(0, 8), [features]);

    const developmentFeatures = useMemo(
        () =>
            features.filter((feature) =>
                ['MOBILE_APP', 'AI', 'DEVELOPMENT', 'OTHER'].includes(feature.category),
            ),
        [features],
    );

    return (
        <>
            <div className={styles.main}>
                <section className={styles.section}>
                    <div className={styles.backgroundGlow} />
                    <div className={styles.backgroundGlowSecondary} />
                    <div className={styles.backgroundGrid} />

                    <div className={styles.container}>
                        <div className={styles.heroGrid}>
                            <div className={styles.heroContent}>
                                <div className={styles.badge}>
                                    <span className={styles.badgeIcon}>
                                        <i className="bi bi-code-square" />
                                    </span>
                                    <span>{t(heroBadgeLeft)}</span>
                                </div>

                                <h1 className={styles.title}>
                                    {t(heroTitle)}
                                    <span className={styles.titleAccent}>
                                        {t(heroTitleAccent)}
                                        <span className={styles.titleSparkle}>
                                            <i className="bi bi-stars" />
                                        </span>
                                    </span>
                                </h1>

                                <p className={styles.description}>{t(heroDescription)}</p>

                                <div className={styles.actions}>
                                    <button type="button" className={styles.primaryButton}>
                                        <span className={styles.primaryIcon}>
                                            <i className="bi bi-rocket-takeoff-fill" />
                                        </span>

                                        <span>{t(heroButtonLabel)}</span>

                                        <i className="bi bi-arrow-right" />
                                    </button>

                                    <button type="button" className={styles.secondaryButton}>
                                        <span className={styles.playIcon}>
                                            <i className="bi bi-play-fill" />
                                        </span>

                                        {t(heroDemoLabel)}
                                    </button>
                                </div>

                                <div className={styles.featureRow}>
                                    <div className={styles.featurePill}>
                                        <span className={`${styles.featureIcon} ${styles.purple}`}>
                                            <i className="bi bi-arrows-move" />
                                        </span>

                                        <span>{t(heroFeature1)}</span>
                                    </div>

                                    <div className={styles.featurePill}>
                                        <span className={`${styles.featureIcon} ${styles.blue}`}>
                                            <i className="bi bi-grid-3x3-gap-fill" />
                                        </span>

                                        <span>{t(heroFeature2)}</span>
                                    </div>

                                    <div className={styles.featurePill}>
                                        <span className={`${styles.featureIcon} ${styles.cyan}`}>
                                            <i className="bi bi-cloud-check-fill" />
                                        </span>

                                        <span>{t(heroFeature3)}</span>
                                    </div>
                                </div>

                                <div className={styles.trustPanel}>
                                    <div className={styles.trustItem}>
                                        <span
                                            className={`${styles.trustIcon} ${styles.trustPurple}`}
                                        >
                                            <i className="bi bi-credit-card-2-front" />
                                        </span>

                                        <div>
                                            <strong>{t(trust1Title)}</strong>
                                            <span>{t(trust1Description)}</span>
                                        </div>
                                    </div>

                                    <div className={styles.trustItem}>
                                        <span className={`${styles.trustIcon} ${styles.trustCyan}`}>
                                            <i className="bi bi-shield-check" />
                                        </span>

                                        <div>
                                            <strong>{t(trust2Title)}</strong>
                                            <span>{t(trust2Description)}</span>
                                        </div>
                                    </div>

                                    <div className={styles.trustItem}>
                                        <span
                                            className={`${styles.trustIcon} ${styles.trustYellow}`}
                                        >
                                            <i className="bi bi-lightning-charge-fill" />
                                        </span>

                                        <div>
                                            <strong>{t(trust3Title)}</strong>
                                            <span>{t(trust3Description)}</span>
                                        </div>
                                    </div>

                                    <div className={styles.trustItem}>
                                        <span className={`${styles.trustIcon} ${styles.trustBlue}`}>
                                            <i className="bi bi-lock-fill" />
                                        </span>

                                        <div>
                                            <strong>{t(trust4Title)}</strong>
                                            <span>{t(trust4Description)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.heroVisual}>
                                <div className={styles.visualGlow} />
                                <div className={styles.visualGlowPink} />

                                <span className={`${styles.visualSphere} ${styles.sphereOne}`} />
                                <span className={`${styles.visualSphere} ${styles.sphereTwo}`} />
                                <span className={`${styles.visualSphere} ${styles.sphereThree}`} />

                                <div className={styles.visualOrbit}>
                                    <span />
                                </div>

                                <div className={styles.aiCard}>
                                    <div className={styles.aiCardIcon}>
                                        <i className="bi bi-stars" />
                                    </div>

                                    <div className={styles.aiCardContent}>
                                        <strong>{t(heroBadgeTop)}</strong>
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>

                                <div className={styles.cloudCard}>
                                    <i className="bi bi-cloud-fill" />
                                </div>

                                <div className={styles.browserWrapper}>
                                    <div className={styles.browserShadow} />

                                    <div className={styles.browserFrame}>
                                        <div className={styles.browserHeader}>
                                            <div className={styles.browserDots}>
                                                <span />
                                                <span />
                                                <span />
                                            </div>

                                            <div className={styles.browserBrand}>
                                                <span className={styles.brandLogo}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </span>

                                                <strong>KBuilder</strong>
                                            </div>

                                            <div className={styles.browserHeaderAction}>
                                                <span />
                                            </div>
                                        </div>

                                        <div className={styles.browserContent}>
                                            <Image
                                                src="/assets/images/hero-project-browser.png"
                                                alt="KBuilder visual website builder"
                                                width={620}
                                                height={720}
                                                priority
                                                className={styles.browserImage}
                                            />

                                            <div className={styles.browserOverlay}>
                                                <div className={styles.overlaySidebar}>
                                                    <span className={styles.active}>
                                                        <i className="bi bi-house-fill" />
                                                    </span>

                                                    <span>
                                                        <i className="bi bi-person" />
                                                    </span>

                                                    <span>
                                                        <i className="bi bi-box" />
                                                    </span>

                                                    <span>
                                                        <i className="bi bi-stars" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.aiTile}>
                                    <i className="bi bi-stars" />
                                    <strong>AI</strong>
                                </div>

                                <div className={styles.savingCard}>
                                    <span>{t(savingLabel)}</span>
                                    <strong>20%</strong>
                                    <i className="bi bi-arrow-up-right" />

                                    <div className={styles.chart}>
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>

                                <div className={styles.lightningCard}>
                                    <i className="bi bi-lightning-charge-fill" />
                                </div>

                                <div className={styles.visualNote}>
                                    <span>{t(visualNote)}</span>
                                    <i className="bi bi-arrow-down-left" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.solutions}>
                    <FeatureSectionHeader
                        eyebrow={eyebrowText1}
                        accent={eyebrowAccentText1}
                        highlight={highlightText1}
                        t={t}
                    />

                    {loadingFeatures && carouselFeatures.length === 0 ? (
                        <p className={carouselStyles.carouselMessage} aria-live="polite">
                            {t(loadingProjectsLabel)}
                        </p>
                    ) : carouselFeatures.length === 0 ? (
                        <p className={carouselStyles.carouselMessage}>{t(noProjectsLabel)}</p>
                    ) : (
                        <>
                            <div className={carouselStyles.carouselViewport} ref={emblaRef}>
                                <div className={carouselStyles.carouselContainer}>
                                    {carouselFeatures.map((feature) => (
                                        <div
                                            className={carouselStyles.carouselSlide}
                                            key={feature.id}
                                        >
                                            <FeatureCard
                                                feature={feature}
                                                learnMoreLabel={t(learnMoreLabel)}
                                                onOpenFeature={setSelectedFeature}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {scrollSnaps.length > 1 && (
                                <div
                                    className={carouselStyles.carouselFooter}
                                    aria-label={t(carouselGoToLabel)}
                                >
                                    <div className={carouselStyles.carouselDots}>
                                        {scrollSnaps.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`${carouselStyles.carouselDot} ${
                                                    index === selectedSlide
                                                        ? carouselStyles.carouselDotActive
                                                        : ''
                                                }`}
                                                aria-label={`${t(carouselGoToLabel)} ${index + 1}`}
                                                aria-current={
                                                    index === selectedSlide ? 'true' : undefined
                                                }
                                                onClick={() => emblaApi?.scrollTo(index)}
                                            />
                                        ))}
                                    </div>

                                    <span className={carouselStyles.carouselCount}>
                                        {String(selectedSlide + 1).padStart(2, '0')}

                                        <span>/</span>

                                        {String(scrollSnaps.length).padStart(2, '0')}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </section>

                <section className={styles.solutions}>
                    <FeatureSectionHeader
                        eyebrow={eyebrowText2}
                        accent={eyebrowAccentText2}
                        highlight={highlightText2}
                        t={t}
                    />

                    <div className={styles.grid}>
                        {!loadingFeatures && developmentFeatures.length === 0 && (
                            <p>{t(noProjectsLabel)}</p>
                        )}

                        {developmentFeatures.map((feature) => (
                            <FeatureCard
                                key={feature.id}
                                feature={feature}
                                learnMoreLabel={t(learnMoreLabel)}
                                onOpenFeature={setSelectedFeature}
                            />
                        ))}
                    </div>
                </section>

                <section className={styles.solutions01Section}>
                    <div className={styles.solutions01Glow} />

                    <div className={styles.solutions01Container}>
                        <div className={styles.solutions01Header}>
                            <div className={styles.solutions01HeaderMain}>
                                <div className={styles.solutions01TitleIcon}>
                                    <i className="bi bi-rocket-takeoff-fill" />
                                </div>

                                <div className={styles.solutions01Heading}>
                                    <div className={styles.solutions01Eyebrow}>
                                        <span>{t(eyebrow)}</span>
                                        <span className={styles.solutions01EyebrowLine} />
                                    </div>

                                    <h2 className={styles.solutions01Title}>
                                        {t(title)}
                                        <span>{t(highlight)}</span>
                                    </h2>

                                    <p className={styles.solutions01Description}>
                                        {t(description)}
                                    </p>
                                </div>
                            </div>

                            <button type="button" className={styles.solutions01LearnMore}>
                                <i className="bi bi-book" />
                                <span>{t(learnMoreLabel)}</span>
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>

                        <div className={styles.solutions01Content}>
                            <div className={styles.solutions01Grid}>
                                {solutions.map((solution) => (
                                    <article
                                        key={solution.id}
                                        className={`${styles.solutions01Card} ${styles[solution.variant]}`}
                                    >
                                        <div className={styles.solutions01CardTop}>
                                            <div className={styles.solutions01CardIcon}>
                                                <i className={`bi ${solution.icon}`} />
                                            </div>

                                            <div className={styles.solutions01CardContent}>
                                                <h3>{t(solution.title)}</h3>

                                                <p>{t(solution.description)}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.solutions01CardArrow}
                                            aria-label={`${t(solution.title)}`}
                                        >
                                            <i className="bi bi-arrow-right" />
                                        </button>
                                    </article>
                                ))}
                            </div>

                            <aside className={styles.solutions01Feature}>
                                <div className={styles.solutions01FeatureContent}>
                                    <div className={styles.solutions01FeatureEyebrow}>
                                        <i className="bi bi-stars" />
                                        <span>{t(ctaEyebrow)}</span>
                                    </div>

                                    <h3>{t(ctaTitle)}</h3>

                                    <p>{t(ctaDescription)}</p>

                                    <button
                                        type="button"
                                        className={styles.solutions01FeatureButton}
                                    >
                                        <span>{t(ctaLabel)}</span>
                                        <i className="bi bi-arrow-right" />
                                    </button>
                                </div>

                                <div className={styles.solutions01FeatureVisual} aria-hidden="true">
                                    <div className={styles.solutions01AiGlow} />

                                    <div className={styles.solutions01AiOrbit}>
                                        <span className={styles.solutions01OrbitDot} />
                                    </div>

                                    <div className={styles.solutions01AiRobot}>
                                        <div className={styles.solutions01RobotHead}>
                                            <span className={styles.solutions01RobotEye} />
                                            <span className={styles.solutions01RobotEye} />
                                        </div>

                                        <div className={styles.solutions01RobotBody}>
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.solutions01FloatingPanel} ${styles.solutions01PanelTop}`}
                                    >
                                        <i className="bi bi-bar-chart-fill" />
                                    </div>

                                    <div
                                        className={`${styles.solutions01FloatingPanel} ${styles.solutions01PanelMiddle}`}
                                    >
                                        <i className="bi bi-chat-dots-fill" />
                                    </div>

                                    <div
                                        className={`${styles.solutions01FloatingPanel} ${styles.solutions01PanelBottom}`}
                                    >
                                        <i className="bi bi-stars" />
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>
            </div>

            <ProjectModal01
                featureId={selectedFeature?.id ?? null}
                locale={selectedLocale}
                fallbackFeature={selectedFeature}
                onClose={() => setSelectedFeature(null)}
            />
        </>
    );
}

function createTextField(key: keyof ProjectPage01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextareaField(key: keyof ProjectPage01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createHeroInspector(): InspectorField[] {
    return [
        createTextField('heroBadgeTop', 'Hero Badge Top'),
        createTextField('heroBadgeLeft', 'Hero Badge Left'),
        createTextareaField('heroTitle', 'Hero Title'),
        createTextareaField('heroTitleAccent', 'Hero Title Accent'),
        createTextareaField('heroDescription', 'Hero Description'),
        createTextField('heroButtonLabel', 'Hero Button'),
        createTextField('heroDemoLabel', 'Hero Demo'),
        createTextField('heroFeature1', 'Hero Feature 1'),
        createTextField('heroFeature2', 'Hero Feature 2'),
        createTextField('heroFeature3', 'Hero Feature 3'),
    ];
}

function createTrustInspector(): InspectorField[] {
    return [
        createTextField('trust1Title', 'Trust 1 Title'),
        createTextField('trust1Description', 'Trust 1 Description'),
        createTextField('trust2Title', 'Trust 2 Title'),
        createTextField('trust2Description', 'Trust 2 Description'),
        createTextField('trust3Title', 'Trust 3 Title'),
        createTextField('trust3Description', 'Trust 3 Description'),
        createTextField('trust4Title', 'Trust 4 Title'),
        createTextField('trust4Description', 'Trust 4 Description'),
        createTextField('savingLabel', 'Saving Label'),
        createTextField('visualNote', 'Visual Note'),
    ];
}

function createSectionInspector(): InspectorField[] {
    return [
        createTextField('eyebrow', 'Solutions Eyebrow'),
        createTextField('title', 'Solutions Title'),
        createTextField('highlight', 'Solutions Highlight'),
        createTextareaField('description', 'Solutions Description'),
        createTextField('learnMoreLabel', 'Learn More'),
        createTextField('ctaEyebrow', 'CTA Eyebrow'),
        createTextareaField('ctaTitle', 'CTA Title'),
        createTextareaField('ctaDescription', 'CTA Description'),
        createTextField('ctaLabel', 'CTA Button'),
        createTextField('eyebrowText1', 'Project Header 1'),
        createTextField('eyebrowAccentText1', 'Project Header 1 Accent'),
        createTextField('highlightText1', 'Project Header 1 CTA'),
        createTextField('eyebrowText2', 'Project Header 2'),
        createTextField('eyebrowAccentText2', 'Project Header 2 Accent'),
        createTextField('highlightText2', 'Project Header 2 CTA'),
        createTextField('loadingProjectsLabel', 'Loading Projects'),
        createTextField('noProjectsLabel', 'No Projects'),
        createTextField('carouselGoToLabel', 'Carousel Go To'),
    ];
}

function createInspector(): InspectorField[] {
    return [...createHeroInspector(), ...createTrustInspector(), ...createSectionInspector()];
}

export const PROJECT_PAGE_01: RegItem = {
    kind: 'project-page-01',
    label: 'Project Page 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <ProjectPage01 {...(props as unknown as ProjectPage01Props)} />,
};

export default ProjectPage01;
