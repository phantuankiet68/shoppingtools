'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import type { InspectorField, RegItem } from '@/lib/ui-builder/types';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';

import styles from '@/components/admin/shared/templates/services/pricing/styles/pricing-service-01.module.css';

type PricingCard = {
    plan: LocalizedText;
    websites: LocalizedText;
    price: number;
    featured?: boolean;
    badge?: LocalizedText;
    buttonText: LocalizedText;
    features: LocalizedText[];
};

export interface PricingService01Props {
    heroTitle?: LocalizedText;
    heroDescription?: LocalizedText;

    stat1Value?: LocalizedText;
    stat1Label?: LocalizedText;

    stat2Value?: LocalizedText;
    stat2Label?: LocalizedText;

    stat3Value?: LocalizedText;
    stat3Label?: LocalizedText;

    testimonialText?: LocalizedText;
    testimonialName?: LocalizedText;
    testimonialRole?: LocalizedText;

    pricingBadge?: LocalizedText;
    pricingTitle?: LocalizedText;
    pricingSubtitle?: LocalizedText;

    monthlyText?: LocalizedText;
    yearlyText?: LocalizedText;

    plan1Name?: LocalizedText;
    plan1Websites?: LocalizedText;
    plan1Price?: number;
    plan1ButtonText?: LocalizedText;

    plan2Name?: LocalizedText;
    plan2Websites?: LocalizedText;
    plan2Price?: number;
    plan2Badge?: LocalizedText;
    plan2ButtonText?: LocalizedText;

    plan3Name?: LocalizedText;
    plan3Websites?: LocalizedText;
    plan3Price?: number;
    plan3ButtonText?: LocalizedText;

    priceSuffix?: LocalizedText;

    feature1Item1?: LocalizedText;
    feature1Item2?: LocalizedText;
    feature1Item3?: LocalizedText;
    feature1Item4?: LocalizedText;
    feature1Item5?: LocalizedText;
    feature1Item6?: LocalizedText;
    feature1Item7?: LocalizedText;
    feature1Item8?: LocalizedText;
    feature1Item9?: LocalizedText;
    feature1Item10?: LocalizedText;

    feature2Item1?: LocalizedText;
    feature2Item2?: LocalizedText;
    feature2Item3?: LocalizedText;
    feature2Item4?: LocalizedText;
    feature2Item5?: LocalizedText;
    feature2Item6?: LocalizedText;
    feature2Item7?: LocalizedText;
    feature2Item8?: LocalizedText;
    feature2Item9?: LocalizedText;
    feature2Item10?: LocalizedText;

    feature3Item1?: LocalizedText;
    feature3Item2?: LocalizedText;
    feature3Item3?: LocalizedText;
    feature3Item4?: LocalizedText;
    feature3Item5?: LocalizedText;
    feature3Item6?: LocalizedText;
    feature3Item7?: LocalizedText;
    feature3Item8?: LocalizedText;
    feature3Item9?: LocalizedText;
    feature3Item10?: LocalizedText;
}

export const DEFAULT_PROPS: Required<PricingService01Props> = {
    heroTitle: {
        sourceLocale: 'en',
        default: 'Start saving your money',
        translations: {
            vi: 'Bắt đầu tiết kiệm chi phí của bạn',
            ja: 'コスト削減を始めましょう',
        },
    },

    heroDescription: {
        sourceLocale: 'en',
        default:
            'Choose the plan that works best for your business. Scale confidently with transparent pricing and powerful website building tools.',
        translations: {
            vi: 'Chọn gói phù hợp nhất với doanh nghiệp của bạn. Mở rộng dễ dàng với mức giá minh bạch và bộ công cụ xây dựng website mạnh mẽ.',
            ja: 'ビジネスに最適なプランを選択し、透明な料金と強力なWebサイト構築ツールで安心して成長できます。',
        },
    },

    stat1Value: {
        sourceLocale: 'en',
        default: '30%',
        translations: {
            vi: '30%',
            ja: '30%',
        },
    },

    stat1Label: {
        sourceLocale: 'en',
        default: 'Cost Saving',
        translations: {
            vi: 'Tiết kiệm chi phí',
            ja: 'コスト削減',
        },
    },

    stat2Value: {
        sourceLocale: 'en',
        default: '24/7',
        translations: {
            vi: '24/7',
            ja: '24/7',
        },
    },

    stat2Label: {
        sourceLocale: 'en',
        default: 'Support',
        translations: {
            vi: 'Hỗ trợ',
            ja: 'サポート',
        },
    },

    stat3Value: {
        sourceLocale: 'en',
        default: '+10K',
        translations: {
            vi: '+10K',
            ja: '+10K',
        },
    },

    stat3Label: {
        sourceLocale: 'en',
        default: 'Active Users',
        translations: {
            vi: 'Người dùng',
            ja: 'アクティブユーザー',
        },
    },

    testimonialText: {
        sourceLocale: 'en',
        default:
            'Fantastic platform! We reduced development costs and launched our websites much faster than before.',
        translations: {
            vi: 'Nền tảng thật tuyệt! Chúng tôi đã giảm đáng kể chi phí phát triển và triển khai website nhanh hơn trước rất nhiều.',
            ja: '素晴らしいプラットフォームです。開発コストを削減し、以前よりもはるかに早くWebサイトを公開できました。',
        },
    },

    testimonialName: {
        sourceLocale: 'en',
        default: 'Roland Stevens',
        translations: {
            vi: 'Roland Stevens',
            ja: 'Roland Stevens',
        },
    },

    testimonialRole: {
        sourceLocale: 'en',
        default: 'Freelancer',
        translations: {
            vi: 'Freelancer',
            ja: 'フリーランサー',
        },
    },

    pricingBadge: {
        sourceLocale: 'en',
        default: 'Pricing',
        translations: {
            vi: 'Bảng giá',
            ja: '料金プラン',
        },
    },

    pricingTitle: {
        sourceLocale: 'en',
        default: 'Simple, transparent pricing',
        translations: {
            vi: 'Bảng giá đơn giản và minh bạch',
            ja: 'シンプルで分かりやすい料金体系',
        },
    },

    pricingSubtitle: {
        sourceLocale: 'en',
        default: 'No contracts. No surprise fees.',
        translations: {
            vi: 'Không hợp đồng. Không chi phí ẩn.',
            ja: '契約不要。追加料金もありません。',
        },
    },

    monthlyText: {
        sourceLocale: 'en',
        default: 'Monthly',
        translations: {
            vi: 'Theo tháng',
            ja: '月額',
        },
    },

    yearlyText: {
        sourceLocale: 'en',
        default: 'Yearly',
        translations: {
            vi: 'Theo năm',
            ja: '年額',
        },
    },

    plan1Name: {
        sourceLocale: 'en',
        default: 'Basic',
        translations: {
            vi: 'Cơ bản',
            ja: 'ベーシック',
        },
    },

    plan1Websites: {
        sourceLocale: 'en',
        default: '1 Website',
        translations: {
            vi: '1 Website',
            ja: '1サイト',
        },
    },

    plan1Price: 5,

    plan1ButtonText: {
        sourceLocale: 'en',
        default: 'Start Trial',
        translations: {
            vi: 'Dùng thử',
            ja: '無料で始める',
        },
    },
    plan2Name: {
        sourceLocale: 'en',
        default: 'Standard',
        translations: {
            vi: 'Tiêu chuẩn',
            ja: 'スタンダード',
        },
    },

    plan2Websites: {
        sourceLocale: 'en',
        default: '2 Websites',
        translations: {
            vi: '2 Website',
            ja: '2サイト',
        },
    },

    plan2Price: 10,

    plan2Badge: {
        sourceLocale: 'en',
        default: '🔥 Popular',
        translations: {
            vi: '🔥 Phổ biến',
            ja: '🔥 人気',
        },
    },

    plan2ButtonText: {
        sourceLocale: 'en',
        default: 'Start Trial',
        translations: {
            vi: 'Dùng thử',
            ja: '無料で始める',
        },
    },

    plan3Name: {
        sourceLocale: 'en',
        default: 'Professional',
        translations: {
            vi: 'Chuyên nghiệp',
            ja: 'プロフェッショナル',
        },
    },

    plan3Websites: {
        sourceLocale: 'en',
        default: '3 Websites',
        translations: {
            vi: '3 Website',
            ja: '3サイト',
        },
    },

    plan3Price: 20,

    plan3ButtonText: {
        sourceLocale: 'en',
        default: 'Start Trial',
        translations: {
            vi: 'Dùng thử',
            ja: '無料で始める',
        },
    },

    priceSuffix: {
        sourceLocale: 'en',
        default: '/month',
        translations: {
            vi: '/tháng',
            ja: '/月',
        },
    },
    feature1Item1: {
        sourceLocale: 'en',
        default: '1 Website',
        translations: {
            vi: '1 Website',
            ja: '1サイト',
        },
    },

    feature1Item2: {
        sourceLocale: 'en',
        default: 'Up to 10 Pages',
        translations: {
            vi: 'Tối đa 10 trang',
            ja: '最大10ページ',
        },
    },

    feature1Item3: {
        sourceLocale: 'en',
        default: 'Free SSL Certificate',
        translations: {
            vi: 'Chứng chỉ SSL miễn phí',
            ja: '無料SSL証明書',
        },
    },

    feature1Item4: {
        sourceLocale: 'en',
        default: 'Custom Domain',
        translations: {
            vi: 'Tên miền riêng',
            ja: '独自ドメイン',
        },
    },

    feature1Item5: {
        sourceLocale: 'en',
        default: 'Drag & Drop Builder',
        translations: {
            vi: 'Trình xây dựng kéo thả',
            ja: 'ドラッグ＆ドロップビルダー',
        },
    },

    feature1Item6: {
        sourceLocale: 'en',
        default: 'Responsive Design',
        translations: {
            vi: 'Thiết kế Responsive',
            ja: 'レスポンシブデザイン',
        },
    },

    feature1Item7: {
        sourceLocale: 'en',
        default: 'Built-in SEO',
        translations: {
            vi: 'SEO tích hợp',
            ja: 'SEO機能内蔵',
        },
    },

    feature1Item8: {
        sourceLocale: 'en',
        default: 'Analytics Dashboard',
        translations: {
            vi: 'Bảng điều khiển phân tích',
            ja: '分析ダッシュボード',
        },
    },

    feature1Item9: {
        sourceLocale: 'en',
        default: 'Fast Cloud Hosting',
        translations: {
            vi: 'Cloud Hosting tốc độ cao',
            ja: '高速クラウドホスティング',
        },
    },

    feature1Item10: {
        sourceLocale: 'en',
        default: 'Email Support',
        translations: {
            vi: 'Hỗ trợ qua Email',
            ja: 'メールサポート',
        },
    },
    feature2Item1: {
        sourceLocale: 'en',
        default: '2 Websites',
        translations: {
            vi: '2 Website',
            ja: '2サイト',
        },
    },

    feature2Item2: {
        sourceLocale: 'en',
        default: 'Up to 15 Pages',
        translations: {
            vi: 'Tối đa 15 trang',
            ja: '最大15ページ',
        },
    },

    feature2Item3: {
        sourceLocale: 'en',
        default: 'Free SSL Certificate',
        translations: {
            vi: 'Chứng chỉ SSL miễn phí',
            ja: '無料SSL証明書',
        },
    },

    feature2Item4: {
        sourceLocale: 'en',
        default: 'Custom Domain',
        translations: {
            vi: 'Tên miền riêng',
            ja: '独自ドメイン',
        },
    },

    feature2Item5: {
        sourceLocale: 'en',
        default: 'Premium Templates',
        translations: {
            vi: 'Mẫu giao diện cao cấp',
            ja: 'プレミアムテンプレート',
        },
    },

    feature2Item6: {
        sourceLocale: 'en',
        default: 'Drag & Drop Builder',
        translations: {
            vi: 'Trình xây dựng kéo thả',
            ja: 'ドラッグ＆ドロップビルダー',
        },
    },

    feature2Item7: {
        sourceLocale: 'en',
        default: 'Analytics Dashboard',
        translations: {
            vi: 'Bảng điều khiển phân tích',
            ja: '分析ダッシュボード',
        },
    },

    feature2Item8: {
        sourceLocale: 'en',
        default: 'Daily Backup',
        translations: {
            vi: 'Sao lưu hằng ngày',
            ja: '毎日のバックアップ',
        },
    },

    feature2Item9: {
        sourceLocale: 'en',
        default: 'Faster Performance',
        translations: {
            vi: 'Hiệu suất cao hơn',
            ja: 'より高速なパフォーマンス',
        },
    },

    feature2Item10: {
        sourceLocale: 'en',
        default: 'Priority Support',
        translations: {
            vi: 'Hỗ trợ ưu tiên',
            ja: '優先サポート',
        },
    },
    feature3Item1: {
        sourceLocale: 'en',
        default: '3 Websites',
        translations: {
            vi: '3 Website',
            ja: '3サイト',
        },
    },

    feature3Item2: {
        sourceLocale: 'en',
        default: 'Up to 30 Pages',
        translations: {
            vi: 'Tối đa 30 trang',
            ja: '最大30ページ',
        },
    },

    feature3Item3: {
        sourceLocale: 'en',
        default: 'Free SSL Certificate',
        translations: {
            vi: 'Chứng chỉ SSL miễn phí',
            ja: '無料SSL証明書',
        },
    },

    feature3Item4: {
        sourceLocale: 'en',
        default: 'Unlimited Custom Domains',
        translations: {
            vi: 'Tên miền tùy chỉnh không giới hạn',
            ja: '独自ドメイン無制限',
        },
    },

    feature3Item5: {
        sourceLocale: 'en',
        default: 'All Premium Templates',
        translations: {
            vi: 'Toàn bộ mẫu giao diện cao cấp',
            ja: 'すべてのプレミアムテンプレート',
        },
    },

    feature3Item6: {
        sourceLocale: 'en',
        default: 'Advanced Analytics',
        translations: {
            vi: 'Phân tích nâng cao',
            ja: '高度な分析機能',
        },
    },

    feature3Item7: {
        sourceLocale: 'en',
        default: 'Premium SEO',
        translations: {
            vi: 'SEO nâng cao',
            ja: 'プレミアムSEO',
        },
    },

    feature3Item8: {
        sourceLocale: 'en',
        default: 'Daily Backup',
        translations: {
            vi: 'Sao lưu hằng ngày',
            ja: '毎日のバックアップ',
        },
    },

    feature3Item9: {
        sourceLocale: 'en',
        default: 'API Access',
        translations: {
            vi: 'Truy cập API',
            ja: 'APIアクセス',
        },
    },

    feature3Item10: {
        sourceLocale: 'en',
        default: 'Premium Support',
        translations: {
            vi: 'Hỗ trợ cao cấp',
            ja: 'プレミアムサポート',
        },
    },
};

export function PricingService01(props: PricingService01Props) {
    const mergedProps: Required<PricingService01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        heroTitle,
        heroDescription,

        stat1Value,
        stat1Label,

        stat2Value,
        stat2Label,

        stat3Value,
        stat3Label,

        testimonialText,
        testimonialName,
        testimonialRole,

        pricingBadge,
        pricingTitle,
        pricingSubtitle,

        monthlyText,
        yearlyText,

        plan1Name,
        plan1Websites,
        plan1Price,
        plan1ButtonText,

        plan2Name,
        plan2Websites,
        plan2Price,
        plan2Badge,
        plan2ButtonText,

        plan3Name,
        plan3Websites,
        plan3Price,
        plan3ButtonText,

        priceSuffix,
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

    function createPricingCard(
        plan: LocalizedText,
        websites: LocalizedText,
        price: number,
        buttonText: LocalizedText,
        features: LocalizedText[],
        featured = false,
        badge?: LocalizedText,
    ): PricingCard {
        return {
            plan,
            websites,
            price,
            buttonText,
            features,
            featured,
            badge,
        };
    }
    function createPlanFeatures(
        prefix: 1 | 2 | 3,
        props: Required<PricingService01Props>,
    ): LocalizedText[] {
        return Array.from(
            { length: 10 },
            (_, i) =>
                props[
                    `feature${prefix}Item${i + 1}` as keyof PricingService01Props
                ] as LocalizedText,
        );
    }
    const cards = [
        createPricingCard(
            plan1Name,
            plan1Websites,
            plan1Price,
            plan1ButtonText,
            createPlanFeatures(1, mergedProps),
        ),

        createPricingCard(
            plan2Name,
            plan2Websites,
            plan2Price,
            plan2ButtonText,
            createPlanFeatures(2, mergedProps),
            true,
            plan2Badge,
        ),

        createPricingCard(
            plan3Name,
            plan3Websites,
            plan3Price,
            plan3ButtonText,
            createPlanFeatures(3, mergedProps),
        ),
    ];

    const t = (value: LocalizedText) => getLocalizedValue(value, selectedLocale);

    return (
        <section className={styles.pricing}>
            <div className={styles.container}>
                <div className={styles.leftPanel}>
                    <div className={styles.heroCard}>
                        <div className={styles.heroIcon}>
                            <i className="bi bi-stars" />
                        </div>

                        <h2 className={styles.heroTitle}>{t(heroTitle)}</h2>

                        <p className={styles.heroDesc}>{t(heroDescription)}</p>

                        <div className={styles.statsRow}>
                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>{t(stat1Value)}</div>

                                <div className={styles.statLabel}>{t(stat1Label)}</div>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>{t(stat2Value)}</div>

                                <div className={styles.statLabel}>{t(stat2Label)}</div>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>{t(stat3Value)}</div>

                                <div className={styles.statLabel}>{t(stat3Label)}</div>
                            </div>
                        </div>

                        <div className={styles.testimonial}>
                            <div className={styles.quoteIcon}>
                                <i className="bi bi-chat-quote-fill" />
                            </div>

                            <p className={styles.testimonialText}>“{t(testimonialText)}”</p>

                            <div className={styles.testimonialUser}>
                                <div className={styles.avatar}>
                                    <Image
                                        src="/assets/images/avatar.png"
                                        alt="Avatar"
                                        fill
                                        sizes="64px"
                                        className={styles.avatarImage}
                                    />
                                </div>
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>{t(testimonialName)}</div>
                                    <div className={styles.userRole}>{t(testimonialRole)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* RIGHT CONTENT */}
                <div className={styles.rightPanel}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <span className={styles.badge}>{t(pricingBadge)}</span>
                            <h2 className={styles.title}>{t(pricingTitle)}</h2>
                            <p className={styles.subtitle}>{t(pricingSubtitle)}</p>
                        </div>

                        <div className={styles.headerRight}>
                            <div className={styles.billingToggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${styles.active}`}
                                >
                                    {t(monthlyText)}
                                </button>

                                <button type="button" className={styles.toggleBtn}>
                                    {t(yearlyText)}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PRICING CARDS */}
                    <div className={styles.grid}>
                        {cards.map((card) => (
                            <div
                                key={card.plan.default}
                                className={[styles.card, card.featured && styles.featured]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                <div className={styles.glow} />

                                {card.badge && (
                                    <div className={styles.badge}>🔥 {t(card.badge)}</div>
                                )}

                                <div className={styles.cardHeader}>
                                    <span className={styles.plan}>{t(card.plan)}</span>

                                    <h3>{t(card.websites)}</h3>

                                    <div className={styles.price}>
                                        <span>$</span>

                                        {card.price}

                                        <small>{t(priceSuffix)}</small>
                                    </div>
                                </div>

                                <div className={styles.divider} />

                                <ul className={styles.featureList}>
                                    {card.features.map((feature, index) => (
                                        <li key={index}>
                                            <div className={styles.icon}>
                                                <i className="bi bi-check2" />
                                            </div>

                                            <span>{t(feature)}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={styles.button}>
                                    {t(card.buttonText)}

                                    <i className="bi bi-arrow-right" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function createLocalizedTextField(key: keyof PricingService01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createNumberField(key: keyof PricingService01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'number',
    };
}

function createInspector(): RegItem['inspector'] {
    return [
        createLocalizedTextField('heroTitle', 'Hero Title'),
        createLocalizedTextField('heroDescription', 'Hero Description'),

        createLocalizedTextField('stat1Value', 'Stat 1 Value'),
        createLocalizedTextField('stat1Label', 'Stat 1 Label'),

        createLocalizedTextField('stat2Value', 'Stat 2 Value'),
        createLocalizedTextField('stat2Label', 'Stat 2 Label'),

        createLocalizedTextField('stat3Value', 'Stat 3 Value'),
        createLocalizedTextField('stat3Label', 'Stat 3 Label'),

        createLocalizedTextField('testimonialText', 'Testimonial Text'),
        createLocalizedTextField('testimonialName', 'Testimonial Name'),
        createLocalizedTextField('testimonialRole', 'Testimonial Role'),

        createLocalizedTextField('pricingBadge', 'Pricing Badge'),
        createLocalizedTextField('pricingTitle', 'Pricing Title'),
        createLocalizedTextField('pricingSubtitle', 'Pricing Subtitle'),

        createLocalizedTextField('monthlyText', 'Monthly Text'),
        createLocalizedTextField('yearlyText', 'Yearly Text'),

        createLocalizedTextField('plan1Name', 'Plan 1 Name'),
        createLocalizedTextField('plan1Websites', 'Plan 1 Websites'),
        createNumberField('plan1Price', 'Plan 1 Price'),
        createLocalizedTextField('plan1ButtonText', 'Plan 1 Button'),

        createLocalizedTextField('plan2Name', 'Plan 2 Name'),
        createLocalizedTextField('plan2Websites', 'Plan 2 Websites'),
        createNumberField('plan2Price', 'Plan 2 Price'),
        createLocalizedTextField('plan2Badge', 'Plan 2 Badge'),
        createLocalizedTextField('plan2ButtonText', 'Plan 2 Button'),

        createLocalizedTextField('plan3Name', 'Plan 3 Name'),
        createLocalizedTextField('plan3Websites', 'Plan 3 Websites'),
        createNumberField('plan3Price', 'Plan 3 Price'),
        createLocalizedTextField('plan3ButtonText', 'Plan 3 Button'),

        createLocalizedTextField('priceSuffix', 'Price Suffix'),

        ...Array.from({ length: 3 }, (_, plan) =>
            Array.from({ length: 10 }, (_, feature) =>
                createLocalizedTextField(
                    `feature${plan + 1}Item${feature + 1}` as keyof PricingService01Props,
                    `Plan ${plan + 1} • Feature ${feature + 1}`,
                ),
            ),
        ).flat(),
    ];
}
export const PRICING_SERVICE_01: RegItem = {
    kind: 'PricingService01',

    label: 'Pricing Service 01',

    defaults: DEFAULT_PROPS,

    inspector: createInspector(),

    render: (props) => <PricingService01 {...(props as unknown as PricingService01Props)} />,
};

export default PricingService01;
