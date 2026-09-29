import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
export interface Service01Props {
    siteId?: string;
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

    browserPreviewImage?: string;
    mobilePreviewImage?: string;
    analyticsPreviewImage?: string;
    plantPreviewImage?: string;
    heroPrimaryText?: LocalizedText;
    heroSecondaryText?: LocalizedText;
    heroLaunchText?: LocalizedText;

    workflowEyebrow?: LocalizedText;
    workflowTitle?: LocalizedText;
    workflowTitleAccent?: LocalizedText;
    workflowDescription?: LocalizedText;
    workflowDomain?: LocalizedText;
    workflowNoteLine1?: LocalizedText;
    workflowNoteLine2?: LocalizedText;
    launchAnnotationLine1?: LocalizedText;
    launchAnnotationLine2?: LocalizedText;
    launchImageAlt?: LocalizedText;
    launchAnnotationIdea?: LocalizedText;
    launchAnnotationResult?: LocalizedText;
    launchEyebrow?: LocalizedText;
    launchTitle?: LocalizedText;
    launchTitleAccent?: LocalizedText;
    launchDescription?: LocalizedText;
    featuresEyebrow?: LocalizedText;
    featuresAnnotationLine1?: LocalizedText;
    featuresAnnotationLine2?: LocalizedText;
    stepButtonStart?: LocalizedText;
    stepButtonDetails?: LocalizedText;
    stepButtonExplore?: LocalizedText;
    heroBrowserAlt?: LocalizedText;
    heroAnnotation?: LocalizedText;
    heroMobileAlt?: LocalizedText;
}

export type SetupStep = {
    number: LocalizedText;
    label: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
};

export type FeatureItem = {
    label: LocalizedText;
    value: LocalizedText;
};

export type FeatureCard = {
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
    items: FeatureItem[];
    visual: 'builder' | 'templates' | 'pages' | 'publish';
    image: string;
};

export const DEFAULT_PROPS: Required<Service01Props> = {
    siteId: '',
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
            vi: 'Xây dựng website với hướng dẫn trực quan',
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

    browserPreviewImage: '/assets/images/feature-02.png',

    mobilePreviewImage: '/assets/images/mobile-preview.png',

    analyticsPreviewImage: '/assets/images/analytics-card.png',

    plantPreviewImage: '/assets/images/plant.png',

    heroPrimaryText: {
        sourceLocale: 'en',
        default: 'Start for Free',
        translations: { vi: 'Bắt đầu miễn phí', ja: '無料で始める' },
    },

    heroSecondaryText: {
        sourceLocale: 'en',
        default: 'Watch Video',
        translations: { vi: 'Xem video', ja: '動画を見る' },
    },

    heroLaunchText: {
        sourceLocale: 'en',
        default: 'Launch in minutes',
        translations: { vi: 'Ra mắt trong vài phút', ja: '数分で公開' },
    },
    workflowEyebrow: {
        sourceLocale: 'en',
        default: 'HOW IT WORKS',
        translations: {
            vi: 'CÁCH HOẠT ĐỘNG',
            ja: '使い方',
        },
    },
    workflowTitle: {
        sourceLocale: 'en',
        default: 'From idea to',
        translations: {
            vi: 'Từ ý tưởng đến',
            ja: 'アイデアから',
        },
    },
    workflowTitleAccent: {
        sourceLocale: 'en',
        default: 'live website',
        translations: {
            vi: 'website hoàn chỉnh',
            ja: '公開サイト',
        },
    },
    workflowDescription: {
        sourceLocale: 'en',
        default: 'A simple, guided process to get you online — fast.',
        translations: {
            vi: 'Quy trình đơn giản, có hướng dẫn để đưa website của bạn lên online nhanh chóng.',
            ja: 'シンプルで分かりやすい手順で、すばやくサイトを公開できます。',
        },
    },
    workflowDomain: {
        sourceLocale: 'en',
        default: 'www.yoursite.com',
        translations: {
            vi: 'www.yoursite.com',
            ja: 'www.yoursite.com',
        },
    },
    workflowNoteLine1: {
        sourceLocale: 'en',
        default: 'Your website.',
        translations: {
            vi: 'Website của bạn.',
            ja: 'あなたのWebサイト。',
        },
    },
    workflowNoteLine2: {
        sourceLocale: 'en',
        default: 'A brighter future.',
        translations: {
            vi: 'Một tương lai tươi sáng hơn.',
            ja: 'より明るい未来。',
        },
    },
    launchAnnotationLine1: {
        sourceLocale: 'en',
        default: 'Drag. Drop. Publish.',
        translations: {
            vi: 'Kéo. Thả. Xuất bản.',
            ja: 'ドラッグ。ドロップ。公開。',
        },
    },
    launchAnnotationLine2: {
        sourceLocale: 'en',
        default: "It's that simple.",
        translations: {
            vi: 'Đơn giản như vậy thôi.',
            ja: 'それだけ簡単です。',
        },
    },
    launchImageAlt: {
        sourceLocale: 'en',
        default: 'Visual website builder',
        translations: {
            vi: 'Trình xây dựng website trực quan',
            ja: 'ビジュアルWebサイトビルダー',
        },
    },
    launchAnnotationIdea: {
        sourceLocale: 'en',
        default: 'Your idea',
        translations: {
            vi: 'Ý tưởng của bạn',
            ja: 'あなたのアイデア',
        },
    },
    launchAnnotationResult: {
        sourceLocale: 'en',
        default: 'Real website',
        translations: {
            vi: 'Website thực tế',
            ja: '実際のWebサイト',
        },
    },
    launchEyebrow: {
        sourceLocale: 'en',
        default: 'POWERFUL, YET SIMPLE',
        translations: {
            vi: 'MẠNH MẼ, NHƯNG ĐƠN GIẢN',
            ja: '高機能なのにシンプル',
        },
    },
    launchTitle: {
        sourceLocale: 'en',
        default: 'Everything you need',
        translations: {
            vi: 'Mọi thứ bạn cần',
            ja: '必要なものをすべて',
        },
    },
    launchTitleAccent: {
        sourceLocale: 'en',
        default: 'to launch.',
        translations: {
            vi: 'để ra mắt.',
            ja: '公開するために。',
        },
    },
    launchDescription: {
        sourceLocale: 'en',
        default:
            'Our website builder gives you all the tools to create, customize, and grow your online presence — no coding required.',
        translations: {
            vi: 'Trình xây dựng website cung cấp mọi công cụ để bạn tạo, tùy chỉnh và phát triển sự hiện diện trực tuyến — không cần viết code.',
            ja: 'Webサイトビルダーなら、コーディング不要で作成、カスタマイズ、オンラインでの成長に必要なすべてのツールを利用できます。',
        },
    },
    featuresEyebrow: {
        sourceLocale: 'en',
        default: 'FEATURES',
        translations: {
            vi: 'TÍNH NĂNG',
            ja: '機能',
        },
    },
    featuresAnnotationLine1: {
        sourceLocale: 'en',
        default: 'Build websites',
        translations: {
            vi: 'Xây dựng website',
            ja: 'Webサイトを',
        },
    },
    featuresAnnotationLine2: {
        sourceLocale: 'en',
        default: 'easier than ever!',
        translations: {
            vi: 'dễ dàng hơn bao giờ hết!',
            ja: 'これまで以上に簡単に！',
        },
    },
    stepButtonStart: {
        sourceLocale: 'en',
        default: 'Start now',
        translations: {
            vi: 'Bắt đầu ngay',
            ja: '今すぐ始める',
        },
    },
    stepButtonDetails: {
        sourceLocale: 'en',
        default: 'View details',
        translations: {
            vi: 'Xem chi tiết',
            ja: '詳細を見る',
        },
    },
    stepButtonExplore: {
        sourceLocale: 'en',
        default: 'Explore now',
        translations: {
            vi: 'Khám phá ngay',
            ja: '今すぐ確認する',
        },
    },
    heroBrowserAlt: {
        sourceLocale: 'en',
        default: 'Website builder',
        translations: {
            vi: 'Trình xây dựng website',
            ja: 'Webサイトビルダー',
        },
    },
    heroAnnotation: {
        sourceLocale: 'en',
        default: 'Drag. Drop. Build.',
        translations: {
            vi: 'Kéo. Thả. Tạo website.',
            ja: 'ドラッグ。ドロップ。作成。',
        },
    },
    heroMobileAlt: {
        sourceLocale: 'en',
        default: 'Website preview on mobile',
        translations: {
            vi: 'Xem trước website trên điện thoại',
            ja: 'スマートフォンでのWebサイトプレビュー',
        },
    },
};
