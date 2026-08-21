'use client';

import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useRef, useState } from 'react';
import styles from '@/components/admin/shared/templates/services/benefits/styles/benefit-service-01.module.css';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export interface BenefitItem {
    id: string;
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
    tags?: LocalizedText[];
    accentColor?: string;
}

export interface BenefitService01Props {
    siteId?: string;
    headline?: LocalizedText;
    headlineAccent?: LocalizedText;
    subheadline?: LocalizedText;
    exploreText?: LocalizedText;
    benefit1Title?: LocalizedText;
    benefit1Description?: LocalizedText;
    benefit1Tag1?: LocalizedText;
    benefit1Tag2?: LocalizedText;
    benefit1Tag3?: LocalizedText;
    benefit2Title?: LocalizedText;
    benefit2Description?: LocalizedText;
    benefit2Tag1?: LocalizedText;
    benefit2Tag2?: LocalizedText;
    benefit2Tag3?: LocalizedText;
    benefit3Title?: LocalizedText;
    benefit3Description?: LocalizedText;
    benefit3Tag1?: LocalizedText;
    benefit3Tag2?: LocalizedText;
    benefit3Tag3?: LocalizedText;
    benefit4Title?: LocalizedText;
    benefit4Description?: LocalizedText;
    benefit4Tag1?: LocalizedText;
    benefit4Tag2?: LocalizedText;
    benefit4Tag3?: LocalizedText;
    benefit5Title?: LocalizedText;
    benefit5Description?: LocalizedText;
    benefit5Tag1?: LocalizedText;
    benefit5Tag2?: LocalizedText;
    benefit5Tag3?: LocalizedText;
    benefit6Title?: LocalizedText;
    benefit6Description?: LocalizedText;
    benefit6Tag1?: LocalizedText;
    benefit6Tag2?: LocalizedText;
    benefit6Tag3?: LocalizedText;
    benefit7Title?: LocalizedText;
    benefit7Description?: LocalizedText;
    benefit7Tag1?: LocalizedText;
    benefit7Tag2?: LocalizedText;
    benefit7Tag3?: LocalizedText;
    benefit8Title?: LocalizedText;
    benefit8Description?: LocalizedText;
    benefit8Tag1?: LocalizedText;
    benefit8Tag2?: LocalizedText;
    benefit8Tag3?: LocalizedText;
    showcaseImage?: string;
    showcaseImageAlt?: LocalizedText;
    floating1Title?: LocalizedText;
    floating1Description?: LocalizedText;
    floating2Title?: LocalizedText;
    floating2Description?: LocalizedText;
    floating3Title?: LocalizedText;
    floating3Description?: LocalizedText;
    showcaseBadge?: LocalizedText;
    showcaseHeadline?: LocalizedText;
    showcaseHeadlineAccent?: LocalizedText;
    feature1Text?: LocalizedText;
    feature2Text?: LocalizedText;
    feature3Text?: LocalizedText;
    feature4Text?: LocalizedText;
    showcaseCtaText?: LocalizedText;
    ctaBadgeText?: LocalizedText;
    ctaText?: LocalizedText;
    ctaHref?: string;
    ctaSubText?: LocalizedText;
    stat1Value?: LocalizedText;
    stat1Label?: LocalizedText;
    stat2Value?: LocalizedText;
    stat2Label?: LocalizedText;
    stat3Value?: LocalizedText;
    stat3Label?: LocalizedText;
    stat4Value?: LocalizedText;
    stat4Label?: LocalizedText;
    layout?: 'grid-2' | 'grid-3' | 'grid-4';
}

export const DEFAULT_PROPS: Required<BenefitService01Props> = {
    siteId: '',

    headline: {
        sourceLocale: 'en',
        default: 'Everything you need to',
        translations: {
            vi: 'Mọi thứ bạn cần để',
            ja: '必要なものがすべて揃っています',
        },
    },

    headlineAccent: {
        sourceLocale: 'en',
        default: 'build & grow online.',
        translations: {
            vi: 'xây dựng và phát triển trực tuyến.',
            ja: 'オンラインで構築・成長。',
        },
    },

    subheadline: {
        sourceLocale: 'en',
        default:
            'Kbuilder gives you the tools, templates, and integrations to launch a professional website fast — without any technical knowledge.',
        translations: {
            vi: 'Kbuilder cung cấp đầy đủ công cụ, giao diện mẫu và tích hợp giúp bạn tạo website chuyên nghiệp nhanh chóng mà không cần kiến thức lập trình.',
            ja: 'Kbuilderは、テンプレート・ツール・各種連携機能を備え、専門知識がなくても素早くプロフェッショナルなWebサイトを公開できます。',
        },
    },

    exploreText: {
        sourceLocale: 'en',
        default: 'Explore All Features',
        translations: {
            vi: 'Khám phá tất cả tính năng',
            ja: 'すべての機能を見る',
        },
    },

    showcaseImage: '/assets/images/service-banner.png',

    showcaseImageAlt: {
        sourceLocale: 'en',
        default: 'Workspace',
        translations: {
            vi: 'Không gian làm việc',
            ja: 'ワークスペース',
        },
    },

    floating1Title: {
        sourceLocale: 'en',
        default: '10-Minute Website',
        translations: {
            vi: 'Website trong 10 phút',
            ja: '10分でWebサイト',
        },
    },

    floating1Description: {
        sourceLocale: 'en',
        default: 'Generate a complete website in minutes.',
        translations: {
            vi: 'Tạo website hoàn chỉnh chỉ trong vài phút.',
            ja: '数分でWebサイトを自動生成。',
        },
    },

    floating2Title: {
        sourceLocale: 'en',
        default: 'Smart Page Builder',
        translations: {
            vi: 'Trình tạo trang thông minh',
            ja: 'スマートページビルダー',
        },
    },

    floating2Description: {
        sourceLocale: 'en',
        default: 'Create pages with reusable sections and templates.',
        translations: {
            vi: 'Tạo trang bằng các section và template có thể tái sử dụng.',
            ja: '再利用可能なセクションとテンプレートでページを作成。',
        },
    },

    floating3Title: {
        sourceLocale: 'en',
        default: 'AI + No-Code',
        translations: {
            vi: 'AI + Không cần lập trình',
            ja: 'AI + ノーコード',
        },
    },

    floating3Description: {
        sourceLocale: 'en',
        default: 'Build, customize and publish without coding.',
        translations: {
            vi: 'Xây dựng, tùy chỉnh và xuất bản mà không cần viết mã.',
            ja: 'コードを書かずに構築・編集・公開。',
        },
    },

    showcaseBadge: {
        sourceLocale: 'en',
        default: 'AI WEBSITE BUILDER',
        translations: {
            vi: 'TRÌNH TẠO WEBSITE AI',
            ja: 'AIウェブサイトビルダー',
        },
    },

    showcaseHeadline: {
        sourceLocale: 'en',
        default: 'Build professional websites',
        translations: {
            vi: 'Xây dựng website chuyên nghiệp',
            ja: 'プロフェッショナルなWebサイトを構築',
        },
    },

    showcaseHeadlineAccent: {
        sourceLocale: 'en',
        default: 'in just 10 minutes',
        translations: {
            vi: 'chỉ trong 10 phút',
            ja: 'わずか10分で',
        },
    },

    feature1Text: {
        sourceLocale: 'en',
        default: 'AI generates complete page structures automatically.',
        translations: {
            vi: 'AI tự động tạo cấu trúc website hoàn chỉnh.',
            ja: 'AIがページ構成を自動生成します。',
        },
    },

    feature2Text: {
        sourceLocale: 'en',
        default: 'Drag & Drop builder with reusable components.',
        translations: {
            vi: 'Trình kéo thả với các component tái sử dụng.',
            ja: 'ドラッグ＆ドロップ対応の再利用可能コンポーネント。',
        },
    },

    feature3Text: {
        sourceLocale: 'en',
        default: 'Landing, Blog, Store, Booking and LMS templates.',
        translations: {
            vi: 'Template Landing, Blog, Cửa hàng, Booking và LMS.',
            ja: 'ランディング・ブログ・ストア・予約・LMSテンプレート。',
        },
    },

    feature4Text: {
        sourceLocale: 'en',
        default: 'Connect your domain and publish with one click.',
        translations: {
            vi: 'Kết nối tên miền và xuất bản chỉ với một cú nhấp.',
            ja: '独自ドメイン接続とワンクリック公開。',
        },
    },

    showcaseCtaText: {
        sourceLocale: 'en',
        default: 'Start Building',
        translations: {
            vi: 'Bắt đầu xây dựng',
            ja: '今すぐ始める',
        },
    },

    ctaBadgeText: {
        sourceLocale: 'en',
        default: 'Ready to get started?',
        translations: {
            vi: 'Sẵn sàng bắt đầu?',
            ja: '始める準備はできましたか？',
        },
    },

    ctaText: {
        sourceLocale: 'en',
        default: 'Start Building Free',
        translations: {
            vi: 'Bắt đầu miễn phí',
            ja: '無料で始める',
        },
    },

    ctaHref: '/contact',

    ctaSubText: {
        sourceLocale: 'en',
        default: 'No credit card required · Setup in 10 minutes',
        translations: {
            vi: 'Không cần thẻ tín dụng · Thiết lập trong 10 phút',
            ja: 'クレジットカード不要・10分でセットアップ',
        },
    },

    stat1Value: {
        sourceLocale: 'en',
        default: '12K+',
        translations: {
            vi: '12K+',
            ja: '12K+',
        },
    },

    stat1Label: {
        sourceLocale: 'en',
        default: 'Active Users',
        translations: {
            vi: 'Người dùng hoạt động',
            ja: 'アクティブユーザー',
        },
    },

    stat2Value: {
        sourceLocale: 'en',
        default: '240K+',
        translations: {
            vi: '240K+',
            ja: '240K+',
        },
    },

    stat2Label: {
        sourceLocale: 'en',
        default: 'Tasks Completed',
        translations: {
            vi: 'Tác vụ hoàn thành',
            ja: '完了したタスク',
        },
    },

    stat3Value: {
        sourceLocale: 'en',
        default: '99.9%',
        translations: {
            vi: '99.9%',
            ja: '99.9%',
        },
    },

    stat3Label: {
        sourceLocale: 'en',
        default: 'Uptime',
        translations: {
            vi: 'Thời gian hoạt động',
            ja: '稼働率',
        },
    },

    stat4Value: {
        sourceLocale: 'en',
        default: '4.9/5',
        translations: {
            vi: '4.9/5',
            ja: '4.9/5',
        },
    },

    stat4Label: {
        sourceLocale: 'en',
        default: 'User Rating',
        translations: {
            vi: 'Đánh giá người dùng',
            ja: 'ユーザー評価',
        },
    },

    layout: 'grid-2',
    // Benefit 1
    benefit1Title: {
        sourceLocale: 'en',
        default: 'Launch in 10 Minutes',
        translations: {
            vi: 'Khởi chạy trong 10 phút',
            ja: '10分で公開',
        },
    },

    benefit1Description: {
        sourceLocale: 'en',
        default:
            'Kbuilder auto-generates a complete website with pages, navigation, and reusable sections. Pick your type, customize, and publish.',
        translations: {
            vi: 'Kbuilder tự động tạo website hoàn chỉnh với trang, menu và các section có thể tái sử dụng. Chọn loại website, tùy chỉnh và xuất bản.',
            ja: 'Kbuilderはページ・ナビゲーション・再利用可能なセクションを含むWebサイトを自動生成します。種類を選び、編集して公開するだけです。',
        },
    },

    benefit1Tag1: {
        sourceLocale: 'en',
        default: 'Landing Page',
        translations: {
            vi: 'Landing Page',
            ja: 'ランディングページ',
        },
    },

    benefit1Tag2: {
        sourceLocale: 'en',
        default: 'Blog',
        translations: {
            vi: 'Blog',
            ja: 'ブログ',
        },
    },

    benefit1Tag3: {
        sourceLocale: 'en',
        default: 'E-commerce',
        translations: {
            vi: 'Thương mại điện tử',
            ja: 'ECサイト',
        },
    },

    // Benefit 2
    benefit2Title: {
        sourceLocale: 'en',
        default: 'Built for Every Business',
        translations: {
            vi: 'Dành cho mọi doanh nghiệp',
            ja: 'あらゆるビジネス向け',
        },
    },

    benefit2Description: {
        sourceLocale: 'en',
        default:
            'Start with professionally designed templates tailored to your business — from booking systems to LMS and online stores.',
        translations: {
            vi: 'Bắt đầu với các template chuyên nghiệp phù hợp cho từng lĩnh vực từ đặt lịch, LMS đến cửa hàng trực tuyến.',
            ja: '予約システム、LMS、オンラインストアなど、業種に合わせたテンプレートから始められます。',
        },
    },

    benefit2Tag1: {
        sourceLocale: 'en',
        default: 'Booking',
        translations: {
            vi: 'Đặt lịch',
            ja: '予約',
        },
    },

    benefit2Tag2: {
        sourceLocale: 'en',
        default: 'LMS',
        translations: {
            vi: 'LMS',
            ja: 'LMS',
        },
    },

    benefit2Tag3: {
        sourceLocale: 'en',
        default: 'Store',
        translations: {
            vi: 'Cửa hàng',
            ja: 'ストア',
        },
    },

    // Benefit 3
    benefit3Title: {
        sourceLocale: 'en',
        default: 'No Coding Required',
        translations: {
            vi: 'Không cần lập trình',
            ja: 'コーディング不要',
        },
    },

    benefit3Description: {
        sourceLocale: 'en',
        default:
            'Create and edit your website visually. Update text, images, layouts, and sections directly on the page without writing a single line of code.',
        translations: {
            vi: 'Thiết kế và chỉnh sửa website trực quan. Thay đổi nội dung, hình ảnh, bố cục và section ngay trên trang mà không cần viết mã.',
            ja: 'コードを書かずに、テキスト・画像・レイアウト・セクションを視覚的に編集できます。',
        },
    },

    benefit3Tag1: {
        sourceLocale: 'en',
        default: 'Visual Editor',
        translations: {
            vi: 'Trình chỉnh sửa trực quan',
            ja: 'ビジュアルエディター',
        },
    },

    benefit3Tag2: {
        sourceLocale: 'en',
        default: 'Drag & Drop',
        translations: {
            vi: 'Kéo & Thả',
            ja: 'ドラッグ＆ドロップ',
        },
    },

    benefit3Tag3: {
        sourceLocale: 'en',
        default: '',
        translations: {
            vi: '',
            ja: '',
        },
    },

    // Benefit 4
    benefit4Title: {
        sourceLocale: 'en',
        default: 'Smart Page Generator',
        translations: {
            vi: 'Trình tạo trang thông minh',
            ja: 'スマートページジェネレーター',
        },
    },

    benefit4Description: {
        sourceLocale: 'en',
        default:
            'Generate complete page structures in minutes — Home, About, Services, Blog, FAQ, Policy, and more. Review, edit or remove at any time.',
        translations: {
            vi: 'Tạo cấu trúc website hoàn chỉnh chỉ trong vài phút gồm Trang chủ, Giới thiệu, Dịch vụ, Blog, FAQ, Chính sách và nhiều trang khác. Có thể chỉnh sửa hoặc xóa bất cứ lúc nào.',
            ja: 'ホーム・会社概要・サービス・ブログ・FAQ・ポリシーなどのページ構成を数分で自動生成し、いつでも編集・削除できます。',
        },
    },

    benefit4Tag1: {
        sourceLocale: 'en',
        default: 'Home',
        translations: {
            vi: 'Trang chủ',
            ja: 'ホーム',
        },
    },

    benefit4Tag2: {
        sourceLocale: 'en',
        default: 'About',
        translations: {
            vi: 'Giới thiệu',
            ja: '会社概要',
        },
    },

    benefit4Tag3: {
        sourceLocale: 'en',
        default: 'Services',
        translations: {
            vi: 'Dịch vụ',
            ja: 'サービス',
        },
    },
    // Benefit 5
    benefit5Title: {
        sourceLocale: 'en',
        default: 'Professional Templates',
        translations: {
            vi: 'Template chuyên nghiệp',
            ja: 'プロフェッショナルテンプレート',
        },
    },

    benefit5Description: {
        sourceLocale: 'en',
        default:
            'Choose from a growing library of responsive templates and reusable components designed for modern businesses of all sizes.',
        translations: {
            vi: 'Lựa chọn từ thư viện template responsive và component tái sử dụng được thiết kế cho mọi loại hình doanh nghiệp hiện đại.',
            ja: 'あらゆる規模のビジネス向けに設計されたレスポンシブテンプレートと再利用可能なコンポーネントを利用できます。',
        },
    },

    benefit5Tag1: {
        sourceLocale: 'en',
        default: 'Responsive',
        translations: {
            vi: 'Responsive',
            ja: 'レスポンシブ',
        },
    },

    benefit5Tag2: {
        sourceLocale: 'en',
        default: 'Modern UI',
        translations: {
            vi: 'Modern UI',
            ja: 'モダンUI',
        },
    },

    benefit5Tag3: {
        sourceLocale: 'en',
        default: 'Reusable',
        translations: {
            vi: 'Tái sử dụng',
            ja: '再利用可能',
        },
    },

    // Benefit 6
    benefit6Title: {
        sourceLocale: 'en',
        default: 'Built-in Marketing Tools',
        translations: {
            vi: 'Công cụ Marketing tích hợp',
            ja: 'マーケティングツール内蔵',
        },
    },

    benefit6Description: {
        sourceLocale: 'en',
        default:
            'Everything to grow your business in one platform — Google, Facebook & TikTok integrations, Email Marketing, SEO, Analytics, and Customer Chat.',
        translations: {
            vi: 'Mọi công cụ giúp phát triển doanh nghiệp trên một nền tảng: tích hợp Google, Facebook, TikTok, Email Marketing, SEO, Analytics và Chat khách hàng.',
            ja: 'Google・Facebook・TikTok連携、メールマーケティング、SEO、分析、チャットなど、ビジネス成長に必要な機能を1つのプラットフォームで提供します。',
        },
    },

    benefit6Tag1: {
        sourceLocale: 'en',
        default: 'SEO',
        translations: {
            vi: 'SEO',
            ja: 'SEO',
        },
    },

    benefit6Tag2: {
        sourceLocale: 'en',
        default: 'Analytics',
        translations: {
            vi: 'Phân tích',
            ja: '分析',
        },
    },

    benefit6Tag3: {
        sourceLocale: 'en',
        default: 'Email',
        translations: {
            vi: 'Email',
            ja: 'メール',
        },
    },

    // Benefit 7
    benefit7Title: {
        sourceLocale: 'en',
        default: 'Automated Deployment',
        translations: {
            vi: 'Triển khai tự động',
            ja: '自動デプロイ',
        },
    },

    benefit7Description: {
        sourceLocale: 'en',
        default:
            'Connect your domain and Kbuilder automatically configures and publishes your website with minimal setup — no DevOps needed.',
        translations: {
            vi: 'Kết nối tên miền và Kbuilder sẽ tự động cấu hình, triển khai website mà không cần DevOps.',
            ja: '独自ドメインを接続するだけで、自動的に設定・公開され、DevOpsは不要です。',
        },
    },

    benefit7Tag1: {
        sourceLocale: 'en',
        default: 'One Click',
        translations: {
            vi: 'Một cú nhấp',
            ja: 'ワンクリック',
        },
    },

    benefit7Tag2: {
        sourceLocale: 'en',
        default: 'Auto Deploy',
        translations: {
            vi: 'Tự động triển khai',
            ja: '自動デプロイ',
        },
    },

    benefit7Tag3: {
        sourceLocale: 'en',
        default: 'Custom Domain',
        translations: {
            vi: 'Tên miền riêng',
            ja: '独自ドメイン',
        },
    },

    // Benefit 8
    benefit8Title: {
        sourceLocale: 'en',
        default: 'Your Website Control',
        translations: {
            vi: 'Toàn quyền quản lý website',
            ja: 'Webサイトを完全管理',
        },
    },

    benefit8Description: {
        sourceLocale: 'en',
        default:
            'Each customer receives an independent website with isolated data, users, templates, and settings — manage multiple sites from one platform.',
        translations: {
            vi: 'Mỗi khách hàng sở hữu một website độc lập với dữ liệu, người dùng, template và cấu hình riêng. Quản lý nhiều website trên cùng một nền tảng.',
            ja: '各ユーザーは独立したWebサイト・データ・テンプレート・設定を持ち、1つのプラットフォームで複数サイトを管理できます。',
        },
    },

    benefit8Tag1: {
        sourceLocale: 'en',
        default: '100% Ownership',
        translations: {
            vi: 'Toàn quyền sở hữu',
            ja: '100%所有',
        },
    },

    benefit8Tag2: {
        sourceLocale: 'en',
        default: 'Private Data',
        translations: {
            vi: 'Dữ liệu riêng',
            ja: 'プライベートデータ',
        },
    },

    benefit8Tag3: {
        sourceLocale: 'en',
        default: '',
        translations: {
            vi: '',
            ja: '',
        },
    },
};

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
/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */

export function BenefitService01(props: BenefitService01Props) {
    const mergedProps: Required<BenefitService01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        siteId,

        headline,
        headlineAccent,
        subheadline,

        exploreText,

        showcaseImage,
        showcaseImageAlt,

        floating1Title,
        floating1Description,

        floating2Title,
        floating2Description,

        floating3Title,
        floating3Description,

        showcaseBadge,
        showcaseHeadline,
        showcaseHeadlineAccent,

        feature1Text,
        feature2Text,
        feature3Text,
        feature4Text,

        showcaseCtaText,

        ctaBadgeText,
        ctaText,
        ctaHref,
        ctaSubText,

        stat1Value,
        stat1Label,

        stat2Value,
        stat2Label,

        stat3Value,
        stat3Label,

        stat4Value,
        stat4Label,

        benefit1Title,
        benefit1Description,
        benefit1Tag1,
        benefit1Tag2,
        benefit1Tag3,

        benefit2Title,
        benefit2Description,
        benefit2Tag1,
        benefit2Tag2,
        benefit2Tag3,

        benefit3Title,
        benefit3Description,
        benefit3Tag1,
        benefit3Tag2,
        benefit3Tag3,

        benefit4Title,
        benefit4Description,
        benefit4Tag1,
        benefit4Tag2,
        benefit4Tag3,

        benefit5Title,
        benefit5Description,
        benefit5Tag1,
        benefit5Tag2,
        benefit5Tag3,

        benefit6Title,
        benefit6Description,
        benefit6Tag1,
        benefit6Tag2,
        benefit6Tag3,

        benefit7Title,
        benefit7Description,
        benefit7Tag1,
        benefit7Tag2,
        benefit7Tag3,

        benefit8Title,
        benefit8Description,
        benefit8Tag1,
        benefit8Tag2,
        benefit8Tag3,

        layout,
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
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
    const createBenefit = (
        id: string,
        icon: string,
        title: LocalizedText,
        description: LocalizedText,
        accentColor: string,
        ...tags: LocalizedText[]
    ): BenefitItem => ({
        id,
        icon,
        title,
        description,
        accentColor,
        tags: tags.filter(Boolean),
    });
    const benefits: BenefitItem[] = [
        createBenefit(
            'launch',
            'rocket-takeoff-fill',
            benefit1Title,
            benefit1Description,
            '#6366F1',
            benefit1Tag1,
            benefit1Tag2,
            benefit1Tag3,
        ),

        createBenefit(
            'business-type',
            'diagram-3-fill',
            benefit2Title,
            benefit2Description,
            '#0EA5E9',
            benefit2Tag1,
            benefit2Tag2,
            benefit2Tag3,
        ),

        createBenefit(
            'no-code',
            'display-fill',
            benefit3Title,
            benefit3Description,
            '#10B981',
            benefit3Tag1,
            benefit3Tag2,
            benefit3Tag3,
        ),

        createBenefit(
            'page-gen',
            'lightning-charge-fill',
            benefit4Title,
            benefit4Description,
            '#F59E0B',
            benefit4Tag1,
            benefit4Tag2,
            benefit4Tag3,
        ),

        createBenefit(
            'templates',
            'grid-1x2-fill',
            benefit5Title,
            benefit5Description,
            '#EC4899',
            benefit5Tag1,
            benefit5Tag2,
            benefit5Tag3,
        ),

        createBenefit(
            'marketing',
            'graph-up-arrow',
            benefit6Title,
            benefit6Description,
            '#8B5CF6',
            benefit6Tag1,
            benefit6Tag2,
            benefit6Tag3,
        ),

        createBenefit(
            'deployment',
            'cloud-arrow-up-fill',
            benefit7Title,
            benefit7Description,
            '#14B8A6',
            benefit7Tag1,
            benefit7Tag2,
            benefit7Tag3,
        ),

        createBenefit(
            'control',
            'shield-lock-fill',
            benefit8Title,
            benefit8Description,
            '#2563EB',
            benefit8Tag1,
            benefit8Tag2,
            benefit8Tag3,
        ),
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

    const floatingItems = [
        {
            icon: 'lightning-charge-fill',
            title: floating1Title,
            description: floating1Description,
        },
        {
            icon: 'grid-1x2-fill',
            title: floating2Title,
            description: floating2Description,
        },
        {
            icon: 'stars',
            title: floating3Title,
            description: floating3Description,
        },
    ];

    const features = [feature1Text, feature2Text, feature3Text, feature4Text];

    const stats = [
        {
            icon: 'rocket-takeoff-fill',
            value: stat1Value,
            label: stat1Label,
        },
        {
            icon: 'check2-circle',
            value: stat2Value,
            label: stat2Label,
        },
        {
            icon: 'clock-history',
            value: stat3Value,
            label: stat3Label,
        },
        {
            icon: 'star-fill',
            value: stat4Value,
            label: stat4Label,
        },
    ];

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
                        <h2>
                            {getLocalizedValue(headline, selectedLocale)}{' '}
                            <span className={styles.accent}>
                                {getLocalizedValue(headlineAccent, selectedLocale)}
                            </span>
                        </h2>

                        <p className={styles.sub}>
                            {getLocalizedValue(subheadline, selectedLocale)}
                        </p>

                        <button className={styles.button}>
                            {getLocalizedValue(exploreText, selectedLocale)}
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>

                    <div className={styles.embla} ref={emblaRef}>
                        <div className={styles.emblaContainer}>
                            {benefits.map((benefit, index) => {
                                const accent = benefit.accentColor ?? '#2563EB';

                                return (
                                    <div key={benefit.id} className={styles.emblaSlide}>
                                        <article
                                            className={`${styles.card} ${styles.r}`}
                                            style={
                                                {
                                                    '--i': index + 1,
                                                    '--accent': accent,
                                                    background: `linear-gradient(180deg, ${accent}10 0%, #ffffff 65%)`,
                                                } as React.CSSProperties
                                            }
                                        >
                                            <span className={styles.cardNum}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            <div className={styles.cardHead}>
                                                <span
                                                    className={styles.iconWrap}
                                                    style={{
                                                        background: `${accent}14`,
                                                        border: `1px solid ${accent}28`,
                                                        color: accent,
                                                    }}
                                                >
                                                    <i className={`bi bi-${benefit.icon}`} />
                                                </span>

                                                <h3 className={styles.cardTitle}>
                                                    {getLocalizedValue(
                                                        benefit.title,
                                                        selectedLocale,
                                                    )}
                                                </h3>
                                            </div>

                                            <p className={styles.cardDesc}>
                                                {getLocalizedValue(
                                                    benefit.description,
                                                    selectedLocale,
                                                )}
                                            </p>

                                            {benefit.tags && benefit.tags.length > 0 && (
                                                <div className={styles.tagRow}>
                                                    {benefit.tags.map((tag, tagIndex) => (
                                                        <span
                                                            key={`${benefit.id}-${tagIndex}`}
                                                            className={styles.tag}
                                                            style={{
                                                                color: accent,
                                                                background: `${accent}0E`,
                                                                border: `1px solid ${accent}22`,
                                                            }}
                                                        >
                                                            <i className="bi bi-check2" />
                                                            {getLocalizedValue(tag, selectedLocale)}
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
                                    alt={getLocalizedValue(showcaseImageAlt, selectedLocale)}
                                    className={styles.mainImage}
                                />

                                <div className={styles.floatingCard}>
                                    {floatingItems.map((item, index) => (
                                        <div
                                            key={`${item.icon}-${index}`}
                                            className={styles.floatingItem}
                                        >
                                            <span className={styles.floatingIcon}>
                                                <i className={`bi bi-${item.icon}`} />
                                            </span>

                                            <div>
                                                <h4>
                                                    {getLocalizedValue(item.title, selectedLocale)}
                                                </h4>

                                                <p>
                                                    {getLocalizedValue(
                                                        item.description,
                                                        selectedLocale,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {[
                                    {
                                        className: styles.spark1,
                                        icon: 'stars',
                                    },
                                    {
                                        className: styles.spark2,
                                        icon: 'pencil',
                                    },
                                    {
                                        className: styles.spark3,
                                        icon: 'lightning-charge-fill',
                                    },
                                ].map((spark) => (
                                    <span key={spark.icon} className={spark.className}>
                                        <i className={`bi bi-${spark.icon}`} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.content}>
                            <span className={styles.badge}>
                                {getLocalizedValue(showcaseBadge, selectedLocale)}
                            </span>

                            <h2>
                                {getLocalizedValue(showcaseHeadline, selectedLocale)}
                                <br />
                                <span className={styles.accent}>
                                    {getLocalizedValue(showcaseHeadlineAccent, selectedLocale)}
                                </span>
                            </h2>

                            <ul className={styles.featureList}>
                                {features.map((feature, index) => (
                                    <li key={index}>
                                        <i className="bi bi-check-circle-fill" />
                                        {getLocalizedValue(feature, selectedLocale)}
                                    </li>
                                ))}
                            </ul>

                            <button className={styles.button}>
                                {getLocalizedValue(showcaseCtaText, selectedLocale)}
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
                                {getLocalizedValue(ctaBadgeText, selectedLocale)}
                            </span>

                            <div className={styles.ctaActions}>
                                <Link href={ctaHref} className={styles.ctaBtn}>
                                    {getLocalizedValue(ctaText, selectedLocale)}
                                    <i className="bi bi-arrow-right" />
                                </Link>

                                <span className={styles.ctaSub}>
                                    <i className="bi bi-shield-check" />
                                    {getLocalizedValue(ctaSubText, selectedLocale)}
                                </span>
                            </div>
                        </div>

                        <div className={styles.stats}>
                            {stats.map((stat, index) => (
                                <div key={index} className={styles.statItem}>
                                    <div className={styles.statIcon}>
                                        <i className={`bi bi-${stat.icon}`} />
                                    </div>

                                    <div>
                                        <h3>{getLocalizedValue(stat.value, selectedLocale)}</h3>

                                        <p>{getLocalizedValue(stat.label, selectedLocale)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const createTextField = (key: keyof BenefitService01Props, label: string): InspectorField => ({
    key,
    label,
    kind: 'localized-text',
});

const createTextareaField = (key: keyof BenefitService01Props, label: string): InspectorField => ({
    key,
    label,
    kind: 'localized-text',
});

const createImageField = (key: keyof BenefitService01Props, label: string): InspectorField => ({
    key,
    label,
    kind: 'image',
    folder: 'services/benefits',
    accept: 'image/*',
});

const createFloatingFields = (index: 1 | 2 | 3): InspectorField[] => [
    createTextField(
        `floating${index}Title` as keyof BenefitService01Props,
        `Floating ${index} Title`,
    ),

    createTextareaField(
        `floating${index}Description` as keyof BenefitService01Props,
        `Floating ${index} Description`,
    ),
];

const createFeatureFields = (): InspectorField[] => [
    createTextField('feature1Text', 'Feature 1'),
    createTextField('feature2Text', 'Feature 2'),
    createTextField('feature3Text', 'Feature 3'),
    createTextField('feature4Text', 'Feature 4'),
];

const createStatFields = (index: 1 | 2 | 3 | 4): InspectorField[] => [
    createTextField(`stat${index}Value` as keyof BenefitService01Props, `Stat ${index} Value`),

    createTextField(`stat${index}Label` as keyof BenefitService01Props, `Stat ${index} Label`),
];

const createBenefitFields = (index: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): InspectorField[] => [
    createTextField(
        `benefit${index}Title` as keyof BenefitService01Props,
        `Benefit ${index} Title`,
    ),

    createTextareaField(
        `benefit${index}Description` as keyof BenefitService01Props,
        `Benefit ${index} Description`,
    ),

    createTextField(`benefit${index}Tag1` as keyof BenefitService01Props, `Benefit ${index} Tag 1`),

    createTextField(`benefit${index}Tag2` as keyof BenefitService01Props, `Benefit ${index} Tag 2`),

    createTextField(`benefit${index}Tag3` as keyof BenefitService01Props, `Benefit ${index} Tag 3`),
];

const createShowcaseFields = (): InspectorField[] => [
    createImageField('showcaseImage', 'Showcase Image'),

    createTextField('showcaseImageAlt', 'Showcase Image Alt'),

    createTextField('showcaseBadge', 'Showcase Badge'),

    createTextField('showcaseHeadline', 'Showcase Headline'),

    createTextField('showcaseHeadlineAccent', 'Showcase Headline Accent'),

    createTextField('showcaseCtaText', 'Showcase CTA Text'),
];

const createCtaFields = (): InspectorField[] => [
    createTextField('ctaBadgeText', 'CTA Badge'),

    createTextField('ctaText', 'CTA Text'),

    createTextField('ctaHref', 'CTA Link'),

    createTextField('ctaSubText', 'CTA Sub Text'),
];

const createLayoutField = (): InspectorField => ({
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
});

function createInspector(): RegItem['inspector'] {
    return [
        createTextField('headline', 'Headline'),
        createTextField('headlineAccent', 'Headline Accent'),
        createTextareaField('subheadline', 'Subheadline'),

        createTextField('exploreText', 'Explore Button Text'),

        ...createShowcaseFields(),

        ...createFloatingFields(1),
        ...createFloatingFields(2),
        ...createFloatingFields(3),

        ...createFeatureFields(),

        ...createCtaFields(),

        ...createStatFields(1),
        ...createStatFields(2),
        ...createStatFields(3),
        ...createStatFields(4),

        createLayoutField(),

        ...createBenefitFields(1),
        ...createBenefitFields(2),
        ...createBenefitFields(3),
        ...createBenefitFields(4),
        ...createBenefitFields(5),
        ...createBenefitFields(6),
        ...createBenefitFields(7),
        ...createBenefitFields(8),
    ];
}
/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const BENEFIT_SERVICE_01: RegItem = {
    kind: 'benefit-service-01',
    label: 'Benefit Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),

    render: (props) => <BenefitService01 {...(props as BenefitService01Props)} />,
};

export default BenefitService01;
