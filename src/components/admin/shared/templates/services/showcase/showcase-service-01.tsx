'use client';
import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/showcase/styles/showcase-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import { useMemo } from 'react';
export interface ShowcaseService01Props {
    cardCoreText?: string;
    cardButtonText?: string;

    card1Title?: string;
    card1Description?: string;
    card1Href?: string;
    card1Badge?: string;
    card1Tag1?: string;
    card1Tag2?: string;
    card1Tag3?: string;

    card2Title?: string;
    card2Description?: string;
    card2Href?: string;
    card2Badge?: string;
    card2Tag1?: string;
    card2Tag2?: string;
    card2Tag3?: string;

    card3Title?: string;
    card3Description?: string;
    card3Href?: string;
    card3Badge?: string;
    card3Tag1?: string;
    card3Tag2?: string;
    card3Tag3?: string;

    card4Title?: string;
    card4Description?: string;
    card4Href?: string;
    card4Badge?: string;
    card4Tag1?: string;
    card4Tag2?: string;
    card4Tag3?: string;

    bottomBadge?: string;

    bottomTitle1?: string;
    bottomTitleAccent?: string;
    bottomTitle2?: string;

    bottomDescription?: string;

    stat1Value?: string;
    stat1Label?: string;

    stat2Value?: string;
    stat2Label?: string;

    stat3Value?: string;
    stat3Label?: string;

    primaryCtaText?: string;
    primaryCtaHref?: string;

    secondaryCtaText?: string;
    secondaryCtaHref?: string;
}
interface ShowcaseCard {
    title: string;
    description: string;
    href: string;
    icon: string;
    badge: string;
    tags: string[];
}
function ShowcaseCardItem({
    card,
    index,
    coreText,
    buttonText,
}: {
    card: ShowcaseCard;
    index: number;
    coreText: string;
    buttonText: string;
}) {
    return (
        <article className={styles.card}>
            <span className={styles.glow}></span>

            <div className={styles.header}>
                <div className={styles.category}>
                    <div className={styles.iconBox}>
                        <i className={card.icon}></i>
                    </div>

                    <span>{card.badge}</span>
                </div>

                <span className={styles.core}>{coreText}</span>
            </div>

            <div className={styles.body}>
                <h3>{card.title}</h3>

                <p>{card.description}</p>
            </div>

            <div className={styles.tags}>
                {card.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                ))}
            </div>

            <div className={styles.footer}>
                <Link href={card.href} className={styles.button}>
                    {buttonText}
                    <i className="bi bi-arrow-up-right"></i>
                </Link>

                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            </div>
        </article>
    );
}

export function ShowcaseService01({
    cardCoreText = 'Core',
    cardButtonText = 'Learn More',

    card1Title = 'Visual Drag & Drop',
    card1Description = 'Create beautiful websites visually with a real-time editing canvas. No coding required.',
    card1Href = '#',
    card1Badge = 'Visual Builder',
    card1Tag1 = 'Drag & Drop',
    card1Tag2 = 'Canvas',
    card1Tag3 = 'No Code',

    card2Title = 'Premium Templates',
    card2Description = 'Launch faster using professionally designed responsive website templates.',
    card2Href = '#',
    card2Badge = 'Templates',
    card2Tag1 = 'Responsive',
    card2Tag2 = 'SEO',
    card2Tag3 = 'Modern UI',

    card3Title = 'Reusable Components',
    card3Description = 'Reuse sections, layouts and blocks across unlimited pages and projects.',
    card3Href = '#',
    card3Badge = 'Components',
    card3Tag1 = 'Reusable',
    card3Tag2 = 'Flexible',
    card3Tag3 = 'Fast',

    card4Title = 'Publish Anywhere',
    card4Description = 'Connect your own domain and publish websites worldwide in minutes.',
    card4Href = '#',
    card4Badge = 'Publishing',
    card4Tag1 = 'Custom Domain',
    card4Tag2 = 'SSL',
    card4Tag3 = 'Deploy',

    bottomBadge = 'Launch Faster with Kbuilder',

    bottomTitle1 = 'Build.',
    bottomTitleAccent = 'Customize.',
    bottomTitle2 = 'Publish.',

    bottomDescription = 'Design stunning websites with an intuitive drag & drop builder, reusable sections, AI-powered editing and one-click publishing.',

    stat1Value = '10 Min',
    stat1Label = 'Average Launch',

    stat2Value = '150+',
    stat2Label = 'Templates',

    stat3Value = '100%',
    stat3Label = 'Responsive',

    primaryCtaText = 'Start Building',
    primaryCtaHref = '/signup',

    secondaryCtaText = 'Browse Templates',
    secondaryCtaHref = '/templates',
}: ShowcaseService01Props) {
    const cards = useMemo<ShowcaseCard[]>(
        () => [
            {
                title: card1Title,
                description: card1Description,
                href: card1Href,
                icon: 'bi bi-window-stack',
                badge: card1Badge,
                tags: [card1Tag1, card1Tag2, card1Tag3],
            },
            {
                title: card2Title,
                description: card2Description,
                href: card2Href,
                icon: 'bi bi-grid-1x2-fill',
                badge: card2Badge,
                tags: [card2Tag1, card2Tag2, card2Tag3],
            },
            {
                title: card3Title,
                description: card3Description,
                href: card3Href,
                icon: 'bi bi-boxes',
                badge: card3Badge,
                tags: [card3Tag1, card3Tag2, card3Tag3],
            },
            {
                title: card4Title,
                description: card4Description,
                href: card4Href,
                icon: 'bi bi-rocket-takeoff-fill',
                badge: card4Badge,
                tags: [card4Tag1, card4Tag2, card4Tag3],
            },
        ],
        [
            card1Title,
            card1Description,
            card1Href,
            card1Badge,
            card1Tag1,
            card1Tag2,
            card1Tag3,

            card2Title,
            card2Description,
            card2Href,
            card2Badge,
            card2Tag1,
            card2Tag2,
            card2Tag3,

            card3Title,
            card3Description,
            card3Href,
            card3Badge,
            card3Tag1,
            card3Tag2,
            card3Tag3,

            card4Title,
            card4Description,
            card4Href,
            card4Badge,
            card4Tag1,
            card4Tag2,
            card4Tag3,
        ],
    );

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {cards.map((card, index) => (
                        <ShowcaseCardItem
                            key={card.title}
                            card={card}
                            index={index}
                            coreText={cardCoreText}
                            buttonText={cardButtonText}
                        />
                    ))}
                </div>
                <div className={styles.bottom}>
                    <div className={styles.bottomGlow}></div>
                    <div className={styles.bottomGlow2}></div>

                    <div className={styles.bottomContent}>
                        <div className={styles.bottomLeft}>
                            <span className={styles.bottomBadge}>
                                <i className="bi bi-stars" />
                                {bottomBadge}
                            </span>

                            <h3>
                                {bottomTitle1}
                                <span> {bottomTitleAccent}</span> {bottomTitle2}
                            </h3>

                            <p>{bottomDescription}</p>

                            <div className={styles.bottomFeatures}>
                                <div>
                                    <strong>{stat1Value}</strong>
                                    <span>{stat1Label}</span>
                                </div>

                                <div>
                                    <strong>{stat2Value}</strong>
                                    <span>{stat2Label}</span>
                                </div>

                                <div>
                                    <strong>{stat3Value}</strong>
                                    <span>{stat3Label}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.bottomRight}>
                            <Link href={primaryCtaHref} className={styles.primaryButton}>
                                <i className="bi bi-rocket-takeoff-fill" />
                                {primaryCtaText}
                            </Link>

                            <Link href={secondaryCtaHref} className={styles.secondaryButton}>
                                {secondaryCtaText}
                                <i className="bi bi-arrow-right" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export const SHOWCASE_SERVICE_01: RegItem = {
    kind: 'ShowcaseService01',

    label: 'Showcase Service 01',

    defaults: {
        cardCoreText: 'Core',
        cardButtonText: 'Learn More',

        card1Title: 'Visual Drag & Drop',
        card1Description:
            'Design every page visually with an intuitive editing canvas. No coding skills required.',
        card1Href: '/builder',
        card1Badge: 'Visual Builder',
        card1Tag1: 'Drag & Drop',
        card1Tag2: 'Canvas',
        card1Tag3: 'No Code',

        card2Title: 'Premium Templates',
        card2Description:
            'Choose from professionally designed templates and launch your website in minutes.',
        card2Href: '/templates',
        card2Badge: 'Templates',
        card2Tag1: 'Responsive',
        card2Tag2: 'SEO',
        card2Tag3: 'Modern UI',

        card3Title: 'Reusable Components',
        card3Description: 'Reuse headers, footers, sections and layouts across unlimited projects.',
        card3Href: '/components',
        card3Badge: 'Components',
        card3Tag1: 'Reusable',
        card3Tag2: 'Flexible',
        card3Tag3: 'Fast',

        card4Title: 'Custom Domain & Publish',
        card4Description:
            'Connect your own domain and publish your website securely with one click.',
        card4Href: '/publish',
        card4Badge: 'Publishing',
        card4Tag1: 'Custom Domain',
        card4Tag2: 'SSL',
        card4Tag3: 'Deploy',

        bottomBadge: 'Launch Faster with Kbuilder',

        bottomTitle1: 'Build.',
        bottomTitleAccent: 'Customize.',
        bottomTitle2: 'Publish.',

        bottomDescription:
            'Design stunning websites with an intuitive drag & drop builder, reusable sections, AI-powered editing and one-click publishing.',

        stat1Value: '10 Min',
        stat1Label: 'Average Launch',

        stat2Value: '150+',
        stat2Label: 'Templates',

        stat3Value: '100%',
        stat3Label: 'Responsive',

        primaryCtaText: 'Start Building',
        primaryCtaHref: '/signup',

        secondaryCtaText: 'Browse Templates',
        secondaryCtaHref: '/templates',
    },
    inspector: [
        { key: 'cardCoreText', label: 'Card Core Text', kind: 'text' },
        { key: 'cardButtonText', label: 'Card Button Text', kind: 'text' },

        // Card 1
        { key: 'card1Title', label: 'Card 1 Title', kind: 'text' },
        {
            key: 'card1Description',
            label: 'Card 1 Description',
            kind: 'textarea',
        },
        { key: 'card1Href', label: 'Card 1 Link', kind: 'text' },
        { key: 'card1Badge', label: 'Card 1 Badge', kind: 'text' },
        { key: 'card1Tag1', label: 'Card 1 Tag 1', kind: 'text' },
        { key: 'card1Tag2', label: 'Card 1 Tag 2', kind: 'text' },
        { key: 'card1Tag3', label: 'Card 1 Tag 3', kind: 'text' },

        // Card 2
        { key: 'card2Title', label: 'Card 2 Title', kind: 'text' },
        {
            key: 'card2Description',
            label: 'Card 2 Description',
            kind: 'textarea',
        },
        { key: 'card2Href', label: 'Card 2 Link', kind: 'text' },
        { key: 'card2Badge', label: 'Card 2 Badge', kind: 'text' },
        { key: 'card2Tag1', label: 'Card 2 Tag 1', kind: 'text' },
        { key: 'card2Tag2', label: 'Card 2 Tag 2', kind: 'text' },
        { key: 'card2Tag3', label: 'Card 2 Tag 3', kind: 'text' },

        // Card 3
        { key: 'card3Title', label: 'Card 3 Title', kind: 'text' },
        {
            key: 'card3Description',
            label: 'Card 3 Description',
            kind: 'textarea',
        },
        { key: 'card3Href', label: 'Card 3 Link', kind: 'text' },
        { key: 'card3Badge', label: 'Card 3 Badge', kind: 'text' },
        { key: 'card3Tag1', label: 'Card 3 Tag 1', kind: 'text' },
        { key: 'card3Tag2', label: 'Card 3 Tag 2', kind: 'text' },
        { key: 'card3Tag3', label: 'Card 3 Tag 3', kind: 'text' },

        // Card 4
        { key: 'card4Title', label: 'Card 4 Title', kind: 'text' },
        {
            key: 'card4Description',
            label: 'Card 4 Description',
            kind: 'textarea',
        },
        { key: 'card4Href', label: 'Card 4 Link', kind: 'text' },
        { key: 'card4Badge', label: 'Card 4 Badge', kind: 'text' },
        { key: 'card4Tag1', label: 'Card 4 Tag 1', kind: 'text' },
        { key: 'card4Tag2', label: 'Card 4 Tag 2', kind: 'text' },
        { key: 'card4Tag3', label: 'Card 4 Tag 3', kind: 'text' },

        // Bottom
        { key: 'bottomBadge', label: 'Bottom Badge', kind: 'text' },

        { key: 'bottomTitle1', label: 'Bottom Title 1', kind: 'text' },
        {
            key: 'bottomTitleAccent',
            label: 'Bottom Title Accent',
            kind: 'text',
        },
        { key: 'bottomTitle2', label: 'Bottom Title 2', kind: 'text' },

        {
            key: 'bottomDescription',
            label: 'Bottom Description',
            kind: 'textarea',
        },

        { key: 'stat1Value', label: 'Stat 1 Value', kind: 'text' },
        { key: 'stat1Label', label: 'Stat 1 Label', kind: 'text' },

        { key: 'stat2Value', label: 'Stat 2 Value', kind: 'text' },
        { key: 'stat2Label', label: 'Stat 2 Label', kind: 'text' },

        { key: 'stat3Value', label: 'Stat 3 Value', kind: 'text' },
        { key: 'stat3Label', label: 'Stat 3 Label', kind: 'text' },

        {
            key: 'primaryCtaText',
            label: 'Primary CTA Text',
            kind: 'text',
        },
        {
            key: 'primaryCtaHref',
            label: 'Primary CTA Link',
            kind: 'text',
        },

        {
            key: 'secondaryCtaText',
            label: 'Secondary CTA Text',
            kind: 'text',
        },
        {
            key: 'secondaryCtaHref',
            label: 'Secondary CTA Link',
            kind: 'text',
        },
    ],

    render: (props) => {
        const data = props as Record<string, any>;

        return (
            <ShowcaseService01
                cardCoreText={data.cardCoreText}
                cardButtonText={data.cardButtonText}
                card1Title={data.card1Title}
                card1Description={data.card1Description}
                card1Href={data.card1Href}
                card1Badge={data.card1Badge}
                card1Tag1={data.card1Tag1}
                card1Tag2={data.card1Tag2}
                card1Tag3={data.card1Tag3}
                card2Title={data.card2Title}
                card2Description={data.card2Description}
                card2Href={data.card2Href}
                card2Badge={data.card2Badge}
                card2Tag1={data.card2Tag1}
                card2Tag2={data.card2Tag2}
                card2Tag3={data.card2Tag3}
                card3Title={data.card3Title}
                card3Description={data.card3Description}
                card3Href={data.card3Href}
                card3Badge={data.card3Badge}
                card3Tag1={data.card3Tag1}
                card3Tag2={data.card3Tag2}
                card3Tag3={data.card3Tag3}
                card4Title={data.card4Title}
                card4Description={data.card4Description}
                card4Href={data.card4Href}
                card4Badge={data.card4Badge}
                card4Tag1={data.card4Tag1}
                card4Tag2={data.card4Tag2}
                card4Tag3={data.card4Tag3}
                bottomBadge={data.bottomBadge}
                bottomTitle1={data.bottomTitle1}
                bottomTitleAccent={data.bottomTitleAccent}
                bottomTitle2={data.bottomTitle2}
                bottomDescription={data.bottomDescription}
                stat1Value={data.stat1Value}
                stat1Label={data.stat1Label}
                stat2Value={data.stat2Value}
                stat2Label={data.stat2Label}
                stat3Value={data.stat3Value}
                stat3Label={data.stat3Label}
                primaryCtaText={data.primaryCtaText}
                primaryCtaHref={data.primaryCtaHref}
                secondaryCtaText={data.secondaryCtaText}
                secondaryCtaHref={data.secondaryCtaHref}
            />
        );
    },
};
export default ShowcaseService01;
