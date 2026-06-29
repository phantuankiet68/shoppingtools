'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/showcase/styles/showcase-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import { useMemo } from 'react';
export interface ShowcaseService01Props {
    title?: string;
    subtitle?: string;

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
    image: string;
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
            <Link href={card.href} className={styles.imageWrapper}>
                <Image
                    src={card.image}
                    alt={card.title}
                    width={640}
                    height={420}
                    className={styles.image}
                />

                <span className={styles.number}>{(index + 1).toString().padStart(2, '0')}</span>
            </Link>

            <div className={styles.content}>
                <div className={styles.top}>
                    <div className={styles.category}>
                        <i className={card.icon} />
                        {card.badge}
                    </div>

                    <span className={styles.badgeNew}>Core</span>
                </div>

                <h3>{card.title}</h3>

                <p>{card.description}</p>

                <div className={styles.tags}>
                    {card.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>

                <div className={styles.cardFooter}>
                    <Link href={card.href} className={styles.button}>
                        Learn More
                        <i className="bi bi-arrow-right" />
                    </Link>

                    <span className={styles.indexLabel}>0{index + 1} Feature</span>
                </div>
            </div>
        </article>
    );
}

export function ShowcaseService01({
    title = 'Why Choose Kbuilder',

    subtitle = 'Everything you need to design, customize and publish professional websites using an intuitive drag & drop builder.',

    card1Image = '/assets/images/showcase/visual-builder.jpg',
    card1Title = 'Visual Drag & Drop',
    card1Description = 'Create beautiful websites visually with a real-time editing canvas. No coding required.',
    card1Href = '#',

    card2Image = '/assets/images/showcase/templates.jpg',
    card2Title = 'Premium Templates',
    card2Description = 'Launch faster using professionally designed responsive website templates.',
    card2Href = '#',

    card3Image = '/assets/images/showcase/components.jpg',
    card3Title = 'Reusable Components',
    card3Description = 'Reuse sections, layouts and blocks across unlimited pages and projects.',
    card3Href = '#',

    card4Image = '/assets/images/showcase/domain.jpg',
    card4Title = 'Publish Anywhere',
    card4Description = 'Connect your own domain and publish websites worldwide in minutes.',
    card4Href = '#',
}: ShowcaseService01Props) {
    const cards = useMemo<ShowcaseCard[]>(
        () => [
            {
                image: card1Image,
                title: card1Title,
                description: card1Description,
                href: card1Href,
                icon: 'bi bi-window-stack',
                badge: 'Visual Builder',
                tags: ['Drag & Drop', 'Canvas', 'No Code'],
            },
            {
                image: card2Image,
                title: card2Title,
                description: card2Description,
                href: card2Href,
                icon: 'bi bi-grid-1x2-fill',
                badge: 'Templates',
                tags: ['Responsive', 'SEO', 'Modern UI'],
            },
            {
                image: card3Image,
                title: card3Title,
                description: card3Description,
                href: card3Href,
                icon: 'bi bi-boxes',
                badge: 'Components',
                tags: ['Reusable', 'Flexible', 'Fast'],
            },
            {
                image: card4Image,
                title: card4Title,
                description: card4Description,
                href: card4Href,
                icon: 'bi bi-rocket-takeoff-fill',
                badge: 'Publishing',
                tags: ['Custom Domain', 'SSL', 'Deploy'],
            },
        ],
        [
            card1Image,
            card1Title,
            card1Description,
            card1Href,

            card2Image,
            card2Title,
            card2Description,
            card2Href,

            card3Image,
            card3Title,
            card3Description,
            card3Href,

            card4Image,
            card4Title,
            card4Description,
            card4Href,
        ],
    );

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {/* Header */}

                <div className={styles.heading}>
                    <span className={styles.badge}>
                        <i className="bi bi-stars" />
                        Why Choose Kbuilder
                    </span>

                    <h2>{title}</h2>

                    <p>{subtitle}</p>
                </div>

                {/* Feature Grid */}

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

        subtitle:
            'Kbuilder helps you build beautiful websites with drag & drop editing, reusable components, responsive templates and one-click publishing.',

        // Card 1
        card1Image: '/assets/images/feature-add.png',
        card1Title: 'Visual Drag & Drop',
        card1Description:
            'Design every page visually with an intuitive editing canvas. No coding skills required.',
        card1Href: '/builder',

        // Card 2
        card2Image: '/assets/images/feature-add.png',
        card2Title: 'Premium Templates',
        card2Description:
            'Choose from professionally designed templates and launch your website in minutes.',
        card2Href: '/templates',

        // Card 3
        card3Image: '/assets/images/feature-add.png',
        card3Title: 'Reusable Components',
        card3Description: 'Reuse headers, footers, sections and layouts across unlimited projects.',
        card3Href: '/components',

        // Card 4
        card4Image: '/assets/images/feature-add.png',
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
        {
            key: 'subtitle',
            label: 'Section Description',
            kind: 'textarea',
        },

        // Card 1
        {
            key: 'card1Image',
            label: 'Visual Builder Image',
            kind: 'image',
        },
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
            key: 'card2Image',
            label: 'Templates Image',
            kind: 'image',
        },
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
            key: 'card3Image',
            label: 'Components Image',
            kind: 'image',
        },
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
            key: 'card4Image',
            label: 'Publish Image',
            kind: 'image',
        },
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
                title={data.title}
                subtitle={data.subtitle}
                card1Image={data.card1Image}
                card1Title={data.card1Title}
                card1Description={data.card1Description}
                card1Href={data.card1Href}
                card2Image={data.card2Image}
                card2Title={data.card2Title}
                card2Description={data.card2Description}
                card2Href={data.card2Href}
                card3Image={data.card3Image}
                card3Title={data.card3Title}
                card3Description={data.card3Description}
                card3Href={data.card3Href}
                card4Image={data.card4Image}
                card4Title={data.card4Title}
                card4Description={data.card4Description}
                card4Href={data.card4Href}
            />
        );
    },
};
export default ShowcaseService01;
