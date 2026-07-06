'use client';

import { useMemo } from 'react';
import type { RegItem } from '@/lib/ui-builder/types';

import styles from '@/components/admin/shared/templates/services/pricing/styles/pricing-service-01.module.css';
export interface PricingService01Props {
    title?: string;

    feature1Item1: string;
    feature1Item2: string;
    feature1Item3: string;
    feature1Item4: string;
    feature1Item5: string;
    feature1Item6: string;
    feature1Item7: string;
    feature1Item8: string;
    feature1Item9: string;
    feature1Item10: string;

    feature2Item1: string;
    feature2Item2: string;
    feature2Item3: string;
    feature2Item4: string;
    feature2Item5: string;
    feature2Item6: string;
    feature2Item7: string;
    feature2Item8: string;
    feature2Item9: string;
    feature2Item10: string;

    feature3Item1: string;
    feature3Item2: string;
    feature3Item3: string;
    feature3Item4: string;
    feature3Item5: string;
    feature3Item6: string;
    feature3Item7: string;
    feature3Item8: string;
    feature3Item9: string;
    feature3Item10: string;
}

type PricingCard = {
    plan: string;
    websites: string;
    price: number;
    featured?: boolean;
    badge?: string;
    features: string[];
};

export function PricingService01({
    title = 'Pricing',

    feature1Item1 = '1 Website',
    feature1Item2 = 'Up to 10 Pages',
    feature1Item3 = 'Free SSL Certificate',
    feature1Item4 = 'Custom Domain',
    feature1Item5 = 'Drag & Drop Builder',
    feature1Item6 = 'Responsive Design',
    feature1Item7 = 'Built-in SEO',
    feature1Item8 = 'Analytics Dashboard',
    feature1Item9 = 'Fast Cloud Hosting',
    feature1Item10 = 'Email Support',

    feature2Item1 = '2 Websites',
    feature2Item2 = 'Up to 15 Pages',
    feature2Item3 = 'Free SSL Certificate',
    feature2Item4 = 'Custom Domain',
    feature2Item5 = 'Premium Templates',
    feature2Item6 = 'Drag & Drop Builder',
    feature2Item7 = 'Analytics Dashboard',
    feature2Item8 = 'Daily Backup',
    feature2Item9 = 'Faster Performance',
    feature2Item10 = 'Priority Support',

    feature3Item1 = '3 Websites',
    feature3Item2 = 'Up to 30 Pages',
    feature3Item3 = 'Free SSL Certificate',
    feature3Item4 = 'Unlimited Custom Domains',
    feature3Item5 = 'All Premium Templates',
    feature3Item6 = 'Advanced Analytics',
    feature3Item7 = 'Premium SEO',
    feature3Item8 = 'Daily Backup',
    feature3Item9 = 'API Access',
    feature3Item10 = 'Premium Support',
}: PricingService01Props) {
    const cards = useMemo<PricingCard[]>(
        () => [
            {
                plan: 'Basic',
                websites: '1 Website',
                price: 5,
                features: [
                    feature1Item1,
                    feature1Item2,
                    feature1Item3,
                    feature1Item4,
                    feature1Item5,
                    feature1Item6,
                    feature1Item7,
                    feature1Item8,
                    feature1Item9,
                    feature1Item10,
                ],
            },
            {
                plan: 'Standard',
                websites: '2 Websites',
                price: 10,
                featured: true,
                badge: '🔥 Popular',
                features: [
                    feature2Item1,
                    feature2Item2,
                    feature2Item3,
                    feature2Item4,
                    feature2Item5,
                    feature2Item6,
                    feature2Item7,
                    feature2Item8,
                    feature2Item9,
                    feature2Item10,
                ],
            },
            {
                plan: 'Professional',
                websites: '3 Websites',
                price: 20,
                features: [
                    feature3Item1,
                    feature3Item2,
                    feature3Item3,
                    feature3Item4,
                    feature3Item5,
                    feature3Item6,
                    feature3Item7,
                    feature3Item8,
                    feature3Item9,
                    feature3Item10,
                ],
            },
        ],
        [
            feature1Item1,
            feature1Item2,
            feature1Item3,
            feature1Item4,
            feature1Item5,
            feature1Item6,
            feature1Item7,
            feature1Item8,
            feature1Item9,
            feature1Item10,

            feature2Item1,
            feature2Item2,
            feature2Item3,
            feature2Item4,
            feature2Item5,
            feature2Item6,
            feature2Item7,
            feature2Item8,
            feature2Item9,
            feature2Item10,

            feature3Item1,
            feature3Item2,
            feature3Item3,
            feature3Item4,
            feature3Item5,
            feature3Item6,
            feature3Item7,
            feature3Item8,
            feature3Item9,
            feature3Item10,
        ],
    );

    return (
        <section className={styles.pricing}>
            <div className={styles.container}>
                <div className={styles.leftPanel}>
                    <div className={styles.heroCard}>
                        {/* ICON BADGE */}
                        <div className={styles.heroIcon}>
                            <i className="bi bi-stars" />
                        </div>

                        {/* TITLE */}
                        <h2 className={styles.heroTitle}>Start saving your money</h2>

                        {/* DESCRIPTION */}
                        <p className={styles.heroDesc}>
                            Choose plan that works best for you, feel free to contact us if you need
                            more details. Everything is optimized for your growth.
                        </p>

                        {/* HIGHLIGHT STATS (NEW - làm UI giống SaaS thật) */}
                        <div className={styles.statsRow}>
                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>30%</div>
                                <div className={styles.statLabel}>Cost saving</div>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>24/7</div>
                                <div className={styles.statLabel}>Support</div>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>+10k</div>
                                <div className={styles.statLabel}>Users</div>
                            </div>
                        </div>

                        {/* TESTIMONIAL CARD (IMPROVED STRUCTURE) */}
                        <div className={styles.testimonial}>
                            <div className={styles.quoteIcon}>
                                <i className="bi bi-chat-quote-fill" />
                            </div>

                            <p className={styles.testimonialText}>
                                “Fantastic, totally blown away with my savings”
                            </p>

                            <div className={styles.testimonialUser}>
                                <div className={styles.avatar} />

                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>Roland Stevens</div>
                                    <div className={styles.userRole}>Freelancer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className={styles.rightPanel}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <span className={styles.badge}>Pricing</span>

                            <h2 className={styles.title}>Simple, transparent pricing</h2>

                            <p className={styles.subtitle}>No contracts. No surprise fees.</p>
                        </div>

                        <div className={styles.headerRight}>
                            <div className={styles.billingToggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${styles.active}`}
                                >
                                    Monthly
                                </button>

                                <button type="button" className={styles.toggleBtn}>
                                    Yearly
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.progressWrap}>
                        <div className={styles.progressTrack}>
                            <span className={styles.progressThumb} />
                        </div>
                    </div>

                    {/* PRICING CARDS */}
                    <div className={styles.grid}>
                        {cards.map((card) => (
                            <div
                                key={card.plan}
                                className={[styles.card, card.featured ? styles.featured : '']
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {card.badge && <span className={styles.badge}>{card.badge}</span>}

                                <div className={styles.cardHeader}>
                                    <span className={styles.plan}>{card.plan}</span>

                                    <h3 className={styles.planTitle}>{card.websites}</h3>

                                    <div className={styles.price}>
                                        <span className={styles.currency}>$</span>
                                        {card.price}
                                        <small>/month</small>
                                    </div>
                                </div>

                                <ul className={styles.featureList}>
                                    {card.features.map((feature, index) => (
                                        <li key={`${card.plan}-${index}`}>
                                            <i className="bi bi-check-circle-fill" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button type="button" className={styles.button}>
                                    Start trial
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
const BASIC_FEATURES = [
    '1 Website',
    'Up to 10 Pages',
    'Free SSL Certificate',
    'Custom Domain',
    'Drag & Drop Builder',
    'Responsive Design',
    'Built-in SEO',
    'Analytics Dashboard',
    'Fast Cloud Hosting',
    'Email Support',
] as const;

const STANDARD_FEATURES = [
    '2 Websites',
    'Up to 15 Pages',
    'Free SSL Certificate',
    'Custom Domain',
    'Premium Templates',
    'Drag & Drop Builder',
    'Analytics Dashboard',
    'Daily Backup',
    'Faster Performance',
    'Priority Support',
] as const;

const PROFESSIONAL_FEATURES = [
    '3 Websites',
    'Up to 30 Pages',
    'Free SSL Certificate',
    'Unlimited Custom Domains',
    'All Premium Templates',
    'Advanced Analytics',
    'Premium SEO',
    'Daily Backup',
    'API Access',
    'Premium Support',
] as const;

function createDefaults() {
    const defaults: Record<string, unknown> = {
        title: 'Everything You Need To Build Modern Websites',
    };

    [BASIC_FEATURES, STANDARD_FEATURES, PROFESSIONAL_FEATURES].forEach((features, planIndex) => {
        features.forEach((feature, featureIndex) => {
            defaults[`feature${planIndex + 1}Item${featureIndex + 1}`] = feature;
        });
    });

    return defaults;
}

function createInspector(): RegItem['inspector'] {
    return [
        {
            key: 'title',
            label: 'Section Title',
            kind: 'text',
        },

        ...Array.from({ length: 3 }, (_, plan) =>
            Array.from({ length: 10 }, (_, feature) => ({
                key: `feature${plan + 1}Item${feature + 1}`,
                label: `Plan ${plan + 1} • Feature ${feature + 1}`,
                kind: 'text' as const,
            })),
        ).flat(),
    ];
}

export const PRICING_SERVICE_01: RegItem = {
    kind: 'PricingService01',

    label: 'Pricing Service 01',

    defaults: createDefaults(),

    inspector: createInspector(),

    render: (props) => <PricingService01 {...(props as unknown as PricingService01Props)} />,
};

export default PricingService01;
