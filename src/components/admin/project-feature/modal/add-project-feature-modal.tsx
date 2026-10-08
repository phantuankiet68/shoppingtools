'use client';

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import styles from './add-project-feature-modal.module.css';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';

type LocaleCode = 'en' | 'vi' | 'ja';

type FeatureCategory =
    | 'WEBSITE_BUILDER'
    | 'SAAS'
    | 'ECOMMERCE'
    | 'MOBILE_APP'
    | 'AI'
    | 'DESIGN'
    | 'DEVELOPMENT'
    | 'OTHER';

type FeatureStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

type TranslationForm = {
    title: string;
    description: string;
};

type FeatureImage = {
    id: string;
    file?: File;
    preview: string;
    image?: string;
    isPrimary: boolean;
};

type EditFeature = {
    id: string;
    siteId: string;
    slug: string;
    category: FeatureCategory;
    status: FeatureStatus;
    developer: string | null;
    tags: unknown;
    sortOrder: number;
    isFeatured: boolean;
    translations: Array<{
        id?: string;
        locale: string;
        title: string;
        description?: unknown;
    }>;
    images: Array<{
        id?: string;
        featureId?: string;
        image: string;
        sortOrder: number;
        isPrimary: boolean;
    }>;
};

type Props = {
    open: boolean;
    siteId: string;
    feature?: EditFeature | null;
    onClose: () => void;
    onSuccess?: (data: unknown) => void;
};

type UploadResponse = {
    success?: boolean;
    message?: string;
    file?: {
        url?: string;
        fileName?: string;
        originalName?: string;
        mimeType?: string;
        size?: number;
        extension?: string;
        siteId?: string;
        folder?: string;
        storagePath?: string;
    };
};

const LOCALES: Array<{
    code: LocaleCode;
    label: string;
    short: string;
}> = [
    {
        code: 'en',
        label: 'English',
        short: 'EN',
    },
    {
        code: 'vi',
        label: 'Vietnamese',
        short: 'VI',
    },
    {
        code: 'ja',
        label: 'Japanese',
        short: 'JA',
    },
];

const CATEGORIES: Array<{
    value: FeatureCategory;
    icon: string;
    tone: string;
}> = [
    {
        value: 'WEBSITE_BUILDER',
        icon: 'bi-window-stack',
        tone: 'blue',
    },
    {
        value: 'SAAS',
        icon: 'bi-cloud-check',
        tone: 'pink',
    },
    {
        value: 'ECOMMERCE',
        icon: 'bi-cart3',
        tone: 'orange',
    },
    {
        value: 'MOBILE_APP',
        icon: 'bi-phone',
        tone: 'green',
    },
    {
        value: 'AI',
        icon: 'bi-stars',
        tone: 'purple',
    },
    {
        value: 'DESIGN',
        icon: 'bi-palette',
        tone: 'indigo',
    },
    {
        value: 'DEVELOPMENT',
        icon: 'bi-code-slash',
        tone: 'blue',
    },
    {
        value: 'OTHER',
        icon: 'bi-grid',
        tone: 'gray',
    },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const emptyTranslations = (): Record<LocaleCode, TranslationForm> => ({
    en: {
        title: '',
        description: '',
    },
    vi: {
        title: '',
        description: '',
    },
    ja: {
        title: '',
        description: '',
    },
});

function createImageId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function descriptionToText(value: unknown): string {
    if (typeof value === 'string') {
        try {
            return descriptionToText(JSON.parse(value) as unknown);
        } catch {
            return value;
        }
    }
    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (typeof record.content === 'string') {
            return record.content;
        }
        if (Array.isArray(record.content)) {
            return record.content
                .map((item) => descriptionToText(item))
                .filter(Boolean)
                .join('\n');
        }
        if (typeof record.text === 'string') {
            return record.text;
        }
    }
    return '';
}

function tagsToText(value: unknown): string {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean)
            .join(', ');
    }
    return typeof value === 'string' ? value : '';
}

function createDescriptionJson(value: string) {
    return {
        type: 'text',
        content: value.trim(),
    };
}

export default function AddProjectFeatureModal({
    open,
    siteId,
    feature = null,
    onClose,
    onSuccess,
}: Props) {
    const { t } = useAdminI18n();
    const modal = useModal();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const previewUrlsRef = useRef<string[]>([]);

    const [activeLocale, setActiveLocale] = useState<LocaleCode>('en');

    const [translations, setTranslations] =
        useState<Record<LocaleCode, TranslationForm>>(emptyTranslations);

    const [slug, setSlug] = useState('');

    const [category, setCategory] = useState<FeatureCategory>('WEBSITE_BUILDER');

    const [developer, setDeveloper] = useState('');

    const [tags, setTags] = useState('');

    const [status, setStatus] = useState<FeatureStatus>('DRAFT');

    const [sortOrder, setSortOrder] = useState('0');

    const [isFeatured, setIsFeatured] = useState(false);

    const [images, setImages] = useState<FeatureImage[]>([]);

    const [isDragging, setIsDragging] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');

    const currentTranslation = translations[activeLocale];

    const completedLocales = useMemo(
        () =>
            LOCALES.filter(({ code }) => {
                const value = translations[code];

                return Boolean(value.title.trim());
            }).map(({ code }) => code),
        [translations],
    );

    const canSubmit = useMemo(
        () => Boolean(siteId && translations.en.title.trim() && slug.trim() && !submitting),
        [siteId, translations.en.title, slug, submitting],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        setError('');
        setActiveLocale('en');

        if (!feature) {
            setTranslations(emptyTranslations());
            setSlug('');
            setCategory('WEBSITE_BUILDER');
            setDeveloper('');
            setTags('');
            setStatus('DRAFT');
            setSortOrder('0');
            setIsFeatured(false);
            setImages([]);
            return;
        }

        const nextTranslations = emptyTranslations();
        feature.translations.forEach((item) => {
            if (item.locale === 'en' || item.locale === 'vi' || item.locale === 'ja') {
                nextTranslations[item.locale] = {
                    title: item.title ?? '',
                    description: descriptionToText(item.description),
                };
            }
        });

        setTranslations(nextTranslations);
        setSlug(feature.slug ?? '');
        setCategory(feature.category ?? 'WEBSITE_BUILDER');
        setDeveloper(feature.developer ?? '');
        setTags(tagsToText(feature.tags));
        setStatus(feature.status ?? 'DRAFT');
        setSortOrder(String(feature.sortOrder ?? 0));
        setIsFeatured(Boolean(feature.isFeatured));
        setImages(
            (feature.images ?? [])
                .slice()
                .sort((a, b) => {
                    if (a.isPrimary !== b.isPrimary) {
                        return a.isPrimary ? -1 : 1;
                    }
                    return a.sortOrder - b.sortOrder;
                })
                .map((item, index, items) => ({
                    id: item.id ?? createImageId(),
                    preview: item.image,
                    image: item.image,
                    isPrimary:
                        Boolean(item.isPrimary) &&
                        items.findIndex((candidate) => candidate.isPrimary) === index,
                })),
        );
    }, [open, feature]);

    useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach((url) => {
                URL.revokeObjectURL(url);
            });

            previewUrlsRef.current = [];
        };
    }, []);

    const updateTranslation = (field: keyof TranslationForm, value: string) => {
        setTranslations((current) => ({
            ...current,
            [activeLocale]: {
                ...current[activeLocale],
                [field]: value,
            },
        }));
    };

    const handleImageFile = (file: File) => {
        if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
            setError(t('projectFeature.modal.invalidImageType'));
            return;
        }

        if (file.size <= 0) {
            setError(t('projectFeature.modal.invalidImage'));
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(t('projectFeature.modal.imageTooLarge'));
            return;
        }

        if (images.length >= MAX_IMAGES) {
            setError(t('projectFeature.modal.maxImages').replace('{count}', String(MAX_IMAGES)));
            return;
        }

        setError('');

        const preview = URL.createObjectURL(file);

        previewUrlsRef.current.push(preview);

        setImages((current) => [
            ...current,
            {
                id: createImageId(),
                file,
                preview,
                isPrimary: current.length === 0,
            },
        ]);
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        const remaining = Math.max(0, MAX_IMAGES - images.length);

        files.slice(0, remaining).forEach((file) => handleImageFile(file));

        event.target.value = '';
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
            return;
        }

        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const files = Array.from(event.dataTransfer.files ?? []);
        const remaining = Math.max(0, MAX_IMAGES - images.length);

        files.slice(0, remaining).forEach((file) => handleImageFile(file));
    };

    const removeImage = (id: string) => {
        setImages((current) => {
            const target = current.find((item) => item.id === id);

            if (target?.file) {
                URL.revokeObjectURL(target.preview);
            }

            const next = current.filter((item) => item.id !== id);

            if (next.length > 0 && !next.some((item) => item.isPrimary)) {
                next[0] = {
                    ...next[0],
                    isPrimary: true,
                };
            }

            return next;
        });
    };

    const setPrimaryImage = (id: string) => {
        setImages((current) =>
            current.map((item) => ({
                ...item,
                isPrimary: item.id === id,
            })),
        );
    };

    const parseTags = (value: string) => {
        return Array.from(
            new Set(
                value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            ),
        );
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();

        formData.append('file', file);

        formData.append('siteId', siteId);

        formData.append('folder', 'project-features');

        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        let data: UploadResponse;

        try {
            data = await response.json();
        } catch {
            throw new Error(t('projectFeature.modal.invalidUploadResponse'));
        }

        if (!response.ok || !data.success || !data.file?.url) {
            throw new Error(data.message ?? t('projectFeature.modal.uploadFailed'));
        }

        return data.file.url;
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!siteId) {
            setError(t('projectFeature.modal.siteRequired'));
            return;
        }

        if (!translations.en.title.trim()) {
            setActiveLocale('en');

            setError(t('projectFeature.modal.englishTitleRequired'));
            return;
        }

        if (!slug.trim()) {
            setError(t('projectFeature.modal.slugRequired'));
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const submittedImages: Array<{
                image: string;
                sortOrder: number;
                isPrimary: boolean;
            }> = [];

            for (let index = 0; index < images.length; index += 1) {
                const item = images[index];

                if (item.file) {
                    submittedImages.push({
                        image: await uploadImage(item.file),
                        sortOrder: index,
                        isPrimary: item.isPrimary,
                    });
                } else if (item.image) {
                    submittedImages.push({
                        image: item.image,
                        sortOrder: index,
                        isPrimary: item.isPrimary,
                    });
                }
            }

            const payload = {
                siteId,
                slug: slug.trim().toLowerCase(),
                category,
                status,
                developer: developer.trim() || null,
                tags: parseTags(tags),
                sortOrder: Math.max(0, Number(sortOrder) || 0),
                isFeatured,
                translations: LOCALES.map(({ code }) => ({
                    locale: code,
                    title: translations[code].title.trim(),
                    description: createDescriptionJson(translations[code].description),
                })).filter((item) => item.title),
                images: submittedImages,
            };

            const endpoint = feature
                ? `/api/admin/project-features/${feature.id}`
                : '/api/admin/project-features';
            const response = await fetch(endpoint, {
                method: feature ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            let data: {
                success?: boolean;
                item?: unknown;
                message?: string;
            };

            try {
                data = await response.json();
            } catch {
                throw new Error(t('projectFeature.modal.invalidServerResponse'));
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? t('projectFeature.modal.createFailed'));
            }

            modal.success(
                t('projectFeature.modal.success'),
                t(
                    feature
                        ? 'projectFeature.modal.updatedSuccess'
                        : 'projectFeature.modal.createdSuccess',
                ),
            );

            onSuccess?.(data.item ?? data);

            handleReset();
            onClose();
        } catch (error: unknown) {
            console.error(
                `[AddProjectFeatureModal] ${feature ? 'Update' : 'Create'} failed:`,
                error,
            );

            const message =
                error instanceof Error ? error.message : t('projectFeature.modal.createFailed');

            setError(message);

            modal.error(t('projectFeature.modal.createFailed'), message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        images.forEach((item) => {
            if (item.file) {
                URL.revokeObjectURL(item.preview);
            }
        });

        setActiveLocale('en');
        setTranslations(emptyTranslations());
        setSlug('');
        setCategory('WEBSITE_BUILDER');
        setDeveloper('');
        setTags('');
        setStatus('DRAFT');
        setSortOrder('0');
        setIsFeatured(false);
        setImages([]);
        setError('');
        setSubmitting(false);

        previewUrlsRef.current = [];
    };

    const handleClose = () => {
        if (submitting) {
            return;
        }

        handleReset();
        onClose();
    };

    if (!open) {
        return null;
    }

    return (
        <div
            className={styles.overlay}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) {
                    handleClose();
                }
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-project-feature-title"
            >
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerIcon}>
                            <i className="bi bi-stars" />
                        </div>

                        <div>
                            <h2 id="add-project-feature-title">
                                {t(
                                    feature
                                        ? 'projectFeature.modal.editTitle'
                                        : 'projectFeature.modal.addTitle',
                                )}
                            </h2>

                            <p>
                                {t(
                                    feature
                                        ? 'projectFeature.modal.editDescription'
                                        : 'projectFeature.modal.addDescription',
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label={t('projectFeature.actions.close')}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </header>

                <form className={styles.form} onSubmit={submit}>
                    <div className={styles.body}>
                        {error && (
                            <div className={styles.errorBox}>
                                <i className="bi bi-exclamation-circle" />

                                <span>{error}</span>

                                <button type="button" onClick={() => setError('')}>
                                    <i className="bi bi-x" />
                                </button>
                            </div>
                        )}

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <span className={styles.sectionNumber}>01</span>

                                    <div>
                                        <h3>{t('projectFeature.modal.basicInfo')}</h3>

                                        <p>{t('projectFeature.modal.basicInfoDescription')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fieldGrid}>
                                <div className={`${styles.field} ${styles.fieldFull}`}>
                                    <label>
                                        {t('projectFeature.form.slug')}

                                        <span>*</span>
                                    </label>

                                    <div className={styles.slugInput}>
                                        <span>/project-features/</span>

                                        <input
                                            value={slug}
                                            onChange={(event) =>
                                                setSlug(
                                                    event.target.value
                                                        .toLowerCase()
                                                        .trim()
                                                        .replace(/[^a-z0-9]+/g, '-')
                                                        .replace(/^-+|-+$/g, ''),
                                                )
                                            }
                                            placeholder={t('projectFeature.form.slugPlaceholder')}
                                        />
                                    </div>

                                    <small>{t('projectFeature.form.slugHint')}</small>
                                </div>

                                <div className={styles.field}>
                                    <label>{t('projectFeature.form.category')}</label>

                                    <div className={styles.selectWrapper}>
                                        <select
                                            value={category}
                                            onChange={(event) =>
                                                setCategory(event.target.value as FeatureCategory)
                                            }
                                        >
                                            {CATEGORIES.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {t(
                                                        `projectFeature.category.${item.value.toLowerCase()}`,
                                                    )}
                                                </option>
                                            ))}
                                        </select>

                                        <i className="bi bi-chevron-down" />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>{t('projectFeature.form.developer')}</label>

                                    <input
                                        value={developer}
                                        onChange={(event) => setDeveloper(event.target.value)}
                                        placeholder={t('projectFeature.form.developerPlaceholder')}
                                    />
                                </div>

                                <div className={`${styles.field} ${styles.fieldFull}`}>
                                    <label>{t('projectFeature.form.tags')}</label>

                                    <input
                                        value={tags}
                                        onChange={(event) => setTags(event.target.value)}
                                        placeholder={t('projectFeature.form.tagsPlaceholder')}
                                        aria-label={t('projectFeature.form.tags')}
                                    />

                                    <small>{t('projectFeature.form.tagsHint')}</small>
                                </div>

                                <div className={styles.field}>
                                    <label>{t('projectFeature.form.status')}</label>

                                    <div className={styles.selectWrapper}>
                                        <select
                                            value={status}
                                            onChange={(event) =>
                                                setStatus(event.target.value as FeatureStatus)
                                            }
                                        >
                                            <option value="DRAFT">
                                                {t('projectFeature.status.draft')}
                                            </option>

                                            <option value="PUBLISHED">
                                                {t('projectFeature.status.published')}
                                            </option>

                                            <option value="ARCHIVED">
                                                {t('projectFeature.status.archived')}
                                            </option>
                                        </select>

                                        <i className="bi bi-chevron-down" />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>{t('projectFeature.form.sortOrder')}</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={sortOrder}
                                        onChange={(event) => setSortOrder(event.target.value)}
                                    />
                                </div>
                            </div>

                            <label className={styles.switchRow}>
                                <span className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(event) => setIsFeatured(event.target.checked)}
                                    />

                                    <span className={styles.switchTrack} />
                                </span>

                                <span>
                                    <strong>{t('projectFeature.form.featured')}</strong>

                                    <small>{t('projectFeature.form.featuredHint')}</small>
                                </span>
                            </label>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <span className={styles.sectionNumber}>02</span>

                                    <div>
                                        <h3>{t('projectFeature.modal.translations')}</h3>

                                        <p>{t('projectFeature.modal.translationsDescription')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.localeTabs}>
                                {LOCALES.map((item) => {
                                    const completed = completedLocales.includes(item.code);

                                    return (
                                        <button
                                            key={item.code}
                                            type="button"
                                            className={`${styles.localeTab} ${
                                                activeLocale === item.code
                                                    ? styles.localeTabActive
                                                    : ''
                                            }`}
                                            onClick={() => setActiveLocale(item.code)}
                                        >
                                            <span>{item.short}</span>

                                            {item.label}

                                            {completed && <i className="bi bi-check-circle-fill" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.translationCard}>
                                <div className={styles.field}>
                                    <label>
                                        {t('projectFeature.form.title')}

                                        {activeLocale === 'en' && <span>*</span>}
                                    </label>

                                    <input
                                        value={currentTranslation.title}
                                        onChange={(event) =>
                                            updateTranslation('title', event.target.value)
                                        }
                                        placeholder={t('projectFeature.form.titlePlaceholder')}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>{t('projectFeature.form.description')}</label>

                                    <textarea
                                        value={currentTranslation.description}
                                        onChange={(event) =>
                                            updateTranslation('description', event.target.value)
                                        }
                                        placeholder={t(
                                            'projectFeature.form.descriptionPlaceholder',
                                        )}
                                        rows={5}
                                    />

                                    <small>{t('projectFeature.form.descriptionHint')}</small>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <span className={styles.sectionNumber}>03</span>

                                    <div>
                                        <h3>{t('projectFeature.modal.images')}</h3>

                                        <p>{t('projectFeature.modal.imagesDescription')}</p>
                                    </div>
                                </div>

                                <span className={styles.imageCounter}>
                                    {images.length}/{MAX_IMAGES}
                                </span>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                hidden
                                onChange={handleImageChange}
                            />

                            <div
                                className={`${styles.dropzone} ${
                                    isDragging ? styles.dropzoneActive : ''
                                } ${images.length >= MAX_IMAGES ? styles.dropzoneDisabled : ''}`}
                                onDragOver={images.length < MAX_IMAGES ? handleDragOver : undefined}
                                onDragLeave={handleDragLeave}
                                onDrop={images.length < MAX_IMAGES ? handleDrop : undefined}
                                onClick={() => {
                                    if (images.length < MAX_IMAGES) {
                                        fileInputRef.current?.click();
                                    }
                                }}
                            >
                                <div className={styles.uploadIcon}>
                                    <i className="bi bi-cloud-arrow-up" />
                                </div>

                                <strong>{t('projectFeature.form.uploadTitle')}</strong>

                                <span>{t('projectFeature.form.uploadDescription')}</span>

                                <small>PNG, JPG, WEBP · MAX 5MB</small>
                            </div>

                            {images.length > 0 && (
                                <div className={styles.imageGrid}>
                                    {images.map((image, index) => (
                                        <div
                                            key={image.id}
                                            className={`${styles.imageItem} ${
                                                image.isPrimary ? styles.imageItemPrimary : ''
                                            }`}
                                        >
                                            <img src={image.preview} alt="" />

                                            <div className={styles.imageOverlay}>
                                                <span>{index + 1}</span>

                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrimaryImage(image.id)}
                                                        title={t('projectFeature.form.setPrimary')}
                                                    >
                                                        <i
                                                            className={`bi ${
                                                                image.isPrimary
                                                                    ? 'bi-star-fill'
                                                                    : 'bi-star'
                                                            }`}
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(image.id)}
                                                        title={t('projectFeature.actions.remove')}
                                                    >
                                                        <i className="bi bi-trash3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {image.isPrimary && (
                                                <span className={styles.primaryBadge}>
                                                    <i className="bi bi-star-fill" />
                                                    {t('projectFeature.form.primary')}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <footer className={styles.footer}>
                        <div className={styles.footerHint}>
                            <i className="bi bi-info-circle" />
                            <span>{t('projectFeature.modal.requiredHint')}</span>
                        </div>

                        <div className={styles.footerActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                {t('projectFeature.actions.cancel')}
                            </button>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={!canSubmit}
                            >
                                {submitting ? (
                                    <>
                                        <span className={styles.spinner} />

                                        {t('projectFeature.actions.creating')}
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-lg" />

                                        {t('projectFeature.actions.create')}
                                    </>
                                )}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
}
