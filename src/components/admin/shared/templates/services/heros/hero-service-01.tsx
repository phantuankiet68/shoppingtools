'use client';

import styles from '@/components/admin/shared/templates/services/heros/styles/hero-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export interface HeroService01Props {
    badge?: LocalizedText;
    badgeHref?: string;
    headline?: LocalizedText;
    headlineAccent?: LocalizedText;
    subheadline?: LocalizedText;
    primaryCtaText?: LocalizedText;
    primaryCtaHref?: string;
    secondaryCtaText?: LocalizedText;
    secondaryCtaHref?: string;
    trustText?: LocalizedText;
    memberValue?: LocalizedText;
    memberText?: LocalizedText;
    publishTitle?: LocalizedText;
    publishDomain?: string;
    aiBadgeText?: LocalizedText;
    imageSrc?: string;
    imageAlt?: LocalizedText;
    templateTitle?: LocalizedText;
    templateDescription?: LocalizedText;

    dragTitle?: LocalizedText;
    dragDescription?: LocalizedText;

    publishCardTitle?: LocalizedText;
    publishCardDescription?: LocalizedText;

    responsiveTitle?: LocalizedText;
    responsiveDescription?: LocalizedText;
}

export const DEFAULT_PROPS: Required<HeroService01Props> = {
    badge: {
        sourceLocale: 'en',
        default: '🚀 Kbuilder AI Website Builder',
        translations: {
            vi: '🚀 Trình tạo website AI Kbuilder',
            ja: '🚀 Kbuilder AI ウェブサイトビルダー',
        },
    },
    badgeHref: '#',
    headline: {
        sourceLocale: 'en',
        default: 'Build Stunning Websites',
        translations: {
            vi: 'Tạo website chuyên nghiệp',
            ja: 'コードを書かずに',
        },
    },
    headlineAccent: {
        sourceLocale: 'en',
        default: 'Without Writing Code',
        translations: {
            vi: 'Không cần viết code',
            ja: '美しいWebサイトを作成',
        },
    },
    subheadline: {
        sourceLocale: 'en',
        default:
            'Design visually with an intuitive drag-and-drop canvas, customize professional templates, connect your own domain, and publish a fully responsive website in minutes.',
        translations: {
            vi: 'Thiết kế trực quan với trình kéo thả hiện đại, tùy chỉnh các mẫu website chuyên nghiệp, kết nối tên miền riêng và xuất bản website chuẩn responsive chỉ trong vài phút.',
            ja: '直感的なドラッグ＆ドロップキャンバスでデザインし、プロ仕様のテンプレートをカスタマイズして独自ドメインを接続し、レスポンシブ対応のWebサイトを数分で公開できます。',
        },
    },
    primaryCtaText: {
        sourceLocale: 'en',
        default: 'Start Building Free',
        translations: {
            vi: 'Bắt đầu miễn phí',
            ja: '無料で始める',
        },
    },
    primaryCtaHref: '/signup',
    secondaryCtaText: {
        sourceLocale: 'en',
        default: 'Explore Templates',
        translations: {
            vi: 'Khám phá giao diện',
            ja: 'テンプレートを見る',
        },
    },
    secondaryCtaHref: '/templates',
    trustText: {
        sourceLocale: 'en',
        default: 'No Coding Required · Custom Domain Support · Publish in 10 Minutes',
        translations: {
            vi: 'Không cần lập trình · Hỗ trợ tên miền riêng · Xuất bản trong 10 phút',
            ja: 'コーディング不要 · 独自ドメイン対応 · 10分で公開',
        },
    },
    memberValue: {
        sourceLocale: 'en',
        default: '+12 New Members',
        translations: {
            vi: '+12 thành viên mới',
            ja: '+12人の新規メンバー',
        },
    },
    memberText: {
        sourceLocale: 'en',
        default: 'Joined this week',
        translations: {
            vi: 'Tham gia tuần này',
            ja: '今週参加',
        },
    },
    publishTitle: {
        sourceLocale: 'en',
        default: 'Website Published',
        translations: {
            vi: 'Website đã xuất bản',
            ja: 'Webサイト公開済み',
        },
    },
    publishDomain: 'mycompany.com',
    aiBadgeText: {
        sourceLocale: 'en',
        default: 'AI Generated',
        translations: {
            vi: 'Được tạo bởi AI',
            ja: 'AI生成',
        },
    },
    imageSrc: '/assets/images/hero.png',
    imageAlt: {
        sourceLocale: 'en',
        default: 'Kbuilder Website Builder',
        translations: {
            vi: 'Trình tạo website Kbuilder',
            ja: 'Kbuilder ウェブサイトビルダー',
        },
    },
    templateTitle: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: {
            vi: 'Giao diện',
            ja: 'テンプレート',
        },
    },

    templateDescription: {
        sourceLocale: 'en',
        default: 'Professional Layouts',
        translations: {
            vi: 'Bố cục chuyên nghiệp',
            ja: 'プロ仕様レイアウト',
        },
    },

    dragTitle: {
        sourceLocale: 'en',
        default: 'Drag & Drop',
        translations: {
            vi: 'Kéo & Thả',
            ja: 'ドラッグ＆ドロップ',
        },
    },

    dragDescription: {
        sourceLocale: 'en',
        default: 'Visual Builder',
        translations: {
            vi: 'Trình thiết kế trực quan',
            ja: 'ビジュアルビルダー',
        },
    },

    publishCardTitle: {
        sourceLocale: 'en',
        default: 'Publish',
        translations: {
            vi: 'Xuất bản',
            ja: '公開',
        },
    },

    publishCardDescription: {
        sourceLocale: 'en',
        default: '1 Click Deploy',
        translations: {
            vi: 'Triển khai 1 chạm',
            ja: 'ワンクリック公開',
        },
    },

    responsiveTitle: {
        sourceLocale: 'en',
        default: 'Responsive',
        translations: {
            vi: 'Responsive',
            ja: 'レスポンシブ',
        },
    },

    responsiveDescription: {
        sourceLocale: 'en',
        default: 'All Devices',
        translations: {
            vi: 'Mọi thiết bị',
            ja: 'すべてのデバイス',
        },
    },
};

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
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

export function HeroService01(props: HeroService01Props) {
    const {
        badge,
        badgeHref,
        headline,
        headlineAccent,
        subheadline,
        primaryCtaText,
        primaryCtaHref,
        secondaryCtaText,
        secondaryCtaHref,
        trustText,
        memberValue,
        memberText,
        publishTitle,
        publishDomain,
        aiBadgeText,
        imageSrc,
        imageAlt,
        templateTitle,
        templateDescription,
        dragTitle,
        dragDescription,
        publishCardTitle,
        publishCardDescription,
        responsiveTitle,
        responsiveDescription,
    } = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') {
            return 'en';
        }

        return localStorage.getItem('locale') ?? 'en';
    });
    const localizedHeadline = getLocalizedValue(headline, selectedLocale);

    const headlineLines = localizedHeadline.split('\n');

    useEffect(() => {
        function handleLocaleChange(e: Event) {
            const locale = (e as CustomEvent<string>).detail;
            setSelectedLocale(locale);
        }

        window.addEventListener('locale-change', handleLocaleChange);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange);
        };
    }, []);
    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Hero"
        >
            <div className={styles.grid} />
            <div className={styles.blurOne} />
            <div className={styles.blurTwo} />
            <div className={styles.blurThree} />
            <div className={styles.container}>
                <div className={styles.content}>
                    <a
                        href={badgeHref}
                        className={`${styles.badge} ${styles.r}`}
                        style={{ '--i': 0 } as React.CSSProperties}
                    >
                        <span className={styles.badgeIcon}>
                            <i className="bi bi-stars" />
                        </span>
                        <span>{getLocalizedValue(badge, selectedLocale)}</span>
                        <i className="bi bi-arrow-right" />
                    </a>
                    <div
                        className={`${styles.heading} ${styles.r}`}
                        style={{ '--i': 1 } as React.CSSProperties}
                    >
                        <h1 className={styles.title}>
                            {headlineLines.map((item, index) => (
                                <span key={index} className={styles.titleLine}>
                                    {item}
                                </span>
                            ))}
                            <span className={styles.gradient}>
                                {getLocalizedValue(headlineAccent, selectedLocale)}
                            </span>
                        </h1>

                        <p className={styles.description}>
                            {getLocalizedValue(subheadline, selectedLocale)}
                        </p>
                    </div>
                    <div
                        className={`${styles.actions} ${styles.r}`}
                        style={{ '--i': 2 } as React.CSSProperties}
                    >
                        <Link href={primaryCtaHref} className={styles.primaryButton}>
                            <span>{getLocalizedValue(primaryCtaText, selectedLocale)}</span>

                            <i className="bi bi-arrow-up-right" />
                        </Link>
                        <Link href={secondaryCtaHref} className={styles.secondaryButton}>
                            <span className={styles.playIcon}>
                                <i className="bi bi-play-fill" />
                            </span>
                            <span>{getLocalizedValue(secondaryCtaText, selectedLocale)}</span>
                        </Link>
                    </div>
                    <div
                        className={`${styles.features} ${styles.r}`}
                        style={{ '--i': 3 } as React.CSSProperties}
                    >
                        {getLocalizedValue(trustText, selectedLocale)
                            .split(' · ')
                            .map((item) => (
                                <div key={item} className={styles.feature}>
                                    <i className="bi bi-check-circle-fill" />
                                    <span>{item}</span>
                                </div>
                            ))}
                    </div>
                </div>
                <div className={styles.visual}>
                    <div className={`${styles.floatCard} ${styles.templateCard}`}>
                        <i className="bi bi-grid-3x3-gap-fill" />
                        <div>
                            <strong>{getLocalizedValue(templateTitle, selectedLocale)}</strong>
                            <span>{getLocalizedValue(templateDescription, selectedLocale)}</span>
                        </div>
                    </div>

                    <div className={`${styles.floatCard} ${styles.dragCard}`}>
                        <i className="bi bi-cursor-fill" />
                        <div>
                            <strong>{getLocalizedValue(dragTitle, selectedLocale)}</strong>
                            <span>{getLocalizedValue(dragDescription, selectedLocale)}</span>
                        </div>
                    </div>

                    <div className={`${styles.floatCard} ${styles.publishCard}`}>
                        <i className="bi bi-cloud-upload-fill" />
                        <div>
                            <strong>{getLocalizedValue(publishCardTitle, selectedLocale)}</strong>
                            <span>{getLocalizedValue(publishCardDescription, selectedLocale)}</span>
                        </div>
                    </div>

                    <div className={`${styles.floatCard} ${styles.deviceCard}`}>
                        <i className="bi bi-phone-fill" />
                        <div>
                            <strong>{getLocalizedValue(responsiveTitle, selectedLocale)}</strong>
                            <span>{getLocalizedValue(responsiveDescription, selectedLocale)}</span>
                        </div>
                    </div>
                    <div className={styles.previewImage}>
                        <div className={styles.previewImage}>
                            <div className={styles.previewImage}>
                                <Image
                                    src={imageSrc}
                                    alt={getLocalizedValue(imageAlt, selectedLocale)}
                                    fill
                                    priority
                                    sizes="50vw"
                                    className={styles.heroImage}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.platform}>
                        <div className={styles.platformRing} />
                        <div className={styles.platformCore}>
                            <div className={styles.platformLogo}>K</div>
                        </div>
                    </div>
                    <div className={styles.membersCard}>
                        <div className={styles.avatarGroup}>
                            <span />
                            <span />
                            <span />
                        </div>
                        <div>
                            <strong>{getLocalizedValue(memberValue, selectedLocale)}</strong>
                            <p>{getLocalizedValue(memberText, selectedLocale)}</p>
                        </div>
                    </div>
                    <div className={styles.publishStatus}>
                        <div className={styles.successIcon}>
                            <i className="bi bi-check-lg" />
                        </div>
                        <div>
                            <strong>{getLocalizedValue(publishTitle, selectedLocale)}</strong>
                            <p>{publishDomain}</p>
                        </div>
                    </div>
                    <div className={styles.aiBadge}>
                        <i className="bi bi-lightning-charge-fill" />
                        {getLocalizedValue(aiBadgeText, selectedLocale)}
                    </div>
                </div>
            </div>
        </section>
    );
}
function createHeroInspector(): RegItem['inspector'] {
    return [
        {
            key: 'badge',
            label: 'Badge',
            kind: 'localized-text',
        },
        {
            key: 'badgeHref',
            label: 'Badge Link',
            kind: 'text',
        },
        {
            key: 'headline',
            label: 'Headline',
            kind: 'localized-text',
        },
        {
            key: 'headlineAccent',
            label: 'Headline Accent',
            kind: 'localized-text',
        },
        {
            key: 'subheadline',
            label: 'Subheadline',
            kind: 'localized-text',
        },
    ];
}

function createCTAInspector(): RegItem['inspector'] {
    return [
        {
            key: 'primaryCtaText',
            label: 'Primary CTA Text',
            kind: 'localized-text',
        },
        {
            key: 'primaryCtaHref',
            label: 'Primary CTA Link',
            kind: 'text',
        },
        {
            key: 'secondaryCtaText',
            label: 'Secondary CTA Text',
            kind: 'localized-text',
        },
        {
            key: 'secondaryCtaHref',
            label: 'Secondary CTA Link',
            kind: 'text',
        },
    ];
}

function createFeatureInspector(): RegItem['inspector'] {
    return [
        {
            key: 'trustText',
            label: 'Trust Features',
            kind: 'localized-text',
        },
    ];
}

function createMemberInspector(): RegItem['inspector'] {
    return [
        {
            key: 'memberValue',
            label: 'Member Value',
            kind: 'localized-text',
        },
        {
            key: 'memberText',
            label: 'Member Description',
            kind: 'localized-text',
        },
    ];
}

function createPublishInspector(): RegItem['inspector'] {
    return [
        {
            key: 'publishTitle',
            label: 'Publish Title',
            kind: 'localized-text',
        },
        {
            key: 'publishDomain',
            label: 'Publish Domain',
            kind: 'text',
        },
        {
            key: 'aiBadgeText',
            label: 'AI Badge',
            kind: 'localized-text',
        },
    ];
}

function createImageInspector(): RegItem['inspector'] {
    return [
        {
            key: 'imageSrc',
            label: 'Hero Image',
            kind: 'image',
            folder: 'services/heros',
            accept: 'image/*',
        },
        {
            key: 'imageAlt',
            label: 'Image Alt',
            kind: 'localized-text',
        },
    ];
}

function createFloatCardInspector(): RegItem['inspector'] {
    return [
        {
            key: 'templateTitle',
            label: 'Template Title',
            kind: 'localized-text',
        },
        {
            key: 'templateDescription',
            label: 'Template Description',
            kind: 'localized-text',
        },
        {
            key: 'dragTitle',
            label: 'Drag Title',
            kind: 'localized-text',
        },
        {
            key: 'dragDescription',
            label: 'Drag Description',
            kind: 'localized-text',
        },
        {
            key: 'publishCardTitle',
            label: 'Publish Card Title',
            kind: 'localized-text',
        },
        {
            key: 'publishCardDescription',
            label: 'Publish Card Description',
            kind: 'localized-text',
        },
        {
            key: 'responsiveTitle',
            label: 'Responsive Title',
            kind: 'localized-text',
        },
        {
            key: 'responsiveDescription',
            label: 'Responsive Description',
            kind: 'localized-text',
        },
    ];
}

function createInspector(): RegItem['inspector'] {
    return [
        ...createHeroInspector(),
        ...createCTAInspector(),
        ...createFeatureInspector(),
        ...createMemberInspector(),
        ...createPublishInspector(),
        ...createImageInspector(),
        ...createFloatCardInspector(),
    ];
}
/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const HERO_SERVICE_01: RegItem = {
    kind: 'HeroService01',
    label: 'Hero Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <HeroService01 {...(props as HeroService01Props)} />,
};

export default HeroService01;
