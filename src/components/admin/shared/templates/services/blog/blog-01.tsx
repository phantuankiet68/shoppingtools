'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';

import styles from '@/components/admin/shared/templates/services/blog/styles/blog-01.module.css';

type BlogItem = {
    id: number;
    image: string;
    category: LocalizedText;
    date: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    author: LocalizedText;
    role: LocalizedText;
    avatar: string;
};

type StoryItem = {
    image: string;
    category: LocalizedText;
    categoryIcon: string;
    title: LocalizedText;
    description: LocalizedText;
    date: LocalizedText;
    readTime: LocalizedText;
};
type CommunityItem = {
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
    featured?: boolean;
};

export interface Blog01Props {
    /* ==========================================================
       Breadcrumb
    ========================================================== */

    breadcrumbHome?: LocalizedText;
    breadcrumbCurrent?: LocalizedText;

    /* ==========================================================
       Hero
    ========================================================== */

    heroBadge?: LocalizedText;
    heroTitle?: LocalizedText;
    heroTitleAccent?: LocalizedText;
    heroDescription?: LocalizedText;

    heroPrimaryButton?: LocalizedText;
    heroSecondaryButton?: LocalizedText;

    heroReviewText?: LocalizedText;
    heroRating?: LocalizedText;

    heroImage?: string;

    /* ==========================================================
       Hero Features
    ========================================================== */

    feature1Icon?: string;
    feature1Title?: LocalizedText;
    feature1Description?: LocalizedText;

    feature2Icon?: string;
    feature2Title?: LocalizedText;
    feature2Description?: LocalizedText;

    feature3Icon?: string;
    feature3Title?: LocalizedText;
    feature3Description?: LocalizedText;

    feature4Icon?: string;
    feature4Title?: LocalizedText;
    feature4Description?: LocalizedText;

    /* ==========================================================
       Blog Section
    ========================================================== */

    blogSectionTitle?: LocalizedText;
    blogSectionTitleAccent?: LocalizedText;
    blogSectionDescription?: LocalizedText;
    blogActionButton?: LocalizedText;

    /* ==========================================================
       Blog 01
    ========================================================== */

    blog1Id?: number;
    blog1Image?: string;
    blog1category?: LocalizedText;
    blog1Date?: LocalizedText;
    blog1Title?: LocalizedText;
    blog1Description?: LocalizedText;
    blog1Author?: LocalizedText;
    blog1Role?: LocalizedText;
    blog1Avatar?: string;

    /* ==========================================================
       Blog 02
    ========================================================== */

    blog2Id?: number;
    blog2Image?: string;
    blog2category?: LocalizedText;
    blog2Date?: LocalizedText;
    blog2Title?: LocalizedText;
    blog2Description?: LocalizedText;
    blog2Author?: LocalizedText;
    blog2Role?: LocalizedText;
    blog2Avatar?: string;

    /* ==========================================================
       Blog 03
    ========================================================== */

    blog3Id?: number;
    blog3Image?: string;
    blog3category?: LocalizedText;
    blog3Date?: LocalizedText;
    blog3Title?: LocalizedText;
    blog3Description?: LocalizedText;
    blog3Author?: LocalizedText;
    blog3Role?: LocalizedText;
    blog3Avatar?: string;

    /* ==========================================================
       Blog 04
    ========================================================== */

    blog4Id?: number;
    blog4Image?: string;
    blog4category?: LocalizedText;
    blog4Date?: LocalizedText;
    blog4Title?: LocalizedText;
    blog4Description?: LocalizedText;
    blog4Author?: LocalizedText;
    blog4Role?: LocalizedText;
    blog4Avatar?: string;

    /* ==========================================================
       Story Section
    ========================================================== */

    storyTitle?: LocalizedText;
    storyTitleAccent?: LocalizedText;
    storyDescription?: LocalizedText;
    storyActionText?: LocalizedText;
    storyActionLink?: string;

    /* ==========================================================
       Featured Story
    ========================================================== */

    featuredImage?: string;
    featuredBadge?: LocalizedText;
    featuredCategory?: LocalizedText;
    featuredCategoryIcon?: string;
    featuredTitle?: LocalizedText;
    featuredDate?: LocalizedText;
    featuredReadTime?: LocalizedText;
    featuredDescription?: LocalizedText;
    featuredButton?: LocalizedText;

    /* ==========================================================
       Story 01
    ========================================================== */

    story1Image?: string;
    story1Category?: LocalizedText;
    story1CategoryIcon?: string;
    story1Title?: LocalizedText;
    story1Description?: LocalizedText;
    story1Date?: LocalizedText;
    story1ReadTime?: LocalizedText;

    /* ==========================================================
       Story 02
    ========================================================== */

    story2Image?: string;
    story2Category?: LocalizedText;
    story2CategoryIcon?: string;
    story2Title?: LocalizedText;
    story2Description?: LocalizedText;
    story2Date?: LocalizedText;
    story2ReadTime?: LocalizedText;

    /* ==========================================================
       Story 03
    ========================================================== */

    story3Image?: string;
    story3Category?: LocalizedText;
    story3CategoryIcon?: string;
    story3Title?: LocalizedText;
    story3Description?: LocalizedText;
    story3Date?: LocalizedText;
    story3ReadTime?: LocalizedText;

    /* ==========================================================
       Community
    ========================================================== */

    trekkerBadge?: LocalizedText;
    trekkerTitle?: LocalizedText;
    trekkerTitleAccent?: LocalizedText;
    trekkerDescription?: LocalizedText;

    /* ==========================================================
       Reviewer
    ========================================================== */

    reviewerAvatar?: string;
    reviewerName?: LocalizedText;
    reviewerRole?: LocalizedText;
    reviewerVerified?: LocalizedText;
    reviewerQuote?: LocalizedText;
    reviewButton?: LocalizedText;

    /* ==========================================================
       Community Card 01
    ========================================================== */

    community1Icon?: string;
    community1Title?: LocalizedText;
    community1Description?: LocalizedText;

    /* ==========================================================
       Community Card 02
    ========================================================== */

    community2Icon?: string;
    community2Title?: LocalizedText;
    community2Description?: LocalizedText;
    community2Featured?: boolean;

    /* ==========================================================
       Community Card 03
    ========================================================== */

    community3Icon?: string;
    community3Title?: LocalizedText;
    community3Description?: LocalizedText;

    /* ==========================================================
       Travel Hero
    ========================================================== */

    travelHeroImage?: string;
    travelHeroTitle?: LocalizedText;
    travelHeroStories?: LocalizedText;
    travelHeroLocation?: LocalizedText;

    /* ==========================================================
       Travel Video
    ========================================================== */

    travelVideoImage?: string;
    travelVideoDuration?: LocalizedText;
    travelVideoBadge?: LocalizedText;
    travelVideoTitle?: LocalizedText;
    travelVideoDescription?: LocalizedText;

    travelViews?: LocalizedText;
    travelViewsLabel?: LocalizedText;

    travelRating?: LocalizedText;
    travelRatingLabel?: LocalizedText;

    travelComments?: LocalizedText;
    travelCommentsLabel?: LocalizedText;

    travelButton?: LocalizedText;
}

export const DEFAULT_PROPS: Required<Blog01Props> = {
    breadcrumbHome: {
        sourceLocale: 'en',
        default: 'Home',
        translations: { vi: 'Trang chủ', ja: 'ホーム' },
    },
    breadcrumbCurrent: {
        sourceLocale: 'en',
        default: 'Blog',
        translations: { vi: 'Blog', ja: 'ブログ' },
    },

    heroBadge: {
        sourceLocale: 'en',
        default: 'AI-Powered Website Builder',
        translations: { vi: 'Trình tạo website tích hợp AI', ja: 'AI搭載ウェブサイトビルダー' },
    },
    heroTitle: {
        sourceLocale: 'en',
        default: 'Build Beautiful Websites Visually',
        translations: {
            vi: 'Thiết kế website đẹp bằng trình chỉnh sửa trực quan',
            ja: 'ビジュアルエディターで美しいウェブサイトを構築',
        },
    },
    heroTitleAccent: {
        sourceLocale: 'en',
        default: 'Launch Instantly.',
        translations: { vi: 'Xuất bản ngay lập tức.', ja: 'すぐに公開できます。' },
    },
    heroDescription: {
        sourceLocale: 'en',
        default:
            'Kbuilder is the all-in-one platform to create, customize and publish stunning websites — without coding, without limits.',
        translations: {
            vi: 'Kbuilder là nền tảng tất cả trong một giúp bạn tạo, tùy chỉnh và xuất bản website chuyên nghiệp mà không cần lập trình.',
            ja: 'Kbuilderは、コーディング不要で美しいウェブサイトを作成・カスタマイズ・公開できるオールインワンプラットフォームです。',
        },
    },

    heroPrimaryButton: {
        sourceLocale: 'en',
        default: 'Start Building Free',
        translations: { vi: 'Bắt đầu miễn phí', ja: '無料で始める' },
    },
    heroSecondaryButton: {
        sourceLocale: 'en',
        default: 'Watch Demo',
        translations: { vi: 'Xem demo', ja: 'デモを見る' },
    },
    heroReviewText: {
        sourceLocale: 'en',
        default: 'Trusted by 10,000+ creators and businesses',
        translations: {
            vi: 'Được hơn 10.000 nhà sáng tạo và doanh nghiệp tin dùng',
            ja: '10,000人以上のクリエイターと企業に信頼されています',
        },
    },
    heroRating: {
        sourceLocale: 'en',
        default: '4.9/5',
        translations: { vi: '4.9/5', ja: '4.9/5' },
    },
    heroImage: '/assets/images/blog/hero.jpg',

    feature1Icon: 'bi-magic',
    feature2Icon: 'bi-grid-3x3-gap-fill',
    feature3Icon: 'bi-robot',
    feature4Icon: 'bi-cloud-upload-fill',

    feature1Title: {
        sourceLocale: 'en',
        default: 'Drag & Drop',
        translations: { vi: 'Kéo và thả', ja: 'ドラッグ＆ドロップ' },
    },
    feature1Description: {
        sourceLocale: 'en',
        default: 'No code needed',
        translations: { vi: 'Không cần lập trình', ja: 'コード不要' },
    },

    feature2Title: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: { vi: 'Mẫu giao diện', ja: 'テンプレート' },
    },
    feature2Description: {
        sourceLocale: 'en',
        default: '100+ professional',
        translations: { vi: 'Hơn 100 mẫu chuyên nghiệp', ja: '100種類以上のプロ向けテンプレート' },
    },

    feature3Title: {
        sourceLocale: 'en',
        default: 'AI Automation',
        translations: { vi: 'Tự động hóa bằng AI', ja: 'AI自動化' },
    },
    feature3Description: {
        sourceLocale: 'en',
        default: 'Save time & effort',
        translations: { vi: 'Tiết kiệm thời gian và công sức', ja: '時間と労力を節約' },
    },

    feature4Title: {
        sourceLocale: 'en',
        default: 'Publish',
        translations: { vi: 'Xuất bản', ja: '公開' },
    },
    feature4Description: {
        sourceLocale: 'en',
        default: 'Go live in minutes',
        translations: { vi: 'Đưa website lên chỉ trong vài phút', ja: '数分で公開' },
    },

    blogSectionTitle: {
        sourceLocale: 'en',
        default: 'Insights &',
        translations: { vi: 'Kiến thức &', ja: 'インサイト＆' },
    },
    blogSectionTitleAccent: {
        sourceLocale: 'en',
        default: 'Inspiration',
        translations: { vi: 'Cảm hứng', ja: 'インスピレーション' },
    },
    blogSectionDescription: {
        sourceLocale: 'en',
        default:
            'Explore industry trends, tutorials and stories to help you build better websites and grow your business.',
        translations: {
            vi: 'Khám phá xu hướng, hướng dẫn và những câu chuyện hữu ích giúp bạn xây dựng website tốt hơn và phát triển doanh nghiệp.',
            ja: '業界トレンドやチュートリアル、ストーリーを通じて、より優れたウェブサイト制作とビジネス成長をサポートします。',
        },
    },
    blogActionButton: {
        sourceLocale: 'en',
        default: 'View all articles',
        translations: { vi: 'Xem tất cả bài viết', ja: 'すべての記事を見る' },
    },

    blog1category: {
        sourceLocale: 'en',
        default: 'Web Design',
        translations: { vi: 'Thiết kế web', ja: 'Webデザイン' },
    },
    blog1Date: {
        sourceLocale: 'en',
        default: 'May 20, 2024',
        translations: { vi: '20 tháng 5, 2024', ja: '2024年5月20日' },
    },
    blog1Title: {
        sourceLocale: 'en',
        default: '10 Web Design Trends That Will Dominate 2024',
        translations: {
            vi: '10 xu hướng thiết kế web sẽ dẫn đầu năm 2024',
            ja: '2024年をリードする10のWebデザイントレンド',
        },
    },
    blog1Description: {
        sourceLocale: 'en',
        default:
            'Discover the latest UI, UX and web design trends that are shaping modern digital experiences.',
        translations: {
            vi: 'Khám phá những xu hướng UI, UX và thiết kế web mới nhất đang định hình trải nghiệm số hiện đại.',
            ja: '現代のデジタル体験を形作る最新のUI・UX・Webデザインのトレンドをご紹介します。',
        },
    },
    blog1Author: {
        sourceLocale: 'en',
        default: 'Michael Chen',
        translations: { vi: 'Michael Chen', ja: 'Michael Chen' },
    },
    blog1Role: {
        sourceLocale: 'en',
        default: 'Product Designer',
        translations: { vi: 'Nhà thiết kế sản phẩm', ja: 'プロダクトデザイナー' },
    },

    blog2category: {
        sourceLocale: 'en',
        default: 'Tutorials',
        translations: { vi: 'Hướng dẫn', ja: 'チュートリアル' },
    },
    blog2Date: {
        sourceLocale: 'en',
        default: 'May 18, 2024',
        translations: { vi: '18 tháng 5, 2024', ja: '2024年5月18日' },
    },
    blog2Title: {
        sourceLocale: 'en',
        default: 'How To Build A Stunning Portfolio Website',
        translations: {
            vi: 'Cách xây dựng website portfolio chuyên nghiệp',
            ja: '魅力的なポートフォリオサイトの作り方',
        },
    },
    blog2Description: {
        sourceLocale: 'en',
        default:
            'Learn how to create a modern portfolio website using reusable components and responsive layouts.',
        translations: {
            vi: 'Tìm hiểu cách tạo website portfolio hiện đại với các thành phần tái sử dụng và giao diện đáp ứng.',
            ja: '再利用可能なコンポーネントとレスポンシブレイアウトでモダンなポートフォリオサイトを作成する方法を学びましょう。',
        },
    },
    blog2Author: {
        sourceLocale: 'en',
        default: 'Sophia Martinez',
        translations: { vi: 'Sophia Martinez', ja: 'Sophia Martinez' },
    },
    blog2Role: {
        sourceLocale: 'en',
        default: 'UI/UX Designer',
        translations: { vi: 'Nhà thiết kế UI/UX', ja: 'UI/UXデザイナー' },
    },

    blog3category: {
        sourceLocale: 'en',
        default: 'Marketing',
        translations: { vi: 'Tiếp thị', ja: 'マーケティング' },
    },
    blog3Date: {
        sourceLocale: 'en',
        default: 'May 15, 2024',
        translations: { vi: '15 tháng 5, 2024', ja: '2024年5月15日' },
    },
    blog3Title: {
        sourceLocale: 'en',
        default: 'Content Marketing Strategies For SaaS Startups',
        translations: {
            vi: 'Chiến lược tiếp thị nội dung cho startup SaaS',
            ja: 'SaaSスタートアップ向けコンテンツマーケティング戦略',
        },
    },
    blog3Description: {
        sourceLocale: 'en',
        default:
            'Grow your SaaS business with proven content marketing strategies that convert visitors.',
        translations: {
            vi: 'Phát triển doanh nghiệp SaaS với các chiến lược tiếp thị nội dung đã được chứng minh giúp tăng tỷ lệ chuyển đổi.',
            ja: '実績あるコンテンツマーケティング戦略でSaaSビジネスを成長させ、訪問者を顧客へと転換しましょう。',
        },
    },
    blog3Author: {
        sourceLocale: 'en',
        default: 'David Park',
        translations: { vi: 'David Park', ja: 'David Park' },
    },
    blog3Role: {
        sourceLocale: 'en',
        default: 'Marketing Manager',
        translations: { vi: 'Quản lý tiếp thị', ja: 'マーケティングマネージャー' },
    },

    blog4category: {
        sourceLocale: 'en',
        default: 'Business',
        translations: { vi: 'Kinh doanh', ja: 'ビジネス' },
    },
    blog4Date: {
        sourceLocale: 'en',
        default: 'May 12, 2024',
        translations: { vi: '12 tháng 5, 2024', ja: '2024年5月12日' },
    },
    blog4Title: {
        sourceLocale: 'en',
        default: 'Scaling Your Business With No-Code Tools',
        translations: {
            vi: 'Mở rộng doanh nghiệp với các công cụ No-Code',
            ja: 'ノーコードツールでビジネスを拡大する方法',
        },
    },
    blog4Description: {
        sourceLocale: 'en',
        default: 'Discover how automation and no-code platforms help businesses scale much faster.',
        translations: {
            vi: 'Khám phá cách tự động hóa và nền tảng No-Code giúp doanh nghiệp phát triển nhanh hơn.',
            ja: '自動化とノーコードプラットフォームがビジネスの成長を加速させる方法をご紹介します。',
        },
    },
    blog4Author: {
        sourceLocale: 'en',
        default: 'Emily Johnson',
        translations: { vi: 'Emily Johnson', ja: 'Emily Johnson' },
    },
    blog4Role: {
        sourceLocale: 'en',
        default: 'Business Consultant',
        translations: { vi: 'Chuyên gia tư vấn doanh nghiệp', ja: 'ビジネスコンサルタント' },
    },

    storyTitle: {
        sourceLocale: 'en',
        default: 'Latest',
        translations: { vi: 'Mới nhất', ja: '最新' },
    },
    storyTitleAccent: {
        sourceLocale: 'en',
        default: 'Stories',
        translations: { vi: 'Câu chuyện', ja: 'ストーリー' },
    },
    storyDescription: {
        sourceLocale: 'en',
        default:
            'Fresh insights, expert tips and inspiring stories to help you build, grow and succeed with confidence and succeed with confidence.',
        translations: {
            vi: 'Những góc nhìn mới, mẹo từ chuyên gia và các câu chuyện truyền cảm hứng giúp bạn xây dựng, phát triển và thành công một cách tự tin.',
            ja: '新しい知見や専門家のアドバイス、インスピレーションあふれるストーリーを通じて、自信を持って成長し成功へ導きます。',
        },
    },
    storyActionText: {
        sourceLocale: 'en',
        default: 'See all articles',
        translations: { vi: 'Xem tất cả bài viết', ja: 'すべての記事を見る' },
    },

    featuredBadge: {
        sourceLocale: 'en',
        default: 'FEATURED',
        translations: { vi: 'NỔI BẬT', ja: '注目記事' },
    },
    featuredCategory: {
        sourceLocale: 'en',
        default: 'Food & Drink',
        translations: { vi: 'Ẩm thực', ja: 'グルメ' },
    },
    featuredTitle: {
        sourceLocale: 'en',
        default: 'Los Angeles food & drink guide: 10 things to try in Los Angeles, California',
        translations: {
            vi: 'Cẩm nang ẩm thực Los Angeles: 10 món nhất định phải thử tại California',
            ja: 'ロサンゼルスグルメガイド：カリフォルニアで味わうべき10の名物',
        },
    },
    featuredDate: {
        sourceLocale: 'en',
        default: 'Aug 12, 2024',
        translations: { vi: '12 tháng 8, 2024', ja: '2024年8月12日' },
    },
    featuredReadTime: {
        sourceLocale: 'en',
        default: '6 min read',
        translations: { vi: 'Đọc trong 6 phút', ja: '6分で読めます' },
    },
    featuredDescription: {
        sourceLocale: 'en',
        default:
            'From iconic landmarks to hidden local gems, discover the best restaurants, cafes and unforgettable culinary experiences throughout Los Angeles.',
        translations: {
            vi: 'Khám phá những nhà hàng, quán cà phê và trải nghiệm ẩm thực đáng nhớ từ các địa danh nổi tiếng đến những góc nhỏ ít người biết tại Los Angeles.',
            ja: '有名スポットから地元の隠れた名店まで、ロサンゼルスで最高のレストランやカフェ、忘れられないグルメ体験をご紹介します。',
        },
    },
    featuredButton: {
        sourceLocale: 'en',
        default: 'Read article',
        translations: { vi: 'Đọc bài viết', ja: '記事を読む' },
    },

    story1Category: {
        sourceLocale: 'en',
        default: 'Travel',
        translations: { vi: 'Du lịch', ja: '旅行' },
    },
    story1Title: {
        sourceLocale: 'en',
        default: "15 South London Markets You'll Love: From Markets to South London",
        translations: {
            vi: '15 khu chợ nổi tiếng ở Nam London mà bạn không nên bỏ lỡ',
            ja: '南ロンドンで訪れたい15の人気マーケット',
        },
    },
    story1Description: {
        sourceLocale: 'en',
        default:
            'Explore vibrant weekend markets, discover unique local shops, enjoy authentic street food, and uncover hidden gems across South London with this complete travel guide.',
        translations: {
            vi: 'Khám phá những khu chợ cuối tuần sôi động, cửa hàng địa phương độc đáo và ẩm thực đường phố hấp dẫn tại Nam London.',
            ja: '南ロンドンの活気あるマーケットや個性的なショップ、本格的なストリートフードを満喫できる旅行ガイドです。',
        },
    },
    story1Date: {
        sourceLocale: 'en',
        default: 'Jul 28, 2024',
        translations: { vi: '28 tháng 7, 2024', ja: '2024年7月28日' },
    },
    story1ReadTime: {
        sourceLocale: 'en',
        default: '5 min read',
        translations: { vi: 'Đọc trong 5 phút', ja: '5分で読めます' },
    },

    story2Category: {
        sourceLocale: 'en',
        default: 'Health',
        translations: { vi: 'Sức khỏe', ja: '健康' },
    },
    story2Title: {
        sourceLocale: 'en',
        default: '10 incredible healthy recipes you can cook using plants in 2024',
        translations: {
            vi: '10 món ăn lành mạnh từ thực vật bạn nên thử trong năm 2024',
            ja: '2024年に試したい植物ベースのヘルシーレシピ10選',
        },
    },
    story2Description: {
        sourceLocale: 'en',
        default:
            'Discover simple plant-based recipes packed with fresh ingredients, essential nutrients, and delicious flavors to support a healthier lifestyle every day.',
        translations: {
            vi: 'Khám phá những công thức món ăn từ thực vật đơn giản, giàu dinh dưỡng và thơm ngon cho cuộc sống khỏe mạnh.',
            ja: '新鮮な食材と豊富な栄養を取り入れた、美味しい植物ベースレシピをご紹介します。',
        },
    },
    story2Date: {
        sourceLocale: 'en',
        default: 'Jul 20, 2024',
        translations: { vi: '20 tháng 7, 2024', ja: '2024年7月20日' },
    },
    story2ReadTime: {
        sourceLocale: 'en',
        default: '4 min read',
        translations: { vi: 'Đọc trong 4 phút', ja: '4分で読めます' },
    },

    story3Category: {
        sourceLocale: 'en',
        default: 'Tips & Culture',
        translations: { vi: 'Mẹo & Văn hóa', ja: 'ヒント＆カルチャー' },
    },
    story3Title: {
        sourceLocale: 'en',
        default: 'Visiting Chicago on a Budget: Affordable Eats and Attraction Deals',
        translations: {
            vi: 'Du lịch Chicago tiết kiệm: Ăn ngon và khám phá với chi phí hợp lý',
            ja: '節約しながら楽しむシカゴ旅行：お得なグルメと観光情報',
        },
    },
    story3Description: {
        sourceLocale: 'en',
        default:
            'Plan an unforgettable Chicago adventure with budget-friendly restaurants, free attractions, transportation tips, and local experiences without overspending.',
        translations: {
            vi: 'Lên kế hoạch khám phá Chicago với các nhà hàng giá hợp lý, điểm tham quan miễn phí và nhiều trải nghiệm thú vị.',
            ja: '手頃なレストランや無料観光スポット、お得な移動方法でシカゴを満喫しましょう。',
        },
    },
    story3Date: {
        sourceLocale: 'en',
        default: 'Jul 08, 2024',
        translations: { vi: '08 tháng 7, 2024', ja: '2024年7月8日' },
    },
    story3ReadTime: {
        sourceLocale: 'en',
        default: '6 min read',
        translations: { vi: 'Đọc trong 6 phút', ja: '6分で読めます' },
    },

    trekkerBadge: {
        sourceLocale: 'en',
        default: 'Community Highlights',
        translations: { vi: 'Điểm nổi bật cộng đồng', ja: 'コミュニティハイライト' },
    },
    trekkerTitle: {
        sourceLocale: 'en',
        default: "Trekker's",
        translations: { vi: 'Hành trình của', ja: 'トレッカーの' },
    },
    trekkerTitleAccent: {
        sourceLocale: 'en',
        default: 'Highlights',
        translations: { vi: 'Cộng đồng', ja: 'ハイライト' },
    },
    trekkerDescription: {
        sourceLocale: 'en',
        default:
            'Discover inspiring journeys, authentic stories and unforgettable experiences shared by creators who build, explore and grow with Kbuilder.',
        translations: {
            vi: 'Khám phá những hành trình truyền cảm hứng, câu chuyện chân thực và trải nghiệm đáng nhớ được chia sẻ bởi các nhà sáng tạo đồng hành cùng Kbuilder.',
            ja: 'Kbuilderとともに成長するクリエイターたちが共有する感動的な旅やリアルなストーリー、忘れられない体験をご覧ください。',
        },
    },

    reviewerName: {
        sourceLocale: 'en',
        default: 'Mario Kingston',
        translations: { vi: 'Mario Kingston', ja: 'Mario Kingston' },
    },
    reviewerRole: {
        sourceLocale: 'en',
        default: 'Travel Creator',
        translations: { vi: 'Nhà sáng tạo nội dung du lịch', ja: '旅行クリエイター' },
    },
    reviewerVerified: {
        sourceLocale: 'en',
        default: 'Verified Creator',
        translations: { vi: 'Nhà sáng tạo đã xác minh', ja: '認証済みクリエイター' },
    },
    reviewerQuote: {
        sourceLocale: 'en',
        default:
            'Kbuilder completely transformed the way I build websites. Everything feels effortless, fast and beautifully designed. I launched my travel blog within a single afternoon.',
        translations: {
            vi: 'Kbuilder đã thay đổi hoàn toàn cách tôi xây dựng website. Mọi thứ đều nhanh chóng, đơn giản và được thiết kế rất đẹp. Tôi đã xuất bản blog du lịch của mình chỉ trong một buổi chiều.',
            ja: 'Kbuilderのおかげでウェブサイト制作の方法が一変しました。すべてが簡単で高速、美しく設計されています。旅行ブログもわずか半日で公開できました。',
        },
    },
    reviewButton: {
        sourceLocale: 'en',
        default: 'Read Full Story',
        translations: { vi: 'Đọc toàn bộ câu chuyện', ja: 'ストーリー全文を見る' },
    },

    community1Title: {
        sourceLocale: 'en',
        default: 'Lots of Choices',
        translations: { vi: 'Nhiều lựa chọn', ja: '豊富な選択肢' },
    },
    community1Description: {
        sourceLocale: 'en',
        default: 'Browse hundreds of carefully selected destinations and travel experiences.',
        translations: {
            vi: 'Khám phá hàng trăm điểm đến và trải nghiệm du lịch được tuyển chọn kỹ lưỡng.',
            ja: '厳選された数百もの旅行先や体験を見つけましょう。',
        },
    },

    community2Title: {
        sourceLocale: 'en',
        default: 'Best Tour Guide',
        translations: { vi: 'Hướng dẫn viên chuyên nghiệp', ja: '最高のツアーガイド' },
    },
    community2Description: {
        sourceLocale: 'en',
        default: 'Professional local guides help you discover authentic places and stories.',
        translations: {
            vi: 'Những hướng dẫn viên địa phương giàu kinh nghiệm sẽ đưa bạn đến với những địa điểm và câu chuyện chân thực.',
            ja: '経験豊富な現地ガイドが本物の魅力やストーリーをご案内します。',
        },
    },

    community3Title: {
        sourceLocale: 'en',
        default: 'Easy Booking',
        translations: { vi: 'Đặt chỗ dễ dàng', ja: '簡単予約' },
    },
    community3Description: {
        sourceLocale: 'en',
        default: 'Book your next adventure in just a few clicks with instant confirmation.',
        translations: {
            vi: 'Đặt chuyến đi tiếp theo chỉ với vài thao tác và nhận xác nhận ngay lập tức.',
            ja: '数クリックで次の旅行を予約し、すぐに確認を受け取れます。',
        },
    },

    travelHeroTitle: {
        sourceLocale: 'en',
        default: 'Adventure',
        translations: { vi: 'Phiêu lưu', ja: 'アドベンチャー' },
    },
    travelHeroStories: {
        sourceLocale: 'en',
        default: '+120 Stories',
        translations: { vi: '+120 câu chuyện', ja: '120件以上のストーリー' },
    },
    travelHeroLocation: {
        sourceLocale: 'en',
        default: 'Cappadocia, Turkey',
        translations: { vi: 'Cappadocia, Thổ Nhĩ Kỳ', ja: 'トルコ・カッパドキア' },
    },

    travelVideoDuration: {
        sourceLocale: 'en',
        default: '03:28',
        translations: { vi: '03:28', ja: '03:28' },
    },
    travelVideoBadge: {
        sourceLocale: 'en',
        default: 'Travel Story',
        translations: { vi: 'Câu chuyện du lịch', ja: 'トラベルストーリー' },
    },
    travelVideoTitle: {
        sourceLocale: 'en',
        default: 'Explore breathtaking destinations through inspiring creator stories.',
        translations: {
            vi: 'Khám phá những điểm đến tuyệt đẹp qua các câu chuyện truyền cảm hứng từ những nhà sáng tạo.',
            ja: 'クリエイターたちの感動的なストーリーを通して、息をのむような絶景を発見しましょう。',
        },
    },
    travelVideoDescription: {
        sourceLocale: 'en',
        default:
            'Watch how creators capture unforgettable adventures, share authentic experiences, and inspire millions with beautiful visual storytelling built using Kbuilder.',
        translations: {
            vi: 'Theo dõi cách các nhà sáng tạo ghi lại những chuyến phiêu lưu đáng nhớ, chia sẻ trải nghiệm chân thực và truyền cảm hứng đến hàng triệu người bằng Kbuilder.',
            ja: 'Kbuilderを活用した美しいビジュアルストーリーで、クリエイターたちが忘れられない冒険や本物の体験を世界中へ届ける様子をご覧ください。',
        },
    },

    travelViews: { sourceLocale: 'en', default: '18K+', translations: { vi: '18K+', ja: '18K+' } },
    travelViewsLabel: {
        sourceLocale: 'en',
        default: 'Views',
        translations: { vi: 'Lượt xem', ja: '再生数' },
    },

    travelRating: { sourceLocale: 'en', default: '4.9', translations: { vi: '4.9', ja: '4.9' } },
    travelRatingLabel: {
        sourceLocale: 'en',
        default: 'Rating',
        translations: { vi: 'Đánh giá', ja: '評価' },
    },

    travelComments: { sourceLocale: 'en', default: '245', translations: { vi: '245', ja: '245' } },
    travelCommentsLabel: {
        sourceLocale: 'en',
        default: 'Comments',
        translations: { vi: 'Bình luận', ja: 'コメント' },
    },

    travelButton: {
        sourceLocale: 'en',
        default: 'Watch Journey',
        translations: { vi: 'Xem hành trình', ja: '旅を見る' },
    },
    blog1Id: 1,
    blog1Image: '/assets/images/blogs/blog-01.png',
    blog1Avatar: '/assets/images/avatar-1.png',

    blog2Id: 2,
    blog2Image: '/assets/images/blogs/blog-02.png',
    blog2Avatar: '/assets/images/avatar-2.png',

    blog3Id: 3,
    blog3Image: '/assets/images/blogs/blog-03.png',
    blog3Avatar: '/assets/images/avatar-3.png',

    blog4Id: 4,
    blog4Image: '/assets/images/blogs/blog-04.png',
    blog4Avatar: '/assets/images/avatar-4.png',

    storyActionLink: '/blog',

    featuredImage: '/assets/images/blogs/featured.png',
    featuredCategoryIcon: 'bi-cup-hot-fill',

    story1Image: '/assets/images/blogs/story-01.png',
    story1CategoryIcon: 'bi-geo-alt-fill',

    story2Image: '/assets/images/blogs/story-02.png',
    story2CategoryIcon: 'bi-heart-pulse-fill',

    story3Image: '/assets/images/blogs/story-03.png',
    story3CategoryIcon: 'bi-globe',

    reviewerAvatar: '/assets/images/avatar-1.png',

    community1Icon: 'bi-compass',
    community2Icon: 'bi-person-badge',
    community2Featured: true,
    community3Icon: 'bi-calendar-check',

    travelHeroImage: '/assets/images/blogs/travel-hero.png',
    travelVideoImage: '/assets/images/blogs/travel-video.png',
};

function createFeature(icon: string, title: LocalizedText, description: LocalizedText) {
    return {
        icon,
        title,
        description,
    };
}

function createBlog(
    id: number,
    image: string,
    category: LocalizedText,
    date: LocalizedText,
    title: LocalizedText,
    description: LocalizedText,
    author: LocalizedText,
    role: LocalizedText,
    avatar: string,
): BlogItem {
    return {
        id,
        image,
        category,
        date,
        title,
        description,
        author,
        role,
        avatar,
    };
}

function createStory(
    image: string,
    category: LocalizedText,
    categoryIcon: string,
    title: LocalizedText,
    description: LocalizedText,
    date: LocalizedText,
    readTime: LocalizedText,
): StoryItem {
    return {
        image,
        category,
        categoryIcon,
        title,
        description,
        date,
        readTime,
    };
}

export function BlogPage01(props: Blog01Props) {
    const mergedProps = {
        ...DEFAULT_PROPS,
        ...props,
    };
    const {
        breadcrumbHome,
        breadcrumbCurrent,
        heroBadge,
        heroTitle,
        heroTitleAccent,
        heroDescription,
        heroPrimaryButton,
        heroSecondaryButton,
        heroReviewText,
        heroRating,
        heroImage,
        feature1Icon,
        feature1Title,
        feature1Description,
        feature2Icon,
        feature2Title,
        feature2Description,
        feature3Icon,
        feature3Title,
        feature3Description,
        feature4Icon,
        feature4Title,
        feature4Description,

        blogSectionTitle,
        blogSectionTitleAccent,
        blogSectionDescription,
        blogActionButton,

        blog1Id,
        blog1Image,
        blog1category,
        blog1Date,
        blog1Title,
        blog1Description,
        blog1Author,
        blog1Role,
        blog1Avatar,

        blog2Id,
        blog2Image,
        blog2category,
        blog2Date,
        blog2Title,
        blog2Description,
        blog2Author,
        blog2Role,
        blog2Avatar,

        blog3Id,
        blog3Image,
        blog3category,
        blog3Date,
        blog3Title,
        blog3Description,
        blog3Author,
        blog3Role,
        blog3Avatar,

        blog4Id,
        blog4Image,
        blog4category,
        blog4Date,
        blog4Title,
        blog4Description,
        blog4Author,
        blog4Role,
        blog4Avatar,

        storyTitle,
        storyTitleAccent,
        storyDescription,
        storyActionText,
        storyActionLink,
        featuredImage,
        featuredBadge,
        featuredCategory,
        featuredCategoryIcon,
        featuredTitle,
        featuredDate,
        featuredReadTime,
        featuredDescription,
        featuredButton,
        story1Image,
        story1Category,
        story1CategoryIcon,
        story1Title,
        story1Description,
        story1Date,
        story1ReadTime,
        story2Image,
        story2Category,
        story2CategoryIcon,
        story2Title,
        story2Description,
        story2Date,
        story2ReadTime,
        story3Image,
        story3Category,
        story3CategoryIcon,
        story3Title,
        story3Description,
        story3Date,
        story3ReadTime,
        trekkerBadge,
        trekkerTitle,
        trekkerTitleAccent,
        trekkerDescription,

        reviewerAvatar,
        reviewerName,
        reviewerRole,
        reviewerVerified,
        reviewerQuote,
        reviewButton,
        community1Icon,
        community1Title,
        community1Description,

        community2Icon,
        community2Title,
        community2Description,

        community3Icon,
        community3Title,
        community3Description,

        travelHeroImage,
        travelHeroTitle,
        travelHeroStories,
        travelHeroLocation,

        travelVideoImage,
        travelVideoDuration,
        travelVideoBadge,
        travelVideoTitle,
        travelVideoDescription,
        travelViews,
        travelViewsLabel,
        travelRating,
        travelRatingLabel,
        travelComments,
        travelCommentsLabel,
        travelButton,
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

    const t = (value?: LocalizedText) => (value ? getLocalizedValue(value, selectedLocale) : '');

    const FEATURES = useMemo(
        () => [
            createFeature(feature1Icon, feature1Title, feature1Description),
            createFeature(feature2Icon, feature2Title, feature2Description),
            createFeature(feature3Icon, feature3Title, feature3Description),
            createFeature(feature4Icon, feature4Title, feature4Description),
        ],
        [
            feature1Icon,
            feature1Title,
            feature1Description,
            feature2Icon,
            feature2Title,
            feature2Description,
            feature3Icon,
            feature3Title,
            feature3Description,
            feature4Icon,
            feature4Title,
            feature4Description,
        ],
    );

    const BLOGS = useMemo(
        () => [
            createBlog(
                blog1Id,
                blog1Image,
                blog1category,
                blog1Date,
                blog1Title,
                blog1Description,
                blog1Author,
                blog1Role,
                blog1Avatar,
            ),
            createBlog(
                blog2Id,
                blog2Image,
                blog2category,
                blog2Date,
                blog2Title,
                blog2Description,
                blog2Author,
                blog2Role,
                blog2Avatar,
            ),
            createBlog(
                blog3Id,
                blog3Image,
                blog3category,
                blog3Date,
                blog3Title,
                blog3Description,
                blog3Author,
                blog3Role,
                blog3Avatar,
            ),
            createBlog(
                blog4Id,
                blog4Image,
                blog4category,
                blog4Date,
                blog4Title,
                blog4Description,
                blog4Author,
                blog4Role,
                blog4Avatar,
            ),
        ],
        [
            blog1Id,
            blog1Image,
            blog1category,
            blog1Date,
            blog1Title,
            blog1Description,
            blog1Author,
            blog1Role,
            blog1Avatar,
            blog2Id,
            blog2Image,
            blog2category,
            blog2Date,
            blog2Title,
            blog2Description,
            blog2Author,
            blog2Role,
            blog2Avatar,
            blog3Id,
            blog3Image,
            blog3category,
            blog3Date,
            blog3Title,
            blog3Description,
            blog3Author,
            blog3Role,
            blog3Avatar,
            blog4Id,
            blog4Image,
            blog4category,
            blog4Date,
            blog4Title,
            blog4Description,
            blog4Author,
            blog4Role,
            blog4Avatar,
        ],
    );

    const STORIES = useMemo(
        () => [
            createStory(
                story1Image,
                story1Category,
                story1CategoryIcon,
                story1Title,
                story1Description,
                story1Date,
                story1ReadTime,
            ),
            createStory(
                story2Image,
                story2Category,
                story2CategoryIcon,
                story2Title,
                story2Description,
                story2Date,
                story2ReadTime,
            ),
            createStory(
                story3Image,
                story3Category,
                story3CategoryIcon,
                story3Title,
                story3Description,
                story3Date,
                story3ReadTime,
            ),
        ],
        [
            story1Image,
            story1Category,
            story1CategoryIcon,
            story1Title,
            story1Description,
            story1Date,
            story1ReadTime,
            story2Image,
            story2Category,
            story2CategoryIcon,
            story2Title,
            story2Description,
            story2Date,
            story2ReadTime,
            story3Image,
            story3Category,
            story3CategoryIcon,
            story3Title,
            story3Description,
            story3Date,
            story3ReadTime,
        ],
    );
    const COMMUNITIES: CommunityItem[] = [
        { icon: community1Icon, title: community1Title, description: community1Description },
        {
            icon: community2Icon,
            title: community2Title,
            description: community2Description,
            featured: true,
        },
        { icon: community3Icon, title: community3Title, description: community3Description },
    ];

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.headingSection}>
                    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                        <Link href="/" className={styles.breadcrumbItem}>
                            {t(breadcrumbHome)}
                        </Link>

                        <i className="bi bi-chevron-right" />

                        <span className={styles.breadcrumbCurrent}>{t(breadcrumbCurrent)}</span>
                    </nav>
                </div>

                <div className={styles.blurOne} />
                <div className={styles.blurTwo} />
                <div className={styles.gridBackground} />

                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.content}>
                            <a
                                href="/"
                                className={`${styles.badge} ${styles.r}`}
                                style={{ '--i': 0 } as React.CSSProperties}
                            >
                                <span className={styles.badgeIcon}>
                                    <i className="bi bi-stars" />
                                </span>

                                <span>{t(heroBadge)}</span>

                                <i className="bi bi-arrow-right" />
                            </a>

                            <h1>
                                {t(heroTitle)}
                                <span>{t(heroTitleAccent)}</span>
                            </h1>

                            <p>{t(heroDescription)}</p>

                            <div className={styles.stats}>
                                {FEATURES.map((item, index) => (
                                    <div key={index} className={styles.statCard}>
                                        <div className={styles.statIcon}>
                                            <span className={styles.iconGlow} />
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <strong className={styles.statValue}>
                                            {t(item.title)}
                                        </strong>

                                        <span className={styles.statLabel}>
                                            {t(item.description)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.primaryButton}>
                                    {t(heroPrimaryButton)}
                                    <i className="bi bi-arrow-right" />
                                </button>

                                <button className={styles.secondaryButton}>
                                    <i className="bi bi-play-fill" />
                                    {t(heroSecondaryButton)}
                                </button>
                            </div>

                            <div className={styles.review}>
                                <div className={styles.avatarGroup}>
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <Image
                                            key={item}
                                            src={`/assets/images/avatar-${item}.png`}
                                            alt=""
                                            width={46}
                                            height={46}
                                        />
                                    ))}
                                </div>

                                <div className={styles.reviewContent}>
                                    <span>{t(heroReviewText)}</span>

                                    <div className={styles.rating}>
                                        <strong>{t(heroRating)}</strong>

                                        <div>
                                            {[1, 2, 3, 4, 5].map((item) => (
                                                <i key={item} className="bi bi-star-fill" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.visual}>
                            <Image
                                src={heroImage}
                                alt={t(heroTitle)}
                                fill
                                priority
                                sizes="(max-width:768px)100vw,(max-width:1200px)60vw,50vw"
                                className={styles.heroImage}
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.blogSection}>
                <div className={styles.blogContainer}>
                    {/* Header */}

                    <div className={styles.teamHero}>
                        <div className={styles.teamHeroGlow} />

                        <div className={styles.teamHeroLeft}>
                            <div className={styles.teamHeroIcon}>
                                <i className="bi bi-stars" />
                            </div>

                            <div className={styles.teamHeroContent}>
                                <h2>
                                    {t(blogSectionTitle)}
                                    <span>{t(blogSectionTitleAccent)}</span>
                                </h2>

                                <p>{t(blogSectionDescription)}</p>
                            </div>
                        </div>

                        <div className={styles.teamHeroBadge}>
                            {t(blogActionButton)} <i className="bi bi-arrow-right" />
                        </div>
                    </div>

                    {/* Blog List */}

                    <div className={styles.blogGrid}>
                        {BLOGS.map((blog) => (
                            <article key={blog.id} className={styles.blogCard}>
                                {/* Cover */}

                                <div className={styles.blogCover}>
                                    <Image
                                        src={blog.image}
                                        alt={t(blog.title)}
                                        fill
                                        sizes="100vw, (min-width:768px) 50vw, (min-width:1200px) 33vw"
                                        className={styles.blogCoverImage}
                                    />

                                    <button className={styles.blogBookmark}>
                                        <i className="bi bi-bookmark" />
                                    </button>
                                </div>

                                {/* Content */}

                                <div className={styles.blogContent}>
                                    <div className={styles.blogMeta}>
                                        <span className={styles.blogCategory}>
                                            {t(blog.category)}
                                        </span>

                                        <span className={styles.blogDate}>
                                            <i className="bi bi-calendar3" />
                                            {t(blog.date)}
                                        </span>
                                    </div>

                                    <h3 className={styles.blogCardTitle}>{t(blog.title)}</h3>

                                    <p className={styles.blogExcerpt}>{t(blog.description)}</p>

                                    <div className={styles.blogCardFooter}>
                                        <div className={styles.blogAuthor}>
                                            <Image
                                                src={blog.avatar}
                                                alt={t(blog.author)}
                                                width={48}
                                                height={48}
                                            />

                                            <div className={styles.blogAuthorInfo}>
                                                <strong>{t(blog.author)}</strong>

                                                <span>{t(blog.role)}</span>
                                            </div>
                                        </div>

                                        <button className={styles.blogArrowButton}>
                                            <i className="bi bi-arrow-right" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}

                    <div className={styles.blogPagination}>
                        <span className={styles.blogPaginationActive} />
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
            </section>
            <section className={styles.storySphere}>
                <div className={styles.storyGlowLeft} />
                <div className={styles.storyGlowRight} />

                <div className={styles.storyShell}>
                    <div className={styles.teamHero}>
                        <div className={styles.teamHeroGlow} />

                        <div className={styles.teamHeroLeft}>
                            <div className={styles.teamHeroIcon}>
                                <i className="bi bi-stars" />
                            </div>

                            <div className={styles.teamHeroContent}>
                                <h2>
                                    {t(storyTitle)}
                                    <span>{t(storyTitleAccent)}</span>
                                </h2>

                                <p>{t(storyDescription)}</p>
                            </div>
                        </div>

                        <div className={styles.teamHeroBadge}>
                            {t(storyActionText)}
                            <i className="bi bi-arrow-right" />
                        </div>
                    </div>

                    <div className={styles.storyShowcase}>
                        <article className={styles.storyFeatureCard}>
                            <div className={styles.storyMedia}>
                                <Image
                                    src={featuredImage}
                                    alt={t(featuredTitle)}
                                    fill
                                    priority
                                    sizes="(max-width:768px)100vw,(max-width:1200px)60vw,50vw"
                                    className={styles.heroImage}
                                />

                                <span className={styles.storyFeatureBadge}>{t(featuredBadge)}</span>

                                <button className={styles.storyBookmark}>
                                    <i className="bi bi-bookmark" />
                                </button>
                            </div>

                            <div className={styles.storyBody}>
                                <span className={styles.storyCategory}>
                                    <i className={`bi ${featuredCategoryIcon}`} />
                                    {t(featuredCategory)}
                                </span>

                                <h3 className={styles.storyHeading}>{t(featuredTitle)}</h3>

                                <div className={styles.storyMeta}>
                                    <div className={styles.storyMetaItem}>
                                        <i className="bi bi-calendar3" />
                                        {t(featuredDate)}
                                    </div>

                                    <span className={styles.storyDot} />

                                    <div className={styles.storyMetaItem}>
                                        <i className="bi bi-clock" />
                                        {t(featuredReadTime)}
                                    </div>
                                </div>

                                <p className={styles.storyExcerpt}>{t(featuredDescription)}</p>

                                <a href="#" className={styles.storyReadMore}>
                                    {t(featuredButton)}
                                    <i className="bi bi-arrow-right" />
                                </a>
                            </div>
                        </article>

                        <div className={styles.storySideList}>
                            {STORIES.map((story, index) => (
                                <article key={index} className={styles.storyMiniCard}>
                                    <div className={styles.storyMiniThumb}>
                                        <Image
                                            src={story.image}
                                            alt={t(story.title)}
                                            fill
                                            sizes="(max-width:768px)100vw,220px"
                                            className={styles.storyMiniImage}
                                        />
                                    </div>

                                    <div className={styles.storyMiniContent}>
                                        <span className={styles.storyMiniCategory}>
                                            <i className={`bi ${story.categoryIcon}`} />
                                            {t(story.category)}
                                        </span>

                                        <h4 className={styles.storyMiniTitle}>{t(story.title)}</h4>

                                        <p className={styles.storyMiniDescription}>
                                            {t(story.description)}
                                        </p>

                                        <div className={styles.storyMiniMeta}>
                                            <div className={styles.storyMiniMetaItem}>
                                                <i className="bi bi-calendar3" />
                                                {t(story.date)}
                                            </div>

                                            <span className={styles.storyMiniDot} />

                                            <div className={styles.storyMiniMetaItem}>
                                                <i className="bi bi-clock" />
                                                {t(story.readTime)}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className={styles.storyPager}>
                            <span
                                className={`${styles.storyPagerItem} ${styles.storyPagerActive}`}
                            />
                            <span className={styles.storyPagerItem} />
                            <span className={styles.storyPagerItem} />
                            <span className={styles.storyPagerItem} />
                            <span className={styles.storyPagerItem} />
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.trekkerSection}>
                <div className={styles.trekkerBlurOne} />
                <div className={styles.trekkerBlurTwo} />
                <div className={styles.trekkerDots} />

                <div className={styles.trekkerShell}>
                    <div className={styles.trekkerGrid}>
                        {/* LEFT */}

                        <div className={styles.trekkerIntro}>
                            <span className={styles.trekkerBadge}>
                                <i className="bi bi-people-fill" />
                                {t(trekkerBadge)}
                            </span>

                            <h2 className={styles.trekkerHeading}>
                                {t(trekkerTitle)}
                                <span>{t(trekkerTitleAccent)}</span>
                            </h2>

                            <p className={styles.trekkerSummary}>{t(trekkerDescription)}</p>

                            <article className={styles.trekkerReview}>
                                <div className={styles.trekkerReviewer}>
                                    <div className={styles.trekkerAvatar}>
                                        <Image
                                            src={reviewerAvatar}
                                            alt={t(reviewerName)}
                                            width={72}
                                            height={72}
                                        />
                                    </div>

                                    <div className={styles.trekkerIdentity}>
                                        <h4>{t(reviewerName)}</h4>
                                        <span>{t(reviewerRole)}</span>
                                    </div>

                                    <div className={styles.trekkerStar}>
                                        <div className={styles.trekkerVerified}>
                                            <i className="bi bi-patch-check-fill" />
                                            {t(reviewerVerified)}
                                        </div>

                                        <div className={styles.trekkerStars}>
                                            {[1, 2, 3, 4, 5].map((item) => (
                                                <i key={item} className="bi bi-star-fill" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <blockquote className={styles.trekkerQuote}>
                                    <i className="bi bi-quote" />

                                    <p>{t(reviewerQuote)}</p>
                                </blockquote>

                                <div className={styles.trekkerActions}>
                                    <a href="#">{t(reviewButton)}</a>

                                    <button className={styles.trekkerFavorite}>
                                        <i className="bi bi-heart" />
                                    </button>
                                </div>

                                <div className={styles.gridStatus}>
                                    {COMMUNITIES.map((item, index) => (
                                        <article
                                            key={index}
                                            className={`${styles.card} ${
                                                item.featured ? styles.featured : ''
                                            }`}
                                        >
                                            <div className={styles.icon}>
                                                <i className={`bi ${item.icon}`} />
                                            </div>

                                            <h3>{t(item.title)}</h3>

                                            <p>{t(item.description)}</p>
                                        </article>
                                    ))}
                                </div>
                            </article>
                        </div>

                        <div className={styles.trekkerVisual}>
                            {/* ================= HERO IMAGE ================= */}

                            <div className={styles.trekkerHeroCard}>
                                <Image
                                    src={travelHeroImage}
                                    alt={t(travelHeroTitle)}
                                    fill
                                    sizes="(max-width:768px)100vw,(max-width:1200px)50vw,560px"
                                    className={styles.trekkerHeroImage}
                                />

                                <div className={styles.trekkerOverlay} />

                                <div className={styles.trekkerFloating}>
                                    <div className={styles.trekkerFloatingIcon}>
                                        <i className="bi bi-people-fill" />
                                    </div>

                                    <div>
                                        <h5>{t(travelHeroTitle)}</h5>
                                        <span>{t(travelHeroStories)}</span>
                                    </div>
                                </div>

                                <div className={styles.trekkerLocation}>
                                    <i className="bi bi-geo-alt-fill" />
                                    {t(travelHeroLocation)}
                                </div>

                                <button className={styles.trekkerBookmark}>
                                    <i className="bi bi-bookmark-heart-fill" />
                                </button>
                            </div>

                            {/* ================= VIDEO CARD ================= */}

                            <article className={styles.trekkerJourney}>
                                <div className={styles.trekkerJourneyMedia}>
                                    <Image
                                        src={travelVideoImage}
                                        alt={t(travelVideoTitle)}
                                        fill
                                        sizes="(max-width:768px)100vw,(max-width:1200px)50vw,420px"
                                        className={styles.trekkerJourneyImage}
                                    />

                                    <div className={styles.trekkerJourneyMask} />

                                    <button className={styles.trekkerPlayButton}>
                                        <i className="bi bi-play-fill" />
                                    </button>

                                    <div className={styles.trekkerDuration}>
                                        <i className="bi bi-camera-video-fill" />
                                        {t(travelVideoDuration)}
                                    </div>
                                </div>

                                <div className={styles.trekkerJourneyContent}>
                                    <span className={styles.trekkerJourneyBadge}>
                                        <i className="bi bi-film" />
                                        {t(travelVideoBadge)}
                                    </span>

                                    <h3 className={styles.trekkerJourneyTitle}>
                                        {t(travelVideoTitle)}
                                    </h3>

                                    <p className={styles.trekkerJourneyDescription}>
                                        {t(travelVideoDescription)}
                                    </p>

                                    <div className={styles.trekkerJourneyFooter}>
                                        <div className={styles.trekkerJourneyStats}>
                                            <div className={styles.trekkerJourneyStat}>
                                                <strong>{t(travelViews)}</strong>
                                                <span>{t(travelViewsLabel)}</span>
                                            </div>

                                            <div className={styles.trekkerJourneyDivider} />

                                            <div className={styles.trekkerJourneyStat}>
                                                <strong>{t(travelRating)}</strong>
                                                <span>{t(travelRatingLabel)}</span>
                                            </div>

                                            <div className={styles.trekkerJourneyDivider} />

                                            <div className={styles.trekkerJourneyStat}>
                                                <strong>{t(travelComments)}</strong>
                                                <span>{t(travelCommentsLabel)}</span>
                                            </div>
                                        </div>

                                        <a href="#" className={styles.trekkerJourneyButton}>
                                            {t(travelButton)}
                                            <i className="bi bi-arrow-up-right" />
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function createTextField(key: keyof Blog01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextareaField(key: keyof Blog01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createImageField(key: keyof Blog01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'image',
        folder: 'blogs',
        accept: 'image/*',
    };
}
function createFeatureInspector(count: number): RegItem['inspector'] {
    return Array.from({ length: count }, (_, index) => {
        const no = index + 1;

        return [
            createTextField(`feature${no}Icon` as keyof Blog01Props, `Feature ${no} Icon`),

            createTextField(`feature${no}Title` as keyof Blog01Props, `Feature ${no} Title`),

            createTextareaField(
                `feature${no}Description` as keyof Blog01Props,
                `Feature ${no} Description`,
            ),
        ];
    }).flat() as RegItem['inspector'];
}

function createBlogInspector(count: number): RegItem['inspector'] {
    const inspector: RegItem['inspector'] = [];

    for (let i = 1; i <= count; i++) {
        inspector.push(
            {
                key: `blog${i}Id`,
                label: `Blog ${i} ID`,
                kind: 'number',
            },

            createImageField(`blog${i}Image` as keyof Blog01Props, `Blog ${i} Image`),

            createTextField(`blog${i}category` as keyof Blog01Props, `Blog ${i} Category`),

            createTextField(`blog${i}Date` as keyof Blog01Props, `Blog ${i} Date`),

            createTextField(`blog${i}Title` as keyof Blog01Props, `Blog ${i} Title`),

            createTextareaField(
                `blog${i}Description` as keyof Blog01Props,
                `Blog ${i} Description`,
            ),

            createTextField(`blog${i}Author` as keyof Blog01Props, `Blog ${i} Author`),

            createTextField(`blog${i}Role` as keyof Blog01Props, `Blog ${i} Role`),

            createImageField(`blog${i}Avatar` as keyof Blog01Props, `Blog ${i} Avatar`),
        );
    }

    return inspector;
}

function createStoryInspector(count: number): RegItem['inspector'] {
    const inspector: RegItem['inspector'] = [
        createTextField('storyTitle', 'Story Title'),
        createTextField('storyTitleAccent', 'Story Title Accent'),
        createTextareaField('storyDescription', 'Story Description'),
        createTextField('storyActionText', 'Action Button'),
        createTextField('storyActionLink', 'Action Link'),

        // =====================================
        // Featured Story
        // =====================================

        createImageField('featuredImage', 'Featured Image'),

        createTextField('featuredBadge', 'Featured Badge'),
        createTextField('featuredCategory', 'Featured Category'),
        createTextField('featuredCategoryIcon', 'Featured Category Icon'),

        createTextField('featuredTitle', 'Featured Title'),
        createTextField('featuredDate', 'Featured Date'),
        createTextField('featuredReadTime', 'Featured Read Time'),

        createTextareaField('featuredDescription', 'Featured Description'),

        createTextField('featuredButton', 'Featured Button'),
    ];

    for (let i = 1; i <= count; i++) {
        inspector.push(
            createImageField(`story${i}Image` as keyof Blog01Props, `Story ${i} Image`),

            createTextField(`story${i}Category` as keyof Blog01Props, `Story ${i} Category`),

            createTextField(
                `story${i}CategoryIcon` as keyof Blog01Props,
                `Story ${i} Category Icon`,
            ),

            createTextField(`story${i}Title` as keyof Blog01Props, `Story ${i} Title`),

            createTextareaField(
                `story${i}Description` as keyof Blog01Props,
                `Story ${i} Description`,
            ),

            createTextField(`story${i}Date` as keyof Blog01Props, `Story ${i} Date`),

            createTextField(`story${i}ReadTime` as keyof Blog01Props, `Story ${i} Read Time`),
        );
    }

    return inspector;
}

function createCommunityInspector(count: number): RegItem['inspector'] {
    const inspector: RegItem['inspector'] = [
        // =====================================
        // Community
        // =====================================

        createTextField('trekkerBadge', 'Community Badge'),
        createTextField('trekkerTitle', 'Community Title'),
        createTextField('trekkerTitleAccent', 'Community Title Accent'),

        createTextareaField('trekkerDescription', 'Community Description'),

        // =====================================
        // Reviewer
        // =====================================

        createImageField('reviewerAvatar', 'Reviewer Avatar'),

        createTextField('reviewerName', 'Reviewer Name'),
        createTextField('reviewerRole', 'Reviewer Role'),
        createTextField('reviewerVerified', 'Reviewer Verified'),

        createTextareaField('reviewerQuote', 'Reviewer Quote'),

        createTextField('reviewButton', 'Review Button'),
    ];

    for (let i = 1; i <= count; i++) {
        inspector.push(
            createTextField(`community${i}Icon` as keyof Blog01Props, `Community ${i} Icon`),

            createTextField(`community${i}Title` as keyof Blog01Props, `Community ${i} Title`),

            createTextareaField(
                `community${i}Description` as keyof Blog01Props,
                `Community ${i} Description`,
            ),
        );

        if (i === 2) {
            inspector.push({
                key: 'community2Featured',
                label: 'Community 2 Featured',
                kind: 'check',
            });
        }
    }

    return inspector;
}

function createInspector(): RegItem['inspector'] {
    return [
        // ==========================================================
        // Breadcrumb
        // ==========================================================

        createTextField('breadcrumbHome', 'Breadcrumb Home'),
        createTextField('breadcrumbCurrent', 'Breadcrumb Current'),

        // ==========================================================
        // Hero
        // ==========================================================

        createTextField('heroBadge', 'Hero Badge'),
        createTextField('heroTitle', 'Hero Title'),
        createTextField('heroTitleAccent', 'Hero Title Accent'),
        createTextareaField('heroDescription', 'Hero Description'),

        createTextField('heroPrimaryButton', 'Primary Button'),
        createTextField('heroSecondaryButton', 'Secondary Button'),

        createTextField('heroReviewText', 'Hero Review Text'),
        createTextField('heroRating', 'Hero Rating'),

        createImageField('heroImage', 'Hero Image'),

        // ==========================================================
        // Hero Features
        // ==========================================================

        ...createFeatureInspector(4),

        // ==========================================================
        // Blog Section
        // ==========================================================

        createTextField('blogSectionTitle', 'Blog Section Title'),
        createTextField('blogSectionTitleAccent', 'Blog Section Title Accent'),
        createTextareaField('blogSectionDescription', 'Blog Section Description'),
        createTextField('blogActionButton', 'Blog Action Button'),

        // ==========================================================
        // Blog Items
        // ==========================================================

        ...createBlogInspector(4),

        // ==========================================================
        // Story
        // ==========================================================

        ...createStoryInspector(3),

        // ==========================================================
        // Community
        // ==========================================================

        ...createCommunityInspector(3),

        // ==========================================================
        // Travel Hero
        // ==========================================================

        createImageField('travelHeroImage', 'Travel Hero Image'),

        createTextField('travelHeroTitle', 'Travel Hero Title'),
        createTextField('travelHeroStories', 'Travel Hero Stories'),
        createTextField('travelHeroLocation', 'Travel Hero Location'),

        // ==========================================================
        // Travel Video
        // ==========================================================

        createImageField('travelVideoImage', 'Travel Video Image'),

        createTextField('travelVideoTitle', 'Travel Video Title'),

        createTextareaField('travelVideoDescription', 'Travel Video Description'),

        createTextField('travelButton', 'Travel Button'),
    ];
}

export const BLOG_PAGE_01: RegItem = {
    kind: 'blog-page-01',
    label: 'Blog Page 01',
    defaults: DEFAULT_PROPS as Record<string, unknown>,
    inspector: createInspector(),
    render: (props) => <BlogPage01 {...(props as unknown as Blog01Props)} />,
};
export default BlogPage01;
