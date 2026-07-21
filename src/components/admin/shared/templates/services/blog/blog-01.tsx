'use client';

import { useMemo } from 'react';
import type { RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/components/admin/shared/templates/services/blog/styles/blog-01.module.css';
interface BlogItem {
    id: number;
    image: string;
    category: string;
    date: string;
    title: string;
    description: string;
    author: string;
    role: string;
    avatar: string;
}
type StoryItem = {
    image: string;
    category: string;
    categoryIcon: string;
    title: string;
    description: string;
    date: string;
    readTime: string;
};

type CommunityItem = { icon: string; title: string; description: string; featured?: boolean };

export interface Blog01Props {
    breadcrumbHome?: string;
    breadcrumbCurrent?: string;

    // Hero
    heroBadge?: string;
    heroTitle?: string;
    heroTitleAccent?: string;
    heroDescription?: string;

    heroPrimaryButton?: string;
    heroSecondaryButton?: string;

    heroReviewText?: string;
    heroRating?: string;

    heroImage?: string;
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

    blogSectionTitle?: string;
    blogSectionTitleAccent?: string;
    blogSectionDescription?: string;
    blogActionButton?: string;

    blog1Id?: number;
    blog1Image?: string;
    blog1category?: string;
    blog1Date?: string;
    blog1Title?: string;
    blog1Description?: string;
    blog1Author?: string;
    blog1Role?: string;
    blog1Avatar?: string;

    blog2Id?: number;
    blog2Image?: string;
    blog2category?: string;
    blog2Date?: string;
    blog2Title?: string;
    blog2Description?: string;
    blog2Author?: string;
    blog2Role?: string;
    blog2Avatar?: string;

    blog3Id?: number;
    blog3Image?: string;
    blog3category?: string;
    blog3Date?: string;
    blog3Title?: string;
    blog3Description?: string;
    blog3Author?: string;
    blog3Role?: string;
    blog3Avatar?: string;

    blog4Id?: number;
    blog4Image?: string;
    blog4category?: string;
    blog4Date?: string;
    blog4Title?: string;
    blog4Description?: string;
    blog4Author?: string;
    blog4Role?: string;
    blog4Avatar?: string;

    storyTitle?: string;
    storyTitleAccent?: string;
    storyDescription?: string;
    storyActionText?: string;
    storyActionLink?: string;
    featuredImage?: string;
    featuredBadge?: string;
    featuredCategory?: string;
    featuredCategoryIcon?: string;
    featuredTitle?: string;
    featuredDate?: string;
    featuredReadTime?: string;
    featuredDescription?: string;
    featuredButton?: string;
    story1Image?: string;
    story1Category?: string;
    story1CategoryIcon?: string;
    story1Title?: string;
    story1Description?: string;
    story1Date?: string;
    story1ReadTime?: string;
    story2Image?: string;
    story2Category?: string;
    story2CategoryIcon?: string;
    story2Title?: string;
    story2Description?: string;
    story2Date?: string;
    story2ReadTime?: string;
    story3Image?: string;
    story3Category?: string;
    story3CategoryIcon?: string;
    story3Title?: string;
    story3Description?: string;
    story3Date?: string;
    story3ReadTime?: string;

    trekkerBadge?: string;
    trekkerTitle?: string;
    trekkerTitleAccent?: string;
    trekkerDescription?: string;

    reviewerAvatar?: string;
    reviewerName?: string;
    reviewerRole?: string;
    reviewerVerified?: string;
    reviewerQuote?: string;
    reviewButton?: string;

    community1Icon?: string;
    community1Title?: string;
    community1Description?: string;

    community2Icon?: string;
    community2Title?: string;
    community2Description?: string;
    community2Featured?: string | boolean;

    community3Icon?: string;
    community3Title?: string;
    community3Description?: string;

    travelHeroImage?: string;
    travelHeroTitle?: string;
    travelHeroStories?: string;
    travelHeroLocation?: string;

    travelVideoImage?: string;
    travelVideoDuration?: string;
    travelVideoBadge?: string;
    travelVideoTitle?: string;
    travelVideoDescription?: string;
    travelViews?: string;
    travelViewsLabel?: string;
    travelRating?: string;
    travelRatingLabel?: string;
    travelComments?: string;
    travelCommentsLabel?: string;
    travelButton?: string;
}

export const DEFAULT_PROPS: Required<Blog01Props> = {
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Blog',
    heroBadge: 'AI-Powered Website Builder',
    heroTitle: 'Build Beautiful Websites Visually',
    heroTitleAccent: 'Launch Instantly.',
    heroDescription:
        'Kbuilder is the all-in-one platform to create, customize and publish stunning websites — without coding, without limits.',
    heroPrimaryButton: 'Start Building Free',
    heroSecondaryButton: 'Watch Demo',
    heroReviewText: 'Trusted by 10,000+ creators and businesses',
    heroRating: '4.9/5',
    heroImage: '/assets/images/hero-builder.png',
    feature1Icon: 'bi-cursor-fill',
    feature1Title: 'Drag & Drop',
    feature1Description: 'No code needed',
    feature2Icon: 'bi-grid-3x3-gap-fill',
    feature2Title: 'Beautiful Templates',
    feature2Description: '100+ professional',
    feature3Icon: 'bi-lightning-charge-fill',
    feature3Title: 'AI Automation',
    feature3Description: 'Save time & effort',
    feature4Icon: 'bi-cloud-arrow-up-fill',
    feature4Title: 'One-Click Publish',
    feature4Description: 'Go live in minutes',

    blogSectionTitle: 'Insights &',
    blogSectionTitleAccent: 'Inspiration',
    blogSectionDescription:
        'Explore industry trends, tutorials and stories to help you build better websites and grow your business.',
    blogActionButton: 'View all articles',

    blog1Id: 1,
    blog1Image: '/assets/images/blog-01.png',
    blog1category: 'Web Design',
    blog1Date: 'May 20, 2024',
    blog1Title: '10 Web Design Trends That Will Dominate 2024',
    blog1Description:
        'Discover the latest UI, UX and web design trends that are shaping modern digital experiences.',
    blog1Author: 'Michael Chen',
    blog1Role: 'Product Designer',
    blog1Avatar: '/assets/images/avatar-1.png',

    blog2Id: 2,
    blog2Image: '/assets/images/blog-02.png',
    blog2category: 'Tutorials',
    blog2Date: 'May 18, 2024',
    blog2Title: 'How To Build A Stunning Portfolio Website',
    blog2Description:
        'Learn how to create a modern portfolio website using reusable components and responsive layouts.',
    blog2Author: 'Sophia Martinez',
    blog2Role: 'UI/UX Designer',
    blog2Avatar: '/assets/images/avatar-2.png',

    blog3Id: 3,
    blog3Image: '/assets/images/blog-03.png',
    blog3category: 'Marketing',
    blog3Date: 'May 15, 2024',
    blog3Title: 'Content Marketing Strategies For SaaS Startups',
    blog3Description:
        'Grow your SaaS business with proven content marketing strategies that convert visitors.',
    blog3Author: 'David Park',
    blog3Role: 'Marketing Manager',
    blog3Avatar: '/assets/images/avatar-3.png',

    blog4Id: 4,
    blog4Image: '/assets/images/blog-04.png',
    blog4category: 'Business',
    blog4Date: 'May 12, 2024',
    blog4Title: 'Scaling Your Business With No-Code Tools',
    blog4Description:
        'Discover how automation and no-code platforms help businesses scale much faster.',
    blog4Author: 'Emily Johnson',
    blog4Role: 'Business Consultant',
    blog4Avatar: '/assets/images/avatar-4.png',

    storyTitle: 'Latest',
    storyTitleAccent: 'Stories',
    storyDescription:
        'Fresh insights, expert tips and inspiring stories to help you build, grow and succeed with confidence and succeed with confidence.',
    storyActionText: 'See all articles',
    storyActionLink: '/blog',
    featuredImage: '/assets/images/hero-builder.png',
    featuredBadge: 'FEATURED',
    featuredCategory: 'Food & Drink',
    featuredCategoryIcon: 'bi-cup-hot',
    featuredTitle: 'Los Angeles food & drink guide: 10 things to try in Los Angeles, California',
    featuredDate: 'Aug 12, 2024',
    featuredReadTime: '6 min read',
    featuredDescription:
        'From iconic landmarks to hidden local gems, discover the best restaurants, cafes and unforgettable culinary experiences throughout Los Angeles.',
    featuredButton: 'Read article',
    story1Image: '/assets/images/blog-02.png',
    story1Category: 'Travel',
    story1CategoryIcon: 'bi-send',
    story1Title: "15 South London Markets You'll Love: From Markets to South London",
    story1Description:
        'Explore vibrant weekend markets, discover unique local shops, enjoy authentic street food, and uncover hidden gems across South London with this complete travel guide.',
    story1Date: 'Jul 28, 2024',
    story1ReadTime: '5 min read',
    story2Image: '/assets/images/blog-03.png',
    story2Category: 'Health',
    story2CategoryIcon: 'bi-heart-pulse',
    story2Title: '10 incredible healthy recipes you can cook using plants in 2024',
    story2Description:
        'Discover simple plant-based recipes packed with fresh ingredients, essential nutrients, and delicious flavors to support a healthier lifestyle every day.',
    story2Date: 'Jul 20, 2024',
    story2ReadTime: '4 min read',
    story3Image: '/assets/images/blog-04.png',
    story3Category: 'Tips & Culture',
    story3CategoryIcon: 'bi-book',
    story3Title: 'Visiting Chicago on a Budget: Affordable Eats and Attraction Deals',
    story3Description:
        'Plan an unforgettable Chicago adventure with budget-friendly restaurants, free attractions, transportation tips, and local experiences without overspending.',
    story3Date: 'Jul 08, 2024',
    story3ReadTime: '6 min read',

    trekkerBadge: 'Community Highlights',
    trekkerTitle: "Trekker's",
    trekkerTitleAccent: 'Highlights',
    trekkerDescription:
        'Discover inspiring journeys, authentic stories and unforgettable experiences shared by creators who build, explore and grow with Kbuilder.',

    reviewerAvatar: '/assets/images/avatar-1.png',
    reviewerName: 'Mario Kingston',
    reviewerRole: 'Travel Creator',
    reviewerVerified: 'Verified Creator',
    reviewerQuote:
        'Kbuilder completely transformed the way I build websites. Everything feels effortless, fast and beautifully designed. I launched my travel blog within a single afternoon.',
    reviewButton: 'Read Full Story',

    community1Icon: 'bi-signpost-split-fill',
    community1Title: 'Lots of Choices',
    community1Description:
        'Browse hundreds of carefully selected destinations and travel experiences.',

    community2Icon: 'bi-people-fill',
    community2Title: 'Best Tour Guide',
    community2Description:
        'Professional local guides help you discover authentic places and stories.',
    community2Featured: true,

    community3Icon: 'bi-calendar2-check-fill',
    community3Title: 'Easy Booking',
    community3Description:
        'Book your next adventure in just a few clicks with instant confirmation.',

    travelHeroImage: '/assets/images/travel-01.png',
    travelHeroTitle: 'Adventure',
    travelHeroStories: '+120 Stories',
    travelHeroLocation: 'Cappadocia, Turkey',
    travelVideoImage: '/assets/images/travel-video.png',
    travelVideoDuration: '03:28',
    travelVideoBadge: 'Travel Story',
    travelVideoTitle: 'Explore breathtaking destinations through inspiring creator stories.',
    travelVideoDescription:
        'Watch how creators capture unforgettable adventures, share authentic experiences, and inspire millions with beautiful visual storytelling built using Kbuilder.',
    travelViews: '18K+',
    travelViewsLabel: 'Views',
    travelRating: '4.9',
    travelRatingLabel: 'Rating',
    travelComments: '245',
    travelCommentsLabel: 'Comments',
    travelButton: 'Watch Journey',
};

export function BlogPage01(props: Blog01Props) {
    const {
        breadcrumbHome,
        breadcrumbCurrent,
        heroBadge,
        heroTitle,
        heroTitleAccent,
        heroDescription,
        heroPrimaryButton,
        heroSecondaryButton,
        heroReviewText,
        heroRating,
        heroImage,
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

        blogSectionTitle,
        blogSectionTitleAccent,
        blogSectionDescription,
        blogActionButton,

        blog1Id,
        blog1Image,
        blog1category,
        blog1Date,
        blog1Title,
        blog1Description,
        blog1Author,
        blog1Role,
        blog1Avatar,

        blog2Id,
        blog2Image,
        blog2category,
        blog2Date,
        blog2Title,
        blog2Description,
        blog2Author,
        blog2Role,
        blog2Avatar,

        blog3Id,
        blog3Image,
        blog3category,
        blog3Date,
        blog3Title,
        blog3Description,
        blog3Author,
        blog3Role,
        blog3Avatar,

        blog4Id,
        blog4Image,
        blog4category,
        blog4Date,
        blog4Title,
        blog4Description,
        blog4Author,
        blog4Role,
        blog4Avatar,

        storyTitle,
        storyTitleAccent,
        storyDescription,
        storyActionText,
        storyActionLink,
        featuredImage,
        featuredBadge,
        featuredCategory,
        featuredCategoryIcon,
        featuredTitle,
        featuredDate,
        featuredReadTime,
        featuredDescription,
        featuredButton,
        story1Image,
        story1Category,
        story1CategoryIcon,
        story1Title,
        story1Description,
        story1Date,
        story1ReadTime,
        story2Image,
        story2Category,
        story2CategoryIcon,
        story2Title,
        story2Description,
        story2Date,
        story2ReadTime,
        story3Image,
        story3Category,
        story3CategoryIcon,
        story3Title,
        story3Description,
        story3Date,
        story3ReadTime,
        trekkerBadge,
        trekkerTitle,
        trekkerTitleAccent,
        trekkerDescription,

        reviewerAvatar,
        reviewerName,
        reviewerRole,
        reviewerVerified,
        reviewerQuote,
        reviewButton,
        community1Icon,
        community1Title,
        community1Description,

        community2Icon,
        community2Title,
        community2Description,

        community3Icon,
        community3Title,
        community3Description,

        travelHeroImage,
        travelHeroTitle,
        travelHeroStories,
        travelHeroLocation,

        travelVideoImage,
        travelVideoDuration,
        travelVideoBadge,
        travelVideoTitle,
        travelVideoDescription,
        travelViews,
        travelViewsLabel,
        travelRating,
        travelRatingLabel,
        travelComments,
        travelCommentsLabel,
        travelButton,
    } = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const FEATURES = [
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
    ];

    const BLOGS: BlogItem[] = [
        {
            id: blog1Id,
            image: blog1Image,
            category: blog1category,
            date: blog1Date,
            title: blog1Title,
            description: blog1Description,
            author: blog1Author,
            role: blog1Role,
            avatar: blog1Avatar,
        },
        {
            id: blog2Id,
            image: blog2Image,
            category: blog2category,
            date: blog2Date,
            title: blog2Title,
            description: blog2Description,
            author: blog2Author,
            role: blog2Role,
            avatar: blog2Avatar,
        },
        {
            id: blog3Id,
            image: blog3Image,
            category: blog3category,
            date: blog3Date,
            title: blog3Title,
            description: blog3Description,
            author: blog3Author,
            role: blog3Role,
            avatar: blog3Avatar,
        },
        {
            id: blog4Id,
            image: blog4Image,
            category: blog4category,
            date: blog4Date,
            title: blog4Title,
            description: blog4Description,
            author: blog4Author,
            role: blog4Role,
            avatar: blog4Avatar,
        },
    ];

    const stories: StoryItem[] = [
        {
            image: story1Image,
            category: story1Category,
            categoryIcon: story1CategoryIcon,
            title: story1Title,
            description: story1Description,
            date: story1Date,
            readTime: story1ReadTime,
        },
        {
            image: story2Image,
            category: story2Category,
            categoryIcon: story2CategoryIcon,
            title: story2Title,
            description: story2Description,
            date: story2Date,
            readTime: story2ReadTime,
        },
        {
            image: story3Image,
            category: story3Category,
            categoryIcon: story3CategoryIcon,
            title: story3Title,
            description: story3Description,
            date: story3Date,
            readTime: story3ReadTime,
        },
    ];

    const communities: CommunityItem[] = [
        { icon: community1Icon, title: community1Title, description: community1Description },
        {
            icon: community2Icon,
            title: community2Title,
            description: community2Description,
            featured: true,
        },
        { icon: community3Icon, title: community3Title, description: community3Description },
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
                <div className={styles.blurOne} />
                <div className={styles.blurTwo} />
                <div className={styles.gridBackground} />

                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.content}>
                            <div className={styles.badge}>
                                <i className="bi bi-stars" />
                                <span>{heroBadge}</span>
                            </div>

                            <h1>
                                {heroTitle}
                                <span>{heroTitleAccent}</span>
                            </h1>

                            <p>{heroDescription}</p>

                            <div className={styles.features}>
                                {FEATURES.map((item) => (
                                    <div key={item.title} className={styles.feature}>
                                        <div className={styles.icon}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>

                                        <strong>{item.title}</strong>

                                        <span>{item.description}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.primaryButton}>
                                    {heroPrimaryButton}
                                    <i className="bi bi-arrow-right" />
                                </button>

                                <button className={styles.secondaryButton}>
                                    <i className="bi bi-play-fill" />
                                    {heroSecondaryButton}
                                </button>
                            </div>

                            <div className={styles.review}>
                                <div className={styles.avatarGroup}>
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <Image
                                            key={item}
                                            src={`/assets/images/avatar-${item}.png`}
                                            alt=""
                                            width={46}
                                            height={46}
                                        />
                                    ))}
                                </div>

                                <div className={styles.reviewContent}>
                                    <span>{heroReviewText}</span>

                                    <div className={styles.rating}>
                                        <strong>{heroRating}</strong>

                                        <div>
                                            {[1, 2, 3, 4, 5].map((item) => (
                                                <i key={item} className="bi bi-star-fill" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.visual}>
                            <Image
                                src={heroImage}
                                alt={heroTitle}
                                fill
                                priority
                                sizes="(max-width:768px)100vw,(max-width:1200px)60vw,50vw"
                                className={styles.heroImage}
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.blogSection}>
                <div className={styles.blogContainer}>
                    {/* Header */}

                    <div className={styles.blogHeading}>
                        <div className={styles.blogHeadingContent}>
                            <h2 className={styles.blogTitle}>
                                {blogSectionTitle} <span>{blogSectionTitleAccent}</span>
                            </h2>
                            <p className={styles.blogDescription}>{blogSectionDescription}</p>
                        </div>
                        <button className={styles.blogActionButton}>
                            {blogActionButton} <i className="bi bi-arrow-right" />
                        </button>
                    </div>

                    {/* Blog List */}

                    <div className={styles.blogGrid}>
                        {BLOGS.map((blog) => (
                            <article key={blog.id} className={styles.blogCard}>
                                {/* Cover */}

                                <div className={styles.blogCover}>
                                    <Image
                                        src={blog.image}
                                        alt={blog.title}
                                        fill
                                        sizes="100vw, (min-width:768px) 50vw, (min-width:1200px) 33vw"
                                        className={styles.blogCoverImage}
                                    />

                                    <button className={styles.blogBookmark}>
                                        <i className="bi bi-bookmark" />
                                    </button>
                                </div>

                                {/* Content */}

                                <div className={styles.blogContent}>
                                    <div className={styles.blogMeta}>
                                        <span className={styles.blogCategory}>{blog.category}</span>

                                        <span className={styles.blogDate}>
                                            <i className="bi bi-calendar3" />

                                            {blog.date}
                                        </span>
                                    </div>

                                    <h3 className={styles.blogCardTitle}>{blog.title}</h3>

                                    <p className={styles.blogExcerpt}>{blog.description}</p>

                                    <div className={styles.blogCardFooter}>
                                        <div className={styles.blogAuthor}>
                                            <Image
                                                src={blog.avatar}
                                                alt={blog.author}
                                                width={48}
                                                height={48}
                                            />

                                            <div className={styles.blogAuthorInfo}>
                                                <strong>{blog.author}</strong>

                                                <span>{blog.role}</span>
                                            </div>
                                        </div>

                                        <button className={styles.blogArrowButton}>
                                            <i className="bi bi-arrow-right" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}

                    <div className={styles.blogPagination}>
                        <span className={styles.blogPaginationActive} />
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
            </section>
            <section className={styles.storySphere}>
                <div className={styles.storyGlowLeft} />
                <div className={styles.storyGlowRight} />
                <div className={styles.storyShell}>
                    <div className={styles.storyBanner}>
                        <div className={styles.storyHeadline}>
                            <h2 className={styles.storyTitle}>
                                {storyTitle} <span>{storyTitleAccent}</span>
                            </h2>
                            <p className={styles.storySubtitle}> {storyDescription} </p>
                        </div>
                        <Link href={storyActionLink} className={styles.storyAction}>
                            <span>{storyActionText}</span>
                            <div className={styles.storyActionIcon}>
                                <i className="bi bi-arrow-right" />
                            </div>
                        </Link>
                    </div>
                    <div className={styles.storyShowcase}>
                        <article className={styles.storyFeatureCard}>
                            <div className={styles.storyMedia}>
                                <Image
                                    src={featuredImage}
                                    alt={featuredTitle}
                                    fill
                                    priority
                                    sizes="(max-width:768px)100vw,(max-width:1200px)60vw,50vw"
                                    className={styles.heroImage}
                                />
                                <span className={styles.storyFeatureBadge}> {featuredBadge} </span>
                                <button className={styles.storyBookmark}>
                                    <i className="bi bi-bookmark" />
                                </button>
                            </div>
                            <div className={styles.storyBody}>
                                <span className={styles.storyCategory}>
                                    <i className={`bi ${featuredCategoryIcon}`} />
                                    {featuredCategory}
                                </span>
                                <h3 className={styles.storyHeading}> {featuredTitle} </h3>
                                <div className={styles.storyMeta}>
                                    <div className={styles.storyMetaItem}>
                                        <i className="bi bi-calendar3" /> {featuredDate}
                                    </div>
                                    <span className={styles.storyDot} />
                                    <div className={styles.storyMetaItem}>
                                        <i className="bi bi-clock" /> {featuredReadTime}
                                    </div>
                                </div>
                                <p className={styles.storyExcerpt}> {featuredDescription} </p>
                                <a href="#" className={styles.storyReadMore}>
                                    {featuredButton} <i className="bi bi-arrow-right" />
                                </a>
                            </div>
                        </article>
                        <div className={styles.storySideList}>
                            {stories.map((story) => (
                                <article key={story.title} className={styles.storyMiniCard}>
                                    <div className={styles.storyMiniThumb}>
                                        <Image
                                            src={story.image}
                                            alt={story.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 220px"
                                            className={styles.storyMiniImage}
                                        />
                                    </div>

                                    <div className={styles.storyMiniContent}>
                                        <span className={styles.storyMiniCategory}>
                                            <i className={`bi ${story.categoryIcon}`} />
                                            {story.category}
                                        </span>
                                        <h4 className={styles.storyMiniTitle}> {story.title} </h4>
                                        <p className={styles.storyMiniDescription}>
                                            {story.description}
                                        </p>
                                        <div className={styles.storyMiniMeta}>
                                            <div className={styles.storyMiniMetaItem}>
                                                <i className="bi bi-calendar3" /> {story.date}
                                            </div>
                                            <span className={styles.storyMiniDot} />
                                            <div className={styles.storyMiniMetaItem}>
                                                <i className="bi bi-clock" /> {story.readTime}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className={styles.storyPager}>
                            <span
                                className={`${styles.storyPagerItem} ${styles.storyPagerActive}`}
                            />
                            <span className={styles.storyPagerItem} />
                            <span className={styles.storyPagerItem} />
                            <span className={styles.storyPagerItem} />
                            <span className={styles.storyPagerItem} />
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.trekkerSection}>
                <div className={styles.trekkerBlurOne} />
                <div className={styles.trekkerBlurTwo} />
                <div className={styles.trekkerDots} />

                <div className={styles.trekkerShell}>
                    <div className={styles.trekkerGrid}>
                        {/* LEFT */}

                        <div className={styles.trekkerIntro}>
                            <span className={styles.trekkerBadge}>
                                <i className="bi bi-people-fill" /> {trekkerBadge}
                            </span>

                            <h2 className={styles.trekkerHeading}>
                                {trekkerTitle} <span>{trekkerTitleAccent}</span>
                            </h2>

                            <p className={styles.trekkerSummary}> {trekkerDescription} </p>

                            <article className={styles.trekkerReview}>
                                <div className={styles.trekkerReviewer}>
                                    <div className={styles.trekkerAvatar}>
                                        <Image
                                            src={reviewerAvatar}
                                            alt={reviewerName}
                                            width={72}
                                            height={72}
                                        />
                                    </div>

                                    <div className={styles.trekkerIdentity}>
                                        <h4>{reviewerName}</h4>
                                        <span>{reviewerRole}</span>
                                    </div>
                                    <div className={styles.trekkerStar}>
                                        <div className={styles.trekkerVerified}>
                                            <i className="bi bi-patch-check-fill" />
                                            {reviewerVerified}
                                        </div>
                                        <div className={styles.trekkerStars}>
                                            {[1, 2, 3, 4, 5].map((item) => (
                                                <i key={item} className="bi bi-star-fill" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <blockquote className={styles.trekkerQuote}>
                                    <i className="bi bi-quote" />

                                    <p>{reviewerQuote}</p>
                                </blockquote>

                                <div className={styles.trekkerActions}>
                                    <a href="#"> {reviewButton} </a>

                                    <button className={styles.trekkerFavorite}>
                                        <i className="bi bi-heart" />
                                    </button>
                                </div>
                                <div className={styles.gridStatus}>
                                    {communities.map((item) => (
                                        <article
                                            key={item.title}
                                            className={`${styles.card} ${
                                                item.featured ? styles.featured : ''
                                            }`}
                                        >
                                            <div className={styles.icon}>
                                                <i className={`bi ${item.icon}`} />
                                            </div>

                                            <h3>{item.title}</h3>

                                            <p>{item.description}</p>
                                        </article>
                                    ))}
                                </div>
                            </article>
                        </div>

                        <div className={styles.trekkerVisual}>
                            {/* ================= HERO IMAGE ================= */}

                            <div className={styles.trekkerHeroCard}>
                                <Image
                                    src={travelHeroImage}
                                    alt={travelHeroTitle}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                                    className={styles.trekkerHeroImage}
                                />

                                <div className={styles.trekkerOverlay} />

                                <div className={styles.trekkerFloating}>
                                    <div className={styles.trekkerFloatingIcon}>
                                        <i className="bi bi-people-fill" />
                                    </div>

                                    <div>
                                        <h5>{travelHeroTitle}</h5>
                                        <span>{travelHeroStories}</span>
                                    </div>
                                </div>

                                <div className={styles.trekkerLocation}>
                                    <i className="bi bi-geo-alt-fill" /> {travelHeroLocation}
                                </div>

                                <button className={styles.trekkerBookmark}>
                                    <i className="bi bi-bookmark-heart-fill" />
                                </button>
                            </div>

                            {/* ================= VIDEO CARD ================= */}

                            <article className={styles.trekkerJourney}>
                                <div className={styles.trekkerJourneyMedia}>
                                    <Image
                                        src={travelVideoImage}
                                        alt={travelVideoTitle}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                                        className={styles.trekkerJourneyImage}
                                    />

                                    <div className={styles.trekkerJourneyMask} />

                                    <button className={styles.trekkerPlayButton}>
                                        <i className="bi bi-play-fill" />
                                    </button>

                                    <div className={styles.trekkerDuration}>
                                        <i className="bi bi-camera-video-fill" />
                                        {travelVideoDuration}
                                    </div>
                                </div>

                                <div className={styles.trekkerJourneyContent}>
                                    <span className={styles.trekkerJourneyBadge}>
                                        <i className="bi bi-film" />
                                        {travelVideoBadge}
                                    </span>

                                    <h3 className={styles.trekkerJourneyTitle}>
                                        {travelVideoTitle}
                                    </h3>

                                    <p className={styles.trekkerJourneyDescription}>
                                        {travelVideoDescription}
                                    </p>

                                    <div className={styles.trekkerJourneyFooter}>
                                        <div className={styles.trekkerJourneyStats}>
                                            <div className={styles.trekkerJourneyStat}>
                                                <strong>{travelViews}</strong>
                                                <span>{travelViewsLabel}</span>
                                            </div>

                                            <div className={styles.trekkerJourneyDivider} />

                                            <div className={styles.trekkerJourneyStat}>
                                                <strong>{travelRating}</strong>
                                                <span>{travelRatingLabel}</span>
                                            </div>

                                            <div className={styles.trekkerJourneyDivider} />

                                            <div className={styles.trekkerJourneyStat}>
                                                <strong>{travelComments}</strong>
                                                <span>{travelCommentsLabel}</span>
                                            </div>
                                        </div>

                                        <a href="#" className={styles.trekkerJourneyButton}>
                                            {travelButton}
                                            <i className="bi bi-arrow-up-right" />
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function createFeatureInspector(count: number): RegItem['inspector'] {
    return Array.from({ length: count }, (_, index) => {
        const no = index + 1;

        return [
            {
                key: `feature${no}Icon`,
                label: `Feature ${no} Icon`,
                kind: 'text' as const,
            },
            {
                key: `feature${no}Title`,
                label: `Feature ${no} Title`,
                kind: 'text' as const,
            },
            {
                key: `feature${no}Description`,
                label: `Feature ${no} Description`,
                kind: 'textarea' as const,
            },
        ];
    }).flat() as RegItem['inspector'];
}

function createBlogInspector(count: number): RegItem['inspector'] {
    const inspector: RegItem['inspector'] = [];

    for (let i = 1; i <= count; i++) {
        inspector.push(
            {
                key: `blog${i}Id`,
                label: `Blog ${i} ID`,
                kind: 'number',
            },
            {
                key: `blog${i}Image`,
                label: `Blog ${i} Image`,
                kind: 'image',
                folder: 'blog',
            },
            {
                key: `blog${i}category`,
                label: `Blog ${i} Category`,
                kind: 'text',
            },
            {
                key: `blog${i}Date`,
                label: `Blog ${i} Date`,
                kind: 'text',
            },
            {
                key: `blog${i}Title`,
                label: `Blog ${i} Title`,
                kind: 'text',
            },
            {
                key: `blog${i}Description`,
                label: `Blog ${i} Description`,
                kind: 'textarea',
            },
            {
                key: `blog${i}Author`,
                label: `Blog ${i} Author`,
                kind: 'text',
            },
            {
                key: `blog${i}Role`,
                label: `Blog ${i} Role`,
                kind: 'text',
            },
            {
                key: `blog${i}Avatar`,
                label: `Blog ${i} Avatar`,
                kind: 'image',
                folder: 'blog',
            },
        );
    }

    return inspector;
}

function createStoryInspector(count: number): RegItem['inspector'] {
    const inspector: RegItem['inspector'] = [
        {
            key: 'storyTitle',
            label: 'Story Title',
            kind: 'text',
        },
        {
            key: 'storyTitleAccent',
            label: 'Story Title Accent',
            kind: 'text',
        },
        {
            key: 'storyDescription',
            label: 'Story Description',
            kind: 'textarea',
        },
        {
            key: 'storyActionText',
            label: 'Action Button',
            kind: 'text',
        },
        {
            key: 'storyActionLink',
            label: 'Action Link',
            kind: 'text',
        },

        // Featured Story
        {
            key: 'featuredImage',
            label: 'Featured Image',
            kind: 'image',
            folder: 'blog',
        },
        {
            key: 'featuredBadge',
            label: 'Featured Badge',
            kind: 'text',
        },
        {
            key: 'featuredCategory',
            label: 'Featured Category',
            kind: 'text',
        },
        {
            key: 'featuredCategoryIcon',
            label: 'Featured Category Icon',
            kind: 'text',
        },
        {
            key: 'featuredTitle',
            label: 'Featured Title',
            kind: 'text',
        },
        {
            key: 'featuredDate',
            label: 'Featured Date',
            kind: 'text',
        },
        {
            key: 'featuredReadTime',
            label: 'Featured Read Time',
            kind: 'text',
        },
        {
            key: 'featuredDescription',
            label: 'Featured Description',
            kind: 'textarea',
        },
        {
            key: 'featuredButton',
            label: 'Featured Button',
            kind: 'text',
        },
    ];

    for (let i = 1; i <= count; i++) {
        inspector.push(
            {
                key: `story${i}Image`,
                label: `Story ${i} Image`,
                kind: 'image',
                folder: 'blog',
            },
            {
                key: `story${i}Category`,
                label: `Story ${i} Category`,
                kind: 'text',
            },
            {
                key: `story${i}CategoryIcon`,
                label: `Story ${i} Category Icon`,
                kind: 'text',
            },
            {
                key: `story${i}Title`,
                label: `Story ${i} Title`,
                kind: 'text',
            },
            {
                key: `story${i}Description`,
                label: `Story ${i} Description`,
                kind: 'textarea',
            },
            {
                key: `story${i}Date`,
                label: `Story ${i} Date`,
                kind: 'text',
            },
            {
                key: `story${i}ReadTime`,
                label: `Story ${i} Read Time`,
                kind: 'text',
            },
        );
    }

    return inspector;
}

function createCommunityInspector(count: number): RegItem['inspector'] {
    const inspector: RegItem['inspector'] = [
        // =========================
        // Community Section
        // =========================

        {
            key: 'trekkerBadge',
            label: 'Community Badge',
            kind: 'text',
        },
        {
            key: 'trekkerTitle',
            label: 'Community Title',
            kind: 'text',
        },
        {
            key: 'trekkerTitleAccent',
            label: 'Community Title Accent',
            kind: 'text',
        },
        {
            key: 'trekkerDescription',
            label: 'Community Description',
            kind: 'textarea',
        },

        // =========================
        // Reviewer
        // =========================

        {
            key: 'reviewerAvatar',
            label: 'Reviewer Avatar',
            kind: 'image',
            folder: 'blog',
        },
        {
            key: 'reviewerName',
            label: 'Reviewer Name',
            kind: 'text',
        },
        {
            key: 'reviewerRole',
            label: 'Reviewer Role',
            kind: 'text',
        },
        {
            key: 'reviewerVerified',
            label: 'Reviewer Verified',
            kind: 'text',
        },
        {
            key: 'reviewerQuote',
            label: 'Reviewer Quote',
            kind: 'textarea',
        },
        {
            key: 'reviewButton',
            label: 'Review Button',
            kind: 'text',
        },
    ];

    for (let i = 1; i <= count; i++) {
        inspector.push(
            {
                key: `community${i}Icon`,
                label: `Community ${i} Icon`,
                kind: 'text',
            },
            {
                key: `community${i}Title`,
                label: `Community ${i} Title`,
                kind: 'text',
            },
            {
                key: `community${i}Description`,
                label: `Community ${i} Description`,
                kind: 'textarea',
            },
        );

        // Chỉ card thứ 2 có thuộc tính Featured
        if (i === 2) {
            inspector.push({
                key: 'community2Featured',
                label: 'Community 2 Featured',
                kind: 'check',
            });
        }
    }

    return inspector;
}

function createInspector(): RegItem['inspector'] {
    return [
        // =========================
        // Breadcrumb
        // =========================

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

        // =========================
        // Hero
        // =========================

        {
            key: 'heroBadge',
            label: 'Hero Badge',
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
            key: 'heroPrimaryButton',
            label: 'Primary Button',
            kind: 'text',
        },
        {
            key: 'heroSecondaryButton',
            label: 'Secondary Button',
            kind: 'text',
        },
        {
            key: 'heroReviewText',
            label: 'Review Text',
            kind: 'text',
        },
        {
            key: 'heroRating',
            label: 'Rating',
            kind: 'text',
        },
        {
            key: 'heroImage',
            label: 'Hero Image',
            kind: 'image',
            folder: 'blog',
        },

        // =========================
        // Hero Features
        // =========================

        ...createFeatureInspector(4),

        // =========================
        // Blog Section
        // =========================

        {
            key: 'blogSectionTitle',
            label: 'Section Title',
            kind: 'text',
        },
        {
            key: 'blogSectionTitleAccent',
            label: 'Section Accent',
            kind: 'text',
        },
        {
            key: 'blogSectionDescription',
            label: 'Section Description',
            kind: 'textarea',
        },
        {
            key: 'blogActionButton',
            label: 'Action Button',
            kind: 'text',
        },

        // =========================
        // Blogs
        // =========================

        ...createBlogInspector(4),

        // =========================
        // Featured Story
        // =========================

        {
            key: 'featuredImage',
            label: 'Featured Image',
            kind: 'image',
            folder: 'blog',
        },
        {
            key: 'featuredTitle',
            label: 'Featured Title',
            kind: 'text',
        },
        {
            key: 'featuredDescription',
            label: 'Featured Description',
            kind: 'textarea',
        },

        // =========================
        // Story List
        // =========================

        ...createStoryInspector(3),

        // =========================
        // Community
        // =========================

        {
            key: 'trekkerBadge',
            label: 'Community Badge',
            kind: 'text',
        },
        {
            key: 'trekkerTitle',
            label: 'Community Title',
            kind: 'text',
        },
        {
            key: 'trekkerTitleAccent',
            label: 'Community Accent',
            kind: 'text',
        },
        {
            key: 'trekkerDescription',
            label: 'Community Description',
            kind: 'textarea',
        },

        // =========================
        // Reviewer
        // =========================

        {
            key: 'reviewerAvatar',
            label: 'Reviewer Avatar',
            kind: 'image',
            folder: 'blog',
        },
        {
            key: 'reviewerName',
            label: 'Reviewer Name',
            kind: 'text',
        },
        {
            key: 'reviewerRole',
            label: 'Reviewer Role',
            kind: 'text',
        },
        {
            key: 'reviewerQuote',
            label: 'Reviewer Quote',
            kind: 'textarea',
        },

        // =========================
        // Community Cards
        // =========================

        ...createCommunityInspector(3),

        // =========================
        // Travel Hero
        // =========================

        {
            key: 'travelHeroImage',
            label: 'Travel Image',
            kind: 'image',
            folder: 'blog',
        },
        {
            key: 'travelHeroTitle',
            label: 'Travel Title',
            kind: 'text',
        },
        {
            key: 'travelHeroStories',
            label: 'Stories',
            kind: 'text',
        },
        {
            key: 'travelHeroLocation',
            label: 'Location',
            kind: 'text',
        },

        // =========================
        // Video Card
        // =========================

        {
            key: 'travelVideoImage',
            label: 'Video Image',
            kind: 'image',
            folder: 'blog',
        },
        {
            key: 'travelVideoTitle',
            label: 'Video Title',
            kind: 'text',
        },
        {
            key: 'travelVideoDescription',
            label: 'Video Description',
            kind: 'textarea',
        },
        {
            key: 'travelButton',
            label: 'Button',
            kind: 'text',
        },
    ];
}

export const BLOG_PAGE_01: RegItem = {
    kind: 'blog-page-01',
    label: 'Blog Page 01',
    defaults: DEFAULT_PROPS as Record<string, unknown>,
    inspector: createInspector(),
    render: (props) => <BlogPage01 {...(props as unknown as Blog01Props)} />,
};
export default BlogPage01;
