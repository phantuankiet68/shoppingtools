'use client';

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type RefObject,
} from 'react';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';
import RichTextEditor from '@/components/admin/shared/editor/rich-text-editor';
import styles from './add-blog-modal.module.css';

type Locale = 'vi' | 'en' | 'ja';
type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
type Section = 'basic' | 'content' | 'seo' | 'media';

type TranslationForm = {
    title: string;
    slug: string;
    subtitle: string;
    excerpt: string;
    content: string;
};

type CategoryOption = {
    id: string;
    name: string;
};

type TagOption = {
    id: string;
    name: string;
    color?: string | null;
};

type ApiResponse = {
    data?: unknown;
    items?: unknown;
    results?: unknown;
    url?: string;
    path?: string;
    message?: string;
    error?: string;
};

const LOCALES: Array<{ value: Locale; label: string; short: string }> = [
    { value: 'vi', label: 'Tiếng Việt', short: 'VI' },
    { value: 'en', label: 'English', short: 'EN' },
    { value: 'ja', label: '日本語', short: 'JA' },
];

const EMPTY_TRANSLATION: TranslationForm = {
    title: '',
    slug: '',
    subtitle: '',
    excerpt: '',
    content: '',
};

const getApiError = async (response: Response): Promise<string> => {
    try {
        const payload = (await response.json()) as ApiResponse;

        return payload.message || payload.error || `Request failed with status ${response.status}`;
    } catch {
        return `Request failed with status ${response.status}`;
    }
};

const requestJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    const payload = (await response.json()) as ApiResponse;

    return (payload.data ?? payload.items ?? payload.results ?? payload) as T;
};

const normalizeArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) {
        return value as T[];
    }

    if (value && typeof value === 'object') {
        const object = value as Record<string, unknown>;

        if (Array.isArray(object.items)) {
            return object.items as T[];
        }

        if (Array.isArray(object.data)) {
            return object.data as T[];
        }

        if (Array.isArray(object.results)) {
            return object.results as T[];
        }
    }

    return [];
};

const getName = (item: Record<string, unknown>): string => {
    if (typeof item.name === 'string' && item.name.trim()) {
        return item.name;
    }

    const translations = Array.isArray(item.translations) ? item.translations : [];

    const vi = translations.find(
        (translation) =>
            translation &&
            typeof translation === 'object' &&
            (translation as Record<string, unknown>).locale === 'vi',
    ) as Record<string, unknown> | undefined;

    if (typeof vi?.name === 'string') {
        return vi.name;
    }

    const first = translations.find(
        (translation) =>
            translation &&
            typeof translation === 'object' &&
            typeof (translation as Record<string, unknown>).name === 'string',
    ) as Record<string, unknown> | undefined;

    return typeof first?.name === 'string' ? first.name : String(item.slug || '');
};

const slugify = (value: string): string => {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

const getUploadUrl = (payload: unknown): string | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const object = payload as Record<string, unknown>;

    if (typeof object.url === 'string') {
        return object.url;
    }

    if (typeof object.path === 'string') {
        return object.path;
    }

    if (object.data && typeof object.data === 'object') {
        const data = object.data as Record<string, unknown>;

        if (typeof data.url === 'string') {
            return data.url;
        }

        if (typeof data.path === 'string') {
            return data.path;
        }
    }

    if (object.file && typeof object.file === 'object') {
        const file = object.file as Record<string, unknown>;

        if (typeof file.url === 'string') {
            return file.url;
        }

        if (typeof file.path === 'string') {
            return file.path;
        }
    }

    return null;
};

export default function AddBlogModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void | Promise<void>;
}) {
    const { currentSite } = useAdminAuth();
    const { t } = useAdminI18n();
    const modal = useModal();

    const navItems: Array<{
        id: Section;
        icon: string;
        title: string;
        description: string;
    }> = [
        {
            id: 'basic',
            icon: 'bi-file-earmark-text',
            title: t('blog.form.sections.basic.title'),
            description: t('blog.form.sections.basic.description'),
        },
        {
            id: 'content',
            icon: 'bi-pencil-square',
            title: t('blog.form.sections.content.title'),
            description: t('blog.form.sections.content.description'),
        },
        {
            id: 'seo',
            icon: 'bi-search',
            title: t('blog.form.sections.seo.title'),
            description: t('blog.form.sections.seo.description'),
        },
        {
            id: 'media',
            icon: 'bi-images',
            title: t('blog.form.sections.media.title'),
            description: t('blog.form.sections.media.description'),
        },
    ];

    const coverInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const [activeSection, setActiveSection] = useState<Section>('basic');
    const [activeLocale, setActiveLocale] = useState<Locale>('vi');
    const [status, setStatus] = useState<ContentStatus>('DRAFT');
    const [categoryId, setCategoryId] = useState('');
    const [wikiCategoryId, setWikiCategoryId] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [featured, setFeatured] = useState(false);
    const [allowComments, setAllowComments] = useState(true);
    const [publishedAt, setPublishedAt] = useState('');

    const [thumbnail, setThumbnail] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [coverPreview, setCoverPreview] = useState('');
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [wikiCategories, setWikiCategories] = useState<CategoryOption[]>([]);
    const [tags, setTags] = useState<TagOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [saving, setSaving] = useState(false);

    const [translations, setTranslations] = useState<Record<Locale, TranslationForm>>({
        vi: { ...EMPTY_TRANSLATION },
        en: { ...EMPTY_TRANSLATION },
        ja: { ...EMPTY_TRANSLATION },
    });

    const [seo, setSeo] = useState({
        title: '',
        description: '',
        focusKeyword: '',
        canonicalUrl: '',
        noIndex: false,
        noFollow: false,
        noArchive: false,
        schemaType: 'BlogPosting',
        searchPreviewEnabled: true,
    });

    const currentTranslation = translations[activeLocale];

    const currentLocale = useMemo(
        () => LOCALES.find((locale) => locale.value === activeLocale) || LOCALES[0],
        [activeLocale],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        setActiveSection('basic');
        setActiveLocale('vi');
        setStatus('DRAFT');
        setCategoryId('');
        setWikiCategoryId('');
        setSelectedTags([]);
        setFeatured(false);
        setAllowComments(true);
        setPublishedAt('');
        setThumbnail('');
        setCoverImage('');
        setCoverPreview('');
        setThumbnailPreview('');
        setSaving(false);

        setSeo({
            title: '',
            description: '',
            focusKeyword: '',
            canonicalUrl: '',
            noIndex: false,
            noFollow: false,
            noArchive: false,
            schemaType: 'BlogPosting',
            searchPreviewEnabled: true,
        });

        setTranslations({
            vi: { ...EMPTY_TRANSLATION },
            en: { ...EMPTY_TRANSLATION },
            ja: { ...EMPTY_TRANSLATION },
        });
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !saving) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, saving, onClose]);

    useEffect(() => {
        if (!open || !currentSite?.id) {
            return;
        }

        const loadOptions = async () => {
            setLoadingOptions(true);

            try {
                const query = `siteId=${encodeURIComponent(currentSite.id)}&page=1&limit=100`;

                const [categoryResponse, wikiResponse, tagResponse] = await Promise.all([
                    requestJson<unknown>(`/api/admin/blog/categories?${query}`),
                    requestJson<unknown>(`/api/admin/blog/wiki?${query}`),
                    requestJson<unknown>(`/api/admin/blog/tags?${query}`),
                ]);

                setCategories(
                    normalizeArray<Record<string, unknown>>(categoryResponse).map((item) => ({
                        id: String(item.id || ''),
                        name: getName(item),
                    })),
                );

                setWikiCategories(
                    normalizeArray<Record<string, unknown>>(wikiResponse).map((item) => ({
                        id: String(item.id || ''),
                        name: getName(item),
                    })),
                );

                setTags(
                    normalizeArray<Record<string, unknown>>(tagResponse).map((item) => ({
                        id: String(item.id || ''),
                        name: String(item.name || item.slug || ''),
                        color: typeof item.color === 'string' ? item.color : null,
                    })),
                );
            } catch (error: unknown) {
                modal.error(
                    t('blog.modal.loadFailed'),
                    error instanceof Error ? error.message : t('blog.modal.loadOptionsFailed'),
                );
            } finally {
                setLoadingOptions(false);
            }
        };

        void loadOptions();
    }, [currentSite?.id, modal, open, t]);

    if (!open) {
        return null;
    }

    const updateTranslation = (field: keyof TranslationForm, value: string) => {
        setTranslations((current) => ({
            ...current,
            [activeLocale]: {
                ...current[activeLocale],
                [field]: value,
            },
        }));
    };

    const updateSeo = <K extends keyof typeof seo>(key: K, value: (typeof seo)[K]) => {
        setSeo((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleTitleChange = (value: string) => {
        const shouldGenerateSlug = !currentTranslation.slug.trim();

        setTranslations((current) => ({
            ...current,
            [activeLocale]: {
                ...current[activeLocale],
                title: value,
                slug: shouldGenerateSlug ? slugify(value) : current[activeLocale].slug,
            },
        }));
    };

    const toggleTag = (id: string) => {
        setSelectedTags((current) =>
            current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id],
        );
    };

    const uploadImage = async (file: File, type: 'cover' | 'thumbnail') => {
        if (!currentSite?.id) {
            modal.error(t('blog.modal.uploadFailed'), t('blog.modal.siteNotFound'));
            return;
        }

        if (!file.type.startsWith('image/')) {
            modal.error(t('blog.modal.invalidFile'), t('blog.modal.invalidImage'));
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            modal.error(t('blog.modal.fileTooLarge'), t('blog.modal.fileTooLargeDescription'));
            return;
        }

        const formData = new FormData();

        formData.append('file', file);
        formData.append('siteId', currentSite.id);
        formData.append('folder', 'media');

        if (type === 'cover') {
            setUploadingCover(true);
        } else {
            setUploadingThumbnail(true);
        }

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(await getApiError(response));
            }

            const payload = await response.json();
            const url = getUploadUrl(payload);

            if (!url) {
                throw new Error(t('blog.modal.uploadUrlMissing'));
            }

            if (type === 'cover') {
                setCoverImage(url);
                setCoverPreview(url);
            } else {
                setThumbnail(url);
                setThumbnailPreview(url);
            }
        } catch (error: unknown) {
            modal.error(
                t('blog.modal.uploadFailed'),
                error instanceof Error ? error.message : t('blog.modal.uploadImageFailed'),
            );
        } finally {
            if (type === 'cover') {
                setUploadingCover(false);
            } else {
                setUploadingThumbnail(false);
            }
        }
    };

    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>,
        type: 'cover' | 'thumbnail',
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        void uploadImage(file, type);
        event.target.value = '';
    };

    const validate = (): string | null => {
        if (!currentSite?.id) {
            return t('blog.validation.siteNotFound');
        }

        if (!categoryId && !wikiCategoryId) {
            return t('blog.validation.categoryRequired');
        }

        if (categoryId && wikiCategoryId) {
            return t('blog.validation.categoryExclusive');
        }

        const validTranslations = Object.values(translations).filter(
            (translation) =>
                translation.title.trim() && translation.slug.trim() && translation.content.trim(),
        );

        if (!validTranslations.length) {
            return t('blog.validation.translationRequired');
        }

        return null;
    };

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        const validationError = validate();

        if (validationError) {
            modal.error(t('blog.modal.validationFailed'), validationError);

            const hasTranslationIdentity = Object.values(translations).some(
                (translation) => translation.title.trim() && translation.slug.trim(),
            );

            const hasTranslationContent = Object.values(translations).some((translation) =>
                translation.content.trim(),
            );

            if (!hasTranslationIdentity) {
                setActiveSection('basic');
            } else if (!hasTranslationContent) {
                setActiveSection('content');
            }

            return;
        }

        if (!currentSite?.id) {
            return;
        }

        setSaving(true);

        try {
            const validTranslations = Object.entries(translations)
                .filter(
                    ([, translation]) =>
                        translation.title.trim() &&
                        translation.slug.trim() &&
                        translation.content.trim(),
                )
                .map(([locale, translation]) => ({
                    locale,
                    title: translation.title.trim(),
                    slug: translation.slug.trim(),
                    subtitle: translation.subtitle.trim() || null,
                    excerpt: translation.excerpt.trim() || null,
                    content: translation.content.trim(),
                    seo: {
                        title: seo.title.trim() || null,
                        description: seo.description.trim() || null,
                        focusKeyword: seo.focusKeyword.trim() || null,
                        canonicalUrl: seo.canonicalUrl.trim() || null,
                        noIndex: seo.noIndex,
                        noFollow: seo.noFollow,
                        noArchive: seo.noArchive,
                        schemaType: seo.schemaType || 'BlogPosting',
                        searchPreviewEnabled: seo.searchPreviewEnabled,
                    },
                }));

            const payload = {
                siteId: currentSite.id,
                categoryId: categoryId || null,
                wikiCategoryId: wikiCategoryId || null,
                status,
                featured,
                allowComments,
                thumbnail: thumbnail || null,
                coverImage: coverImage || null,
                publishedAt: publishedAt || null,
                tagIds: selectedTags,
                translations: validTranslations,
            };

            await requestJson('/api/admin/blog', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            modal.success(t('blog.modal.success'), t('blog.modal.createdSuccess'));

            await onSuccess?.();
            onClose();
        } catch (error: unknown) {
            modal.error(
                t('blog.modal.createFailed'),
                error instanceof Error ? error.message : t('blog.modal.unknownError'),
            );
        } finally {
            setSaving(false);
        }
    };

    const resetImage = (type: 'cover' | 'thumbnail') => {
        if (type === 'cover') {
            setCoverImage('');
            setCoverPreview('');
        } else {
            setThumbnail('');
            setThumbnailPreview('');
        }
    };

    const scrollToSection = (id: Section) => {
        setActiveSection(id);

        requestAnimationFrame(() => {
            document.getElementById(`blog-modal-${id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    };

    const renderLanguageTabs = () => (
        <div className={styles.languageTabs}>
            {LOCALES.map((locale) => {
                const translation = translations[locale.value];

                const completed = Boolean(
                    translation.title.trim() &&
                    translation.slug.trim() &&
                    translation.content.trim(),
                );

                return (
                    <button
                        key={locale.value}
                        type="button"
                        className={`${styles.languageTab} ${
                            activeLocale === locale.value ? styles.languageTabActive : ''
                        }`}
                        onClick={() => setActiveLocale(locale.value)}
                    >
                        <span>{locale.short}</span>
                        {locale.label}

                        {completed && <i className="bi bi-check-circle-fill" />}
                    </button>
                );
            })}
        </div>
    );

    const renderBasicSection = () => (
        <section className={styles.section} id="blog-modal-basic">
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                    <i className="bi bi-file-earmark-text" />
                </div>

                <div>
                    <h2>{t('blog.form.basic.title')}</h2>
                    <p>{t('blog.form.basic.description')}</p>
                </div>
            </div>

            {renderLanguageTabs()}

            <div className={styles.formGrid}>
                <div className={styles.fieldFull}>
                    <label className={styles.label}>
                        {t('blog.form.title')} {currentLocale.label} <span>*</span>
                    </label>

                    <input
                        className={styles.input}
                        value={currentTranslation.title}
                        onChange={(event) => handleTitleChange(event.target.value)}
                        placeholder={t('blog.form.titlePlaceholder')}
                        maxLength={200}
                    />

                    <div className={styles.fieldMeta}>
                        <span>{t('blog.form.titleHint')}</span>
                        <span>{currentTranslation.title.length}/200</span>
                    </div>
                </div>

                <div className={styles.fieldFull}>
                    <label className={styles.label}>{t('blog.form.slug')}</label>

                    <div className={styles.inputWithPrefix}>
                        <span>/blog/</span>

                        <input
                            className={styles.inputBare}
                            value={currentTranslation.slug}
                            onChange={(event) =>
                                updateTranslation('slug', slugify(event.target.value))
                            }
                            placeholder={t('blog.form.slugPlaceholder')}
                        />
                    </div>
                </div>

                <div className={styles.fieldFull}>
                    <label className={styles.label}>{t('blog.form.subtitle')}</label>

                    <input
                        className={styles.input}
                        value={currentTranslation.subtitle}
                        onChange={(event) => updateTranslation('subtitle', event.target.value)}
                        placeholder={t('blog.form.subtitlePlaceholder')}
                        maxLength={300}
                    />
                </div>

                <div className={styles.fieldHalf}>
                    <label className={styles.label}>{t('blog.form.blogCategory')}</label>

                    <select
                        className={styles.select}
                        value={categoryId}
                        onChange={(event) => {
                            setCategoryId(event.target.value);
                            setWikiCategoryId('');
                        }}
                        disabled={loadingOptions}
                    >
                        <option value="">{t('blog.form.blogCategoryPlaceholder')}</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldHalf}>
                    <label className={styles.label}>{t('blog.form.wikiCategory')}</label>

                    <select
                        className={styles.select}
                        value={wikiCategoryId}
                        onChange={(event) => {
                            setWikiCategoryId(event.target.value);
                            setCategoryId('');
                        }}
                        disabled={loadingOptions}
                    >
                        <option value="">{t('blog.form.wikiCategoryPlaceholder')}</option>

                        {wikiCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldFull}>
                    <label className={styles.label}>{t('blog.form.tags')}</label>

                    <div className={styles.tagSelector}>
                        {tags.length ? (
                            tags.map((tag) => {
                                const selected = selectedTags.includes(tag.id);

                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        className={`${styles.tag} ${
                                            selected ? styles.tagSelected : ''
                                        }`}
                                        onClick={() => toggleTag(tag.id)}
                                    >
                                        <span
                                            className={styles.tagDot}
                                            style={{
                                                background: tag.color || undefined,
                                            }}
                                        />

                                        {tag.name}

                                        {selected && <i className="bi bi-check" />}
                                    </button>
                                );
                            })
                        ) : (
                            <span className={styles.emptyInline}>
                                {loadingOptions
                                    ? t('blog.form.loadingTags')
                                    : t('blog.form.noTags')}
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.fieldFull}>
                    <label className={styles.label}>{t('blog.form.excerpt')}</label>

                    <textarea
                        className={styles.textarea}
                        value={currentTranslation.excerpt}
                        onChange={(event) => updateTranslation('excerpt', event.target.value)}
                        placeholder={t('blog.form.excerptPlaceholder')}
                        maxLength={500}
                        rows={4}
                    />

                    <div className={styles.fieldMeta}>
                        <span />
                        <span>{currentTranslation.excerpt.length}/500</span>
                    </div>
                </div>
            </div>
        </section>
    );

    const renderContentSection = () => (
        <section className={styles.section} id="blog-modal-content">
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                    <i className="bi bi-pencil-square" />
                </div>

                <div>
                    <h2>{t('blog.form.content.title')}</h2>
                    <p>
                        {t('blog.form.content.description')} {currentLocale.label}
                    </p>
                </div>
            </div>

            <RichTextEditor
                field="content"
                value={currentTranslation.content}
                onChange={(value) => updateTranslation('content', value)}
                siteId={currentSite?.id || ''}
                placeholder={`${t('blog.form.content.placeholder')} ${currentLocale.label}...`}
                disabled={!currentSite?.id || saving}
                minHeight={480}
                showCharacterCount
            />
        </section>
    );

    const renderSeoSection = () => (
        <section className={styles.section} id="blog-modal-seo">
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                    <i className="bi bi-search" />
                </div>

                <div>
                    <h2>{t('blog.form.seo.title')}</h2>
                    <p>{t('blog.form.seo.description')}</p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.fieldFull}>
                    <label className={styles.label}>{t('blog.form.seo.titleField')}</label>

                    <input
                        className={styles.input}
                        value={seo.title}
                        onChange={(event) => updateSeo('title', event.target.value)}
                        placeholder={t('blog.form.seo.titlePlaceholder')}
                    />
                </div>

                <div className={styles.fieldFull}>
                    <label className={styles.label}>{t('blog.form.seo.descriptionField')}</label>

                    <textarea
                        className={styles.textarea}
                        value={seo.description}
                        onChange={(event) => updateSeo('description', event.target.value)}
                        placeholder={t('blog.form.seo.descriptionPlaceholder')}
                        rows={4}
                    />
                </div>

                <div className={styles.fieldHalf}>
                    <label className={styles.label}>{t('blog.form.seo.focusKeyword')}</label>

                    <input
                        className={styles.input}
                        value={seo.focusKeyword}
                        onChange={(event) => updateSeo('focusKeyword', event.target.value)}
                        placeholder={t('blog.form.seo.focusKeywordPlaceholder')}
                    />
                </div>

                <div className={styles.fieldHalf}>
                    <label className={styles.label}>{t('blog.form.seo.canonicalUrl')}</label>

                    <input
                        className={styles.input}
                        value={seo.canonicalUrl}
                        onChange={(event) => updateSeo('canonicalUrl', event.target.value)}
                        placeholder={t('blog.form.seo.canonicalUrlPlaceholder')}
                    />
                </div>
            </div>

            <div className={styles.seoOptions}>
                <Toggle
                    label={t('blog.form.seo.searchPreview')}
                    description={t('blog.form.seo.searchPreviewDescription')}
                    checked={seo.searchPreviewEnabled}
                    onChange={(checked) => updateSeo('searchPreviewEnabled', checked)}
                />

                <Toggle
                    label={t('blog.form.seo.noIndex')}
                    description={t('blog.form.seo.noIndexDescription')}
                    checked={seo.noIndex}
                    onChange={(checked) => updateSeo('noIndex', checked)}
                />

                <Toggle
                    label={t('blog.form.seo.noFollow')}
                    description={t('blog.form.seo.noFollowDescription')}
                    checked={seo.noFollow}
                    onChange={(checked) => updateSeo('noFollow', checked)}
                />
            </div>
        </section>
    );

    const renderMediaSection = () => (
        <section className={styles.section} id="blog-modal-media">
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                    <i className="bi bi-images" />
                </div>

                <div>
                    <h2>{t('blog.form.media.title')}</h2>
                    <p>{t('blog.form.media.description')}</p>
                </div>
            </div>

            <div className={styles.mediaGrid}>
                <MediaUploader
                    title={t('blog.form.media.cover.title')}
                    description={t('blog.form.media.cover.description')}
                    size="1200 × 630"
                    preview={coverPreview}
                    loading={uploadingCover}
                    inputRef={coverInputRef}
                    onChange={(event) => handleImageChange(event, 'cover')}
                    onRemove={() => resetImage('cover')}
                />

                <MediaUploader
                    title={t('blog.form.media.thumbnail.title')}
                    description={t('blog.form.media.thumbnail.description')}
                    size="600 × 400"
                    preview={thumbnailPreview}
                    loading={uploadingThumbnail}
                    inputRef={thumbnailInputRef}
                    onChange={(event) => handleImageChange(event, 'thumbnail')}
                    onRemove={() => resetImage('thumbnail')}
                />
            </div>
        </section>
    );

    return (
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-blog-title"
            >
                <div className={styles.modalHeader}>
                    <div className={styles.headerIdentity}>
                        <div className={styles.headerIcon}>
                            <i className="bi bi-journal-richtext" />
                        </div>

                        <div>
                            <div className={styles.eyebrow}>{t('blog.modal.eyebrow')}</div>

                            <h1 id="add-blog-title">{t('blog.modal.createTitle')}</h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={saving}
                        aria-label={t('blog.modal.close')}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form className={styles.modalBody} onSubmit={handleSubmit}>
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarLabel}>{t('blog.modal.contentLabel')}</div>

                        <nav className={styles.navigation}>
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`${styles.navItem} ${
                                        activeSection === item.id ? styles.navItemActive : ''
                                    }`}
                                    onClick={() => scrollToSection(item.id)}
                                >
                                    <span className={styles.navIcon}>
                                        <i className={`bi ${item.icon}`} />
                                    </span>

                                    <span className={styles.navContent}>
                                        <strong>{item.title}</strong>
                                        <small>{item.description}</small>
                                    </span>
                                </button>
                            ))}
                        </nav>

                        <div className={styles.sidebarInfo}>
                            <div className={styles.sidebarInfoIcon}>
                                <i className="bi bi-translate" />
                            </div>

                            <div>
                                <strong>{t('blog.modal.multilingual')}</strong>
                                <span>{t('blog.modal.multilingualDescription')}</span>
                            </div>
                        </div>
                    </aside>

                    <main className={styles.content}>
                        {renderBasicSection()}
                        {renderContentSection()}
                        {renderSeoSection()}
                        {renderMediaSection()}
                    </main>

                    <aside className={styles.rightSidebar}>
                        <div className={styles.sideCard}>
                            <div className={styles.sideCardHeader}>
                                <div className={styles.sideCardIcon}>
                                    <i className="bi bi-send" />
                                </div>

                                <div>
                                    <h3>{t('blog.form.publish.title')}</h3>
                                    <p>{t('blog.form.publish.description')}</p>
                                </div>
                            </div>

                            <div className={styles.sideField}>
                                <label>{t('blog.form.publish.status')}</label>

                                <select
                                    className={styles.select}
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(event.target.value as ContentStatus)
                                    }
                                >
                                    <option value="DRAFT">{t('blog.form.publish.draft')}</option>

                                    <option value="REVIEW">{t('blog.form.publish.review')}</option>

                                    <option value="PUBLISHED">
                                        {t('blog.form.publish.published')}
                                    </option>

                                    <option value="ARCHIVED">
                                        {t('blog.form.publish.archived')}
                                    </option>
                                </select>
                            </div>

                            <div className={styles.sideField}>
                                <label>{t('blog.form.publish.publishedAt')}</label>

                                <input
                                    type="datetime-local"
                                    className={styles.input}
                                    value={publishedAt}
                                    onChange={(event) => setPublishedAt(event.target.value)}
                                />
                            </div>

                            <div className={styles.settingList}>
                                <Toggle
                                    label={t('blog.form.publish.featured')}
                                    description={t('blog.form.publish.featuredDescription')}
                                    checked={featured}
                                    onChange={setFeatured}
                                />

                                <Toggle
                                    label={t('blog.form.publish.allowComments')}
                                    description={t('blog.form.publish.allowCommentsDescription')}
                                    checked={allowComments}
                                    onChange={setAllowComments}
                                />
                            </div>
                        </div>

                        <div className={styles.sideCard}>
                            <div className={styles.sideCardHeader}>
                                <div className={styles.sideCardIcon}>
                                    <i className="bi bi-translate" />
                                </div>

                                <div>
                                    <h3>{t('blog.form.language.title')}</h3>
                                    <p>{t('blog.form.language.description')}</p>
                                </div>
                            </div>

                            <div className={styles.translationStatus}>
                                {LOCALES.map((locale) => {
                                    const translation = translations[locale.value];

                                    const completed = Boolean(
                                        translation.title.trim() &&
                                        translation.slug.trim() &&
                                        translation.content.trim(),
                                    );

                                    return (
                                        <button
                                            key={locale.value}
                                            type="button"
                                            className={styles.translationRow}
                                            onClick={() => {
                                                setActiveLocale(locale.value);
                                                scrollToSection('basic');
                                            }}
                                        >
                                            <span className={styles.translationCode}>
                                                {locale.short}
                                            </span>

                                            <span className={styles.translationName}>
                                                {locale.label}
                                            </span>

                                            <i
                                                className={`bi ${
                                                    completed ? 'bi-check-circle-fill' : 'bi-circle'
                                                } ${completed ? styles.complete : ''}`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.tipCard}>
                            <div className={styles.tipIcon}>
                                <i className="bi bi-lightbulb" />
                            </div>

                            <div>
                                <strong>{t('blog.form.tip.title')}</strong>

                                <p>{t('blog.form.tip.description')}</p>
                            </div>
                        </div>
                    </aside>
                </form>

                <footer className={styles.footer}>
                    <div className={styles.footerSite}>
                        <span className={styles.statusDot} />

                        <span>{currentSite?.name || t('blog.modal.noSite')}</span>
                    </div>

                    <div className={styles.footerActions}>
                        <button
                            className={styles.cancelButton}
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            {t('blog.modal.cancel')}
                        </button>

                        <button
                            className={styles.submitButton}
                            type="button"
                            onClick={() => void handleSubmit()}
                            disabled={
                                saving || uploadingCover || uploadingThumbnail || !currentSite?.id
                            }
                        >
                            {saving ? (
                                <span className={styles.spinner} />
                            ) : (
                                <i className="bi bi-plus-lg" />
                            )}

                            {saving ? t('blog.modal.creating') : t('blog.modal.create')}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function Toggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className={styles.toggleRow}>
            <div className={styles.toggleText}>
                <strong>{label}</strong>
                <span>{description}</span>
            </div>

            <button
                className={`${styles.toggle} ${checked ? styles.toggleActive : ''}`}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
            >
                <span />
            </button>
        </div>
    );
}

function MediaUploader({
    title,
    description,
    size,
    preview,
    loading,
    inputRef,
    onChange,
    onRemove,
}: {
    title: string;
    description: string;
    size: string;
    preview: string;
    loading: boolean;
    inputRef: RefObject<HTMLInputElement | null>;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}) {
    const { t } = useAdminI18n();

    return (
        <div className={styles.mediaCard}>
            <div className={styles.mediaCardHeader}>
                <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>

                <span>{size}</span>
            </div>

            <button
                type="button"
                className={`${styles.uploadBox} ${preview ? styles.uploadBoxPreview : ''}`}
                onClick={() => inputRef.current?.click()}
                disabled={loading}
            >
                {preview ? (
                    <img src={preview} alt={`${title} ${t('blog.form.media.preview')}`} />
                ) : (
                    <>
                        <div className={styles.uploadIcon}>
                            <i
                                className={`bi ${
                                    loading ? 'bi-arrow-repeat' : 'bi-cloud-arrow-up'
                                }`}
                            />
                        </div>

                        <strong>
                            {loading
                                ? t('blog.form.media.uploading')
                                : t('blog.form.media.chooseImage')}
                        </strong>

                        <span>{t('blog.form.media.imageHint')}</span>
                    </>
                )}
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className={styles.hiddenInput}
                onChange={onChange}
            />

            {preview && (
                <button
                    className={styles.removeImage}
                    type="button"
                    onClick={onRemove}
                    disabled={loading}
                >
                    <i className="bi bi-trash3" />
                    {t('blog.form.media.removeImage')}
                </button>
            )}
        </div>
    );
}
