'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { getLocalizedValue, type LocalizedText } from '@/lib/ui-builder/localization';

import styles from '@/components/admin/shared/templates/services/about/styles/about-01.module.css';

type ValueColor = 'purple' | 'blue' | 'orange' | 'pink';
type TeamColor = ValueColor | 'green';

type FeatureItem = {
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
};

type StatItem = {
    value: LocalizedText;
    label: LocalizedText;
    icon: string;
};

type JourneyItem = {
    icon: string;
    date: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    active?: boolean;
};

type StoryItem = {
    year: LocalizedText;
    badge: LocalizedText;
    title: LocalizedText;
    titleAccent: LocalizedText;
    description: LocalizedText;
    image: string;
    imageAlt: LocalizedText;
    reverse?: boolean;
};

type CoreValue = {
    id: LocalizedText;
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
    tags: LocalizedText[];
    color: ValueColor;
};

type TeamMember = {
    name: LocalizedText;
    role: LocalizedText;
    description: LocalizedText;
    image: string;
    color: TeamColor;
    icon: string;
};

export interface About01Props {
    breadcrumbHome?: LocalizedText;
    breadcrumbCurrent?: LocalizedText;
    badge?: LocalizedText;
    heroTitle?: LocalizedText;
    heroTitleAccent?: LocalizedText;
    heroDescription?: LocalizedText;
    primaryButtonLabel?: LocalizedText;
    secondaryButtonLabel?: LocalizedText;
    image?: string;
    performanceScore?: LocalizedText;
    performanceLabel?: LocalizedText;
    missionBadge?: LocalizedText;
    missionTitle?: LocalizedText;
    missionTitleAccent?: LocalizedText;
    missionDescription?: LocalizedText;
    missionCenterTitle?: LocalizedText;
    missionCenterDescription?: LocalizedText;
    missionNodes?: {
        icon: string;
        title: LocalizedText;
        description: LocalizedText;
    }[];
    stats?: StatItem[];
    features?: FeatureItem[];
    values?: FeatureItem[];
    journeyBadge?: LocalizedText;
    journeyTitle?: LocalizedText;
    journeyTitleAccent?: LocalizedText;
    journeyDescription?: LocalizedText;
    journeys?: JourneyItem[];
    stories?: StoryItem[];
    storyFeatures?: {
        icon: string;
        title: LocalizedText;
        badge: LocalizedText;
        description: LocalizedText;
    }[];
    whyBadge?: LocalizedText;
    whyTitle?: LocalizedText;
    whyTitleAccent?: LocalizedText;
    whyDescription?: LocalizedText;
    problems?: FeatureItem[];
    solutions?: FeatureItem[];
    builderPreviewImage?: string;
    coreValues?: CoreValue[];
    teamBadge?: LocalizedText;
    teamTitle?: LocalizedText;
    teamTitleAccent?: LocalizedText;
    teamDescription?: LocalizedText;
    team?: TeamMember[];
    ctaBadge?: LocalizedText;
    ctaTitle?: LocalizedText;
    ctaTitleAccent?: LocalizedText;
    ctaDescription?: LocalizedText;
    ctaPrimaryButtonLabel?: LocalizedText;
    ctaSecondaryButtonLabel?: LocalizedText;
    ctaImage?: string;
    pageTitle?: LocalizedText;
    pageDescription?: LocalizedText;
}

const DEFAULT_PROPS: About01Props = {
    /* ==========================================================================
       Breadcrumb
    ========================================================================== */

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
        default: 'About Us',
        translations: {
            vi: 'Giới thiệu',
            ja: '私たちについて',
        },
    },

    whyBadge: {
        sourceLocale: 'en',
        default: 'Why Kbuilder',
        translations: {
            vi: 'Tại sao chọn Kbuilder',
            ja: 'Kbuilderを選ぶ理由',
        },
    },

    /* ==========================================================================
       Hero
    ========================================================================== */

    badge: {
        sourceLocale: 'en',
        default: 'ABOUT KBUILDER',
        translations: {
            vi: 'VỀ KBUILDER',
            ja: 'KBUILDERについて',
        },
    },

    heroTitle: {
        sourceLocale: 'en',
        default: 'Building Better',
        translations: {
            vi: 'Kiến tạo',
            ja: 'より良い',
        },
    },

    heroTitleAccent: {
        sourceLocale: 'en',
        default: 'Web Experiences',
        translations: {
            vi: 'Trải nghiệm Web',
            ja: 'Web体験',
        },
    },

    heroDescription: {
        sourceLocale: 'en',
        default:
            'Kbuilder is an all-in-one no-code website builder that helps creators, businesses, agencies, and development teams build professional websites with an intuitive drag-and-drop editor. Create responsive landing pages, business websites, eCommerce stores, portfolios, blogs, and custom web experiences using modern templates, reusable components, visual editing tools, AI-powered features, and one-click publishing without writing a single line of code.',
        translations: {
            vi: 'Kbuilder là nền tảng xây dựng website không cần lập trình (no-code) giúp cá nhân, doanh nghiệp, agency và đội ngũ phát triển tạo website chuyên nghiệp bằng trình chỉnh sửa kéo thả trực quan. Dễ dàng xây dựng landing page, website doanh nghiệp, cửa hàng thương mại điện tử, portfolio, blog và nhiều loại website khác với template hiện đại, component tái sử dụng, công cụ chỉnh sửa trực quan, tính năng AI và xuất bản chỉ với một cú nhấp mà không cần viết bất kỳ dòng mã nào.',
            ja: 'Kbuilderは、個人・企業・制作会社・開発チーム向けのオールインワンノーコードWebサイトビルダーです。直感的なドラッグ＆ドロップエディターを使用して、ランディングページ、企業サイト、ECサイト、ポートフォリオ、ブログなどを簡単に作成できます。モダンなテンプレート、再利用可能なコンポーネント、ビジュアル編集、AI機能、ワンクリック公開を備え、コードを書くことなくプロフェッショナルなWebサイトを構築できます。',
        },
    },

    primaryButtonLabel: {
        sourceLocale: 'en',
        default: 'Get Started',
        translations: {
            vi: 'Bắt đầu ngay',
            ja: '始める',
        },
    },

    secondaryButtonLabel: {
        sourceLocale: 'en',
        default: 'Explore Features',
        translations: {
            vi: 'Khám phá tính năng',
            ja: '機能を見る',
        },
    },

    image: '/assets/images/about/about-hero.png',

    performanceScore: {
        sourceLocale: 'en',
        default: '99%',
        translations: {
            vi: '99%',
            ja: '99%',
        },
    },

    performanceLabel: {
        sourceLocale: 'en',
        default: 'Customer Satisfaction',
        translations: {
            vi: 'Khách hàng hài lòng',
            ja: '顧客満足度',
        },
    },

    /* ==========================================================================
       Mission
    ========================================================================== */

    missionBadge: {
        sourceLocale: 'en',
        default: 'OUR MISSION',
        translations: {
            vi: 'SỨ MỆNH',
            ja: '私たちの使命',
        },
    },

    missionTitle: {
        sourceLocale: 'en',
        default: 'Empowering Everyone',
        translations: {
            vi: 'Trao quyền cho mọi người',
            ja: 'すべての人を支援する',
        },
    },

    missionTitleAccent: {
        sourceLocale: 'en',
        default: 'To Build Without Limits',
        translations: {
            vi: 'Xây dựng không giới hạn',
            ja: '制限なく構築する',
        },
    },

    missionDescription: {
        sourceLocale: 'en',
        default:
            'Our mission is to make website creation simple, accessible and enjoyable for everyone through automation, beautiful templates and intuitive visual editing.',
        translations: {
            vi: 'Sứ mệnh của chúng tôi là giúp việc xây dựng website trở nên đơn giản, dễ tiếp cận và thú vị thông qua tự động hóa, mẫu giao diện đẹp và trình chỉnh sửa trực quan.',
            ja: '私たちの使命は、自動化、美しいテンプレート、直感的なビジュアル編集を通じて、誰でも簡単にWebサイトを作成できるようにすることです。',
        },
    },

    missionCenterTitle: {
        sourceLocale: 'en',
        default: 'Our Mission',
        translations: {
            vi: 'Sứ mệnh của chúng tôi',
            ja: '私たちの使命',
        },
    },

    missionCenterDescription: {
        sourceLocale: 'en',
        default: 'Empower creators worldwide with modern website building tools.',
        translations: {
            vi: 'Trao quyền cho nhà sáng tạo trên toàn thế giới bằng công cụ xây dựng website hiện đại.',
            ja: '世界中のクリエイターに最新のWeb制作ツールを提供します。',
        },
    },

    /* ==========================================================================
       Mission Diagram
    ========================================================================== */

    missionNodes: [
        {
            icon: 'bi bi-lightbulb-fill',
            title: {
                sourceLocale: 'en',
                default: 'Innovation',
                translations: {
                    vi: 'Đổi mới',
                    ja: 'イノベーション',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Continuously improving the way websites are built.',
                translations: {
                    vi: 'Không ngừng cải tiến cách xây dựng website.',
                    ja: 'Web制作の未来を革新します。',
                },
            },
        },
        {
            icon: 'bi bi-globe2',
            title: {
                sourceLocale: 'en',
                default: 'Accessibility',
                translations: {
                    vi: 'Dễ tiếp cận',
                    ja: 'アクセシビリティ',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Making professional websites available to everyone.',
                translations: {
                    vi: 'Giúp mọi người đều có thể tạo website chuyên nghiệp.',
                    ja: '誰でもプロ品質のWebサイトを作成できます。',
                },
            },
        },
        {
            icon: 'bi bi-shield-check',
            title: {
                sourceLocale: 'en',
                default: 'Reliability',
                translations: {
                    vi: 'Tin cậy',
                    ja: '信頼性',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Fast, secure and stable website infrastructure.',
                translations: {
                    vi: 'Hạ tầng website nhanh, bảo mật và ổn định.',
                    ja: '高速・安全・安定したインフラ。',
                },
            },
        },
        {
            icon: 'bi bi-graph-up-arrow',
            title: {
                sourceLocale: 'en',
                default: 'Growth',
                translations: {
                    vi: 'Phát triển',
                    ja: '成長',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Helping businesses grow through digital experiences.',
                translations: {
                    vi: 'Giúp doanh nghiệp phát triển thông qua trải nghiệm số.',
                    ja: 'デジタル体験でビジネス成長を支援します。',
                },
            },
        },
    ],

    /* ==========================================================================
       Statistics
    ========================================================================== */

    stats: [
        {
            icon: 'bi bi-people-fill',
            value: {
                sourceLocale: 'en',
                default: '50K+',
                translations: {
                    vi: '50K+',
                    ja: '50K+',
                },
            },
            label: {
                sourceLocale: 'en',
                default: 'Active Users',
                translations: {
                    vi: 'Người dùng',
                    ja: 'ユーザー',
                },
            },
        },
        {
            icon: 'bi bi-window-stack',
            value: {
                sourceLocale: 'en',
                default: '120K+',
                translations: {
                    vi: '120K+',
                    ja: '120K+',
                },
            },
            label: {
                sourceLocale: 'en',
                default: 'Websites Created',
                translations: {
                    vi: 'Website đã tạo',
                    ja: '作成されたWebサイト',
                },
            },
        },
        {
            icon: 'bi bi-globe',
            value: {
                sourceLocale: 'en',
                default: '80+',
                translations: {
                    vi: '80+',
                    ja: '80+',
                },
            },
            label: {
                sourceLocale: 'en',
                default: 'Countries',
                translations: {
                    vi: 'Quốc gia',
                    ja: '国',
                },
            },
        },
        {
            icon: 'bi bi-award-fill',
            value: {
                sourceLocale: 'en',
                default: '99%',
                translations: {
                    vi: '99%',
                    ja: '99%',
                },
            },
            label: {
                sourceLocale: 'en',
                default: 'Satisfaction',
                translations: {
                    vi: 'Hài lòng',
                    ja: '満足度',
                },
            },
        },
    ],
    /* ==========================================================================
       Features
    ========================================================================== */

    features: [
        {
            icon: 'bi bi-magic',
            title: {
                sourceLocale: 'en',
                default: 'Visual Builder',
                translations: {
                    vi: 'Trình kéo thả',
                    ja: 'ビジュアル編集',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Build visually with drag & drop.',
                translations: {
                    vi: 'Thiết kế bằng kéo thả.',
                    ja: 'ドラッグ＆ドロップ編集。',
                },
            },
        },
        {
            icon: 'bi bi-grid-1x2-fill',
            title: {
                sourceLocale: 'en',
                default: 'Templates',
                translations: {
                    vi: 'Mẫu giao diện',
                    ja: 'テンプレート',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Responsive ready-made layouts.',
                translations: {
                    vi: 'Mẫu responsive sẵn có.',
                    ja: 'レスポンシブ対応。',
                },
            },
        },
        {
            icon: 'bi bi-lightning-charge-fill',
            title: {
                sourceLocale: 'en',
                default: 'Fast',
                translations: {
                    vi: 'Tốc độ cao',
                    ja: '高速',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Optimized for speed.',
                translations: {
                    vi: 'Tối ưu hiệu suất.',
                    ja: '高速表示を実現。',
                },
            },
        },
        {
            icon: 'bi bi-robot',
            title: {
                sourceLocale: 'en',
                default: 'AI',
                translations: {
                    vi: 'AI',
                    ja: 'AI',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Create with AI.',
                translations: {
                    vi: 'Tạo bằng AI.',
                    ja: 'AIで作成。',
                },
            },
        },
    ],

    /* ==========================================================================
       Values
    ========================================================================== */

    values: [
        {
            icon: 'bi bi-heart-fill',
            title: {
                sourceLocale: 'en',
                default: 'Customer First',
                translations: {
                    vi: 'Khách hàng là trung tâm',
                    ja: '顧客第一',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Every decision we make starts with delivering more value to our customers.',
                translations: {
                    vi: 'Mọi quyết định đều hướng đến việc mang lại nhiều giá trị hơn cho khách hàng.',
                    ja: 'すべての意思決定は顧客価値を中心に行います。',
                },
            },
        },
        {
            icon: 'bi bi-stars',
            title: {
                sourceLocale: 'en',
                default: 'Innovation',
                translations: {
                    vi: 'Đổi mới liên tục',
                    ja: '継続的な革新',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'We continuously improve our platform with modern technologies.',
                translations: {
                    vi: 'Không ngừng cải tiến nền tảng bằng những công nghệ hiện đại.',
                    ja: '最新技術でプラットフォームを進化させ続けます。',
                },
            },
        },
        {
            icon: 'bi bi-shield-lock-fill',
            title: {
                sourceLocale: 'en',
                default: 'Trust & Security',
                translations: {
                    vi: 'Bảo mật & Tin cậy',
                    ja: 'セキュリティと信頼',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Security, privacy and reliability are built into everything we create.',
                translations: {
                    vi: 'Bảo mật và độ tin cậy luôn là ưu tiên hàng đầu.',
                    ja: '安全性と信頼性を最優先にしています。',
                },
            },
        },
        {
            icon: 'bi bi-people-fill',
            title: {
                sourceLocale: 'en',
                default: 'Community',
                translations: {
                    vi: 'Cộng đồng',
                    ja: 'コミュニティ',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Growing together with creators, developers and businesses around the world.',
                translations: {
                    vi: 'Đồng hành cùng cộng đồng nhà sáng tạo và doanh nghiệp trên toàn thế giới.',
                    ja: '世界中のクリエイターと共に成長します。',
                },
            },
        },
    ],
    /* ==========================================================================
       Journey
    ========================================================================== */

    journeyBadge: {
        sourceLocale: 'en',
        default: 'OUR JOURNEY',
        translations: {
            vi: 'HÀNH TRÌNH',
            ja: '私たちの歩み',
        },
    },

    journeyTitle: {
        sourceLocale: 'en',
        default: 'Building Kbuilder',
        translations: {
            vi: 'Xây dựng Kbuilder',
            ja: 'Kbuilderの構築',
        },
    },

    journeyTitleAccent: {
        sourceLocale: 'en',
        default: 'Step By Step',
        translations: {
            vi: 'Từng Bước Một',
            ja: '一歩ずつ',
        },
    },

    journeyDescription: {
        sourceLocale: 'en',
        default:
            'Every milestone represents our commitment to making website creation easier and more accessible.',
        translations: {
            vi: 'Mỗi cột mốc đều thể hiện cam kết của chúng tôi trong việc giúp xây dựng website trở nên đơn giản hơn.',
            ja: 'すべてのマイルストーンは、Web制作をより簡単にするための取り組みです。',
        },
    },

    journeys: [
        {
            icon: 'bi bi-search',
            date: {
                sourceLocale: 'en',
                default: '2023',
                translations: {
                    vi: '2023',
                    ja: '2023',
                },
            },
            title: {
                sourceLocale: 'en',
                default: 'Research & Discovery',
                translations: {
                    vi: 'Nghiên cứu & Khám phá',
                    ja: '調査と発見',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'We analyzed hundreds of website builders to identify common challenges.',
                translations: {
                    vi: 'Phân tích hàng trăm nền tảng để tìm ra những khó khăn phổ biến.',
                    ja: '多くのWebビルダーを分析し課題を発見しました。',
                },
            },
            active: false,
        },
        {
            icon: 'bi bi-lightbulb',
            date: {
                sourceLocale: 'en',
                default: '2024',
                translations: {
                    vi: '2024',
                    ja: '2024',
                },
            },
            title: {
                sourceLocale: 'en',
                default: 'Product Strategy',
                translations: {
                    vi: 'Chiến lược sản phẩm',
                    ja: '製品戦略',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Designed a modern visual builder focused on speed and simplicity.',
                translations: {
                    vi: 'Thiết kế nền tảng kéo thả hiện đại tập trung vào tốc độ và sự đơn giản.',
                    ja: '高速でシンプルなビジュアルビルダーを設計しました。',
                },
            },
            active: true,
        },
        {
            icon: 'bi bi-code-slash',
            date: {
                sourceLocale: 'en',
                default: '2025',
                translations: {
                    vi: '2025',
                    ja: '2025',
                },
            },
            title: {
                sourceLocale: 'en',
                default: 'Platform Development',
                translations: {
                    vi: 'Phát triển nền tảng',
                    ja: 'プラットフォーム開発',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Implemented visual editing, reusable components and automation.',
                translations: {
                    vi: 'Hoàn thiện trình chỉnh sửa trực quan và hệ thống component.',
                    ja: 'ビジュアル編集とコンポーネントを実装。',
                },
            },
            active: false,
        },
        {
            icon: 'bi bi-rocket-takeoff',
            date: {
                sourceLocale: 'en',
                default: 'Today',
                translations: {
                    vi: 'Hiện tại',
                    ja: '現在',
                },
            },
            title: {
                sourceLocale: 'en',
                default: 'Growing Together',
                translations: {
                    vi: 'Cùng phát triển',
                    ja: '共に成長',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Helping creators and businesses build amazing digital experiences.',
                translations: {
                    vi: 'Đồng hành cùng doanh nghiệp và nhà sáng tạo trên toàn thế giới.',
                    ja: '世界中のクリエイターを支援しています。',
                },
            },
            active: false,
        },
    ],

    /* ==========================================================================
       Stories
    ========================================================================== */

    stories: [
        {
            year: {
                sourceLocale: 'en',
                default: '2023',
                translations: {
                    vi: '2023',
                    ja: '2023',
                },
            },
            badge: {
                sourceLocale: 'en',
                default: 'The Beginning',
                translations: {
                    vi: 'Khởi đầu',
                    ja: '始まり',
                },
            },
            title: {
                sourceLocale: 'en',
                default: 'A Vision',
                translations: {
                    vi: 'Một Tầm Nhìn',
                    ja: 'ビジョン',
                },
            },
            titleAccent: {
                sourceLocale: 'en',
                default: 'For Everyone',
                translations: {
                    vi: 'Cho Mọi Người',
                    ja: 'すべての人へ',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Kbuilder was born from the belief that everyone should be able to build beautiful websites without writing code.',
                translations: {
                    vi: 'Kbuilder được tạo ra với niềm tin rằng ai cũng có thể xây dựng website đẹp mà không cần lập trình.',
                    ja: '誰でもコードを書かずにWebサイトを作れる世界を目指しました。',
                },
            },
            image: '/assets/images/about/story-01.png',
            imageAlt: {
                sourceLocale: 'en',
                default: 'Kbuilder Story',
                translations: {
                    vi: 'Câu chuyện Kbuilder',
                    ja: 'Kbuilderストーリー',
                },
            },
            reverse: false,
        },
        {
            year: {
                sourceLocale: 'en',
                default: '2025',
                translations: {
                    vi: '2025',
                    ja: '2025',
                },
            },
            badge: {
                sourceLocale: 'en',
                default: 'The Future',
                translations: {
                    vi: 'Tương lai',
                    ja: '未来',
                },
            },
            title: {
                sourceLocale: 'en',
                default: 'Creating',
                translations: {
                    vi: 'Kiến tạo',
                    ja: '創造',
                },
            },
            titleAccent: {
                sourceLocale: 'en',
                default: 'The Next Generation',
                translations: {
                    vi: 'Thế hệ Website mới',
                    ja: '次世代Web',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Our mission continues with AI, automation and powerful visual experiences.',
                translations: {
                    vi: 'Tiếp tục phát triển với AI, tự động hóa và trải nghiệm trực quan.',
                    ja: 'AIと自動化で未来のWeb制作を実現します。',
                },
            },
            image: '/assets/images/about/story-02.png',
            imageAlt: {
                sourceLocale: 'en',
                default: 'Future Vision',
                translations: {
                    vi: 'Tầm nhìn tương lai',
                    ja: '未来ビジョン',
                },
            },
            reverse: true,
        },
    ],

    /* ==========================================================================
       Story Features
    ========================================================================== */

    storyFeatures: [
        {
            icon: 'bi bi-search',
            title: {
                sourceLocale: 'en',
                default: 'Research & Discovery',
                translations: {
                    vi: 'Nghiên cứu',
                    ja: '調査',
                },
            },
            badge: {
                sourceLocale: 'en',
                default: 'Completed',
                translations: {
                    vi: 'Hoàn thành',
                    ja: '完了',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Understanding the needs of creators and businesses.',
                translations: {
                    vi: 'Nghiên cứu nhu cầu của nhà sáng tạo và doanh nghiệp.',
                    ja: 'ユーザーの課題を調査。',
                },
            },
        },
        {
            icon: 'bi bi-diagram-3',
            title: {
                sourceLocale: 'en',
                default: 'Product Strategy',
                translations: {
                    vi: 'Chiến lược sản phẩm',
                    ja: '製品戦略',
                },
            },
            badge: {
                sourceLocale: 'en',
                default: 'Validated',
                translations: {
                    vi: 'Đã xác thực',
                    ja: '検証済み',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Building a scalable and flexible visual platform.',
                translations: {
                    vi: 'Xây dựng nền tảng trực quan linh hoạt.',
                    ja: '拡張可能な設計。',
                },
            },
        },
        {
            icon: 'bi bi-stars',
            title: {
                sourceLocale: 'en',
                default: 'Kbuilder Vision',
                translations: {
                    vi: 'Tầm nhìn Kbuilder',
                    ja: 'Kbuilderビジョン',
                },
            },
            badge: {
                sourceLocale: 'en',
                default: '2026',
                translations: {
                    vi: '2026',
                    ja: '2026',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Empowering millions to create professional websites.',
                translations: {
                    vi: 'Giúp hàng triệu người tạo website chuyên nghiệp.',
                    ja: '数百万人のWeb制作を支援。',
                },
            },
        },
    ],
    /* ==========================================================================
       Problems
    ========================================================================== */

    problems: [
        {
            icon: 'bi bi-x-circle-fill',
            title: {
                sourceLocale: 'en',
                default: 'Complex Website Builders',
                translations: {
                    vi: 'Trình tạo website quá phức tạp',
                    ja: '複雑なWebサイトビルダー',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Many platforms require technical knowledge before users can build a website.',
                translations: {
                    vi: 'Nhiều nền tảng yêu cầu kiến thức kỹ thuật trước khi có thể xây dựng website.',
                    ja: '多くのプラットフォームは専門知識を必要とします。',
                },
            },
        },
        {
            icon: 'bi bi-clock-history',
            title: {
                sourceLocale: 'en',
                default: 'Time-Consuming Setup',
                translations: {
                    vi: 'Thiết lập mất nhiều thời gian',
                    ja: 'セットアップに時間がかかる',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Creating pages, menus and layouts manually slows down every project.',
                translations: {
                    vi: 'Việc tạo trang, menu và bố cục thủ công làm chậm quá trình phát triển.',
                    ja: '手動設定は多くの時間を必要とします。',
                },
            },
        },
        {
            icon: 'bi bi-code-slash',
            title: {
                sourceLocale: 'en',
                default: 'Too Much Coding',
                translations: {
                    vi: 'Phải viết quá nhiều mã',
                    ja: 'コーディングが多すぎる',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Small businesses struggle because every customization requires developers.',
                translations: {
                    vi: 'Doanh nghiệp nhỏ gặp khó khăn vì mọi chỉnh sửa đều cần lập trình viên.',
                    ja: 'カスタマイズには開発者が必要です。',
                },
            },
        },
        {
            icon: 'bi bi-exclamation-triangle-fill',
            title: {
                sourceLocale: 'en',
                default: 'Poor User Experience',
                translations: {
                    vi: 'Trải nghiệm người dùng kém',
                    ja: 'ユーザー体験が悪い',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Outdated interfaces make website creation frustrating and inefficient.',
                translations: {
                    vi: 'Giao diện lỗi thời khiến việc xây dựng website trở nên khó khăn.',
                    ja: '古いUIは使いづらい体験を生みます。',
                },
            },
        },
    ],

    /* ==========================================================================
       Solutions
    ========================================================================== */

    solutions: [
        {
            icon: 'bi bi-magic',
            title: {
                sourceLocale: 'en',
                default: 'Visual Editing',
                translations: {
                    vi: 'Chỉnh sửa trực quan',
                    ja: 'ビジュアル編集',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Design pages visually with instant preview and drag-and-drop editing.',
                translations: {
                    vi: 'Thiết kế trực quan bằng kéo thả với khả năng xem trước tức thì.',
                    ja: 'ドラッグ＆ドロップで直感的に編集。',
                },
            },
        },
        {
            icon: 'bi bi-robot',
            title: {
                sourceLocale: 'en',
                default: 'AI Assistance',
                translations: {
                    vi: 'AI hỗ trợ',
                    ja: 'AIサポート',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Generate layouts, pages and content automatically using AI.',
                translations: {
                    vi: 'AI tự động tạo bố cục, trang và nội dung.',
                    ja: 'AIがページとコンテンツを自動生成します。',
                },
            },
        },
        {
            icon: 'bi bi-lightning-charge-fill',
            title: {
                sourceLocale: 'en',
                default: 'Automation',
                translations: {
                    vi: 'Tự động hóa',
                    ja: '自動化',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Automate repetitive tasks to launch websites significantly faster.',
                translations: {
                    vi: 'Tự động hóa quy trình giúp triển khai website nhanh hơn.',
                    ja: '繰り返し作業を自動化します。',
                },
            },
        },
        {
            icon: 'bi bi-shield-check',
            title: {
                sourceLocale: 'en',
                default: 'Reliable Platform',
                translations: {
                    vi: 'Nền tảng ổn định',
                    ja: '信頼できるプラットフォーム',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Built with security, scalability and performance as top priorities.',
                translations: {
                    vi: 'Được xây dựng với ưu tiên về bảo mật, khả năng mở rộng và hiệu suất.',
                    ja: '安全性と拡張性を重視しています。',
                },
            },
        },
    ],

    /* ==========================================================================
       Core Values
    ========================================================================== */

    coreValues: [
        {
            id: {
                sourceLocale: 'en',
                default: '01',
                translations: {
                    vi: '01',
                    ja: '01',
                },
            },
            icon: 'bi bi-lightbulb-fill',
            title: {
                sourceLocale: 'en',
                default: 'Innovation',
                translations: {
                    vi: 'Đổi mới',
                    ja: 'イノベーション',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Continuously pushing technology forward to simplify website creation.',
                translations: {
                    vi: 'Không ngừng đổi mới để việc xây dựng website trở nên đơn giản hơn.',
                    ja: 'Web制作をより簡単にする革新。',
                },
            },
            tags: [
                {
                    sourceLocale: 'en',
                    default: 'Creativity',
                    translations: {
                        vi: 'Sáng tạo',
                        ja: '創造性',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Technology',
                    translations: {
                        vi: 'Công nghệ',
                        ja: 'テクノロジー',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Future',
                    translations: {
                        vi: 'Tương lai',
                        ja: '未来',
                    },
                },
            ],
            color: 'purple',
        },
        {
            id: {
                sourceLocale: 'en',
                default: '02',
                translations: {
                    vi: '02',
                    ja: '02',
                },
            },
            icon: 'bi bi-heart-fill',
            title: {
                sourceLocale: 'en',
                default: 'Customer First',
                translations: {
                    vi: 'Khách hàng là trung tâm',
                    ja: '顧客第一',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Everything we build begins with solving real customer problems.',
                translations: {
                    vi: 'Mọi sản phẩm đều bắt đầu từ việc giải quyết vấn đề thực tế của khách hàng.',
                    ja: 'すべては顧客の課題解決から始まります。',
                },
            },
            tags: [
                {
                    sourceLocale: 'en',
                    default: 'Support',
                    translations: {
                        vi: 'Hỗ trợ',
                        ja: 'サポート',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Trust',
                    translations: {
                        vi: 'Tin cậy',
                        ja: '信頼',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Success',
                    translations: {
                        vi: 'Thành công',
                        ja: '成功',
                    },
                },
            ],
            color: 'blue',
        },
        {
            id: {
                sourceLocale: 'en',
                default: '03',
                translations: {
                    vi: '03',
                    ja: '03',
                },
            },
            icon: 'bi bi-award-fill',
            title: {
                sourceLocale: 'en',
                default: 'Quality Excellence',
                translations: {
                    vi: 'Chất lượng vượt trội',
                    ja: '品質へのこだわり',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'We are committed to delivering reliable, scalable and high-quality digital experiences.',
                translations: {
                    vi: 'Chúng tôi cam kết mang đến những sản phẩm chất lượng cao, ổn định và có khả năng mở rộng.',
                    ja: '高品質で信頼性が高く、拡張性のあるデジタル体験を提供します。',
                },
            },
            tags: [
                {
                    sourceLocale: 'en',
                    default: 'Quality',
                    translations: {
                        vi: 'Chất lượng',
                        ja: '品質',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Performance',
                    translations: {
                        vi: 'Hiệu năng',
                        ja: 'パフォーマンス',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Reliability',
                    translations: {
                        vi: 'Tin cậy',
                        ja: '信頼性',
                    },
                },
            ],
            color: 'orange',
        },
        {
            id: {
                sourceLocale: 'en',
                default: '04',
                translations: {
                    vi: '04',
                    ja: '04',
                },
            },
            icon: 'bi bi-people-fill',
            title: {
                sourceLocale: 'en',
                default: 'Collaboration',
                translations: {
                    vi: 'Hợp tác',
                    ja: 'コラボレーション',
                },
            },
            description: {
                sourceLocale: 'en',
                default:
                    'Great products are built through teamwork, transparency and shared success.',
                translations: {
                    vi: 'Những sản phẩm tuyệt vời được tạo nên từ sự hợp tác, minh bạch và cùng nhau phát triển.',
                    ja: '優れた製品はチームワークと透明性、そして共通の成功から生まれます。',
                },
            },
            tags: [
                {
                    sourceLocale: 'en',
                    default: 'Teamwork',
                    translations: {
                        vi: 'Làm việc nhóm',
                        ja: 'チームワーク',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Transparency',
                    translations: {
                        vi: 'Minh bạch',
                        ja: '透明性',
                    },
                },
                {
                    sourceLocale: 'en',
                    default: 'Growth',
                    translations: {
                        vi: 'Phát triển',
                        ja: '成長',
                    },
                },
            ],
            color: 'pink',
        },
    ],
    /* ==========================================================================
       Team
    ========================================================================== */

    teamBadge: {
        sourceLocale: 'en',
        default: 'OUR TEAM',
        translations: {
            vi: 'ĐỘI NGŨ',
            ja: 'チーム',
        },
    },

    teamTitle: {
        sourceLocale: 'en',
        default: 'Meet The People Behind',
        translations: {
            vi: 'Gặp gỡ đội ngũ phía sau',
            ja: '私たちのチーム',
        },
    },

    teamTitleAccent: {
        sourceLocale: 'en',
        default: 'Kbuilder',
        translations: {
            vi: 'Kbuilder',
            ja: 'Kbuilder',
        },
    },

    teamDescription: {
        sourceLocale: 'en',
        default:
            'A passionate team of designers, engineers and creators building the future of website creation.',
        translations: {
            vi: 'Đội ngũ kỹ sư, nhà thiết kế và nhà sáng tạo đang xây dựng tương lai của việc tạo website.',
            ja: 'Web制作の未来を築くデザイナーとエンジニアのチームです。',
        },
    },

    team: [
        {
            name: {
                sourceLocale: 'en',
                default: 'Alex Johnson',
                translations: {
                    vi: 'Alex Johnson',
                    ja: 'Alex Johnson',
                },
            },
            role: {
                sourceLocale: 'en',
                default: 'Founder & CEO',
                translations: {
                    vi: 'Nhà sáng lập & CEO',
                    ja: 'CEO',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Leading the vision and strategy behind Kbuilder.',
                translations: {
                    vi: 'Định hướng chiến lược và phát triển Kbuilder.',
                    ja: 'Kbuilderのビジョンを牽引します。',
                },
            },
            image: '/assets/images/avatar-1.png',
            color: 'purple',
            icon: 'bi bi-stars',
        },
        {
            name: {
                sourceLocale: 'en',
                default: 'Sophia Williams',
                translations: {
                    vi: 'Sophia Williams',
                    ja: 'Sophia Williams',
                },
            },
            role: {
                sourceLocale: 'en',
                default: 'UI/UX Designer',
                translations: {
                    vi: 'Thiết kế UI/UX',
                    ja: 'UI/UXデザイナー',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Creating intuitive and delightful user experiences.',
                translations: {
                    vi: 'Thiết kế trải nghiệm người dùng hiện đại và trực quan.',
                    ja: '直感的なUI/UXを設計。',
                },
            },
            image: '/assets/images/avatar-2.png',
            color: 'blue',
            icon: 'bi bi-palette-fill',
        },
        {
            name: {
                sourceLocale: 'en',
                default: 'Daniel Brown',
                translations: {
                    vi: 'Daniel Brown',
                    ja: 'Daniel Brown',
                },
            },
            role: {
                sourceLocale: 'en',
                default: 'Lead Engineer',
                translations: {
                    vi: 'Trưởng nhóm kỹ thuật',
                    ja: 'リードエンジニア',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Building scalable systems and platform architecture.',
                translations: {
                    vi: 'Xây dựng kiến trúc hệ thống mạnh mẽ và dễ mở rộng.',
                    ja: 'スケーラブルなシステムを開発。',
                },
            },
            image: '/assets/images/avatar-3.png',
            color: 'green',
            icon: 'bi bi-cpu-fill',
        },
        {
            name: {
                sourceLocale: 'en',
                default: 'Emily Davis',
                translations: {
                    vi: 'Emily Davis',
                    ja: 'Emily Davis',
                },
            },
            role: {
                sourceLocale: 'en',
                default: 'Marketing Manager',
                translations: {
                    vi: 'Quản lý Marketing',
                    ja: 'マーケティング',
                },
            },
            description: {
                sourceLocale: 'en',
                default: 'Connecting Kbuilder with creators around the world.',
                translations: {
                    vi: 'Kết nối Kbuilder với cộng đồng sáng tạo toàn cầu.',
                    ja: '世界中のクリエイターとつながります。',
                },
            },
            image: '/assets/images/avatar-4.png',
            color: 'orange',
            icon: 'bi bi-megaphone-fill',
        },
    ],

    /* ==========================================================================
       CTA
    ========================================================================== */

    ctaBadge: {
        sourceLocale: 'en',
        default: 'START BUILDING TODAY',
        translations: {
            vi: 'BẮT ĐẦU NGAY HÔM NAY',
            ja: '今すぐ始めよう',
        },
    },

    ctaTitle: {
        sourceLocale: 'en',
        default: 'Ready To Build',
        translations: {
            vi: 'Sẵn sàng xây dựng',
            ja: '準備はできましたか',
        },
    },

    ctaTitleAccent: {
        sourceLocale: 'en',
        default: 'Your Next Website?',
        translations: {
            vi: 'Website tiếp theo?',
            ja: '次のWebサイトを',
        },
    },

    ctaDescription: {
        sourceLocale: 'en',
        default:
            'Join thousands of creators using Kbuilder to design faster, launch sooner and grow confidently.',
        translations: {
            vi: 'Tham gia cùng hàng nghìn nhà sáng tạo đang sử dụng Kbuilder để xây dựng website nhanh hơn.',
            ja: 'KbuilderでWebサイト制作を始めましょう。',
        },
    },

    ctaPrimaryButtonLabel: {
        sourceLocale: 'en',
        default: 'Start Free',
        translations: {
            vi: 'Bắt đầu miễn phí',
            ja: '無料で始める',
        },
    },

    ctaSecondaryButtonLabel: {
        sourceLocale: 'en',
        default: 'Contact Sales',
        translations: {
            vi: 'Liên hệ',
            ja: 'お問い合わせ',
        },
    },

    ctaImage: '/assets/images/about/cta-image.png',

    /* ==========================================================================
       SEO
    ========================================================================== */

    pageTitle: {
        sourceLocale: 'en',
        default: 'About Kbuilder',
        translations: {
            vi: 'Giới thiệu Kbuilder',
            ja: 'Kbuilderについて',
        },
    },

    pageDescription: {
        sourceLocale: 'en',
        default:
            'Learn more about Kbuilder, our mission, values and the passionate team building the future of website creation.',
        translations: {
            vi: 'Tìm hiểu về Kbuilder, sứ mệnh, giá trị cốt lõi và đội ngũ phát triển nền tảng.',
            ja: 'Kbuilderの使命、価値観、チームをご紹介します。',
        },
    },
};

export function About01(props: About01Props) {
    const mergedProps = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        /* Breadcrumb */
        breadcrumbHome,
        breadcrumbCurrent,

        /* Hero */
        badge,
        heroTitle,
        heroTitleAccent,
        heroDescription,

        primaryButtonLabel,
        secondaryButtonLabel,

        image,

        performanceScore,
        performanceLabel,

        /* Mission */
        missionBadge,
        missionTitle,
        missionTitleAccent,
        missionDescription,

        missionCenterTitle,
        missionCenterDescription,

        missionNodes,

        /* Collections */
        stats,
        features,
        values,

        /* Journey */
        journeyBadge,
        journeyTitle,
        journeyTitleAccent,
        journeyDescription,

        journeys,

        /* Stories */
        stories,
        storyFeatures,

        /* Why */
        whyBadge,
        whyTitle,
        whyTitleAccent,
        whyDescription,

        /* Problems / Solutions */
        problems,
        solutions,

        builderPreviewImage,

        /* Core Values */
        coreValues,

        /* Team */
        teamBadge,
        teamTitle,
        teamTitleAccent,
        teamDescription,

        team,

        /* CTA */
        ctaBadge,
        ctaTitle,
        ctaTitleAccent,
        ctaDescription,

        ctaPrimaryButtonLabel,
        ctaSecondaryButtonLabel,

        ctaImage,

        /* SEO */
        pageTitle,
        pageDescription,
    } = mergedProps;

    /* ==========================================================================
   Locale
========================================================================== */

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

    const t = (value?: LocalizedText) => (value ? getLocalizedValue(value, selectedLocale) : '');

    const ensureArray = <T,>(value?: T[]): T[] => value ?? [];

    const statsData = ensureArray(stats);

    const featuresData = ensureArray(features);

    const valuesData = ensureArray(values);

    const missionNodesData = ensureArray(missionNodes);

    const journeysData = ensureArray(journeys);

    const storiesData = ensureArray(stories);

    const storyFeaturesData = ensureArray(storyFeatures);

    const problemsData = ensureArray(problems);

    const solutionsData = ensureArray(solutions);

    const coreValuesData = ensureArray(coreValues);

    const teamData = ensureArray(team);

    return (
        <>
            <div className={styles.headingSection}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/" className={styles.breadcrumbItem}>
                        {t(breadcrumbHome)}
                    </Link>

                    <i className="bi bi-chevron-right" />

                    <span className={styles.breadcrumbCurrent}>{t(breadcrumbCurrent)}</span>
                </nav>
            </div>
            <section className={styles.hero}>
                <div className={styles.grid} />
                <div className={styles.blurOne} />
                <div className={styles.blurTwo} />
                <div className={styles.blurThree} />
                <div className={styles.container}>
                    <div className={styles.content}>
                        <a
                            href="/"
                            className={`${styles.badge} ${styles.r}`}
                            style={{ '--i': 0 } as React.CSSProperties}
                        >
                            <span className={styles.badgeIcon}>
                                <i className="bi bi-stars" />
                            </span>

                            <span>{t(badge)}</span>

                            <i className="bi bi-arrow-right" />
                        </a>

                        <h1>{t(heroTitle)}</h1>

                        <h2>{t(heroTitleAccent)}</h2>

                        <p>{t(heroDescription)}</p>

                        <div className={styles.actions}>
                            <button className={styles.primaryButton}>
                                {t(primaryButtonLabel)}
                                <i className="bi bi-arrow-right" />
                            </button>

                            <button className={styles.secondaryButton}>
                                {t(secondaryButtonLabel)}
                                <i className="bi bi-grid-3x3-gap" />
                            </button>
                        </div>

                        <div className={styles.stats}>
                            {statsData.map((stat, index) => (
                                <div key={index} className={styles.statCard}>
                                    <div className={styles.statIcon}>
                                        <span className={styles.iconGlow} />
                                        <i className={`bi ${stat.icon}`} />
                                    </div>

                                    <strong className={styles.statValue}>{t(stat.value)}</strong>

                                    <span className={styles.statLabel}>{t(stat.label)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.visual}>
                        <div className={styles.featureGrid}>
                            {featuresData.map((feature, index) => (
                                <div key={index} className={styles.featureCard}>
                                    <div className={styles.featureIcon}>
                                        <i className={`bi ${feature.icon}`} />
                                    </div>

                                    <h4>{t(feature.title)}</h4>
                                </div>
                            ))}
                        </div>

                        <div className={styles.canvasWrapper}>
                            <div className={styles.glow} />

                            <div className={styles.canvas}>
                                <img src={image} alt={t(heroTitle)} />
                            </div>

                            <div className={styles.performanceCard}>
                                <div className={styles.performanceIcon}>
                                    <i className="bi bi-rocket-takeoff-fill" />
                                </div>

                                <div>
                                    <strong>{t(performanceScore)}</strong>

                                    <span>{t(performanceLabel)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.coreValuesSection}>
                <div className={styles.coreValuesBlurOne} />
                <div className={styles.coreValuesBlurTwo} />
                <div className={styles.coreValuesBackgroundGrid} />

                <div className={styles.coreValuesContainer}>
                    <div className={styles.coreValuesGrid}>
                        {coreValuesData.map((value, index) => (
                            <article
                                key={index}
                                className={`${styles.coreValueCard} ${styles[value.color]}`}
                            >
                                <div className={styles.cardGlow} />

                                <div className={styles.cardNoise} />

                                <div className={styles.cardOrbit}>
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                <div className={styles.cardWave}>
                                    <svg viewBox="0 0 1200 180" preserveAspectRatio="none">
                                        <path d="M0,80 C160,20 340,150 560,120 C780,90 930,10 1200,70 L1200,180 L0,180 Z" />
                                    </svg>
                                </div>

                                <div className={styles.iconSection}>
                                    <div className={styles.iconHalo} />

                                    <div className={styles.iconCircle}>
                                        <i className={`bi ${value.icon}`} />
                                    </div>

                                    <span className={styles.orbitDot} />
                                </div>

                                <div className={styles.numberCard}>{t(value.id)}</div>

                                <div className={styles.content}>
                                    <h3>{t(value.title)}</h3>

                                    <div className={styles.heartDivider}>
                                        <span />

                                        <i className="bi bi-heart-fill" />

                                        <span />
                                    </div>

                                    <p>{t(value.description)}</p>
                                </div>

                                <div className={styles.tagRow}>
                                    {value.tags.map((tag, tagIndex) => (
                                        <div key={tagIndex} className={styles.tag}>
                                            <i className="bi bi-check2-circle" />

                                            {t(tag)}
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.sparkles}>
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            <section className={styles.aboutVisionRoot}>
                <div className={styles.aboutVisionGlowLeft} />
                <div className={styles.aboutVisionGlowRight} />

                <div className={styles.aboutVisionShell}>
                    <div className={styles.aboutVisionNarrative}>
                        <span className={styles.aboutVisionPill}>
                            <i className="bi bi-stars" />
                            {t(missionBadge)}
                        </span>

                        <h2 className={styles.aboutVisionHeadline}>
                            {t(missionTitle)}
                            <br />
                            {t(missionTitleAccent)}
                        </h2>

                        <p className={styles.aboutVisionSummary}>{t(missionDescription)}</p>

                        <div className={styles.aboutVisionValueGrid}>
                            {valuesData.map((item, index) => (
                                <article key={index} className={styles.aboutVisionValueCard}>
                                    <div className={styles.aboutVisionValueHeader}>
                                        <div className={styles.aboutVisionValueIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <h3>{t(item.title)}</h3>
                                    </div>

                                    <p>{t(item.description)}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className={styles.aboutVisionDiagram}>
                        <div className={styles.aboutVisionCanvas}>
                            <div className={styles.aboutVisionAuraOne} />
                            <div className={styles.aboutVisionAuraTwo} />
                            <div className={styles.aboutVisionAuraThree} />

                            <svg
                                className={styles.aboutVisionOrbit}
                                viewBox="0 0 800 800"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <circle
                                    cx="400"
                                    cy="400"
                                    r="280"
                                    fill="none"
                                    stroke="url(#orbitGradient)"
                                    strokeWidth="3"
                                    strokeDasharray="10 12"
                                    strokeLinecap="round"
                                />

                                <defs>
                                    <linearGradient
                                        id="orbitGradient"
                                        x1="0"
                                        y1="0"
                                        x2="800"
                                        y2="800"
                                    >
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="100%" stopColor="#6366F1" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className={styles.aboutVisionCenter}>
                                <div className={styles.aboutVisionBrand}>K</div>

                                <h3>{t(missionCenterTitle)}</h3>

                                <p>{t(missionCenterDescription)}</p>
                            </div>

                            {missionNodesData.map((node, index) => {
                                const positions = [
                                    styles.aboutVisionNodeTop,
                                    styles.aboutVisionNodeRight,
                                    styles.aboutVisionNodeBottom,
                                    styles.aboutVisionNodeLeft,
                                ];

                                return (
                                    <div
                                        key={index}
                                        className={`${styles.aboutVisionNode} ${positions[index]}`}
                                    >
                                        <div className={styles.aboutVisionNodeIcon}>
                                            <i className={`bi ${node.icon}`} />
                                        </div>

                                        <h4>{t(node.title)}</h4>

                                        <p>{t(node.description)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.journeySection}>
                <div className={styles.journeyContainer}>
                    <div className={styles.journeyHeader}>
                        <span className={styles.eyebrow}>
                            <i className="bi bi-stars" />
                            {t(journeyBadge)}
                        </span>

                        <h2>
                            {t(journeyTitle)} <span>{t(journeyTitleAccent)}</span>
                        </h2>

                        <p>{t(journeyDescription)}</p>
                    </div>

                    <div className={styles.journeyTimeline}>
                        <div className={styles.journeyTrack}>
                            <div className={styles.journeyProgress} />
                        </div>

                        <div className={styles.journeyGrid}>
                            {journeysData.map((item, index) => (
                                <article
                                    key={index}
                                    className={`${styles.journeyItem} ${
                                        item.active ? styles.journeyItemActive : ''
                                    }`}
                                >
                                    <div className={styles.journeyIconWrapper}>
                                        <div className={styles.journeyIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>
                                    </div>

                                    <div className={styles.journeyContent}>
                                        <span className={styles.journeyDate}>{t(item.date)}</span>

                                        <h3 className={styles.journeyTitle}>{t(item.title)}</h3>

                                        <p className={styles.journeyDescription}>
                                            {t(item.description)}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.storySection}>
                    <div className={styles.storyContainer}>
                        <div className={styles.storyGrid}>
                            {storiesData.map((story, index) => (
                                <article key={index} className={styles.storyCard}>
                                    <div className={styles.storyContentTop}>
                                        <div className={styles.storyContent}>
                                            <span className={styles.storyBadge}>
                                                {t(story.badge)}
                                            </span>

                                            <h3>
                                                {t(story.title)}
                                                <span>{t(story.titleAccent)}</span>
                                            </h3>

                                            <p>{t(story.description)}</p>
                                        </div>

                                        <div className={styles.storyVisual}>
                                            <Image
                                                src={
                                                    story.image ??
                                                    '/assets/images/about/story-placeholder.png'
                                                }
                                                alt={t(story.imageAlt)}
                                                fill
                                                sizes="(max-width:768px)100vw,50vw"
                                                className={styles.storyImage}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.storyFeatures}>
                                        {storyFeaturesData.map((feature, featureIndex) => (
                                            <article
                                                key={featureIndex}
                                                className={styles.storyFeature}
                                            >
                                                <div className={styles.storyFeatureIcon}>
                                                    <i className={`bi ${feature.icon}`} />
                                                </div>

                                                <div className={styles.storyFeatureContent}>
                                                    <div className={styles.storyFeatureHeader}>
                                                        <strong>{t(feature.title)}</strong>

                                                        <span>{t(feature.badge)}</span>
                                                    </div>

                                                    <p>{t(feature.description)}</p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.whyKbuilder}>
                <div className={styles.backgroundBlurOne} />
                <div className={styles.backgroundBlurTwo} />

                <div className={styles.whyKbuilderContainer}>
                    <div className={styles.whyKbuilderHero}>
                        <div className={styles.whyKbuilderContent}>
                            <span className={styles.whyKbuilderEyebrow}>
                                <span className={styles.whyKbuilderLogo}>
                                    <i className="bi bi-stars" />
                                </span>

                                {t(whyBadge)}
                            </span>

                            <h2 className={styles.whyKbuilderTitle}>
                                {t(whyTitle)}
                                <span>{t(whyTitleAccent)}</span>
                            </h2>

                            <div className={styles.whyKbuilderDivider} />

                            <p className={styles.whyKbuilderDescription}>{t(whyDescription)}</p>

                            <div className={styles.problemsGrid}>
                                {problemsData.map((item, index) => (
                                    <article key={index} className={styles.problemCard}>
                                        <div className={styles.problemCardIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <div>
                                            <h4>{t(item.title)}</h4>

                                            <p>{t(item.description)}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className={styles.builderBrowserBody}>
                            <Image
                                src={builderPreviewImage ?? '/assets/images/builder-preview.png'}
                                alt={t(whyTitle)}
                                width={860}
                                height={520}
                                priority
                                className={styles.builderPreviewImage}
                            />
                        </div>
                    </div>

                    <div className={styles.solutionSection}>
                        <div className={styles.solutionGrid}>
                            {solutionsData.map((item, index) => (
                                <div key={index} className={styles.solutionCard}>
                                    <div className={styles.solutionCardIcon}>
                                        <i className={`bi ${item.icon}`} />
                                    </div>

                                    <div>
                                        <h4>{t(item.title)}</h4>

                                        <p>{t(item.description)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.teamWrapper}>
                <div className={styles.teamBlurPrimary} />
                <div className={styles.teamBlurSecondary} />
                <div className={styles.teamBackgroundGrid} />

                <div className={styles.teamContainer}>
                    <div className={styles.teamHero}>
                        <div className={styles.teamHeroGlow} />

                        <div className={styles.teamHeroLeft}>
                            <div className={styles.teamHeroIcon}>
                                <i className="bi bi-people-fill" />
                            </div>

                            <div className={styles.teamHeroContent}>
                                <h2>
                                    {t(teamTitle)}
                                    <span>{t(teamTitleAccent)}</span>
                                </h2>

                                <p>{t(teamDescription)}</p>
                            </div>
                        </div>

                        <div className={styles.teamHeroBadge}>
                            <i className="bi bi-stars" />
                            {t(teamBadge)}
                        </div>
                    </div>

                    <div className={styles.team02Grid}>
                        {teamData.map((member, index) => (
                            <article
                                key={index}
                                className={`${styles.team02Card} ${styles[member.color]}`}
                            >
                                {/* Background Glow */}
                                <div className={styles.team02Glow} />

                                {/* Border */}
                                <div className={styles.team02Border} />

                                {/* Decorative Dots */}
                                <div className={styles.team02Dots}>
                                    {Array.from({ length: 9 }).map((_, dotIndex) => (
                                        <span key={dotIndex} />
                                    ))}
                                </div>

                                {/* Bottom Wave */}
                                <div className={styles.team02Wave} />

                                {/* Avatar */}
                                <div className={styles.team02AvatarArea}>
                                    <div className={styles.team02OrbitOuter} />

                                    <div className={styles.team02OrbitInner} />

                                    <div className={styles.team02OrbitDot} />

                                    <div className={styles.team02AvatarCircle}>
                                        <Image
                                            src={member.image ?? '/assets/images/avatar-1.png'}
                                            alt={t(member.name)}
                                            width={320}
                                            height={320}
                                            className={styles.team02Avatar}
                                        />
                                    </div>

                                    <div className={styles.team02FloatingBadge}>
                                        <div className={styles.team02BadgeBox}>
                                            <i className={`bi ${member.icon}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={styles.team02Content}>
                                    <div className={styles.team02Heading}>
                                        <h3 className={styles.team02Name}>{t(member.name)}</h3>

                                        <span className={styles.team02Role}>{t(member.role)}</span>
                                    </div>

                                    <div className={styles.team02AccentLine}>
                                        <span />
                                    </div>

                                    <p className={styles.team02Description}>
                                        {t(member.description)}
                                    </p>

                                    <div className={styles.team02Footer}>
                                        <div className={styles.team02Socials}>
                                            <button type="button" className={styles.team02Social}>
                                                <i className="bi bi-linkedin" />
                                            </button>

                                            <button type="button" className={styles.team02Social}>
                                                <i className="bi bi-twitter-x" />
                                            </button>

                                            <button type="button" className={styles.team02Social}>
                                                <i className="bi bi-envelope-fill" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
const createLocalizedField = (key: string, label: string): InspectorField => ({
    kind: 'localized-text',
    key,
    label,
});

const createLocalizedTextareaField = (key: string, label: string): InspectorField => ({
    kind: 'textarea',
    key,
    label,
});

const createImageField = (key: string, label: string, folder = 'about'): InspectorField => ({
    kind: 'image',
    key,
    label,
    folder,
    accept: 'image/*',
});

const createIconField = (key: string, label = 'Icon'): InspectorField => ({
    kind: 'text',
    key,
    label,
});

const createCheckField = (key: string, label: string): InspectorField => ({
    kind: 'check',
    key,
    label,
});

const createNumberField = (key: string, label: string): InspectorField => ({
    kind: 'number',
    key,
    label,
});

export interface SelectOption {
    label: string;
    value: string;
}

const createSelectField = (
    key: string,
    label: string,
    options: SelectOption[],
): InspectorField => ({
    kind: 'select',
    key,
    label,
    options,
});

function createBreadcrumbInspector(): InspectorField[] {
    return [
        createLocalizedField('breadcrumbHome', 'Breadcrumb Home'),

        createLocalizedField('breadcrumbCurrent', 'Breadcrumb Current'),
    ];
}

function createHeroInspector(): InspectorField[] {
    return [
        createLocalizedField('badge', 'Hero Badge'),

        createLocalizedField('heroTitle', 'Hero Title'),

        createLocalizedField('heroTitleAccent', 'Hero Title Accent'),

        createLocalizedTextareaField('heroDescription', 'Hero Description'),

        createLocalizedField('primaryButtonLabel', 'Primary Button'),

        createLocalizedField('secondaryButtonLabel', 'Secondary Button'),

        createImageField('image', 'Hero Image'),

        createLocalizedField('performanceScore', 'Performance Score'),

        createLocalizedField('performanceLabel', 'Performance Label'),
    ];
}

function createMissionInspector(): InspectorField[] {
    return [
        createLocalizedField('missionBadge', 'Mission Badge'),

        createLocalizedField('missionTitle', 'Mission Title'),

        createLocalizedField('missionTitleAccent', 'Mission Title Accent'),

        createLocalizedTextareaField('missionDescription', 'Mission Description'),

        createLocalizedField('missionCenterTitle', 'Mission Center Title'),

        createLocalizedTextareaField('missionCenterDescription', 'Mission Center Description'),
    ];
}

function createWhyInspector(): InspectorField[] {
    return [
        createLocalizedField('whyBadge', 'Why Badge'),

        createLocalizedField('whyTitle', 'Why Title'),

        createLocalizedField('whyTitleAccent', 'Why Title Accent'),

        createLocalizedTextareaField('whyDescription', 'Why Description'),

        createImageField('builderPreviewImage', 'Builder Preview Image'),
    ];
}
function createTeamHeaderInspector(): InspectorField[] {
    return [
        createLocalizedField('teamBadge', 'Team Badge'),

        createLocalizedField('teamTitle', 'Team Title'),

        createLocalizedField('teamTitleAccent', 'Team Title Accent'),

        createLocalizedTextareaField('teamDescription', 'Team Description'),
    ];
}

function createCtaInspector(): InspectorField[] {
    return [
        createLocalizedField('ctaBadge', 'CTA Badge'),

        createLocalizedField('ctaTitle', 'CTA Title'),

        createLocalizedField('ctaTitleAccent', 'CTA Title Accent'),

        createLocalizedTextareaField('ctaDescription', 'CTA Description'),

        createLocalizedField('ctaPrimaryButtonLabel', 'Primary Button'),

        createLocalizedField('ctaSecondaryButtonLabel', 'Secondary Button'),

        createImageField('ctaImage', 'CTA Image'),
    ];
}
function createSeoInspector(): InspectorField[] {
    return [
        createLocalizedField('pageTitle', 'SEO Title'),

        createLocalizedTextareaField('pageDescription', 'SEO Description'),
    ];
}

function createStatsArray(): InspectorField {
    return {
        key: 'stats',

        label: 'Statistics',

        kind: 'array',

        itemLabel: 'Stat',

        fields: [createLocalizedField('value', 'Value'), createLocalizedField('label', 'Label')],
    };
}

function createFeatureArray(key: string, label: string, itemLabel: string): InspectorField {
    return {
        key,

        label,

        kind: 'array',

        itemLabel,

        fields: [
            createIconField('icon'),

            createLocalizedField('title', 'Title'),

            createLocalizedTextareaField('description', 'Description'),
        ],
    };
}

function createMissionNodeArray(): InspectorField {
    return {
        key: 'missionNodes',

        label: 'Mission Nodes',

        kind: 'array',

        itemLabel: 'Node',

        fields: [
            createIconField('icon'),

            createLocalizedField('title', 'Title'),

            createLocalizedTextareaField('description', 'Description'),
        ],
    };
}

function createJourneyArray(): InspectorField {
    return {
        key: 'journeys',

        label: 'Journey Timeline',

        kind: 'array',

        itemLabel: 'Journey',

        fields: [
            createIconField('icon'),

            createLocalizedField('date', 'Date'),

            createLocalizedField('title', 'Title'),

            createLocalizedTextareaField('description', 'Description'),

            createCheckField('active', 'Active'),
        ],
    };
}

function createStoryArray(): InspectorField {
    return {
        key: 'stories',

        label: 'Stories',

        kind: 'array',

        itemLabel: 'Story',

        fields: [
            createLocalizedField('year', 'Year'),

            createLocalizedField('badge', 'Badge'),

            createLocalizedField('title', 'Title'),

            createLocalizedField('titleAccent', 'Title Accent'),

            createLocalizedTextareaField('description', 'Description'),

            createImageField('image', 'Image'),

            createLocalizedField('imageAlt', 'Image Alt'),

            createCheckField('reverse', 'Reverse Layout'),
        ],
    };
}

function createStoryFeatureArray(): InspectorField {
    return {
        key: 'storyFeatures',

        label: 'Story Features',

        kind: 'array',

        itemLabel: 'Feature',

        fields: [
            createIconField('icon'),

            createLocalizedField('title', 'Title'),

            createLocalizedField('badge', 'Badge'),

            createLocalizedTextareaField('description', 'Description'),
        ],
    };
}

function createCoreValueArray(): InspectorField {
    return {
        key: 'coreValues',

        label: 'Core Values',

        kind: 'array',

        itemLabel: 'Core Value',

        fields: [
            createLocalizedField('id', 'Number'),

            createIconField('icon'),

            createLocalizedField('title', 'Title'),

            createLocalizedTextareaField('description', 'Description'),

            createSelectField('color', 'Color', [
                {
                    label: 'Purple',
                    value: 'purple',
                },
                {
                    label: 'Blue',
                    value: 'blue',
                },
                {
                    label: 'Green',
                    value: 'green',
                },
                {
                    label: 'Orange',
                    value: 'orange',
                },
                {
                    label: 'Pink',
                    value: 'pink',
                },
            ]),

            {
                key: 'tags',

                label: 'Tags',

                kind: 'array',

                itemLabel: 'Tag',

                fields: [createLocalizedField('value', 'Tag')],
            },
        ],
    };
}

function createTeamArray(): InspectorField {
    return {
        key: 'team',

        label: 'Team Members',

        kind: 'array',

        itemLabel: 'Member',

        fields: [
            createLocalizedField('name', 'Name'),

            createLocalizedField('role', 'Role'),

            createLocalizedTextareaField('description', 'Description'),

            createIconField('icon'),

            createSelectField('color', 'Color', [
                {
                    label: 'Purple',
                    value: 'purple',
                },
                {
                    label: 'Blue',
                    value: 'blue',
                },
                {
                    label: 'Green',
                    value: 'green',
                },
                {
                    label: 'Orange',
                    value: 'orange',
                },
                {
                    label: 'Pink',
                    value: 'pink',
                },
            ]),

            createImageField('image', 'Image', 'about/team'),

            createLocalizedField('imageAlt', 'Image Alt'),
        ],
    };
}

function createInspector(): RegItem['inspector'] {
    return [
        /* ==========================================================
           Breadcrumb
        ========================================================== */

        ...createBreadcrumbInspector(),

        /* ==========================================================
           Hero
        ========================================================== */

        ...createHeroInspector(),

        /* ==========================================================
           Mission
        ========================================================== */

        ...createMissionInspector(),

        /* ==========================================================
           Why
        ========================================================== */

        ...createWhyInspector(),

        /* ==========================================================
           Team Header
        ========================================================== */

        ...createTeamHeaderInspector(),

        /* ==========================================================
           CTA
        ========================================================== */

        ...createCtaInspector(),

        /* ==========================================================
           SEO
        ========================================================== */

        ...createSeoInspector(),

        /* ==========================================================
           Statistics
        ========================================================== */

        createStatsArray(),

        /* ==========================================================
           Hero Features
        ========================================================== */

        createFeatureArray('features', 'Hero Features', 'Feature'),

        /* ==========================================================
           Mission Values
        ========================================================== */

        createFeatureArray('values', 'Mission Values', 'Value'),

        /* ==========================================================
           Mission Nodes
        ========================================================== */

        createMissionNodeArray(),

        /* ==========================================================
           Journey Timeline
        ========================================================== */

        createJourneyArray(),

        /* ==========================================================
           Stories
        ========================================================== */

        createStoryArray(),

        /* ==========================================================
           Story Features
        ========================================================== */

        createStoryFeatureArray(),

        /* ==========================================================
           Problems
        ========================================================== */

        createFeatureArray('problems', 'Problems', 'Problem'),

        /* ==========================================================
           Solutions
        ========================================================== */

        createFeatureArray('solutions', 'Solutions', 'Solution'),

        /* ==========================================================
           Core Values
        ========================================================== */

        createCoreValueArray(),

        /* ==========================================================
           Team
        ========================================================== */

        createTeamArray(),
    ];
}

export const ABOUT_PAGE_01: RegItem = {
    kind: 'about-page-01',

    label: 'About Page 01',

    defaults: DEFAULT_PROPS as Record<string, unknown>,

    inspector: createInspector(),

    render: (props) => <About01 {...(props as unknown as About01Props)} />,
};

export default About01;
