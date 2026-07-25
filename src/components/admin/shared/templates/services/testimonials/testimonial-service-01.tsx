'use client';

import styles from '@/components/admin/shared/templates/services/testimonials/styles/testimonial-service-01.module.css';

import { useEffect, useMemo, useRef, useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';

export interface TestimonialItem {
    id: string;

    avatar: string;

    name: LocalizedText;
    role: LocalizedText;

    website?: string;
    websiteLabel?: LocalizedText;

    quote: LocalizedText;

    rating?: number;

    metaText?: LocalizedText;

    accentColor?: string;
}

export interface TestimonialService01Props {
    siteId?: string;

    headline?: LocalizedText;
    headlineAccent?: LocalizedText;
    subheadline?: LocalizedText;

    exploreText?: LocalizedText;
    verifiedText?: LocalizedText;

    // Testimonial 1
    testimonial1Avatar?: string;
    testimonial1Name?: LocalizedText;
    testimonial1Role?: LocalizedText;
    testimonial1Website?: string;
    testimonial1WebsiteLabel?: LocalizedText;
    testimonial1Quote?: LocalizedText;
    testimonial1Rating?: number;

    // Testimonial 2
    testimonial2Avatar?: string;
    testimonial2Name?: LocalizedText;
    testimonial2Role?: LocalizedText;
    testimonial2Website?: string;
    testimonial2WebsiteLabel?: LocalizedText;
    testimonial2Quote?: LocalizedText;
    testimonial2Rating?: number;

    // Testimonial 3
    testimonial3Avatar?: string;
    testimonial3Name?: LocalizedText;
    testimonial3Role?: LocalizedText;
    testimonial3Website?: string;
    testimonial3WebsiteLabel?: LocalizedText;
    testimonial3Quote?: LocalizedText;
    testimonial3Rating?: number;
}
/* ─────────────────────────────────────────────────
   Hook
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

function Stars({ rating = 5 }: { rating?: number }) {
    const safeRating = Math.max(0, Math.min(5, rating));

    return (
        <div className={styles.stars} aria-label={`${safeRating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={i < safeRating ? 'bi bi-star-fill' : 'bi bi-star'} />
            ))}
        </div>
    );
}

export const DEFAULT_PROPS: Required<TestimonialService01Props> = {
    siteId: '',

    headline: {
        sourceLocale: 'en',
        default: 'Professional Websites',
        translations: {
            vi: 'Website chuyên nghiệp',
            ja: 'プロフェッショナルなWebサイト',
        },
    },

    headlineAccent: {
        sourceLocale: 'en',
        default: 'Made Simple',
        translations: {
            vi: 'Được tạo đơn giản',
            ja: 'シンプルに構築',
        },
    },

    subheadline: {
        sourceLocale: 'en',
        default:
            'See how other small businesses are transforming their operations with our software.',
        translations: {
            vi: 'Khám phá cách các doanh nghiệp nhỏ đang chuyển đổi hoạt động với nền tảng của chúng tôi.',
            ja: '中小企業が当社のソフトウェアでどのように業務を改善しているかをご覧ください。',
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

    verifiedText: {
        sourceLocale: 'en',
        default: 'Verified Customer',
        translations: {
            vi: 'Khách hàng đã xác minh',
            ja: '認証済みユーザー',
        },
    },

    // Testimonial 1
    testimonial1Avatar: 'https://i.pravatar.cc/200?img=13',

    testimonial1Name: {
        sourceLocale: 'en',
        default: 'Michael Chen',
        translations: {
            vi: 'Michael Chen',
            ja: 'Michael Chen',
        },
    },

    testimonial1Role: {
        sourceLocale: 'en',
        default: 'Manager, Chen & Associates',
        translations: {
            vi: 'Quản lý, Chen & Associates',
            ja: 'マネージャー・Chen & Associates',
        },
    },

    testimonial1Website: 'https://chenassociates.com',

    testimonial1WebsiteLabel: {
        sourceLocale: 'en',
        default: 'chenassociates.com',
        translations: {
            vi: 'chenassociates.com',
            ja: 'chenassociates.com',
        },
    },

    testimonial1Quote: {
        sourceLocale: 'en',
        default:
            'The onboarding process was smooth, and the customer support team was incredibly helpful. We were up and running within days, not weeks.',
        translations: {
            vi: 'Quá trình triển khai rất suôn sẻ. Đội ngũ hỗ trợ luôn nhiệt tình và chúng tôi đưa hệ thống vào hoạt động chỉ trong vài ngày.',
            ja: '導入は非常にスムーズで、サポートチームも素晴らしかったです。数日で運用を開始できました。',
        },
    },

    testimonial1Rating: 5,

    // Testimonial 2
    testimonial2Avatar: 'https://i.pravatar.cc/200?img=32',

    testimonial2Name: {
        sourceLocale: 'en',
        default: 'Emily Rodriguez',
        translations: {
            vi: 'Emily Rodriguez',
            ja: 'Emily Rodriguez',
        },
    },

    testimonial2Role: {
        sourceLocale: 'en',
        default: 'Founder, Rodriguez Marketing',
        translations: {
            vi: 'Nhà sáng lập, Rodriguez Marketing',
            ja: 'Rodriguez Marketing 創業者',
        },
    },

    testimonial2Website: 'https://rodriguezmarketing.com',

    testimonial2WebsiteLabel: {
        sourceLocale: 'en',
        default: 'rodriguezmarketing.com',
        translations: {
            vi: 'rodriguezmarketing.com',
            ja: 'rodriguezmarketing.com',
        },
    },

    testimonial2Quote: {
        sourceLocale: 'en',
        default:
            'The automation features have transformed how we handle client projects. What used to take hours now happens automatically in the background.',
        translations: {
            vi: 'Các tính năng tự động hóa đã thay đổi hoàn toàn quy trình làm việc của chúng tôi. Những việc từng mất hàng giờ giờ đây được xử lý tự động.',
            ja: '自動化機能によって業務効率が大幅に向上し、何時間もかかっていた作業が自動で処理されるようになりました。',
        },
    },

    testimonial2Rating: 5,

    // Testimonial 3
    testimonial3Avatar: 'https://i.pravatar.cc/200?img=14',

    testimonial3Name: {
        sourceLocale: 'en',
        default: 'David Park',
        translations: {
            vi: 'David Park',
            ja: 'David Park',
        },
    },

    testimonial3Role: {
        sourceLocale: 'en',
        default: 'Founder, Park Consulting',
        translations: {
            vi: 'Nhà sáng lập, Park Consulting',
            ja: 'Park Consulting 創業者',
        },
    },

    testimonial3Website: 'https://parkconsulting.co',

    testimonial3WebsiteLabel: {
        sourceLocale: 'en',
        default: 'parkconsulting.co',
        translations: {
            vi: 'parkconsulting.co',
            ja: 'parkconsulting.co',
        },
    },

    testimonial3Quote: {
        sourceLocale: 'en',
        default:
            'The reporting dashboard gives us insights we never had before. Decision making is faster and backed by real data now.',
        translations: {
            vi: 'Bảng điều khiển báo cáo mang lại những dữ liệu quý giá giúp chúng tôi đưa ra quyết định nhanh và chính xác hơn.',
            ja: 'レポートダッシュボードにより、これまで得られなかった分析情報を活用し、迅速な意思決定が可能になりました。',
        },
    },

    testimonial3Rating: 5,
};

function createTestimonial(
    index: 1 | 2 | 3,
    accentColor: string,
    props: Required<TestimonialService01Props>,
): TestimonialItem {
    return {
        id: `testimonial-${index}`,
        avatar: props[`testimonial${index}Avatar`],
        name: props[`testimonial${index}Name`],
        role: props[`testimonial${index}Role`],
        website: props[`testimonial${index}Website`],
        websiteLabel: props[`testimonial${index}WebsiteLabel`],
        quote: props[`testimonial${index}Quote`],
        rating: props[`testimonial${index}Rating`],
        accentColor,
    };
}
/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function TestimonialService01(props: TestimonialService01Props) {
    const mergedProps: Required<TestimonialService01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const { headline, headlineAccent, subheadline, exploreText, verifiedText } = mergedProps;

    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

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

    const testimonials = useMemo<TestimonialItem[]>(
        () => [
            createTestimonial(1, '#0EA5E9', mergedProps),
            createTestimonial(2, '#10B981', mergedProps),
            createTestimonial(3, '#F59E0B', mergedProps),
        ],
        [mergedProps],
    );

    const [emblaRef] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            skipSnaps: false,
        },
        [
            Autoplay({
                delay: 3500,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ],
    );

    const [selectedId, setSelectedId] = useState<string>('testimonial-1');

    const selected =
        testimonials.find((testimonial) => testimonial.id === selectedId) ?? testimonials[0];

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Testimonials"
        >
            <div className={styles.wrap}>
                <div className={styles.topHeader}>
                    <div className={styles.header}>
                        <h2>
                            {t(headline)} <span className={styles.accent}>{t(headlineAccent)}</span>
                        </h2>

                        <p className={styles.sub}>{t(subheadline)}</p>

                        <button className={styles.button}>
                            {t(exploreText)}
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>

                    <div className={styles.embla} ref={emblaRef}>
                        <div className={styles.emblaContainer}>
                            {testimonials.map((testimonial, idx) => (
                                <div key={testimonial.id} className={styles.emblaSlide}>
                                    <div
                                        className={styles.card}
                                        onClick={() => setSelectedId(testimonial.id)}
                                        style={
                                            {
                                                '--i': idx + 1,
                                                '--accent': testimonial.accentColor ?? '#6366F1',
                                            } as React.CSSProperties
                                        }
                                    >
                                        <div className={styles.cardHead}>
                                            <img
                                                src={testimonial.avatar}
                                                alt={t(testimonial.name)}
                                                className={styles.avatar}
                                            />

                                            <div>
                                                <h5>{t(testimonial.name)}</h5>

                                                <p>{t(testimonial.role)}</p>

                                                {testimonial.website && (
                                                    <a
                                                        href={testimonial.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.website}
                                                    >
                                                        <i className="bi bi-globe2" />
                                                        {testimonial.websiteLabel
                                                            ? t(testimonial.websiteLabel)
                                                            : testimonial.website}
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <p className={styles.cardQuote}>“{t(testimonial.quote)}”</p>

                                        <Stars rating={testimonial.rating} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className={styles.featuredCard}
                    style={
                        {
                            '--accent': selected.accentColor ?? '#6366F1',
                        } as React.CSSProperties
                    }
                >
                    <div className={styles.headerStar}>
                        <Stars rating={selected.rating} />

                        {selected.website && (
                            <a
                                href={selected.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.website}
                            >
                                <i className="bi bi-globe2" />
                                {selected.websiteLabel
                                    ? t(selected.websiteLabel)
                                    : selected.website}
                            </a>
                        )}
                    </div>

                    <blockquote className={styles.quote}>“{t(selected.quote)}”</blockquote>

                    <div className={styles.footer}>
                        <img
                            src={selected.avatar}
                            alt={t(selected.name)}
                            className={styles.avatar}
                        />

                        <div className={styles.info}>
                            <h4>{t(selected.name)}</h4>

                            <span>{t(selected.role)}</span>
                        </div>

                        <div className={styles.badge}>
                            <i className="bi bi-patch-check-fill" />
                            {t(verifiedText)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function createLocalizedTextField(
    key: keyof TestimonialService01Props,
    label: string,
): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createImageField(key: keyof TestimonialService01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'image',
        folder: 'services/testimonials',
        accept: 'image/*',
    };
}

function createNumberField(key: keyof TestimonialService01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'number',
    };
}

function createTestimonialInspector(index: 1 | 2 | 3) {
    return [
        createImageField(
            `testimonial${index}Avatar` as keyof TestimonialService01Props,
            `Testimonial ${index} Avatar`,
        ),

        createLocalizedTextField(
            `testimonial${index}Name` as keyof TestimonialService01Props,
            `Testimonial ${index} Name`,
        ),

        createLocalizedTextField(
            `testimonial${index}Role` as keyof TestimonialService01Props,
            `Testimonial ${index} Role`,
        ),

        createLocalizedTextField(
            `testimonial${index}Website` as keyof TestimonialService01Props,
            `Testimonial ${index} Website`,
        ),

        createLocalizedTextField(
            `testimonial${index}WebsiteLabel` as keyof TestimonialService01Props,
            `Testimonial ${index} Website Label`,
        ),

        createLocalizedTextField(
            `testimonial${index}Quote` as keyof TestimonialService01Props,
            `Testimonial ${index} Quote`,
        ),

        createNumberField(
            `testimonial${index}Rating` as keyof TestimonialService01Props,
            `Testimonial ${index} Rating`,
        ),
    ];
}

function createInspector() {
    return [
        createLocalizedTextField('headline', 'Headline'),

        createLocalizedTextField('headlineAccent', 'Headline Accent'),

        createLocalizedTextField('subheadline', 'Subheadline'),

        createLocalizedTextField('exploreText', 'Explore Button Text'),

        createLocalizedTextField('verifiedText', 'Verified Text'),

        ...createTestimonialInspector(1),

        ...createTestimonialInspector(2),

        ...createTestimonialInspector(3),
    ];
}
export const TESTIMONIAL_SERVICE_01: RegItem = {
    kind: 'TestimonialService01',

    label: 'Testimonial Service 01',

    defaults: DEFAULT_PROPS,

    inspector: createInspector(),

    render: (props) => <TestimonialService01 {...(props as TestimonialService01Props)} />,
};

export default TestimonialService01;
