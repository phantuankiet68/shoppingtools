'use client';

import styles from '@/components/admin/shared/templates/services/testimonials/styles/testimonial-service-01.module.css';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';

type Locale = 'en' | 'vi' | 'ja';

export interface TestimonialItem {
    id: string;
    avatar: string;
    name: string;
    role: string;
    website?: string | null;
    websiteLabel?: string | null;
    quote: string;
    rating: number;
    accentColor?: string | null;
}

export interface TestimonialService01Props {
    siteId?: string;
    headline?: LocalizedText;
    headlineAccent?: LocalizedText;
    subheadline?: LocalizedText;
    verifiedText?: LocalizedText;
}

interface TestimonialsResponse {
    success: boolean;
    message?: string;
    testimonials?: TestimonialItem[];
}

const DEFAULT_PROPS: Required<TestimonialService01Props> = {
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
    verifiedText: {
        sourceLocale: 'en',
        default: 'Verified Customer',
        translations: {
            vi: 'Khách hàng đã xác minh',
            ja: '認証済みユーザー',
        },
    },
};

function useInView(ref: RefObject<HTMLElement | null>, threshold = 0.05) {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || inView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, threshold, inView]);

    return inView;
}

function Stars({ rating = 5 }: { rating?: number }) {
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

    return (
        <div className={styles.stars} aria-label={`${safeRating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
                <i key={index} className={index < safeRating ? 'bi bi-star-fill' : 'bi bi-star'} />
            ))}
        </div>
    );
}

function normalizeLocale(value: string | null): Locale {
    return value === 'vi' || value === 'ja' ? value : 'en';
}

const SAMPLE_TESTIMONIALS: Record<Locale, TestimonialItem[]> = {
    en: [
        {
            id: 'sample-testimonial-1',
            avatar: 'https://i.pravatar.cc/200?img=13',
            name: 'Michael Chen',
            role: 'Manager, Chen & Associates',
            website: 'https://chenassociates.com',
            websiteLabel: 'chenassociates.com',
            quote: 'The onboarding process was smooth, and the customer support team was incredibly helpful. We were up and running within days, not weeks.',
            rating: 5,
            accentColor: '#0EA5E9',
        },
    ],
    vi: [
        {
            id: 'sample-testimonial-1',
            avatar: 'https://i.pravatar.cc/200?img=13',
            name: 'Michael Chen',
            role: 'Quản lý, Chen & Associates',
            website: 'https://chenassociates.com',
            websiteLabel: 'chenassociates.com',
            quote: 'Quá trình triển khai rất suôn sẻ. Đội ngũ hỗ trợ luôn nhiệt tình và chúng tôi đưa hệ thống vào hoạt động chỉ trong vài ngày.',
            rating: 5,
            accentColor: '#0EA5E9',
        },
    ],
    ja: [
        {
            id: 'sample-testimonial-1',
            avatar: 'https://i.pravatar.cc/200?img=13',
            name: 'Michael Chen',
            role: 'Chen & Associates マネージャー',
            website: 'https://chenassociates.com',
            websiteLabel: 'chenassociates.com',
            quote: '導入は非常にスムーズで、サポートチームも素晴らしかったです。数週間ではなく、わずか数日で運用を開始できました。',
            rating: 5,
            accentColor: '#0EA5E9',
        },
    ],
};

export function TestimonialService01(props: TestimonialService01Props) {
    const mergedProps: Required<TestimonialService01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const { siteId, headline, headlineAccent, subheadline, verifiedText } = mergedProps;

    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    const [selectedLocale, setSelectedLocale] = useState<Locale>(() => {
        if (typeof window === 'undefined') return 'en';
        return normalizeLocale(localStorage.getItem('locale'));
    });

    const [testimonials, setTestimonials] = useState<TestimonialItem[]>(SAMPLE_TESTIMONIALS.en);
    const [selectedId, setSelectedId] = useState<string | null>(
        SAMPLE_TESTIMONIALS.en[0]?.id ?? null,
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setSelectedLocale(normalizeLocale(customEvent.detail));
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    useEffect(() => {
        if (!siteId) {
            const samples = SAMPLE_TESTIMONIALS[selectedLocale];
            setTestimonials(samples);
            setSelectedId(samples[0]?.id ?? null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let active = true;

        const loadTestimonials = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams({
                    siteId,
                    locale: selectedLocale,
                });

                const response = await fetch(`/api/v1/testimonials?${params.toString()}`, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                    },
                    cache: 'no-store',
                });

                const data = (await response.json()) as TestimonialsResponse;

                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to load testimonials.');
                }

                if (!active) return;

                const items = Array.isArray(data.testimonials) ? data.testimonials : [];

                const nextItems = items.length > 0 ? items : SAMPLE_TESTIMONIALS[selectedLocale];

                setTestimonials(nextItems);
                setSelectedId((currentId) => {
                    if (currentId && nextItems.some((item) => item.id === currentId)) {
                        return currentId;
                    }
                    return nextItems[0]?.id ?? null;
                });
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                if (!active) return;

                console.error('[TestimonialService01] Failed to load testimonials:', error);
                const samples = SAMPLE_TESTIMONIALS[selectedLocale];
                setTestimonials(samples);
                setSelectedId(samples[0]?.id ?? null);
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadTestimonials();

        return () => {
            active = false;
            controller.abort();
        };
    }, [siteId, selectedLocale]);

    const t = (value: LocalizedText) => getLocalizedValue(value, selectedLocale);

    const selected =
        testimonials.find((testimonial) => testimonial.id === selectedId) ??
        testimonials[0] ??
        null;

    const [emblaRef] = useEmblaCarousel(
        {
            loop: testimonials.length > 1,
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

    if (testimonials.length === 0) {
        return null;
    }

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
                    </div>

                    <div className={styles.embla} ref={emblaRef}>
                        <div className={styles.emblaContainer}>
                            {testimonials.map((testimonial, index) => (
                                <div key={testimonial.id} className={styles.emblaSlide}>
                                    <div
                                        className={styles.card}
                                        onClick={() => setSelectedId(testimonial.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                setSelectedId(testimonial.id);
                                            }
                                        }}
                                        style={
                                            {
                                                '--i': index + 1,
                                                '--accent': testimonial.accentColor ?? '#6366F1',
                                            } as CSSProperties
                                        }
                                    >
                                        <div className={styles.cardHead}>
                                            <img
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                className={styles.avatar}
                                                loading="lazy"
                                            />

                                            <div>
                                                <h5>{testimonial.name}</h5>
                                                <p>{testimonial.role}</p>
                                            </div>
                                        </div>

                                        {testimonial.website && (
                                            <a
                                                href={testimonial.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.website}
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <i className="bi bi-globe2" />
                                                {testimonial.websiteLabel || testimonial.website}
                                            </a>
                                        )}

                                        <p className={styles.cardQuote}>“{testimonial.quote}”</p>

                                        <Stars rating={testimonial.rating} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {selected && (
                    <div
                        className={styles.featuredCard}
                        style={
                            {
                                '--accent': selected.accentColor ?? '#6366F1',
                            } as CSSProperties
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
                                    {selected.websiteLabel || selected.website}
                                </a>
                            )}
                        </div>

                        <blockquote className={styles.quote}>“{selected.quote}”</blockquote>

                        <div className={styles.footer}>
                            <img
                                src={selected.avatar}
                                alt={selected.name}
                                className={styles.avatar}
                            />

                            <div className={styles.info}>
                                <h4>{selected.name}</h4>
                                <span>{selected.role}</span>
                            </div>

                            <div className={styles.badge}>
                                <i className="bi bi-patch-check-fill" />
                                {t(verifiedText)}
                            </div>
                        </div>
                    </div>
                )}
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

function createInspector(): InspectorField[] {
    return [
        createLocalizedTextField('headline', 'Headline'),
        createLocalizedTextField('headlineAccent', 'Headline Accent'),
        createLocalizedTextField('subheadline', 'Subheadline'),
        createLocalizedTextField('verifiedText', 'Verified Text'),
    ];
}

export const TESTIMONIAL_SERVICE_01: RegItem = {
    kind: 'testimonial-service-01',
    label: 'Testimonial Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <TestimonialService01 {...(props as TestimonialService01Props)} />,
};

export default TestimonialService01;
