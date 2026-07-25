'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';

import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';

import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/project/styles/project-01.module.css';
type StatTone = 'blue' | 'purple' | 'green' | 'orange';
import Image from 'next/image';

type FeatureItem = {
    subtitle: LocalizedText;
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
    image: string;
};

type FeatureCardProps = {
    feature: FeatureItem;
    t: (value: LocalizedText) => string;
};

type FeatureSectionHeaderProps = {
    eyebrow: LocalizedText;
    accent: LocalizedText;
    highlight: LocalizedText;
    t: (value: LocalizedText) => string;
};

type StatItem = {
    value: LocalizedText;
    label: LocalizedText;
    icon: string;
    tone: StatTone;
};

export interface ProjectPage01Props {
    breadcrumbHome?: LocalizedText;
    breadcrumbCurrent?: LocalizedText;

    heroBadgeTop?: LocalizedText;
    heroBadgeLeft?: LocalizedText;
    heroBadgeBottom?: LocalizedText;
    heroBadgeSsl?: LocalizedText;

    heroTitle?: LocalizedText;
    heroDescription?: LocalizedText;
    heroButtonLabel?: LocalizedText;

    sectionBadge?: LocalizedText;
    sectionTitle?: LocalizedText;
    sectionTitleAccent?: LocalizedText;
    sectionDescription?: LocalizedText;

    stat1Value?: LocalizedText;
    stat1Label?: LocalizedText;

    stat2Value?: LocalizedText;
    stat2Label?: LocalizedText;

    stat3Value?: LocalizedText;
    stat3Label?: LocalizedText;

    stat4Value?: LocalizedText;
    stat4Label?: LocalizedText;

    eyebrowText1?: LocalizedText;
    eyebrowAccentText1?: LocalizedText;
    highlightText1?: LocalizedText;

    eyebrowText2?: LocalizedText;
    eyebrowAccentText2?: LocalizedText;
    highlightText2?: LocalizedText;

    subTitle1?: LocalizedText;
    icon1?: string;
    title1?: LocalizedText;
    description1?: LocalizedText;
    image1?: string;

    subTitle2?: LocalizedText;
    icon2?: string;
    title2?: LocalizedText;
    description2?: LocalizedText;
    image2?: string;

    subTitle3?: LocalizedText;
    icon3?: string;
    title3?: LocalizedText;
    description3?: LocalizedText;
    image3?: string;

    subTitle4?: LocalizedText;
    icon4?: string;
    title4?: LocalizedText;
    description4?: LocalizedText;
    image4?: string;

    subTitle5?: LocalizedText;
    icon5?: string;
    title5?: LocalizedText;
    description5?: LocalizedText;
    image5?: string;

    subTitle6?: LocalizedText;
    icon6?: string;
    title6?: LocalizedText;
    description6?: LocalizedText;
    image6?: string;

    subTitle7?: LocalizedText;
    icon7?: string;
    title7?: LocalizedText;
    description7?: LocalizedText;
    image7?: string;

    subTitle8?: LocalizedText;
    icon8?: string;
    title8?: LocalizedText;
    description8?: LocalizedText;
    image8?: string;

    subTitle9?: LocalizedText;
    icon9?: string;
    title9?: LocalizedText;
    description9?: LocalizedText;
    image9?: string;

    subTitle10?: LocalizedText;
    icon10?: string;
    title10?: LocalizedText;
    description10?: LocalizedText;
    image10?: string;

    subTitle11?: LocalizedText;
    icon11?: string;
    title11?: LocalizedText;
    description11?: LocalizedText;
    image11?: string;
}

function createFeature(
    subtitle: LocalizedText,
    icon: string,
    title: LocalizedText,
    description: LocalizedText,
    image: string,
): FeatureItem {
    return {
        subtitle,
        icon,
        title,
        description,
        image,
    };
}

export const DEFAULT_PROPS: Required<ProjectPage01Props> = {
    breadcrumbHome: {
        sourceLocale: 'en',
        default: 'Home',
        translations: {
            vi: 'Trang chủ',
            ja: 'ホーム',
        },
    },

    breadcrumbCurrent: {
        sourceLocale: 'en',
        default: 'Project',
        translations: {
            vi: 'Dự án',
            ja: 'プロジェクト',
        },
    },

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
        default: 'No-Code Builder',
        translations: {
            vi: 'Trình tạo không cần lập trình',
            ja: 'ノーコードビルダー',
        },
    },

    heroBadgeBottom: {
        sourceLocale: 'en',
        default: '500+ Templates',
        translations: {
            vi: '500+ mẫu giao diện',
            ja: '500以上のテンプレート',
        },
    },

    heroBadgeSsl: {
        sourceLocale: 'en',
        default: 'Free SSL',
        translations: {
            vi: 'SSL miễn phí',
            ja: '無料SSL',
        },
    },

    heroTitle: {
        sourceLocale: 'en',
        default: 'Build Smarter With',
        translations: {
            vi: 'Xây dựng thông minh cùng',
            ja: 'よりスマートに構築',
        },
    },

    heroDescription: {
        sourceLocale: 'en',
        default:
            'Launch websites faster using visual editing, responsive templates, cloud hosting and AI-assisted content generation.',
        translations: {
            vi: 'Tạo và xuất bản website nhanh hơn với trình chỉnh sửa trực quan, giao diện responsive, cloud hosting và AI hỗ trợ tạo nội dung.',
            ja: 'ビジュアル編集、レスポンシブテンプレート、クラウドホスティング、AI支援コンテンツ生成で素早くWebサイトを公開します。',
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

    sectionDescription: {
        sourceLocale: 'en',
        default:
            'Kbuilder provides a complete platform for building, managing and publishing professional websites through visual editing, reusable components and intelligent automation.',
        translations: {
            vi: 'Kbuilder cung cấp nền tảng hoàn chỉnh để xây dựng, quản lý và xuất bản website chuyên nghiệp bằng trình chỉnh sửa trực quan, component tái sử dụng và tự động hóa thông minh.',
            ja: 'Kbuilderはビジュアル編集、再利用可能なコンポーネント、インテリジェントな自動化を備えたWebサイト構築・管理・公開プラットフォームです。',
        },
    },

    stat1Value: {
        sourceLocale: 'en',
        default: '50+',
        translations: {
            vi: '50+',
            ja: '50+',
        },
    },

    stat1Label: {
        sourceLocale: 'en',
        default: 'Websites Created',
        translations: {
            vi: 'Website đã tạo',
            ja: '制作済みサイト',
        },
    },

    stat2Value: {
        sourceLocale: 'en',
        default: '500+',
        translations: {
            vi: '500+',
            ja: '500+',
        },
    },

    stat2Label: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: {
            vi: 'Mẫu giao diện',
            ja: 'テンプレート',
        },
    },

    stat3Value: {
        sourceLocale: 'en',
        default: '100%',
        translations: {
            vi: '100%',
            ja: '100%',
        },
    },

    stat3Label: {
        sourceLocale: 'en',
        default: 'No-Code Experience',
        translations: {
            vi: 'Không cần lập trình',
            ja: 'ノーコード体験',
        },
    },

    stat4Value: {
        sourceLocale: 'en',
        default: 'AI',
        translations: {
            vi: 'AI',
            ja: 'AI',
        },
    },

    stat4Label: {
        sourceLocale: 'en',
        default: 'Powered Builder',
        translations: {
            vi: 'Nền tảng AI',
            ja: 'AI搭載ビルダー',
        },
    },

    eyebrowText1: {
        sourceLocale: 'en',
        default: 'Create Professional Websites and Business Applications Without Code',
        translations: {
            vi: 'Tạo website và ứng dụng doanh nghiệp chuyên nghiệp không cần lập trình',
            ja: 'コード不要でプロフェッショナルなWebサイトと業務アプリを構築',
        },
    },

    eyebrowAccentText1: {
        sourceLocale: 'en',
        default: 'Business Applications Without Code',
        translations: {
            vi: 'Ứng dụng doanh nghiệp không cần lập trình',
            ja: 'コード不要の業務アプリ',
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
        default: 'Research & Development with',
        translations: {
            vi: 'Nghiên cứu và phát triển với',
            ja: '研究開発',
        },
    },

    eyebrowAccentText2: {
        sourceLocale: 'en',
        default: 'Machine Learning',
        translations: {
            vi: 'Machine Learning',
            ja: '機械学習',
        },
    },

    highlightText2: {
        sourceLocale: 'en',
        default: 'Automation Ready',
        translations: {
            vi: 'Sẵn sàng tự động hóa',
            ja: '自動化対応',
        },
    },
    subTitle1: {
        sourceLocale: 'en',
        default: 'Website Builder',
        translations: {
            vi: 'Trình tạo Website',
            ja: 'Webサイトビルダー',
        },
    },

    icon1: 'bi-window-stack',

    title1: {
        sourceLocale: 'en',
        default: 'No-Code Website Builder',
        translations: {
            vi: 'Trình tạo Website không cần lập trình',
            ja: 'ノーコードWebサイトビルダー',
        },
    },

    description1: {
        sourceLocale: 'en',
        default:
            'Empower your team to build, manage, and scale professional websites through a fully visual editing experience. With drag-and-drop page creation, dynamic menu management, reusable content blocks, and flexible design controls, anyone can create beautiful responsive websites without technical expertise.',
        translations: {
            vi: 'Cho phép đội ngũ của bạn xây dựng, quản lý và mở rộng website chuyên nghiệp bằng trình chỉnh sửa trực quan. Kéo thả trang, quản lý menu, tái sử dụng component và tùy chỉnh giao diện dễ dàng mà không cần lập trình.',
            ja: 'ビジュアルエディター、ドラッグ＆ドロップ編集、動的メニュー、再利用可能なコンテンツブロックにより、誰でも簡単にプロフェッショナルなWebサイトを構築できます。',
        },
    },

    image1: '/assets/images/feature-add.png',

    subTitle2: {
        sourceLocale: 'en',
        default: 'Automation',
        translations: {
            vi: 'Tự động hóa',
            ja: '自動化',
        },
    },

    icon2: 'bi-lightning-charge',

    title2: {
        sourceLocale: 'en',
        default: 'Website Automation',
        translations: {
            vi: 'Tự động hóa Website',
            ja: 'Webサイト自動化',
        },
    },

    description2: {
        sourceLocale: 'en',
        default:
            'Launch a fully configured website in as little as 10 minutes. Automatically generate pages, apply branding, configure site settings, and streamline publishing workflows. Schedule and automate content distribution across Facebook and TikTok to keep your audience engaged without manual work.',
        translations: {
            vi: 'Triển khai website hoàn chỉnh chỉ trong vài phút. Tự động tạo trang, áp dụng thương hiệu, cấu hình website và tự động hóa quy trình xuất bản cũng như phân phối nội dung.',
            ja: '数分で完全なWebサイトを構築し、ページ生成・ブランド適用・設定・公開・SNS配信まで自動化します。',
        },
    },

    image2: '/assets/images/automation-add.png',

    subTitle3: {
        sourceLocale: 'en',
        default: 'Navigation',
        translations: {
            vi: 'Điều hướng',
            ja: 'ナビゲーション',
        },
    },

    icon3: 'bi-grid-3x3-gap',

    title3: {
        sourceLocale: 'en',
        default: 'Drag & Drop Menus',
        translations: {
            vi: 'Menu kéo thả',
            ja: 'ドラッグ＆ドロップメニュー',
        },
    },

    description3: {
        sourceLocale: 'en',
        default:
            'Build professional navigation systems with visual drag-and-drop controls. Create multi-level dropdowns, mega menus, mobile navigation, and custom links while organizing pages effortlessly. Update menu structures instantly and deliver a seamless browsing experience across all devices without writing code.',
        translations: {
            vi: 'Xây dựng hệ thống menu chuyên nghiệp bằng kéo thả trực quan. Hỗ trợ menu đa cấp, mega menu, menu mobile và liên kết tùy chỉnh mà không cần lập trình.',
            ja: 'ドラッグ＆ドロップ操作でメガメニュー、階層メニュー、モバイルメニューを簡単に構築できます。',
        },
    },

    image3: '/assets/images/drag-add.png',

    subTitle4: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: {
            vi: 'Mẫu giao diện',
            ja: 'テンプレート',
        },
    },

    icon4: 'bi-layout-text-window',

    title4: {
        sourceLocale: 'en',
        default: 'Premium Templates',
        translations: {
            vi: 'Kho giao diện cao cấp',
            ja: 'プレミアムテンプレート',
        },
    },

    description4: {
        sourceLocale: 'en',
        default:
            'Access a growing collection of 300+ premium website templates designed for every industry and use case. From SaaS platforms and landing pages to eCommerce and booking websites, each template is fully editable, mobile-friendly, and optimized for performance, SEO, and conversion.',
        translations: {
            vi: 'Truy cập thư viện hơn 300 giao diện chuyên nghiệp cho Landing Page, SaaS, Booking, eCommerce và nhiều lĩnh vực khác. Mỗi giao diện đều responsive, tối ưu SEO và dễ dàng tùy chỉnh.',
            ja: '300種類以上の高品質テンプレートを利用でき、すべてレスポンシブ・SEO最適化・編集可能です。',
        },
    },

    image4: '/assets/images/template-add.png',

    subTitle5: {
        sourceLocale: 'en',
        default: 'Smart Setup',
        translations: {
            vi: 'Thiết lập thông minh',
            ja: 'スマートセットアップ',
        },
    },

    icon5: 'bi-magic',

    title5: {
        sourceLocale: 'en',
        default: 'Automatic Setup',
        translations: {
            vi: 'Thiết lập tự động',
            ja: '自動セットアップ',
        },
    },

    description5: {
        sourceLocale: 'en',
        default:
            'Automatically configure your website, generate pages, prepare navigation, connect domains, and apply essential settings within minutes. Reduce manual work and launch projects much faster.',
        translations: {
            vi: 'Tự động cấu hình website, tạo trang, chuẩn bị menu, kết nối tên miền và áp dụng các thiết lập cần thiết chỉ trong vài phút.',
            ja: 'Webサイト設定、ページ生成、ナビゲーション作成、ドメイン接続を自動化します。',
        },
    },

    image5: '/assets/images/setup-add.png',

    subTitle6: {
        sourceLocale: 'en',
        default: 'Security',
        translations: {
            vi: 'Bảo mật',
            ja: 'セキュリティ',
        },
    },

    icon6: 'bi-shield-check',

    title6: {
        sourceLocale: 'en',
        default: 'Custom SSL & Domains',
        translations: {
            vi: 'SSL & Tên miền',
            ja: 'SSL・独自ドメイン',
        },
    },

    description6: {
        sourceLocale: 'en',
        default:
            'Publish websites under your own branded domain with automated DNS configuration and free SSL certificates. Secure every website with HTTPS, improve SEO performance, and manage domains directly from the platform.',
        translations: {
            vi: 'Xuất bản website với tên miền riêng, cấu hình DNS tự động và SSL miễn phí. Bảo mật HTTPS, cải thiện SEO và quản lý tên miền trực tiếp trên nền tảng.',
            ja: '独自ドメイン・無料SSL・HTTPS・DNS自動設定をサポートし、安全なWebサイトを公開できます。',
        },
    },

    image6: '/assets/images/ssl-add.png',

    subTitle7: {
        sourceLocale: 'en',
        default: 'Web Builder',
        translations: {
            vi: 'Trình tạo Website',
            ja: 'Webビルダー',
        },
    },

    icon7: 'bi-bounding-box',

    title7: {
        sourceLocale: 'en',
        default: 'Visual Canvas Builder',
        translations: {
            vi: 'Canvas Builder trực quan',
            ja: 'ビジュアルキャンバスビルダー',
        },
    },

    description7: {
        sourceLocale: 'en',
        default:
            'Researching and developing a next-generation visual website builder powered by a canvas-based editing experience. Users can design pages, arrange components, manage layouts, and customize content through a drag-and-drop interface built with Next.js.',
        translations: {
            vi: 'Nghiên cứu và phát triển trình tạo website thế hệ mới dựa trên Canvas. Người dùng có thể kéo thả component, thiết kế layout và chỉnh sửa nội dung trực tiếp bằng giao diện trực quan.',
            ja: 'キャンバスベースの次世代Webサイトビルダーを開発し、ドラッグ＆ドロップでページやコンポーネントを自由に編集できます。',
        },
    },

    image7: '/assets/images/canvas-add.png',

    subTitle8: {
        sourceLocale: 'en',
        default: 'Mobile Apps',
        translations: {
            vi: 'Ứng dụng di động',
            ja: 'モバイルアプリ',
        },
    },

    icon8: 'bi-phone',

    title8: {
        sourceLocale: 'en',
        default: 'React Native Applications',
        translations: {
            vi: 'Ứng dụng React Native',
            ja: 'React Nativeアプリケーション',
        },
    },

    description8: {
        sourceLocale: 'en',
        default:
            'Building cross-platform mobile applications with React Native for task management, business operations, customer engagement, and productivity workflows while maintaining a consistent experience across iOS and Android devices.',
        translations: {
            vi: 'Phát triển ứng dụng đa nền tảng bằng React Native phục vụ quản lý công việc, doanh nghiệp và khách hàng với trải nghiệm đồng nhất trên iOS và Android.',
            ja: 'React Nativeを利用してiOS・Android向けクロスプラットフォームアプリケーションを開発します。',
        },
    },

    image8: '/assets/images/research-react-native.png',

    subTitle9: {
        sourceLocale: 'en',
        default: 'Immersive Tech',
        translations: {
            vi: 'Công nghệ nhập vai',
            ja: '没入型テクノロジー',
        },
    },

    icon9: 'bi-badge-vr',

    title9: {
        sourceLocale: 'en',
        default: 'Virtual Reality Experiences',
        translations: {
            vi: 'Trải nghiệm thực tế ảo',
            ja: 'VR体験',
        },
    },

    description9: {
        sourceLocale: 'en',
        default:
            'Exploring virtual reality technologies to create immersive digital experiences, interactive environments, product showcases, training simulations, and next-generation user interactions across multiple industries.',
        translations: {
            vi: 'Nghiên cứu công nghệ thực tế ảo nhằm xây dựng trải nghiệm số, môi trường tương tác, mô phỏng đào tạo và trình diễn sản phẩm.',
            ja: 'VR技術を活用し、没入型体験、製品展示、教育シミュレーションなどを実現します。',
        },
    },

    image9: '/assets/images/research-vr.png',

    subTitle10: {
        sourceLocale: 'en',
        default: 'Artificial Intelligence',
        translations: {
            vi: 'Trí tuệ nhân tạo',
            ja: '人工知能',
        },
    },

    icon10: 'bi-cpu',

    title10: {
        sourceLocale: 'en',
        default: 'Machine Learning & AI',
        translations: {
            vi: 'Machine Learning & AI',
            ja: '機械学習・AI',
        },
    },

    description10: {
        sourceLocale: 'en',
        default:
            'Researching machine learning and artificial intelligence technologies to automate workflows, analyze business data, intelligent recommendations, and enhance digital products with smart decision-making capabilities.',
        translations: {
            vi: 'Nghiên cứu Machine Learning và AI nhằm tự động hóa quy trình, phân tích dữ liệu doanh nghiệp và nâng cao khả năng ra quyết định thông minh.',
            ja: '機械学習とAIを活用し、業務自動化・データ分析・インテリジェントな意思決定を実現します。',
        },
    },

    image10: '/assets/images/research-ai.png',

    subTitle11: {
        sourceLocale: 'en',
        default: 'SEO & Marketing',
        translations: {
            vi: 'SEO & Marketing',
            ja: 'SEO・マーケティング',
        },
    },

    icon11: 'bi-graph-up-arrow',

    title11: {
        sourceLocale: 'en',
        default: 'SEO Landing Pages',
        translations: {
            vi: 'Landing Page chuẩn SEO',
            ja: 'SEOランディングページ',
        },
    },

    description11: {
        sourceLocale: 'en',
        default:
            'Developing SEO-optimized landing page systems focused on performance, search visibility, content structure, and conversion optimization to help businesses attract more organic traffic and generate qualified leads.',
        translations: {
            vi: 'Phát triển hệ thống Landing Page chuẩn SEO với hiệu năng cao, cấu trúc nội dung tối ưu và tỷ lệ chuyển đổi tốt nhằm thu hút nhiều khách hàng tiềm năng.',
            ja: 'SEOに最適化されたランディングページを開発し、検索順位・パフォーマンス・コンバージョン率を向上させます。',
        },
    },

    image11: '/assets/images/research-seo.png',
};

function FeatureCard({ feature, t }: FeatureCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.imageWrap}>
                <div className={styles.imageGlow} />
                <div className={styles.imageGrid} />

                <img src={feature.image} alt={t(feature.title)} className={styles.image} />
            </div>

            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <div className={styles.titleIcon}>
                        <i className={`bi ${feature.icon}`} />
                    </div>

                    <div className={styles.headerTop}>
                        <h3>{t(feature.title)}</h3>
                        <h4 className={styles.subtitle}>{t(feature.subtitle)}</h4>
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.metaRow}>
                        <div className={styles.metaContent}>
                            <p>{t(feature.description)}</p>
                        </div>
                    </div>

                    <div className={styles.footerActions}>
                        <span className={styles.status}>
                            <span className={styles.statusDot} />
                            Included
                        </span>

                        <button type="button" className={styles.learnMore}>
                            Learn More
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
function FeatureSectionHeader({ eyebrow, accent, highlight, t }: FeatureSectionHeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.iconBoxTitle}>
                    <i className="bi bi-rocket-takeoff-fill" />
                </div>

                <div className={styles.textContent}>
                    <h2 className={styles.eyebrow}>{t(eyebrow)}</h2>

                    <p className={styles.accent}>{t(accent)}</p>
                </div>
            </div>

            <button type="button" className={styles.ctaButton}>
                <i className="bi bi-lightning-charge-fill" />
                <span>{t(highlight)}</span>
            </button>
        </div>
    );
}

function createFeatureInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `subTitle${index}`,
            label: `Feature ${index} Subtitle`,
            kind: 'text',
        },
        {
            key: `icon${index}`,
            label: `Feature ${index} Icon`,
            kind: 'text',
        },
        {
            key: `title${index}`,
            label: `Feature ${index} Title`,
            kind: 'text',
        },
        {
            key: `description${index}`,
            label: `Feature ${index} Description`,
            kind: 'textarea',
        },
        {
            key: `image${index}`,
            label: `Feature ${index} Image`,
            kind: 'image',
            folder: 'services/project',
            accept: 'image/*',
        },
    ];
}

export function ProjectPage01(props: ProjectPage01Props) {
    const mergedProps = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        breadcrumbHome,
        breadcrumbCurrent,

        heroBadgeTop,
        heroBadgeLeft,
        heroBadgeBottom,
        heroBadgeSsl,

        heroTitle,
        heroDescription,
        heroButtonLabel,

        sectionBadge,
        sectionTitle,
        sectionTitleAccent,
        sectionDescription,

        stat1Value,
        stat1Label,

        stat2Value,
        stat2Label,

        stat3Value,
        stat3Label,

        stat4Value,
        stat4Label,

        eyebrowText1,
        eyebrowAccentText1,
        highlightText1,

        eyebrowText2,
        eyebrowAccentText2,
        highlightText2,

        subTitle1,
        icon1,
        title1,
        description1,
        image1,

        subTitle2,
        icon2,
        title2,
        description2,
        image2,

        subTitle3,
        icon3,
        title3,
        description3,
        image3,

        subTitle4,
        icon4,
        title4,
        description4,
        image4,

        subTitle5,
        icon5,
        title5,
        description5,
        image5,

        subTitle6,
        icon6,
        title6,
        description6,
        image6,

        subTitle7,
        icon7,
        title7,
        description7,
        image7,

        subTitle8,
        icon8,
        title8,
        description8,
        image8,

        subTitle9,
        icon9,
        title9,
        description9,
        image9,

        subTitle10,
        icon10,
        title10,
        description10,
        image10,

        subTitle11,
        icon11,
        title11,
        description11,
        image11,
    } = mergedProps;

    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') {
            return 'en';
        }

        return localStorage.getItem('locale') ?? 'en';
    });

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setSelectedLocale(customEvent.detail);
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    const t = useCallback(
        (value: LocalizedText) => getLocalizedValue(value, selectedLocale),
        [selectedLocale],
    );

    const stats = useMemo<StatItem[]>(
        () => [
            {
                value: stat1Value,
                label: stat1Label,
                icon: 'bi-bar-chart-fill',
                tone: 'blue',
            },
            {
                value: stat2Value,
                label: stat2Label,
                icon: 'bi-layers-fill',
                tone: 'purple',
            },
            {
                value: stat3Value,
                label: stat3Label,
                icon: 'bi-shield-check',
                tone: 'green',
            },
            {
                value: stat4Value,
                label: stat4Label,
                icon: 'bi-stars',
                tone: 'orange',
            },
        ],
        [
            stat1Value,
            stat1Label,
            stat2Value,
            stat2Label,
            stat3Value,
            stat3Label,
            stat4Value,
            stat4Label,
        ],
    );

    const FEATURES_WEBSITE: FeatureItem[] = [
        createFeature(subTitle1, icon1, title1, description1, image1),
        createFeature(subTitle2, icon2, title2, description2, image2),
        createFeature(subTitle3, icon3, title3, description3, image3),
        createFeature(subTitle4, icon4, title4, description4, image4),
        createFeature(subTitle5, icon5, title5, description5, image5),
        createFeature(subTitle6, icon6, title6, description6, image6),
    ];

    const FEATURES_DEVELOPMENT: FeatureItem[] = [
        createFeature(subTitle7, icon7, title7, description7, image7),
        createFeature(subTitle8, icon8, title8, description8, image8),
        createFeature(subTitle9, icon9, title9, description9, image9),
        createFeature(subTitle10, icon10, title10, description10, image10),
        createFeature(subTitle11, icon11, title11, description11, image11),
    ];

    return (
        <>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.headingSection}>
                        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                            <Link href="/" className={styles.breadcrumbItem}>
                                {t(breadcrumbHome)}
                            </Link>

                            <i className="bi bi-chevron-right" />

                            <span className={styles.breadcrumbCurrent}>{t(breadcrumbCurrent)}</span>
                        </nav>
                    </div>
                    <div className={styles.heroGrid}>
                        {/* ================= LEFT ================= */}

                        <div className={styles.heroVisual}>
                            <div className={styles.visualGlow} />

                            <div className={styles.visualNoise} />

                            <div className={styles.visualBadgeLeft}>
                                <i className="bi bi-code-slash" />
                                {t(heroBadgeLeft)}
                            </div>

                            <div className={styles.visualBadgeRight}>
                                <i className="bi bi-stars" />
                                {t(heroBadgeTop)}
                            </div>

                            <div className={styles.visualContent}>
                                <div className={styles.visualText}>
                                    <h1>
                                        {t(heroTitle)
                                            .split('\n')
                                            .map((line, index, arr) => (
                                                <span key={index}>
                                                    {line}
                                                    {index < arr.length - 1 && <br />}
                                                </span>
                                            ))}

                                        <span className={styles.visualTextAi}>AI</span>
                                    </h1>

                                    <p>{t(heroDescription)}</p>

                                    <div className={styles.visualActions}>
                                        <button type="button" className={styles.primaryButton}>
                                            <i className="bi bi-rocket-takeoff-fill" />
                                            {t(heroButtonLabel)}
                                        </button>

                                        <button type="button" className={styles.secondaryButton}>
                                            <i className="bi bi-play-circle" />
                                            Live Demo
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.browserWrapper}>
                                    <Image
                                        src="/assets/images/hero-browser.png"
                                        alt="Browser Preview"
                                        width={620}
                                        height={720}
                                        priority
                                        className={styles.browserImage}
                                    />
                                </div>
                            </div>

                            <div className={styles.visualOrbit}>
                                <span />
                            </div>

                            <div className={styles.visualStars}>
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className={styles.trustPanel}>
                                <div className={styles.trustItem}>
                                    <i className="bi bi-credit-card-2-front" />

                                    <div>
                                        <strong>No Credit Card</strong>
                                        <span>Required</span>
                                    </div>
                                </div>

                                <div className={styles.trustItem}>
                                    <i className="bi bi-shield-check" />

                                    <div>
                                        <strong>Secure Hosting</strong>
                                        <span>Always safe</span>
                                    </div>
                                </div>

                                <div className={styles.trustItem}>
                                    <i className="bi bi-lightning-charge" />

                                    <div>
                                        <strong>Instant Setup</strong>
                                        <span>Get started</span>
                                    </div>
                                </div>

                                <div className={styles.trustItem}>
                                    <i className="bi bi-lock" />

                                    <div>
                                        <strong>Free SSL</strong>
                                        <span>Included</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ================= RIGHT ================= */}

                        <div className={styles.heroInfo}>
                            <span className={styles.infoBadge}>{t(sectionBadge)}</span>

                            <h2 className={styles.infoTitle}>
                                {t(sectionTitle)}

                                <span>{t(sectionTitleAccent)}</span>
                            </h2>

                            <p className={styles.infoDescription}>{t(sectionDescription)}</p>

                            <div className={styles.infoButtons}>
                                <button className={styles.primaryButton}>
                                    <i className="bi bi-rocket-takeoff-fill" />
                                    {t(heroButtonLabel)}
                                </button>

                                <button className={styles.secondaryButton}>
                                    <i className="bi bi-play-circle" />
                                    Live Demo
                                </button>
                            </div>

                            <div className={styles.statsGrid}>
                                {stats.map((item, index) => (
                                    <article key={index} className={styles.statCard}>
                                        <div className={`${styles.iconBox} ${styles[item.tone]}`}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <div className={styles.statContent}>
                                            <strong>{t(item.value)}</strong>

                                            <span>{t(item.label)}</span>
                                        </div>

                                        <i className={`bi bi-arrow-up-right ${styles.cardArrow}`} />
                                    </article>
                                ))}
                            </div>

                            <div className={styles.featureRow}>
                                <div className={styles.featurePill}>
                                    <i className="bi bi-stars" />
                                    AI Assisted Content
                                </div>

                                <div className={styles.featurePill}>
                                    <i className="bi bi-grid-3x3-gap-fill" />
                                    500+ Templates
                                </div>

                                <div className={styles.featurePill}>
                                    <i className="bi bi-cloud-check-fill" />
                                    Cloud Deployment
                                </div>
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

                <div className={styles.grid}>
                    {FEATURES_WEBSITE.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} t={t} />
                    ))}
                </div>
            </section>

            <section className={styles.solutions}>
                <FeatureSectionHeader
                    eyebrow={eyebrowText2}
                    accent={eyebrowAccentText2}
                    highlight={highlightText2}
                    t={t}
                />

                <div className={styles.grid}>
                    {FEATURES_DEVELOPMENT.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} t={t} />
                    ))}
                </div>
            </section>
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

function createImageField(key: keyof ProjectPage01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'image',
        folder: 'project',
        accept: 'image/*',
    };
}

function createIconField(key: keyof ProjectPage01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'text',
    };
}

function createHeroInspector(): InspectorField[] {
    return [
        createTextField('breadcrumbHome', 'Breadcrumb Home'),
        createTextField('breadcrumbCurrent', 'Breadcrumb Current'),

        createTextField('heroBadgeTop', 'Hero Badge Top'),
        createTextField('heroBadgeLeft', 'Hero Badge Left'),
        createTextField('heroBadgeBottom', 'Hero Badge Bottom'),
        createTextField('heroBadgeSsl', 'Hero Badge SSL'),

        createTextareaField('heroTitle', 'Hero Title'),
        createTextareaField('heroDescription', 'Hero Description'),
        createTextField('heroButtonLabel', 'Hero Button'),
    ];
}

function createSectionInspector(): InspectorField[] {
    return [
        createTextField('sectionBadge', 'Section Badge'),
        createTextareaField('sectionTitle', 'Section Title'),
        createTextField('sectionTitleAccent', 'Section Title Accent'),
        createTextareaField('sectionDescription', 'Section Description'),

        createTextField('eyebrowText1', 'Header 1'),
        createTextField('eyebrowAccentText1', 'Header 1 Accent'),
        createTextField('highlightText1', 'Header 1 Highlight'),

        createTextField('eyebrowText2', 'Header 2'),
        createTextField('eyebrowAccentText2', 'Header 2 Accent'),
        createTextField('highlightText2', 'Header 2 Highlight'),
    ];
}

function createStatsInspector(): InspectorField[] {
    return [
        createTextField('stat1Value', 'Stat 1 Value'),
        createTextField('stat1Label', 'Stat 1 Label'),

        createTextField('stat2Value', 'Stat 2 Value'),
        createTextField('stat2Label', 'Stat 2 Label'),

        createTextField('stat3Value', 'Stat 3 Value'),
        createTextField('stat3Label', 'Stat 3 Label'),

        createTextField('stat4Value', 'Stat 4 Value'),
        createTextField('stat4Label', 'Stat 4 Label'),
    ];
}

function createInspector(): InspectorField[] {
    return [
        ...createHeroInspector(),
        ...createSectionInspector(),
        ...createStatsInspector(),

        ...Array.from({ length: 11 }, (_, i) => createFeatureInspector(i + 1)).flat(),
    ];
}
export const PROJECT_PAGE_01: RegItem = {
    kind: 'project-page-01',
    label: 'Project Page 01',
    defaults: DEFAULT_PROPS,

    inspector: createInspector(),
    render: (props) => <ProjectPage01 {...(props as unknown as ProjectPage01Props)} />,
};
export default ProjectPage01;
