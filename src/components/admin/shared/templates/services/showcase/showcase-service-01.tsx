'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/showcase/styles/showcase-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import { useMemo } from 'react';
export interface ShowcaseService01Props {
    card1Image?: string;
    card1Title?: string;
    card1Description?: string;
    card1Href?: string;

    card2Image?: string;
    card2Title?: string;
    card2Description?: string;
    card2Href?: string;

    card3Image?: string;
    card3Title?: string;
    card3Description?: string;
    card3Href?: string;

    card4Image?: string;
    card4Title?: string;
    card4Description?: string;
    card4Href?: string;
}

interface ShowcaseCard {
    title: string;
    description: string;
    href: string;
    icon: string;
    badge: string;
    tags: string[];
}
function ShowcaseCardItem({ card, index }: { card: ShowcaseCard; index: number }) {
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

                <span className={styles.core}>Core</span>
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
                    Learn More
                    <i className="bi bi-arrow-up-right"></i>
                </Link>

                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            </div>
        </article>
    );
}

export function ShowcaseService01({
    card1Title = 'Visual Drag & Drop',
    card1Description = 'Create beautiful websites visually with a real-time editing canvas. No coding required.',
    card1Href = '#',

    card2Title = 'Premium Templates',
    card2Description = 'Launch faster using professionally designed responsive website templates.',
    card2Href = '#',

    card3Title = 'Reusable Components',
    card3Description = 'Reuse sections, layouts and blocks across unlimited pages and projects.',
    card3Href = '#',

    card4Title = 'Publish Anywhere',
    card4Description = 'Connect your own domain and publish websites worldwide in minutes.',
    card4Href = '#',
}: ShowcaseService01Props) {
    const cards = useMemo<ShowcaseCard[]>(
        () => [
            {
                title: card1Title,
                description: card1Description,
                href: card1Href,
                icon: 'bi bi-window-stack',
                badge: 'Visual Builder',
                tags: ['Drag & Drop', 'Canvas', 'No Code'],
            },
            {
                title: card2Title,
                description: card2Description,
                href: card2Href,
                icon: 'bi bi-grid-1x2-fill',
                badge: 'Templates',
                tags: ['Responsive', 'SEO', 'Modern UI'],
            },
            {
                title: card3Title,
                description: card3Description,
                href: card3Href,
                icon: 'bi bi-boxes',
                badge: 'Components',
                tags: ['Reusable', 'Flexible', 'Fast'],
            },
            {
                title: card4Title,
                description: card4Description,
                href: card4Href,
                icon: 'bi bi-rocket-takeoff-fill',
                badge: 'Publishing',
                tags: ['Custom Domain', 'SSL', 'Deploy'],
            },
        ],
        [
            card1Title,
            card1Description,
            card1Href,

            card2Title,
            card2Description,
            card2Href,

            card3Title,
            card3Description,
            card3Href,

            card4Title,
            card4Description,
            card4Href,
        ],
    );

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {cards.map((card, index) => (
                        <ShowcaseCardItem key={card.title} card={card} index={index} />
                    ))}
                </div>
                <div className={styles.bottom}>
                    <div className={styles.bottomGlow}></div>
                    <div className={styles.bottomGlow2}></div>

                    <div className={styles.bottomContent}>
                        <div className={styles.bottomLeft}>
                            <span className={styles.bottomBadge}>
                                <i className="bi bi-stars" />
                                Launch Faster with Kbuilder
                            </span>

                            <h3>
                                Build.
                                <span> Customize.</span>
                                Publish.
                            </h3>

                            <p>
                                Design stunning websites with an intuitive drag & drop builder,
                                reusable sections, AI-powered editing and one-click publishing.
                            </p>

                            <div className={styles.bottomFeatures}>
                                <div>
                                    <strong>10 Min</strong>
                                    <span>Average Launch</span>
                                </div>

                                <div>
                                    <strong>150+</strong>
                                    <span>Templates</span>
                                </div>

                                <div>
                                    <strong>100%</strong>
                                    <span>Responsive</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.bottomRight}>
                            <Link href="/signup" className={styles.primaryButton}>
                                <i className="bi bi-rocket-takeoff-fill" />
                                Start Building
                            </Link>

                            <Link href="/templates" className={styles.secondaryButton}>
                                Browse Templates
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
        title: 'Everything You Need To Build Modern Websites',
        card1Title: 'Visual Drag & Drop',
        card1Description:
            'Design every page visually with an intuitive editing canvas. No coding skills required.',
        card1Href: '/builder',

        // Card 2
        card2Title: 'Premium Templates',
        card2Description:
            'Choose from professionally designed templates and launch your website in minutes.',
        card2Href: '/templates',

        // Card 3
        card3Title: 'Reusable Components',
        card3Description: 'Reuse headers, footers, sections and layouts across unlimited projects.',
        card3Href: '/components',

        // Card 4
        card4Title: 'Custom Domain & Publish',
        card4Description:
            'Connect your own domain and publish your website securely with one click.',
        card4Href: '/publish',
    },

    inspector: [
        {
            key: 'title',
            label: 'Section Title',
            kind: 'text',
        },

        // Card 1
        {
            key: 'card1Title',
            label: 'Visual Builder Title',
            kind: 'text',
        },
        {
            key: 'card1Description',
            label: 'Visual Builder Description',
            kind: 'textarea',
        },
        {
            key: 'card1Href',
            label: 'Visual Builder Link',
            kind: 'text',
        },

        // Card 2
        {
            key: 'card2Title',
            label: 'Templates Title',
            kind: 'text',
        },
        {
            key: 'card2Description',
            label: 'Templates Description',
            kind: 'textarea',
        },
        {
            key: 'card2Href',
            label: 'Templates Link',
            kind: 'text',
        },

        // Card 3
        {
            key: 'card3Title',
            label: 'Components Title',
            kind: 'text',
        },
        {
            key: 'card3Description',
            label: 'Components Description',
            kind: 'textarea',
        },
        {
            key: 'card3Href',
            label: 'Components Link',
            kind: 'text',
        },

        // Card 4
        {
            key: 'card4Title',
            label: 'Publish Title',
            kind: 'text',
        },
        {
            key: 'card4Description',
            label: 'Publish Description',
            kind: 'textarea',
        },
        {
            key: 'card4Href',
            label: 'Publish Link',
            kind: 'text',
        },
    ],

    render: (props) => {
        const data = props as Record<string, any>;

        return (
            <ShowcaseService01
                card1Title={data.card1Title}
                card1Description={data.card1Description}
                card1Href={data.card1Href}
                card2Title={data.card2Title}
                card2Description={data.card2Description}
                card2Href={data.card2Href}
                card3Title={data.card3Title}
                card3Description={data.card3Description}
                card3Href={data.card3Href}
                card4Title={data.card4Title}
                card4Description={data.card4Description}
                card4Href={data.card4Href}
            />
        );
    },
};
export default ShowcaseService01;
