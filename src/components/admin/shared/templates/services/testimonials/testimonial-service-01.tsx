'use client';

import styles from '@/components/admin/shared/templates/services/testimonials/styles/testimonial-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export interface TestimonialItem {
    id: string;
    avatar: string;
    name: string;
    role: string;
    website?: string;
    websiteLabel?: string;
    quote: string;
    rating?: number;
    metaText?: string;
    accentColor?: string;
}

export interface TestimonialService01Props {
    siteId?: string;

    eyebrow?: string;
    headline?: string;
    headlineAccent?: string;
    subheadline?: string;

    exploreText?: string;
    verifiedText?: string;

    // Testimonial 1
    testimonial1Avatar?: string;
    testimonial1Name?: string;
    testimonial1Role?: string;
    testimonial1Website?: string;
    testimonial1WebsiteLabel?: string;
    testimonial1Quote?: string;
    testimonial1Rating?: number;

    // Testimonial 2
    testimonial2Avatar?: string;
    testimonial2Name?: string;
    testimonial2Role?: string;
    testimonial2Website?: string;
    testimonial2WebsiteLabel?: string;
    testimonial2Quote?: string;
    testimonial2Rating?: number;

    // Testimonial 3
    testimonial3Avatar?: string;
    testimonial3Name?: string;
    testimonial3Role?: string;
    testimonial3Website?: string;
    testimonial3WebsiteLabel?: string;
    testimonial3Quote?: string;
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

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function TestimonialService01({
    eyebrow = 'Testimonials',
    headline = 'Professional Websites',
    headlineAccent = 'Made Simple',
    subheadline = 'See how other small businesses are transforming their operations with our software.',

    exploreText = 'Explore All Features',
    verifiedText = 'Verified Customer',

    // Testimonial 1
    testimonial1Avatar = 'https://i.pravatar.cc/200?img=13',
    testimonial1Name = 'Michael Chen',
    testimonial1Role = 'Manager, Chen & Associates',
    testimonial1Website = 'https://chenassociates.com',
    testimonial1WebsiteLabel = 'chenassociates.com',
    testimonial1Quote = 'The onboarding process was smooth, and the customer support team was incredibly helpful. We were up and running within days, not weeks.',
    testimonial1Rating = 5,

    // Testimonial 2
    testimonial2Avatar = 'https://i.pravatar.cc/200?img=32',
    testimonial2Name = 'Emily Rodriguez',
    testimonial2Role = 'Founder, Rodriguez Marketing',
    testimonial2Website = 'https://rodriguezmarketing.com',
    testimonial2WebsiteLabel = 'rodriguezmarketing.com',
    testimonial2Quote = 'The automation features have transformed how we handle client projects. What used to take hours now happens automatically in the background.',
    testimonial2Rating = 5,

    // Testimonial 3
    testimonial3Avatar = 'https://i.pravatar.cc/200?img=14',
    testimonial3Name = 'David Park',
    testimonial3Role = 'Founder, Park Consulting',
    testimonial3Website = 'https://parkconsulting.co',
    testimonial3WebsiteLabel = 'parkconsulting.co',
    testimonial3Quote = 'The reporting dashboard gives us insights we never had before. Decision making is faster and backed by real data now.',
    testimonial3Rating = 5,
}: TestimonialService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
    const testimonials = useMemo<TestimonialItem[]>(
        () => [
            {
                id: 'testimonial-1',
                avatar: testimonial1Avatar,
                name: testimonial1Name,
                role: testimonial1Role,
                website: testimonial1Website,
                websiteLabel: testimonial1WebsiteLabel,
                quote: testimonial1Quote,
                rating: testimonial1Rating,
                accentColor: '#0EA5E9',
            },
            {
                id: 'testimonial-2',
                avatar: testimonial2Avatar,
                name: testimonial2Name,
                role: testimonial2Role,
                website: testimonial2Website,
                websiteLabel: testimonial2WebsiteLabel,
                quote: testimonial2Quote,
                rating: testimonial2Rating,
                accentColor: '#10B981',
            },
            {
                id: 'testimonial-3',
                avatar: testimonial3Avatar,
                name: testimonial3Name,
                role: testimonial3Role,
                website: testimonial3Website,
                websiteLabel: testimonial3WebsiteLabel,
                quote: testimonial3Quote,
                rating: testimonial3Rating,
                accentColor: '#F59E0B',
            },
        ],
        [
            testimonial1Avatar,
            testimonial1Name,
            testimonial1Role,
            testimonial1Website,
            testimonial1WebsiteLabel,
            testimonial1Quote,
            testimonial1Rating,

            testimonial2Avatar,
            testimonial2Name,
            testimonial2Role,
            testimonial2Website,
            testimonial2WebsiteLabel,
            testimonial2Quote,
            testimonial2Rating,

            testimonial3Avatar,
            testimonial3Name,
            testimonial3Role,
            testimonial3Website,
            testimonial3WebsiteLabel,
            testimonial3Quote,
            testimonial3Rating,
        ],
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
    const [selected, setSelected] = useState<TestimonialItem>(testimonials[0]);
    useEffect(() => {
        if (testimonials.length) {
            setSelected(testimonials[0]);
        }
    }, [testimonials]);
    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Testimonials"
        >
            <div className={styles.wrap}>
                <div className={styles.topHeader}>
                    <div className={styles.header}>
                        <span className={styles.badge}>{eyebrow}</span>
                        <h2>
                            {headline} <span className={styles.accent}>{headlineAccent}</span>
                        </h2>
                        <p className={styles.sub}>{subheadline}</p>
                        <button className={styles.button}>
                            {exploreText}
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>
                    <div className={styles.embla} ref={emblaRef}>
                        <div className={styles.emblaContainer}>
                            {testimonials.map((t, idx) => (
                                <div key={t.id} className={styles.emblaSlide}>
                                    <div
                                        className={styles.card}
                                        onClick={() => setSelected(t)}
                                        style={
                                            {
                                                '--i': idx + 1,
                                                '--accent': t.accentColor ?? '#6366F1',
                                            } as React.CSSProperties
                                        }
                                    >
                                        <div className={styles.cardHead}>
                                            <img
                                                src={t.avatar}
                                                alt={t.name}
                                                className={styles.avatar}
                                            />

                                            <div>
                                                <h5>{t.name}</h5>
                                                <p>{t.role}</p>
                                                {t.website && (
                                                    <a
                                                        href={t.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.website}
                                                    >
                                                        <i className="bi bi-globe2" />
                                                        {t.websiteLabel || t.website}
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <p className={styles.cardQuote}>“{t.quote}”</p>

                                        <Stars rating={t.rating} />
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
                            '--accent': selected.accentColor ?? '#6366f1',
                        } as React.CSSProperties
                    }
                >
                    <div className={styles.header}>
                        <Stars rating={selected.rating} />

                        {selected.website && (
                            <a
                                href={selected.website}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.website}
                            >
                                <i className="bi bi-globe2" />
                                {selected.websiteLabel || selected.website}
                            </a>
                        )}
                    </div>

                    <blockquote className={styles.quote}>“{selected.quote}”</blockquote>

                    <div className={styles.footer}>
                        <img src={selected.avatar} alt={selected.name} className={styles.avatar} />

                        <div className={styles.info}>
                            <h4>{selected.name}</h4>
                            <span>{selected.role}</span>
                        </div>

                        <div className={styles.badge}>
                            <i className="bi bi-patch-check-fill" />
                            {verifiedText}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const TESTIMONIAL_SERVICE_01: RegItem = {
    kind: 'TestimonialService01',
    label: 'Testimonial Service 01',

    defaults: {
        eyebrow: 'Testimonials',
        headline: 'Professional Websites',
        headlineAccent: 'Made Simple',
        subheadline:
            'See how other small businesses are transforming their operations with our software.',

        exploreText: 'Explore All Features',
        verifiedText: 'Verified Customer',

        // Testimonial 1
        testimonial1Avatar: 'https://i.pravatar.cc/200?img=13',
        testimonial1Name: 'Michael Chen',
        testimonial1Role: 'Manager, Chen & Associates',
        testimonial1Website: 'https://chenassociates.com',
        testimonial1WebsiteLabel: 'chenassociates.com',
        testimonial1Quote:
            'The onboarding process was smooth, and the customer support team was incredibly helpful. We were up and running within days, not weeks.',
        testimonial1Rating: 5,

        // Testimonial 2
        testimonial2Avatar: 'https://i.pravatar.cc/200?img=32',
        testimonial2Name: 'Emily Rodriguez',
        testimonial2Role: 'Founder, Rodriguez Marketing',
        testimonial2Website: 'https://rodriguezmarketing.com',
        testimonial2WebsiteLabel: 'rodriguezmarketing.com',
        testimonial2Quote:
            'The automation features have transformed how we handle client projects. What used to take hours now happens automatically in the background.',
        testimonial2Rating: 5,

        // Testimonial 3
        testimonial3Avatar: 'https://i.pravatar.cc/200?img=14',
        testimonial3Name: 'David Park',
        testimonial3Role: 'Founder, Park Consulting',
        testimonial3Website: 'https://parkconsulting.co',
        testimonial3WebsiteLabel: 'parkconsulting.co',
        testimonial3Quote:
            'The reporting dashboard gives us insights we never had before. Decision making is faster and backed by real data now.',
        testimonial3Rating: 5,
    },

    inspector: [
        {
            key: 'eyebrow',
            label: 'Eyebrow',
            kind: 'text',
        },
        {
            key: 'headline',
            label: 'Headline',
            kind: 'text',
        },
        {
            key: 'headlineAccent',
            label: 'Headline Accent',
            kind: 'text',
        },
        {
            key: 'subheadline',
            label: 'Subheadline',
            kind: 'textarea',
        },

        {
            key: 'exploreText',
            label: 'Explore Button Text',
            kind: 'text',
        },
        {
            key: 'verifiedText',
            label: 'Verified Text',
            kind: 'text',
        },

        // Testimonial 1
        {
            key: 'testimonial1Avatar',
            label: 'Testimonial 1 Avatar',
            kind: 'image',
            folder: 'services/testimonials',
            accept: 'image/*',
        },
        {
            key: 'testimonial1Name',
            label: 'Testimonial 1 Name',
            kind: 'text',
        },
        {
            key: 'testimonial1Role',
            label: 'Testimonial 1 Role',
            kind: 'text',
        },
        {
            key: 'testimonial1Website',
            label: 'Testimonial 1 Website',
            kind: 'text',
        },
        {
            key: 'testimonial1WebsiteLabel',
            label: 'Testimonial 1 Website Label',
            kind: 'text',
        },
        {
            key: 'testimonial1Quote',
            label: 'Testimonial 1 Quote',
            kind: 'textarea',
        },
        {
            key: 'testimonial1Rating',
            label: 'Testimonial 1 Rating',
            kind: 'number',
        },

        // Testimonial 2
        {
            key: 'testimonial2Avatar',
            label: 'Testimonial 2 Avatar',
            kind: 'image',
            folder: 'services/testimonials',
            accept: 'image/*',
        },
        {
            key: 'testimonial2Name',
            label: 'Testimonial 2 Name',
            kind: 'text',
        },
        {
            key: 'testimonial2Role',
            label: 'Testimonial 2 Role',
            kind: 'text',
        },
        {
            key: 'testimonial2Website',
            label: 'Testimonial 2 Website',
            kind: 'text',
        },
        {
            key: 'testimonial2WebsiteLabel',
            label: 'Testimonial 2 Website Label',
            kind: 'text',
        },
        {
            key: 'testimonial2Quote',
            label: 'Testimonial 2 Quote',
            kind: 'textarea',
        },
        {
            key: 'testimonial2Rating',
            label: 'Testimonial 2 Rating',
            kind: 'number',
        },

        // Testimonial 3
        {
            key: 'testimonial3Avatar',
            label: 'Testimonial 3 Avatar',
            kind: 'image',
            folder: 'services/testimonials',
            accept: 'image/*',
        },
        {
            key: 'testimonial3Name',
            label: 'Testimonial 3 Name',
            kind: 'text',
        },
        {
            key: 'testimonial3Role',
            label: 'Testimonial 3 Role',
            kind: 'text',
        },
        {
            key: 'testimonial3Website',
            label: 'Testimonial 3 Website',
            kind: 'text',
        },
        {
            key: 'testimonial3WebsiteLabel',
            label: 'Testimonial 3 Website Label',
            kind: 'text',
        },
        {
            key: 'testimonial3Quote',
            label: 'Testimonial 3 Quote',
            kind: 'textarea',
        },
        {
            key: 'testimonial3Rating',
            label: 'Testimonial 3 Rating',
            kind: 'number',
        },
    ],

    render: (props) => (
        <TestimonialService01 {...(props as unknown as TestimonialService01Props)} />
    ),
};

export default TestimonialService01;
