'use client';

import { useMemo } from 'react';
import type { RegItem } from '@/lib/ui-builder/types';
import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/project/styles/project-01.module.css';
type StatTone = 'blue' | 'purple' | 'green' | 'orange';
export interface ProjectPage01Props {
    breadcrumbHome?: string;
    breadcrumbCurrent?: string;
    heroBadgeTop?: string;
    heroBadgeLeft?: string;
    heroBadgeBottom?: string;
    heroBadgeSsl?: string;
    heroTitle?: string;
    heroDescription?: string;
    heroButtonLabel?: string;
    sectionBadge?: string;
    sectionTitle?: string;
    sectionTitleAccent?: string;
    sectionDescription?: string;
    stat1Value?: string;
    stat1Label?: string;
    stat2Value?: string;
    stat2Label?: string;
    stat3Value?: string;
    stat3Label?: string;
    stat4Value?: string;
    stat4Label?: string;
    eyebrowText1?: string;
    eyebrowAccentText1?: string;
    highlightText1?: string;

    eyebrowText2?: string;
    eyebrowAccentText2?: string;
    highlightText2?: string;
    subTitle1?: string;
    icon1?: string;
    title1?: string;
    description1?: string;
    image1?: string;
    subTitle2?: string;
    icon2?: string;
    title2?: string;
    description2?: string;
    image2?: string;
    subTitle3?: string;
    icon3?: string;
    title3?: string;
    description3?: string;
    image3?: string;
    subTitle4?: string;
    icon4?: string;
    title4?: string;
    description4?: string;
    image4?: string;
    subTitle5?: string;
    icon5?: string;
    title5?: string;
    description5?: string;
    image5?: string;
    subTitle6?: string;
    icon6?: string;
    title6?: string;
    description6?: string;
    image6?: string;
    subTitle7?: string;
    icon7?: string;
    title7?: string;
    description7?: string;
    image7?: string;
    subTitle8?: string;
    icon8?: string;
    title8?: string;
    description8?: string;
    image8?: string;
    subTitle9?: string;
    icon9?: string;
    title9?: string;
    description9?: string;
    image9?: string;
    subTitle10?: string;
    icon10?: string;
    title10?: string;
    description10?: string;
    image10?: string;
    subTitle11?: string;
    icon11?: string;
    title11?: string;
    description11?: string;
    image11?: string;
}

type FeatureItem = {
    subtitle: string;
    icon: string;
    title: string;
    description: string;
    image: string;
};

type FeatureSectionHeaderProps = {
    eyebrow: string;
    accent: string;
    highlight: string;
};

function createFeature(
    subtitle = '',
    icon = '',
    title = '',
    description = '',
    image = '',
): FeatureItem {
    return {
        subtitle,
        icon,
        title,
        description,
        image,
    };
}

type FeatureCardProps = {
    feature: FeatureItem;
};

type StatItem = {
    value: string;
    label: string;
    icon: string;
    tone: StatTone;
};

function FeatureCard({ feature }: FeatureCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.imageWrap}>
                <div className={styles.imageGlow} />
                <div className={styles.imageGrid} />

                <img src={feature.image} alt={feature.title} className={styles.image} />
            </div>

            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <div className={styles.titleIcon}>
                        <i className={`bi ${feature.icon}`} />
                    </div>

                    <div className={styles.headerTop}>
                        <h3>{feature.title}</h3>
                        <h4 className={styles.subtitle}>{feature.subtitle}</h4>
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.metaRow}>
                        <div className={styles.metaContent}>
                            <p>{feature.description}</p>
                        </div>
                    </div>

                    <div className={styles.footerActions}>
                        <span className={styles.status}>
                            <span className={styles.statusDot} />
                            Included
                        </span>

                        <button type="button" className={styles.learnMore}>
                            Learn More
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function FeatureSectionHeader({ eyebrow, accent, highlight }: FeatureSectionHeaderProps) {
    return (
        <div className={styles.header}>
            <div>
                <h2 className={styles.eyebrow}>
                    <i className="bi bi-rocket-takeoff-fill" />
                    {eyebrow}
                    <span>{accent}</span>
                </h2>
            </div>

            <button className={styles.ctaButton}>
                <i className="bi bi-lightning-charge-fill" />
                <span>{highlight}</span>
            </button>
        </div>
    );
}

function createFeatureInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `subTitle${index}`,
            label: `Feature ${index} Subtitle`,
            kind: 'text',
        },
        {
            key: `icon${index}`,
            label: `Feature ${index} Icon`,
            kind: 'text',
        },
        {
            key: `title${index}`,
            label: `Feature ${index} Title`,
            kind: 'text',
        },
        {
            key: `description${index}`,
            label: `Feature ${index} Description`,
            kind: 'textarea',
        },
        {
            key: `image${index}`,
            label: `Feature ${index} Image`,
            kind: 'image',
            folder: 'services/project',
            accept: 'image/*',
        },
    ];
}

export const DEFAULT_PROPS: Required<ProjectPage01Props> = {
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Project',
    heroBadgeTop: 'AI Generated',
    heroBadgeLeft: 'No-Code Builder',
    heroBadgeBottom: '500+ Templates',
    heroBadgeSsl: 'Free SSL',
    heroTitle: 'Build Smarter With AI',
    heroDescription:
        'Launch websites faster using visual editing, responsive templates, cloud hosting and AI-assisted content generation.',
    heroButtonLabel: 'Start Building',
    sectionBadge: 'WHAT WE BUILD',
    sectionTitle: 'Everything You Need',
    sectionTitleAccent: 'To Launch Online',
    sectionDescription:
        'Kbuilder provides a complete platform for building, managing and publishing professional websites through visual editing, reusable components and intelligent automation.',
    stat1Value: '50+',
    stat1Label: 'Websites Created',
    stat2Value: '500+',
    stat2Label: 'Templates',
    stat3Value: '100%',
    stat3Label: 'No-Code Experience',
    stat4Value: 'AI',
    stat4Label: 'Powered Builder',
    eyebrowText1: 'Create Professional Websites and Business Applications Without Code',
    eyebrowAccentText1: 'Business Applications Without Code',
    highlightText1: 'Automation Ready',
    eyebrowText2: 'Research & Development with',
    eyebrowAccentText2: 'Machine Learning',
    highlightText2: 'Automation Ready',
    subTitle1: 'Website Builder',
    icon1: 'bi-window-stack',
    title1: 'No-Code Website Builder',
    description1:
        'Empower your team to build, manage, and scale professional websites through a fully visual editing experience. With drag-and-drop page creation, dynamic menu management, reusable content blocks, and flexible design controls, anyone can create beautiful responsive websites without technical expertise.',
    image1: '/assets/images/feature-add.png',
    subTitle2: 'Automation',
    icon2: 'bi-lightning-charge',
    title2: 'Website Automation',
    description2:
        'Launch a fully configured website in as little as 10 minutes. Automatically generate pages, apply branding, configure site settings, and streamline publishing workflows. Schedule and automate content distribution across Facebook and TikTok to keep your audience engaged without manual work.',
    image2: '/assets/images/automation-add.png',
    subTitle3: 'Navigation',
    icon3: 'bi-grid-3x3-gap',
    title3: 'Drag & Drop Menus',
    description3:
        'Build professional navigation systems with visual drag-and-drop controls. Create multi-level dropdowns, mega menus, mobile navigation, and custom links while organizing pages effortlessly. Update menu structures instantly and deliver a seamless browsing experience across all devices without writing code.',
    image3: '/assets/images/drag-add.png',
    subTitle4: 'Templates',
    icon4: 'bi-layout-text-window',
    title4: 'Premium Templates',
    description4:
        'Access a growing collection of 300+ premium website templates designed for every industry and use case. From SaaS platforms and landing pages to eCommerce and booking websites, each template is fully editable, mobile-friendly, and optimized for performance, SEO, and conversion.',
    image4: '/assets/images/template-add.png',
    subTitle5: 'Smart Setup',
    icon5: 'bi-magic',
    title5: 'Automatic Setup',
    description5:
        'Publish websites under your own branded domain with automated DNS configuration and free SSL certificates. Secure every website with HTTPS, improve SEO performance, and manage domains directly from the platform without dealing with servers, hosting panels, or complex technical setup.',
    image5: '/assets/images/setup-add.png',
    subTitle6: 'Security',
    icon6: 'bi-shield-check',
    title6: 'Custom SSL & Domains',
    description6:
        'Publish websites under your own branded domain with automated DNS configuration and free SSL certificates. Secure every website with HTTPS, improve SEO performance, and manage domains directly from the platform without dealing with servers, hosting panels, or complex technical setup.',
    image6: '/assets/images/ssl-add.png',
    subTitle7: 'Web Builder',
    icon7: 'bi-bounding-box',
    title7: 'Visual Canvas Builder',
    description7:
        'Researching and developing a next-generation visual website builder powered by a canvas-based editing experience. Users can design pages, arrange components, manage layouts, and customize content through a drag-and-drop interface built with Next.js.',
    image7: '/assets/images/canvas-add.png',
    subTitle8: 'Mobile Apps',
    icon8: 'bi-phone',
    title8: 'React Native Applications',
    description8:
        'Building cross-platform mobile applications with React Native for task management, business operations, customer engagement, and productivity workflows while maintaining a consistent experience across iOS and Android devices.',
    image8: '/assets/images/research-react-native.png',
    subTitle9: 'Immersive Tech',
    icon9: 'bi-badge-vr',
    title9: 'Virtual Reality Experiences',
    description9:
        'Exploring virtual reality technologies to create immersive digital experiences, interactive environments, product showcases, training simulations, and next-generation user interactions across multiple industries.',
    image9: '/assets/images/research-vr.png',
    subTitle10: 'Artificial Intelligence',
    icon10: 'bi-cpu',
    title10: 'Machine Learning & AI',
    description10:
        'Researching machine learning and artificial intelligence technologies to automate workflows, analyze business data, intelligent recommendations, and enhance digital products with smart decision-making capabilities.',
    image10: '/assets/images/research-ai.png',
    subTitle11: 'SEO & Marketing',
    icon11: 'bi-graph-up-arrow',
    title11: 'SEO Landing Pages',
    description11:
        'Developing SEO-optimized landing page systems focused on performance, search visibility, content structure, and conversion optimization to help businesses attract more organic traffic and generate qualified leads.',
    image11: '/assets/images/research-seo.png',
};
export function ProjectPage01(props: ProjectPage01Props) {
    const {
        breadcrumbHome,
        breadcrumbCurrent,

        heroBadgeTop,
        heroBadgeLeft,
        heroBadgeBottom,
        heroBadgeSsl,

        heroTitle,
        heroDescription,
        heroButtonLabel,

        sectionBadge,
        sectionTitle,
        sectionTitleAccent,
        sectionDescription,

        stat1Value,
        stat1Label,

        stat2Value,
        stat2Label,

        stat3Value,
        stat3Label,

        stat4Value,
        stat4Label,

        eyebrowText1,
        eyebrowAccentText1,
        highlightText1,

        eyebrowText2,
        eyebrowAccentText2,
        highlightText2,

        subTitle1,
        icon1,
        title1,
        description1,
        image1,

        subTitle2,
        icon2,
        title2,
        description2,
        image2,

        subTitle3,
        icon3,
        title3,
        description3,
        image3,

        subTitle4,
        icon4,
        title4,
        description4,
        image4,

        subTitle5,
        icon5,
        title5,
        description5,
        image5,

        subTitle6,
        icon6,
        title6,
        description6,
        image6,

        subTitle7,
        icon7,
        title7,
        description7,
        image7,

        subTitle8,
        icon8,
        title8,
        description8,
        image8,

        subTitle9,
        icon9,
        title9,
        description9,
        image9,

        subTitle10,
        icon10,
        title10,
        description10,
        image10,

        subTitle11,
        icon11,
        title11,
        description11,
        image11,
    } = {
        ...DEFAULT_PROPS,
        ...props,
    };
    const stats = useMemo<StatItem[]>(
        () => [
            {
                value: stat1Value,
                label: stat1Label,
                icon: 'bi-bar-chart-fill',
                tone: 'blue',
            },
            {
                value: stat2Value,
                label: stat2Label,
                icon: 'bi-layers-fill',
                tone: 'purple',
            },
            {
                value: stat3Value,
                label: stat3Label,
                icon: 'bi-shield-check',
                tone: 'green',
            },
            {
                value: stat4Value,
                label: stat4Label,
                icon: 'bi-stars',
                tone: 'orange',
            },
        ],
        [
            stat1Value,
            stat1Label,
            stat2Value,
            stat2Label,
            stat3Value,
            stat3Label,
            stat4Value,
            stat4Label,
        ],
    );

    const FEATURES_WEBSITE: FeatureItem[] = [
        createFeature(subTitle1, icon1, title1, description1, image1),
        createFeature(subTitle2, icon2, title2, description2, image2),
        createFeature(subTitle3, icon3, title3, description3, image3),
        createFeature(subTitle4, icon4, title4, description4, image4),
        createFeature(subTitle5, icon5, title5, description5, image5),
        createFeature(subTitle6, icon6, title6, description6, image6),
    ];

    const FEATURES_DEVELOPMENT: FeatureItem[] = [
        createFeature(subTitle7, icon7, title7, description7, image7),
        createFeature(subTitle8, icon8, title8, description8, image8),
        createFeature(subTitle9, icon9, title9, description9, image9),
        createFeature(subTitle10, icon10, title10, description10, image10),
        createFeature(subTitle11, icon11, title11, description11, image11),
    ];

    return (
        <>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.headingSection}>
                        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                            <Link href="/" className={styles.breadcrumbItem}>
                                {breadcrumbHome}
                            </Link>
                            <i className="bi bi-chevron-right" />
                            <span className={styles.breadcrumbCurrent}>{breadcrumbCurrent}</span>
                        </nav>
                    </div>
                    <div className={styles.heroGrid}>
                        <div className={styles.visualCard}>
                            <div className={styles.heroGlow} />

                            <div className={styles.heroBadgeTop}>
                                <i className="bi bi-stars" />
                                {heroBadgeTop}
                            </div>
                            <div className={styles.heroBadgeLeft}>
                                <i className="bi bi-code-slash" />
                                {heroBadgeLeft}
                            </div>

                            <div className={styles.heroBadgeBottom}>
                                <i className="bi bi-grid-3x3-gap" />
                                {heroBadgeBottom}
                            </div>

                            <div className={styles.heroBadgeSsl}>
                                <i className="bi bi-shield-check" />
                                {heroBadgeSsl}
                            </div>

                            <div className={styles.heroContent}>
                                <h3>
                                    {heroTitle.split('\n').map((line, index, arr) => (
                                        <span key={index}>
                                            {line}
                                            {index < arr.length - 1 && <br />}
                                        </span>
                                    ))}
                                </h3>

                                <p>{heroDescription}</p>

                                <button type="button">
                                    {heroButtonLabel}
                                    <i className="bi bi-arrow-right" />
                                </button>
                            </div>
                            <div className={styles.trustRow}>
                                <div className={styles.trustItem}>
                                    <i className="bi bi-check-circle-fill" />
                                    No Credit Card
                                </div>

                                <div className={styles.trustItem}>
                                    <i className="bi bi-shield-check" />
                                    Secure Hosting
                                </div>

                                <div className={styles.trustItem}>
                                    <i className="bi bi-lightning-charge-fill" />
                                    Instant Setup
                                </div>
                            </div>

                            <div className={styles.browser}>
                                <div className={styles.browserHeader}>
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                <div className={styles.browserPreview}>
                                    <div />
                                </div>

                                <div className={styles.browserBlocks}>
                                    <div />
                                    <div />
                                </div>
                            </div>
                        </div>

                        <div className={styles.content}>
                            <span className={styles.badge}>{sectionBadge}</span>

                            <h2 className={styles.title}>
                                {sectionTitle}
                                <span>{sectionTitleAccent}</span>
                            </h2>

                            <p className={styles.description}>{sectionDescription}</p>

                            <div className={styles.actionRow}>
                                <button className={styles.primaryButton}>
                                    <i className="bi bi-rocket-takeoff-fill" />
                                    Start Building
                                </button>

                                <button className={styles.secondaryButton}>
                                    <i className="bi bi-play-circle" />
                                    Live Demo
                                </button>
                            </div>

                            <div className={styles.statsGrid}>
                                {stats.map((item) => (
                                    <article key={item.label} className={styles.statCard}>
                                        <div className={`${styles.iconBox} ${styles[item.tone]}`}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <div className={styles.statContent}>
                                            <strong>{item.value}</strong>
                                            <span>{item.label}</span>
                                        </div>

                                        <i className={`bi bi-arrow-up-right ${styles.cardArrow}`} />
                                    </article>
                                ))}
                            </div>

                            <div className={styles.featureStrip}>
                                <div className={styles.featureItem}>
                                    <i className="bi bi-stars" />
                                    AI Assisted Content
                                </div>

                                <div className={styles.featureItem}>
                                    <i className="bi bi-grid-3x3-gap-fill" />
                                    500+ Templates
                                </div>

                                <div className={styles.featureItem}>
                                    <i className="bi bi-cloud-check-fill" />
                                    Cloud Deployment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.solutions}>
                <FeatureSectionHeader
                    eyebrow={eyebrowText1}
                    accent={eyebrowAccentText1}
                    highlight={highlightText1}
                />

                <div className={styles.grid}>
                    {FEATURES_WEBSITE.map((feature) => (
                        <FeatureCard key={feature.title} feature={feature} />
                    ))}
                </div>
            </section>
            <section className={styles.solutions}>
                <FeatureSectionHeader
                    eyebrow={eyebrowText2}
                    accent={eyebrowAccentText2}
                    highlight={highlightText2}
                />
                <div className={styles.grid}>
                    {FEATURES_DEVELOPMENT.map((feature) => (
                        <FeatureCard key={feature.title} feature={feature} />
                    ))}
                </div>
            </section>
        </>
    );
}

function createInspector(): RegItem['inspector'] {
    return [
        {
            key: 'breadcrumbHome',
            label: 'Breadcrumb Home',
            kind: 'text',
        },
        {
            key: 'breadcrumbCurrent',
            label: 'Breadcrumb Current',
            kind: 'text',
        },

        {
            key: 'heroBadgeTop',
            label: 'Hero Badge Top',
            kind: 'text',
        },
        {
            key: 'heroBadgeLeft',
            label: 'Hero Badge Left',
            kind: 'text',
        },
        {
            key: 'heroBadgeBottom',
            label: 'Hero Badge Bottom',
            kind: 'text',
        },
        {
            key: 'heroBadgeSsl',
            label: 'Hero Badge SSL',
            kind: 'text',
        },

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
            key: 'heroButtonLabel',
            label: 'Hero Button',
            kind: 'text',
        },

        {
            key: 'sectionBadge',
            label: 'Section Badge',
            kind: 'text',
        },
        {
            key: 'sectionTitle',
            label: 'Section Title',
            kind: 'text',
        },
        {
            key: 'sectionTitleAccent',
            label: 'Section Title Accent',
            kind: 'text',
        },
        {
            key: 'sectionDescription',
            label: 'Section Description',
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
            key: 'stat4Value',
            label: 'Stat 4 Value',
            kind: 'text',
        },
        {
            key: 'stat4Label',
            label: 'Stat 4 Label',
            kind: 'text',
        },
        {
            key: 'eyebrowText1',
            label: 'Eyebrow Text 1',
            kind: 'text',
        },
        {
            key: 'eyebrowAccentText1',
            label: 'Eyebrow Accent Text 1',
            kind: 'text',
        },
        {
            key: 'highlightText1',
            label: 'Highlight Text 1',
            kind: 'text',
        },

        {
            key: 'eyebrowText2',
            label: 'Eyebrow Text 2',
            kind: 'text',
        },
        {
            key: 'eyebrowAccentText2',
            label: 'Eyebrow Accent Text 2',
            kind: 'text',
        },
        {
            key: 'highlightText2',
            label: 'Highlight Text 2',
            kind: 'text',
        },
        ...Array.from({ length: 11 }, (_, index) => createFeatureInspector(index + 1)).flat(),
    ];
}
export const PROJECT_PAGE_01: RegItem = {
    kind: 'project-page-01',
    label: 'Project Page 01',
    defaults: DEFAULT_PROPS as Record<string, unknown>,
    inspector: createInspector(),
    render: (props) => <ProjectPage01 {...(props as unknown as ProjectPage01Props)} />,
};
export default ProjectPage01;
