'use client';

import styles from '@/components/admin/shared/templates/services/service/styles/service-01.module.css';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useMemo } from 'react';

type SetupItem = {
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
};

type SetupNodeProps = {
    title: LocalizedText;
    icon: string;
    x: number;
    y: number;
    accent?: 'blue' | 'green';
    items: SetupItem[];

    t: (value: LocalizedText) => string;
};

type SetupStep = {
    number: LocalizedText;
    label: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
};

type FeatureItem = {
    label: LocalizedText;
    value: LocalizedText;
};

type FeatureCard = {
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
    items: FeatureItem[];
    visual: 'builder' | 'templates' | 'pages' | 'publish';
};

type PagesVisualProps = {
    homeText: LocalizedText;
    servicesText: LocalizedText;
    aboutText: LocalizedText;
    menuReadyText: LocalizedText;
    t: (value: LocalizedText) => string;
};

type PublishVisualProps = {
    websiteText: LocalizedText;
    liveText: LocalizedText;
    domainText: LocalizedText;
    domainConnectedText: LocalizedText;
    t: (value: LocalizedText) => string;
};

type FeatureVisualProps = {
    type: FeatureCard['visual'];
    templateReadyText: LocalizedText;

    pageHomeText: LocalizedText;
    pageServicesText: LocalizedText;
    pageAboutText: LocalizedText;
    menuReadyText: LocalizedText;

    websiteText: LocalizedText;
    liveText: LocalizedText;
    domainText: LocalizedText;
    domainConnectedText: LocalizedText;
    t: (value: LocalizedText) => string;
};
export interface Service01Props {
    siteId?: string;

    pathName?: LocalizedText;

    // Hero
    visualEyebrow?: LocalizedText;
    visualTitle?: LocalizedText;
    visualTitleAccent?: LocalizedText;
    visualDescription?: LocalizedText;

    securityText?: LocalizedText;
    noCodeText?: LocalizedText;

    stepsCountText?: LocalizedText;

    step1Number?: LocalizedText;
    step1Label?: LocalizedText;
    step1Title?: LocalizedText;
    step1Description?: LocalizedText;

    step2Number?: LocalizedText;
    step2Label?: LocalizedText;
    step2Title?: LocalizedText;
    step2Description?: LocalizedText;

    step3Number?: LocalizedText;
    step3Label?: LocalizedText;
    step3Title?: LocalizedText;
    step3Description?: LocalizedText;

    stepsButtonText?: LocalizedText;

    // Setup Map
    zoomText?: LocalizedText;

    mapStartTitle?: LocalizedText;
    mapStartDescription?: LocalizedText;

    selfSetupTitle?: LocalizedText;

    selfItem1Title?: LocalizedText;
    selfItem1Description?: LocalizedText;

    selfItem2Title?: LocalizedText;
    selfItem2Description?: LocalizedText;

    selfItem3Title?: LocalizedText;
    selfItem3Description?: LocalizedText;

    serviceSetupTitle?: LocalizedText;

    serviceItem1Title?: LocalizedText;
    serviceItem1Description?: LocalizedText;

    serviceItem2Title?: LocalizedText;
    serviceItem2Description?: LocalizedText;

    serviceItem3Title?: LocalizedText;
    serviceItem3Description?: LocalizedText;

    readyTitle?: LocalizedText;
    readyDescription?: LocalizedText;

    selfMapLabel?: LocalizedText;
    serviceMapLabel?: LocalizedText;
    readyMapLabel?: LocalizedText;

    // Cards
    selfSetupLabel?: LocalizedText;
    selfSetupCardTitle?: LocalizedText;
    selfSetupCardTitleAccent?: LocalizedText;
    selfSetupCardDescription?: LocalizedText;
    selfSetupPrimaryText?: LocalizedText;
    selfSetupSecondaryText?: LocalizedText;
    selfSetupLinkText?: LocalizedText;
    selfSetupHref?: string;

    serviceSetupLabel?: LocalizedText;
    serviceSetupCardTitle?: LocalizedText;
    serviceSetupCardTitleAccent?: LocalizedText;
    serviceSetupCardDescription?: LocalizedText;
    serviceSetupPrimaryText?: LocalizedText;
    serviceSetupSecondaryText?: LocalizedText;
    serviceSetupLinkText?: LocalizedText;
    serviceSetupHref?: string;

    templateBadgeText?: LocalizedText;
    pagesBadgeText?: LocalizedText;
    menuBadgeText?: LocalizedText;

    // Features
    featuresTabText?: LocalizedText;
    builderTabText?: LocalizedText;
    featuresButtonText?: LocalizedText;

    feature1Title?: LocalizedText;
    feature1Description?: LocalizedText;
    feature1Item1Label?: LocalizedText;
    feature1Item1Value?: LocalizedText;
    feature1Item2Label?: LocalizedText;
    feature1Item2Value?: LocalizedText;

    feature2Title?: LocalizedText;
    feature2Description?: LocalizedText;
    feature2Item1Label?: LocalizedText;
    feature2Item1Value?: LocalizedText;
    feature2Item2Label?: LocalizedText;
    feature2Item2Value?: LocalizedText;

    feature3Title?: LocalizedText;
    feature3Description?: LocalizedText;
    feature3Item1Label?: LocalizedText;
    feature3Item1Value?: LocalizedText;
    feature3Item2Label?: LocalizedText;
    feature3Item2Value?: LocalizedText;

    feature4Title?: LocalizedText;
    feature4Description?: LocalizedText;
    feature4Item1Label?: LocalizedText;
    feature4Item1Value?: LocalizedText;
    feature4Item2Label?: LocalizedText;
    feature4Item2Value?: LocalizedText;

    // Feature Visual
    templateReadyText?: LocalizedText;

    pageHomeText?: LocalizedText;
    pageServicesText?: LocalizedText;
    pageAboutText?: LocalizedText;
    menuReadyText?: LocalizedText;

    websiteText?: LocalizedText;
    liveText?: LocalizedText;
    domainText?: LocalizedText;
    domainConnectedText?: LocalizedText;

    browserPreviewImage?: string;
    mobilePreviewImage?: string;
    analyticsPreviewImage?: string;
    plantPreviewImage?: string;
}

export const DEFAULT_PROPS: Required<Service01Props> = {
    siteId: '',

    pathName: {
        sourceLocale: 'en',
        default: 'Service',
        translations: {
            vi: 'Dịch vụ',
            ja: 'サービス',
        },
    },
    /* ==========================================
       Hero
    ========================================== */

    visualEyebrow: {
        sourceLocale: 'en',
        default: 'WEBSITE BUILDER',
        translations: {
            vi: 'TRÌNH XÂY DỰNG WEBSITE',
            ja: 'WEBサイトビルダー',
        },
    },

    visualTitle: {
        sourceLocale: 'en',
        default: 'Build your website.',
        translations: {
            vi: 'Xây dựng website của bạn.',
            ja: 'Webサイトを作成。',
        },
    },

    visualTitleAccent: {
        sourceLocale: 'en',
        default: 'We make starting simple.',
        translations: {
            vi: 'Chúng tôi giúp bạn bắt đầu dễ dàng.',
            ja: 'スタートをもっとシンプルに。',
        },
    },

    visualDescription: {
        sourceLocale: 'en',
        default: 'Ready-made templates, guided setup, and everything you need to launch.',
        translations: {
            vi: 'Mẫu website sẵn sàng, hướng dẫn thiết lập và mọi thứ bạn cần để đưa website vào hoạt động.',
            ja: '豊富なテンプレート、ガイド付きセットアップ、公開に必要なすべてを提供します。',
        },
    },

    /* ==========================================
       Hero Badges
    ========================================== */

    securityText: {
        sourceLocale: 'en',
        default: 'Free security setup',
        translations: {
            vi: 'Thiết lập bảo mật miễn phí',
            ja: '無料セキュリティ設定',
        },
    },

    noCodeText: {
        sourceLocale: 'en',
        default: 'No coding required',
        translations: {
            vi: 'Không cần lập trình',
            ja: 'コーディング不要',
        },
    },

    /* ==========================================
       Steps
    ========================================== */

    stepsCountText: {
        sourceLocale: 'en',
        default: '03 STEPS',
        translations: {
            vi: '03 BƯỚC',
            ja: '3ステップ',
        },
    },

    step1Number: {
        sourceLocale: 'en',
        default: '01',
        translations: {
            vi: '01',
            ja: '01',
        },
    },

    step1Label: {
        sourceLocale: 'en',
        default: 'Self-Guided Setup',
        translations: {
            vi: 'Tự thiết lập',
            ja: 'セルフセットアップ',
        },
    },

    step1Title: {
        sourceLocale: 'en',
        default: 'Build with our guided website builder',
        translations: {
            vi: 'Xây dựng website với trình hướng dẫn trực quan',
            ja: 'ガイド付きビルダーでWebサイトを作成',
        },
    },

    step1Description: {
        sourceLocale: 'en',
        default:
            'Connect your domain, receive your account, and customize your website using ready-made templates.',
        translations: {
            vi: 'Kết nối tên miền, nhận tài khoản và tùy chỉnh website bằng các mẫu có sẵn.',
            ja: 'ドメインを接続し、アカウントを受け取り、テンプレートを使ってWebサイトをカスタマイズします。',
        },
    },

    step2Number: {
        sourceLocale: 'en',
        default: '02',
        translations: {
            vi: '02',
            ja: '02',
        },
    },

    step2Label: {
        sourceLocale: 'en',
        default: 'Setup Service',
        translations: {
            vi: 'Dịch vụ thiết lập',
            ja: 'セットアップサービス',
        },
    },

    step2Title: {
        sourceLocale: 'en',
        default: 'Let us prepare your website for you',
        translations: {
            vi: 'Để chúng tôi chuẩn bị website cho bạn',
            ja: 'Webサイトの準備は私たちにお任せください',
        },
    },

    step2Description: {
        sourceLocale: 'en',
        default:
            'We prepare your initial template, pages, and navigation so you can start editing right away.',
        translations: {
            vi: 'Chúng tôi chuẩn bị sẵn giao diện, trang và menu để bạn có thể chỉnh sửa ngay.',
            ja: 'テンプレート・ページ・メニューを準備し、すぐに編集を開始できます。',
        },
    },

    step3Number: {
        sourceLocale: 'en',
        default: '03',
        translations: {
            vi: '03',
            ja: '03',
        },
    },

    step3Label: {
        sourceLocale: 'en',
        default: 'Ready to Customize',
        translations: {
            vi: 'Sẵn sàng tùy chỉnh',
            ja: 'カスタマイズ準備完了',
        },
    },

    step3Title: {
        sourceLocale: 'en',
        default: 'Edit your content and publish',
        translations: {
            vi: 'Chỉnh sửa nội dung và xuất bản',
            ja: 'コンテンツを編集して公開',
        },
    },

    step3Description: {
        sourceLocale: 'en',
        default:
            'Update text, images, pages, and menus with our visual builder — no coding required.',
        translations: {
            vi: 'Cập nhật văn bản, hình ảnh, trang và menu bằng trình chỉnh sửa trực quan mà không cần lập trình.',
            ja: 'ビジュアルエディターでテキスト・画像・ページ・メニューを簡単に更新できます。',
        },
    },

    stepsButtonText: {
        sourceLocale: 'en',
        default: 'Explore how Kbuilder works',
        translations: {
            vi: 'Khám phá cách Kbuilder hoạt động',
            ja: 'Kbuilderの仕組みを見る',
        },
    },
    /* ==========================================
       Setup Map
    ========================================== */

    zoomText: {
        sourceLocale: 'en',
        default: '100%',
        translations: {
            vi: '100%',
            ja: '100%',
        },
    },

    mapStartTitle: {
        sourceLocale: 'en',
        default: 'Choose how to start',
        translations: {
            vi: 'Chọn cách bắt đầu',
            ja: '開始方法を選択',
        },
    },

    mapStartDescription: {
        sourceLocale: 'en',
        default: 'Pick the setup option that works for you',
        translations: {
            vi: 'Lựa chọn phương thức thiết lập phù hợp với bạn.',
            ja: '自分に合ったセットアップ方法を選択してください。',
        },
    },

    /* ==========================================
       Self Setup
    ========================================== */

    selfSetupTitle: {
        sourceLocale: 'en',
        default: 'Build It Yourself',
        translations: {
            vi: 'Tự xây dựng',
            ja: '自分で構築',
        },
    },

    selfItem1Title: {
        sourceLocale: 'en',
        default: 'Connect Your Domain',
        translations: {
            vi: 'Kết nối tên miền',
            ja: 'ドメイン接続',
        },
    },

    selfItem1Description: {
        sourceLocale: 'en',
        default: 'Provide the domain details needed for setup.',
        translations: {
            vi: 'Cung cấp thông tin tên miền để bắt đầu thiết lập.',
            ja: 'セットアップに必要なドメイン情報を入力します。',
        },
    },

    selfItem2Title: {
        sourceLocale: 'en',
        default: 'Free Security Setup',
        translations: {
            vi: 'Thiết lập bảo mật miễn phí',
            ja: '無料セキュリティ設定',
        },
    },

    selfItem2Description: {
        sourceLocale: 'en',
        default: 'We configure SSL and website security for free.',
        translations: {
            vi: 'Chúng tôi cấu hình SSL và bảo mật website hoàn toàn miễn phí.',
            ja: 'SSLとWebサイトのセキュリティを無料で設定します。',
        },
    },

    selfItem3Title: {
        sourceLocale: 'en',
        default: 'Receive Your Account',
        translations: {
            vi: 'Nhận tài khoản',
            ja: 'アカウント受領',
        },
    },

    selfItem3Description: {
        sourceLocale: 'en',
        default: 'Get access and follow our setup guide.',
        translations: {
            vi: 'Nhận tài khoản và làm theo hướng dẫn thiết lập.',
            ja: 'アカウントを受け取り、セットアップガイドに従います。',
        },
    },

    /* ==========================================
       Done-for-you Setup
    ========================================== */

    serviceSetupTitle: {
        sourceLocale: 'en',
        default: 'Done-for-You Setup',
        translations: {
            vi: 'Thiết lập trọn gói',
            ja: 'セットアップ代行',
        },
    },

    serviceItem1Title: {
        sourceLocale: 'en',
        default: 'Template Ready',
        translations: {
            vi: 'Template sẵn sàng',
            ja: 'テンプレート準備完了',
        },
    },

    serviceItem1Description: {
        sourceLocale: 'en',
        default: 'A website template is added for you.',
        translations: {
            vi: 'Website mẫu đã được tạo sẵn.',
            ja: 'Webサイトテンプレートを用意します。',
        },
    },

    serviceItem2Title: {
        sourceLocale: 'en',
        default: 'Pages Created',
        translations: {
            vi: 'Trang đã tạo',
            ja: 'ページ作成済み',
        },
    },

    serviceItem2Description: {
        sourceLocale: 'en',
        default: 'Essential website pages are prepared.',
        translations: {
            vi: 'Các trang quan trọng đã được chuẩn bị.',
            ja: '必要なページを準備します。',
        },
    },

    serviceItem3Title: {
        sourceLocale: 'en',
        default: 'Menu Configured',
        translations: {
            vi: 'Menu đã cấu hình',
            ja: 'メニュー設定済み',
        },
    },

    serviceItem3Description: {
        sourceLocale: 'en',
        default: 'Navigation structure is ready to use.',
        translations: {
            vi: 'Cấu trúc menu đã sẵn sàng sử dụng.',
            ja: 'ナビゲーション構造を準備します。',
        },
    },

    /* ==========================================
       Ready
    ========================================== */

    readyTitle: {
        sourceLocale: 'en',
        default: 'Ready to Edit',
        translations: {
            vi: 'Sẵn sàng chỉnh sửa',
            ja: '編集準備完了',
        },
    },

    readyDescription: {
        sourceLocale: 'en',
        default: 'Customize your content and publish.',
        translations: {
            vi: 'Tùy chỉnh nội dung và xuất bản website.',
            ja: 'コンテンツを編集して公開します。',
        },
    },

    selfMapLabel: {
        sourceLocale: 'en',
        default: 'Self Setup',
        translations: {
            vi: 'Tự thiết lập',
            ja: 'セルフセットアップ',
        },
    },

    serviceMapLabel: {
        sourceLocale: 'en',
        default: 'Setup Service',
        translations: {
            vi: 'Dịch vụ thiết lập',
            ja: 'セットアップサービス',
        },
    },

    readyMapLabel: {
        sourceLocale: 'en',
        default: 'Ready to Customize',
        translations: {
            vi: 'Sẵn sàng tùy chỉnh',
            ja: 'カスタマイズ準備完了',
        },
    },
    /* ==========================================
       Self Setup Card
    ========================================== */

    selfSetupLabel: {
        sourceLocale: 'en',
        default: 'OPTION 01',
        translations: {
            vi: 'LỰA CHỌN 01',
            ja: 'オプション 01',
        },
    },

    selfSetupCardTitle: {
        sourceLocale: 'en',
        default: 'Build It',
        translations: {
            vi: 'Tự xây dựng',
            ja: '自分で構築',
        },
    },

    selfSetupCardTitleAccent: {
        sourceLocale: 'en',
        default: 'Yourself',
        translations: {
            vi: 'Website',
            ja: '自分で',
        },
    },

    selfSetupCardDescription: {
        sourceLocale: 'en',
        default:
            'Launch quickly with our visual website builder and customize every section without writing code.',
        translations: {
            vi: 'Khởi tạo website nhanh chóng với trình chỉnh sửa trực quan và tùy chỉnh mọi thành phần mà không cần lập trình.',
            ja: 'ビジュアルエディターで簡単にWebサイトを構築できます。',
        },
    },

    selfSetupPrimaryText: {
        sourceLocale: 'en',
        default: 'Visual Builder',
        translations: {
            vi: 'Trình chỉnh sửa trực quan',
            ja: 'ビジュアルビルダー',
        },
    },

    selfSetupSecondaryText: {
        sourceLocale: 'en',
        default: 'Ready-made Templates',
        translations: {
            vi: 'Template có sẵn',
            ja: 'テンプレート',
        },
    },

    selfSetupLinkText: {
        sourceLocale: 'en',
        default: 'Start Building',
        translations: {
            vi: 'Bắt đầu xây dựng',
            ja: '作成を開始',
        },
    },

    selfSetupHref: '/builder',

    /* ==========================================
       Done-for-you Card
    ========================================== */

    serviceSetupLabel: {
        sourceLocale: 'en',
        default: 'OPTION 02',
        translations: {
            vi: 'LỰA CHỌN 02',
            ja: 'オプション 02',
        },
    },

    serviceSetupCardTitle: {
        sourceLocale: 'en',
        default: 'Let Us',
        translations: {
            vi: 'Để chúng tôi',
            ja: '私たちが',
        },
    },

    serviceSetupCardTitleAccent: {
        sourceLocale: 'en',
        default: 'Prepare It',
        translations: {
            vi: 'Chuẩn bị giúp bạn',
            ja: '準備します',
        },
    },

    serviceSetupCardDescription: {
        sourceLocale: 'en',
        default:
            'Our team prepares your website structure, pages, menus and design so you can immediately focus on editing content.',
        translations: {
            vi: 'Đội ngũ của chúng tôi chuẩn bị sẵn giao diện, trang và menu để bạn chỉ cần chỉnh sửa nội dung.',
            ja: 'ページ・メニュー・デザインを準備し、すぐに編集を開始できます。',
        },
    },

    serviceSetupPrimaryText: {
        sourceLocale: 'en',
        default: 'Website Ready',
        translations: {
            vi: 'Website sẵn sàng',
            ja: 'Webサイト準備完了',
        },
    },

    serviceSetupSecondaryText: {
        sourceLocale: 'en',
        default: 'Professional Setup',
        translations: {
            vi: 'Thiết lập chuyên nghiệp',
            ja: 'プロフェッショナル設定',
        },
    },

    serviceSetupLinkText: {
        sourceLocale: 'en',
        default: 'Request Setup',
        translations: {
            vi: 'Yêu cầu thiết lập',
            ja: 'セットアップ依頼',
        },
    },

    serviceSetupHref: '/contact',

    /* ==========================================
       Visual Badge
    ========================================== */

    templateBadgeText: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: {
            vi: 'Template',
            ja: 'テンプレート',
        },
    },

    pagesBadgeText: {
        sourceLocale: 'en',
        default: 'Pages',
        translations: {
            vi: 'Trang',
            ja: 'ページ',
        },
    },

    menuBadgeText: {
        sourceLocale: 'en',
        default: 'Menus',
        translations: {
            vi: 'Menu',
            ja: 'メニュー',
        },
    },

    /* ==========================================
       Features Header
    ========================================== */

    featuresTabText: {
        sourceLocale: 'en',
        default: 'Features',
        translations: {
            vi: 'Tính năng',
            ja: '機能',
        },
    },

    builderTabText: {
        sourceLocale: 'en',
        default: 'Builder',
        translations: {
            vi: 'Builder',
            ja: 'ビルダー',
        },
    },

    featuresButtonText: {
        sourceLocale: 'en',
        default: 'Explore Features',
        translations: {
            vi: 'Khám phá tính năng',
            ja: '機能を見る',
        },
    },

    /* ==========================================
       Feature 01
    ========================================== */

    feature1Title: {
        sourceLocale: 'en',
        default: 'Visual Builder',
        translations: {
            vi: 'Trình chỉnh sửa trực quan',
            ja: 'ビジュアルビルダー',
        },
    },

    feature1Description: {
        sourceLocale: 'en',
        default:
            'Edit every part of your website visually with an intuitive drag-and-drop builder.',
        translations: {
            vi: 'Chỉnh sửa mọi thành phần của website bằng trình kéo thả trực quan.',
            ja: 'ドラッグ＆ドロップでWebサイトを簡単に編集できます。',
        },
    },

    feature1Item1Label: {
        sourceLocale: 'en',
        default: 'Drag & Drop',
        translations: {
            vi: 'Kéo & Thả',
            ja: 'ドラッグ＆ドロップ',
        },
    },

    feature1Item1Value: {
        sourceLocale: 'en',
        default: 'Edit sections visually',
        translations: {
            vi: 'Chỉnh sửa từng section',
            ja: 'セクションを視覚的に編集',
        },
    },

    feature1Item2Label: {
        sourceLocale: 'en',
        default: 'No Code',
        translations: {
            vi: 'Không cần code',
            ja: 'コード不要',
        },
    },

    feature1Item2Value: {
        sourceLocale: 'en',
        default: 'Anyone can build websites',
        translations: {
            vi: 'Ai cũng có thể xây dựng website',
            ja: '誰でもWebサイトを作成可能',
        },
    },

    /* ==========================================
       Feature 02
    ========================================== */

    feature2Title: {
        sourceLocale: 'en',
        default: 'Ready-made Templates',
        translations: {
            vi: 'Template có sẵn',
            ja: 'テンプレート',
        },
    },

    feature2Description: {
        sourceLocale: 'en',
        default: 'Choose from modern responsive templates and launch your website faster.',
        translations: {
            vi: 'Lựa chọn hàng trăm template hiện đại và responsive.',
            ja: 'モダンなレスポンシブテンプレートを利用できます。',
        },
    },

    feature2Item1Label: {
        sourceLocale: 'en',
        default: 'Responsive',
        translations: {
            vi: 'Responsive',
            ja: 'レスポンシブ',
        },
    },

    feature2Item1Value: {
        sourceLocale: 'en',
        default: 'Desktop, Tablet & Mobile',
        translations: {
            vi: 'Desktop, Tablet và Mobile',
            ja: 'PC・タブレット・スマホ対応',
        },
    },

    feature2Item2Label: {
        sourceLocale: 'en',
        default: 'Professional',
        translations: {
            vi: 'Chuyên nghiệp',
            ja: 'プロ品質',
        },
    },

    feature2Item2Value: {
        sourceLocale: 'en',
        default: 'Beautiful website layouts',
        translations: {
            vi: 'Giao diện đẹp mắt',
            ja: '高品質レイアウト',
        },
    },

    /* ==========================================
       Feature 03
    ========================================== */

    feature3Title: {
        sourceLocale: 'en',
        default: 'Pages & Navigation',
        translations: {
            vi: 'Trang & Menu',
            ja: 'ページとメニュー',
        },
    },

    feature3Description: {
        sourceLocale: 'en',
        default: 'Create pages and organize your website navigation in just a few clicks.',
        translations: {
            vi: 'Quản lý trang và menu một cách trực quan.',
            ja: 'ページとナビゲーションを簡単に管理できます。',
        },
    },

    feature3Item1Label: {
        sourceLocale: 'en',
        default: 'Unlimited Pages',
        translations: {
            vi: 'Không giới hạn trang',
            ja: 'ページ無制限',
        },
    },

    feature3Item1Value: {
        sourceLocale: 'en',
        default: 'Organize your content',
        translations: {
            vi: 'Quản lý nội dung dễ dàng',
            ja: 'コンテンツ整理',
        },
    },

    feature3Item2Label: {
        sourceLocale: 'en',
        default: 'Navigation',
        translations: {
            vi: 'Menu điều hướng',
            ja: 'ナビゲーション',
        },
    },

    feature3Item2Value: {
        sourceLocale: 'en',
        default: 'Smart menu management',
        translations: {
            vi: 'Quản lý menu thông minh',
            ja: 'スマートメニュー管理',
        },
    },

    /* ==========================================
       Feature 04
    ========================================== */

    feature4Title: {
        sourceLocale: 'en',
        default: 'Publish & Deploy',
        translations: {
            vi: 'Xuất bản Website',
            ja: '公開・デプロイ',
        },
    },

    feature4Description: {
        sourceLocale: 'en',
        default: 'Publish your website instantly with custom domains and secure hosting.',
        translations: {
            vi: 'Xuất bản website chỉ với một cú nhấp chuột.',
            ja: 'ワンクリックでWebサイトを公開できます。',
        },
    },

    feature4Item1Label: {
        sourceLocale: 'en',
        default: 'Custom Domain',
        translations: {
            vi: 'Tên miền riêng',
            ja: '独自ドメイン',
        },
    },

    feature4Item1Value: {
        sourceLocale: 'en',
        default: 'Connect your own domain',
        translations: {
            vi: 'Kết nối tên miền riêng',
            ja: '独自ドメイン接続',
        },
    },

    feature4Item2Label: {
        sourceLocale: 'en',
        default: 'Cloud Hosting',
        translations: {
            vi: 'Cloud Hosting',
            ja: 'クラウドホスティング',
        },
    },

    feature4Item2Value: {
        sourceLocale: 'en',
        default: 'Fast & secure deployment',
        translations: {
            vi: 'Triển khai nhanh và an toàn',
            ja: '高速・安全な公開',
        },
    },

    /* ==========================================
       Feature Visual
    ========================================== */

    templateReadyText: {
        sourceLocale: 'en',
        default: 'Ready to Use',
        translations: {
            vi: 'Sẵn sàng sử dụng',
            ja: 'すぐに利用可能',
        },
    },

    pageHomeText: {
        sourceLocale: 'en',
        default: 'Home',
        translations: {
            vi: 'Trang chủ',
            ja: 'ホーム',
        },
    },

    pageServicesText: {
        sourceLocale: 'en',
        default: 'Services',
        translations: {
            vi: 'Dịch vụ',
            ja: 'サービス',
        },
    },

    pageAboutText: {
        sourceLocale: 'en',
        default: 'About',
        translations: {
            vi: 'Giới thiệu',
            ja: '会社概要',
        },
    },

    menuReadyText: {
        sourceLocale: 'en',
        default: 'Navigation Ready',
        translations: {
            vi: 'Menu sẵn sàng',
            ja: 'メニュー準備完了',
        },
    },

    websiteText: {
        sourceLocale: 'en',
        default: 'Website',
        translations: {
            vi: 'Website',
            ja: 'Webサイト',
        },
    },

    liveText: {
        sourceLocale: 'en',
        default: 'Live',
        translations: {
            vi: 'Đang hoạt động',
            ja: '公開中',
        },
    },

    domainText: {
        sourceLocale: 'en',
        default: 'yourdomain.com',
        translations: {
            vi: 'tenmiencuaban.com',
            ja: 'yourdomain.jp',
        },
    },

    domainConnectedText: {
        sourceLocale: 'en',
        default: 'Domain Connected',
        translations: {
            vi: 'Tên miền đã kết nối',
            ja: 'ドメイン接続済み',
        },
    },

    browserPreviewImage: '/assets/images/browser-preview.png',

    mobilePreviewImage: '/assets/images/mobile-preview.png',

    analyticsPreviewImage: '/assets/images/analytics-card.png',

    plantPreviewImage: '/assets/images/plant.png',
};

function SetupNode({ title, icon, x, y, accent = 'blue', items, t }: SetupNodeProps) {
    return (
        <div
            className={styles.serverNode}
            style={{
                left: x,
                top: y,
            }}
        >
            <div className={styles.nodeHeader}>
                <div className={`${styles.nodeIcon} ${accent === 'green' ? styles.green : ''}`}>
                    <i className={`bi ${icon}`} />
                </div>

                <span>{t(title)}</span>
            </div>

            <div className={styles.nodeItems}>
                {items.map((item, index) => (
                    <div key={`${item.icon}-${index}`} className={styles.serverItem}>
                        <div className={styles.serverIcon}>
                            <i className={`bi ${item.icon}`} />
                        </div>

                        <div className={styles.serverInfo}>
                            <strong>{t(item.title)}</strong>
                            <span>{t(item.description)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BuilderVisual() {
    return (
        <div className={styles.builderVisual}>
            <div className={styles.builderWindow}>
                <div className={styles.windowTop}>
                    <span />
                    <span />
                    <span />
                </div>

                <div className={styles.builderBody}>
                    <div className={styles.builderSidebar}>
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className={styles.builderCanvas}>
                        <div className={styles.builderTitle} />

                        <div className={styles.builderText} />

                        <div className={styles.builderButton} />
                    </div>
                </div>
            </div>

            <div className={styles.cursorBadge}>
                <i className="bi bi-cursor-fill" />
            </div>

            <div className={styles.imageBadge}>
                <i className="bi bi-image" />
            </div>

            <div className={styles.textBadge}>
                <i className="bi bi-type" />
            </div>
        </div>
    );
}
function TemplatesVisual({
    readyText,
    t,
}: {
    readyText: LocalizedText;
    t: (value: LocalizedText) => string;
}) {
    return (
        <div className={styles.templatesVisual}>
            <div className={`${styles.templateCard} ${styles.templateBack}`}>
                <span />
                <span />
                <span />
            </div>

            <div className={`${styles.templateCard} ${styles.templateMiddle}`}>
                <span />
                <span />
                <span />
            </div>

            <div className={`${styles.templateCard} ${styles.templateFront}`}>
                <div className={styles.templateHero} />

                <div className={styles.templateLines}>
                    <span />
                    <span />
                </div>

                <div className={styles.templateColumns}>
                    <span />
                    <span />
                    <span />
                </div>
            </div>

            <div className={styles.templateCount}>
                <i className="bi bi-grid-fill" />
                {t(readyText)}
            </div>
        </div>
    );
}
function PagesVisual({ homeText, servicesText, aboutText, menuReadyText, t }: PagesVisualProps) {
    return (
        <div className={styles.pagesVisual}>
            <div className={styles.pageWindow}>
                <div className={styles.pageTop}>
                    <span />

                    <div>
                        <i className="bi bi-dash" />
                        <i className="bi bi-square" />
                    </div>
                </div>

                <div className={styles.pageContent}>
                    <div className={styles.pageSidebar}>
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className={styles.pageList}>
                        <div>
                            <i className="bi bi-house-door-fill" />
                            {t(homeText)}
                        </div>

                        <div>
                            <i className="bi bi-window" />
                            {t(servicesText)}
                        </div>

                        <div>
                            <i className="bi bi-file-earmark" />
                            {t(aboutText)}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.menuBadge}>
                <i className="bi bi-list" />
                {t(menuReadyText)}
            </div>
        </div>
    );
}

function PublishVisual({
    websiteText,
    liveText,
    domainText,
    domainConnectedText,
    t,
}: PublishVisualProps) {
    return (
        <div className={styles.publishVisual}>
            <div className={styles.publishWindow}>
                <div className={styles.publishHeader}>
                    <span>{t(websiteText)}</span>

                    <div className={styles.liveBadge}>
                        <span />
                        {t(liveText)}
                    </div>
                </div>

                <div className={styles.domainRow}>
                    <div className={styles.domainIcon}>
                        <i className="bi bi-globe2" />
                    </div>

                    <div>
                        <strong>{t(domainText)}</strong>
                        <span>{t(domainConnectedText)}</span>
                    </div>
                </div>

                <div className={styles.publishProgress}>
                    <span />
                </div>
            </div>

            <div className={styles.publishBadge}>
                <i className="bi bi-check2" />
            </div>

            <div className={styles.chartBadge}>
                <i className="bi bi-bar-chart-fill" />
            </div>
        </div>
    );
}

function FeatureVisual({
    type,
    templateReadyText,
    pageHomeText,
    pageServicesText,
    pageAboutText,
    menuReadyText,
    websiteText,
    liveText,
    domainText,
    domainConnectedText,
    t,
}: FeatureVisualProps) {
    if (type === 'builder') {
        return <BuilderVisual />;
    }

    if (type === 'templates') {
        return <TemplatesVisual readyText={templateReadyText} t={t} />;
    }

    if (type === 'pages') {
        return (
            <PagesVisual
                t={t}
                homeText={pageHomeText}
                servicesText={pageServicesText}
                aboutText={pageAboutText}
                menuReadyText={menuReadyText}
            />
        );
    }

    return (
        <PublishVisual
            t={t}
            websiteText={websiteText}
            liveText={liveText}
            domainText={domainText}
            domainConnectedText={domainConnectedText}
        />
    );
}

function createSetupStep(index: 1 | 2 | 3, props: Required<Service01Props>): SetupStep {
    return {
        number: props[`step${index}Number`],
        label: props[`step${index}Label`],
        title: props[`step${index}Title`],
        description: props[`step${index}Description`],
    };
}

function createFeatureCard(
    index: 1 | 2 | 3 | 4,
    icon: string,
    visual: FeatureCard['visual'],
    props: Required<Service01Props>,
): FeatureCard {
    return {
        icon,
        visual,
        title: props[`feature${index}Title`],
        description: props[`feature${index}Description`],

        items: [
            {
                label: props[`feature${index}Item1Label`],
                value: props[`feature${index}Item1Value`],
            },
            {
                label: props[`feature${index}Item2Label`],
                value: props[`feature${index}Item2Value`],
            },
        ],
    };
}
export function Service01(props: Service01Props) {
    const mergedProps = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        pathName,

        visualEyebrow,
        visualTitle,
        visualTitleAccent,
        visualDescription,

        securityText,
        noCodeText,
        stepsCountText,

        stepsButtonText,

        zoomText,

        mapStartTitle,
        mapStartDescription,

        selfSetupTitle,

        selfItem1Title,
        selfItem1Description,

        selfItem2Title,
        selfItem2Description,

        selfItem3Title,
        selfItem3Description,

        serviceSetupTitle,

        serviceItem1Title,
        serviceItem1Description,

        serviceItem2Title,
        serviceItem2Description,

        serviceItem3Title,
        serviceItem3Description,

        readyTitle,
        readyDescription,

        selfMapLabel,
        serviceMapLabel,
        readyMapLabel,

        selfSetupLabel,
        selfSetupCardTitle,
        selfSetupCardTitleAccent,
        selfSetupCardDescription,
        selfSetupPrimaryText,
        selfSetupSecondaryText,
        selfSetupLinkText,
        selfSetupHref,

        serviceSetupLabel,
        serviceSetupCardTitle,
        serviceSetupCardTitleAccent,
        serviceSetupCardDescription,
        serviceSetupPrimaryText,
        serviceSetupSecondaryText,
        serviceSetupLinkText,
        serviceSetupHref,

        templateBadgeText,
        pagesBadgeText,
        menuBadgeText,

        featuresTabText,
        builderTabText,
        featuresButtonText,

        templateReadyText,

        pageHomeText,
        pageServicesText,
        pageAboutText,
        menuReadyText,

        websiteText,
        liveText,
        domainText,
        domainConnectedText,
        browserPreviewImage,
        mobilePreviewImage,
        analyticsPreviewImage,
        plantPreviewImage,
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

    const t = (value: LocalizedText) => getLocalizedValue(value, selectedLocale);

    const setupSteps = [
        createSetupStep(1, mergedProps),
        createSetupStep(2, mergedProps),
        createSetupStep(3, mergedProps),
    ];

    const features: FeatureCard[] = [
        createFeatureCard(1, 'bi-cursor-fill', 'builder', mergedProps),
        createFeatureCard(2, 'bi-grid-1x2-fill', 'templates', mergedProps),
        createFeatureCard(3, 'bi-window-stack', 'pages', mergedProps),
        createFeatureCard(4, 'bi-rocket-takeoff-fill', 'publish', mergedProps),
    ];
    return (
        <>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.headingSection}>
                        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                            <Link href="/" className={styles.breadcrumbItem}>
                                Home
                            </Link>
                            <i className="bi bi-chevron-right" />
                            <span className={styles.breadcrumbCurrent}>{t(pathName)}</span>
                        </nav>
                    </div>

                    <div className={styles.showcaseLayout}>
                        <div className={styles.showcasePanel}>
                            <div className={styles.showcaseGlowPurple} />
                            <div className={styles.showcaseGlowPink} />

                            <div className={styles.showcaseHero}>
                                <span className={styles.showcaseBadge}>
                                    <i className="bi bi-lightning-charge-fill" />
                                    {t(visualEyebrow)}
                                </span>

                                <h2 className={styles.showcaseHeading}>
                                    {t(visualTitle)}
                                    <br />
                                    <span>{t(visualTitleAccent)}</span>
                                </h2>

                                <p className={styles.showcaseLead}>{t(visualDescription)}</p>
                            </div>

                            <div className={styles.workspacePreview}>
                                {/* Browser Preview */}
                                <div className={styles.workspaceBrowser}>
                                    <Image
                                        src={browserPreviewImage}
                                        alt="Website Builder"
                                        fill
                                        priority
                                        sizes="(max-width:768px) 100vw, 70vw"
                                        className={styles.workspaceImage}
                                    />
                                </div>

                                {/* Mobile Preview */}
                                <div className={styles.workspaceMobile}>
                                    <Image
                                        src={mobilePreviewImage}
                                        alt="Mobile Preview"
                                        fill
                                        sizes="240px"
                                        className={styles.workspaceImage}
                                    />
                                </div>

                                {/* Analytics */}
                                <div className={styles.workspaceAnalytics}>
                                    <Image
                                        src={analyticsPreviewImage}
                                        alt="Analytics"
                                        fill
                                        sizes="320px"
                                        className={styles.workspaceImage}
                                    />
                                </div>

                                {/* Floating Plant */}
                                <div className={styles.workspacePlant}>
                                    <Image
                                        src={plantPreviewImage}
                                        alt="Plant"
                                        fill
                                        sizes="180px"
                                        className={styles.workspaceImage}
                                    />
                                </div>
                            </div>

                            <div className={styles.featureRibbon}>
                                <span>
                                    <i className="bi bi-shield-check" />
                                    {t(securityText)}
                                </span>

                                <span>
                                    <i className="bi bi-code-slash" />
                                    {t(noCodeText)}
                                </span>

                                <span>
                                    <i className="bi bi-lightning-charge" />
                                    Launch in minutes
                                </span>
                            </div>
                        </div>

                        {/* ========================= RIGHT ========================= */}

                        <div className={styles.processPanel}>
                            <div className={styles.processHeader}>
                                <h2 className={styles.processHeading}>
                                    <span className={styles.processCount}>{t(stepsCountText)}</span>

                                    <span className={styles.processTitle}>Simple Steps</span>

                                    <i className="bi bi-stars" />
                                </h2>
                            </div>

                            <div className={styles.processTimeline}>
                                {setupSteps.map((step, index) => {
                                    const icons = [
                                        'bi bi-ui-checks-grid',
                                        'bi bi-gear-fill',
                                        'bi bi-rocket-takeoff-fill',
                                    ];

                                    return (
                                        <article key={index} className={styles.processCard}>
                                            <span
                                                className={`${styles.timelineDot} ${
                                                    styles[`timelineDot${index + 1}`]
                                                }`}
                                            />

                                            <div
                                                className={`${styles.processThumb} ${
                                                    styles[`processThumb${index + 1}`]
                                                }`}
                                            >
                                                <div className={styles.processThumbInner}>
                                                    <i className={icons[index]} />
                                                </div>
                                            </div>

                                            <div className={styles.processContent}>
                                                <span
                                                    className={`${styles.processLabel} ${
                                                        styles[`processLabel${index + 1}`]
                                                    }`}
                                                >
                                                    {t(step.label)}
                                                </span>

                                                <h3>{t(step.title)}</h3>

                                                <p>{t(step.description)}</p>
                                            </div>

                                            <button type="button" className={styles.processAction}>
                                                <i className="bi bi-arrow-right" />
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>

                            <button type="button" className={styles.processButton}>
                                <span className={styles.processButtonIcon}>
                                    <i className="bi bi-stars" />
                                </span>

                                <span>{t(stepsButtonText)}</span>

                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.map}>
                    <div className={styles.zoomPanel}>
                        <div className={styles.zoomPreview}>
                            <div />
                            <div />
                            <div />
                            <div />
                        </div>

                        <div className={styles.zoomControl}>
                            <button type="button">−</button>
                            <strong>{t(zoomText)}</strong>
                            <button type="button">+</button>
                        </div>
                    </div>

                    <div className={styles.canvas}>
                        <svg
                            className={styles.connections}
                            viewBox="0 0 1400 560"
                            preserveAspectRatio="none"
                        >
                            <path d="M700 78 L700 125" className={styles.greenLine} />

                            <path
                                d="M575 157 C480 157 500 255 420 255"
                                className={styles.blueLine}
                            />

                            <path
                                d="M825 157 C920 157 900 255 1000 255"
                                className={styles.pinkLine}
                            />

                            <path
                                d="M420 400 C420 470 500 480 590 480"
                                className={styles.blueLine}
                            />

                            <path
                                d="M1000 400 C1000 470 900 480 810 480"
                                className={styles.pinkLine}
                            />
                        </svg>

                        {/* Kbuilder */}
                        <div className={styles.securityNode}>
                            <i className="bi bi-grid-fill" />
                        </div>

                        {/* Choose setup */}
                        <div className={styles.mainNode}>
                            <div className={styles.mainNodeIcon}>
                                <i className="bi bi-signpost-split-fill" />
                            </div>

                            <div className={styles.nodeContent}>
                                <strong>{t(mapStartTitle)}</strong>
                                <span>{t(mapStartDescription)}</span>
                            </div>
                        </div>

                        <SetupNode
                            title={selfSetupTitle}
                            icon="bi-person-fill-gear"
                            x={180}
                            y={210}
                            accent="blue"
                            items={[
                                {
                                    icon: 'bi-globe2',
                                    title: selfItem1Title,
                                    description: selfItem1Description,
                                },
                                {
                                    icon: 'bi-shield-check',
                                    title: selfItem2Title,
                                    description: selfItem2Description,
                                },
                                {
                                    icon: 'bi-person-check-fill',
                                    title: selfItem3Title,
                                    description: selfItem3Description,
                                },
                            ]}
                            t={t}
                        />

                        <SetupNode
                            title={serviceSetupTitle}
                            icon="bi-stars"
                            x={1000}
                            y={210}
                            accent="green"
                            items={[
                                {
                                    icon: 'bi-window-stack',
                                    title: serviceItem1Title,
                                    description: serviceItem1Description,
                                },
                                {
                                    icon: 'bi-file-earmark-text',
                                    title: serviceItem2Title,
                                    description: serviceItem2Description,
                                },
                                {
                                    icon: 'bi-list',
                                    title: serviceItem3Title,
                                    description: serviceItem3Description,
                                },
                            ]}
                            t={t}
                        />

                        {/* Ready */}
                        <div className={styles.awsNode}>
                            <i className="bi bi-pencil-square" />

                            <div className={styles.nodeContent}>
                                <strong>{t(readyTitle)}</strong>
                                <span>{t(readyDescription)}</span>
                            </div>
                        </div>

                        <div className={styles.selfLabel}>{t(selfMapLabel)}</div>

                        <div className={styles.serviceLabel}>{t(serviceMapLabel)}</div>

                        <div className={styles.readyLabel}>{t(readyMapLabel)}</div>
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.quickSection}>
                        <div className={styles.setupGrid}>
                            <article className={`${styles.setupCard} ${styles.selfSetup}`}>
                                <div className={styles.setupContent}>
                                    <span className={styles.setupLabel}>{t(selfSetupLabel)}</span>

                                    <h3>
                                        {t(selfSetupCardTitle)}
                                        <br />
                                        {t(selfSetupCardTitleAccent)}
                                    </h3>

                                    <p>{t(selfSetupCardDescription)}</p>

                                    <div className={styles.setupActions}>
                                        <button type="button">{t(selfSetupPrimaryText)}</button>

                                        <button type="button" className={styles.secondaryButton}>
                                            {t(selfSetupSecondaryText)}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.selfVisual}>
                                    <div className={styles.orbit}>
                                        <div className={styles.orbitRingOne} />
                                        <div className={styles.orbitRingTwo} />

                                        <div className={styles.centerLogo}>
                                            <i className="bi bi-grid-fill" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeOne}`}
                                        >
                                            <i className="bi bi-globe2" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeTwo}`}
                                        >
                                            <i className="bi bi-shield-check" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeThree}`}
                                        >
                                            <i className="bi bi-pencil-square" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeFour}`}
                                        >
                                            <i className="bi bi-rocket-takeoff" />
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <article className={`${styles.setupCard} ${styles.setupService}`}>
                                <div className={styles.setupContent}>
                                    <span className={styles.setupLabel}>
                                        {t(serviceSetupLabel)}
                                    </span>

                                    <h3>
                                        {t(serviceSetupCardTitle)}
                                        <br />
                                        {t(serviceSetupCardTitleAccent)}
                                    </h3>

                                    <p>{t(serviceSetupCardDescription)}</p>

                                    <div className={styles.setupActions}>
                                        <button type="button">{t(serviceSetupPrimaryText)}</button>

                                        <button type="button" className={styles.secondaryButton}>
                                            {t(serviceSetupSecondaryText)}
                                        </button>

                                        <a href={serviceSetupHref}>
                                            {t(serviceSetupLinkText)}
                                            <i className="bi bi-arrow-up-right" />
                                        </a>
                                    </div>
                                </div>

                                <div className={styles.serviceVisual}>
                                    <div className={styles.serviceWindow}>
                                        <div className={styles.serviceTop}>
                                            <span />
                                            <span />
                                            <span />
                                        </div>

                                        <div className={styles.serviceBody}>
                                            <div className={styles.serviceSidebar}>
                                                <span />
                                                <span />
                                                <span />
                                            </div>

                                            <div className={styles.serviceCanvas}>
                                                <div className={styles.serviceHero} />

                                                <div className={styles.serviceBlocks}>
                                                    <span />
                                                    <span />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.serviceBadge} ${styles.serviceBadgeOne}`}
                                    >
                                        <i className="bi bi-grid-1x2-fill" />
                                        {t(templateBadgeText)}
                                    </div>

                                    <div
                                        className={`${styles.serviceBadge} ${styles.serviceBadgeTwo}`}
                                    >
                                        <i className="bi bi-file-earmark" />
                                        {t(pagesBadgeText)}
                                    </div>

                                    <div
                                        className={`${styles.serviceBadge} ${styles.serviceBadgeThree}`}
                                    >
                                        <i className="bi bi-list" />
                                        {t(menuBadgeText)}
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>

                    <div id="features" className={styles.featuresSection}>
                        <div className={styles.featuresHeader}>
                            <div className={styles.featureTabs}>
                                <span className={styles.activeTab}>{t(featuresTabText)}</span>

                                <span>{t(builderTabText)}</span>
                            </div>

                            <button type="button">
                                {t(featuresButtonText)}
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>

                        <div className={styles.featureGrid}>
                            {features.map((feature, featureIndex) => (
                                <article key={featureIndex} className={styles.featureCard}>
                                    <div className={styles.featureVisual}>
                                        <FeatureVisual
                                            type={feature.visual}
                                            templateReadyText={templateReadyText}
                                            pageHomeText={pageHomeText}
                                            pageServicesText={pageServicesText}
                                            pageAboutText={pageAboutText}
                                            menuReadyText={menuReadyText}
                                            websiteText={websiteText}
                                            liveText={liveText}
                                            domainText={domainText}
                                            domainConnectedText={domainConnectedText}
                                            t={t}
                                        />
                                    </div>

                                    <div className={styles.featureContent}>
                                        <div className={styles.featureTitleRow}>
                                            <div className={styles.featureIcon}>
                                                <i className={`bi ${feature.icon}`} />
                                            </div>

                                            <h3>{t(feature.title)}</h3>
                                        </div>

                                        <p>{t(feature.description)}</p>

                                        <div className={styles.featureItems}>
                                            {feature.items.map((item, itemIndex) => (
                                                <div key={itemIndex}>
                                                    <strong>{t(item.label)}</strong>

                                                    <span>{t(item.value)}</span>

                                                    <i className="bi bi-arrow-up-right" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function createTextField(key: keyof Service01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextareaField(key: keyof Service01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createImageField(key: keyof Service01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'image',
        folder: 'services',
        accept: 'image/*',
    };
}

function createHeroInspector(): InspectorField[] {
    return [
        createTextField('visualEyebrow', 'Visual Eyebrow'),
        createTextField('visualTitle', 'Visual Title'),
        createTextField('visualTitleAccent', 'Visual Title Accent'),
        createTextareaField('visualDescription', 'Visual Description'),
    ];
}

function createSummaryInspector(): InspectorField[] {
    return [
        createTextField('securityText', 'Security Text'),
        createTextField('noCodeText', 'No Code Text'),
        createTextField('stepsCountText', 'Steps Count Text'),
    ];
}

function createStepInspector(index: 1 | 2 | 3): InspectorField[] {
    return [
        createTextField(`step${index}Number`, `Step ${index} Number`),

        createTextField(`step${index}Label`, `Step ${index} Label`),

        createTextField(`step${index}Title`, `Step ${index} Title`),

        createTextareaField(`step${index}Description`, `Step ${index} Description`),
    ];
}
function createMapInspector(): InspectorField[] {
    return [
        createTextField('zoomText', 'Zoom Text'),

        createTextField('mapStartTitle', 'Map Start Title'),
        createTextareaField('mapStartDescription', 'Map Start Description'),

        createTextField('readyTitle', 'Ready Title'),
        createTextareaField('readyDescription', 'Ready Description'),

        createTextField('selfMapLabel', 'Self Map Label'),
        createTextField('serviceMapLabel', 'Service Map Label'),
        createTextField('readyMapLabel', 'Ready Map Label'),
    ];
}

function createSetupItemInspector(prefix: 'self' | 'service', index: 1 | 2 | 3): InspectorField[] {
    return [
        createTextField(
            `${prefix}Item${index}Title`,
            `${prefix === 'self' ? 'Self' : 'Service'} Item ${index} Title`,
        ),

        createTextareaField(
            `${prefix}Item${index}Description`,
            `${prefix === 'self' ? 'Self' : 'Service'} Item ${index} Description`,
        ),
    ];
}

function createSetupInspector(): InspectorField[] {
    return [
        createTextField('selfSetupTitle', 'Self Setup Title'),

        ...createSetupItemInspector('self', 1),
        ...createSetupItemInspector('self', 2),
        ...createSetupItemInspector('self', 3),

        createTextField('serviceSetupTitle', 'Service Setup Title'),

        ...createSetupItemInspector('service', 1),
        ...createSetupItemInspector('service', 2),
        ...createSetupItemInspector('service', 3),
    ];
}

function createSetupCardInspector(type: 'self' | 'service'): InspectorField[] {
    const title = type === 'self' ? 'Self' : 'Service';

    return [
        createTextField(`${type}SetupLabel`, `${title} Setup Label`),

        createTextField(`${type}SetupCardTitle`, `${title} Setup Card Title`),

        createTextField(`${type}SetupCardTitleAccent`, `${title} Setup Card Title Accent`),

        createTextareaField(`${type}SetupCardDescription`, `${title} Setup Card Description`),

        createTextField(`${type}SetupPrimaryText`, `${title} Setup Primary Button`),

        createTextField(`${type}SetupSecondaryText`, `${title} Setup Secondary Button`),

        createTextField(`${type}SetupLinkText`, `${title} Setup Link Text`),

        createTextField(`${type}SetupHref`, `${title} Setup Link`),
    ];
}

function createVisualInspector(): InspectorField[] {
    return [
        createTextField('templateBadgeText', 'Template Badge Text'),
        createTextField('pagesBadgeText', 'Pages Badge Text'),
        createTextField('menuBadgeText', 'Menu Badge Text'),
    ];
}

function createFeatureSectionInspector(): InspectorField[] {
    return [
        createTextField('featuresTabText', 'Features Tab Text'),
        createTextField('builderTabText', 'Builder Tab Text'),
        createTextField('featuresButtonText', 'Features Button Text'),
    ];
}

function createFeatureInspector(index: 1 | 2 | 3 | 4): InspectorField[] {
    return [
        createTextField(`feature${index}Title`, `Feature ${index} Title`),

        createTextareaField(`feature${index}Description`, `Feature ${index} Description`),

        createTextField(`feature${index}Item1Label`, `Feature ${index} Item 1 Label`),

        createTextField(`feature${index}Item1Value`, `Feature ${index} Item 1 Value`),

        createTextField(`feature${index}Item2Label`, `Feature ${index} Item 2 Label`),

        createTextField(`feature${index}Item2Value`, `Feature ${index} Item 2 Value`),
    ];
}

function createPublishInspector(): InspectorField[] {
    return [
        createTextField('templateReadyText', 'Template Ready Text'),

        createTextField('pageHomeText', 'Page Home Text'),
        createTextField('pageServicesText', 'Page Services Text'),
        createTextField('pageAboutText', 'Page About Text'),
        createTextField('menuReadyText', 'Menu Ready Text'),

        createTextField('websiteText', 'Website Text'),
        createTextField('liveText', 'Live Text'),
        createTextField('domainText', 'Domain Text'),
        createTextField('domainConnectedText', 'Domain Connected Text'),
    ];
}

function createInspector(): InspectorField[] {
    return [
        ...createHeroInspector(),
        ...createSummaryInspector(),
        ...createStepInspector(1),
        ...createStepInspector(2),
        ...createStepInspector(3),
        createTextField('stepsButtonText', 'Steps Button Text'),
        ...createMapInspector(),
        ...createSetupInspector(),
        ...createSetupCardInspector('self'),
        ...createSetupCardInspector('service'),
        ...createVisualInspector(),
        ...createFeatureSectionInspector(),
        ...createFeatureInspector(1),
        ...createFeatureInspector(2),
        ...createFeatureInspector(3),
        ...createFeatureInspector(4),
        ...createPublishInspector(),
        createImageField('browserPreviewImage', 'Browser Preview'),
        createImageField('mobilePreviewImage', 'Mobile Preview'),
        createImageField('analyticsPreviewImage', 'Analytics Card'),
        createImageField('plantPreviewImage', 'Plant Image'),
    ];
}

export const SERVICE_01: RegItem = {
    kind: 'service-page-01',
    label: 'Service Page 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <Service01 {...(props as unknown as Service01Props)} />,
};
export default Service01;
