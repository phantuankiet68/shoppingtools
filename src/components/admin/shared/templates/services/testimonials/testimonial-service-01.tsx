'use client';

import styles from '@/components/admin/shared/templates/services/testimonials/styles/testimonial-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import { useEffect, useRef, useState } from 'react';
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
    testimonials?: TestimonialItem[];
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
    {
        id: 'michael-chen',
        avatar: 'https://i.pravatar.cc/200?img=13',
        name: 'Michael Chen',
        role: 'Manager, Chen & Associates',
        website: 'https://chenassociates.com',
        websiteLabel: 'chenassociates.com',
        quote: 'The onboarding process was smooth, and the customer support team was incredibly helpful. We were up and running within days, not weeks.',
        rating: 5,
        accentColor: '#0EA5E9',
    },
    {
        id: 'emily-rodriguez',
        avatar: 'https://i.pravatar.cc/200?img=32',
        name: 'Emily Rodriguez',
        role: 'Founder, Rodriguez Marketing',
        website: 'https://rodriguezmarketing.com',
        websiteLabel: 'rodriguezmarketing.com',
        quote: 'The automation features have transformed how we handle client projects. What used to take hours now happens automatically in the background.',
        rating: 5,
        accentColor: '#10B981',
    },
    {
        id: 'david-park',
        avatar: 'https://i.pravatar.cc/200?img=14',
        name: 'David Park',
        role: 'Founder, Park Consulting',
        website: 'https://parkconsulting.co',
        websiteLabel: 'parkconsulting.co',
        quote: 'The reporting dashboard gives us insights we never had before. Decision making is faster and backed by real data now.',
        rating: 5,
        accentColor: '#F59E0B',
    },
];

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
    return (
        <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={i < rating ? 'bi bi-star-fill' : 'bi bi-star'} />
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
    testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
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
                            Explore All Features
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
                                                        {t.websiteLabel ??
                                                            new URL(t.website).hostname}
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
                                {selected.websiteLabel}
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
                            Verified Customer
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
        testimonials: DEFAULT_TESTIMONIALS,
    },

    inspector: [
        { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
        { key: 'headline', label: 'Headline', kind: 'text' },
        { key: 'headlineAccent', label: 'headlineAccent', kind: 'text' },
        { key: 'subheadline', label: 'Subheadline', kind: 'text' },
    ],

    render: (props) => {
        const d = props as Record<string, any>;
        return (
            <TestimonialService01
                siteId={d.siteId}
                eyebrow={d.eyebrow}
                headline={d.headline}
                subheadline={d.subheadline}
                testimonials={d.testimonials}
            />
        );
    },
};

export default TestimonialService01;
