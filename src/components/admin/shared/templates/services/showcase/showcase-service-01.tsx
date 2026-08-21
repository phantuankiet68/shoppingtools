'use client';

import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/showcase/styles/showcase-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import { useMemo, useState, useEffect } from 'react';

interface ShowcaseCard {
    title: LocalizedText;
    description: LocalizedText;
    href: string;
    icon: string;
    badge: LocalizedText;
    tags: LocalizedText[];
}

export interface ShowcaseService01Props {
    cardCoreText?: LocalizedText;
    cardButtonText?: LocalizedText;

    card1Title?: LocalizedText;
    card1Description?: LocalizedText;
    card1Href?: string;
    card1Badge?: LocalizedText;
    card1Tag1?: LocalizedText;
    card1Tag2?: LocalizedText;
    card1Tag3?: LocalizedText;

    card2Title?: LocalizedText;
    card2Description?: LocalizedText;
    card2Href?: string;
    card2Badge?: LocalizedText;
    card2Tag1?: LocalizedText;
    card2Tag2?: LocalizedText;
    card2Tag3?: LocalizedText;

    card3Title?: LocalizedText;
    card3Description?: LocalizedText;
    card3Href?: string;
    card3Badge?: LocalizedText;
    card3Tag1?: LocalizedText;
    card3Tag2?: LocalizedText;
    card3Tag3?: LocalizedText;

    card4Title?: LocalizedText;
    card4Description?: LocalizedText;
    card4Href?: string;
    card4Badge?: LocalizedText;
    card4Tag1?: LocalizedText;
    card4Tag2?: LocalizedText;
    card4Tag3?: LocalizedText;
}

export const DEFAULT_PROPS: Required<ShowcaseService01Props> = {
    cardCoreText: {
        sourceLocale: 'en',
        default: 'Core',
        translations: {
            vi: 'Cốt lõi',
            ja: 'コア',
        },
    },

    cardButtonText: {
        sourceLocale: 'en',
        default: 'Learn More',
        translations: {
            vi: 'Tìm hiểu thêm',
            ja: '詳しく見る',
        },
    },

    // Card 1
    card1Title: {
        sourceLocale: 'en',
        default: 'Visual Drag & Drop',
        translations: {
            vi: 'Kéo & Thả Trực Quan',
            ja: 'ビジュアルドラッグ＆ドロップ',
        },
    },

    card1Description: {
        sourceLocale: 'en',
        default:
            'Design beautiful, responsive pages on a visual canvas with effortless drag-and-drop editing. No code required.',
        translations: {
            vi: 'Thiết kế website trực quan với thao tác kéo thả đơn giản, không cần viết mã.',
            ja: 'コード不要でドラッグ＆ドロップによる直感的な編集を実現します。',
        },
    },

    card1Href: '/builder',

    card1Badge: {
        sourceLocale: 'en',
        default: 'Visual Builder',
        translations: {
            vi: 'Visual Builder',
            ja: 'ビジュアルビルダー',
        },
    },

    card1Tag1: {
        sourceLocale: 'en',
        default: 'Drag & Drop',
        translations: {
            vi: 'Kéo & Thả',
            ja: 'ドラッグ＆ドロップ',
        },
    },

    card1Tag2: {
        sourceLocale: 'en',
        default: 'Canvas',
        translations: {
            vi: 'Canvas',
            ja: 'キャンバス',
        },
    },

    card1Tag3: {
        sourceLocale: 'en',
        default: 'No Code',
        translations: {
            vi: 'Không Code',
            ja: 'ノーコード',
        },
    },

    // Card 2
    card2Title: {
        sourceLocale: 'en',
        default: 'Premium Templates',
        translations: {
            vi: 'Template Cao Cấp',
            ja: 'プレミアムテンプレート',
        },
    },

    card2Description: {
        sourceLocale: 'en',
        default:
            'Connect your custom domain, secure your website with free SSL, and publish instantly with one-click deployment.',
        translations: {
            vi: 'Khởi tạo website nhanh chóng với kho template chuyên nghiệp.',
            ja: '高品質なテンプレートですばやくサイトを公開できます。',
        },
    },

    card2Href: '/templates',

    card2Badge: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: {
            vi: 'Templates',
            ja: 'テンプレート',
        },
    },

    card2Tag1: {
        sourceLocale: 'en',
        default: 'Responsive',
        translations: {
            vi: 'Responsive',
            ja: 'レスポンシブ',
        },
    },

    card2Tag2: {
        sourceLocale: 'en',
        default: 'SEO',
        translations: {
            vi: 'SEO',
            ja: 'SEO',
        },
    },

    card2Tag3: {
        sourceLocale: 'en',
        default: 'Modern UI',
        translations: {
            vi: 'UI Hiện Đại',
            ja: 'モダンUI',
        },
    },

    // Card 3
    card3Title: {
        sourceLocale: 'en',
        default: 'Reusable Components',
        translations: {
            vi: 'Component Tái Sử Dụng',
            ja: '再利用可能なコンポーネント',
        },
    },

    card3Description: {
        sourceLocale: 'en',
        default:
            'Build once, reuse everywhere—headers, footers, sections, and layouts across unlimited projects.',
        translations: {
            vi: 'Xây dựng một lần và tái sử dụng trên mọi dự án.',
            ja: '一度作成すれば複数のプロジェクトで再利用できます。',
        },
    },

    card3Href: '/components',

    card3Badge: {
        sourceLocale: 'en',
        default: 'Components',
        translations: {
            vi: 'Components',
            ja: 'コンポーネント',
        },
    },

    card3Tag1: {
        sourceLocale: 'en',
        default: 'Reusable',
        translations: {
            vi: 'Tái sử dụng',
            ja: '再利用',
        },
    },

    card3Tag2: {
        sourceLocale: 'en',
        default: 'Flexible',
        translations: {
            vi: 'Linh hoạt',
            ja: '柔軟',
        },
    },

    card3Tag3: {
        sourceLocale: 'en',
        default: 'Fast',
        translations: {
            vi: 'Nhanh',
            ja: '高速',
        },
    },

    // Card 4
    card4Title: {
        sourceLocale: 'en',
        default: 'Publish Anywhere',
        translations: {
            vi: 'Xuất Bản Mọi Nơi',
            ja: 'どこへでも公開',
        },
    },

    card4Description: {
        sourceLocale: 'en',
        default:
            'Connect your custom domain, secure your website with free SSL, and publish instantly with one-click deployment.',
        translations: {
            vi: 'Kết nối tên miền riêng, bảo mật website với SSL miễn phí và xuất bản ngay chỉ bằng một cú nhấp.',
            ja: '独自ドメインを接続し、無料SSLでサイトを保護。ワンクリックですぐに公開できます。',
        },
    },

    card4Href: '/publish',

    card4Badge: {
        sourceLocale: 'en',
        default: 'Publishing',
        translations: {
            vi: 'Xuất bản',
            ja: '公開',
        },
    },

    card4Tag1: {
        sourceLocale: 'en',
        default: 'Custom Domain',
        translations: {
            vi: 'Tên miền riêng',
            ja: '独自ドメイン',
        },
    },

    card4Tag2: {
        sourceLocale: 'en',
        default: 'SSL',
        translations: {
            vi: 'SSL',
            ja: 'SSL',
        },
    },

    card4Tag3: {
        sourceLocale: 'en',
        default: 'Deploy',
        translations: {
            vi: 'Triển khai',
            ja: 'デプロイ',
        },
    },
};

function ShowcaseCardItem({
    card,
    index,
    coreText,
    buttonText,
}: {
    card: ShowcaseCard;
    index: number;
    coreText: LocalizedText;
    buttonText: LocalizedText;
}) {
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

    const localizedBadge = getLocalizedValue(card.badge, selectedLocale);

    const localizedCoreText = getLocalizedValue(coreText, selectedLocale);

    const localizedTitle = getLocalizedValue(card.title, selectedLocale);

    const localizedDescription = getLocalizedValue(card.description, selectedLocale);

    const localizedButtonText = getLocalizedValue(buttonText, selectedLocale);

    const localizedTags = card.tags.map((tag) => getLocalizedValue(tag, selectedLocale));
    return (
        <article className={styles.card}>
            <span className={styles.glow}></span>

            <div className={styles.header}>
                <div className={styles.category}>
                    <div className={styles.iconBox}>
                        <i className={card.icon}></i>
                    </div>

                    <span>{localizedBadge}</span>
                </div>

                <span className={styles.core}>{localizedCoreText}</span>
            </div>

            <div className={styles.body}>
                <h3>{localizedTitle}</h3>
                <p>{localizedDescription}</p>
            </div>

            <div className={styles.tags}>
                {localizedTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                ))}
            </div>

            <div className={styles.footer}>
                <Link href={card.href} className={styles.button}>
                    {localizedButtonText}
                    <i className="bi bi-arrow-up-right"></i>
                </Link>

                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            </div>
        </article>
    );
}

export function ShowcaseService01(props: ShowcaseService01Props) {
    const mergedProps: Required<ShowcaseService01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        cardCoreText,
        cardButtonText,

        card1Title,
        card1Description,
        card1Href,
        card1Badge,
        card1Tag1,
        card1Tag2,
        card1Tag3,

        card2Title,
        card2Description,
        card2Href,
        card2Badge,
        card2Tag1,
        card2Tag2,
        card2Tag3,

        card3Title,
        card3Description,
        card3Href,
        card3Badge,
        card3Tag1,
        card3Tag2,
        card3Tag3,

        card4Title,
        card4Description,
        card4Href,
        card4Badge,
        card4Tag1,
        card4Tag2,
        card4Tag3,
    } = mergedProps;

    const cards: ShowcaseCard[] = [
        {
            title: card1Title,
            description: card1Description,
            href: card1Href,
            icon: 'bi bi-window-stack',
            badge: card1Badge,
            tags: [card1Tag1, card1Tag2, card1Tag3],
        },
        {
            title: card2Title,
            description: card2Description,
            href: card2Href,
            icon: 'bi bi-grid-1x2-fill',
            badge: card2Badge,
            tags: [card2Tag1, card2Tag2, card2Tag3],
        },
        {
            title: card3Title,
            description: card3Description,
            href: card3Href,
            icon: 'bi bi-boxes',
            badge: card3Badge,
            tags: [card3Tag1, card3Tag2, card3Tag3],
        },
        {
            title: card4Title,
            description: card4Description,
            href: card4Href,
            icon: 'bi bi-rocket-takeoff-fill',
            badge: card4Badge,
            tags: [card4Tag1, card4Tag2, card4Tag3],
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {cards.map((card, index) => (
                        <ShowcaseCardItem
                            key={`${card.href}-${index}`}
                            card={card}
                            index={index}
                            coreText={cardCoreText}
                            buttonText={cardButtonText}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function createGeneralInspector(): RegItem['inspector'] {
    return [
        {
            key: 'cardCoreText',
            label: 'Card Core Text',
            kind: 'localized-text',
        },
        {
            key: 'cardButtonText',
            label: 'Card Button Text',
            kind: 'localized-text',
        },
    ];
}

function createCardInspector(index: 1 | 2 | 3 | 4): RegItem['inspector'] {
    return [
        {
            key: `card${index}Title`,
            label: `Card ${index} Title`,
            kind: 'localized-text',
        },
        {
            key: `card${index}Description`,
            label: `Card ${index} Description`,
            kind: 'localized-text',
        },
        {
            key: `card${index}Href`,
            label: `Card ${index} Link`,
            kind: 'text',
        },
        {
            key: `card${index}Badge`,
            label: `Card ${index} Badge`,
            kind: 'localized-text',
        },
        {
            key: `card${index}Tag1`,
            label: `Card ${index} Tag 1`,
            kind: 'localized-text',
        },
        {
            key: `card${index}Tag2`,
            label: `Card ${index} Tag 2`,
            kind: 'localized-text',
        },
        {
            key: `card${index}Tag3`,
            label: `Card ${index} Tag 3`,
            kind: 'localized-text',
        },
    ];
}

function createInspector(): RegItem['inspector'] {
    return [
        ...createGeneralInspector(),
        ...createCardInspector(1),
        ...createCardInspector(2),
        ...createCardInspector(3),
        ...createCardInspector(4),
    ];
}

export const SHOWCASE_SERVICE_01: RegItem = {
    kind: 'showcase-service-01',

    label: 'Showcase Service 01',

    defaults: DEFAULT_PROPS,

    inspector: createInspector(),

    render: (props) => <ShowcaseService01 {...(props as ShowcaseService01Props)} />,
};

export default ShowcaseService01;
