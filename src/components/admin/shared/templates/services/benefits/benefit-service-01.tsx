'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import styles from '@/components/admin/shared/templates/services/benefits/styles/benefit-service-01.module.css';
import { getLocalizedValue, type LocalizedText } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';

export interface BenefitService01Props {
    benefitShowcaseImage?: string;
    benefitShowcaseImageAlt?: LocalizedText;
    benefitFloating1Title?: LocalizedText;
    benefitFloating1Description?: LocalizedText;
    benefitFloating2Title?: LocalizedText;
    benefitFloating2Description?: LocalizedText;
    benefitFloating3Title?: LocalizedText;
    benefitFloating3Description?: LocalizedText;
    benefitShowcaseBadge?: LocalizedText;
    benefitShowcaseHeadline?: LocalizedText;
    benefitShowcaseHeadlineAccent?: LocalizedText;
    benefitFeature1Text?: LocalizedText;
    benefitFeature2Text?: LocalizedText;
    benefitFeature3Text?: LocalizedText;
    benefitFeature4Text?: LocalizedText;
    benefitShowcaseCtaText?: LocalizedText;
    benefitCtaBadgeText?: LocalizedText;
    benefitCtaText?: LocalizedText;
    benefitCtaHref?: string;
    benefitCtaSubText?: LocalizedText;
    benefitStat1Value?: LocalizedText;
    benefitStat1Label?: LocalizedText;
    benefitStat2Value?: LocalizedText;
    benefitStat2Label?: LocalizedText;
    benefitStat3Value?: LocalizedText;
    benefitStat3Label?: LocalizedText;
    benefitStat4Value?: LocalizedText;
    benefitStat4Label?: LocalizedText;
}

const DEFAULT_PROPS: Required<BenefitService01Props> = {
    benefitShowcaseImage: '/assets/images/benefit-banner.png',
    benefitShowcaseImageAlt: {
        sourceLocale: 'en',
        default: 'Workspace',
        translations: {
            vi: 'Không gian làm việc',
            ja: 'ワークスペース',
        },
    },
    benefitFloating1Title: {
        sourceLocale: 'en',
        default: '10-Minute Website',
        translations: {
            vi: 'Website trong 10 phút',
            ja: '10分でWebサイト',
        },
    },
    benefitFloating1Description: {
        sourceLocale: 'en',
        default: 'Generate a complete website in minutes.',
        translations: {
            vi: 'Tạo website hoàn chỉnh chỉ trong vài phút.',
            ja: '数分でWebサイトを自動生成。',
        },
    },
    benefitFloating2Title: {
        sourceLocale: 'en',
        default: 'Smart Page Builder',
        translations: {
            vi: 'Trình tạo trang thông minh',
            ja: 'スマートページビルダー',
        },
    },
    benefitFloating2Description: {
        sourceLocale: 'en',
        default: 'Create pages with reusable sections and templates.',
        translations: {
            vi: 'Tạo trang bằng các section và template có thể tái sử dụng.',
            ja: '再利用可能なセクションとテンプレートでページを作成。',
        },
    },
    benefitFloating3Title: {
        sourceLocale: 'en',
        default: 'AI + No-Code',
        translations: {
            vi: 'AI + Không cần lập trình',
            ja: 'AI + ノーコード',
        },
    },
    benefitFloating3Description: {
        sourceLocale: 'en',
        default: 'Build, customize and publish without coding.',
        translations: {
            vi: 'Xây dựng, tùy chỉnh và xuất bản mà không cần viết mã.',
            ja: 'コードを書かずに構築・編集・公開。',
        },
    },
    benefitShowcaseBadge: {
        sourceLocale: 'en',
        default: 'AI WEBSITE BUILDER',
        translations: {
            vi: 'TRÌNH TẠO WEBSITE AI',
            ja: 'AIウェブサイトビルダー',
        },
    },
    benefitShowcaseHeadline: {
        sourceLocale: 'en',
        default: 'Build professional websites',
        translations: {
            vi: 'Xây dựng website chuyên nghiệp',
            ja: 'プロフェッショナルなWebサイトを構築',
        },
    },
    benefitShowcaseHeadlineAccent: {
        sourceLocale: 'en',
        default: 'in just 10 minutes',
        translations: {
            vi: 'chỉ trong 10 phút',
            ja: 'わずか10分で',
        },
    },
    benefitFeature1Text: {
        sourceLocale: 'en',
        default: 'AI generates complete page structures automatically.',
        translations: {
            vi: 'AI tự động tạo cấu trúc website hoàn chỉnh.',
            ja: 'AIがページ構成を自動生成します。',
        },
    },
    benefitFeature2Text: {
        sourceLocale: 'en',
        default: 'Drag & Drop builder with reusable components.',
        translations: {
            vi: 'Trình kéo thả với các component tái sử dụng.',
            ja: 'ドラッグ＆ドロップ対応の再利用可能コンポーネント。',
        },
    },
    benefitFeature3Text: {
        sourceLocale: 'en',
        default: 'Landing, Blog, Store, Booking and LMS templates.',
        translations: {
            vi: 'Template Landing, Blog, Cửa hàng, Booking và LMS.',
            ja: 'ランディング・ブログ・ストア・予約・LMSテンプレート。',
        },
    },
    benefitFeature4Text: {
        sourceLocale: 'en',
        default: 'Connect your domain and publish with one click.',
        translations: {
            vi: 'Kết nối tên miền và xuất bản chỉ với một cú nhấp.',
            ja: '独自ドメイン接続とワンクリック公開。',
        },
    },
    benefitShowcaseCtaText: {
        sourceLocale: 'en',
        default: 'Start Building',
        translations: {
            vi: 'Bắt đầu xây dựng',
            ja: '今すぐ始める',
        },
    },
    benefitCtaBadgeText: {
        sourceLocale: 'en',
        default: 'Ready to get started?',
        translations: {
            vi: 'Sẵn sàng bắt đầu?',
            ja: '始める準備はできましたか？',
        },
    },
    benefitCtaText: {
        sourceLocale: 'en',
        default: 'Start Building Free',
        translations: {
            vi: 'Bắt đầu miễn phí',
            ja: '無料で始める',
        },
    },
    benefitCtaHref: '/contact',
    benefitCtaSubText: {
        sourceLocale: 'en',
        default: 'No credit card required · Setup in 10 minutes',
        translations: {
            vi: 'Không cần thẻ tín dụng · Thiết lập trong 10 phút',
            ja: 'クレジットカード不要・10分でセットアップ',
        },
    },
    benefitStat1Value: {
        sourceLocale: 'en',
        default: '12K+',
        translations: {
            vi: '12K+',
            ja: '12K+',
        },
    },
    benefitStat1Label: {
        sourceLocale: 'en',
        default: 'Active Users',
        translations: {
            vi: 'Người dùng hoạt động',
            ja: 'アクティブユーザー',
        },
    },
    benefitStat2Value: {
        sourceLocale: 'en',
        default: '240K+',
        translations: {
            vi: '240K+',
            ja: '240K+',
        },
    },
    benefitStat2Label: {
        sourceLocale: 'en',
        default: 'Tasks Completed',
        translations: {
            vi: 'Tác vụ hoàn thành',
            ja: '完了したタスク',
        },
    },
    benefitStat3Value: {
        sourceLocale: 'en',
        default: '99.9%',
        translations: {
            vi: '99.9%',
            ja: '99.9%',
        },
    },
    benefitStat3Label: {
        sourceLocale: 'en',
        default: 'Uptime',
        translations: {
            vi: 'Thời gian hoạt động',
            ja: '稼働率',
        },
    },
    benefitStat4Value: {
        sourceLocale: 'en',
        default: '4.9/5',
        translations: {
            vi: '4.9/5',
            ja: '4.9/5',
        },
    },
    benefitStat4Label: {
        sourceLocale: 'en',
        default: 'User Rating',
        translations: {
            vi: 'Đánh giá người dùng',
            ja: 'ユーザー評価',
        },
    },
};

type Locale = 'en' | 'vi' | 'ja';

const isLocale = (value: string): value is Locale =>
    value === 'en' || value === 'vi' || value === 'ja';

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.05) {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    return;
                }

                setInView(true);
                observer.disconnect();
            },
            { threshold },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [ref, threshold]);

    return inView;
}

function mergeProps(props: BenefitService01Props): Required<BenefitService01Props> {
    return {
        ...DEFAULT_PROPS,
        ...Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)),
    } as Required<BenefitService01Props>;
}

export function BenefitService01(props: BenefitService01Props) {
    const mergedProps = mergeProps(props);

    const {
        benefitShowcaseImage,
        benefitShowcaseImageAlt,
        benefitFloating1Title,
        benefitFloating1Description,
        benefitFloating2Title,
        benefitFloating2Description,
        benefitFloating3Title,
        benefitFloating3Description,
        benefitShowcaseBadge,
        benefitShowcaseHeadline,
        benefitShowcaseHeadlineAccent,
        benefitFeature1Text,
        benefitFeature2Text,
        benefitFeature3Text,
        benefitFeature4Text,
        benefitShowcaseCtaText,
        benefitCtaBadgeText,
        benefitCtaText,
        benefitCtaHref,
        benefitCtaSubText,
        benefitStat1Value,
        benefitStat1Label,
        benefitStat2Value,
        benefitStat2Label,
        benefitStat3Value,
        benefitStat3Label,
        benefitStat4Value,
        benefitStat4Label,
    } = mergedProps;

    const [selectedLocale, setSelectedLocale] = useState<Locale>('en');

    useEffect(() => {
        const storedLocale = window.localStorage.getItem('locale');

        if (storedLocale && isLocale(storedLocale)) {
            setSelectedLocale(storedLocale);
        }

        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            const locale = customEvent.detail;

            if (isLocale(locale)) {
                setSelectedLocale(locale);
            }
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    const floatingItems = [
        {
            icon: 'lightning-charge-fill',
            title: benefitFloating1Title,
            description: benefitFloating1Description,
        },
        {
            icon: 'grid-1x2-fill',
            title: benefitFloating2Title,
            description: benefitFloating2Description,
        },
        {
            icon: 'stars',
            title: benefitFloating3Title,
            description: benefitFloating3Description,
        },
    ];

    const features = [
        benefitFeature1Text,
        benefitFeature2Text,
        benefitFeature3Text,
        benefitFeature4Text,
    ];

    const stats = [
        {
            icon: 'rocket-takeoff-fill',
            value: benefitStat1Value,
            label: benefitStat1Label,
        },
        {
            icon: 'check2-circle',
            value: benefitStat2Value,
            label: benefitStat2Label,
        },
        {
            icon: 'clock-history',
            value: benefitStat3Value,
            label: benefitStat3Label,
        },
        {
            icon: 'star-fill',
            value: benefitStat4Value,
            label: benefitStat4Label,
        },
    ];

    const showcaseImage = benefitShowcaseImage.trim() || DEFAULT_PROPS.benefitShowcaseImage;

    const ctaHref = benefitCtaHref.trim() || DEFAULT_PROPS.benefitCtaHref;

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-labelledby="benefit-service-01-title"
        >
            <div className={styles.wrap}>
                <section className={styles.showcase}>
                    <div className={styles.container}>
                        <div className={styles.media}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={showcaseImage}
                                    alt={getLocalizedValue(benefitShowcaseImageAlt, selectedLocale)}
                                    className={styles.mainImage}
                                />

                                <div className={styles.floatingCard}>
                                    {floatingItems.map((item) => (
                                        <div key={item.icon} className={styles.floatingItem}>
                                            <span className={styles.floatingIcon}>
                                                <i
                                                    className={`bi bi-${item.icon}`}
                                                    aria-hidden="true"
                                                />
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
                                    <span
                                        key={spark.icon}
                                        className={spark.className}
                                        aria-hidden="true"
                                    >
                                        <i className={`bi bi-${spark.icon}`} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.content}>
                            <span className={styles.badge}>
                                {getLocalizedValue(benefitShowcaseBadge, selectedLocale)}
                            </span>

                            <h2 id="benefit-service-01-title">
                                {getLocalizedValue(benefitShowcaseHeadline, selectedLocale)}
                                <span className={styles.accent}>
                                    {getLocalizedValue(
                                        benefitShowcaseHeadlineAccent,
                                        selectedLocale,
                                    )}
                                </span>
                            </h2>

                            <ul className={styles.featureList}>
                                {features.map((feature, index) => (
                                    <li key={`feature-${index}`}>
                                        <i className="bi bi-check-circle-fill" aria-hidden="true" />
                                        {getLocalizedValue(feature, selectedLocale)}
                                    </li>
                                ))}
                            </ul>

                            <Link href={ctaHref} className={styles.button}>
                                {getLocalizedValue(benefitShowcaseCtaText, selectedLocale)}
                                <i className="bi bi-arrow-right" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </section>

                <div
                    className={styles.ctaStrip}
                    style={
                        {
                            '--i': stats.length + 1,
                        } as CSSProperties
                    }
                >
                    <div className={styles.ctaStripInner}>
                        <div className={styles.ctaCopy}>
                            <span className={styles.ctaBadge}>
                                <i className="bi bi-rocket-takeoff-fill" aria-hidden="true" />
                                {getLocalizedValue(benefitCtaBadgeText, selectedLocale)}
                            </span>
                            <div className={styles.ctaActions}>
                                <Link href={ctaHref} className={styles.ctaBtn}>
                                    {getLocalizedValue(benefitCtaText, selectedLocale)}
                                    <i className="bi bi-arrow-right" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>

                        <div className={styles.stats}>
                            {stats.map((stat) => (
                                <div key={stat.icon} className={styles.statItem}>
                                    <div className={styles.statIcon}>
                                        <i className={`bi bi-${stat.icon}`} aria-hidden="true" />
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

type LocalizedPropKey = {
    [K in keyof BenefitService01Props]: BenefitService01Props[K] extends LocalizedText | undefined
        ? K
        : never;
}[keyof BenefitService01Props];

const createLocalizedField = (key: string, label: string): InspectorField => ({
    kind: 'localized-text',
    key,
    label,
});
const createTextField = (key: 'benefitCtaHref', label: string): InspectorField => ({
    key,
    label,
    kind: 'text',
});

const createImageField = (key: 'benefitShowcaseImage', label: string): InspectorField => ({
    key,
    label,
    kind: 'image',
    folder: 'services/benefits',
    accept: 'image/*',
});

const createFloatingFields = (index: 1 | 2 | 3): InspectorField[] => {
    const titleKey = `benefitFloating${index}Title` as
        | 'benefitFloating1Title'
        | 'benefitFloating2Title'
        | 'benefitFloating3Title';

    const descriptionKey = `benefitFloating${index}Description` as
        | 'benefitFloating1Description'
        | 'benefitFloating2Description'
        | 'benefitFloating3Description';

    return [
        createLocalizedField(titleKey, `Floating ${index} Title`),
        createLocalizedField(descriptionKey, `Floating ${index} Description`),
    ];
};

const createFeatureFields = (): InspectorField[] => [
    createLocalizedField('benefitFeature1Text', 'Feature 1'),
    createLocalizedField('benefitFeature2Text', 'Feature 2'),
    createLocalizedField('benefitFeature3Text', 'Feature 3'),
    createLocalizedField('benefitFeature4Text', 'Feature 4'),
];

const createStatFields = (index: 1 | 2 | 3 | 4): InspectorField[] => {
    const valueKey = `benefitStat${index}Value` as
        | 'benefitStat1Value'
        | 'benefitStat2Value'
        | 'benefitStat3Value'
        | 'benefitStat4Value';

    const labelKey = `benefitStat${index}Label` as
        | 'benefitStat1Label'
        | 'benefitStat2Label'
        | 'benefitStat3Label'
        | 'benefitStat4Label';

    return [
        createLocalizedField(valueKey, `Stat ${index} Value`),
        createLocalizedField(labelKey, `Stat ${index} Label`),
    ];
};

function createInspector(): RegItem['inspector'] {
    return [
        createImageField('benefitShowcaseImage', 'Showcase Image'),
        createLocalizedField('benefitShowcaseImageAlt', 'Showcase Image Alt'),
        createLocalizedField('benefitShowcaseBadge', 'Showcase Badge'),
        createLocalizedField('benefitShowcaseHeadline', 'Showcase Headline'),
        createLocalizedField('benefitShowcaseHeadlineAccent', 'Showcase Headline Accent'),
        createFeatureFields()[0],
        createFeatureFields()[1],
        createFeatureFields()[2],
        createFeatureFields()[3],
        ...createFloatingFields(1),
        ...createFloatingFields(2),
        ...createFloatingFields(3),
        createLocalizedField('benefitShowcaseCtaText', 'Showcase CTA Text'),
        createLocalizedField('benefitCtaBadgeText', 'CTA Badge'),
        createLocalizedField('benefitCtaText', 'CTA Text'),
        createTextField('benefitCtaHref', 'CTA Link'),
        createLocalizedField('benefitCtaSubText', 'CTA Sub Text'),
        ...createStatFields(1),
        ...createStatFields(2),
        ...createStatFields(3),
        ...createStatFields(4),
    ];
}

export const BENEFIT_SERVICE_01: RegItem = {
    kind: 'benefit-service-01',
    label: 'Benefit Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <BenefitService01 {...(props as BenefitService01Props)} />,
};

export default BenefitService01;
