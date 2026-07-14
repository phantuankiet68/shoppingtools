'use client';

import { useMemo } from 'react';
import type { RegItem } from '@/lib/ui-builder/types';

import styles from '@/components/admin/shared/templates/services/pricing/styles/pricing-service-01.module.css';
export interface PricingService01Props {
    heroTitle?: string;
    heroDescription?: string;

    stat1Value?: string;
    stat1Label?: string;

    stat2Value?: string;
    stat2Label?: string;

    stat3Value?: string;
    stat3Label?: string;

    testimonialText?: string;
    testimonialName?: string;
    testimonialRole?: string;

    pricingBadge?: string;
    pricingTitle?: string;
    pricingSubtitle?: string;

    monthlyText?: string;
    yearlyText?: string;

    plan1Name?: string;
    plan1Websites?: string;
    plan1Price?: number;
    plan1ButtonText?: string;

    plan2Name?: string;
    plan2Websites?: string;
    plan2Price?: number;
    plan2Badge?: string;
    plan2ButtonText?: string;

    plan3Name?: string;
    plan3Websites?: string;
    plan3Price?: number;
    plan3ButtonText?: string;

    priceSuffix?: string;

    feature1Item1?: string;
    feature1Item2?: string;
    feature1Item3?: string;
    feature1Item4?: string;
    feature1Item5?: string;
    feature1Item6?: string;
    feature1Item7?: string;
    feature1Item8?: string;
    feature1Item9?: string;
    feature1Item10?: string;

    feature2Item1?: string;
    feature2Item2?: string;
    feature2Item3?: string;
    feature2Item4?: string;
    feature2Item5?: string;
    feature2Item6?: string;
    feature2Item7?: string;
    feature2Item8?: string;
    feature2Item9?: string;
    feature2Item10?: string;

    feature3Item1?: string;
    feature3Item2?: string;
    feature3Item3?: string;
    feature3Item4?: string;
    feature3Item5?: string;
    feature3Item6?: string;
    feature3Item7?: string;
    feature3Item8?: string;
    feature3Item9?: string;
    feature3Item10?: string;
}

type PricingCard = {
    plan: string;
    websites: string;
    price: number;
    featured?: boolean;
    badge?: string;
    buttonText: string;
    features: string[];
};

export function PricingService01({
    heroTitle = 'Start saving your money',
    heroDescription = 'Choose plan that works best for you, feel free to contact us if you need more details. Everything is optimized for your growth.',

    stat1Value = '30%',
    stat1Label = 'Cost saving',

    stat2Value = '24/7',
    stat2Label = 'Support',

    stat3Value = '+10k',
    stat3Label = 'Users',

    testimonialText = 'Fantastic, totally blown away with my savings',
    testimonialName = 'Roland Stevens',
    testimonialRole = 'Freelancer',

    pricingBadge = 'Pricing',
    pricingTitle = 'Simple, transparent pricing',
    pricingSubtitle = 'No contracts. No surprise fees.',

    monthlyText = 'Monthly',
    yearlyText = 'Yearly',

    plan1Name = 'Basic',
    plan1Websites = '1 Website',
    plan1Price = 5,
    plan1ButtonText = 'Start trial',

    plan2Name = 'Standard',
    plan2Websites = '2 Websites',
    plan2Price = 10,
    plan2Badge = '🔥 Popular',
    plan2ButtonText = 'Start trial',

    plan3Name = 'Professional',
    plan3Websites = '3 Websites',
    plan3Price = 20,
    plan3ButtonText = 'Start trial',

    priceSuffix = '/month',

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
                plan: plan1Name,
                websites: plan1Websites,
                price: plan1Price,
                buttonText: plan1ButtonText,
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
                plan: plan2Name,
                websites: plan2Websites,
                price: plan2Price,
                featured: true,
                badge: plan2Badge,
                buttonText: plan2ButtonText,
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
                plan: plan3Name,
                websites: plan3Websites,
                price: plan3Price,
                buttonText: plan3ButtonText,
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
                        <div className={styles.heroIcon}>
                            <i className="bi bi-stars" />
                        </div>

                        <h2 className={styles.heroTitle}>{heroTitle}</h2>

                        <p className={styles.heroDesc}>{heroDescription}</p>

                        <div className={styles.statsRow}>
                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>{stat1Value}</div>
                                <div className={styles.statLabel}>{stat1Label}</div>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>{stat2Value}</div>
                                <div className={styles.statLabel}>{stat2Label}</div>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statNumber}>{stat3Value}</div>
                                <div className={styles.statLabel}>{stat3Label}</div>
                            </div>
                        </div>

                        <div className={styles.testimonial}>
                            <div className={styles.quoteIcon}>
                                <i className="bi bi-chat-quote-fill" />
                            </div>

                            <p className={styles.testimonialText}>“{testimonialText}”</p>

                            <div className={styles.testimonialUser}>
                                <div className={styles.avatar} />

                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>{testimonialName}</div>

                                    <div className={styles.userRole}>{testimonialRole}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* RIGHT CONTENT */}
                <div className={styles.rightPanel}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <span className={styles.badge}>{pricingBadge}</span>

                            <h2 className={styles.title}>{pricingTitle}</h2>

                            <p className={styles.subtitle}>{pricingSubtitle}</p>
                        </div>

                        <div className={styles.headerRight}>
                            <div className={styles.billingToggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${styles.active}`}
                                >
                                    {monthlyText}
                                </button>

                                <button type="button" className={styles.toggleBtn}>
                                    {yearlyText}
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
                                        <small>{priceSuffix}</small>
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
                                    {card.buttonText}
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
        heroTitle: 'Start saving your money',
        heroDescription:
            'Choose plan that works best for you, feel free to contact us if you need more details. Everything is optimized for your growth.',

        stat1Value: '30%',
        stat1Label: 'Cost saving',

        stat2Value: '24/7',
        stat2Label: 'Support',

        stat3Value: '+10k',
        stat3Label: 'Users',

        testimonialText: 'Fantastic, totally blown away with my savings',
        testimonialName: 'Roland Stevens',
        testimonialRole: 'Freelancer',

        pricingBadge: 'Pricing',
        pricingTitle: 'Simple, transparent pricing',
        pricingSubtitle: 'No contracts. No surprise fees.',

        monthlyText: 'Monthly',
        yearlyText: 'Yearly',

        plan1Name: 'Basic',
        plan1Websites: '1 Website',
        plan1Price: 5,
        plan1ButtonText: 'Start trial',

        plan2Name: 'Standard',
        plan2Websites: '2 Websites',
        plan2Price: 10,
        plan2Badge: '🔥 Popular',
        plan2ButtonText: 'Start trial',

        plan3Name: 'Professional',
        plan3Websites: '3 Websites',
        plan3Price: 20,
        plan3ButtonText: 'Start trial',

        priceSuffix: '/month',
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
            key: 'heroTitle',
            label: 'Hero Title',
            kind: 'text',
        },
        {
            key: 'heroDescription',
            label: 'Hero Description',
            kind: 'textarea',
        },

        {
            key: 'stat1Value',
            label: 'Stat 1 Value',
            kind: 'text',
        },
        {
            key: 'stat1Label',
            label: 'Stat 1 Label',
            kind: 'text',
        },

        {
            key: 'stat2Value',
            label: 'Stat 2 Value',
            kind: 'text',
        },
        {
            key: 'stat2Label',
            label: 'Stat 2 Label',
            kind: 'text',
        },

        {
            key: 'stat3Value',
            label: 'Stat 3 Value',
            kind: 'text',
        },
        {
            key: 'stat3Label',
            label: 'Stat 3 Label',
            kind: 'text',
        },

        {
            key: 'testimonialText',
            label: 'Testimonial Text',
            kind: 'textarea',
        },
        {
            key: 'testimonialName',
            label: 'Testimonial Name',
            kind: 'text',
        },
        {
            key: 'testimonialRole',
            label: 'Testimonial Role',
            kind: 'text',
        },

        {
            key: 'pricingBadge',
            label: 'Pricing Badge',
            kind: 'text',
        },
        {
            key: 'pricingTitle',
            label: 'Pricing Title',
            kind: 'text',
        },
        {
            key: 'pricingSubtitle',
            label: 'Pricing Subtitle',
            kind: 'text',
        },

        {
            key: 'monthlyText',
            label: 'Monthly Text',
            kind: 'text',
        },
        {
            key: 'yearlyText',
            label: 'Yearly Text',
            kind: 'text',
        },

        {
            key: 'plan1Name',
            label: 'Plan 1 Name',
            kind: 'text',
        },
        {
            key: 'plan1Websites',
            label: 'Plan 1 Websites',
            kind: 'text',
        },
        {
            key: 'plan1Price',
            label: 'Plan 1 Price',
            kind: 'number',
        },
        {
            key: 'plan1ButtonText',
            label: 'Plan 1 Button Text',
            kind: 'text',
        },

        {
            key: 'plan2Name',
            label: 'Plan 2 Name',
            kind: 'text',
        },
        {
            key: 'plan2Websites',
            label: 'Plan 2 Websites',
            kind: 'text',
        },
        {
            key: 'plan2Price',
            label: 'Plan 2 Price',
            kind: 'number',
        },
        {
            key: 'plan2Badge',
            label: 'Plan 2 Badge',
            kind: 'text',
        },
        {
            key: 'plan2ButtonText',
            label: 'Plan 2 Button Text',
            kind: 'text',
        },

        {
            key: 'plan3Name',
            label: 'Plan 3 Name',
            kind: 'text',
        },
        {
            key: 'plan3Websites',
            label: 'Plan 3 Websites',
            kind: 'text',
        },
        {
            key: 'plan3Price',
            label: 'Plan 3 Price',
            kind: 'number',
        },
        {
            key: 'plan3ButtonText',
            label: 'Plan 3 Button Text',
            kind: 'text',
        },

        {
            key: 'priceSuffix',
            label: 'Price Suffix',
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
