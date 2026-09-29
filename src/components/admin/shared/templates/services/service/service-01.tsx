'use client';

import styles from '@/components/admin/shared/templates/services/service/styles/service-01.module.css';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    DEFAULT_PROPS,
    type Service01Props,
    type FeatureCard,
} from '@/components/admin/shared/templates/services/service/types/service-01';

type SetupStep = {
    number: LocalizedText;
    label: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
};

function createFeatureCard(
    index: 1 | 2 | 3 | 4,
    icon: string,
    visual: FeatureCard['visual'],
    props: Required<Service01Props>,
): FeatureCard {
    return {
        icon,
        visual,
        image: `/assets/images/feature-0${index}.png`,
        title: props[`feature${index}Title`],
        description: props[`feature${index}Description`],

        items: [
            {
                label: props[`feature${index}Item1Label`],
                value: props[`feature${index}Item1Value`],
            },
            {
                label: props[`feature${index}Item2Label`],
                value: props[`feature${index}Item2Value`],
            },
        ],
    };
}
export function Service01(props: Service01Props) {
    const mergedProps: Required<Service01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        visualEyebrow,
        visualTitle,
        visualTitleAccent,
        visualDescription,
        securityText,
        noCodeText,
        step1Number,
        step1Label,
        step1Title,
        step1Description,
        step2Number,
        step2Label,
        step2Title,
        step2Description,
        step3Number,
        step3Label,
        step3Title,
        step3Description,
        featuresTabText,
        builderTabText,
        featuresButtonText,
        browserPreviewImage,
        mobilePreviewImage,
        heroPrimaryText,
        heroSecondaryText,
        heroLaunchText,
        feature1Title,
        feature1Description,
        feature2Title,
        feature2Description,
        feature3Title,
        feature3Description,
        feature4Title,
        feature4Description,
        workflowEyebrow,
        workflowTitle,
        workflowTitleAccent,
        workflowDescription,
        workflowDomain,
        workflowNoteLine1,
        workflowNoteLine2,
        launchAnnotationLine1,
        launchAnnotationLine2,
        launchImageAlt,
        launchAnnotationIdea,
        launchAnnotationResult,
        launchEyebrow,
        launchTitle,
        launchTitleAccent,
        launchDescription,
        featuresEyebrow,
        featuresAnnotationLine1,
        featuresAnnotationLine2,
        stepButtonStart,
        stepButtonDetails,
        stepButtonExplore,
        heroBrowserAlt,
        heroAnnotation,
        heroMobileAlt,
    } = mergedProps;

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
        createFeatureCard(1, 'bi-grid-fill', 'builder', mergedProps),
        createFeatureCard(2, 'bi-image', 'templates', mergedProps),
        createFeatureCard(3, 'bi-file-earmark-text', 'pages', mergedProps),
        createFeatureCard(4, 'bi-rocket-takeoff-fill', 'publish', mergedProps),
    ];

    const workflowItems = [
        {
            icon: 'bi-person-fill',
            title: t(mergedProps.selfSetupTitle),
            description: t(step1Title),
            accent: 'blue',
        },
        {
            icon: 'bi-link-45deg',
            title: t(mergedProps.selfItem1Title),
            description: t(mergedProps.selfItem1Description),
            accent: 'blue',
        },
        {
            icon: 'bi-gear-fill',
            title: t(mergedProps.serviceItem2Title),
            description: t(mergedProps.serviceItem2Description),
            accent: 'purple',
        },
        {
            icon: 'bi-pencil-fill',
            title: t(mergedProps.readyTitle),
            description: t(mergedProps.readyDescription),
            accent: 'purple',
        },
        {
            icon: 'bi-rocket-takeoff-fill',
            title: t(mergedProps.serviceItem3Title),
            description: t(mergedProps.serviceItem3Description),
            accent: 'green',
        },
    ];

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <section id="overview" className={styles.hero}>
                    <div className={styles.heroCopy}>
                        <span className={styles.heroEyebrow}>
                            <i className="bi bi-lightning-charge-fill" />
                            {t(visualEyebrow)}
                        </span>

                        <h1 className={styles.heroTitle}>
                            {t(visualTitle)} <span>{t(visualTitleAccent)}</span>
                        </h1>

                        <p className={styles.heroDescription}>{t(visualDescription)}</p>

                        <div className={styles.heroActions}>
                            <Link href="/builder" className={styles.primaryButton}>
                                {t(heroPrimaryText)}
                                <i className="bi bi-arrow-right" />
                            </Link>

                            <button type="button" className={styles.secondaryButton}>
                                <span className={styles.playIcon}>
                                    <i className="bi bi-play-fill" />
                                </span>
                                {t(heroSecondaryText)}
                            </button>
                        </div>

                        <div className={styles.heroTrust}>
                            <span>
                                <i className="bi bi-shield-check" />
                                {t(securityText)}
                            </span>

                            <span>
                                <i className="bi bi-code-slash" />
                                {t(noCodeText)}
                            </span>

                            <span>
                                <i className="bi bi-lightning-charge-fill" />
                                {t(heroLaunchText)}
                            </span>
                        </div>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={styles.heroGlow} />

                        <div className={styles.heroBrowser}>
                            <Image
                                src={browserPreviewImage}
                                alt={t(heroBrowserAlt)}
                                fill
                                priority
                                sizes="(max-width: 900px) 100vw, 58vw"
                                className={styles.heroImage}
                            />
                        </div>

                        <div className={styles.heroPhone}>
                            <Image
                                src={mobilePreviewImage}
                                alt={t(heroMobileAlt)}
                                fill
                                sizes="140px"
                                className={styles.heroImage}
                            />
                        </div>

                        <div className={`${styles.annotation} ${styles.annotationOne}`}>
                            <i className="bi bi-check-circle-fill" />
                            {t(heroAnnotation)}
                        </div>

                        <div className={`${styles.annotation} ${styles.annotationTwo}`}>
                            <i className="bi bi-stars" />
                            {t(heroLaunchText)}
                        </div>
                    </div>
                </section>
                <section className={styles.stepsSection} aria-label={t(workflowEyebrow)}>
                    <div className={styles.stepsGrid}>
                        {setupSteps.map((step, index) => {
                            const icons = [
                                'bi-box',
                                'bi-file-earmark-text-fill',
                                'bi-rocket-takeoff-fill',
                            ];

                            return (
                                <article
                                    key={index}
                                    className={`${styles.stepCard} ${styles[`stepCard${index + 1}`]}`}
                                >
                                    <div className={styles.stepGlow} />

                                    <div className={styles.stepContent}>
                                        <div className={styles.stepHeader}>
                                            <div className={styles.stepIcon}>
                                                <i className={`bi ${icons[index]}`} />
                                            </div>

                                            <div className={styles.stepMeta}>
                                                <strong>{t(step.number)}</strong>
                                                <span>{t(step.title)}</span>
                                            </div>
                                        </div>

                                        <div className={styles.stepInfo}>
                                            <h2>{t(step.label)}</h2>

                                            <p>{t(step.description)}</p>
                                        </div>

                                        <button type="button" className={styles.stepButton}>
                                            <span>
                                                {index === 0
                                                    ? 'Bắt đầu ngay'
                                                    : index === 1
                                                      ? 'Xem chi tiết'
                                                      : 'Khám phá ngay'}
                                            </span>

                                            <i className="bi bi-arrow-right" />
                                        </button>
                                    </div>

                                    <div className={styles.stepVisual} aria-hidden="true">
                                        {index === 0 && (
                                            <div className={styles.browserMockup}>
                                                <div className={styles.browserBar}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>

                                                <div className={styles.domainMockupContent}>
                                                    <i className="bi bi-globe2" />
                                                    <span />
                                                    <span />
                                                </div>
                                            </div>
                                        )}

                                        {index === 1 && (
                                            <div className={styles.browserMockup}>
                                                <div className={styles.browserBar}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>

                                                <div className={styles.templateMockupContent}>
                                                    <div />
                                                    <div>
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>
                                                    <section>
                                                        <span />
                                                        <span />
                                                    </section>
                                                </div>
                                            </div>
                                        )}

                                        {index === 2 && (
                                            <div className={styles.browserMockup}>
                                                <div className={styles.browserBar}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>

                                                <div className={styles.publishMockupContent}>
                                                    <div className={styles.publishToolbar}>
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>

                                                    <div className={styles.publishImage}>
                                                        <i className="bi bi-image" />
                                                    </div>

                                                    <div className={styles.publishLines}>
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {index < setupSteps.length - 1 && (
                                        <div className={styles.stepConnector} aria-hidden="true">
                                            <span />
                                            <i className="bi bi-arrow-right" />
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>
                <section id="templates" className={styles.workflowSection}>
                    <div className={styles.workflowHeader}>
                        <div className={styles.workflowHeading}>
                            <span className={styles.sectionEyebrow}>{t(workflowEyebrow)}</span>

                            <h2>
                                {t(workflowTitle)} <span>{t(workflowTitleAccent)}</span>
                            </h2>

                            <p>{t(workflowDescription)}</p>
                        </div>

                        <Link href="#features" className={styles.workflowButton}>
                            {t(featuresButtonText)}
                            <i className="bi bi-arrow-right" />
                        </Link>
                    </div>

                    <div className={styles.workflowCanvas}>
                        <div className={styles.workflowGrid} />

                        <div className={styles.workflowAmbient} />

                        <div className={styles.workflowItems}>
                            {workflowItems.map((item, index) => (
                                <article
                                    key={index}
                                    className={`${styles.workflowCard} ${
                                        styles[`workflow${item.accent}`]
                                    }`}
                                >
                                    <div className={styles.workflowCardTop}>
                                        <div className={styles.workflowIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <div className={styles.workflowNumber}>
                                            {String(index + 1).padStart(2, '0')} <br />
                                            <div className={styles.workflowContent}>
                                                <strong>{item.title}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.workflowContent}>
                                        <p>{item.description}</p>
                                    </div>

                                    <div className={styles.workflowVisual}>
                                        {index === 0 && (
                                            <div className={styles.workflowMiniBrowser}>
                                                <div className={styles.miniBrowserBar}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>

                                                <div className={styles.miniBrowserBody}>
                                                    <div className={styles.miniText}>
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>

                                                    <div className={styles.miniImage}>
                                                        <i className="bi bi-image" />
                                                    </div>
                                                </div>

                                                <div className={styles.miniCursor}>
                                                    <i className="bi bi-cursor-fill" />
                                                </div>
                                            </div>
                                        )}

                                        {index === 1 && (
                                            <div className={styles.domainPreview}>
                                                <div className={styles.domainPreviewIcon}>
                                                    <i className="bi bi-globe2" />
                                                </div>

                                                <strong>{t(workflowDomain)}</strong>

                                                <span>
                                                    <i className="bi bi-check-lg" />
                                                </span>
                                            </div>
                                        )}

                                        {index === 2 && (
                                            <div className={styles.pagePreview}>
                                                <div className={styles.pagePreviewBar}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>

                                                <div className={styles.pagePreviewImage}>
                                                    <i className="bi bi-image" />
                                                </div>

                                                <div className={styles.pagePreviewLines}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>
                                            </div>
                                        )}

                                        {index === 3 && (
                                            <div className={styles.editorPreview}>
                                                <div className={styles.editorToolbar}>
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>

                                                <div className={styles.editorCanvas}>
                                                    <div className={styles.editorText}>T</div>

                                                    <div className={styles.editorImage}>
                                                        <i className="bi bi-image" />
                                                    </div>
                                                </div>

                                                <div className={styles.editorHandle} />
                                            </div>
                                        )}

                                        {index === 4 && (
                                            <div className={styles.menuPreview}>
                                                <div className={styles.menuHome}>
                                                    <i className="bi bi-house-fill" />
                                                </div>

                                                <span />
                                                <span />
                                                <span />

                                                <div className={styles.menuCheck}>
                                                    <i className="bi bi-check-lg" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {index < workflowItems.length - 1 && (
                                        <div
                                            className={styles.workflowConnector}
                                            aria-hidden="true"
                                        >
                                            <span />
                                            <i className="bi bi-arrow-right" />
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>

                        <div className={styles.workflowNote}>
                            <i className="bi bi-arrow-down-left" />

                            <span>
                                {t(workflowNoteLine1)}
                                <br />
                                {t(workflowNoteLine2)}
                            </span>
                        </div>
                    </div>
                </section>

                <section className={styles.launchSection}>
                    <div className={styles.launchInner}>
                        {/* LEFT - VISUAL */}
                        <div className={styles.launchVisual}>
                            <div className={styles.visualGlow} />
                            <div className={styles.visualGlowSecondary} />
                            <div className={styles.visualCircle} />
                            <div className={styles.visualDots} />

                            {/* Top handwritten annotation */}
                            <div className={`${styles.launchAnnotation} ${styles.annotationTop}`}>
                                <span>{t(launchAnnotationLine1)}</span>
                                <span>{t(launchAnnotationLine2)}</span>

                                <svg
                                    viewBox="0 0 100 70"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path d="M8 5C10 27 25 39 48 46" />
                                    <path d="M39 37L49 47L35 50" />
                                </svg>
                            </div>

                            {/* Browser */}
                            <div className={styles.launchBrowser}>
                                <Image
                                    src={browserPreviewImage}
                                    alt={t(launchImageAlt)}
                                    fill
                                    priority
                                    sizes="(max-width: 900px) 100vw, 55vw"
                                    className={styles.launchImage}
                                />
                            </div>

                            {/* Bottom handwritten annotation */}
                            <div
                                className={`${styles.launchAnnotation} ${styles.annotationBottom}`}
                            >
                                <svg
                                    viewBox="0 0 100 70"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path d="M91 5C82 25 67 39 44 53" />
                                    <path d="M50 42L42 54L57 50" />
                                </svg>

                                <span>{t(launchAnnotationIdea)}</span>
                                <span>{t(launchAnnotationResult)}</span>
                            </div>
                        </div>

                        {/* RIGHT - CONTENT */}
                        <div className={styles.launchCopy}>
                            <span className={styles.sectionEyebrow}>{t(launchEyebrow)}</span>

                            <h2>
                                {t(launchTitle)}
                                <br />
                                <span>{t(launchTitleAccent)}</span>
                            </h2>

                            <p className={styles.launchDescription}>{t(launchDescription)}</p>

                            <div className={styles.launchFeatures}>
                                {[
                                    {
                                        icon: 'bi-grid-fill',
                                        title: feature1Title,
                                        description: feature1Description,
                                    },
                                    {
                                        icon: 'bi-image',
                                        title: feature2Title,
                                        description: feature2Description,
                                    },
                                    {
                                        icon: 'bi-file-earmark-text-fill',
                                        title: feature3Title,
                                        description: feature3Description,
                                    },
                                    {
                                        icon: 'bi-rocket-takeoff-fill',
                                        title: feature4Title,
                                        description: feature4Description,
                                    },
                                ].map((feature, index) => (
                                    <div key={index} className={styles.launchFeature}>
                                        <span
                                            className={`${styles.launchFeatureIcon} ${
                                                styles[`launchIcon${index + 1}`]
                                            }`}
                                        >
                                            <i className={`bi ${feature.icon}`} />
                                        </span>

                                        <div className={styles.launchFeatureContent}>
                                            <strong>{t(feature.title)}</strong>

                                            <small>{t(feature.description)}</small>
                                        </div>

                                        <span className={styles.launchFeatureArrow}>
                                            <i className="bi bi-arrow-right" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className={styles.featuresSection}>
                    <div className={styles.featuresContainer}>
                        <div className={styles.featuresHeader}>
                            <div className={styles.featuresHeaderContent}>
                                <span className={styles.sectionEyebrow}>{t(featuresEyebrow)}</span>

                                <h2>
                                    {t(featuresTabText)} <span>{t(builderTabText)}</span>
                                </h2>
                            </div>

                            <div className={styles.featuresHeaderRight}>
                                <div className={styles.featuresAnnotation}>
                                    <span>{t(featuresAnnotationLine1)}</span>
                                    <span>{t(featuresAnnotationLine2)}</span>

                                    <svg viewBox="0 0 120 70" fill="none" aria-hidden="true">
                                        <path d="M5 8C35 10 65 20 92 48" />
                                        <path d="M80 42L93 50L88 35" />
                                    </svg>
                                </div>

                                <Link href="#overview" className={styles.featureExplore}>
                                    <span>{t(featuresButtonText)}</span>
                                    <i className="bi bi-arrow-right" />
                                </Link>
                            </div>
                        </div>

                        <div className={styles.featureGrid}>
                            {features.map((feature, featureIndex) => (
                                <article key={featureIndex} className={styles.featureCard}>
                                    <div className={styles.featureVisual}>
                                        <Image
                                            src={feature.image}
                                            alt={t(feature.title)}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 25vw"
                                            className={styles.featureImage}
                                        />

                                        <div className={styles.featureImageOverlay} />

                                        <div
                                            className={`${styles.featureVisualIcon} ${
                                                styles[`visualIcon${featureIndex + 1}`]
                                            }`}
                                        >
                                            <i className={`bi ${feature.icon}`} />
                                        </div>
                                    </div>

                                    <div className={styles.featureContent}>
                                        <div className={styles.featureTitleRow}>
                                            <div className={styles.featureTitleGroup}>
                                                <div
                                                    className={`${styles.featureIcon} ${
                                                        styles[`featureIcon${featureIndex + 1}`]
                                                    }`}
                                                >
                                                    <i className={`bi ${feature.icon}`} />
                                                </div>

                                                <h3>{t(feature.title)}</h3>
                                            </div>

                                            <Link href="#overview" className={styles.featureArrow}>
                                                <i className="bi bi-arrow-right" />
                                            </Link>
                                        </div>

                                        <p className={styles.featureDescription}>
                                            {t(feature.description)}
                                        </p>
                                        <div className={styles.featureList}>
                                            {feature.items.map((item, itemIndex) => (
                                                <div
                                                    key={itemIndex}
                                                    className={styles.featureListItem}
                                                >
                                                    <div className={styles.featureListIcon}>
                                                        <i className="bi bi-stars" />
                                                    </div>
                                                    <div className={styles.featureListContent}>
                                                        <strong>{t(item.label)}</strong>
                                                        <span>{t(item.value)}</span>
                                                    </div>
                                                    <i
                                                        className={`${styles.featureListArrow} bi bi-chevron-right`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function createTextField(key: keyof Service01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextareaField(key: keyof Service01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createImageField(key: keyof Service01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'image',
        folder: 'services',
        accept: 'image/*',
    };
}

function createHeroInspector(): InspectorField[] {
    return [
        createTextField('visualEyebrow', 'Visual Eyebrow'),
        createTextField('visualTitle', 'Visual Title'),
        createTextField('visualTitleAccent', 'Visual Title Accent'),
        createTextareaField('visualDescription', 'Visual Description'),
        createTextField('heroPrimaryText', 'Hero Primary Button'),
        createTextField('heroSecondaryText', 'Hero Secondary Button'),
        createTextField('heroLaunchText', 'Hero Launch Text'),
    ];
}

function createSummaryInspector(): InspectorField[] {
    return [
        createTextField('securityText', 'Security Text'),
        createTextField('noCodeText', 'No Code Text'),
        createTextField('stepsCountText', 'Steps Count Text'),
    ];
}

function createStepInspector(index: 1 | 2 | 3): InspectorField[] {
    return [
        createTextField(`step${index}Number`, `Step ${index} Number`),
        createTextField(`step${index}Label`, `Step ${index} Label`),
        createTextField(`step${index}Title`, `Step ${index} Title`),
        createTextareaField(`step${index}Description`, `Step ${index} Description`),
    ];
}
function createMapInspector(): InspectorField[] {
    return [
        createTextField('zoomText', 'Zoom Text'),
        createTextField('mapStartTitle', 'Map Start Title'),
        createTextareaField('mapStartDescription', 'Map Start Description'),
        createTextField('readyTitle', 'Ready Title'),
        createTextareaField('readyDescription', 'Ready Description'),
        createTextField('selfMapLabel', 'Self Map Label'),
        createTextField('serviceMapLabel', 'Service Map Label'),
        createTextField('readyMapLabel', 'Ready Map Label'),
    ];
}

function createSetupItemInspector(prefix: 'self' | 'service', index: 1 | 2 | 3): InspectorField[] {
    return [
        createTextField(
            `${prefix}Item${index}Title`,
            `${prefix === 'self' ? 'Self' : 'Service'} Item ${index} Title`,
        ),
        createTextareaField(
            `${prefix}Item${index}Description`,
            `${prefix === 'self' ? 'Self' : 'Service'} Item ${index} Description`,
        ),
    ];
}

function createSetupInspector(): InspectorField[] {
    return [
        createTextField('selfSetupTitle', 'Self Setup Title'),
        ...createSetupItemInspector('self', 1),
        ...createSetupItemInspector('self', 2),
        ...createSetupItemInspector('self', 3),
        createTextField('serviceSetupTitle', 'Service Setup Title'),
        ...createSetupItemInspector('service', 1),
        ...createSetupItemInspector('service', 2),
        ...createSetupItemInspector('service', 3),
    ];
}

function createSetupCardInspector(type: 'self' | 'service'): InspectorField[] {
    const title = type === 'self' ? 'Self' : 'Service';
    return [
        createTextField(`${type}SetupLabel`, `${title} Setup Label`),
        createTextField(`${type}SetupCardTitle`, `${title} Setup Card Title`),
        createTextField(`${type}SetupCardTitleAccent`, `${title} Setup Card Title Accent`),
        createTextareaField(`${type}SetupCardDescription`, `${title} Setup Card Description`),
        createTextField(`${type}SetupPrimaryText`, `${title} Setup Primary Button`),
        createTextField(`${type}SetupSecondaryText`, `${title} Setup Secondary Button`),
        createTextField(`${type}SetupLinkText`, `${title} Setup Link Text`),
        createTextField(`${type}SetupHref`, `${title} Setup Link`),
    ];
}

function createVisualInspector(): InspectorField[] {
    return [
        createTextField('templateBadgeText', 'Template Badge Text'),
        createTextField('pagesBadgeText', 'Pages Badge Text'),
        createTextField('menuBadgeText', 'Menu Badge Text'),
    ];
}

function createFeatureSectionInspector(): InspectorField[] {
    return [
        createTextField('featuresTabText', 'Features Tab Text'),
        createTextField('builderTabText', 'Builder Tab Text'),
        createTextField('featuresButtonText', 'Features Button Text'),
    ];
}

function createFeatureInspector(index: 1 | 2 | 3 | 4): InspectorField[] {
    return [
        createTextField(`feature${index}Title`, `Feature ${index} Title`),
        createTextareaField(`feature${index}Description`, `Feature ${index} Description`),
        createTextField(`feature${index}Item1Label`, `Feature ${index} Item 1 Label`),
        createTextField(`feature${index}Item1Value`, `Feature ${index} Item 1 Value`),
        createTextField(`feature${index}Item2Label`, `Feature ${index} Item 2 Label`),
        createTextField(`feature${index}Item2Value`, `Feature ${index} Item 2 Value`),
    ];
}

function createInspector(): InspectorField[] {
    return [
        ...createHeroInspector(),
        ...createSummaryInspector(),
        ...createStepInspector(1),
        ...createStepInspector(2),
        ...createStepInspector(3),
        createTextField('stepsButtonText', 'Steps Button Text'),
        ...createMapInspector(),
        ...createSetupInspector(),
        ...createSetupCardInspector('self'),
        ...createSetupCardInspector('service'),
        ...createVisualInspector(),
        ...createFeatureSectionInspector(),
        ...createFeatureInspector(1),
        ...createFeatureInspector(2),
        ...createFeatureInspector(3),
        ...createFeatureInspector(4),
        createImageField('browserPreviewImage', 'Browser Preview'),
        createImageField('mobilePreviewImage', 'Mobile Preview'),
        createImageField('analyticsPreviewImage', 'Analytics Card'),
        createImageField('plantPreviewImage', 'Plant Image'),
    ];
}

export const SERVICE_01: RegItem = {
    kind: 'service-page-01',
    label: 'Service Page 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <Service01 {...(props as unknown as Service01Props)} />,
};
export default Service01;
