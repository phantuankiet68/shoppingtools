'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';
import styles from '@/components/admin/shared/templates/services/blog/styles/blog-01.module.css';

type SupportedLocale = 'en' | 'vi' | 'ja';

type BlogItem = {
    id: string;
    image: string;
    category: string;
    date: string;
    title: string;
    description: string;
    author: string;
    role: string;
    avatar: string;
};

type BlogTagItem = {
    id: string;
    slug: string;
    name: string;
    count: number;
    color: 'purple' | 'pink' | 'blue' | 'orange' | 'green' | 'cyan';
};

type BlogTranslation = {
    locale: SupportedLocale;
    title: string;
    excerpt: string | null;
    content: string;
    slug: string;
};

type CategoryTranslation = {
    locale: SupportedLocale;
    name: string;
};

type BlogCategory = {
    id: string;
    slug: string;
    icon: string | null;
    translations: CategoryTranslation[];
};

type BlogTag = {
    id: string;
    slug: string;
    name: string;
    color: string | null;
    usageCount: number;
};

type BlogApiPost = {
    id: string;
    thumbnail: string | null;
    coverImage: string | null;
    wordCount: number | null;
    viewCount: number;
    publishedAt: string | null;
    createdAt: string;
    category: BlogCategory | null;
    wikiCategory: BlogCategory | null;
    translations: BlogTranslation[];
    tags: { tag: BlogTag }[];
};

type BlogApiResponse = {
    success: boolean;
    data: BlogApiPost[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

type CategoryItem = {
    id: string;
    label: string;
    icon?: string;
    count: number;
    color?: string;
};

export interface Blog01Props {
    siteId?: string;
    trekkerBadge?: LocalizedText;
    trekkerTitle?: LocalizedText;
    trekkerTitleAccent?: LocalizedText;
    trekkerDescription?: LocalizedText;
    reviewerAvatar?: string;
    reviewerName?: LocalizedText;
    reviewerRole?: LocalizedText;
    reviewerVerified?: LocalizedText;
    reviewerQuote?: LocalizedText;
    community1Icon?: string;
    community1Title?: LocalizedText;
    community1Description?: LocalizedText;
    community2Icon?: string;
    community2Title?: LocalizedText;
    community2Description?: LocalizedText;
    community2Featured?: boolean;
    community3Icon?: string;
    community3Title?: LocalizedText;
    community3Description?: LocalizedText;
    travelVideoImage?: string;
    travelVideoDuration?: LocalizedText;
    travelVideoBadge?: LocalizedText;
    travelVideoTitle?: LocalizedText;
    travelVideoDescription?: LocalizedText;
    travelViews?: LocalizedText;
    travelViewsLabel?: LocalizedText;
    travelRating?: LocalizedText;
    travelRatingLabel?: LocalizedText;
    travelComments?: LocalizedText;
    travelCommentsLabel?: LocalizedText;
    travelButton?: LocalizedText;
    searchTitle?: LocalizedText;
    searchPlaceholder?: LocalizedText;
    searchAriaLabel?: LocalizedText;
    clearSearchAriaLabel?: LocalizedText;
    blogCategoryTitle?: LocalizedText;
    blogCategoryAriaLabel?: LocalizedText;
    wikiCategoryTitle?: LocalizedText;
    wikiCategoryAriaLabel?: LocalizedText;
    blogTagTitle?: LocalizedText;
    blogTagMoreAriaLabel?: LocalizedText;
    noBlogTagsText?: LocalizedText;
    noCategoryText?: LocalizedText;
    allCategoriesText?: LocalizedText;
    bookmarkAriaLabel?: LocalizedText;
    readArticleAriaLabel?: LocalizedText;
    previousPageAriaLabel?: LocalizedText;
    nextPageAriaLabel?: LocalizedText;
    paginationAriaLabel?: LocalizedText;
    supportTitle?: LocalizedText;
    supportDescription?: LocalizedText;
    supportButton?: LocalizedText;
}

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'vi', 'ja'];

function getSampleBlogs(locale: SupportedLocale): BlogItem[] {
    const content = {
        en: {
            category: 'Web Design',
            date: 'May 20, 2024',
            title: '10 Web Design Trends That Will Shape Modern Websites',
            description:
                'Discover practical UI, UX and web design trends for creating better digital experiences.',
            role: 'Content Team',
        },
        vi: {
            category: 'Thiết kế Web',
            date: '20 tháng 5, 2024',
            title: '10 xu hướng thiết kế Web định hình website hiện đại',
            description:
                'Khám phá các xu hướng UI, UX và thiết kế Web thực tế để tạo ra trải nghiệm số tốt hơn.',
            role: 'Đội ngũ nội dung',
        },
        ja: {
            category: 'Webデザイン',
            date: '2024年5月20日',
            title: '現代的なWebサイトを形作る10のデザイントレンド',
            description:
                'より良いデジタル体験を実現するための実践的なUI・UX・Webデザインのトレンドをご紹介します。',
            role: 'コンテンツチーム',
        },
    }[locale];
    return [
        {
            id: 'sample-blog-01',
            image: '/assets/images/blogs/blog-01.png',
            category: content.category,
            date: content.date,
            title: content.title,
            description: content.description,
            author: 'KBuilder',
            role: content.role,
            avatar: '/assets/images/avatar-1.png',
        },
    ];
}

function normalizeLocale(value: string | null | undefined): SupportedLocale {
    return SUPPORTED_LOCALES.includes(value as SupportedLocale) ? (value as SupportedLocale) : 'en';
}

function localizedText(defaultValue: string, vi: string, ja: string): LocalizedText {
    return { sourceLocale: 'en', default: defaultValue, translations: { vi, ja } };
}

function localeValue(
    locale: SupportedLocale,
    values: { en: string; vi: string; ja: string },
): string {
    return values[locale];
}

function getLocalizedCategory(category: BlogCategory | null, locale: SupportedLocale): string {
    if (!category) return locale === 'vi' ? 'Khác' : locale === 'ja' ? 'その他' : 'Other';
    return (
        category.translations.find((item) => item.locale === locale)?.name ??
        category.translations.find((item) => item.locale === 'en')?.name ??
        category.slug
    );
}

function formatDate(value: string | null, locale: SupportedLocale): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(
        locale === 'vi' ? 'vi-VN' : locale === 'ja' ? 'ja-JP' : 'en-US',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    ).format(date);
}

function getTagColor(index: number): BlogTagItem['color'] {
    return ['purple', 'pink', 'blue', 'orange', 'green', 'cyan'][index % 6] as BlogTagItem['color'];
}

function mapBlogPost(post: BlogApiPost, locale: SupportedLocale): BlogItem {
    const translation =
        post.translations.find((item) => item.locale === locale) ?? post.translations[0];
    const image = post.thumbnail || post.coverImage || getSampleBlogs(locale)[0].image;
    const title =
        translation?.title ||
        localeValue(locale, {
            en: 'Untitled article',
            vi: 'Bài viết chưa có tiêu đề',
            ja: '無題の記事',
        });
    return {
        id: post.id,
        image,
        category: getLocalizedCategory(post.category ?? post.wikiCategory, locale),
        date: formatDate(post.publishedAt || post.createdAt, locale),
        title,
        description:
            translation?.excerpt ||
            translation?.content?.replace(/<[^>]+>/g, '').slice(0, 180) ||
            '',
        author: 'KBuilder',
        role: localeValue(locale, {
            en: 'Content Team',
            vi: 'Đội ngũ nội dung',
            ja: 'コンテンツチーム',
        }),
        avatar: getSampleBlogs(locale)[0].avatar,
    };
}

function mapTags(posts: BlogApiPost[]): BlogTagItem[] {
    const map = new Map<string, BlogTagItem>();
    posts.forEach((post) => {
        post.tags.forEach(({ tag }) => {
            const current = map.get(tag.id);
            map.set(tag.id, {
                id: tag.id,
                slug: tag.slug,
                name: tag.name,
                count: tag.usageCount || (current ? current.count + 1 : 1),
                color:
                    current?.color ??
                    (['purple', 'pink', 'blue', 'orange', 'green', 'cyan'].includes(tag.color ?? '')
                        ? (tag.color as BlogTagItem['color'])
                        : getTagColor(map.size)),
            });
        });
    });
    return Array.from(map.values());
}

export const DEFAULT_PROPS: Required<Omit<Blog01Props, 'siteId'>> & { siteId?: string } = {
    siteId: undefined,
    trekkerBadge: localizedText(
        'Community Highlights',
        'Điểm nổi bật cộng đồng',
        'コミュニティハイライト',
    ),
    trekkerTitle: localizedText("Trekker's ", 'Hành trình của ', 'トレッカーの '),
    trekkerTitleAccent: localizedText('Highlights', 'Cộng đồng', 'ハイライト'),
    trekkerDescription: localizedText(
        'Discover inspiring journeys, authentic stories and unforgettable experiences shared by creators who build, explore and grow with Kbuilder.',
        'Khám phá những hành trình truyền cảm hứng, câu chuyện chân thực và trải nghiệm đáng nhớ được chia sẻ bởi các nhà sáng tạo đồng hành cùng Kbuilder.',
        'Kbuilderとともに成長するクリエイターたちが共有する感動的な旅やリアルなストーリー、忘れられない体験をご覧ください。',
    ),
    reviewerAvatar: '/assets/images/avatar-1.png',
    reviewerName: localizedText('Phan Duy Linh', 'Phan Duy Linh', 'ファン・ズイ・リン'),
    reviewerRole: localizedText(
        'Personal Brand & Digital Creator',
        'Xây dựng thương hiệu cá nhân & Sáng tạo số',
        'パーソナルブランド・デジタルクリエイター',
    ),
    reviewerVerified: localizedText(
        'Professional Profile',
        'Hồ sơ chuyên nghiệp',
        'プロフェッショナルプロフィール',
    ),
    reviewerQuote: localizedText(
        'I believe a personal website should do more than introduce who you are. It should tell your story, showcase your work and create meaningful opportunities. KBuilder makes it possible to turn that vision into a professional website quickly and beautifully.',
        'Tôi tin rằng một website cá nhân không chỉ đơn giản là giới thiệu bạn là ai. Đó còn là nơi kể câu chuyện, thể hiện năng lực và mở ra những cơ hội mới. Với KBuilder, tôi có thể biến ý tưởng đó thành một website chuyên nghiệp một cách nhanh chóng và ấn tượng.',
        '個人サイトは、自分が何者なのかを紹介するだけのものではないと考えています。自分のストーリーや実績を伝え、新しい可能性につなげる場所でもあります。KBuilderなら、その想いをプロフェッショナルで魅力的なウェブサイトとして素早く形にできます。',
    ),
    community1Icon: 'bi-compass',
    community1Title: localizedText(
        'Professional Profile',
        'Hồ sơ chuyên nghiệp',
        'プロフェッショナルプロフィール',
    ),
    community1Description: localizedText(
        'Discover my background, skills, experience and professional journey through a clear and modern personal profile.',
        'Khám phá hành trình, kỹ năng, kinh nghiệm và những giá trị tôi theo đuổi thông qua một hồ sơ cá nhân hiện đại và rõ ràng.',
        'これまでの経験やスキル、キャリア、そして大切にしている価値観を、わかりやすくモダンなプロフィールでご紹介します。',
    ),
    community2Icon: 'bi-person-badge',
    community2Title: localizedText('Selected Projects', 'Dự án tiêu biểu', '主なプロジェクト'),
    community2Description: localizedText(
        'Explore selected projects, creative work and digital experiences that demonstrate my skills and approach to building meaningful products.',
        'Khám phá những dự án, sản phẩm và trải nghiệm số tiêu biểu thể hiện năng lực, tư duy sáng tạo và cách tôi biến ý tưởng thành sản phẩm thực tế.',
        'これまでに手がけたプロジェクトやデジタル作品を通して、スキルや創造力、アイデアを実際のプロダクトへ形にするアプローチをご紹介します。',
    ),
    community2Featured: true,
    community3Icon: 'bi-calendar-check',
    community3Title: localizedText(
        'Connect & Collaborate',
        'Kết nối & hợp tác',
        'つながる・協業する',
    ),
    community3Description: localizedText(
        'Interested in working together? Get in touch to discuss projects, ideas, collaborations and new opportunities.',
        'Bạn đang tìm kiếm cơ hội hợp tác? Hãy kết nối để cùng trao đổi về dự án, ý tưởng, sản phẩm và những cơ hội mới.',
        'プロジェクトやアイデア、プロダクト、コラボレーションなどについて、一緒に新しい可能性を探してみませんか。',
    ),
    travelVideoImage: '/assets/images/blogs/travel-video.png',
    travelVideoDuration: localizedText('03:28', '03:28', '03:28'),
    travelVideoBadge: localizedText('Travel Story', 'Câu chuyện du lịch', 'トラベルストーリー'),
    travelVideoTitle: localizedText(
        'Explore breathtaking destinations through inspiring creator stories.',
        'Khám phá những điểm đến tuyệt đẹp qua các câu chuyện truyền cảm hứng từ những nhà sáng tạo.',
        'クリエイターたちの感動的なストーリーを通して、息をのむような絶景を発見しましょう。',
    ),
    travelVideoDescription: localizedText(
        'Watch how creators capture unforgettable adventures, share authentic experiences, and inspire millions with beautiful visual storytelling built using Kbuilder.',
        'Theo dõi cách các nhà sáng tạo ghi lại những chuyến phiêu lưu đáng nhớ, chia sẻ trải nghiệm chân thực và truyền cảm hứng đến hàng triệu người bằng Kbuilder.',
        'Kbuilderを活用した美しいビジュアルストーリーで、クリエイターたちが忘れられない冒険や本物の体験を世界中へ届ける様子をご覧ください。',
    ),
    travelViews: localizedText('18K+', '18K+', '18K+'),
    travelViewsLabel: localizedText('Views', 'Lượt xem', '再生数'),
    travelRating: localizedText('4.9', '4.9', '4.9'),
    travelRatingLabel: localizedText('Rating', 'Đánh giá', '評価'),
    travelComments: localizedText('245', '245', '245'),
    travelCommentsLabel: localizedText('Comments', 'Bình luận', 'コメント'),
    travelButton: localizedText('Watch Journey', 'Xem hành trình', '旅を見る'),
    searchTitle: localizedText('Search', 'Tìm kiếm', '検索'),
    searchPlaceholder: localizedText('Search articles...', 'Tìm kiếm bài viết...', '記事を検索...'),
    searchAriaLabel: localizedText('Search articles', 'Tìm kiếm bài viết', '記事を検索'),
    clearSearchAriaLabel: localizedText('Clear search', 'Xóa tìm kiếm', '検索をクリア'),
    blogCategoryTitle: localizedText('Blog Categories', 'Danh mục Blog', 'ブログカテゴリ'),
    blogCategoryAriaLabel: localizedText('Blog Categories', 'Danh mục Blog', 'ブログカテゴリ'),
    wikiCategoryTitle: localizedText('Wiki Categories', 'Danh mục Wiki', 'Wikiカテゴリ'),
    wikiCategoryAriaLabel: localizedText('Wiki Categories', 'Danh mục Wiki', 'Wikiカテゴリ'),
    blogTagTitle: localizedText('Blog Tags', 'Thẻ Blog', 'ブログタグ'),
    blogTagMoreAriaLabel: localizedText(
        'View more Blog Tags',
        'Xem thêm thẻ Blog',
        'ブログタグをさらに表示',
    ),
    noBlogTagsText: localizedText(
        'No Blog Tags found',
        'Không tìm thấy BlogTag',
        'BlogTagが見つかりません',
    ),
    noCategoryText: localizedText(
        'No Wiki Categories found',
        'Không tìm thấy danh mục Wiki',
        'Wikiカテゴリが見つかりません',
    ),
    allCategoriesText: localizedText('All', 'Tất cả', 'すべて'),
    bookmarkAriaLabel: localizedText('Bookmark article', 'Lưu bài viết', '記事をブックマーク'),
    readArticleAriaLabel: localizedText('Read article', 'Đọc bài viết', '記事を読む'),
    previousPageAriaLabel: localizedText('Previous page', 'Trang trước', '前のページ'),
    nextPageAriaLabel: localizedText('Next page', 'Trang sau', '次のページ'),
    paginationAriaLabel: localizedText(
        'Blog pagination',
        'Phân trang Blog',
        'ブログページネーション',
    ),
    supportTitle: localizedText('Need support?', 'Cần hỗ trợ?', 'サポートが必要ですか？'),
    supportDescription: localizedText(
        'Our team is always ready to help you.',
        'Đội ngũ của chúng tôi luôn sẵn sàng giúp bạn.',
        '私たちのチームがいつでもサポートします。',
    ),
    supportButton: localizedText('Contact support', 'Liên hệ hỗ trợ', 'サポートに連絡'),
};

export function BlogPage01(props: Blog01Props) {
    const mergedProps = { ...DEFAULT_PROPS, ...props };
    const {
        siteId,
        trekkerBadge,
        trekkerTitle,
        trekkerTitleAccent,
        trekkerDescription,
        reviewerAvatar,
        reviewerName,
        reviewerRole,
        reviewerVerified,
        reviewerQuote,
        community1Icon,
        community1Title,
        community1Description,
        community2Icon,
        community2Title,
        community2Description,
        community2Featured,
        community3Icon,
        community3Title,
        community3Description,
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
        searchTitle,
        searchPlaceholder,
        searchAriaLabel,
        clearSearchAriaLabel,
        blogCategoryTitle,
        blogCategoryAriaLabel,
        wikiCategoryTitle,
        wikiCategoryAriaLabel,
        blogTagTitle,
        blogTagMoreAriaLabel,
        noBlogTagsText,
        noCategoryText,
        allCategoriesText,
        bookmarkAriaLabel,
        readArticleAriaLabel,
        previousPageAriaLabel,
        nextPageAriaLabel,
        paginationAriaLabel,
        supportTitle,
        supportDescription,
        supportButton,
    } = mergedProps;

    const router = useRouter();
    const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>('en');
    const [blogs, setBlogs] = useState<BlogItem[]>(getSampleBlogs('en'));
    const [tags, setTags] = useState<BlogTagItem[]>([]);
    const [activeTagId, setActiveTagId] = useState<string | null>(null);
    const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
    const [wikiCategoryItems, setWikiCategoryItems] = useState<CategoryItem[]>([]);
    const [activeCategoryType, setActiveCategoryType] = useState<'all' | 'blog' | 'wiki'>('all');
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const t = (value?: LocalizedText) => (value ? getLocalizedValue(value, selectedLocale) : '');
    const tText = (key: keyof Blog01Props) => t(mergedProps[key] as LocalizedText | undefined);

    useEffect(() => {
        const storedLocale = normalizeLocale(window.localStorage.getItem('locale'));
        setSelectedLocale(storedLocale);
        const handleLocaleChange = (event: Event) =>
            setSelectedLocale(normalizeLocale((event as CustomEvent<string>).detail));
        window.addEventListener('locale-change', handleLocaleChange as EventListener);
        return () =>
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [siteId, selectedLocale, activeCategory, activeCategoryType, activeTagId, search]);

    useEffect(() => {
        const controller = new AbortController();
        const timer = window.setTimeout(
            async () => {
                const sampleBlogs = getSampleBlogs(selectedLocale);
                if (!siteId) {
                    setBlogs(sampleBlogs);
                    setTags([]);
                    setCategoryItems([
                        {
                            id: 'all',
                            label: tText('allCategoriesText'),
                            icon: 'bi-house-fill',
                            count: sampleBlogs.length,
                        },
                    ]);
                    setWikiCategoryItems([]);
                    setTotalPages(1);
                    return;
                }
                try {
                    const params = new URLSearchParams({
                        siteId,
                        locale: selectedLocale,
                        status: 'PUBLISHED',
                        page: String(currentPage),
                        limit: '6',
                    });
                    if (search.trim()) params.set('search', search.trim());
                    if (activeTagId) params.set('tagId', activeTagId);
                    if (activeCategoryType === 'blog' && activeCategory !== 'all')
                        params.set('categoryId', activeCategory);
                    if (activeCategoryType === 'wiki' && activeCategory !== 'all')
                        params.set('wikiCategoryId', activeCategory);
                    const response = await fetch(`/api/v1/blog?${params.toString()}`, {
                        credentials: 'include',
                        cache: 'no-store',
                        signal: controller.signal,
                    });
                    if (!response.ok) throw new Error(`Blog API failed: ${response.status}`);
                    const result: BlogApiResponse = await response.json();
                    const posts = result.success && Array.isArray(result.data) ? result.data : [];
                    const hasFilter = Boolean(
                        search.trim() ||
                        activeTagId ||
                        (activeCategoryType !== 'all' && activeCategory !== 'all'),
                    );
                    setBlogs(
                        posts.length
                            ? posts.map((post) => mapBlogPost(post, selectedLocale))
                            : hasFilter
                              ? []
                              : sampleBlogs,
                    );
                    setTags(mapTags(posts));
                    setTotalPages(Math.max(1, result.pagination?.totalPages ?? 1));
                    const blogMap = new Map<string, CategoryItem>();
                    const wikiMap = new Map<string, CategoryItem>();
                    posts.forEach((post) => {
                        if (post.category) {
                            const current = blogMap.get(post.category.id);
                            blogMap.set(post.category.id, {
                                id: post.category.id,
                                label: getLocalizedCategory(post.category, selectedLocale),
                                icon: post.category.icon ?? 'bi-folder',
                                count: (current?.count ?? 0) + 1,
                            });
                        }
                        if (post.wikiCategory) {
                            const current = wikiMap.get(post.wikiCategory.id);
                            wikiMap.set(post.wikiCategory.id, {
                                id: post.wikiCategory.id,
                                label: getLocalizedCategory(post.wikiCategory, selectedLocale),
                                icon: post.wikiCategory.icon ?? 'bi-journal-text',
                                count: (current?.count ?? 0) + 1,
                            });
                        }
                    });
                    setCategoryItems(Array.from(blogMap.values()));
                    setWikiCategoryItems(Array.from(wikiMap.values()));
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'AbortError') return;
                    console.error('[BLOG_PAGE_01]', error);
                    setBlogs(sampleBlogs);
                    setTags([]);
                    setCategoryItems([]);
                    setWikiCategoryItems([]);
                    setTotalPages(1);
                } finally {
                }
            },
            search.trim() ? 250 : 0,
        );
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [
        siteId,
        selectedLocale,
        activeCategory,
        activeCategoryType,
        activeTagId,
        search,
        currentPage,
    ]);
    const filteredTags = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query
            ? tags.filter(
                  (tag) =>
                      tag.name.toLowerCase().includes(query) ||
                      tag.slug.toLowerCase().includes(query),
              )
            : tags;
    }, [tags, search]);
    const categories = useMemo(
        () => [
            {
                id: 'all',
                label: tText('allCategoriesText'),
                icon: 'bi-house-fill',
                count: blogs.length,
            },
            ...categoryItems,
        ],
        [categoryItems, blogs.length, selectedLocale],
    );
    const communities = useMemo(
        () => [
            { icon: community1Icon, title: community1Title, description: community1Description },
            {
                icon: community2Icon,
                title: community2Title,
                description: community2Description,
                featured: community2Featured,
            },
            { icon: community3Icon, title: community3Title, description: community3Description },
        ],
        [
            community1Icon,
            community1Title,
            community1Description,
            community2Icon,
            community2Title,
            community2Description,
            community2Featured,
            community3Icon,
            community3Title,
            community3Description,
        ],
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (categoryId: string, type: 'all' | 'blog' | 'wiki') => {
        setActiveCategory(categoryId);
        setActiveCategoryType(type);
        setActiveTagId(null);
        setCurrentPage(1);
    };

    const handleTagSearch = (tag: BlogTagItem) => {
        setActiveTagId(tag.id);
        setSearch('');
        setActiveCategory('all');
        setActiveCategoryType('all');
        setCurrentPage(1);
    };
    return (
        <>
            <div className={styles.main}>
                <section className={styles.trekkerSection}>
                    <div className={styles.trekkerBlurOne} />
                    <div className={styles.trekkerBlurTwo} />
                    <div className={styles.trekkerDots} />

                    <div className={styles.trekkerShell}>
                        <div className={styles.trekkerGrid}>
                            <div className={styles.trekkerIntro}>
                                <span className={styles.trekkerBadge}>
                                    <i className="bi bi-people-fill" />
                                    {t(trekkerBadge)}
                                </span>

                                <h2 className={styles.trekkerHeading}>
                                    {t(trekkerTitle)}
                                    <span>{t(trekkerTitleAccent)}</span>
                                </h2>

                                <p className={styles.trekkerSummary}>{t(trekkerDescription)}</p>

                                <article className={styles.trekkerReview}>
                                    <div className={styles.trekkerReviewer}>
                                        <div className={styles.trekkerHeader}>
                                            <div className={styles.trekkerAvatar}>
                                                <Image
                                                    src={reviewerAvatar}
                                                    alt={t(reviewerName)}
                                                    width={72}
                                                    height={72}
                                                />
                                            </div>

                                            <div className={styles.trekkerIdentity}>
                                                <h4>{t(reviewerName)}</h4>
                                                <span>{t(reviewerRole)}</span>
                                            </div>
                                        </div>

                                        <div className={styles.trekkerStar}>
                                            <div className={styles.trekkerVerified}>
                                                <i className="bi bi-patch-check-fill" />
                                                {t(reviewerVerified)}
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

                                        <p>{t(reviewerQuote)}</p>
                                    </blockquote>
                                </article>
                                <div className={styles.gridStatus}>
                                    {communities.map((item, index) => (
                                        <article
                                            key={index}
                                            className={`${styles.card} ${
                                                item.featured ? styles.featured : ''
                                            }`}
                                        >
                                            <div className={styles.cardFeatured}>
                                                <div className={styles.icon}>
                                                    <i className={`bi ${item.icon}`} />
                                                </div>

                                                <h3>{t(item.title)}</h3>
                                            </div>

                                            <p>{t(item.description)}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.trekkerVisual}>
                                <article className={styles.trekkerJourney}>
                                    <div className={styles.trekkerJourneyMedia}>
                                        <Image
                                            src={travelVideoImage}
                                            alt={t(travelVideoTitle)}
                                            fill
                                            sizes="(max-width:768px)100vw,(max-width:1200px)50vw,420px"
                                            className={styles.trekkerJourneyImage}
                                        />

                                        <div className={styles.trekkerJourneyMask} />

                                        <button className={styles.trekkerPlayButton}>
                                            <i className="bi bi-play-fill" />
                                        </button>

                                        <div className={styles.trekkerDuration}>
                                            <i className="bi bi-camera-video-fill" />
                                            {t(travelVideoDuration)}
                                        </div>
                                    </div>

                                    <div className={styles.trekkerJourneyContent}>
                                        <span className={styles.trekkerJourneyBadge}>
                                            <i className="bi bi-film" />
                                            {t(travelVideoBadge)}
                                        </span>

                                        <h3 className={styles.trekkerJourneyTitle}>
                                            {t(travelVideoTitle)}
                                        </h3>

                                        <p className={styles.trekkerJourneyDescription}>
                                            {t(travelVideoDescription)}
                                        </p>

                                        <div className={styles.trekkerJourneyFooter}>
                                            <div className={styles.trekkerJourneyStats}>
                                                <div className={styles.trekkerJourneyStat}>
                                                    <strong>{t(travelViews)}</strong>
                                                    <span>{t(travelViewsLabel)}</span>
                                                </div>
                                                <div className={styles.trekkerJourneyDivider} />
                                                <div className={styles.trekkerJourneyStat}>
                                                    <strong>{t(travelRating)}</strong>
                                                    <span>{t(travelRatingLabel)}</span>
                                                </div>
                                                <div className={styles.trekkerJourneyDivider} />
                                                <div className={styles.trekkerJourneyStat}>
                                                    <strong>{t(travelComments)}</strong>
                                                    <span>{t(travelCommentsLabel)}</span>
                                                </div>
                                            </div>

                                            <a href="#" className={styles.trekkerJourneyButton}>
                                                {t(travelButton)}
                                                <i className="bi bi-arrow-up-right" />
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>
                <section className={styles.blogSection}>
                    <div className={styles.blogContainer}>
                        <div className={styles.blogGrid}>
                            {blogs.map((blog) => (
                                <article key={blog.id} className={styles.blogCard}>
                                    <div className={styles.blogCover}>
                                        <Image
                                            src={blog.image}
                                            alt={blog.title}
                                            fill
                                            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                                            className={styles.blogCoverImage}
                                        />

                                        <button
                                            type="button"
                                            className={styles.blogBookmark}
                                            aria-label={t(bookmarkAriaLabel)}
                                        >
                                            <i className="bi bi-bookmark" />
                                        </button>
                                    </div>
                                    <div className={styles.blogContent}>
                                        <div className={styles.blogMeta}>
                                            <span className={styles.blogCategory}>
                                                {blog.category}
                                            </span>

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

                                            <button
                                                type="button"
                                                className={styles.blogArrowButton}
                                                aria-label={t(readArticleAriaLabel)}
                                                onClick={() => router.push(`/blog/${blog.id}`)}
                                            >
                                                <i className="bi bi-arrow-right" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                            {totalPages > 1 && (
                                <nav
                                    className={styles.pagination}
                                    aria-label={t(paginationAriaLabel)}
                                >
                                    <button
                                        type="button"
                                        className={styles.paginationButton}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label={t(previousPageAriaLabel)}
                                    >
                                        <i className="bi bi-chevron-left" />
                                    </button>
                                    <div className={styles.paginationPages}>
                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => index + 1,
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                type="button"
                                                className={`${styles.paginationButton} ${
                                                    currentPage === page
                                                        ? styles.paginationActive
                                                        : ''
                                                }`}
                                                onClick={() => handlePageChange(page)}
                                                aria-current={
                                                    currentPage === page ? 'page' : undefined
                                                }
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.paginationButton}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-label={t(nextPageAriaLabel)}
                                    >
                                        <i className="bi bi-chevron-right" />
                                    </button>
                                </nav>
                            )}
                        </div>

                        <div className={styles.blogSearch}>
                            <aside className={styles.sidebar}>
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h3 className={styles.sectionTitle}>{t(searchTitle)}</h3>

                                        <kbd className={styles.shortcut}>Ctrl K</kbd>
                                    </div>

                                    <div className={styles.searchBox}>
                                        <i className={`bi bi-search ${styles.searchIcon}`} />

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(event) => {
                                                setSearch(event.target.value);
                                                setActiveTagId(null);
                                                setCurrentPage(1);
                                            }}
                                            placeholder={t(searchPlaceholder)}
                                            aria-label={t(searchAriaLabel)}
                                        />

                                        {search && (
                                            <button
                                                type="button"
                                                className={styles.clearButton}
                                                onClick={() => {
                                                    setSearch('');
                                                    setActiveTagId(null);
                                                    setCurrentPage(1);
                                                }}
                                                aria-label={t(clearSearchAriaLabel)}
                                            >
                                                <i className="bi bi-x-lg" />
                                            </button>
                                        )}
                                    </div>
                                </section>
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h3 className={styles.sectionTitle}>
                                            {t(blogCategoryTitle)}
                                        </h3>

                                        <button
                                            type="button"
                                            className={styles.headerIconButton}
                                            aria-label={t(blogCategoryAriaLabel)}
                                        >
                                            <i className="bi bi-grid" />
                                        </button>
                                    </div>

                                    <div className={styles.categoryList}>
                                        {categories.map((category) => {
                                            const isActive =
                                                category.id === 'all'
                                                    ? activeCategoryType === 'all'
                                                    : activeCategoryType === 'blog' &&
                                                      activeCategory === category.id;

                                            return (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    className={`${styles.categoryItem} ${
                                                        isActive ? styles.categoryActive : ''
                                                    }`}
                                                    onClick={() =>
                                                        handleCategoryChange(category.id, 'blog')
                                                    }
                                                >
                                                    <span className={styles.categoryContent}>
                                                        {category.id === 'all' ? (
                                                            <span className={styles.homeIcon}>
                                                                <i
                                                                    className={`bi ${category.icon}`}
                                                                />
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className={`${styles.statusDot} ${
                                                                    styles[`dot-${category.color}`]
                                                                }`}
                                                            />
                                                        )}

                                                        <span>{category.label}</span>
                                                    </span>

                                                    <span
                                                        className={`${styles.countBadge} ${
                                                            isActive ? styles.countActive : ''
                                                        }`}
                                                    >
                                                        {category.count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                                <section className={`${styles.section} ${styles.filterSection}`}>
                                    <div className={styles.sectionHeader}>
                                        <h3 className={styles.sectionTitle}>
                                            {t(wikiCategoryTitle)}
                                        </h3>
                                        <button
                                            type="button"
                                            className={styles.headerIconButton}
                                            aria-label={t(wikiCategoryAriaLabel)}
                                        >
                                            <i className="bi bi-journal-text" />
                                        </button>
                                    </div>
                                    <div className={styles.filterList}>
                                        {wikiCategoryItems.map((category) => (
                                            <button
                                                type="button"
                                                className={`${styles.filterItem} ${activeCategoryType === 'wiki' && activeCategory === category.id ? styles.categoryActive : ''}`}
                                                key={category.id}
                                                onClick={() =>
                                                    handleCategoryChange(category.id, 'wiki')
                                                }
                                            >
                                                <span className={styles.filterLeft}>
                                                    <i className={`bi ${category.icon}`} />
                                                    <span>{category.label}</span>
                                                </span>
                                                <span className={styles.tagCount}>
                                                    {category.count}
                                                </span>
                                            </button>
                                        ))}
                                        {wikiCategoryItems.length === 0 && (
                                            <div className={styles.emptyState}>
                                                <i className="bi bi-journal-x" />
                                                <span>{t(noCategoryText)}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h3 className={styles.sectionTitle}>{t(blogTagTitle)}</h3>

                                        <button
                                            type="button"
                                            className={styles.moreButton}
                                            aria-label={t(blogTagMoreAriaLabel)}
                                        >
                                            <i className="bi bi-three-dots" />
                                        </button>
                                    </div>

                                    <div className={styles.tagList}>
                                        {filteredTags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                className={`${styles.tagRow} ${styles[`tag-${tag.color}`]}`}
                                                onClick={() => handleTagSearch(tag)}
                                            >
                                                <span className={styles.jobTag}>{tag.name}</span>
                                                <span className={styles.tagCount}>{tag.count}</span>
                                            </button>
                                        ))}

                                        {filteredTags.length === 0 && (
                                            <div className={styles.emptyState}>
                                                <i className="bi bi-search" />
                                                <span>{t(noBlogTagsText)}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                                <section className={styles.supportCard}>
                                    <div className={styles.supportGlow} />

                                    <div className={styles.supportIcon}>
                                        <i className="bi bi-headset" />
                                    </div>

                                    <div className={styles.supportContent}>
                                        <h4>{t(supportTitle)}</h4>

                                        <p>{t(supportDescription)}</p>

                                        <button type="button" className={styles.supportButton}>
                                            <span>{t(supportButton)}</span>

                                            <i className="bi bi-arrow-right" />
                                        </button>
                                    </div>
                                </section>
                            </aside>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function createTextField(key: keyof Blog01Props, label: string): InspectorField {
    return { key, label, kind: 'localized-text' };
}

function createTextareaField(key: keyof Blog01Props, label: string): InspectorField {
    return { key, label, kind: 'localized-text' };
}

function createImageField(key: keyof Blog01Props, label: string): InspectorField {
    return { key, label, kind: 'image', folder: 'media', accept: 'image/*' };
}

function createCheckField(key: keyof Blog01Props, label: string): InspectorField {
    return { key, label, kind: 'check' };
}

function createInspector(): RegItem['inspector'] {
    return [
        createTextField('trekkerBadge', 'Community Badge'),
        createTextField('trekkerTitle', 'Community Title'),
        createTextField('trekkerTitleAccent', 'Community Title Accent'),
        createTextareaField('trekkerDescription', 'Community Description'),
        createImageField('reviewerAvatar', 'Reviewer Avatar'),
        createTextField('reviewerName', 'Reviewer Name'),
        createTextField('reviewerRole', 'Reviewer Role'),
        createTextField('reviewerVerified', 'Reviewer Verified'),
        createTextareaField('reviewerQuote', 'Reviewer Quote'),
        createTextField('community1Icon', 'Community 1 Icon'),
        createTextField('community1Title', 'Community 1 Title'),
        createTextareaField('community1Description', 'Community 1 Description'),
        createTextField('community2Icon', 'Community 2 Icon'),
        createTextField('community2Title', 'Community 2 Title'),
        createTextareaField('community2Description', 'Community 2 Description'),
        createCheckField('community2Featured', 'Community 2 Featured'),
        createTextField('community3Icon', 'Community 3 Icon'),
        createTextField('community3Title', 'Community 3 Title'),
        createTextareaField('community3Description', 'Community 3 Description'),
        createImageField('travelVideoImage', 'Travel Video Image'),
        createTextField('travelVideoDuration', 'Travel Video Duration'),
        createTextField('travelVideoBadge', 'Travel Video Badge'),
        createTextField('travelVideoTitle', 'Travel Video Title'),
        createTextareaField('travelVideoDescription', 'Travel Video Description'),
        createTextField('travelViews', 'Travel Views'),
        createTextField('travelViewsLabel', 'Travel Views Label'),
        createTextField('travelRating', 'Travel Rating'),
        createTextField('travelRatingLabel', 'Travel Rating Label'),
        createTextField('travelComments', 'Travel Comments'),
        createTextField('travelCommentsLabel', 'Travel Comments Label'),
        createTextField('travelButton', 'Travel Button'),
        createTextField('searchTitle', 'Search Title'),
        createTextField('searchPlaceholder', 'Search Placeholder'),
        createTextField('searchAriaLabel', 'Search Aria Label'),
        createTextField('clearSearchAriaLabel', 'Clear Search Aria Label'),
        createTextField('blogCategoryTitle', 'Blog Category Title'),
        createTextField('blogCategoryAriaLabel', 'Blog Category Aria Label'),
        createTextField('wikiCategoryTitle', 'Wiki Category Title'),
        createTextField('wikiCategoryAriaLabel', 'Wiki Category Aria Label'),
        createTextField('blogTagTitle', 'Blog Tag Title'),
        createTextField('blogTagMoreAriaLabel', 'Blog Tag More Aria Label'),
        createTextField('noBlogTagsText', 'No Blog Tags Text'),
        createTextField('noCategoryText', 'No Category Text'),
        createTextField('allCategoriesText', 'All Categories Text'),
        createTextField('bookmarkAriaLabel', 'Bookmark Aria Label'),
        createTextField('readArticleAriaLabel', 'Read Article Aria Label'),
        createTextField('previousPageAriaLabel', 'Previous Page Aria Label'),
        createTextField('nextPageAriaLabel', 'Next Page Aria Label'),
        createTextField('paginationAriaLabel', 'Pagination Aria Label'),
        createTextField('supportTitle', 'Support Title'),
        createTextareaField('supportDescription', 'Support Description'),
        createTextField('supportButton', 'Support Button'),
    ];
}

export const BLOG_PAGE_01: RegItem = {
    kind: 'blog-page-01',
    label: 'Blog Page 01',
    defaults: DEFAULT_PROPS as Record<string, unknown>,
    inspector: createInspector(),
    render: (props) => <BlogPage01 {...(props as Blog01Props)} />,
};

export default BlogPage01;
