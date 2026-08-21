'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';

import type { RegItem, InspectorField } from '@/lib/ui-builder/types';

import styles from '@/components/admin/shared/templates/services/pricing-page/styles/pricing-page-01.module.css';

/* ==========================================================
   Shared Types
========================================================== */

type Tone = 'green' | 'blue' | 'purple' | 'orange';

type BillingType = 'monthly' | 'yearly';

type ComparisonValue = string | boolean;

type ButtonProps = {
    label: LocalizedText;
    href?: string;
    target?: '_self' | '_blank';
};

type SectionHeading = {
    eyebrow: LocalizedText;
    title: LocalizedText;
    titleAccent?: LocalizedText;
    description?: LocalizedText;
};

/* ==========================================================
   Pricing
========================================================== */

type PricingFeature = {
    id: string;
    label: LocalizedText;
};

type PricingPlan = {
    id: string;
    name: LocalizedText;
    websiteLabel: LocalizedText;
    description: LocalizedText;
    icon: string;
    tone: Tone;
    monthlyPrice?: number;
    yearlyPrice?: number;
    popular?: boolean;
    comingSoon?: boolean;
    button: ButtonProps;
    features: PricingFeature[];
};

/* ==========================================================
   Compare Table
========================================================== */

type ComparePlan = {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    icon: string;
    tone: Tone;
    popular?: boolean;
};

type ComparisonRow = {
    id: string;
    label: LocalizedText;
    icon?: string;
    highlight?: 'primary' | 'success';
    free: ComparisonValue;
    starter: ComparisonValue;
    pro: ComparisonValue;
    enterprise: ComparisonValue;
};

type ComparisonGroup = {
    id: string;
    title: LocalizedText;
    icon: string;
    rows: ComparisonRow[];
};

/* ==========================================================
   FAQ
========================================================== */

type FaqCategory = {
    id: string;
    label: LocalizedText;
    icon: string;
};

type FaqItem = {
    id: string;
    categoryId: string;
    question: LocalizedText;
    answer: LocalizedText;
};

type ContactBox = {
    title: LocalizedText;
    description: LocalizedText;
    button: ButtonProps;
};

export interface PricingPage01Props {
    breadcrumbHome?: LocalizedText;
    breadcrumbHomeHref?: string;
    breadcrumbCurrent?: LocalizedText;
    hero?: SectionHeading;
    billing?: {
        note: LocalizedText;
        discountLabel: LocalizedText;
        yearlyLabel: LocalizedText;
        monthlyLabel: LocalizedText;
        defaultType: BillingType;
    };
    pricingPlans?: PricingPlan[];
    comparison?: SectionHeading;
    compareFeatureTitle?: LocalizedText;
    comparePopularLabel?: LocalizedText;
    comparePlans?: ComparePlan[];
    comparisonGroups?: ComparisonGroup[];
    contact?: ContactBox;
    faq?: SectionHeading;
    categories?: FaqCategory[];
    faqs?: FaqItem[];
    sidebarHelp?: {
        title: LocalizedText;
        description: LocalizedText;
        button: ButtonProps;
    };
}

export const DEFAULT_PROPS: Required<PricingPage01Props> = {
    /* ==========================================================
       Breadcrumb
    ========================================================== */

    breadcrumbHome: {
        sourceLocale: 'en',
        default: 'Home',
        translations: {
            vi: 'Trang chủ',
            ja: 'ホーム',
        },
    },

    breadcrumbHomeHref: '/',

    breadcrumbCurrent: {
        sourceLocale: 'en',
        default: 'Pricing',
        translations: {
            vi: 'Bảng giá',
            ja: '料金',
        },
    },

    /* ==========================================================
       Hero
    ========================================================== */

    hero: {
        eyebrow: {
            sourceLocale: 'en',
            default: 'Pricing Plans',
            translations: {
                vi: 'Gói dịch vụ',
                ja: '料金プラン',
            },
        },

        title: {
            sourceLocale: 'en',
            default: 'Flexible Pricing For',
            translations: {
                vi: 'Bảng giá linh hoạt dành cho',
                ja: '柔軟な料金プラン',
            },
        },

        titleAccent: {
            sourceLocale: 'en',
            default: 'Every Business',
            translations: {
                vi: 'Mọi Doanh Nghiệp',
                ja: 'あらゆるビジネス',
            },
        },

        description: {
            sourceLocale: 'en',
            default:
                'Choose the perfect plan to build professional websites with Kbuilder. Upgrade anytime as your business grows.',
            translations: {
                vi: 'Chọn gói phù hợp để xây dựng website chuyên nghiệp với Kbuilder và nâng cấp bất kỳ lúc nào khi doanh nghiệp phát triển.',
                ja: 'KbuilderでプロフェッショナルなWebサイトを構築できる最適なプランを選択し、ビジネスの成長に合わせていつでもアップグレードできます。',
            },
        },
    },

    /* ==========================================================
       Billing
    ========================================================== */

    billing: {
        note: {
            sourceLocale: 'en',
            default: 'No contracts. Cancel anytime.',
            translations: {
                vi: 'Không hợp đồng. Hủy bất cứ lúc nào.',
                ja: '契約不要。いつでもキャンセルできます。',
            },
        },

        discountLabel: {
            sourceLocale: 'en',
            default: 'Save 20%',
            translations: {
                vi: 'Tiết kiệm 20%',
                ja: '20%割引',
            },
        },

        monthlyLabel: {
            sourceLocale: 'en',
            default: 'Monthly',
            translations: {
                vi: 'Theo tháng',
                ja: '月額',
            },
        },

        yearlyLabel: {
            sourceLocale: 'en',
            default: 'Yearly',
            translations: {
                vi: 'Theo năm',
                ja: '年額',
            },
        },

        defaultType: 'monthly',
    },

    /* ==========================================================
       Pricing Plans
    ========================================================== */

    pricingPlans: [
        {
            id: 'starter',

            name: {
                sourceLocale: 'en',
                default: 'Starter',
                translations: {
                    vi: 'Khởi đầu',
                    ja: 'スターター',
                },
            },

            websiteLabel: {
                sourceLocale: 'en',
                default: '1 Website',
                translations: {
                    vi: '1 Website',
                    ja: '1サイト',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Perfect for personal websites and small businesses.',
                translations: {
                    vi: 'Lý tưởng cho website cá nhân và doanh nghiệp nhỏ.',
                    ja: '個人サイトや小規模ビジネスに最適です。',
                },
            },

            icon: 'bi bi-stars',

            tone: 'green',

            monthlyPrice: 9,

            yearlyPrice: 86,

            button: {
                label: {
                    sourceLocale: 'en',
                    default: 'Get Started',
                    translations: {
                        vi: 'Bắt đầu',
                        ja: '始める',
                    },
                },

                href: '/register',

                target: '_self',
            },

            features: [
                {
                    id: 'f1',
                    label: {
                        sourceLocale: 'en',
                        default: '1 Website',
                        translations: {
                            vi: '1 Website',
                            ja: '1サイト',
                        },
                    },
                },
                {
                    id: 'f2',
                    label: {
                        sourceLocale: 'en',
                        default: 'Unlimited Pages',
                        translations: {
                            vi: 'Không giới hạn trang',
                            ja: '無制限ページ',
                        },
                    },
                },
                {
                    id: 'f3',
                    label: {
                        sourceLocale: 'en',
                        default: 'Responsive Templates',
                        translations: {
                            vi: 'Template Responsive',
                            ja: 'レスポンシブテンプレート',
                        },
                    },
                },
                {
                    id: 'f4',
                    label: {
                        sourceLocale: 'en',
                        default: 'Visual Drag & Drop Builder',
                        translations: {
                            vi: 'Trình kéo thả trực quan',
                            ja: 'ドラッグ＆ドロップビルダー',
                        },
                    },
                },
                {
                    id: 'f5',
                    label: {
                        sourceLocale: 'en',
                        default: 'Free SSL Certificate',
                        translations: {
                            vi: 'SSL miễn phí',
                            ja: '無料SSL',
                        },
                    },
                },
                {
                    id: 'f6',
                    label: {
                        sourceLocale: 'en',
                        default: 'Custom Domain',
                        translations: {
                            vi: 'Tên miền riêng',
                            ja: '独自ドメイン',
                        },
                    },
                },
            ],
        },

        {
            id: 'professional',

            name: {
                sourceLocale: 'en',
                default: 'Professional',
                translations: {
                    vi: 'Chuyên nghiệp',
                    ja: 'プロフェッショナル',
                },
            },

            websiteLabel: {
                sourceLocale: 'en',
                default: '5 Websites',
                translations: {
                    vi: '5 Website',
                    ja: '5サイト',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Best choice for agencies and growing businesses.',
                translations: {
                    vi: 'Lựa chọn tốt nhất cho doanh nghiệp đang phát triển.',
                    ja: '成長中のビジネスや代理店に最適です。',
                },
            },

            icon: 'bi bi-lightning-charge-fill',

            tone: 'blue',

            monthlyPrice: 19,

            yearlyPrice: 182,

            popular: true,

            button: {
                label: {
                    sourceLocale: 'en',
                    default: 'Start Free',
                    translations: {
                        vi: 'Dùng thử',
                        ja: '無料で始める',
                    },
                },

                href: '/register',

                target: '_self',
            },

            features: [
                {
                    id: 'f1',
                    label: {
                        sourceLocale: 'en',
                        default: '5 Websites',
                        translations: {
                            vi: '5 Website',
                            ja: '5サイト',
                        },
                    },
                },
                {
                    id: 'f2',
                    label: {
                        sourceLocale: 'en',
                        default: 'Unlimited Pages',
                        translations: {
                            vi: 'Không giới hạn trang',
                            ja: '無制限ページ',
                        },
                    },
                },
                {
                    id: 'f3',
                    label: {
                        sourceLocale: 'en',
                        default: 'Premium Templates',
                        translations: {
                            vi: 'Template cao cấp',
                            ja: 'プレミアムテンプレート',
                        },
                    },
                },
                {
                    id: 'f4',
                    label: {
                        sourceLocale: 'en',
                        default: 'Advanced SEO',
                        translations: {
                            vi: 'SEO nâng cao',
                            ja: '高度なSEO',
                        },
                    },
                },
                {
                    id: 'f5',
                    label: {
                        sourceLocale: 'en',
                        default: 'Analytics Dashboard',
                        translations: {
                            vi: 'Thống kê Analytics',
                            ja: '分析ダッシュボード',
                        },
                    },
                },
                {
                    id: 'f6',
                    label: {
                        sourceLocale: 'en',
                        default: 'Priority Support',
                        translations: {
                            vi: 'Hỗ trợ ưu tiên',
                            ja: '優先サポート',
                        },
                    },
                },
            ],
        },

        {
            id: 'business',

            name: {
                sourceLocale: 'en',
                default: 'Business',
                translations: {
                    vi: 'Doanh nghiệp',
                    ja: 'ビジネス',
                },
            },

            websiteLabel: {
                sourceLocale: 'en',
                default: '15 Websites',
                translations: {
                    vi: '15 Website',
                    ja: '15サイト',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Everything you need to manage multiple brands.',
                translations: {
                    vi: 'Đầy đủ tính năng để quản lý nhiều thương hiệu.',
                    ja: '複数ブランドを管理するためのすべての機能。',
                },
            },

            icon: 'bi bi-building',

            tone: 'purple',

            monthlyPrice: 39,

            yearlyPrice: 374,

            button: {
                label: {
                    sourceLocale: 'en',
                    default: 'Choose Plan',
                    translations: {
                        vi: 'Chọn gói',
                        ja: 'プランを選択',
                    },
                },

                href: '/register',

                target: '_self',
            },

            features: [
                {
                    id: 'f1',
                    label: {
                        sourceLocale: 'en',
                        default: '15 Websites',
                        translations: {
                            vi: '15 Website',
                            ja: '15サイト',
                        },
                    },
                },
                {
                    id: 'f2',
                    label: {
                        sourceLocale: 'en',
                        default: 'Unlimited Storage',
                        translations: {
                            vi: 'Dung lượng không giới hạn',
                            ja: '無制限ストレージ',
                        },
                    },
                },
                {
                    id: 'f3',
                    label: {
                        sourceLocale: 'en',
                        default: 'Team Collaboration',
                        translations: {
                            vi: 'Làm việc nhóm',
                            ja: 'チームコラボレーション',
                        },
                    },
                },
                {
                    id: 'f4',
                    label: {
                        sourceLocale: 'en',
                        default: 'Automation Workflow',
                        translations: {
                            vi: 'Tự động hóa',
                            ja: '自動化ワークフロー',
                        },
                    },
                },
                {
                    id: 'f5',
                    label: {
                        sourceLocale: 'en',
                        default: 'Priority Hosting',
                        translations: {
                            vi: 'Hosting ưu tiên',
                            ja: '高速ホスティング',
                        },
                    },
                },
                {
                    id: 'f6',
                    label: {
                        sourceLocale: 'en',
                        default: '24/7 Support',
                        translations: {
                            vi: 'Hỗ trợ 24/7',
                            ja: '24時間365日サポート',
                        },
                    },
                },
            ],
        },

        {
            id: 'enterprise',

            name: {
                sourceLocale: 'en',
                default: 'Enterprise',
                translations: {
                    vi: 'Doanh nghiệp lớn',
                    ja: 'エンタープライズ',
                },
            },

            websiteLabel: {
                sourceLocale: 'en',
                default: 'Unlimited Websites',
                translations: {
                    vi: 'Không giới hạn Website',
                    ja: '無制限サイト',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Custom solutions built for large organizations.',
                translations: {
                    vi: 'Giải pháp tùy chỉnh dành cho doanh nghiệp lớn.',
                    ja: '大規模企業向けのカスタムソリューション。',
                },
            },

            icon: 'bi bi-gem',

            tone: 'orange',

            comingSoon: true,

            button: {
                label: {
                    sourceLocale: 'en',
                    default: 'Contact Sales',
                    translations: {
                        vi: 'Liên hệ',
                        ja: 'お問い合わせ',
                    },
                },

                href: '/contact',

                target: '_self',
            },

            features: [
                {
                    id: 'f1',
                    label: {
                        sourceLocale: 'en',
                        default: 'Unlimited Websites',
                        translations: {
                            vi: 'Website không giới hạn',
                            ja: '無制限サイト',
                        },
                    },
                },
                {
                    id: 'f2',
                    label: {
                        sourceLocale: 'en',
                        default: 'Dedicated Infrastructure',
                        translations: {
                            vi: 'Máy chủ riêng',
                            ja: '専用インフラ',
                        },
                    },
                },
                {
                    id: 'f3',
                    label: {
                        sourceLocale: 'en',
                        default: 'Enterprise Security',
                        translations: {
                            vi: 'Bảo mật doanh nghiệp',
                            ja: '企業向けセキュリティ',
                        },
                    },
                },
                {
                    id: 'f4',
                    label: {
                        sourceLocale: 'en',
                        default: 'Custom Development',
                        translations: {
                            vi: 'Phát triển theo yêu cầu',
                            ja: 'カスタム開発',
                        },
                    },
                },
                {
                    id: 'f5',
                    label: {
                        sourceLocale: 'en',
                        default: 'Dedicated Account Manager',
                        translations: {
                            vi: 'Quản lý tài khoản riêng',
                            ja: '専任アカウントマネージャー',
                        },
                    },
                },
                {
                    id: 'f6',
                    label: {
                        sourceLocale: 'en',
                        default: 'Premium Support',
                        translations: {
                            vi: 'Hỗ trợ cao cấp',
                            ja: 'プレミアムサポート',
                        },
                    },
                },
            ],
        },
    ],

    /* ==========================================================
       Comparison
    ========================================================== */

    comparison: {
        eyebrow: {
            sourceLocale: 'en',
            default: 'Feature Comparison',
            translations: {
                vi: 'So sánh tính năng',
                ja: '機能比較',
            },
        },

        title: {
            sourceLocale: 'en',
            default: 'Compare Every',
            translations: {
                vi: 'So sánh mọi',
                ja: 'すべての',
            },
        },

        titleAccent: {
            sourceLocale: 'en',
            default: 'Plan',
            translations: {
                vi: 'Gói dịch vụ',
                ja: 'プラン',
            },
        },

        description: {
            sourceLocale: 'en',
            default:
                'Quickly compare features and choose the plan that best matches your business.',
            translations: {
                vi: 'So sánh nhanh các tính năng để lựa chọn gói phù hợp nhất.',
                ja: '機能を比較して最適なプランを選択しましょう。',
            },
        },
    },

    compareFeatureTitle: {
        sourceLocale: 'en',
        default: 'Features',
        translations: {
            vi: 'Tính năng',
            ja: '機能',
        },
    },

    comparePopularLabel: {
        sourceLocale: 'en',
        default: 'Most Popular',
        translations: {
            vi: 'Phổ biến nhất',
            ja: '人気',
        },
    },

    comparePlans: [
        {
            id: 'starter',

            name: {
                sourceLocale: 'en',
                default: 'Starter',
                translations: {
                    vi: 'Khởi đầu',
                    ja: 'スターター',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Personal',
                translations: {
                    vi: 'Cá nhân',
                    ja: '個人',
                },
            },

            icon: 'bi bi-stars',

            tone: 'green',
        },

        {
            id: 'professional',

            name: {
                sourceLocale: 'en',
                default: 'Professional',
                translations: {
                    vi: 'Chuyên nghiệp',
                    ja: 'プロ',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Best Value',
                translations: {
                    vi: 'Khuyên dùng',
                    ja: 'おすすめ',
                },
            },

            icon: 'bi bi-lightning-charge-fill',

            tone: 'blue',

            popular: true,
        },

        {
            id: 'business',

            name: {
                sourceLocale: 'en',
                default: 'Business',
                translations: {
                    vi: 'Doanh nghiệp',
                    ja: 'ビジネス',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Growing Teams',
                translations: {
                    vi: 'Đội nhóm',
                    ja: 'チーム',
                },
            },

            icon: 'bi bi-building',

            tone: 'purple',
        },

        {
            id: 'enterprise',

            name: {
                sourceLocale: 'en',
                default: 'Enterprise',
                translations: {
                    vi: 'Doanh nghiệp lớn',
                    ja: 'エンタープライズ',
                },
            },

            description: {
                sourceLocale: 'en',
                default: 'Custom',
                translations: {
                    vi: 'Tùy chỉnh',
                    ja: 'カスタム',
                },
            },

            icon: 'bi bi-gem',

            tone: 'orange',
        },
    ],

    comparisonGroups: [
        {
            id: 'website',

            title: {
                sourceLocale: 'en',
                default: 'Website Builder',
                translations: {
                    vi: 'Website Builder',
                    ja: 'Webサイトビルダー',
                },
            },

            icon: 'bi bi-window-stack',

            rows: [
                {
                    id: 'websites',

                    label: {
                        sourceLocale: 'en',
                        default: 'Websites',
                        translations: {
                            vi: 'Số Website',
                            ja: 'サイト数',
                        },
                    },

                    free: '1',
                    starter: '5',
                    pro: '15',
                    enterprise: 'Unlimited',
                },

                {
                    id: 'pages',

                    label: {
                        sourceLocale: 'en',
                        default: 'Unlimited Pages',
                        translations: {
                            vi: 'Không giới hạn trang',
                            ja: '無制限ページ',
                        },
                    },

                    highlight: 'primary',

                    free: true,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },

                {
                    id: 'templates',

                    label: {
                        sourceLocale: 'en',
                        default: 'Premium Templates',
                        translations: {
                            vi: 'Template cao cấp',
                            ja: 'プレミアムテンプレート',
                        },
                    },

                    free: false,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },

                {
                    id: 'drag',

                    label: {
                        sourceLocale: 'en',
                        default: 'Drag & Drop Builder',
                        translations: {
                            vi: 'Kéo thả trực quan',
                            ja: 'ドラッグ＆ドロップ',
                        },
                    },

                    free: true,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },
            ],
        },

        {
            id: 'hosting',

            title: {
                sourceLocale: 'en',
                default: 'Hosting & Security',
                translations: {
                    vi: 'Hosting & Bảo mật',
                    ja: 'ホスティング',
                },
            },

            icon: 'bi bi-shield-lock',

            rows: [
                {
                    id: 'ssl',

                    label: {
                        sourceLocale: 'en',
                        default: 'Free SSL',
                        translations: {
                            vi: 'SSL miễn phí',
                            ja: '無料SSL',
                        },
                    },

                    free: true,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },

                {
                    id: 'cdn',

                    label: {
                        sourceLocale: 'en',
                        default: 'Global CDN',
                        translations: {
                            vi: 'CDN toàn cầu',
                            ja: 'グローバルCDN',
                        },
                    },

                    free: false,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },

                {
                    id: 'backup',

                    label: {
                        sourceLocale: 'en',
                        default: 'Automatic Backup',
                        translations: {
                            vi: 'Sao lưu tự động',
                            ja: '自動バックアップ',
                        },
                    },

                    free: false,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },

                {
                    id: 'security',

                    label: {
                        sourceLocale: 'en',
                        default: 'Enterprise Security',
                        translations: {
                            vi: 'Bảo mật doanh nghiệp',
                            ja: '企業向けセキュリティ',
                        },
                    },

                    free: false,
                    starter: false,
                    pro: true,
                    enterprise: true,
                },
            ],
        },

        {
            id: 'support',

            title: {
                sourceLocale: 'en',
                default: 'Support',
                translations: {
                    vi: 'Hỗ trợ',
                    ja: 'サポート',
                },
            },

            icon: 'bi bi-headset',

            rows: [
                {
                    id: 'email',

                    label: {
                        sourceLocale: 'en',
                        default: 'Email Support',
                        translations: {
                            vi: 'Hỗ trợ Email',
                            ja: 'メールサポート',
                        },
                    },

                    free: true,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },

                {
                    id: 'priority',

                    label: {
                        sourceLocale: 'en',
                        default: 'Priority Support',
                        translations: {
                            vi: 'Ưu tiên hỗ trợ',
                            ja: '優先サポート',
                        },
                    },

                    free: false,
                    starter: true,
                    pro: true,
                    enterprise: true,
                },

                {
                    id: 'manager',

                    label: {
                        sourceLocale: 'en',
                        default: 'Dedicated Manager',
                        translations: {
                            vi: 'Quản lý riêng',
                            ja: '専任マネージャー',
                        },
                    },

                    free: false,
                    starter: false,
                    pro: false,
                    enterprise: true,
                },
            ],
        },
    ],
    /* ==========================================================
       Contact
    ========================================================== */

    contact: {
        title: {
            sourceLocale: 'en',
            default: 'Need a Custom Solution?',
            translations: {
                vi: 'Cần giải pháp riêng?',
                ja: 'カスタムソリューションが必要ですか？',
            },
        },

        description: {
            sourceLocale: 'en',
            default:
                'Our team can help you choose the right plan or build a custom solution tailored to your business.',
            translations: {
                vi: 'Đội ngũ của chúng tôi sẽ giúp bạn lựa chọn gói phù hợp hoặc xây dựng giải pháp riêng cho doanh nghiệp.',
                ja: 'お客様のビジネスに最適なプランやカスタムソリューションをご提案します。',
            },
        },

        button: {
            label: {
                sourceLocale: 'en',
                default: 'Contact Sales',
                translations: {
                    vi: 'Liên hệ tư vấn',
                    ja: '営業に問い合わせる',
                },
            },

            href: '/contact',

            target: '_self',
        },
    },

    /* ==========================================================
       FAQ
    ========================================================== */

    faq: {
        eyebrow: {
            sourceLocale: 'en',
            default: 'Frequently Asked Questions',
            translations: {
                vi: 'Câu hỏi thường gặp',
                ja: 'よくある質問',
            },
        },

        title: {
            sourceLocale: 'en',
            default: 'Everything You',
            translations: {
                vi: 'Mọi điều bạn',
                ja: '知っておきたい',
            },
        },

        titleAccent: {
            sourceLocale: 'en',
            default: 'Need To Know',
            translations: {
                vi: 'Cần Biết',
                ja: '情報',
            },
        },

        description: {
            sourceLocale: 'en',
            default:
                'Find answers to the most common questions about pricing, billing and platform features.',
            translations: {
                vi: 'Tìm câu trả lời cho những câu hỏi phổ biến nhất về bảng giá và nền tảng.',
                ja: '料金やプラットフォームに関するよくある質問をご確認ください。',
            },
        },
    },

    categories: [
        {
            id: 'general',

            label: {
                sourceLocale: 'en',
                default: 'General',
                translations: {
                    vi: 'Chung',
                    ja: '一般',
                },
            },

            icon: 'bi bi-grid',
        },

        {
            id: 'billing',

            label: {
                sourceLocale: 'en',
                default: 'Billing',
                translations: {
                    vi: 'Thanh toán',
                    ja: '請求',
                },
            },

            icon: 'bi bi-credit-card',
        },

        {
            id: 'support',

            label: {
                sourceLocale: 'en',
                default: 'Support',
                translations: {
                    vi: 'Hỗ trợ',
                    ja: 'サポート',
                },
            },

            icon: 'bi bi-headset',
        },
    ],

    faqs: [
        {
            id: 'faq-1',

            categoryId: 'general',

            question: {
                sourceLocale: 'en',
                default: 'Can I upgrade my plan later?',
                translations: {
                    vi: 'Tôi có thể nâng cấp gói sau này không?',
                    ja: '後でプランをアップグレードできますか？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default: 'Yes. You can upgrade or downgrade your subscription at any time.',
                translations: {
                    vi: 'Có. Bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào.',
                    ja: 'はい。いつでもプランを変更できます。',
                },
            },
        },

        {
            id: 'faq-2',

            categoryId: 'general',

            question: {
                sourceLocale: 'en',
                default: 'Do I need coding knowledge?',
                translations: {
                    vi: 'Tôi có cần biết lập trình không?',
                    ja: 'プログラミング知識は必要ですか？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default: 'No. Kbuilder provides a visual drag-and-drop editor for everyone.',
                translations: {
                    vi: 'Không. Kbuilder cung cấp trình chỉnh sửa kéo thả trực quan.',
                    ja: 'いいえ。ドラッグ＆ドロップで簡単に作成できます。',
                },
            },
        },

        {
            id: 'faq-3',

            categoryId: 'general',

            question: {
                sourceLocale: 'en',
                default: 'Can I use my own domain?',
                translations: {
                    vi: 'Tôi có thể dùng tên miền riêng không?',
                    ja: '独自ドメインは利用できますか？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default: 'Yes. Every paid plan supports custom domains.',
                translations: {
                    vi: 'Có. Tất cả gói trả phí đều hỗ trợ tên miền riêng.',
                    ja: 'はい。有料プランでは独自ドメインを利用できます。',
                },
            },
        },

        {
            id: 'faq-4',

            categoryId: 'billing',

            question: {
                sourceLocale: 'en',
                default: 'Can I cancel anytime?',
                translations: {
                    vi: 'Tôi có thể hủy bất cứ lúc nào?',
                    ja: 'いつでも解約できますか？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default: 'Yes. There are no long-term contracts.',
                translations: {
                    vi: 'Có. Không có hợp đồng dài hạn.',
                    ja: 'はい。長期契約はありません。',
                },
            },
        },

        {
            id: 'faq-5',

            categoryId: 'billing',

            question: {
                sourceLocale: 'en',
                default: 'Do yearly plans include discounts?',
                translations: {
                    vi: 'Thanh toán năm có được giảm giá?',
                    ja: '年間プランは割引がありますか？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default: 'Yes. Annual billing saves up to 20% compared with monthly billing.',
                translations: {
                    vi: 'Có. Thanh toán năm giúp tiết kiệm tới 20%.',
                    ja: 'はい。年間契約で最大20%お得になります。',
                },
            },
        },

        {
            id: 'faq-6',

            categoryId: 'billing',

            question: {
                sourceLocale: 'en',
                default: 'Which payment methods are supported?',
                translations: {
                    vi: 'Hỗ trợ những phương thức thanh toán nào?',
                    ja: '利用可能な支払い方法は？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default: 'We support major credit cards and other popular payment methods.',
                translations: {
                    vi: 'Chúng tôi hỗ trợ thẻ tín dụng và nhiều phương thức phổ biến.',
                    ja: '主要なクレジットカードなどに対応しています。',
                },
            },
        },

        {
            id: 'faq-7',

            categoryId: 'support',

            question: {
                sourceLocale: 'en',
                default: 'Is technical support included?',
                translations: {
                    vi: 'Có hỗ trợ kỹ thuật không?',
                    ja: '技術サポートは含まれますか？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default:
                    'Yes. Every plan includes customer support, with priority support on higher tiers.',
                translations: {
                    vi: 'Có. Tất cả các gói đều có hỗ trợ khách hàng.',
                    ja: 'はい。すべてのプランにサポートが含まれます。',
                },
            },
        },

        {
            id: 'faq-8',

            categoryId: 'support',

            question: {
                sourceLocale: 'en',
                default: 'Can I migrate an existing website?',
                translations: {
                    vi: 'Có thể chuyển website hiện có sang không?',
                    ja: '既存サイトを移行できますか？',
                },
            },

            answer: {
                sourceLocale: 'en',
                default: 'Absolutely. Our team can help migrate your existing website.',
                translations: {
                    vi: 'Hoàn toàn có thể. Chúng tôi sẽ hỗ trợ bạn chuyển dữ liệu.',
                    ja: 'もちろんです。既存サイトの移行をサポートします。',
                },
            },
        },
    ],

    /* ==========================================================
       Sidebar Help
    ========================================================== */

    sidebarHelp: {
        title: {
            sourceLocale: 'en',
            default: 'Still Need Help?',
            translations: {
                vi: 'Vẫn cần hỗ trợ?',
                ja: 'さらにサポートが必要ですか？',
            },
        },

        description: {
            sourceLocale: 'en',
            default:
                'Our specialists are ready to help you choose the best solution for your business.',
            translations: {
                vi: 'Đội ngũ chuyên gia luôn sẵn sàng tư vấn giải pháp phù hợp nhất.',
                ja: '最適なプラン選びを専門スタッフがお手伝いします。',
            },
        },

        button: {
            label: {
                sourceLocale: 'en',
                default: 'Contact Support',
                translations: {
                    vi: 'Liên hệ hỗ trợ',
                    ja: 'サポートへ連絡',
                },
            },

            href: '/contact',

            target: '_self',
        },
    },
};

type PlanKey = 'free' | 'starter' | 'pro' | 'enterprise';

const PLAN_KEYS: PlanKey[] = ['free', 'starter', 'pro', 'enterprise'];

function ComparisonCell({
    value,
    highlight,
}: {
    value: ComparisonValue;
    highlight?: ComparisonRow['highlight'];
}) {
    if (typeof value === 'boolean') {
        return value ? (
            <span className={styles.available}>
                <i className="bi bi-check-lg" />
            </span>
        ) : (
            <span className={styles.unavailable}>—</span>
        );
    }

    return (
        <span
            className={[
                styles.cellText,
                highlight === 'primary' && styles.primaryText,
                highlight === 'success' && styles.successText,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {value}
        </span>
    );
}

export function PricingPage01(props: PricingPage01Props) {
    const mergedProps: Required<PricingPage01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        breadcrumbHome,
        breadcrumbHomeHref,
        breadcrumbCurrent,
        hero,
        billing,
        pricingPlans,
        comparison,
        compareFeatureTitle,
        comparePopularLabel,
        comparePlans,
        comparisonGroups,
        contact,
        faq,
        categories,
        faqs,
        sidebarHelp,
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

    const [activeCategory, setActiveCategory] = React.useState('general');
    const [openFaqId, setOpenFaqId] = React.useState<string | null>(null);

    const PLANS =
        comparePlans?.map((plan) => ({
            name: t(plan.name),
            description: t(plan.description),
            icon: plan.icon,
            tone: plan.tone,
            popular: plan.popular,
        })) ?? [];

    const COMPARISON_GROUPS: ComparisonGroup[] = comparisonGroups ?? [];

    const PRICING_PLANS: PricingPlan[] = pricingPlans ?? [];

    const FAQ_CATEGORIES: FaqCategory[] = categories ?? [];

    const FAQ_ITEMS: FaqItem[] = faqs ?? [];

    const filteredFaqs = React.useMemo(() => {
        return FAQ_ITEMS.filter((item) => item.categoryId === activeCategory);
    }, [FAQ_ITEMS, activeCategory]);

    useEffect(() => {
        if (filteredFaqs.length > 0) {
            setOpenFaqId(filteredFaqs[0].id);
        } else {
            setOpenFaqId(null);
        }
    }, [filteredFaqs]);

    const toggleFaq = React.useCallback((id: string) => {
        setOpenFaqId((currentId) => (currentId === id ? null : id));
    }, []);

    return (
        <>
            <div className={styles.headingSection}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href={breadcrumbHomeHref ?? '/'} className={styles.breadcrumbItem}>
                        {t(breadcrumbHome)}
                    </Link>

                    <i className="bi bi-chevron-right" />

                    <span className={styles.breadcrumbCurrent}>{t(breadcrumbCurrent)}</span>
                </nav>
            </div>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.heading}>
                        <div className={styles.headingContent}>
                            <span className={styles.eyebrow}>
                                <i className="bi bi-bag-check" />
                                {t(hero.eyebrow)}
                            </span>

                            <h2>
                                {t(hero.title)}

                                {hero.titleAccent && (
                                    <>
                                        {' '}
                                        <span className={styles.titleAccent}>
                                            {t(hero.titleAccent)}
                                        </span>
                                    </>
                                )}
                            </h2>

                            {hero.description && (
                                <p className={styles.description}>{t(hero.description)}</p>
                            )}
                        </div>

                        <div className={styles.headingActions}>
                            <p>{t(billing.note)}</p>

                            <div className={styles.billing}>
                                <span className={styles.discount}>{t(billing.discountLabel)}</span>

                                <span className={styles.activeBilling}>
                                    {t(billing.yearlyLabel)}
                                </span>

                                <button
                                    type="button"
                                    className={styles.billingToggle}
                                    aria-label="Change billing period"
                                >
                                    <span />
                                </button>

                                <span>{t(billing.monthlyLabel)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.pricingGrid}>
                        {PRICING_PLANS.map((plan) => (
                            <PricingCard key={plan.id} plan={plan} t={t} />
                        ))}
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.backgroundGlow} />

                <div className={styles.container}>
                    <header className={styles.heading}>
                        <div className={styles.headingContent}>
                            <span className={styles.eyebrow}>
                                <i className="bi bi-bag-check" />
                                {t(comparison.eyebrow)}
                            </span>

                            <h2 className={styles.title}>
                                {t(comparison.title)}

                                {comparison.titleAccent && (
                                    <>
                                        {' '}
                                        <span className={styles.titleAccent}>
                                            {t(comparison.titleAccent)}
                                        </span>
                                    </>
                                )}
                            </h2>

                            {comparison.description && (
                                <p className={styles.description}>{t(comparison.description)}</p>
                            )}
                        </div>
                    </header>

                    <div className={styles.tableCard}>
                        <div className={styles.tableScroll}>
                            <div className={styles.comparisonTable}>
                                <div className={styles.planHeader}>
                                    <div className={styles.featureHeader}>
                                        <span className={styles.featureHeaderIcon}>
                                            <i className="bi bi-stars" />
                                        </span>

                                        <span>{t(compareFeatureTitle)}</span>
                                    </div>

                                    {PLANS.map((plan) => (
                                        <div
                                            key={plan.name}
                                            className={`${styles.plan} ${styles[plan.tone]}`}
                                        >
                                            {plan.popular && (
                                                <span className={styles.popularBadge}>
                                                    {t(comparePopularLabel)}
                                                </span>
                                            )}

                                            <span className={styles.planIcon}>
                                                <i className={`bi ${plan.icon}`} />
                                            </span>

                                            <strong>{plan.name}</strong>

                                            <span className={styles.planDescription}>
                                                {plan.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {COMPARISON_GROUPS.map((group) => (
                                    <div key={group.id} className={styles.comparisonGroup}>
                                        <div className={styles.groupHeader}>
                                            <div className={styles.groupTitle}>
                                                <i className={`bi ${group.icon}`} />
                                                <strong>{t(group.title)}</strong>
                                            </div>

                                            {PLANS.map((plan) => (
                                                <span
                                                    key={plan.name}
                                                    className={styles.groupPlanName}
                                                >
                                                    {plan.name}
                                                </span>
                                            ))}
                                        </div>

                                        {group.rows.map((row) => (
                                            <div key={row.id} className={styles.comparisonRow}>
                                                <div className={styles.featureName}>
                                                    {row.icon && <i className={`bi ${row.icon}`} />}

                                                    <span>{t(row.label)}</span>

                                                    <i
                                                        className={`bi bi-info-circle ${styles.infoIcon}`}
                                                    />
                                                </div>

                                                {PLAN_KEYS.map((key) => (
                                                    <div
                                                        key={key}
                                                        className={styles.comparisonCell}
                                                    >
                                                        <ComparisonCell
                                                            value={row[key]}
                                                            highlight={row.highlight}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <footer className={styles.contactFooter}>
                            <div className={styles.contactContent}>
                                <span className={styles.contactIcon}>
                                    <i className="bi bi-stars" />
                                </span>

                                <div>
                                    <strong>{t(contact.title)}</strong>

                                    <p>{t(contact.description)}</p>
                                </div>
                            </div>

                            <Link
                                href={contact.button.href ?? '#'}
                                target={contact.button.target}
                                className={styles.contactButton}
                            >
                                <span>{t(contact.button.label)}</span>

                                <i className="bi bi-arrow-right" />
                            </Link>
                        </footer>
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.glow} />

                <div className={styles.container}>
                    <header className={styles.heading}>
                        <div className={styles.headingContent}>
                            <span className={styles.eyebrow}>
                                <i className="bi bi-question-circle" />
                                {t(faq.eyebrow)}
                            </span>

                            <h2 className={styles.title}>
                                {t(faq.title)}

                                {faq.titleAccent && (
                                    <>
                                        {' '}
                                        <span className={styles.titleAccent}>
                                            {t(faq.titleAccent)}
                                        </span>
                                    </>
                                )}
                            </h2>

                            {faq.description && (
                                <p className={styles.description}>{t(faq.description)}</p>
                            )}
                        </div>
                    </header>

                    <div className={styles.faqLayout}>
                        <aside className={styles.categories}>
                            <div className={styles.categoryList}>
                                {FAQ_CATEGORIES.map((category) => {
                                    const isActive = activeCategory === category.id;

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            className={`${styles.categoryButton} ${
                                                isActive ? styles.categoryButtonActive : ''
                                            }`}
                                            onClick={() => setActiveCategory(category.id)}
                                        >
                                            <span className={styles.categoryIcon}>
                                                <i className={`bi ${category.icon}`} />
                                            </span>

                                            <span>{t(category.label)}</span>

                                            <i
                                                className={`bi bi-arrow-right-short ${styles.categoryArrow}`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.sidebarHelp}>
                                <span className={styles.sidebarHelpIcon}>
                                    <i className="bi bi-headset" />
                                </span>

                                <div>
                                    <strong>{t(sidebarHelp.title)}</strong>

                                    <p>{t(sidebarHelp.description)}</p>
                                </div>

                                <Link
                                    href={sidebarHelp.button.href ?? '#'}
                                    target={sidebarHelp.button.target}
                                >
                                    {t(sidebarHelp.button.label)}
                                    <i className="bi bi-arrow-right" />
                                </Link>
                            </div>
                        </aside>

                        <div className={styles.faqPanel}>
                            <div className={styles.faqList}>
                                {filteredFaqs.map((item) => {
                                    const isOpen = openFaqId === item.id;

                                    return (
                                        <article
                                            key={item.id}
                                            className={`${styles.faqItem} ${
                                                isOpen ? styles.faqItemOpen : ''
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                className={styles.faqQuestion}
                                                onClick={() => toggleFaq(item.id)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{t(item.question)}</span>

                                                <span className={styles.faqToggle}>
                                                    <i
                                                        className={`bi ${
                                                            isOpen
                                                                ? 'bi-chevron-up'
                                                                : 'bi-chevron-down'
                                                        }`}
                                                    />
                                                </span>
                                            </button>

                                            <div
                                                className={`${styles.answerGrid} ${
                                                    isOpen ? styles.answerGridOpen : ''
                                                }`}
                                            >
                                                <div className={styles.answerOverflow}>
                                                    <div className={styles.faqAnswer}>
                                                        <p>{t(item.answer)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function PricingCard({ plan, t }: { plan: PricingPlan; t: (value: LocalizedText) => string }) {
    return (
        <article
            className={`${styles.card} ${styles[plan.tone]} ${plan.popular ? styles.popular : ''}`}
        >
            {plan.popular && (
                <div className={styles.popularBadgeTop}>
                    <i className="bi bi-gem" />
                    Most Popular
                </div>
            )}

            <div className={styles.cardBody}>
                <div className={styles.planHeaderTop}>
                    <div className={styles.planIcon}>
                        <i className={`bi ${plan.icon}`} />
                    </div>

                    <div className={styles.planInfo}>
                        <h3>{t(plan.name)}</h3>

                        <span>{t(plan.websiteLabel)}</span>
                    </div>
                </div>

                <div className={styles.priceArea}>
                    {plan.comingSoon ? (
                        <>
                            <strong className={styles.customPrice}>Contact Us</strong>

                            <span className={styles.comingSoon}>Pricing coming soon</span>
                        </>
                    ) : (
                        <div className={styles.price}>
                            <span className={styles.currency}>$</span>

                            <strong>{plan.monthlyPrice}</strong>

                            <span className={styles.period}>/ month</span>
                        </div>
                    )}
                </div>

                <div className={styles.divider} />

                <p className={styles.description}>{t(plan.description)}</p>

                <Link
                    href={plan.button.href ?? '#'}
                    target={plan.button.target}
                    className={styles.planButton}
                >
                    {t(plan.button.label)}
                </Link>

                <ul className={styles.features}>
                    {plan.features.map((feature) => (
                        <li key={feature.id}>
                            <i className="bi bi-check2" />

                            <span>{t(feature.label)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}

function createTextField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextareaField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createNumberField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'number',
    };
}

function createCheckField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'check',
    };
}
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
function createHeroInspector(): InspectorField[] {
    return [
        createTextField('hero.eyebrow', 'Hero Eyebrow'),
        createTextField('hero.title', 'Hero Title'),
        createTextField('hero.titleAccent', 'Hero Title Accent'),
        createTextareaField('hero.description', 'Hero Description'),
    ];
}
function createBillingInspector(): InspectorField[] {
    return [
        createTextareaField('billing.note', 'Billing Note'),

        createTextField('billing.discountLabel', 'Discount Label'),

        createTextField('billing.monthlyLabel', 'Monthly Label'),

        createTextField('billing.yearlyLabel', 'Yearly Label'),
    ];
}

function createContactInspector(): InspectorField[] {
    return [
        createTextField('contact.title', 'Contact Title'),

        createTextareaField('contact.description', 'Contact Description'),

        createTextField('contact.button.label', 'Button Label'),

        createTextField('contact.button.href', 'Button Url'),

        createTextField('contact.button.target', 'Button Target'),
    ];
}

function createSidebarHelpInspector(): InspectorField[] {
    return [
        createTextField('sidebarHelp.title', 'Sidebar Title'),

        createTextareaField('sidebarHelp.description', 'Sidebar Description'),

        createTextField('sidebarHelp.button.label', 'Button Label'),

        createTextField('sidebarHelp.button.href', 'Button Url'),

        createTextField('sidebarHelp.button.target', 'Button Target'),
    ];
}

function createFaqInspector(): InspectorField[] {
    return [
        createTextField('faq.eyebrow', 'FAQ Eyebrow'),

        createTextField('faq.title', 'FAQ Title'),

        createTextField('faq.titleAccent', 'FAQ Title Accent'),

        createTextareaField('faq.description', 'FAQ Description'),
    ];
}

function createCategoriesInspector(): InspectorField[] {
    return Array.from({ length: 3 }, (_, i) => [
        createTextField(`categories.${i}.label`, `Category ${i + 1}`),

        createTextField(`categories.${i}.icon`, `Category ${i + 1} Icon`),
    ]).flat();
}

function createFaqItemsInspector(): InspectorField[] {
    return Array.from({ length: 8 }, (_, i) => [
        createTextField(`faqs.${i}.question`, `FAQ ${i + 1} Question`),

        createTextareaField(`faqs.${i}.answer`, `FAQ ${i + 1} Answer`),

        createTextField(`faqs.${i}.categoryId`, `FAQ ${i + 1} Category`),
    ]).flat();
}

function createPricingPlansInspector(): InspectorField[] {
    return Array.from({ length: 4 }, (_, plan) => {
        const index = plan;

        return [
            createTextField(`pricingPlans.${index}.name`, `Plan ${plan + 1} Name`),

            createTextField(`pricingPlans.${index}.websiteLabel`, `Plan ${plan + 1} Website Label`),

            createTextareaField(
                `pricingPlans.${index}.description`,
                `Plan ${plan + 1} Description`,
            ),

            createTextField(`pricingPlans.${index}.icon`, `Plan ${plan + 1} Icon`),

            createSelectField(`pricingPlans.${index}.tone`, `Plan ${plan + 1} Tone`, [
                {
                    label: 'Green',
                    value: 'green',
                },
                {
                    label: 'Blue',
                    value: 'blue',
                },
                {
                    label: 'Purple',
                    value: 'purple',
                },
                {
                    label: 'Orange',
                    value: 'orange',
                },
            ]),

            createNumberField(
                `pricingPlans.${index}.monthlyPrice`,
                `Plan ${plan + 1} Monthly Price`,
            ),

            createNumberField(`pricingPlans.${index}.yearlyPrice`, `Plan ${plan + 1} Yearly Price`),

            createCheckField(`pricingPlans.${index}.popular`, `Plan ${plan + 1} Popular`),

            createCheckField(`pricingPlans.${index}.comingSoon`, `Plan ${plan + 1} Coming Soon`),

            createTextField(`pricingPlans.${index}.button.label`, `Plan ${plan + 1} Button Label`),

            createTextField(`pricingPlans.${index}.button.href`, `Plan ${plan + 1} Button Href`),

            createSelectField(
                `pricingPlans.${index}.button.target`,
                `Plan ${plan + 1} Button Target`,
                [
                    {
                        label: '_self',
                        value: '_self',
                    },
                    {
                        label: '_blank',
                        value: '_blank',
                    },
                ],
            ),

            ...Array.from({ length: 10 }, (_, feature) =>
                createTextField(
                    `pricingPlans.${index}.features.${feature}.label`,
                    `Plan ${plan + 1} Feature ${feature + 1}`,
                ),
            ),
        ];
    }).flat();
}
function createComparisonInspector(): InspectorField[] {
    return [
        createTextField('comparison.eyebrow', 'Comparison Eyebrow'),

        createTextField('comparison.title', 'Comparison Title'),

        createTextField('comparison.titleAccent', 'Comparison Title Accent'),

        createTextareaField('comparison.description', 'Comparison Description'),

        createTextField('compareFeatureTitle', 'Compare Feature Title'),

        createTextField('comparePopularLabel', 'Compare Popular Label'),
    ];
}
function createComparePlansInspector(): InspectorField[] {
    return Array.from({ length: 4 }, (_, index) => [
        createTextField(`comparePlans.${index}.name`, `Compare Plan ${index + 1} Name`),

        createTextareaField(
            `comparePlans.${index}.description`,
            `Compare Plan ${index + 1} Description`,
        ),

        createTextField(`comparePlans.${index}.icon`, `Compare Plan ${index + 1} Icon`),

        createSelectField(`comparePlans.${index}.tone`, `Compare Plan ${index + 1} Tone`, [
            {
                label: 'Green',
                value: 'green',
            },
            {
                label: 'Blue',
                value: 'blue',
            },
            {
                label: 'Purple',
                value: 'purple',
            },
            {
                label: 'Orange',
                value: 'orange',
            },
        ]),

        createCheckField(`comparePlans.${index}.popular`, `Compare Plan ${index + 1} Popular`),
    ]).flat();
}

function createComparisonGroupsInspector(): InspectorField[] {
    const rowCounts = [4, 4, 3];

    return rowCounts.flatMap((rowCount, groupIndex) => [
        createTextField(`comparisonGroups.${groupIndex}.title`, `Group ${groupIndex + 1} Title`),

        createTextField(`comparisonGroups.${groupIndex}.icon`, `Group ${groupIndex + 1} Icon`),

        ...Array.from({ length: rowCount }, (_, rowIndex) => [
            createTextField(
                `comparisonGroups.${groupIndex}.rows.${rowIndex}.label`,
                `Group ${groupIndex + 1} Row ${rowIndex + 1} Label`,
            ),

            createTextField(
                `comparisonGroups.${groupIndex}.rows.${rowIndex}.icon`,
                `Group ${groupIndex + 1} Row ${rowIndex + 1} Icon`,
            ),

            createSelectField(
                `comparisonGroups.${groupIndex}.rows.${rowIndex}.highlight`,
                `Group ${groupIndex + 1} Row ${rowIndex + 1} Highlight`,
                [
                    {
                        label: 'None',
                        value: '',
                    },
                    {
                        label: 'Primary',
                        value: 'primary',
                    },
                    {
                        label: 'Success',
                        value: 'success',
                    },
                ],
            ),

            createTextField(
                `comparisonGroups.${groupIndex}.rows.${rowIndex}.free`,
                `Group ${groupIndex + 1} Row ${rowIndex + 1} Free`,
            ),

            createTextField(
                `comparisonGroups.${groupIndex}.rows.${rowIndex}.starter`,
                `Group ${groupIndex + 1} Row ${rowIndex + 1} Starter`,
            ),

            createTextField(
                `comparisonGroups.${groupIndex}.rows.${rowIndex}.pro`,
                `Group ${groupIndex + 1} Row ${rowIndex + 1} Pro`,
            ),

            createTextField(
                `comparisonGroups.${groupIndex}.rows.${rowIndex}.enterprise`,
                `Group ${groupIndex + 1} Row ${rowIndex + 1} Enterprise`,
            ),
        ]).flat(),
    ]);
}

function createInspector(): RegItem['inspector'] {
    return [
        ...createHeroInspector(),
        ...createBillingInspector(),

        ...createPricingPlansInspector(),

        ...createComparisonInspector(),
        ...createComparePlansInspector(),
        ...createComparisonGroupsInspector(),

        ...createContactInspector(),

        ...createFaqInspector(),
        ...createCategoriesInspector(),
        ...createSidebarHelpInspector(),
    ];
}

export const PRICING_PAGE_01: RegItem = {
    kind: 'pricing-page-01',
    label: 'Pricing Page 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <PricingPage01 {...(props as PricingPage01Props)} />,
};

export default PricingPage01;
