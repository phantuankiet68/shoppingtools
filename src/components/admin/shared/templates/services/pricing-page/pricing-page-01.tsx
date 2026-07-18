'use client';
import type { RegItem } from '@/lib/ui-builder/types';
import React from 'react';
import styles from '@/components/admin/shared/templates/services/pricing-page/styles/pricing-page-01.module.css';
type SetupPlan = {
    name: string;
    description: string;
    icon: string;
    tone: string;
    popular: boolean;
};
type PricingPlan = {
    name: string;
    websiteLabel: string;
    price?: number;
    description: string;
    icon: string;
    tone: 'green' | 'blue' | 'purple' | 'orange';
    buttonLabel: string;
    popular?: boolean;
    comingSoon?: boolean;
    features: string[];
};

type FaqCategory = {
    id: string;
    label: string;
    icon: string;
};

type FaqItem = {
    id: number;
    question: string;
    answer: string;
};

export interface PricingPage01Props {
    eyebrow?: string;
    title?: string;
    titleAccent?: string;
    description?: string;
    contactTitle?: string;
    contactDescription?: string;
    contactButtonLabel?: string;

    category1Label?: string;
    category2Label?: string;
    category3Label?: string;

    question1?: string;
    answer1?: string;

    question2?: string;
    answer2?: string;

    question3?: string;
    answer3?: string;

    question4?: string;
    answer4?: string;

    question5?: string;
    answer5?: string;

    plan1Name?: string;
    plan1Description?: string;
    plan1Icon?: string;
    plan1Tone?: string;
    plan1Popular?: boolean;

    plan2Name?: string;
    plan2Description?: string;
    plan2Icon?: string;
    plan2Tone?: string;
    plan2Popular?: boolean;

    plan3Name?: string;
    plan3Description?: string;
    plan3Icon?: string;
    plan3Tone?: string;
    plan3Popular?: boolean;

    plan4Name?: string;
    plan4Description?: string;
    plan4Icon?: string;
    plan4Tone?: string;
    plan4Popular?: boolean;

    comparison1Title?: string;
    comparison1Icon?: string;

    comparison1Label1?: string;
    comparison1Free1?: string | boolean;
    comparison1Starter1?: string | boolean;
    comparison1Pro1?: string | boolean;
    comparison1Enterprise1?: string | boolean;

    comparison1Label2?: string;
    comparison1Free2?: string | boolean;
    comparison1Starter2?: string | boolean;
    comparison1Pro2?: string | boolean;
    comparison1Enterprise2?: string | boolean;
    comparison1Highlight?: 'primary' | 'success';

    comparison1Label3?: string;
    comparison1Free3?: string | boolean;
    comparison1Starter3?: string | boolean;
    comparison1Pro3?: string | boolean;
    comparison1Enterprise3?: string | boolean;

    comparison1Label4?: string;
    comparison1Free4?: string | boolean;
    comparison1Starter4?: string | boolean;
    comparison1Pro4?: string | boolean;
    comparison1Enterprise4?: string | boolean;

    comparison2Title?: string;
    comparison2Icon?: string;

    comparison2Label1?: string;
    comparison2Free1?: string | boolean;
    comparison2Starter1?: string | boolean;
    comparison2Pro1?: string | boolean;
    comparison2Enterprise1?: string | boolean;

    comparison2Label2?: string;
    comparison2Free2?: string | boolean;
    comparison2Starter2?: string | boolean;
    comparison2Pro2?: string | boolean;
    comparison2Enterprise2?: string | boolean;

    comparison2Label3?: string;
    comparison2Free3?: string | boolean;
    comparison2Starter3?: string | boolean;
    comparison2Pro3?: string | boolean;
    comparison2Enterprise3?: string | boolean;

    comparison3Title?: string;
    comparison3Icon?: string;

    comparison3Label1?: string;
    comparison3Free1?: string | boolean;
    comparison3Starter1?: string | boolean;
    comparison3Pro1?: string | boolean;
    comparison3Enterprise1?: string | boolean;

    comparison3Label2?: string;
    comparison3Free2?: string | boolean;
    comparison3Starter2?: string | boolean;
    comparison3Pro2?: string | boolean;
    comparison3Enterprise2?: string | boolean;

    comparison3Label3?: string;
    comparison3Free3?: string | boolean;
    comparison3Starter3?: string | boolean;
    comparison3Pro3?: string | boolean;
    comparison3Enterprise3?: string | boolean;

    comparison3Label4?: string;
    comparison3Free4?: string | boolean;
    comparison3Starter4?: string | boolean;
    comparison3Pro4?: string | boolean;
    comparison3Enterprise4?: string | boolean;

    pricingPlan1Name?: string;
    pricingPlan1WebsiteLabel?: string;
    pricingPlan1Price?: number;
    pricingPlan1Description?: string;
    pricingPlan1Icon?: string;
    pricingPlan1Tone?: 'green' | 'blue' | 'purple' | 'orange';
    pricingPlan1ButtonLabel?: string;
    pricingPlan1Popular?: boolean;
    pricingPlan1ComingSoon?: boolean;

    pricingPlan1Feature1?: string;
    pricingPlan1Feature2?: string;
    pricingPlan1Feature3?: string;
    pricingPlan1Feature4?: string;
    pricingPlan1Feature5?: string;
    pricingPlan1Feature6?: string;
    pricingPlan1Feature7?: string;
    pricingPlan1Feature8?: string;
    pricingPlan1Feature9?: string;
    pricingPlan1Feature10?: string;

    pricingPlan2Name?: string;
    pricingPlan2WebsiteLabel?: string;
    pricingPlan2Price?: number;
    pricingPlan2Description?: string;
    pricingPlan2Icon?: string;
    pricingPlan2Tone?: 'green' | 'blue' | 'purple' | 'orange';
    pricingPlan2ButtonLabel?: string;
    pricingPlan2Popular?: boolean;
    pricingPlan2ComingSoon?: boolean;

    pricingPlan2Feature1?: string;
    pricingPlan2Feature2?: string;
    pricingPlan2Feature3?: string;
    pricingPlan2Feature4?: string;
    pricingPlan2Feature5?: string;
    pricingPlan2Feature6?: string;
    pricingPlan2Feature7?: string;
    pricingPlan2Feature8?: string;
    pricingPlan2Feature9?: string;
    pricingPlan2Feature10?: string;

    pricingPlan3Name?: string;
    pricingPlan3WebsiteLabel?: string;
    pricingPlan3Price?: number;
    pricingPlan3Description?: string;
    pricingPlan3Icon?: string;
    pricingPlan3Tone?: 'green' | 'blue' | 'purple' | 'orange';
    pricingPlan3ButtonLabel?: string;
    pricingPlan3Popular?: boolean;
    pricingPlan3ComingSoon?: boolean;

    pricingPlan3Feature1?: string;
    pricingPlan3Feature2?: string;
    pricingPlan3Feature3?: string;
    pricingPlan3Feature4?: string;
    pricingPlan3Feature5?: string;
    pricingPlan3Feature6?: string;
    pricingPlan3Feature7?: string;
    pricingPlan3Feature8?: string;
    pricingPlan3Feature9?: string;
    pricingPlan3Feature10?: string;

    pricingPlan4Name?: string;
    pricingPlan4WebsiteLabel?: string;
    pricingPlan4Price?: number;
    pricingPlan4Description?: string;
    pricingPlan4Icon?: string;
    pricingPlan4Tone?: 'green' | 'blue' | 'purple' | 'orange';
    pricingPlan4ButtonLabel?: string;
    pricingPlan4Popular?: boolean;
    pricingPlan4ComingSoon?: boolean;

    pricingPlan4Feature1?: string;
    pricingPlan4Feature2?: string;
    pricingPlan4Feature3?: string;
    pricingPlan4Feature4?: string;
    pricingPlan4Feature5?: string;
    pricingPlan4Feature6?: string;
    pricingPlan4Feature7?: string;
    pricingPlan4Feature8?: string;
    pricingPlan4Feature9?: string;
    pricingPlan4Feature10?: string;
}

type ComparisonValue = {
    free: string | boolean;
    starter: string | boolean;
    pro: string | boolean;
    enterprise: string | boolean;
};

type ComparisonRow = ComparisonValue & {
    label: string;
    icon?: string;
    highlight?: 'primary' | 'success';
};

type ComparisonGroup = {
    title: string;
    icon: string;
    rows: ComparisonRow[];
};

const PLAN_KEYS: Array<keyof ComparisonValue> = ['free', 'starter', 'pro', 'enterprise'];

function ComparisonCell({
    value,
    highlight,
}: {
    value: string | boolean;
    highlight?: ComparisonRow['highlight'];
}) {
    if (typeof value === 'boolean') {
        return value ? (
            <span className={styles.available}>
                <i className="bi bi-check-lg" />
            </span>
        ) : (
            <span className={styles.unavailable}>—</span>
        );
    }

    return (
        <span
            className={[
                styles.cellText,
                highlight === 'primary' ? styles.primaryText : '',
                highlight === 'success' ? styles.successText : '',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {value}
        </span>
    );
}
export function PricingPage01({
    eyebrow = 'Pricing Plans',
    title = 'Compare Plans & Find Your',
    titleAccent = 'Perfect Fit',
    description = 'All plans include our core features. Upgrade when you need more.',
    contactTitle = 'Need a custom solution?',
    contactDescription = 'Contact our sales team for Enterprise pricing and features.',
    contactButtonLabel = 'Contact Sales',
    category1Label = 'General',
    category2Label = 'Account',
    category3Label = 'Billing',

    question1 = 'What is Kbuilder and how does it work?',
    answer1 = 'Kbuilder is a powerful website builder that helps you create stunning websites without coding. Choose a template, customize it with our drag-and-drop editor, and publish your site in minutes.',

    question2 = 'How easy is it to use?',
    answer2 = 'Kbuilder is designed for everyone. You can select a template, edit your content visually, and launch your website without writing code.',

    question3 = 'Can I use my own domain?',
    answer3 = 'Yes. You can connect your own custom domain and publish your website with a professional web address.',

    question4 = 'Do you offer customer support?',
    answer4 = 'Yes. Our support team is available to help you with website setup, publishing, domains, and other platform questions.',

    question5 = 'Can I cancel my plan anytime?',
    answer5 = 'Yes. You can change or cancel your subscription based on your current plan and billing settings.',

    plan1Name = 'Free',
    plan1Description = 'Get started',
    plan1Icon = 'bi-power',
    plan1Tone = 'green',
    plan1Popular = false,

    plan2Name = 'Starter',
    plan2Description = 'For individuals',
    plan2Icon = 'bi-send',
    plan2Tone = 'blue',
    plan2Popular = false,

    plan3Name = 'Pro',
    plan3Description = 'For professionals',
    plan3Icon = 'bi-lightning-charge',
    plan3Tone = 'purple',
    plan3Popular = true,

    plan4Name = 'Enterprise',
    plan4Description = 'For large teams',
    plan4Icon = 'bi-buildings',
    plan4Tone = 'orange',
    plan4Popular = false,

    comparison1Title = 'Core features',
    comparison1Icon = 'bi-stars',

    comparison1Label1 = 'Website Limit',
    comparison1Free1 = '1 Website',
    comparison1Starter1 = '2 Websites',
    comparison1Pro1 = '3 Websites',
    comparison1Enterprise1 = 'Custom',

    comparison1Label2 = 'Pages',
    comparison1Free2 = '10 Pages',
    comparison1Starter2 = '15 Pages',
    comparison1Pro2 = '30 Pages',
    comparison1Enterprise2 = 'Custom',
    comparison1Highlight = 'primary',

    comparison1Label3 = 'Custom Domain',
    comparison1Free3 = true,
    comparison1Starter3 = true,
    comparison1Pro3 = true,
    comparison1Enterprise3 = true,

    comparison1Label4 = 'Premium Templates',
    comparison1Free4 = false,
    comparison1Starter4 = true,
    comparison1Pro4 = true,
    comparison1Enterprise4 = true,

    comparison2Title = 'Builder & performance',
    comparison2Icon = 'bi-file-earmark-code',

    comparison2Label1 = 'Drag & Drop Builder',
    comparison2Free1 = true,
    comparison2Starter1 = true,
    comparison2Pro1 = true,
    comparison2Enterprise1 = true,

    comparison2Label2 = 'Responsive Design',
    comparison2Free2 = true,
    comparison2Starter2 = true,
    comparison2Pro2 = true,
    comparison2Enterprise2 = true,

    comparison2Label3 = 'Daily Backup',
    comparison2Free3 = false,
    comparison2Starter3 = true,
    comparison2Pro3 = true,
    comparison2Enterprise3 = true,

    comparison3Title = 'Advanced features',
    comparison3Icon = 'bi-gear',

    comparison3Label1 = 'Built-in SEO',
    comparison3Free1 = true,
    comparison3Starter1 = true,
    comparison3Pro1 = true,
    comparison3Enterprise1 = true,

    comparison3Label2 = 'Advanced Analytics',
    comparison3Free2 = false,
    comparison3Starter2 = false,
    comparison3Pro2 = true,
    comparison3Enterprise2 = true,

    comparison3Label3 = 'API Access',
    comparison3Free3 = false,
    comparison3Starter3 = false,
    comparison3Pro3 = true,
    comparison3Enterprise3 = true,

    comparison3Label4 = 'Dedicated Manager',
    comparison3Free4 = false,
    comparison3Starter4 = false,
    comparison3Pro4 = false,
    comparison3Enterprise4 = true,

    // Plan 1
    pricingPlan1Name = 'Basic',
    pricingPlan1WebsiteLabel = '1 Website',
    pricingPlan1Price = 5,
    pricingPlan1Description = 'Everything you need to build a simple, professional website.',
    pricingPlan1Icon = 'bi-flower1',
    pricingPlan1Tone = 'green',
    pricingPlan1ButtonLabel = 'Get Started',
    pricingPlan1Popular = false,
    pricingPlan1ComingSoon = false,

    pricingPlan1Feature1 = '1 Website',
    pricingPlan1Feature2 = 'Up to 10 Pages',
    pricingPlan1Feature3 = 'Free SSL Certificate',
    pricingPlan1Feature4 = 'Custom Domain',
    pricingPlan1Feature5 = 'Drag & Drop Builder',
    pricingPlan1Feature6 = 'Responsive Design',
    pricingPlan1Feature7 = 'Built-in SEO',
    pricingPlan1Feature8 = 'Analytics Dashboard',
    pricingPlan1Feature9 = 'Fast Cloud Hosting',
    pricingPlan1Feature10 = 'Email Support',

    // pricingPlan 2
    pricingPlan2Name = 'Standard',
    pricingPlan2WebsiteLabel = '2 Websites',
    pricingPlan2Price = 10,
    pricingPlan2Description = 'More power and flexibility for growing websites.',
    pricingPlan2Icon = 'bi-star',
    pricingPlan2Tone = 'blue',
    pricingPlan2ButtonLabel = 'Start Free Trial',
    pricingPlan2Popular = false,
    pricingPlan2ComingSoon = false,

    pricingPlan2Feature1 = '2 Websites',
    pricingPlan2Feature2 = 'Up to 15 Pages',
    pricingPlan2Feature3 = 'Free SSL Certificate',
    pricingPlan2Feature4 = 'Custom Domain',
    pricingPlan2Feature5 = 'Premium Templates',
    pricingPlan2Feature6 = 'Drag & Drop Builder',
    pricingPlan2Feature7 = 'Analytics Dashboard',
    pricingPlan2Feature8 = 'Daily Backup',
    pricingPlan2Feature9 = 'Faster Performance',
    pricingPlan2Feature10 = 'Priority Support',

    // pricingPlan 3
    pricingPlan3Name = 'Professional',
    pricingPlan3WebsiteLabel = '3 Websites',
    pricingPlan3Price = 20,
    pricingPlan3Description = 'Advanced features for serious businesses and professionals.',
    pricingPlan3Icon = 'bi-gem',
    pricingPlan3Tone = 'purple',
    pricingPlan3ButtonLabel = 'Start Free Trial',
    pricingPlan3Popular = true,
    pricingPlan3ComingSoon = false,

    pricingPlan3Feature1 = '3 Websites',
    pricingPlan3Feature2 = 'Up to 30 Pages',
    pricingPlan3Feature3 = 'Free SSL Certificate',
    pricingPlan3Feature4 = 'Unlimited Custom Domains',
    pricingPlan3Feature5 = 'All Premium Templates',
    pricingPlan3Feature6 = 'Advanced Analytics',
    pricingPlan3Feature7 = 'Premium SEO',
    pricingPlan3Feature8 = 'Daily Backup',
    pricingPlan3Feature9 = 'API Access',
    pricingPlan3Feature10 = 'Premium Support',

    // pricingPlan 4
    pricingPlan4Name = 'Custom',
    pricingPlan4WebsiteLabel = 'Custom Websites',
    pricingPlan4Description = "Need something specific? Let's build a pricingPlan for you.",
    pricingPlan4Icon = 'bi-gear',
    pricingPlan4Tone = 'orange',
    pricingPlan4ButtonLabel = 'Contact Sales',
    pricingPlan4Popular = false,
    pricingPlan4ComingSoon = true,

    pricingPlan4Feature1 = 'Custom Number of Websites',
    pricingPlan4Feature2 = 'Custom Pages',
    pricingPlan4Feature3 = 'Free SSL Certificate',
    pricingPlan4Feature4 = 'Unlimited Custom Domains',
    pricingPlan4Feature5 = 'All Premium Templates',
    pricingPlan4Feature6 = 'Advanced Features',
    pricingPlan4Feature7 = 'Priority Support',
    pricingPlan4Feature8 = 'Dedicated Account Manager',
    pricingPlan4Feature9 = 'API Access',
    pricingPlan4Feature10 = 'And More...',
}: PricingPage01Props) {
    const [activeCategory, setActiveCategory] = React.useState('general');
    const [openFaqId, setOpenFaqId] = React.useState<number | null>(1);

    const PLANS: SetupPlan[] = [
        {
            name: plan1Name,
            description: plan1Description,
            icon: plan1Icon,
            tone: plan1Tone,
            popular: plan1Popular,
        },
        {
            name: plan2Name,
            description: plan2Description,
            icon: plan2Icon,
            tone: plan2Tone,
            popular: plan2Popular,
        },
        {
            name: plan3Name,
            description: plan3Description,
            icon: plan3Icon,
            tone: plan3Tone,
            popular: plan3Popular,
        },
        {
            name: plan4Name,
            description: plan4Description,
            icon: plan4Icon,
            tone: plan4Tone,
            popular: plan4Popular,
        },
    ];

    const COMPARISON_GROUPS: ComparisonGroup[] = [
        {
            title: comparison1Title,
            icon: comparison1Icon,
            rows: [
                {
                    label: comparison1Label1,
                    free: comparison1Free1,
                    starter: comparison1Starter1,
                    pro: comparison1Pro1,
                    enterprise: comparison1Enterprise1,
                },
                {
                    label: comparison1Label2,
                    free: comparison1Free2,
                    starter: comparison1Starter2,
                    pro: comparison1Pro2,
                    enterprise: comparison1Enterprise2,
                    highlight: comparison1Highlight,
                },
                {
                    label: comparison1Label3,
                    free: comparison1Free3,
                    starter: comparison1Starter3,
                    pro: comparison1Pro3,
                    enterprise: comparison1Enterprise3,
                },
                {
                    label: comparison1Label4,
                    free: comparison1Free4,
                    starter: comparison1Starter4,
                    pro: comparison1Pro4,
                    enterprise: comparison1Enterprise4,
                },
            ],
        },

        {
            title: comparison2Title,
            icon: comparison2Icon,
            rows: [
                {
                    label: comparison2Label1,
                    free: comparison2Free1,
                    starter: comparison2Starter1,
                    pro: comparison2Pro1,
                    enterprise: comparison2Enterprise1,
                },
                {
                    label: comparison2Label2,
                    free: comparison2Free2,
                    starter: comparison2Starter2,
                    pro: comparison2Pro2,
                    enterprise: comparison2Enterprise2,
                },
                {
                    label: comparison2Label3,
                    free: comparison2Free3,
                    starter: comparison2Starter3,
                    pro: comparison2Pro3,
                    enterprise: comparison2Enterprise3,
                },
            ],
        },

        {
            title: comparison3Title,
            icon: comparison3Icon,
            rows: [
                {
                    label: comparison3Label1,
                    free: comparison3Free1,
                    starter: comparison3Starter1,
                    pro: comparison3Pro1,
                    enterprise: comparison3Enterprise1,
                },
                {
                    label: comparison3Label2,
                    free: comparison3Free2,
                    starter: comparison3Starter2,
                    pro: comparison3Pro2,
                    enterprise: comparison3Enterprise2,
                },
                {
                    label: comparison3Label3,
                    free: comparison3Free3,
                    starter: comparison3Starter3,
                    pro: comparison3Pro3,
                    enterprise: comparison3Enterprise3,
                },
                {
                    label: comparison3Label4,
                    free: comparison3Free4,
                    starter: comparison3Starter4,
                    pro: comparison3Pro4,
                    enterprise: comparison3Enterprise4,
                },
            ],
        },
    ];

    const PRICING_PLANS: PricingPlan[] = [
        {
            name: pricingPlan1Name,
            websiteLabel: pricingPlan1WebsiteLabel,
            price: pricingPlan1Price,
            description: pricingPlan1Description,
            icon: pricingPlan1Icon,
            tone: pricingPlan1Tone,
            buttonLabel: pricingPlan1ButtonLabel,
            popular: pricingPlan1Popular,
            comingSoon: pricingPlan1ComingSoon,
            features: [
                pricingPlan1Feature1,
                pricingPlan1Feature2,
                pricingPlan1Feature3,
                pricingPlan1Feature4,
                pricingPlan1Feature5,
                pricingPlan1Feature6,
                pricingPlan1Feature7,
                pricingPlan1Feature8,
                pricingPlan1Feature9,
                pricingPlan1Feature10,
            ].filter(Boolean) as string[],
        },

        {
            name: pricingPlan2Name,
            websiteLabel: pricingPlan2WebsiteLabel,
            price: pricingPlan2Price,
            description: pricingPlan2Description,
            icon: pricingPlan2Icon,
            tone: pricingPlan2Tone,
            buttonLabel: pricingPlan2ButtonLabel,
            popular: pricingPlan2Popular,
            comingSoon: pricingPlan2ComingSoon,
            features: [
                pricingPlan2Feature1,
                pricingPlan2Feature2,
                pricingPlan2Feature3,
                pricingPlan2Feature4,
                pricingPlan2Feature5,
                pricingPlan2Feature6,
                pricingPlan2Feature7,
                pricingPlan2Feature8,
                pricingPlan2Feature9,
                pricingPlan2Feature10,
            ].filter(Boolean) as string[],
        },

        {
            name: pricingPlan3Name,
            websiteLabel: pricingPlan3WebsiteLabel,
            price: pricingPlan3Price,
            description: pricingPlan3Description,
            icon: pricingPlan3Icon,
            tone: pricingPlan3Tone,
            buttonLabel: pricingPlan3ButtonLabel,
            popular: pricingPlan3Popular,
            comingSoon: pricingPlan3ComingSoon,
            features: [
                pricingPlan3Feature1,
                pricingPlan3Feature2,
                pricingPlan3Feature3,
                pricingPlan3Feature4,
                pricingPlan3Feature5,
                pricingPlan3Feature6,
                pricingPlan3Feature7,
                pricingPlan3Feature8,
                pricingPlan3Feature9,
                pricingPlan3Feature10,
            ].filter(Boolean) as string[],
        },

        {
            name: pricingPlan4Name,
            websiteLabel: pricingPlan4WebsiteLabel,
            description: pricingPlan4Description,
            icon: pricingPlan4Icon,
            tone: pricingPlan4Tone,
            buttonLabel: pricingPlan4ButtonLabel,
            popular: pricingPlan4Popular,
            comingSoon: pricingPlan4ComingSoon,
            features: [
                pricingPlan4Feature1,
                pricingPlan4Feature2,
                pricingPlan4Feature3,
                pricingPlan4Feature4,
                pricingPlan4Feature5,
                pricingPlan4Feature6,
                pricingPlan4Feature7,
                pricingPlan4Feature8,
                pricingPlan4Feature9,
                pricingPlan4Feature10,
            ].filter(Boolean) as string[],
        },
    ];

    const categories: FaqCategory[] = [
        {
            id: 'general',
            label: category1Label,
            icon: 'bi-chat-square',
        },
        {
            id: 'account',
            label: category2Label,
            icon: 'bi-shield-check',
        },
        {
            id: 'billing',
            label: category3Label,
            icon: 'bi-credit-card',
        },
    ];

    const faqs: FaqItem[] = [
        {
            id: 1,
            question: question1,
            answer: answer1,
        },
        {
            id: 2,
            question: question2,
            answer: answer2,
        },
        {
            id: 3,
            question: question3,
            answer: answer3,
        },
        {
            id: 4,
            question: question4,
            answer: answer4,
        },
        {
            id: 5,
            question: question5,
            answer: answer5,
        },
    ];

    const toggleFaq = React.useCallback((id: number) => {
        setOpenFaqId((currentId) => (currentId === id ? null : id));
    }, []);

    return (
        <>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.heading}>
                        <div className={styles.headingContent}>
                            <span className={styles.eyebrow}>
                                <i className="bi bi-bag-check" /> Pricing Plans
                            </span>
                            <h2>Simple, Transparent Pricing</h2>
                        </div>
                        <div className={styles.headingActions}>
                            <p>No contracts. No hidden fees. Cancel anytime.</p>

                            <div className={styles.billing}>
                                <span className={styles.discount}>20% Off</span>

                                <span className={styles.activeBilling}>Pay Yearly</span>

                                <button
                                    type="button"
                                    className={styles.billingToggle}
                                    aria-label="Change billing period"
                                >
                                    <span />
                                </button>

                                <span>Pay Monthly</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.pricingGrid}>
                        {PRICING_PLANS.map((plan) => (
                            <PricingCard key={plan.name} plan={plan} />
                        ))}
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.backgroundGlow} />

                <div className={styles.container}>
                    <header className={styles.heading}>
                        <div className={styles.headingContent}>
                            <span className={styles.eyebrow}>
                                <i className="bi bi-bag-check" />
                                {eyebrow}
                            </span>

                            <h2 className={styles.title}>
                                {title} <span className={styles.titleAccent}>{titleAccent}</span>
                            </h2>
                        </div>
                    </header>

                    <div className={styles.tableCard}>
                        <div className={styles.tableScroll}>
                            <div className={styles.comparisonTable}>
                                <div className={styles.planHeader}>
                                    <div className={styles.featureHeader}>
                                        <span className={styles.featureHeaderIcon}>
                                            <i className="bi bi-stars" />
                                        </span>

                                        <span>Compare features</span>
                                    </div>

                                    {PLANS.map((plan) => (
                                        <div
                                            key={plan.name}
                                            className={`${styles.plan} ${styles[plan.tone]}`}
                                        >
                                            {plan.popular && (
                                                <span className={styles.popularBadge}>
                                                    Most Popular
                                                </span>
                                            )}

                                            <span className={styles.planIcon}>
                                                <i className={`bi ${plan.icon}`} />
                                            </span>

                                            <strong>{plan.name}</strong>

                                            <span className={styles.planDescription}>
                                                {plan.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {COMPARISON_GROUPS.map((group) => (
                                    <div key={group.title} className={styles.comparisonGroup}>
                                        <div className={styles.groupHeader}>
                                            <div className={styles.groupTitle}>
                                                <i className={`bi ${group.icon}`} />
                                                <strong>{group.title}</strong>
                                            </div>

                                            {PLANS.map((plan) => (
                                                <span
                                                    key={plan.name}
                                                    className={styles.groupPlanName}
                                                >
                                                    {plan.name}
                                                </span>
                                            ))}
                                        </div>

                                        {group.rows.map((row) => (
                                            <div key={row.label} className={styles.comparisonRow}>
                                                <div className={styles.featureName}>
                                                    {row.icon && <i className={`bi ${row.icon}`} />}

                                                    <span>{row.label}</span>

                                                    <i
                                                        className={`bi bi-info-circle ${styles.infoIcon}`}
                                                    />
                                                </div>

                                                {PLAN_KEYS.map((key) => (
                                                    <div
                                                        key={key}
                                                        className={styles.comparisonCell}
                                                    >
                                                        <ComparisonCell
                                                            value={row[key]}
                                                            highlight={row.highlight}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <footer className={styles.contactFooter}>
                            <div className={styles.contactContent}>
                                <span className={styles.contactIcon}>
                                    <i className="bi bi-stars" />
                                </span>

                                <div>
                                    <strong>{contactTitle}</strong>
                                    <p>{contactDescription}</p>
                                </div>
                            </div>

                            <button type="button" className={styles.contactButton}>
                                <span>{contactButtonLabel}</span>
                                <i className="bi bi-arrow-right" />
                            </button>
                        </footer>
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.glow} />

                <div className={styles.container}>
                    <header className={styles.heading}>
                        <div className={styles.headingContent}>
                            <span className={styles.eyebrow}>
                                <i className="bi bi-question-circle" />
                                {eyebrow}
                            </span>

                            <h2 className={styles.title}>{title}</h2>
                        </div>
                    </header>

                    <div className={styles.faqLayout}>
                        <aside className={styles.categories}>
                            <div className={styles.categoryList}>
                                {categories.map((category) => {
                                    const isActive = activeCategory === category.id;

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            className={`${styles.categoryButton} ${
                                                isActive ? styles.categoryButtonActive : ''
                                            }`}
                                            onClick={() => setActiveCategory(category.id)}
                                        >
                                            <span className={styles.categoryIcon}>
                                                <i className={`bi ${category.icon}`} />
                                            </span>

                                            <span>{category.label}</span>

                                            <i
                                                className={`bi bi-arrow-right-short ${styles.categoryArrow}`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.sidebarHelp}>
                                <span className={styles.sidebarHelpIcon}>
                                    <i className="bi bi-headset" />
                                </span>

                                <div>
                                    <strong>Still need help?</strong>

                                    <p>Our support team is ready to help.</p>
                                </div>

                                <button type="button">
                                    Contact support
                                    <i className="bi bi-arrow-right" />
                                </button>
                            </div>
                        </aside>

                        <div className={styles.faqPanel}>
                            <div className={styles.faqList}>
                                {faqs.map((faq) => {
                                    const isOpen = openFaqId === faq.id;

                                    return (
                                        <article
                                            key={faq.id}
                                            className={`${styles.faqItem} ${
                                                isOpen ? styles.faqItemOpen : ''
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                className={styles.faqQuestion}
                                                onClick={() => toggleFaq(faq.id)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{faq.question}</span>

                                                <span className={styles.faqToggle}>
                                                    <i
                                                        className={`bi ${
                                                            isOpen
                                                                ? 'bi-chevron-up'
                                                                : 'bi-chevron-down'
                                                        }`}
                                                    />
                                                </span>
                                            </button>

                                            <div
                                                className={`${styles.answerGrid} ${
                                                    isOpen ? styles.answerGridOpen : ''
                                                }`}
                                            >
                                                <div className={styles.answerOverflow}>
                                                    <div className={styles.faqAnswer}>
                                                        <p>{faq.answer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
    return (
        <article
            className={`${styles.card} ${styles[plan.tone]} ${plan.popular ? styles.popular : ''}`}
        >
            {plan.popular && (
                <div className={styles.popularBadgeTop}>
                    <i className="bi bi-gem" />
                    Most Popular
                </div>
            )}

            <div className={styles.cardBody}>
                <div className={styles.planHeaderTop}>
                    <div className={styles.planIcon}>
                        <i className={`bi ${plan.icon}`} />
                    </div>

                    <div className={styles.planInfo}>
                        <h3>{plan.name}</h3>
                        <span>{plan.websiteLabel}</span>
                    </div>
                </div>

                <div className={styles.priceArea}>
                    {plan.comingSoon ? (
                        <>
                            <strong className={styles.customPrice}>Contact Us</strong>

                            <span className={styles.comingSoon}>Pricing coming soon</span>
                        </>
                    ) : (
                        <div className={styles.price}>
                            <span className={styles.currency}>$</span>

                            <strong>{plan.price}</strong>

                            <span className={styles.period}>/ month</span>
                        </div>
                    )}
                </div>

                <div className={styles.divider} />

                <p className={styles.description}>{plan.description}</p>

                <button type="button" className={styles.planButton}>
                    {plan.buttonLabel}
                </button>

                <ul className={styles.features}>
                    {plan.features.map((feature) => (
                        <li key={feature}>
                            <i className="bi bi-check2" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}

function createDefaults() {
    const defaults: Record<string, unknown> = {
        eyebrow: 'Pricing Plans',
        title: 'Compare Plans & Find Your',
        titleAccent: 'Perfect Fit',
        description: 'All plans include our core features. Upgrade when you need more.',

        contactTitle: 'Need a custom solution?',
        contactDescription: 'Contact our sales team for Enterprise pricing and features.',
        contactButtonLabel: 'Contact Sales',

        category1Label: 'General',
        category2Label: 'Account',
        category3Label: 'Billing',

        question1: 'What is Kbuilder and how does it work?',
        answer1:
            'Kbuilder is a powerful website builder that helps you create stunning websites without coding. Choose a template, customize it with our drag-and-drop editor, and publish your site in minutes.',

        question2: 'How easy is it to use?',
        answer2:
            'Kbuilder is designed for everyone. You can select a template, edit your content visually, and launch your website without writing code.',

        question3: 'Can I use my own domain?',
        answer3:
            'Yes. You can connect your own custom domain and publish your website with a professional web address.',

        question4: 'Do you offer customer support?',
        answer4:
            'Yes. Our support team is available to help you with website setup, publishing, domains, and other platform questions.',

        question5: 'Can I cancel my plan anytime?',
        answer5:
            'Yes. You can change or cancel your subscription based on your current plan and billing settings.',

        plan1Name: 'Free',
        plan1Description: 'Get started',
        plan1Icon: 'bi-power',
        plan1Tone: 'green',
        plan1Popular: false,

        plan2Name: 'Starter',
        plan2Description: 'For individuals',
        plan2Icon: 'bi-send',
        plan2Tone: 'blue',
        plan2Popular: false,

        plan3Name: 'Pro',
        plan3Description: 'For professionals',
        plan3Icon: 'bi-lightning-charge',
        plan3Tone: 'purple',
        plan3Popular: true,

        plan4Name: 'Enterprise',
        plan4Description: 'For large teams',
        plan4Icon: 'bi-buildings',
        plan4Tone: 'orange',
        plan4Popular: false,

        comparison1Title: 'Core features',
        comparison1Icon: 'bi-stars',

        comparison1Label1: 'Website Limit',
        comparison1Free1: '1 Website',
        comparison1Starter1: '2 Websites',
        comparison1Pro1: '3 Websites',
        comparison1Enterprise1: 'Custom',

        comparison1Label2: 'Pages',
        comparison1Free2: '10 Pages',
        comparison1Starter2: '15 Pages',
        comparison1Pro2: '30 Pages',
        comparison1Enterprise2: 'Custom',
        comparison1Highlight: 'primary',

        comparison1Label3: 'Custom Domain',
        comparison1Free3: true,
        comparison1Starter3: true,
        comparison1Pro3: true,
        comparison1Enterprise3: true,

        comparison1Label4: 'Premium Templates',
        comparison1Free4: false,
        comparison1Starter4: true,
        comparison1Pro4: true,
        comparison1Enterprise4: true,

        comparison2Title: 'Builder & Performance',
        comparison2Icon: 'bi-file-earmark-code',

        comparison2Label1: 'Drag & Drop Builder',
        comparison2Free1: true,
        comparison2Starter1: true,
        comparison2Pro1: true,
        comparison2Enterprise1: true,

        comparison2Label2: 'Responsive Design',
        comparison2Free2: true,
        comparison2Starter2: true,
        comparison2Pro2: true,
        comparison2Enterprise2: true,

        comparison2Label3: 'Daily Backup',
        comparison2Free3: false,
        comparison2Starter3: true,
        comparison2Pro3: true,
        comparison2Enterprise3: true,

        comparison3Title: 'Advanced Features',
        comparison3Icon: 'bi-gear',

        comparison3Label1: 'Built-in SEO',
        comparison3Free1: true,
        comparison3Starter1: true,
        comparison3Pro1: true,
        comparison3Enterprise1: true,

        comparison3Label2: 'Advanced Analytics',
        comparison3Free2: false,
        comparison3Starter2: false,
        comparison3Pro2: true,
        comparison3Enterprise2: true,

        comparison3Label3: 'API Access',
        comparison3Free3: false,
        comparison3Starter3: false,
        comparison3Pro3: true,
        comparison3Enterprise3: true,

        comparison3Label4: 'Dedicated Manager',
        comparison3Free4: false,
        comparison3Starter4: false,
        comparison3Pro4: false,
        comparison3Enterprise4: true,

        pricingPlan1Name: 'Basic',
        pricingPlan1WebsiteLabel: '1 Website',
        pricingPlan1Price: 5,
        pricingPlan1Description: 'Everything you need to build a simple, professional website.',
        pricingPlan1Icon: 'bi-flower1',
        pricingPlan1Tone: 'green',
        pricingPlan1ButtonLabel: 'Get Started',
        pricingPlan1Popular: false,
        pricingPlan1ComingSoon: false,

        pricingPlan1Feature1: '1 Website',
        pricingPlan1Feature2: 'Up to 10 Pages',
        pricingPlan1Feature3: 'Free SSL Certificate',
        pricingPlan1Feature4: 'Custom Domain',
        pricingPlan1Feature5: 'Drag & Drop Builder',
        pricingPlan1Feature6: 'Responsive Design',
        pricingPlan1Feature7: 'Built-in SEO',
        pricingPlan1Feature8: 'Analytics Dashboard',
        pricingPlan1Feature9: 'Fast Cloud Hosting',
        pricingPlan1Feature10: 'Email Support',

        pricingPlan2Name: 'Standard',
        pricingPlan2WebsiteLabel: '2 Websites',
        pricingPlan2Price: 10,
        pricingPlan2Description: 'More power and flexibility for growing websites.',
        pricingPlan2Icon: 'bi-star',
        pricingPlan2Tone: 'blue',
        pricingPlan2ButtonLabel: 'Start Free Trial',
        pricingPlan2Popular: false,
        pricingPlan2ComingSoon: false,

        pricingPlan2Feature1: '2 Websites',
        pricingPlan2Feature2: 'Up to 15 Pages',
        pricingPlan2Feature3: 'Free SSL Certificate',
        pricingPlan2Feature4: 'Custom Domain',
        pricingPlan2Feature5: 'Premium Templates',
        pricingPlan2Feature6: 'Drag & Drop Builder',
        pricingPlan2Feature7: 'Analytics Dashboard',
        pricingPlan2Feature8: 'Daily Backup',
        pricingPlan2Feature9: 'Faster Performance',
        pricingPlan2Feature10: 'Priority Support',

        pricingPlan3Name: 'Professional',
        pricingPlan3WebsiteLabel: '3 Websites',
        pricingPlan3Price: 20,
        pricingPlan3Description: 'Advanced features for serious businesses and professionals.',
        pricingPlan3Icon: 'bi-gem',
        pricingPlan3Tone: 'purple',
        pricingPlan3ButtonLabel: 'Start Free Trial',
        pricingPlan3Popular: true,
        pricingPlan3ComingSoon: false,

        pricingPlan3Feature1: '3 Websites',
        pricingPlan3Feature2: 'Up to 30 Pages',
        pricingPlan3Feature3: 'Free SSL Certificate',
        pricingPlan3Feature4: 'Unlimited Custom Domains',
        pricingPlan3Feature5: 'All Premium Templates',
        pricingPlan3Feature6: 'Advanced Analytics',
        pricingPlan3Feature7: 'Premium SEO',
        pricingPlan3Feature8: 'Daily Backup',
        pricingPlan3Feature9: 'API Access',
        pricingPlan3Feature10: 'Premium Support',

        pricingPlan4Name: 'Custom',
        pricingPlan4WebsiteLabel: 'Custom Websites',
        pricingPlan4Price: undefined,
        pricingPlan4Description: "Need something specific? Let's build a pricing plan for you.",
        pricingPlan4Icon: 'bi-gear',
        pricingPlan4Tone: 'orange',
        pricingPlan4ButtonLabel: 'Contact Sales',
        pricingPlan4Popular: false,
        pricingPlan4ComingSoon: true,

        pricingPlan4Feature1: 'Custom Number of Websites',
        pricingPlan4Feature2: 'Custom Pages',
        pricingPlan4Feature3: 'Free SSL Certificate',
        pricingPlan4Feature4: 'Unlimited Custom Domains',
        pricingPlan4Feature5: 'All Premium Templates',
        pricingPlan4Feature6: 'Advanced Features',
        pricingPlan4Feature7: 'Priority Support',
        pricingPlan4Feature8: 'Dedicated Account Manager',
        pricingPlan4Feature9: 'API Access',
        pricingPlan4Feature10: 'And More...',
    };

    return defaults;
}

function textField(key: string, label: string) {
    return {
        key,
        label,
        kind: 'text' as const,
    };
}

function textareaField(key: string, label: string) {
    return {
        key,
        label,
        kind: 'textarea' as const,
    };
}

function numberField(key: string, label: string) {
    return {
        key,
        label,
        kind: 'number' as const,
    };
}

function checkField(key: string, label: string) {
    return {
        key,
        label,
        kind: 'check' as const,
    };
}
function createInspector(): RegItem['inspector'] {
    return [
        textField('eyebrow', 'Eyebrow'),
        textField('title', 'Title'),
        textField('titleAccent', 'Title Accent'),
        textareaField('description', 'Description'),

        // Contact
        textField('contactTitle', 'Contact Title'),
        textareaField('contactDescription', 'Contact Description'),
        textField('contactButtonLabel', 'Contact Button'),

        // Categories
        textField('category1Label', 'Category 1'),
        textField('category2Label', 'Category 2'),
        textField('category3Label', 'Category 3'),

        // FAQ
        ...Array.from({ length: 5 }, (_, i) => [
            textField(`question${i + 1}`, `FAQ ${i + 1} Question`),
            textareaField(`answer${i + 1}`, `FAQ ${i + 1} Answer`),
        ]).flat(),

        // Compare Plans
        ...Array.from({ length: 4 }, (_, i) => [
            textField(`plan${i + 1}Name`, `Compare Plan ${i + 1} Name`),
            textField(`plan${i + 1}Description`, `Compare Plan ${i + 1} Description`),
            textField(`plan${i + 1}Icon`, `Compare Plan ${i + 1} Icon`),
            textField(`plan${i + 1}Tone`, `Compare Plan ${i + 1} Tone`),
            checkField(`plan${i + 1}Popular`, `Compare Plan ${i + 1} Popular`),
        ]).flat(),

        // Comparison Group 1
        textField('comparison1Title', 'Comparison 1 Title'),
        textField('comparison1Icon', 'Comparison 1 Icon'),

        ...Array.from({ length: 4 }, (_, row) => [
            textField(`comparison1Label${row + 1}`, `Comparison 1 Row ${row + 1} Label`),
            textField(`comparison1Free${row + 1}`, `Comparison 1 Free ${row + 1}`),
            textField(`comparison1Starter${row + 1}`, `Comparison 1 Starter ${row + 1}`),
            textField(`comparison1Pro${row + 1}`, `Comparison 1 Pro ${row + 1}`),
            textField(`comparison1Enterprise${row + 1}`, `Comparison 1 Enterprise ${row + 1}`),
        ]).flat(),

        textField('comparison1Highlight', 'Comparison 1 Highlight'),

        // Comparison Group 2
        textField('comparison2Title', 'Comparison 2 Title'),
        textField('comparison2Icon', 'Comparison 2 Icon'),

        ...Array.from({ length: 3 }, (_, row) => [
            textField(`comparison2Label${row + 1}`, `Comparison 2 Row ${row + 1} Label`),
            textField(`comparison2Free${row + 1}`, `Comparison 2 Free ${row + 1}`),
            textField(`comparison2Starter${row + 1}`, `Comparison 2 Starter ${row + 1}`),
            textField(`comparison2Pro${row + 1}`, `Comparison 2 Pro ${row + 1}`),
            textField(`comparison2Enterprise${row + 1}`, `Comparison 2 Enterprise ${row + 1}`),
        ]).flat(),

        // Comparison Group 3
        textField('comparison3Title', 'Comparison 3 Title'),
        textField('comparison3Icon', 'Comparison 3 Icon'),

        ...Array.from({ length: 4 }, (_, row) => [
            textField(`comparison3Label${row + 1}`, `Comparison 3 Row ${row + 1} Label`),
            textField(`comparison3Free${row + 1}`, `Comparison 3 Free ${row + 1}`),
            textField(`comparison3Starter${row + 1}`, `Comparison 3 Starter ${row + 1}`),
            textField(`comparison3Pro${row + 1}`, `Comparison 3 Pro ${row + 1}`),
            textField(`comparison3Enterprise${row + 1}`, `Comparison 3 Enterprise ${row + 1}`),
        ]).flat(),

        // Pricing Plans
        ...Array.from({ length: 4 }, (_, plan) => [
            textField(`pricingPlan${plan + 1}Name`, `Plan ${plan + 1} Name`),

            textField(`pricingPlan${plan + 1}WebsiteLabel`, `Plan ${plan + 1} Website Label`),

            numberField(`pricingPlan${plan + 1}Price`, `Plan ${plan + 1} Price`),

            textareaField(`pricingPlan${plan + 1}Description`, `Plan ${plan + 1} Description`),

            textField(`pricingPlan${plan + 1}Icon`, `Plan ${plan + 1} Icon`),

            textField(`pricingPlan${plan + 1}Tone`, `Plan ${plan + 1} Tone`),

            textField(`pricingPlan${plan + 1}ButtonLabel`, `Plan ${plan + 1} Button Label`),

            checkField(`pricingPlan${plan + 1}Popular`, `Plan ${plan + 1} Popular`),

            checkField(`pricingPlan${plan + 1}ComingSoon`, `Plan ${plan + 1} Coming Soon`),

            ...Array.from({ length: 10 }, (_, feature) =>
                textField(
                    `pricingPlan${plan + 1}Feature${feature + 1}`,
                    `Plan ${plan + 1} Feature ${feature + 1}`,
                ),
            ),
        ]).flat(),
    ];
}

export const PRICING_PAGE_01: RegItem = {
    kind: 'pricing-page-01',

    label: 'Pricing Page 01',

    defaults: createDefaults(),

    inspector: createInspector(),

    render: (props) => <PricingPage01 {...(props as unknown as PricingPage01Props)} />,
};

export default PricingPage01;
