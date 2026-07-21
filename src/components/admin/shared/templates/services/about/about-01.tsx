'use client';

import { useMemo } from 'react';
import type { RegItem } from '@/lib/ui-builder/types';
import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/about/styles/about-01.module.css';
import Image from 'next/image';
type FeatureItem = {
    icon: string;
    title: string;
    description: string;
};

type StatItem = {
    value: string;
    label: string;
    icon: string;
};

type JourneyItem = {
    icon: string;
    date: string;
    title: string;
    description: string;
    active?: string | boolean;
};

type StoryItem = {
    year: string;
    badge: string;
    title: string;
    titleAccent: string;
    description: string;
    image: string;
    imageAlt: string;
    reverse?: string | boolean;
};

type ValueColor = 'purple' | 'blue' | 'orange' | 'pink';

interface CoreValue {
    id: string;
    icon: string;
    title: string;
    description: string;
    tags: string[];
    color: ValueColor;
}

type TeamMember = {
    name: string;
    role: string;
    description: string;
    image: string;
    color: 'purple' | 'green' | 'blue' | 'pink' | 'orange';
    icon: string;
};

export interface About01Props {
    breadcrumbHome?: string;
    breadcrumbCurrent?: string;

    badge?: string;

    heroTitle?: string;
    heroTitleAccent?: string;

    heroDescription?: string;

    primaryButtonLabel?: string;
    secondaryButtonLabel?: string;

    image?: string;

    performanceScore?: string;
    performanceLabel?: string;

    stat1Value?: string;
    stat1Label?: string;

    stat2Value?: string;
    stat2Label?: string;

    stat3Value?: string;
    stat3Label?: string;

    stat4Value?: string;
    stat4Label?: string;

    feature1Icon?: string;
    feature1Title?: string;
    feature1Description?: string;

    feature2Icon?: string;
    feature2Title?: string;
    feature2Description?: string;

    feature3Icon?: string;
    feature3Title?: string;
    feature3Description?: string;

    feature4Icon?: string;
    feature4Title?: string;
    feature4Description?: string;

    capability1Icon?: string;
    capability1Label?: string;

    capability2Icon?: string;
    capability2Label?: string;

    capability3Icon?: string;
    capability3Label?: string;

    capability4Icon?: string;
    capability4Label?: string;

    capability5Icon?: string;
    capability5Label?: string;

    value1Icon?: string;
    value1Title?: string;
    value1Description?: string;

    value2Icon?: string;
    value2Title?: string;
    value2Description?: string;

    value3Icon?: string;
    value3Title?: string;
    value3Description?: string;

    value4Icon?: string;
    value4Title?: string;
    value4Description?: string;

    journey1Icon?: string;
    journey1Date?: string;
    journey1Title?: string;
    journey1Description?: string;
    journey1Active?: string | boolean;

    journey2Icon?: string;
    journey2Date?: string;
    journey2Title?: string;
    journey2Description?: string;

    journey3Icon?: string;
    journey3Date?: string;
    journey3Title?: string;
    journey3Description?: string;

    journey4Icon?: string;
    journey4Date?: string;
    journey4Title?: string;
    journey4Description?: string;

    journey5Icon?: string;
    journey5Date?: string;
    journey5Title?: string;
    journey5Description?: string;

    story1Year?: string;
    story1Badge?: string;
    story1Title?: string;
    story1TitleAccent?: string;
    story1Description?: string;
    story1Image?: string;
    story1Alt?: string;

    story2Year?: string;
    story2Badge?: string;
    story2Title?: string;
    story2TitleAccent?: string;
    story2Description?: string;
    story2Image?: string;
    story2Alt?: string;
    story2Reverse?: string | boolean;

    problem1Icon?: string;
    problem1Title?: string;
    problem1Description?: string;

    problem2Icon?: string;
    problem2Title?: string;
    problem2Description?: string;

    problem3Icon?: string;
    problem3Title?: string;
    problem3Description?: string;

    problem4Icon?: string;
    problem4Title?: string;
    problem4Description?: string;

    solution1Icon?: string;
    solution1Title?: string;
    solution1Description?: string;

    solution2Icon?: string;
    solution2Title?: string;
    solution2Description?: string;

    solution3Icon?: string;
    solution3Title?: string;
    solution3Description?: string;

    solution4Icon?: string;
    solution4Title?: string;
    solution4Description?: string;

    coreValue1Id?: string;
    coreValue1Icon?: string;
    coreValue1Title?: string;
    coreValue1Description?: string;

    coreValue1Tag1?: string;
    coreValue1Tag2?: string;
    coreValue1Tag3?: string;
    coreValue1Color?: string;

    coreValue2Id?: string;
    coreValue2Icon?: string;
    coreValue2Title?: string;
    coreValue2Description?: string;

    coreValue2Tag1?: string;
    coreValue2Tag2?: string;
    coreValue2Tag3?: string;
    coreValue2Color?: string;

    coreValue3Id?: string;
    coreValue3Icon?: string;
    coreValue3Title?: string;
    coreValue3Description?: string;

    coreValue3Tag1?: string;
    coreValue3Tag2?: string;
    coreValue3Tag3?: string;
    coreValue3Color?: string;

    coreValue4Id?: string;
    coreValue4Icon?: string;
    coreValue4Title?: string;
    coreValue4Description?: string;

    coreValue4Tag1?: string;
    coreValue4Tag2?: string;
    coreValue4Tag3?: string;
    coreValue4Color?: string;

    team1Name?: string;
    team1Role?: string;
    team1Description?: string;
    team1Image?: string;
    team1Color?: string;
    team1Icon?: string;

    team2Name?: string;
    team2Role?: string;
    team2Description?: string;
    team2Image?: string;
    team2Color?: string;
    team2Icon?: string;

    team3Name?: string;
    team3Role?: string;
    team3Description?: string;
    team3Image?: string;
    team3Color?: string;
    team3Icon?: string;

    team4Name?: string;
    team4Role?: string;
    team4Description?: string;
    team4Image?: string;
    team4Color?: string;
    team4Icon?: string;

    team5Name?: string;
    team5Role?: string;
    team5Description?: string;
    team5Image?: string;
    team5Color?: string;
    team5Icon?: string;

    team6Name?: string;
    team6Role?: string;
    team6Description?: string;
    team6Image?: string;
    team6Color?: string;
    team6Icon?: string;
}

export const DEFAULT_PROPS: Required<About01Props> = {
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'About',

    badge: 'No-Code Website Builder',

    heroTitle: 'Kbuilder',
    heroTitleAccent: 'For Modern Websites',

    heroDescription:
        'Kbuilder specializes in software engineering, SaaS platforms and digital transformation solutions. Our approach goes beyond templates and visual builders — we collaborate with clients to analyze business requirements, architect scalable systems, develop high-quality products and provide ongoing technical support. From startups to growing enterprises, we help organizations build technology that drives long-term growth.',

    primaryButtonLabel: 'Start Creating',
    secondaryButtonLabel: 'Explore Templates',

    image: '/assets/images/feature-add.png',

    performanceScore: '98 / 100',
    performanceLabel: 'Performance Score',

    stat1Value: '30+',
    stat1Label: 'Websites Created',

    stat2Value: '300+',
    stat2Label: 'Templates',

    stat3Value: '300+',
    stat3Label: 'Components',

    stat4Value: '99.9%',
    stat4Label: 'Uptime',

    feature1Icon: 'bi-bounding-box',
    feature1Title: 'Visual Builder',
    feature1Description: 'Drag & Drop',

    feature2Icon: 'bi-stars',
    feature2Title: 'AI Assistant',
    feature2Description: 'Generate Content',

    feature3Icon: 'bi-grid',
    feature3Title: 'Templates',
    feature3Description: 'Ready Sections',

    feature4Icon: 'bi-shield-check',
    feature4Title: 'Free SSL',
    feature4Description: 'Secure by Default',

    capability1Icon: 'bi-shield-check',
    capability1Label: 'Free SSL',

    capability2Icon: 'bi-globe2',
    capability2Label: 'Custom Domains',

    capability3Icon: 'bi-hdd-network',
    capability3Label: 'Cloud Hosting',

    capability4Icon: 'bi-lightning-charge',
    capability4Label: 'Click Publish',

    capability5Icon: 'bi-magic',
    capability5Label: 'AI Automation',

    value1Icon: 'bi-people-fill',
    value1Title: 'Accessibility',
    value1Description:
        'Democratizing digital creation by making powerful web-building tools accessible to everyone.',

    value2Icon: 'bi-lightbulb',
    value2Title: 'Innovation',
    value2Description: 'We continuously improve our platform with smarter and faster solutions.',

    value3Icon: 'bi-shield-check',
    value3Title: 'Reliability',
    value3Description:
        'Built on enterprise-grade infrastructure with security, stability, and performance its core.',

    value4Icon: 'bi-bar-chart-line',
    value4Title: 'Growth',
    value4Description:
        'Providing the tools and flexibility needed to grow, scale, and succeed online.',

    journey1Icon: 'bi-rocket-takeoff-fill',
    journey1Date: 'May 2024',
    journey1Title: 'The Beginning',
    journey1Description: 'Started researching No-Code solutions and the future of web building.',
    journey1Active: true,

    journey2Icon: 'bi-stack',
    journey2Date: 'Jun – Dec 2024',
    journey2Title: 'Research & Learning',
    journey2Description: 'Deep dive into No-Code tools, platform architecture, and market needs.',

    journey3Icon: 'bi-shield-check',
    journey3Date: 'Jan – Apr 2025',
    journey3Title: 'Planning & Foundation',
    journey3Description:
        'Designed the core architecture and planned a powerful web builder platform.',

    journey4Icon: 'bi-people',
    journey4Date: 'May 2025',
    journey4Title: 'Platform & Templates',
    journey4Description: 'Built the role-based permission system and started creating templates.',

    journey5Icon: 'bi-flag',
    journey5Date: 'Now & Beyond',
    journey5Title: 'Growing Together',
    journey5Description:
        'Continuing to improve, add more features, and help everyone build without limits.',

    story1Year: '2024',
    story1Badge: 'May 2024',
    story1Title: 'Started with',
    story1TitleAccent: 'a simple vision.',
    story1Description:
        'Our journey began with one goal: making professional website creation accessible to everyone. We researched the no-code ecosystem, explored user needs, and designed the first concepts for Kbuilder.',
    story1Image: '/assets/images/story-01.png',
    story1Alt: 'Research',

    story2Year: '2025',
    story2Badge: 'May 2025',
    story2Title: 'Turning ideas into',
    story2TitleAccent: 'a real platform.',
    story2Description:
        'We built Kbuilder with reusable templates, scalable architecture, intuitive visual editing, and powerful tools to help creators build modern websites faster and with confidence.',
    story2Image: '/assets/images/story-02.png',
    story2Alt: 'Development',
    story2Reverse: true,

    problem1Icon: 'bi-clock-history',
    problem1Title: 'Too Time-Consuming',
    problem1Description:
        'Building a professional website often takes weeks or even months, delaying launches and business growth.',

    problem2Icon: 'bi-currency-dollar',
    problem2Title: 'Too Expensive',
    problem2Description:
        'Hiring developers or agencies requires a significant investment that many individuals and startups cannot afford.',

    problem3Icon: 'bi-code-slash',
    problem3Title: 'Too Complex',
    problem3Description:
        'Traditional website development requires coding knowledge, making it difficult for non-technical users.',

    problem4Icon: 'bi-sliders',
    problem4Title: 'Too Limited',
    problem4Description:
        'Many existing builders lack flexibility, customization, and modern design capabilities.',

    solution1Icon: 'bi-lightning-charge-fill',
    solution1Title: 'Fast & Easy',
    solution1Description: 'Build and launch beautiful websites in minutes instead of weeks.',

    solution2Icon: 'bi-palette-fill',
    solution2Title: 'No Code Needed',
    solution2Description: 'Design visually without writing a single line of code.',

    solution3Icon: 'bi-shield-check',
    solution3Title: 'Powerful & Flexible',
    solution3Description: 'Professional features with complete design freedom.',

    solution4Icon: 'bi-rocket-takeoff-fill',
    solution4Title: 'Built for Everyone',
    solution4Description: 'Perfect for creators, agencies, freelancers and businesses.',

    coreValue1Id: '01',
    coreValue1Icon: 'bi-people',
    coreValue1Title: 'Customer First',
    coreValue1Description:
        'We begin with our customers, understanding their challenges and creating experiences that genuinely help them succeed. Their growth inspires every decision we make.',

    coreValue1Tag1: 'Empathy',
    coreValue1Tag2: 'Listening',
    coreValue1Tag3: 'Impact',
    coreValue1Color: 'purple',

    coreValue2Id: '02',
    coreValue2Icon: 'bi-rocket-takeoff',
    coreValue2Title: 'Innovation',
    coreValue2Description:
        'Innovation means continuously exploring better ideas, embracing creativity, and building solutions that shape the future of digital experiences.',

    coreValue2Tag1: 'Curiosity',
    coreValue2Tag2: 'Creativity',
    coreValue2Tag3: 'Growth',
    coreValue2Color: 'blue',

    coreValue3Id: '03',
    coreValue3Icon: 'bi-shield-check',
    coreValue3Title: 'Integrity',
    coreValue3Description:
        'Trust is earned through honesty, accountability, and transparency. We always choose the path that builds long-term relationships with our users.',

    coreValue3Tag1: 'Honesty',
    coreValue3Tag2: 'Trust',
    coreValue3Tag3: 'Respect',
    coreValue3Color: 'orange',

    coreValue4Id: '04',
    coreValue4Icon: 'bi-heart',
    coreValue4Title: 'Empowerment',
    coreValue4Description:
        'We empower creators, entrepreneurs, and businesses with tools that unlock new possibilities and transform ideas into reality.',

    coreValue4Tag1: 'Enable',
    coreValue4Tag2: 'Support',
    coreValue4Tag3: 'Inspire',
    coreValue4Color: 'pink',

    team1Name: 'Alex Nguyen',
    team1Role: 'Co-Founder & CEO',
    team1Description:
        'Visionary leader passionate about empowering creators and businesses through no-code innovation.',
    team1Image: '/assets/images/default-avatar.png',
    team1Color: 'purple',
    team1Icon: 'bi-stars',

    team2Name: 'Linh Tran',
    team2Role: 'Chief Technology Officer',
    team2Description:
        'Full-stack architect focused on scalable cloud infrastructure and developer experience.',
    team2Image: '/assets/images/default-avatar.png',
    team2Color: 'green',
    team2Icon: 'bi-code-slash',

    team3Name: 'Minh Le',
    team3Role: 'Head of Design',
    team3Description:
        'Crafting elegant digital experiences that feel simple, modern, and delightful.',
    team3Image: '/assets/images/default-avatar.png',
    team3Color: 'blue',
    team3Icon: 'bi-palette2',

    team4Name: 'Mai Pham',
    team4Role: 'Marketing Director',
    team4Description: 'Helping businesses connect with customers through meaningful storytelling.',
    team4Image: '/assets/images/default-avatar.png',
    team4Color: 'pink',
    team4Icon: 'bi-megaphone-fill',

    team5Name: 'Quang Tran',
    team5Role: 'Product Manager',
    team5Description: 'Turning user feedback into products that solve real-world challenges.',
    team5Image: '/assets/images/default-avatar.png',
    team5Color: 'orange',
    team5Icon: 'bi-lightbulb-fill',

    team6Name: 'Huy Pham',
    team6Role: 'Frontend Lead',
    team6Description:
        'Passionate about creating blazing-fast interfaces with outstanding user experiences.',
    team6Image: '/assets/images/default-avatar.png',
    team6Color: 'purple',
    team6Icon: 'bi-shield-check',
};

export function About01(props: About01Props) {
    const {
        breadcrumbHome,
        breadcrumbCurrent,

        badge,

        heroTitle,
        heroTitleAccent,

        heroDescription,

        primaryButtonLabel,
        secondaryButtonLabel,

        image,

        performanceScore,
        performanceLabel,
        stat1Value,
        stat1Label,
        stat2Value,
        stat2Label,
        stat3Value,
        stat3Label,
        stat4Value,
        stat4Label,
        feature1Icon,
        feature1Title,
        feature1Description,
        feature2Icon,
        feature2Title,
        feature2Description,
        feature3Icon,
        feature3Title,
        feature3Description,
        feature4Icon,
        feature4Title,
        feature4Description,
        capability1Icon,
        capability1Label,
        capability2Icon,
        capability2Label,
        capability3Icon,
        capability3Label,
        capability4Icon,
        capability4Label,
        capability5Icon,
        capability5Label,
        value1Icon,
        value1Title,
        value1Description,
        value2Icon,
        value2Title,
        value2Description,
        value3Icon,
        value3Title,
        value3Description,
        value4Icon,
        value4Title,
        value4Description,
        journey1Icon,
        journey1Date,
        journey1Title,
        journey1Description,
        journey1Active,

        journey2Icon,
        journey2Date,
        journey2Title,
        journey2Description,

        journey3Icon,
        journey3Date,
        journey3Title,
        journey3Description,

        journey4Icon,
        journey4Date,
        journey4Title,
        journey4Description,

        journey5Icon,
        journey5Date,
        journey5Title,
        journey5Description,

        story1Year,
        story1Badge,
        story1Title,
        story1TitleAccent,
        story1Description,
        story1Image,
        story1Alt,

        story2Year,
        story2Badge,
        story2Title,
        story2TitleAccent,
        story2Description,
        story2Image,
        story2Alt,
        story2Reverse,

        problem1Icon,
        problem1Title,
        problem1Description,

        problem2Icon,
        problem2Title,
        problem2Description,

        problem3Icon,
        problem3Title,
        problem3Description,

        problem4Icon,
        problem4Title,
        problem4Description,

        solution1Icon,
        solution1Title,
        solution1Description,

        solution2Icon,
        solution2Title,
        solution2Description,

        solution3Icon,
        solution3Title,
        solution3Description,

        solution4Icon,
        solution4Title,
        solution4Description,

        coreValue1Id,
        coreValue1Icon,
        coreValue1Title,
        coreValue1Description,
        coreValue1Tag1,
        coreValue1Tag2,
        coreValue1Tag3,
        coreValue1Color,

        coreValue2Id,
        coreValue2Icon,
        coreValue2Title,
        coreValue2Description,
        coreValue2Tag1,
        coreValue2Tag2,
        coreValue2Tag3,
        coreValue2Color,

        coreValue3Id,
        coreValue3Icon,
        coreValue3Title,
        coreValue3Description,
        coreValue3Tag1,
        coreValue3Tag2,
        coreValue3Tag3,
        coreValue3Color,

        coreValue4Id,
        coreValue4Icon,
        coreValue4Title,
        coreValue4Description,
        coreValue4Tag1,
        coreValue4Tag2,
        coreValue4Tag3,
        coreValue4Color,

        team1Name,
        team1Role,
        team1Description,
        team1Image,
        team1Color,
        team1Icon,

        team2Name,
        team2Role,
        team2Description,
        team2Image,
        team2Color,
        team2Icon,

        team3Name,
        team3Role,
        team3Description,
        team3Image,
        team3Color,
        team3Icon,

        team4Name,
        team4Role,
        team4Description,
        team4Image,
        team4Color,
        team4Icon,

        team5Name,
        team5Role,
        team5Description,
        team5Image,
        team5Color,
        team5Icon,

        team6Name,
        team6Role,
        team6Description,
        team6Image,
        team6Color,
        team6Icon,
    } = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const stats = useMemo<StatItem[]>(
        () => [
            {
                value: stat1Value,
                label: stat1Label,
                icon: 'bi-window',
            },
            {
                value: stat2Value,
                label: stat2Label,
                icon: 'bi-grid',
            },
            {
                value: stat3Value,
                label: stat3Label,
                icon: 'bi-box',
            },
            {
                value: stat4Value,
                label: stat4Label,
                icon: 'bi-shield-check',
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
    const features = useMemo<FeatureItem[]>(
        () => [
            {
                icon: feature1Icon,
                title: feature1Title,
                description: feature1Description,
            },
            {
                icon: feature2Icon,
                title: feature2Title,
                description: feature2Description,
            },
            {
                icon: feature3Icon,
                title: feature3Title,
                description: feature3Description,
            },
            {
                icon: feature4Icon,
                title: feature4Title,
                description: feature4Description,
            },
        ],
        [
            feature1Icon,
            feature1Title,
            feature1Description,

            feature2Icon,
            feature2Title,
            feature2Description,

            feature3Icon,
            feature3Title,
            feature3Description,

            feature4Icon,
            feature4Title,
            feature4Description,
        ],
    );

    const capabilities = useMemo(
        () => [
            {
                icon: capability1Icon,
                label: capability1Label,
            },
            {
                icon: capability2Icon,
                label: capability2Label,
            },
            {
                icon: capability3Icon,
                label: capability3Label,
            },
            {
                icon: capability4Icon,
                label: capability4Label,
            },
            {
                icon: capability5Icon,
                label: capability5Label,
            },
        ],
        [
            capability1Icon,
            capability1Label,

            capability2Icon,
            capability2Label,

            capability3Icon,
            capability3Label,

            capability4Icon,
            capability4Label,

            capability5Icon,
            capability5Label,
        ],
    );

    const VALUES = [
        {
            icon: value1Icon,
            title: value1Title,
            description: value1Description,
        },
        {
            icon: value2Icon,
            title: value2Title,
            description: value2Description,
        },
        {
            icon: value3Icon,
            title: value3Title,
            description: value3Description,
        },
        {
            icon: value4Icon,
            title: value4Title,
            description: value4Description,
        },
    ];

    const JOURNEY: JourneyItem[] = [
        {
            icon: journey1Icon,
            date: journey1Date,
            title: journey1Title,
            description: journey1Description,
            active: journey1Active,
        },
        {
            icon: journey2Icon,
            date: journey2Date,
            title: journey2Title,
            description: journey2Description,
        },
        {
            icon: journey3Icon,
            date: journey3Date,
            title: journey3Title,
            description: journey3Description,
        },
        {
            icon: journey4Icon,
            date: journey4Date,
            title: journey4Title,
            description: journey4Description,
        },
        {
            icon: journey5Icon,
            date: journey5Date,
            title: journey5Title,
            description: journey5Description,
        },
    ];

    const STORIES: StoryItem[] = [
        {
            year: story1Year,
            badge: story1Badge,
            title: story1Title,
            titleAccent: story1TitleAccent,
            description: story1Description,
            image: story1Image,
            imageAlt: story1Alt,
        },
        {
            year: story2Year,
            badge: story2Badge,
            title: story2Title,
            titleAccent: story2TitleAccent,
            description: story2Description,
            image: story2Image,
            imageAlt: story2Alt,
            reverse: story2Reverse,
        },
    ];

    const problems = [
        {
            icon: problem1Icon,
            title: problem1Title,
            description: problem1Description,
        },
        {
            icon: problem2Icon,
            title: problem2Title,
            description: problem2Description,
        },
        {
            icon: problem3Icon,
            title: problem3Title,
            description: problem3Description,
        },
        {
            icon: problem4Icon,
            title: problem4Title,
            description: problem4Description,
        },
    ];

    const solutions = [
        {
            icon: solution1Icon,
            title: solution1Title,
            description: solution1Description,
        },
        {
            icon: solution2Icon,
            title: solution2Title,
            description: solution2Description,
        },
        {
            icon: solution3Icon,
            title: solution3Title,
            description: solution3Description,
        },
        {
            icon: solution4Icon,
            title: solution4Title,
            description: solution4Description,
        },
    ];

    const CORE_VALUES: CoreValue[] = [
        {
            id: coreValue1Id,
            icon: coreValue1Icon,
            title: coreValue1Title,
            description: coreValue1Description,
            tags: [coreValue1Tag1, coreValue1Tag2, coreValue1Tag3],
            color: (coreValue1Color ?? 'purple') as ValueColor,
        },
        {
            id: coreValue2Id,
            icon: coreValue2Icon,
            title: coreValue2Title,
            description: coreValue2Description,
            tags: [coreValue2Tag1, coreValue2Tag2, coreValue2Tag3],
            color: (coreValue2Color ?? 'blue') as ValueColor,
        },
        {
            id: coreValue3Id,
            icon: coreValue3Icon,
            title: coreValue3Title,
            description: coreValue3Description,
            tags: [coreValue3Tag1, coreValue3Tag2, coreValue3Tag3],
            color: (coreValue3Color ?? 'orange') as ValueColor,
        },
        {
            id: coreValue4Id,
            icon: coreValue4Icon,
            title: coreValue4Title,
            description: coreValue4Description,
            tags: [coreValue4Tag1, coreValue4Tag2, coreValue4Tag3],
            color: (coreValue4Color ?? 'pink') as ValueColor,
        },
    ];

    const TEAM: TeamMember[] = [
        {
            name: team1Name,
            role: team1Role,
            description: team1Description,
            image: team1Image,
            color: (team1Color ?? 'purple') as ValueColor,
            icon: team1Icon,
        },

        {
            name: team2Name,
            role: team2Role,
            description: team2Description,
            image: team2Image,
            color: (team2Color ?? 'green') as ValueColor,
            icon: team2Icon,
        },

        {
            name: team3Name,
            role: team3Role,
            description: team3Description,
            image: team3Image,
            color: (team3Color ?? 'blue') as ValueColor,
            icon: team3Icon,
        },

        {
            name: team4Name,
            role: team4Role,
            description: team4Description,
            image: team4Image,
            color: (team4Color ?? 'pink') as ValueColor,
            icon: team4Icon,
        },

        {
            name: team5Name,
            role: team5Role,
            description: team5Description,
            image: team5Image,
            color: (team5Color ?? 'orange') as ValueColor,
            icon: team5Icon,
        },

        {
            name: team6Name,
            role: team6Role,
            description: team6Description,
            image: team6Image,
            color: (team6Color ?? 'purple') as ValueColor,
            icon: team6Icon,
        },
    ];

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.headingSection}>
                    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                        <Link href="/" className={styles.breadcrumbItem}>
                            {breadcrumbHome}
                        </Link>
                        <i className="bi bi-chevron-right" />
                        <span className={styles.breadcrumbCurrent}>{breadcrumbCurrent}</span>
                    </nav>
                </div>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={styles.badge}>
                            <i className="bi bi-lightning-charge-fill" />
                            {badge}
                        </div>

                        <h1>{heroTitle}</h1>

                        <h2>{heroTitleAccent}</h2>

                        <p>{heroDescription}</p>

                        <div className={styles.actions}>
                            <button className={styles.primaryButton}>
                                {primaryButtonLabel}
                                <i className="bi bi-arrow-right" />
                            </button>

                            <button className={styles.secondaryButton}>
                                {secondaryButtonLabel}
                                <i className="bi bi-grid-3x3-gap" />
                            </button>
                        </div>
                        <div className={styles.stats}>
                            {stats.map((stat) => (
                                <div key={stat.label} className={styles.statCard}>
                                    <div className={styles.statIcon}>
                                        <i className={`bi ${stat.icon}`} />
                                    </div>

                                    <strong>{stat.value}</strong>

                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.visual}>
                        <div className={styles.featureGrid}>
                            {features.map((feature) => (
                                <div key={feature.title} className={styles.feature}>
                                    <i className={`bi ${feature.icon}`} />

                                    <div>
                                        <strong>{feature.title}</strong>
                                        <span>{feature.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.canvasWrapper}>
                            <div className={styles.glow} />

                            <div className={styles.canvas}>
                                <img src={image} alt={heroTitle} />
                            </div>

                            <div className={styles.performanceCard}>
                                <div className={styles.performanceIcon}>
                                    <i className="bi bi-rocket-takeoff-fill" />
                                </div>

                                <div>
                                    <strong>{performanceScore}</strong>
                                    <span>{performanceLabel}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.capabilityBar}>
                            {capabilities.map((item) => (
                                <div key={item.label} className={styles.capability}>
                                    <i className={`bi ${item.icon}`} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.aboutVisionRoot}>
                <div className={styles.aboutVisionGlowLeft} />
                <div className={styles.aboutVisionGlowRight} />

                <div className={styles.aboutVisionShell}>
                    <div className={styles.aboutVisionNarrative}>
                        <span className={styles.aboutVisionPill}>
                            <i className="bi bi-stars" />
                            OUR MISSION
                        </span>

                        <h2 className={styles.aboutVisionHeadline}>
                            Empowering Everyone
                            <br />
                            To Build, Grow & Succeed
                            <span> Without Code.</span>
                        </h2>

                        <p className={styles.aboutVisionSummary}>
                            At Kbuilder, our mission is to remove technical barriers and empower
                            anyone to create professional websites, business applications, and
                            digital experiences without code. We help creators, startups, agencies,
                            and enterprises launch faster, innovate confidently, and grow without
                            limits.ises to build professional digital experiences without writing
                            code.
                        </p>

                        <div className={styles.aboutVisionValueGrid}>
                            {VALUES.map((item) => (
                                <article key={item.title} className={styles.aboutVisionValueCard}>
                                    <div className={styles.aboutVisionValueHeader}>
                                        <div className={styles.aboutVisionValueIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <h3>{item.title}</h3>
                                    </div>

                                    <p>{item.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className={styles.aboutVisionDiagram}>
                        <div className={styles.aboutVisionCanvas}>
                            <div className={styles.aboutVisionAuraOne} />
                            <div className={styles.aboutVisionAuraTwo} />
                            <div className={styles.aboutVisionAuraThree} />

                            <svg
                                className={styles.aboutVisionOrbit}
                                viewBox="0 0 800 800"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <circle
                                    cx="400"
                                    cy="400"
                                    r="280"
                                    fill="none"
                                    stroke="url(#orbitGradient)"
                                    strokeWidth="3"
                                    strokeDasharray="10 12"
                                    strokeLinecap="round"
                                />

                                <defs>
                                    <linearGradient
                                        id="orbitGradient"
                                        x1="0"
                                        y1="0"
                                        x2="800"
                                        y2="800"
                                    >
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="100%" stopColor="#6366F1" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className={styles.aboutVisionCenter}>
                                <div className={styles.aboutVisionBrand}>K</div>

                                <h3>Our Mission</h3>

                                <p>Empower everyone to build professional websites without code.</p>
                            </div>

                            <div
                                className={`${styles.aboutVisionNode} ${styles.aboutVisionNodeTop}`}
                            >
                                <div className={styles.aboutVisionNodeIcon}>
                                    <i className="bi bi-bar-chart-line-fill" />
                                </div>

                                <h4>Growth</h4>

                                <p>Helping businesses and creators scale and succeed online.</p>
                            </div>

                            <div
                                className={`${styles.aboutVisionNode} ${styles.aboutVisionNodeRight}`}
                            >
                                <div className={styles.aboutVisionNodeIcon}>
                                    <i className="bi bi-shield-check" />
                                </div>

                                <h4>Reliability</h4>

                                <p>
                                    Delivering a secure, fast and dependable platform you can trust.
                                </p>
                            </div>

                            <div
                                className={`${styles.aboutVisionNode} ${styles.aboutVisionNodeBottom}`}
                            >
                                <div className={styles.aboutVisionNodeIcon}>
                                    <i className="bi bi-people-fill" />
                                </div>

                                <h4>Accessibility</h4>

                                <p>Making website creation accessible, everywhere.</p>
                            </div>

                            <div
                                className={`${styles.aboutVisionNode} ${styles.aboutVisionNodeLeft}`}
                            >
                                <div className={styles.aboutVisionNodeIcon}>
                                    <i className="bi bi-lightbulb" />
                                </div>

                                <h4>Innovation</h4>

                                <p>Pushing boundaries to create smarter and simpler solutions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.journeySection}>
                <div className={styles.journeyContainer}>
                    <div className={styles.journeyHeader}>
                        <span className={styles.eyebrow}>
                            <i className="bi bi-stars" />
                            Our Journey
                        </span>

                        <h2>
                            Building <span>Kbuilder</span> Step by Step
                        </h2>

                        <p>
                            Our journey toward making website creation faster, easier, and
                            accessible to everyone.
                        </p>
                    </div>

                    <div className={styles.journeyTimeline}>
                        <div className={styles.journeyTrack}>
                            <div className={styles.journeyProgress} />
                        </div>

                        <div className={styles.journeyGrid}>
                            {JOURNEY.map((item) => (
                                <article
                                    key={item.title}
                                    className={`${styles.journeyItem} ${
                                        item.active ? styles.journeyItemActive : ''
                                    }`}
                                >
                                    <div className={styles.journeyIconWrapper}>
                                        <div className={styles.journeyIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>
                                    </div>

                                    <div className={styles.journeyContent}>
                                        <span className={styles.journeyDate}>{item.date}</span>

                                        <h3 className={styles.journeyTitle}>{item.title}</h3>

                                        <p className={styles.journeyDescription}>
                                            {item.description}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.storySection}>
                    <div className={styles.storyContainer}>
                        <div className={styles.storyGrid}>
                            {STORIES.map((story) => (
                                <article key={story.year} className={styles.storyCard}>
                                    <div className={styles.storyContentTop}>
                                        <div className={styles.storyContent}>
                                            <span className={styles.storyBadge}>{story.badge}</span>

                                            <h3>
                                                {story.title}
                                                <span>{story.titleAccent}</span>
                                            </h3>

                                            <p>{story.description}</p>
                                        </div>

                                        <div className={styles.storyVisual}>
                                            <Image
                                                src={story.image}
                                                alt={story.imageAlt}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className={styles.storyImage}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.storyFeatures}>
                                        <article className={styles.storyFeature}>
                                            <div className={styles.storyFeatureIcon}>
                                                <i className="bi bi-search" />
                                            </div>

                                            <div className={styles.storyFeatureContent}>
                                                <div className={styles.storyFeatureHeader}>
                                                    <strong>Research & Discovery</strong>

                                                    <span>Completed</span>
                                                </div>

                                                <p>
                                                    We explored more than 50 no-code platforms,
                                                    industry trends and user expectations to
                                                    identify opportunities.
                                                </p>
                                            </div>
                                        </article>

                                        <article className={styles.storyFeature}>
                                            <div className={styles.storyFeatureIcon}>
                                                <i className="bi bi-lightbulb" />
                                            </div>

                                            <div className={styles.storyFeatureContent}>
                                                <div className={styles.storyFeatureHeader}>
                                                    <strong>Product Strategy</strong>

                                                    <span>Validated</span>
                                                </div>

                                                <p>
                                                    Designed the complete website building workflow
                                                    with a strong focus on simplicity and
                                                    productivity.
                                                </p>
                                            </div>
                                        </article>

                                        <article className={styles.storyFeature}>
                                            <div className={styles.storyFeatureIcon}>
                                                <i className="bi bi-bullseye" />
                                            </div>

                                            <div className={styles.storyFeatureContent}>
                                                <div className={styles.storyFeatureHeader}>
                                                    <strong>Kbuilder Vision</strong>

                                                    <span>2025</span>
                                                </div>

                                                <p>
                                                    Building an intelligent visual platform where
                                                    anyone can create professional websites without
                                                    writing code.
                                                </p>
                                            </div>
                                        </article>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.whyKbuilder}>
                <div className={styles.backgroundBlurOne} />
                <div className={styles.backgroundBlurTwo} />

                <div className={styles.whyKbuilderContainer}>
                    <div className={styles.whyKbuilderHero}>
                        <div className={styles.whyKbuilderContent}>
                            <span className={styles.whyKbuilderEyebrow}>
                                <span className={styles.whyKbuilderLogo}>
                                    <i className="bi bi-stars" />
                                </span>
                                Our Purpose
                            </span>

                            <h2 className={styles.whyKbuilderTitle}>
                                Why Kbuilder
                                <span> Exists</span>
                            </h2>

                            <div className={styles.whyKbuilderDivider} />

                            <p className={styles.whyKbuilderDescription}>
                                We believe creating professional websites should be simple, fast,
                                and accessible to everyone. Instead of spending months learning code
                                or hiring expensive agencies, anyone should be able to transform an
                                idea into a beautiful website within minutes.
                            </p>
                            <div className={styles.problemsGrid}>
                                {problems.map((item) => (
                                    <article key={item.title} className={styles.problemCard}>
                                        <div className={styles.problemCardIcon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <div>
                                            <h4>{item.title}</h4>

                                            <p>{item.description}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className={styles.builderBrowserBody}>
                            <Image
                                src="/assets/images/builder-preview.png"
                                alt="Kbuilder Visual Builder"
                                width={860}
                                height={620}
                                priority
                                className={styles.builderPreviewImage}
                            />
                        </div>
                    </div>

                    <div className={styles.solutionSection}>
                        <div className={styles.solutionGrid}>
                            {solutions.map((item) => (
                                <div key={item.title} className={styles.solutionCard}>
                                    <div className={styles.solutionCardIcon}>
                                        <i className={`bi ${item.icon}`} />
                                    </div>

                                    <div>
                                        <h4>{item.title}</h4>

                                        <p>{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.coreValuesSection}>
                <div className={styles.coreValuesBlurOne} />
                <div className={styles.coreValuesBlurTwo} />
                <div className={styles.coreValuesBackgroundGrid} />

                <div className={styles.coreValuesContainer}>
                    <div className={styles.coreValuesGrid}>
                        {CORE_VALUES.map((value) => (
                            <article
                                key={value.id}
                                className={`${styles.coreValueCard} ${styles[value.color]}`}
                            >
                                <div className={styles.coreValueGlow} />
                                <div className={styles.coreValuePattern} />

                                <div className={styles.coreValueIconWrapper}>
                                    <div className={styles.coreValueIconCircle}>
                                        <i className={`bi ${value.icon}`} />
                                    </div>
                                </div>

                                <div className={styles.coreValueNumber}>{value.id}</div>

                                <div className={styles.coreValueDivider} />

                                <div className={styles.coreValueContent}>
                                    <h3>{value.title}</h3>
                                    <p>{value.description}</p>
                                </div>

                                <div className={styles.coreValueFooter}>
                                    <div className={styles.coreValueTags}>
                                        {value.tags.map((tag, index) => (
                                            <span key={tag}>
                                                {tag}
                                                {index !== value.tags.length - 1 && (
                                                    <strong>•</strong>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <span className={styles.coreValueBottomBar} />
                                <span className={styles.coreValueCornerDecoration} />
                                <span className={styles.coreValueHoverBorder} />
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.teamWrapper}>
                <div className={styles.teamBlurPrimary} />
                <div className={styles.teamBlurSecondary} />
                <div className={styles.teamBackgroundGrid} />

                <div className={styles.teamContainer}>
                    <div className={styles.teamHeader}>
                        <span className={styles.teamBadge}>
                            <i className="bi bi-people-fill" />
                            OUR TEAM
                        </span>

                        <h2 className={styles.teamTitle}>
                            Meet The People Behind
                            <span>Kbuilder</span>
                        </h2>

                        <p className={styles.teamDescription}>
                            A passionate team of creators, designers, engineers and innovators
                            dedicated to building the future of modern no-code development.
                        </p>
                    </div>

                    <div className={styles.teamGrid}>
                        {TEAM.map((member) => (
                            <article
                                key={member.name}
                                className={`${styles.teamCard} ${styles[member.color]}`}
                            >
                                <div className={styles.teamCardGlow} />

                                <div className={styles.teamAvatarSection}>
                                    <div className={styles.teamAvatarBackground} />

                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={260}
                                        height={260}
                                        className={styles.teamAvatar}
                                    />

                                    <div className={styles.teamRoleBadge}>
                                        <i className={`bi ${member.icon}`} />
                                    </div>
                                </div>

                                <div className={styles.teamContent}>
                                    <h3 className={styles.teamName}>{member.name}</h3>

                                    <span className={styles.teamPosition}>{member.role}</span>

                                    <div className={styles.teamDivider} />

                                    <p className={styles.teamBio}>{member.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

function createFeatureInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `feature${index}Icon`,
            label: `Feature ${index} Icon`,
            kind: 'text',
        },
        {
            key: `feature${index}Title`,
            label: `Feature ${index} Title`,
            kind: 'text',
        },
        {
            key: `feature${index}Description`,
            label: `Feature ${index} Description`,
            kind: 'text',
        },
    ];
}

function createStatInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `stat${index}Value`,
            label: `Stat ${index} Value`,
            kind: 'text',
        },
        {
            key: `stat${index}Label`,
            label: `Stat ${index} Label`,
            kind: 'text',
        },
    ];
}

function createCapabilityInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `capability${index}Icon`,
            label: `Capability ${index} Icon`,
            kind: 'text',
        },
        {
            key: `capability${index}Label`,
            label: `Capability ${index} Label`,
            kind: 'text',
        },
    ];
}

function createValueInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `value${index}Icon`,
            label: `Value ${index} Icon`,
            kind: 'text',
        },
        {
            key: `value${index}Title`,
            label: `Value ${index} Title`,
            kind: 'text',
        },
        {
            key: `value${index}Description`,
            label: `Value ${index} Description`,
            kind: 'textarea',
        },
    ];
}

function createJourneyInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `journey${index}Icon`,
            label: `Journey ${index} Icon`,
            kind: 'text',
        },
        {
            key: `journey${index}Date`,
            label: `Journey ${index} Date`,
            kind: 'text',
        },
        {
            key: `journey${index}Title`,
            label: `Journey ${index} Title`,
            kind: 'text',
        },
        {
            key: `journey${index}Description`,
            label: `Journey ${index} Description`,
            kind: 'textarea',
        },
        {
            key: `journey${index}Active`,
            label: `Journey ${index} Active`,
            kind: 'check',
        },
    ];
}

function createStoryInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `story${index}Year`,
            label: `Story ${index} Year`,
            kind: 'text',
        },
        {
            key: `story${index}Badge`,
            label: `Story ${index} Badge`,
            kind: 'text',
        },
        {
            key: `story${index}Title`,
            label: `Story ${index} Title`,
            kind: 'text',
        },
        {
            key: `story${index}TitleAccent`,
            label: `Story ${index} Title Accent`,
            kind: 'text',
        },
        {
            key: `story${index}Description`,
            label: `Story ${index} Description`,
            kind: 'textarea',
        },
        {
            key: `story${index}Image`,
            label: `Story ${index} Image`,
            kind: 'image',
            folder: 'about',
            accept: 'image/*',
        },
        {
            key: `story${index}ImageAlt`,
            label: `Story ${index} Image Alt`,
            kind: 'text',
        },
        {
            key: `story${index}Reverse`,
            label: `Story ${index} Reverse`,
            kind: 'check',
        },
    ];
}

function createProblemInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `problem${index}Icon`,
            label: `Problem ${index} Icon`,
            kind: 'text',
        },
        {
            key: `problem${index}Title`,
            label: `Problem ${index} Title`,
            kind: 'text',
        },
        {
            key: `problem${index}Description`,
            label: `Problem ${index} Description`,
            kind: 'textarea',
        },
    ];
}

function createSolutionInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `solution${index}Icon`,
            label: `Solution ${index} Icon`,
            kind: 'text',
        },
        {
            key: `solution${index}Title`,
            label: `Solution ${index} Title`,
            kind: 'text',
        },
        {
            key: `solution${index}Description`,
            label: `Solution ${index} Description`,
            kind: 'textarea',
        },
    ];
}
function createCoreValueInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `coreValue${index}Icon`,
            label: `Core Value ${index} Icon`,
            kind: 'text',
        },
        {
            key: `coreValue${index}Title`,
            label: `Core Value ${index} Title`,
            kind: 'text',
        },
        {
            key: `coreValue${index}Description`,
            label: `Core Value ${index} Description`,
            kind: 'textarea',
        },
        {
            key: `coreValue${index}Color`,
            label: `Core Value ${index} Color`,
            kind: 'select',
            options: [
                { label: 'Purple', value: 'purple' },
                { label: 'Blue', value: 'blue' },
                { label: 'Orange', value: 'orange' },
                { label: 'Pink', value: 'pink' },
            ],
        },
    ];
}
function createTeamInspector(index: number): RegItem['inspector'] {
    return [
        {
            key: `team${index}Name`,
            label: `Team ${index} Name`,
            kind: 'text',
        },
        {
            key: `team${index}Role`,
            label: `Team ${index} Role`,
            kind: 'text',
        },
        {
            key: `team${index}Image`,
            label: `Team ${index} Image`,
            kind: 'image',
            folder: 'about/team',
            accept: 'image/*',
        },
        {
            key: `team${index}ImageAlt`,
            label: `Team ${index} Image Alt`,
            kind: 'text',
        },
    ];
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
            key: 'heroTitle',
            label: 'Hero Title',
            kind: 'text',
        },

        {
            key: 'heroTitleAccent',
            label: 'Hero Title Accent',
            kind: 'text',
        },

        {
            key: 'heroDescription',
            label: 'Hero Description',
            kind: 'textarea',
        },

        {
            key: 'image',
            label: 'Hero Image',
            kind: 'image',
            folder: 'services/about',
            accept: 'image/*',
        },

        ...Array.from({ length: 4 }, (_, i) => createFeatureInspector(i + 1)).flat(),

        ...Array.from({ length: 4 }, (_, i) => createStatInspector(i + 1)).flat(),

        ...Array.from({ length: 5 }, (_, i) => createCapabilityInspector(i + 1)).flat(),

        ...Array.from({ length: 4 }, (_, i) => createValueInspector(i + 1)).flat(),

        ...Array.from({ length: 5 }, (_, i) => createJourneyInspector(i + 1)).flat(),

        ...Array.from({ length: 2 }, (_, i) => createStoryInspector(i + 1)).flat(),

        ...Array.from({ length: 4 }, (_, i) => createProblemInspector(i + 1)).flat(),

        ...Array.from({ length: 4 }, (_, i) => createSolutionInspector(i + 1)).flat(),

        ...Array.from({ length: 4 }, (_, i) => createCoreValueInspector(i + 1)).flat(),

        ...Array.from({ length: 6 }, (_, i) => createTeamInspector(i + 1)).flat(),
    ];
}
export const ABOUT_PAGE_01: RegItem = {
    kind: 'about-page-01',

    label: 'About Page 01',

    defaults: DEFAULT_PROPS as Record<string, unknown>,

    inspector: createInspector(),

    render: (props) => <About01 {...(props as unknown as About01Props)} />,
};

export default About01;
