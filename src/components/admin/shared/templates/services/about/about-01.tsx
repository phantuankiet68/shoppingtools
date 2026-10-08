'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { getLocalizedValue, type LocalizedText } from '@/lib/ui-builder/localization';

import styles from '@/components/admin/shared/templates/services/about/styles/about-01.module.css';

type ValueColor = 'purple' | 'blue' | 'orange' | 'pink';

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

type SupportedLocale = 'en' | 'vi' | 'ja';
type TeamMemberColor = 'blue' | 'pink' | 'green' | 'orange';

interface TeamMemberApiItem {
    id: string;
    siteId: string;
    imageUrl: string | null;
    icon: string | null;
    experience: string | null;
    color: TeamMemberColor;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    email: string | null;
    sortOrder: number;
    isActive: boolean;
    name: string;
    role: string;
    department: string;
    description: string;
    locale: SupportedLocale | null;
    createdAt: string;
    updatedAt: string;
}

interface TeamMemberApiResponse {
    success: boolean;
    message?: string;
    teamMembers: TeamMemberApiItem[];
    total: number;
}

function normalizeLocale(value: string | null | undefined): SupportedLocale {
    return value === 'vi' || value === 'ja' ? value : 'en';
}

function getTeamColorClass(color: TeamMemberColor): string {
    return color in { blue: true, pink: true, green: true, orange: true } ? color : 'blue';
}

const SAMPLE_TEAM_MEMBER: TeamMemberApiItem = {
    id: 'sample-team-member',
    siteId: '',
    imageUrl: '/assets/images/avatar-1.png',
    icon: 'bi-code-slash',
    experience: '5+',
    color: 'blue',
    linkedinUrl: null,
    twitterUrl: null,
    email: null,
    sortOrder: 0,
    isActive: true,
    name: 'Alex Morgan',
    role: 'Senior Developer',
    department: 'Engineering',
    description:
        'Building scalable digital experiences with modern technologies and thoughtful design.',
    locale: 'en',
    createdAt: '',
    updatedAt: '',
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
    ctaBadge?: LocalizedText;
    ctaTitle?: LocalizedText;
    ctaTitleAccent?: LocalizedText;
    ctaDescription?: LocalizedText;
    ctaPrimaryButtonLabel?: LocalizedText;
    ctaSecondaryButtonLabel?: LocalizedText;
    ctaImage?: string;
    pageTitle?: LocalizedText;
    pageDescription?: LocalizedText;
    siteId?: string;
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
        default: 'Why Choose Kbuilder',
        translations: {
            vi: 'Tại sao chọn Kbuilder',
            ja: 'Kbuilderを選ぶ理由',
        },
    },

    whyTitle: {
        sourceLocale: 'en',
        default: 'Build websites',
        translations: {
            vi: 'Xây dựng website',
            ja: 'Webサイトを',
        },
    },

    whyTitleAccent: {
        sourceLocale: 'en',
        default: 'easier than ever',
        translations: {
            vi: 'dễ dàng hơn bao giờ hết',
            ja: 'これまで以上に簡単に',
        },
    },

    whyDescription: {
        sourceLocale: 'en',
        default:
            'Kbuilder gives you everything you need to build professional websites faster, save time, and focus on growing your business.',
        translations: {
            vi: 'Kbuilder mang đến mọi công cụ cần thiết để bạn xây dựng website chuyên nghiệp nhanh hơn, tiết kiệm thời gian và tập trung phát triển doanh nghiệp.',
            ja: 'Kbuilderは、プロフェッショナルなWebサイトをより速く構築し、時間を節約しながらビジネスの成長に集中できる環境を提供します。',
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
            'KBuilder is an all-in-one no-code website builder that helps creators and businesses build professional websites with a simple drag-and-drop editor, modern templates, AI-powered tools, and one-click publishing.',
        translations: {
            vi: 'KBuilder là nền tảng xây dựng website không cần lập trình, giúp cá nhân và doanh nghiệp tạo website chuyên nghiệp với trình kéo thả trực quan, template hiện đại, công cụ AI và xuất bản chỉ với một cú nhấp.',
            ja: 'KBuilderは、直感的なドラッグ＆ドロップでプロフェッショナルなWebサイトを作成できるオールインワンのノーコードWebサイトビルダーです。モダンなテンプレート、AI機能、ワンクリック公開にも対応しています。',
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

    image: '/assets/images/hero-about.png',

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
            image: '/assets/images/hero-about.png',
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
                    vi: 'Chúng tôi cam kết mang đến những sản phẩm chất lượng cao và có khả năng mở rộng.',
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
        missionBadge,
        missionTitle,
        missionTitleAccent,
        missionDescription,
        missionCenterTitle,
        missionCenterDescription,
        missionNodes,
        values,
        journeys,
        journeyBadge,
        journeyTitle,
        journeyTitleAccent,
        journeyDescription,
        whyBadge,
        whyTitle,
        whyTitleAccent,
        whyDescription,
        problems,
        solutions,
        builderPreviewImage,
        teamBadge,
        teamTitle,
        teamTitleAccent,
        teamDescription,
        siteId,
    } = mergedProps;

    /* ==========================================================================
   Locale
========================================================================== */

    const [teamData, setTeamData] = useState<TeamMemberApiItem[]>([]);
    const autoplay = useRef(
        Autoplay({
            delay: 5000,
            stopOnInteraction: false,
        }),
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            slidesToScroll: 1,
        },
        [autoplay.current],
    );

    const [selectedTeamSlide, setSelectedTeamSlide] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedTeamSlide(emblaApi.selectedScrollSnap());
        };

        onSelect();
        emblaApi.on('select', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);
    const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(() =>
        normalizeLocale(typeof window === 'undefined' ? 'en' : localStorage.getItem('locale')),
    );

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setSelectedLocale(normalizeLocale(customEvent.detail));
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    const t = (value?: LocalizedText) => (value ? getLocalizedValue(value, selectedLocale) : '');

    const ensureArray = <T,>(value?: T[]): T[] => value ?? [];

    const valuesData = ensureArray(values);

    const missionNodesData = ensureArray(missionNodes);

    const journeysData = ensureArray(journeys);

    const problemsData = ensureArray(problems);

    const solutionsData = ensureArray(solutions);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const togglePlay = async () => {
        const video = videoRef.current;

        if (!video) return;

        if (video.paused) {
            await video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;

        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const toggleFullscreen = async () => {
        const video = videoRef.current;

        if (!video) return;

        if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
        }

        await video.requestFullscreen();
    };
    useEffect(() => {
        if (!siteId) {
            setTeamData([SAMPLE_TEAM_MEMBER]);
            return;
        }

        const controller = new AbortController();

        const loadTeamMembers = async () => {
            try {
                const params = new URLSearchParams({
                    siteId,
                    locale: selectedLocale,
                });

                const response = await fetch(`/api/v1/team-member?${params.toString()}`, {
                    credentials: 'include',
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Team member API failed: ${response.status}`);
                }

                const data: TeamMemberApiResponse = await response.json();
                const members =
                    data.success && Array.isArray(data.teamMembers) ? data.teamMembers : [];

                setTeamData(members.length ? members : [SAMPLE_TEAM_MEMBER]);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                console.error('[ABOUT_01_TEAM]', error);
                setTeamData([SAMPLE_TEAM_MEMBER]);
            }
        };

        void loadTeamMembers();

        return () => controller.abort();
    }, [siteId, selectedLocale]);
    return (
        <>
            <div className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.backgroundGlow} />
                    <div className={styles.gridPattern} />

                    <div className={styles.container}>
                        <div className={styles.showcase}>
                            {/* Background */}
                            <div className={`${styles.decor} ${styles.decorLeftTop}`} />

                            <div className={`${styles.decor} ${styles.decorRightTop}`} />

                            <div className={`${styles.decor} ${styles.decorLeftBottom}`} />

                            <div className={`${styles.decor} ${styles.decorRightBottom}`} />

                            {/* Floating tools */}
                            <div
                                className={`${styles.toolBubble} ${styles.toolMagic}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-stars" />
                            </div>

                            <div
                                className={`${styles.toolBubble} ${styles.toolImage}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-image" />
                            </div>

                            <div
                                className={`${styles.toolBubble} ${styles.toolType}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-type" />
                            </div>

                            <div
                                className={`${styles.toolBubble} ${styles.toolPalette}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-palette2" />
                            </div>

                            <div
                                className={`${styles.toolBubble} ${styles.toolLayers}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-layers" />
                            </div>

                            {/* AI status */}
                            <div className={styles.aiStatus}>
                                <span className={styles.aiStatusDot} />

                                <div>
                                    <strong>AI Builder</strong>
                                    <span>Ready to create</span>
                                </div>

                                <i className="bi bi-stars" />
                            </div>

                            {/* AI chip */}
                            <div className={styles.designChip}>
                                <i className="bi bi-lightning-charge-fill" />
                                <span>Build faster with AI</span>
                            </div>

                            {/* Sparkles */}
                            <div
                                className={`${styles.sparkle} ${styles.sparkleOne}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-stars" />
                            </div>

                            <div
                                className={`${styles.sparkle} ${styles.sparkleTwo}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-star-fill" />
                            </div>

                            <div
                                className={`${styles.sparkle} ${styles.sparkleThree}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-stars" />
                            </div>

                            {/* Orbit */}
                            <div className={styles.orbit} aria-hidden="true">
                                <span />
                            </div>

                            {/* AI Assistant */}
                            <div className={`${styles.featureCard} ${styles.aiCard}`}>
                                <div className={styles.featureIcon}>
                                    <i className="bi bi-stars" />
                                </div>

                                <div className={styles.featureContent}>
                                    <strong>AI Assistant</strong>

                                    <span>Tạo nội dung chỉ trong vài giây</span>
                                </div>

                                <button type="button" aria-label="Open AI Assistant">
                                    <i className="bi bi-arrow-right" />
                                </button>
                            </div>

                            {/* Publish */}
                            <div className={`${styles.featureCard} ${styles.publishCard}`}>
                                <div className={styles.featureIcon}>
                                    <i className="bi bi-cloud-arrow-up" />
                                </div>

                                <div className={styles.featureContent}>
                                    <strong>Publish in minutes</strong>

                                    <span>Đưa website lên mạng chỉ với 1 click</span>
                                </div>

                                <button type="button" aria-label="Publish website">
                                    <i className="bi bi-arrow-right" />
                                </button>
                            </div>

                            {/* Drag & Drop */}
                            <div className={`${styles.featureCard} ${styles.dragCard}`}>
                                <div className={styles.featureIcon}>
                                    <i className="bi bi-arrows-move" />
                                </div>

                                <div className={styles.featureContent}>
                                    <strong>Drag & Drop</strong>

                                    <span>Kéo thả, tùy chỉnh dễ dàng</span>
                                </div>

                                <button type="button" aria-label="Drag and drop">
                                    <i className="bi bi-arrow-right" />
                                </button>
                            </div>

                            {/* Video */}
                            <div className={styles.videoShell}>
                                <div className={styles.videoGlow} />

                                <div className={styles.videoFrame}>
                                    <video
                                        ref={videoRef}
                                        className={styles.video}
                                        preload="metadata"
                                        playsInline
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                    >
                                        <source
                                            src="/assets/videos/kbuilder-demo.mp4"
                                            type="video/mp4"
                                        />
                                    </video>

                                    <div className={styles.videoBadge}>
                                        <span className={styles.videoBadgeDot} />

                                        <span>Product Tour</span>

                                        <span className={styles.videoBadgeDivider} />

                                        <i className="bi bi-stars" />

                                        <span>AI Powered</span>
                                    </div>

                                    <div className={styles.videoOverlay}>
                                        {!isPlaying && (
                                            <button
                                                type="button"
                                                className={styles.centerPlay}
                                                onClick={togglePlay}
                                                aria-label="Play video"
                                            >
                                                <i className="bi bi-play-fill" />
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.videoControls}>
                                        <button
                                            type="button"
                                            onClick={togglePlay}
                                            aria-label={isPlaying ? 'Pause video' : 'Play video'}
                                        >
                                            <i
                                                className={
                                                    isPlaying
                                                        ? 'bi bi-pause-fill'
                                                        : 'bi bi-play-fill'
                                                }
                                            />
                                        </button>

                                        <span className={styles.time}>00:24 / 02:18</span>

                                        <div className={styles.progress}>
                                            <span />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={toggleMute}
                                            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                        >
                                            <i
                                                className={
                                                    isMuted
                                                        ? 'bi bi-volume-mute-fill'
                                                        : 'bi bi-volume-up-fill'
                                                }
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={toggleFullscreen}
                                            aria-label="Fullscreen"
                                        >
                                            <i className="bi bi-fullscreen" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Arrows */}
                            <div
                                className={`${styles.arrow} ${styles.arrowLeft}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-arrow-down-right" />
                            </div>

                            <div
                                className={`${styles.arrow} ${styles.arrowRight}`}
                                aria-hidden="true"
                            >
                                <i className="bi bi-arrow-up-right" />
                            </div>

                            {/* Plus */}
                            <div className={`${styles.plus} ${styles.plusOne}`} aria-hidden="true">
                                <i className="bi bi-plus-lg" />
                            </div>

                            <div className={`${styles.plus} ${styles.plusTwo}`} aria-hidden="true">
                                <i className="bi bi-plus-lg" />
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className={styles.bottomCard}>
                            <div className={styles.brand}>
                                <div className={styles.logo}>
                                    <span>K</span>
                                </div>
                            </div>

                            <div className={styles.bottomContent}>
                                <span className={styles.bottomEyebrow}>KBUILDER</span>
                                <h2>Xây dựng website dễ dàng hơn với KBuilder</h2>
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.tags}>
                                <span>
                                    <i className="bi bi-window" />
                                    Website Builder
                                </span>

                                <span>
                                    <i className="bi bi-stars" />
                                    AI
                                </span>

                                <span>
                                    <i className="bi bi-code-slash" />
                                    No Code
                                </span>
                            </div>

                            <button
                                type="button"
                                className={styles.watchButton}
                                onClick={togglePlay}
                            >
                                <i className="bi bi-play-fill" />
                                <span>Xem video</span>
                            </button>

                            <a href="#start" className={styles.startButton}>
                                <span>Bắt đầu ngay</span>
                                <i className="bi bi-arrow-right" />
                            </a>
                        </div>
                    </div>
                </section>
                <section className={styles.journeySection}>
                    <div className={styles.journeyContainer}>
                        <div className={styles.teamHero}>
                            <div className={styles.teamHeroGlow} />

                            <div className={styles.teamHeroLeft}>
                                <div className={styles.teamHeroIcon}>
                                    <i className="bi bi-rocket-takeoff-fill" />
                                </div>

                                <div className={styles.teamHeroContent}>
                                    <h2>
                                        {t(journeyTitle)}
                                        <span>{t(journeyTitleAccent)}</span>
                                    </h2>

                                    <p>{t(journeyDescription)}</p>
                                </div>
                            </div>

                            <div className={styles.teamHeroBadge}>
                                <i className="bi bi-stars" />
                                {t(journeyBadge)}
                            </div>
                        </div>

                        <div className={styles.journeyTimeline}>
                            <div className={styles.journeyLine}>
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className={styles.journeyItems}>
                                {journeysData.slice(0, 4).map((item, index) => (
                                    <article key={index} className={styles.journeyItem}>
                                        <div className={styles.journeyIconWrap}>
                                            <div className={styles.journeyIcon}>
                                                <i className={`bi ${item.icon}`} />
                                            </div>
                                        </div>

                                        <div className={styles.journeyInfo}>
                                            <span className={styles.journeyYear}>
                                                {t(item.date)}
                                            </span>

                                            <h3 className={styles.journeyItemTitle}>
                                                {t(item.title)}
                                            </h3>

                                            <p className={styles.journeyItemDescription}>
                                                {t(item.description)}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
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
                                <span>{t(missionTitleAccent)}</span>
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
                                        r="350"
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
                                            <div className={styles.aboutVisionNodeContent}>
                                                <div className={styles.aboutVisionNodeIcon}>
                                                    <i className={`bi ${node.icon}`} />
                                                </div>
                                                <h4>{t(node.title)}</h4>
                                            </div>
                                            <p>{t(node.description)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
                <section className={styles.whyKbuilder}>
                    <div className={styles.backgroundBlurOne} />
                    <div className={styles.backgroundBlurTwo} />
                    <div className={styles.backgroundBlurThree} />

                    <div className={styles.whyKbuilderContainer}>
                        <div className={styles.whyKbuilderMain}>
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

                                <p className={styles.whyKbuilderDescription}>{t(whyDescription)}</p>

                                <div className={styles.problemsGrid}>
                                    {problemsData.slice(0, 4).map((item, index) => (
                                        <article
                                            key={index}
                                            className={`${styles.problemCard} ${styles[`problemCard${index + 1}`]}`}
                                        >
                                            <div className={styles.problemCardIcon}>
                                                <i className={`bi ${item.icon}`} />
                                            </div>

                                            <div className={styles.problemCardContent}>
                                                <h4>{t(item.title)}</h4>

                                                <p>{t(item.description)}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.builderVisual}>
                                <div className={styles.builderGlow} />

                                <div className={styles.builderOrbOne} />
                                <div className={styles.builderOrbTwo} />
                                <div className={styles.builderOrbThree} />

                                <div className={styles.builderDots} />

                                <div className={styles.builderPreview}>
                                    <Image
                                        src={
                                            builderPreviewImage ??
                                            '/assets/images/builder-why-builder.png'
                                        }
                                        alt={t(whyTitle)}
                                        fill
                                        priority
                                        sizes="(max-width: 900px) 100vw, 52vw"
                                        className={styles.builderPreviewImage}
                                    />
                                </div>

                                <div className={styles.builderDecorationTop}>
                                    <span>Build</span>
                                    <span>Better</span>
                                    <span>Together</span>

                                    <i className="bi bi-arrow-down-right" />
                                </div>

                                <div className={styles.builderDecorationBottom}>
                                    <span>Drag</span>
                                    <span>&amp; Drop</span>

                                    <i className="bi bi-arrow-up-right" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.solutionSection}>
                            <div className={styles.solutionGrid}>
                                {solutionsData.slice(0, 4).map((item, index) => (
                                    <article
                                        key={index}
                                        className={`${styles.solutionCard} ${styles[`solutionCard${index + 1}`]}`}
                                    >
                                        <div className={styles.solutionCardIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <div className={styles.solutionCardContent}>
                                            <h4>{t(item.title)}</h4>

                                            <p>{t(item.description)}</p>
                                        </div>
                                    </article>
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

                        <section className={styles.team02}>
                            <div className={styles.team02Background}>
                                <span className={styles.team02OrbBlue} />
                                <span className={styles.team02OrbPurple} />
                                <span className={styles.team02OrbPink} />
                                <span className={styles.team02OrbCyan} />
                            </div>

                            <div className={styles.team02Container}>
                                <div className={styles.team02Viewport} ref={emblaRef}>
                                    <div className={styles.team02Grid}>
                                        {teamData.map((member) => (
                                            <article
                                                key={member.id}
                                                className={`${styles.team02Card} ${styles[member.color]}`}
                                            >
                                                <div className={styles.team02CardGlow} />

                                                <div className={styles.team02Top}>
                                                    <span className={styles.team02Department}>
                                                        <span
                                                            className={styles.team02DepartmentDot}
                                                        />
                                                        {member.department || member.role}
                                                    </span>
                                                </div>

                                                <div className={styles.team02Visual}>
                                                    <div className={styles.team02ImageGlow} />

                                                    <div className={styles.team02ImageFrame}>
                                                        <Image
                                                            src={
                                                                member.imageUrl ??
                                                                '/assets/images/avatar-1.png'
                                                            }
                                                            alt={member.name}
                                                            fill
                                                            sizes="(max-width: 767px) 85vw, (max-width: 1199px) 42vw, 300px"
                                                            className={styles.team02Avatar}
                                                        />
                                                    </div>

                                                    <div className={styles.team02Experience}>
                                                        <strong>{member.experience ?? '5+'}</strong>
                                                        <span>Years Exp.</span>
                                                    </div>

                                                    {member.icon && (
                                                        <div className={styles.team02Skill}>
                                                            <i className={`bi ${member.icon}`} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={styles.team02Content}>
                                                    <div className={styles.team02TitleRow}>
                                                        <div className={styles.team02Title}>
                                                            <h3>{member.name}</h3>
                                                            <span>{member.role}</span>
                                                        </div>

                                                        <span className={styles.team02NameArrow}>
                                                            <i className="bi bi-arrow-up-right" />
                                                        </span>
                                                    </div>

                                                    <p className={styles.team02Description}>
                                                        {member.description}
                                                    </p>
                                                </div>

                                                <div className={styles.team02Footer}>
                                                    <div className={styles.team02Socials}>
                                                        <a
                                                            href={member.linkedinUrl ?? '#'}
                                                            target={
                                                                member.linkedinUrl
                                                                    ? '_blank'
                                                                    : undefined
                                                            }
                                                            rel={
                                                                member.linkedinUrl
                                                                    ? 'noopener noreferrer'
                                                                    : undefined
                                                            }
                                                            className={`${styles.team02Social} ${
                                                                !member.linkedinUrl
                                                                    ? styles.disabledSocial
                                                                    : ''
                                                            }`}
                                                            aria-label="LinkedIn"
                                                            onClick={(event) => {
                                                                if (!member.linkedinUrl) {
                                                                    event.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            <i
                                                                className="bi bi-linkedin"
                                                                aria-hidden="true"
                                                            />
                                                        </a>

                                                        <a
                                                            href={member.twitterUrl ?? '#'}
                                                            target={
                                                                member.twitterUrl
                                                                    ? '_blank'
                                                                    : undefined
                                                            }
                                                            rel={
                                                                member.twitterUrl
                                                                    ? 'noopener noreferrer'
                                                                    : undefined
                                                            }
                                                            className={`${styles.team02Social} ${
                                                                !member.twitterUrl
                                                                    ? styles.disabledSocial
                                                                    : ''
                                                            }`}
                                                            aria-label="X"
                                                            onClick={(event) => {
                                                                if (!member.twitterUrl) {
                                                                    event.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            <i
                                                                className="bi bi-twitter-x"
                                                                aria-hidden="true"
                                                            />
                                                        </a>

                                                        <a
                                                            href={
                                                                member.email
                                                                    ? `mailto:${member.email}`
                                                                    : '#'
                                                            }
                                                            className={`${styles.team02Social} ${
                                                                !member.email
                                                                    ? styles.disabledSocial
                                                                    : ''
                                                            }`}
                                                            aria-label="Email"
                                                            onClick={(event) => {
                                                                if (!member.email) {
                                                                    event.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            <i
                                                                className="bi bi-envelope-fill"
                                                                aria-hidden="true"
                                                            />
                                                        </a>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className={styles.team02ViewButton}
                                                        aria-label={`View ${member.name}`}
                                                    >
                                                        <i className="bi bi-arrow-right" />
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    <div className={styles.team02Navigation}>
                                        <button
                                            type="button"
                                            className={styles.team02NavigationButton}
                                            aria-label="Previous"
                                            onClick={() => emblaApi?.scrollPrev()}
                                        >
                                            <i className="bi bi-chevron-left" />
                                        </button>

                                        <div className={styles.team02Pagination}>
                                            {teamData.map((member, index) => (
                                                <button
                                                    key={member.id}
                                                    type="button"
                                                    className={`${styles.team02PaginationDot} ${
                                                        selectedTeamSlide === index
                                                            ? styles.active
                                                            : ''
                                                    }`}
                                                    aria-label={`Go to team member ${index + 1}`}
                                                    onClick={() => emblaApi?.scrollTo(index)}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            className={styles.team02NavigationButton}
                                            aria-label="Next"
                                            onClick={() => emblaApi?.scrollNext()}
                                        >
                                            <i className="bi bi-chevron-right" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
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

function createInspector(): RegItem['inspector'] {
    return [
        ...createBreadcrumbInspector(),
        ...createHeroInspector(),
        ...createMissionInspector(),
        ...createWhyInspector(),
        ...createTeamHeaderInspector(),
        ...createCtaInspector(),
        ...createSeoInspector(),
        createStatsArray(),
        createFeatureArray('features', 'Hero Features', 'Feature'),
        createFeatureArray('values', 'Mission Values', 'Value'),
        createMissionNodeArray(),
        createJourneyArray(),
        createStoryArray(),
        createStoryFeatureArray(),
        createFeatureArray('problems', 'Problems', 'Problem'),
        createFeatureArray('solutions', 'Solutions', 'Solution'),
        createCoreValueArray(),
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
