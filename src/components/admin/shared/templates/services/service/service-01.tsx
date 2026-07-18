'use client';
import styles from '@/components/admin/shared/templates/services/service/styles/service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import Link from 'next/link';
export interface Service01Props {
    siteId?: string;
    pathName?: string;
    // Getting Started
    introEyebrow?: string;
    introTitle?: string;
    introTitleAccent?: string;
    introDescription?: string;

    // Visual Card
    visualEyebrow?: string;
    visualTitle?: string;
    visualTitleAccent?: string;
    visualDescription?: string;

    brandName?: string;
    brandDescription?: string;

    flow1Title?: string;
    flow1Description?: string;

    flow2Title?: string;
    flow2Description?: string;

    flow3Title?: string;
    flow3Description?: string;

    securityText?: string;
    noCodeText?: string;

    // How It Works
    stepsEyebrow?: string;
    stepsCountText?: string;

    step1Number?: string;
    step1Label?: string;
    step1Title?: string;
    step1Description?: string;

    step2Number?: string;
    step2Label?: string;
    step2Title?: string;
    step2Description?: string;

    step3Number?: string;
    step3Label?: string;
    step3Title?: string;
    step3Description?: string;

    stepsButtonText?: string;

    // Setup Map
    zoomText?: string;

    mapStartTitle?: string;
    mapStartDescription?: string;

    selfSetupTitle?: string;

    selfItem1Title?: string;
    selfItem1Description?: string;

    selfItem2Title?: string;
    selfItem2Description?: string;

    selfItem3Title?: string;
    selfItem3Description?: string;

    serviceSetupTitle?: string;

    serviceItem1Title?: string;
    serviceItem1Description?: string;

    serviceItem2Title?: string;
    serviceItem2Description?: string;

    serviceItem3Title?: string;
    serviceItem3Description?: string;

    readyTitle?: string;
    readyDescription?: string;

    selfMapLabel?: string;
    serviceMapLabel?: string;
    readyMapLabel?: string;

    selfSetupLabel?: string;
    selfSetupCardTitle?: string;
    selfSetupCardTitleAccent?: string;
    selfSetupCardDescription?: string;
    selfSetupPrimaryText?: string;
    selfSetupSecondaryText?: string;
    selfSetupLinkText?: string;
    selfSetupHref?: string;

    serviceSetupLabel?: string;
    serviceSetupCardTitle?: string;
    serviceSetupCardTitleAccent?: string;
    serviceSetupCardDescription?: string;
    serviceSetupPrimaryText?: string;
    serviceSetupSecondaryText?: string;
    serviceSetupLinkText?: string;
    serviceSetupHref?: string;

    templateBadgeText?: string;
    pagesBadgeText?: string;
    menuBadgeText?: string;

    // Features
    featuresTabText?: string;
    builderTabText?: string;
    featuresButtonText?: string;

    feature1Title?: string;
    feature1Description?: string;
    feature1Item1Label?: string;
    feature1Item1Value?: string;
    feature1Item2Label?: string;
    feature1Item2Value?: string;

    feature2Title?: string;
    feature2Description?: string;
    feature2Item1Label?: string;
    feature2Item1Value?: string;
    feature2Item2Label?: string;
    feature2Item2Value?: string;

    feature3Title?: string;
    feature3Description?: string;
    feature3Item1Label?: string;
    feature3Item1Value?: string;
    feature3Item2Label?: string;
    feature3Item2Value?: string;

    feature4Title?: string;
    feature4Description?: string;
    feature4Item1Label?: string;
    feature4Item1Value?: string;
    feature4Item2Label?: string;
    feature4Item2Value?: string;

    // Visual Text
    templateReadyText?: string;

    pageHomeText?: string;
    pageServicesText?: string;
    pageAboutText?: string;
    menuReadyText?: string;

    websiteText?: string;
    liveText?: string;
    domainText?: string;
    domainConnectedText?: string;
}
type SetupItem = {
    icon: string;
    title: string;
    description: string;
};

type SetupNodeProps = {
    title: string;
    icon: string;
    x: number;
    y: number;
    accent?: 'blue' | 'green';
    items: SetupItem[];
};

type SetupStep = {
    number: string;
    label: string;
    title: string;
    description: string;
};

type FeatureItem = {
    label: string;
    value: string;
};

type FeatureCard = {
    icon: string;
    title: string;
    description: string;
    items: FeatureItem[];
    visual: 'builder' | 'templates' | 'pages' | 'publish';
};
type PagesVisualProps = {
    homeText: string;
    servicesText: string;
    aboutText: string;
    menuReadyText: string;
};

type PublishVisualProps = {
    websiteText: string;
    liveText: string;
    domainText: string;
    domainConnectedText: string;
};

type FeatureVisualProps = {
    type: FeatureCard['visual'];

    templateReadyText: string;

    pageHomeText: string;
    pageServicesText: string;
    pageAboutText: string;
    menuReadyText: string;

    websiteText: string;
    liveText: string;
    domainText: string;
    domainConnectedText: string;
};

function SetupNode({ title, icon, x, y, accent = 'blue', items }: SetupNodeProps) {
    return (
        <div
            className={styles.serverNode}
            style={{
                left: x,
                top: y,
            }}
        >
            <div className={styles.nodeHeader}>
                <div className={`${styles.nodeIcon} ${accent === 'green' ? styles.green : ''}`}>
                    <i className={`bi ${icon}`} />
                </div>

                <span>{title}</span>
            </div>

            <div className={styles.nodeItems}>
                {items.map((item) => (
                    <div key={item.title} className={styles.serverItem}>
                        <div className={styles.serverIcon}>
                            <i className={`bi ${item.icon}`} />
                        </div>

                        <div className={styles.serverInfo}>
                            <strong>{item.title}</strong>
                            <span>{item.description}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BuilderVisual() {
    return (
        <div className={styles.builderVisual}>
            <div className={styles.builderWindow}>
                <div className={styles.windowTop}>
                    <span />
                    <span />
                    <span />
                </div>

                <div className={styles.builderBody}>
                    <div className={styles.builderSidebar}>
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className={styles.builderCanvas}>
                        <div className={styles.builderTitle} />

                        <div className={styles.builderText} />

                        <div className={styles.builderButton} />
                    </div>
                </div>
            </div>

            <div className={styles.cursorBadge}>
                <i className="bi bi-cursor-fill" />
            </div>

            <div className={styles.imageBadge}>
                <i className="bi bi-image" />
            </div>

            <div className={styles.textBadge}>
                <i className="bi bi-type" />
            </div>
        </div>
    );
}
function TemplatesVisual({ readyText }: { readyText: string }) {
    return (
        <div className={styles.templatesVisual}>
            <div className={`${styles.templateCard} ${styles.templateBack}`}>
                <span />
                <span />
                <span />
            </div>

            <div className={`${styles.templateCard} ${styles.templateMiddle}`}>
                <span />
                <span />
                <span />
            </div>

            <div className={`${styles.templateCard} ${styles.templateFront}`}>
                <div className={styles.templateHero} />

                <div className={styles.templateLines}>
                    <span />
                    <span />
                </div>

                <div className={styles.templateColumns}>
                    <span />
                    <span />
                    <span />
                </div>
            </div>

            <div className={styles.templateCount}>
                <i className="bi bi-grid-fill" />
                {readyText}
            </div>
        </div>
    );
}
function PagesVisual({ homeText, servicesText, aboutText, menuReadyText }: PagesVisualProps) {
    return (
        <div className={styles.pagesVisual}>
            <div className={styles.pageWindow}>
                <div className={styles.pageTop}>
                    <span />

                    <div>
                        <i className="bi bi-dash" />
                        <i className="bi bi-square" />
                    </div>
                </div>

                <div className={styles.pageContent}>
                    <div className={styles.pageSidebar}>
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className={styles.pageList}>
                        <div>
                            <i className="bi bi-house-door-fill" />
                            {homeText}
                        </div>

                        <div>
                            <i className="bi bi-window" />
                            {servicesText}
                        </div>

                        <div>
                            <i className="bi bi-file-earmark" />
                            {aboutText}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.menuBadge}>
                <i className="bi bi-list" />
                {menuReadyText}
            </div>
        </div>
    );
}

function PublishVisual({
    websiteText,
    liveText,
    domainText,
    domainConnectedText,
}: PublishVisualProps) {
    return (
        <div className={styles.publishVisual}>
            <div className={styles.publishWindow}>
                <div className={styles.publishHeader}>
                    <span>{websiteText}</span>

                    <div className={styles.liveBadge}>
                        <span />
                        {liveText}
                    </div>
                </div>

                <div className={styles.domainRow}>
                    <div className={styles.domainIcon}>
                        <i className="bi bi-globe2" />
                    </div>

                    <div>
                        <strong>{domainText}</strong>
                        <span>{domainConnectedText}</span>
                    </div>
                </div>

                <div className={styles.publishProgress}>
                    <span />
                </div>
            </div>

            <div className={styles.publishBadge}>
                <i className="bi bi-check2" />
            </div>

            <div className={styles.chartBadge}>
                <i className="bi bi-bar-chart-fill" />
            </div>
        </div>
    );
}
function FeatureVisual({
    type,
    templateReadyText,
    pageHomeText,
    pageServicesText,
    pageAboutText,
    menuReadyText,
    websiteText,
    liveText,
    domainText,
    domainConnectedText,
}: FeatureVisualProps) {
    if (type === 'builder') {
        return <BuilderVisual />;
    }

    if (type === 'templates') {
        return <TemplatesVisual readyText={templateReadyText} />;
    }

    if (type === 'pages') {
        return (
            <PagesVisual
                homeText={pageHomeText}
                servicesText={pageServicesText}
                aboutText={pageAboutText}
                menuReadyText={menuReadyText}
            />
        );
    }

    return (
        <PublishVisual
            websiteText={websiteText}
            liveText={liveText}
            domainText={domainText}
            domainConnectedText={domainConnectedText}
        />
    );
}
export function Service01({
    pathName = 'Service',

    visualEyebrow = 'WEBSITE BUILDER',
    visualTitle = 'Build your website.',
    visualTitleAccent = 'We make starting simple.',
    visualDescription = 'Ready-made templates, guided setup, and everything you need to launch.',

    brandName = 'Kbuilder',
    brandDescription = 'Website Builder',

    flow1Title = 'Self-Guided',
    flow1Description = 'Build with guidance',

    flow2Title = 'Setup Service',
    flow2Description = 'We prepare it for you',

    flow3Title = 'Edit & Publish',
    flow3Description = 'Customize and go live',

    securityText = 'Free security setup',
    noCodeText = 'No coding required',

    stepsEyebrow = 'HOW IT WORKS',
    stepsCountText = '03 STEPS',

    step1Number = '01',
    step1Label = 'Self-Guided Setup',
    step1Title = 'Build with our guided website builder',
    step1Description = 'Connect your domain, receive your account, and customize your website using ready-made templates.',

    step2Number = '02',
    step2Label = 'Setup Service',
    step2Title = 'Let us prepare your website for you',
    step2Description = 'We prepare your initial template, pages, and navigation so you can start editing right away.',

    step3Number = '03',
    step3Label = 'Ready to Customize',
    step3Title = 'Edit your content and publish',
    step3Description = 'Update text, images, pages, and menus with our visual builder — no coding required.',

    stepsButtonText = 'Explore how Kbuilder works',

    zoomText = '100%',

    mapStartTitle = 'Choose how to start',
    mapStartDescription = 'Pick the setup option that works for you',

    selfSetupTitle = 'Build It Yourself',

    selfItem1Title = 'Connect Your Domain',
    selfItem1Description = 'Provide the domain details needed for setup',

    selfItem2Title = 'Free Security Setup',
    selfItem2Description = 'We configure SSL and website security for free',

    selfItem3Title = 'Receive Your Account',
    selfItem3Description = 'Get access and follow our setup guide',

    serviceSetupTitle = 'Done-for-You Setup',

    serviceItem1Title = 'Template Ready',
    serviceItem1Description = 'A website template is added for you',

    serviceItem2Title = 'Pages Created',
    serviceItem2Description = 'Essential website pages are prepared',

    serviceItem3Title = 'Menu Configured',
    serviceItem3Description = 'Navigation structure is ready to use',

    readyTitle = 'Ready to Edit',
    readyDescription = 'Customize your content and publish',

    selfMapLabel = 'Self Setup',
    serviceMapLabel = 'Setup Service',
    readyMapLabel = 'Ready to customize',

    selfSetupLabel = 'SELF-GUIDED SETUP',
    selfSetupCardTitle = 'Build your website',
    selfSetupCardTitleAccent = 'with our guided editor',
    selfSetupCardDescription = 'Connect your domain, receive your account and customize a ready-made website with step-by-step guidance.',
    selfSetupPrimaryText = 'Start Building',
    selfSetupSecondaryText = 'How it works',
    selfSetupLinkText = 'Explore features',
    selfSetupHref = '#features',

    serviceSetupLabel = 'SETUP SERVICE',
    serviceSetupCardTitle = 'Let us prepare your',
    serviceSetupCardTitleAccent = 'website for you',
    serviceSetupCardDescription = 'We prepare your template, pages and navigation so you can start editing your content right away.',
    serviceSetupPrimaryText = 'Get Setup Help',
    serviceSetupSecondaryText = 'View process',
    serviceSetupLinkText = 'Learn more',
    serviceSetupHref = '#features',

    templateBadgeText = 'Template',
    pagesBadgeText = 'Pages',
    menuBadgeText = 'Menu',

    featuresTabText = 'Features',
    builderTabText = 'Website Builder',
    featuresButtonText = 'Explore all features',

    feature1Title = 'Visual Builder',
    feature1Description = 'Edit your website visually without writing code.',
    feature1Item1Label = 'Edit',
    feature1Item1Value = 'Text, images and sections',
    feature1Item2Label = 'Build',
    feature1Item2Value = 'Drag and customize content',

    feature2Title = 'Ready Templates',
    feature2Description = 'Start faster with professionally prepared layouts.',
    feature2Item1Label = 'Templates',
    feature2Item1Value = 'Ready-made website designs',
    feature2Item2Label = 'Sections',
    feature2Item2Value = 'Reusable content blocks',

    feature3Title = 'Pages & Navigation',
    feature3Description = 'Manage your website structure from one place.',
    feature3Item1Label = 'Pages',
    feature3Item1Value = 'Create and organize pages',
    feature3Item2Label = 'Menu',
    feature3Item2Value = 'Configure website navigation',

    feature4Title = 'Publish & Manage',
    feature4Description = 'Launch your website and keep everything updated.',
    feature4Item1Label = 'Domain',
    feature4Item1Value = 'Connect your own domain',
    feature4Item2Label = 'Publish',
    feature4Item2Value = 'Update your website anytime',

    templateReadyText = 'Ready to use',

    pageHomeText = 'Home',
    pageServicesText = 'Services',
    pageAboutText = 'About',
    menuReadyText = 'Menu ready',

    websiteText = 'Website',
    liveText = 'Live',
    domainText = 'yourdomain.com',
    domainConnectedText = 'Domain connected',
}: Service01Props) {
    const setupSteps: SetupStep[] = [
        {
            number: step1Number,
            label: step1Label,
            title: step1Title,
            description: step1Description,
        },
        {
            number: step2Number,
            label: step2Label,
            title: step2Title,
            description: step2Description,
        },
        {
            number: step3Number,
            label: step3Label,
            title: step3Title,
            description: step3Description,
        },
    ];

    const features: FeatureCard[] = [
        {
            icon: 'bi-cursor-fill',
            title: feature1Title,
            description: feature1Description,
            visual: 'builder',
            items: [
                {
                    label: feature1Item1Label,
                    value: feature1Item1Value,
                },
                {
                    label: feature1Item2Label,
                    value: feature1Item2Value,
                },
            ],
        },
        {
            icon: 'bi-grid-1x2-fill',
            title: feature2Title,
            description: feature2Description,
            visual: 'templates',
            items: [
                {
                    label: feature2Item1Label,
                    value: feature2Item1Value,
                },
                {
                    label: feature2Item2Label,
                    value: feature2Item2Value,
                },
            ],
        },
        {
            icon: 'bi-window-stack',
            title: feature3Title,
            description: feature3Description,
            visual: 'pages',
            items: [
                {
                    label: feature3Item1Label,
                    value: feature3Item1Value,
                },
                {
                    label: feature3Item2Label,
                    value: feature3Item2Value,
                },
            ],
        },
        {
            icon: 'bi-rocket-takeoff-fill',
            title: feature4Title,
            description: feature4Description,
            visual: 'publish',
            items: [
                {
                    label: feature4Item1Label,
                    value: feature4Item1Value,
                },
                {
                    label: feature4Item2Label,
                    value: feature4Item2Value,
                },
            ],
        },
    ];
    return (
        <>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.headingSection}>
                        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                            <Link href="/" className={styles.breadcrumbItem}>
                                Home
                            </Link>
                            <i className="bi bi-chevron-right" />
                            <span className={styles.breadcrumbCurrent}>{pathName}</span>
                        </nav>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.visualCard}>
                            <div className={styles.visualGlow} />

                            <div className={styles.visualContent}>
                                <span className={styles.visualEyebrow}>{visualEyebrow}</span>

                                <h3 className={styles.visualTitle}>
                                    {visualTitle}
                                    <br />
                                    <span>{visualTitleAccent}</span>
                                </h3>

                                <p className={styles.visualDescription}>{visualDescription}</p>
                            </div>

                            <div className={styles.flow}>
                                <div className={styles.brandNode}>
                                    <div className={styles.brandIcon}>
                                        <i className="bi bi-grid-fill" />
                                    </div>

                                    <div>
                                        <strong>{brandName}</strong>
                                        <span>{brandDescription}</span>
                                    </div>
                                </div>

                                <svg
                                    className={styles.flowLines}
                                    viewBox="0 0 260 170"
                                    preserveAspectRatio="none"
                                >
                                    <path d="M20 85 C90 85 95 25 180 25" />
                                    <path d="M20 85 C90 85 95 85 180 85" />
                                    <path d="M20 85 C90 85 95 145 180 145" />
                                </svg>

                                <div className={`${styles.flowNode} ${styles.flowNodeOne}`}>
                                    <span className={styles.flowDot} />

                                    <div>
                                        <strong>{flow1Title}</strong>
                                        <span>{flow1Description}</span>
                                    </div>
                                </div>

                                <div className={`${styles.flowNode} ${styles.flowNodeTwo}`}>
                                    <span className={styles.flowDot} />

                                    <div>
                                        <strong>{flow2Title}</strong>
                                        <span>{flow2Description}</span>
                                    </div>
                                </div>

                                <div className={`${styles.flowNode} ${styles.flowNodeThree}`}>
                                    <span className={styles.flowDot} />

                                    <div>
                                        <strong>{flow3Title}</strong>
                                        <span>{flow3Description}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <span>
                                    <i className="bi bi-shield-check" />
                                    {securityText}
                                </span>

                                <span>
                                    <i className="bi bi-code-slash" />
                                    {noCodeText}
                                </span>
                            </div>
                        </div>

                        <div className={styles.steps}>
                            <div className={styles.stepsHeader}>
                                <span>{stepsEyebrow}</span>
                                <span>{stepsCountText}</span>
                            </div>

                            {setupSteps.map((step) => (
                                <article key={step.number} className={styles.step}>
                                    <div className={styles.stepMeta}>
                                        <span className={styles.stepNumber}>{step.number}</span>

                                        <span className={styles.stepLabel}>{step.label}</span>
                                    </div>

                                    <h3>{step.title}</h3>

                                    <p>{step.description}</p>

                                    <div className={styles.stepArrow}>
                                        <i className="bi bi-arrow-up-right" />
                                    </div>
                                </article>
                            ))}

                            <button type="button" className={styles.viewButton}>
                                {stepsButtonText}
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.map}>
                    <div className={styles.zoomPanel}>
                        <div className={styles.zoomPreview}>
                            <div />
                            <div />
                            <div />
                            <div />
                        </div>

                        <div className={styles.zoomControl}>
                            <button type="button">−</button>
                            <strong>{zoomText}</strong>
                            <button type="button">+</button>
                        </div>
                    </div>

                    <div className={styles.canvas}>
                        <svg
                            className={styles.connections}
                            viewBox="0 0 1400 560"
                            preserveAspectRatio="none"
                        >
                            {/* Kbuilder → Choose setup */}
                            <path d="M700 78 L700 125" className={styles.greenLine} />

                            {/* Choose setup → Self setup */}
                            <path
                                d="M575 157 C480 157 500 255 420 255"
                                className={styles.blueLine}
                            />

                            {/* Choose setup → Done for you */}
                            <path
                                d="M825 157 C920 157 900 255 1000 255"
                                className={styles.pinkLine}
                            />

                            {/* Self setup → Ready */}
                            <path
                                d="M420 400 C420 470 500 480 590 480"
                                className={styles.blueLine}
                            />

                            {/* Done for you → Ready */}
                            <path
                                d="M1000 400 C1000 470 900 480 810 480"
                                className={styles.pinkLine}
                            />
                        </svg>

                        {/* Kbuilder */}
                        <div className={styles.securityNode}>
                            <i className="bi bi-grid-fill" />
                        </div>

                        {/* Choose setup */}
                        <div className={styles.mainNode}>
                            <div className={styles.mainNodeIcon}>
                                <i className="bi bi-signpost-split-fill" />
                            </div>

                            <div className={styles.nodeContent}>
                                <strong>{mapStartTitle}</strong>
                                <span>{mapStartDescription}</span>
                            </div>
                        </div>

                        <SetupNode
                            title={selfSetupTitle}
                            icon="bi-person-fill-gear"
                            x={180}
                            y={210}
                            accent="blue"
                            items={[
                                {
                                    icon: 'bi-globe2',
                                    title: selfItem1Title,
                                    description: selfItem1Description,
                                },
                                {
                                    icon: 'bi-shield-check',
                                    title: selfItem2Title,
                                    description: selfItem2Description,
                                },
                                {
                                    icon: 'bi-person-check-fill',
                                    title: selfItem3Title,
                                    description: selfItem3Description,
                                },
                            ]}
                        />

                        <SetupNode
                            title={serviceSetupTitle}
                            icon="bi-stars"
                            x={1000}
                            y={210}
                            accent="green"
                            items={[
                                {
                                    icon: 'bi-window-stack',
                                    title: serviceItem1Title,
                                    description: serviceItem1Description,
                                },
                                {
                                    icon: 'bi-file-earmark-text',
                                    title: serviceItem2Title,
                                    description: serviceItem2Description,
                                },
                                {
                                    icon: 'bi-list',
                                    title: serviceItem3Title,
                                    description: serviceItem3Description,
                                },
                            ]}
                        />

                        {/* Ready */}
                        <div className={styles.awsNode}>
                            <i className="bi bi-pencil-square" />

                            <div className={styles.nodeContent}>
                                <strong>{readyTitle}</strong>
                                <span>{readyDescription}</span>
                            </div>
                        </div>

                        <div className={styles.selfLabel}>{selfMapLabel}</div>

                        <div className={styles.serviceLabel}>{serviceMapLabel}</div>

                        <div className={styles.readyLabel}>{readyMapLabel}</div>
                    </div>
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.quickSection}>
                        <div className={styles.setupGrid}>
                            <article className={`${styles.setupCard} ${styles.selfSetup}`}>
                                <div className={styles.setupContent}>
                                    <span className={styles.setupLabel}>{selfSetupLabel}</span>

                                    <h3>
                                        {selfSetupCardTitle}
                                        <br />
                                        {selfSetupCardTitleAccent}
                                    </h3>

                                    <p>{selfSetupCardDescription}</p>

                                    <div className={styles.setupActions}>
                                        <button type="button">{selfSetupPrimaryText}</button>

                                        <button type="button" className={styles.secondaryButton}>
                                            {selfSetupSecondaryText}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.selfVisual}>
                                    <div className={styles.orbit}>
                                        <div className={styles.orbitRingOne} />
                                        <div className={styles.orbitRingTwo} />

                                        <div className={styles.centerLogo}>
                                            <i className="bi bi-grid-fill" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeOne}`}
                                        >
                                            <i className="bi bi-globe2" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeTwo}`}
                                        >
                                            <i className="bi bi-shield-check" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeThree}`}
                                        >
                                            <i className="bi bi-pencil-square" />
                                        </div>

                                        <div
                                            className={`${styles.orbitNode} ${styles.orbitNodeFour}`}
                                        >
                                            <i className="bi bi-rocket-takeoff" />
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <article className={`${styles.setupCard} ${styles.setupService}`}>
                                <div className={styles.setupContent}>
                                    <span className={styles.setupLabel}>{serviceSetupLabel}</span>

                                    <h3>
                                        {serviceSetupCardTitle}
                                        <br />
                                        {serviceSetupCardTitleAccent}
                                    </h3>

                                    <p>{serviceSetupCardDescription}</p>

                                    <div className={styles.setupActions}>
                                        <button type="button">{serviceSetupPrimaryText}</button>

                                        <button type="button" className={styles.secondaryButton}>
                                            {serviceSetupSecondaryText}
                                        </button>

                                        <a href={serviceSetupHref}>
                                            {serviceSetupLinkText}
                                            <i className="bi bi-arrow-up-right" />
                                        </a>
                                    </div>
                                </div>

                                <div className={styles.serviceVisual}>
                                    <div className={styles.serviceWindow}>
                                        <div className={styles.serviceTop}>
                                            <span />
                                            <span />
                                            <span />
                                        </div>

                                        <div className={styles.serviceBody}>
                                            <div className={styles.serviceSidebar}>
                                                <span />
                                                <span />
                                                <span />
                                            </div>

                                            <div className={styles.serviceCanvas}>
                                                <div className={styles.serviceHero} />

                                                <div className={styles.serviceBlocks}>
                                                    <span />
                                                    <span />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.serviceBadge} ${styles.serviceBadgeOne}`}
                                    >
                                        <i className="bi bi-grid-1x2-fill" />
                                        {templateBadgeText}
                                    </div>

                                    <div
                                        className={`${styles.serviceBadge} ${styles.serviceBadgeTwo}`}
                                    >
                                        <i className="bi bi-file-earmark" />
                                        {pagesBadgeText}
                                    </div>

                                    <div
                                        className={`${styles.serviceBadge} ${styles.serviceBadgeThree}`}
                                    >
                                        <i className="bi bi-list" />
                                        {menuBadgeText}
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>

                    <div id="features" className={styles.featuresSection}>
                        <div className={styles.featuresHeader}>
                            <div className={styles.featureTabs}>
                                <span className={styles.activeTab}>{featuresTabText}</span>

                                <span>{builderTabText}</span>
                            </div>

                            <button type="button">
                                {featuresButtonText}
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>

                        <div className={styles.featureGrid}>
                            {features.map((feature) => (
                                <article key={feature.title} className={styles.featureCard}>
                                    <div className={styles.featureVisual}>
                                        <FeatureVisual
                                            type={feature.visual}
                                            templateReadyText={templateReadyText}
                                            pageHomeText={pageHomeText}
                                            pageServicesText={pageServicesText}
                                            pageAboutText={pageAboutText}
                                            menuReadyText={menuReadyText}
                                            websiteText={websiteText}
                                            liveText={liveText}
                                            domainText={domainText}
                                            domainConnectedText={domainConnectedText}
                                        />
                                    </div>

                                    <div className={styles.featureContent}>
                                        <div className={styles.featureTitleRow}>
                                            <div className={styles.featureIcon}>
                                                <i className={`bi ${feature.icon}`} />
                                            </div>

                                            <h3>{feature.title}</h3>
                                        </div>

                                        <p>{feature.description}</p>

                                        <div className={styles.featureItems}>
                                            {feature.items.map((item) => (
                                                <div key={item.label}>
                                                    <strong>{item.label}</strong>

                                                    <span>{item.value}</span>

                                                    <i className="bi bi-arrow-up-right" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

const textField = (key: string, label: string): RegItem['inspector'][number] => ({
    key,
    label,
    kind: 'text',
});

const textareaField = (key: string, label: string): RegItem['inspector'][number] => ({
    key,
    label,
    kind: 'textarea',
});

export const SERVICE_01: RegItem = {
    kind: 'Service01',

    label: 'Service 01',

    defaults: {
        pathName: 'Service',
        introEyebrow: 'GETTING STARTED',
        introTitle: 'Start Your Website',
        introTitleAccent: 'Your Way',
        introDescription:
            'Choose how you want to get started. Build with our guided editor or let us prepare the initial website structure for you.',

        visualEyebrow: 'WEBSITE BUILDER',
        visualTitle: 'Build your website.',
        visualTitleAccent: 'We make starting simple.',
        visualDescription: 'Ready-made templates, guided setup, and everything you need to launch.',

        brandName: 'Kbuilder',
        brandDescription: 'Website Builder',

        flow1Title: 'Self-Guided',
        flow1Description: 'Build with guidance',
        flow2Title: 'Setup Service',
        flow2Description: 'We prepare it for you',
        flow3Title: 'Edit & Publish',
        flow3Description: 'Customize and go live',

        securityText: 'Free security setup',
        noCodeText: 'No coding required',

        stepsEyebrow: 'HOW IT WORKS',
        stepsCountText: '03 STEPS',

        step1Number: '01',
        step1Label: 'Self-Guided Setup',
        step1Title: 'Build with our guided website builder',
        step1Description:
            'Connect your domain, receive your account, and customize your website using ready-made templates.',

        step2Number: '02',
        step2Label: 'Setup Service',
        step2Title: 'Let us prepare your website for you',
        step2Description:
            'We prepare your initial template, pages, and navigation so you can start editing right away.',

        step3Number: '03',
        step3Label: 'Ready to Customize',
        step3Title: 'Edit your content and publish',
        step3Description:
            'Update text, images, pages, and menus with our visual builder — no coding required.',

        stepsButtonText: 'Explore how Kbuilder works',

        zoomText: '100%',

        mapStartTitle: 'Choose how to start',
        mapStartDescription: 'Pick the setup option that works for you',

        selfSetupTitle: 'Build It Yourself',

        selfItem1Title: 'Connect Your Domain',
        selfItem1Description: 'Provide the domain details needed for setup',
        selfItem2Title: 'Free Security Setup',
        selfItem2Description: 'We configure SSL and website security for free',
        selfItem3Title: 'Receive Your Account',
        selfItem3Description: 'Get access and follow our setup guide',

        serviceSetupTitle: 'Done-for-You Setup',

        serviceItem1Title: 'Template Ready',
        serviceItem1Description: 'A website template is added for you',
        serviceItem2Title: 'Pages Created',
        serviceItem2Description: 'Essential website pages are prepared',
        serviceItem3Title: 'Menu Configured',
        serviceItem3Description: 'Navigation structure is ready to use',

        readyTitle: 'Ready to Edit',
        readyDescription: 'Customize your content and publish',

        selfMapLabel: 'Self Setup',
        serviceMapLabel: 'Setup Service',
        readyMapLabel: 'Ready to customize',
        setupNote: 'Two simple ways to launch your website',

        selfSetupLabel: 'SELF-GUIDED SETUP',
        selfSetupCardTitle: 'Build your website',
        selfSetupCardTitleAccent: 'with our guided editor',
        selfSetupCardDescription:
            'Connect your domain, receive your account and customize a ready-made website with step-by-step guidance.',
        selfSetupPrimaryText: 'Start Building',
        selfSetupSecondaryText: 'How it works',
        selfSetupLinkText: 'Explore features',
        selfSetupHref: '#features',

        serviceSetupLabel: 'SETUP SERVICE',
        serviceSetupCardTitle: 'Let us prepare your',
        serviceSetupCardTitleAccent: 'website for you',
        serviceSetupCardDescription:
            'We prepare your template, pages and navigation so you can start editing your content right away.',
        serviceSetupPrimaryText: 'Get Setup Help',
        serviceSetupSecondaryText: 'View process',
        serviceSetupLinkText: 'Learn more',
        serviceSetupHref: '#features',

        templateBadgeText: 'Template',
        pagesBadgeText: 'Pages',
        menuBadgeText: 'Menu',

        featuresTabText: 'Features',
        builderTabText: 'Website Builder',
        featuresButtonText: 'Explore all features',

        feature1Title: 'Visual Builder',
        feature1Description: 'Edit your website visually without writing code.',
        feature1Item1Label: 'Edit',
        feature1Item1Value: 'Text, images and sections',
        feature1Item2Label: 'Build',
        feature1Item2Value: 'Drag and customize content',

        feature2Title: 'Ready Templates',
        feature2Description: 'Start faster with professionally prepared layouts.',
        feature2Item1Label: 'Templates',
        feature2Item1Value: 'Ready-made website designs',
        feature2Item2Label: 'Sections',
        feature2Item2Value: 'Reusable content blocks',

        feature3Title: 'Pages & Navigation',
        feature3Description: 'Manage your website structure from one place.',
        feature3Item1Label: 'Pages',
        feature3Item1Value: 'Create and organize pages',
        feature3Item2Label: 'Menu',
        feature3Item2Value: 'Configure website navigation',

        feature4Title: 'Publish & Manage',
        feature4Description: 'Launch your website and keep everything updated.',
        feature4Item1Label: 'Domain',
        feature4Item1Value: 'Connect your own domain',
        feature4Item2Label: 'Publish',
        feature4Item2Value: 'Update your website anytime',

        templateReadyText: 'Ready to use',

        pageHomeText: 'Home',
        pageServicesText: 'Services',
        pageAboutText: 'About',
        menuReadyText: 'Menu ready',

        websiteText: 'Website',
        liveText: 'Live',
        domainText: 'yourdomain.com',
        domainConnectedText: 'Domain connected',
    },
    inspector: [
        textField('introEyebrow', 'Intro Eyebrow'),
        textField('introTitle', 'Intro Title'),
        textField('introTitleAccent', 'Intro Title Accent'),
        textareaField('introDescription', 'Intro Description'),

        textField('visualEyebrow', 'Visual Eyebrow'),
        textField('visualTitle', 'Visual Title'),
        textField('visualTitleAccent', 'Visual Title Accent'),
        textareaField('visualDescription', 'Visual Description'),

        textField('brandName', 'Brand Name'),
        textField('brandDescription', 'Brand Description'),

        textField('flow1Title', 'Flow 1 Title'),
        textField('flow1Description', 'Flow 1 Description'),
        textField('flow2Title', 'Flow 2 Title'),
        textField('flow2Description', 'Flow 2 Description'),
        textField('flow3Title', 'Flow 3 Title'),
        textField('flow3Description', 'Flow 3 Description'),

        textField('securityText', 'Security Text'),
        textField('noCodeText', 'No Code Text'),

        textField('stepsEyebrow', 'Steps Eyebrow'),
        textField('stepsCountText', 'Steps Count Text'),

        textField('step1Number', 'Step 1 Number'),
        textField('step1Label', 'Step 1 Label'),
        textField('step1Title', 'Step 1 Title'),
        textareaField('step1Description', 'Step 1 Description'),

        textField('step2Number', 'Step 2 Number'),
        textField('step2Label', 'Step 2 Label'),
        textField('step2Title', 'Step 2 Title'),
        textareaField('step2Description', 'Step 2 Description'),

        textField('step3Number', 'Step 3 Number'),
        textField('step3Label', 'Step 3 Label'),
        textField('step3Title', 'Step 3 Title'),
        textareaField('step3Description', 'Step 3 Description'),

        textField('stepsButtonText', 'Steps Button Text'),

        textField('zoomText', 'Zoom Text'),

        textField('mapStartTitle', 'Map Start Title'),
        textareaField('mapStartDescription', 'Map Start Description'),

        textField('selfSetupTitle', 'Self Setup Title'),

        textField('selfItem1Title', 'Self Item 1 Title'),
        textareaField('selfItem1Description', 'Self Item 1 Description'),
        textField('selfItem2Title', 'Self Item 2 Title'),
        textareaField('selfItem2Description', 'Self Item 2 Description'),
        textField('selfItem3Title', 'Self Item 3 Title'),
        textareaField('selfItem3Description', 'Self Item 3 Description'),

        textField('serviceSetupTitle', 'Service Setup Title'),

        textField('serviceItem1Title', 'Service Item 1 Title'),
        textareaField('serviceItem1Description', 'Service Item 1 Description'),
        textField('serviceItem2Title', 'Service Item 2 Title'),
        textareaField('serviceItem2Description', 'Service Item 2 Description'),
        textField('serviceItem3Title', 'Service Item 3 Title'),
        textareaField('serviceItem3Description', 'Service Item 3 Description'),

        textField('readyTitle', 'Ready Title'),
        textareaField('readyDescription', 'Ready Description'),

        textField('selfMapLabel', 'Self Map Label'),
        textField('serviceMapLabel', 'Service Map Label'),
        textField('readyMapLabel', 'Ready Map Label'),

        textField('selfSetupLabel', 'Self Setup Label'),
        textField('selfSetupCardTitle', 'Self Setup Card Title'),
        textField('selfSetupCardTitleAccent', 'Self Setup Card Title Accent'),
        textareaField('selfSetupCardDescription', 'Self Setup Card Description'),
        textField('selfSetupPrimaryText', 'Self Setup Primary Button'),
        textField('selfSetupSecondaryText', 'Self Setup Secondary Button'),
        textField('selfSetupLinkText', 'Self Setup Link Text'),
        textField('selfSetupHref', 'Self Setup Link'),

        textField('serviceSetupLabel', 'Service Setup Label'),
        textField('serviceSetupCardTitle', 'Service Setup Card Title'),
        textField('serviceSetupCardTitleAccent', 'Service Setup Card Title Accent'),
        textareaField('serviceSetupCardDescription', 'Service Setup Card Description'),
        textField('serviceSetupPrimaryText', 'Service Setup Primary Button'),
        textField('serviceSetupSecondaryText', 'Service Setup Secondary Button'),
        textField('serviceSetupLinkText', 'Service Setup Link Text'),
        textField('serviceSetupHref', 'Service Setup Link'),

        textField('templateBadgeText', 'Template Badge Text'),
        textField('pagesBadgeText', 'Pages Badge Text'),
        textField('menuBadgeText', 'Menu Badge Text'),

        textField('featuresTabText', 'Features Tab Text'),
        textField('builderTabText', 'Builder Tab Text'),
        textField('featuresButtonText', 'Features Button Text'),

        textField('feature1Title', 'Feature 1 Title'),
        textareaField('feature1Description', 'Feature 1 Description'),
        textField('feature1Item1Label', 'Feature 1 Item 1 Label'),
        textField('feature1Item1Value', 'Feature 1 Item 1 Value'),
        textField('feature1Item2Label', 'Feature 1 Item 2 Label'),
        textField('feature1Item2Value', 'Feature 1 Item 2 Value'),

        textField('feature2Title', 'Feature 2 Title'),
        textareaField('feature2Description', 'Feature 2 Description'),
        textField('feature2Item1Label', 'Feature 2 Item 1 Label'),
        textField('feature2Item1Value', 'Feature 2 Item 1 Value'),
        textField('feature2Item2Label', 'Feature 2 Item 2 Label'),
        textField('feature2Item2Value', 'Feature 2 Item 2 Value'),

        textField('feature3Title', 'Feature 3 Title'),
        textareaField('feature3Description', 'Feature 3 Description'),
        textField('feature3Item1Label', 'Feature 3 Item 1 Label'),
        textField('feature3Item1Value', 'Feature 3 Item 1 Value'),
        textField('feature3Item2Label', 'Feature 3 Item 2 Label'),
        textField('feature3Item2Value', 'Feature 3 Item 2 Value'),

        textField('feature4Title', 'Feature 4 Title'),
        textareaField('feature4Description', 'Feature 4 Description'),
        textField('feature4Item1Label', 'Feature 4 Item 1 Label'),
        textField('feature4Item1Value', 'Feature 4 Item 1 Value'),
        textField('feature4Item2Label', 'Feature 4 Item 2 Label'),
        textField('feature4Item2Value', 'Feature 4 Item 2 Value'),

        textField('templateReadyText', 'Template Ready Text'),

        textField('pageHomeText', 'Page Home Text'),
        textField('pageServicesText', 'Page Services Text'),
        textField('pageAboutText', 'Page About Text'),
        textField('menuReadyText', 'Menu Ready Text'),

        textField('websiteText', 'Website Text'),
        textField('liveText', 'Live Text'),
        textField('domainText', 'Domain Text'),
        textField('domainConnectedText', 'Domain Connected Text'),
    ],

    render: (props) => <Service01 {...(props as unknown as Service01Props)} />,
};
export default Service01;
