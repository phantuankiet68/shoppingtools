'use client';

import {
    ChangeEvent,
    DragEvent,
    FormEvent,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import styles from './add-portfolio-modal.module.css';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';

type PortfolioCategory = 'landing' | 'ecommerce' | 'blog' | 'booking' | 'lms';
type PortfolioSize = 'tall' | 'wide' | 'normal';
type Locale = 'en' | 'vi' | 'ja';

export type PortfolioEditData = {
    id: string;
    siteId: string;
    imageUrl: string;
    category: PortfolioCategory;
    size: PortfolioSize;
    href: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    translations: {
        id: string;
        locale: Locale;
        imageAlt: string;
        title: string;
        description: string | null;
    }[];
};

type Translation = {
    title: string;
    imageAlt: string;
    description: string;
};

type Props = {
    siteId: string;
    initialPortfolio?: PortfolioEditData | null;
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const locales: { value: Locale; label: string; short: string }[] = [
    { value: 'en', label: 'English', short: 'EN' },
    { value: 'vi', label: 'Vietnamese', short: 'VI' },
    { value: 'ja', label: 'Japanese', short: 'JA' },
];

const emptyTranslations = (): Record<Locale, Translation> => ({
    en: { title: '', imageAlt: '', description: '' },
    vi: { title: '', imageAlt: '', description: '' },
    ja: { title: '', imageAlt: '', description: '' },
});

export default function AddPortfolioModal({
    siteId,
    initialPortfolio = null,
    onClose,
    onSuccess,
}: Props) {
    const { t } = useAdminI18n();
    const modal = useModal();
    const isEditMode = Boolean(initialPortfolio);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const previewUrlRef = useRef('');
    const [isDragging, setIsDragging] = useState(false);
    const [category, setCategory] = useState<PortfolioCategory>('landing');
    const [size, setSize] = useState<PortfolioSize>('normal');
    const [href, setHref] = useState('');
    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [locale, setLocale] = useState<Locale>('en');
    const [translations, setTranslations] = useState(emptyTranslations);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const current = translations[locale];
    const canSubmit = useMemo(
        () =>
            Boolean(
                siteId &&
                (isEditMode || imageFile) &&
                current.title.trim() &&
                current.imageAlt.trim() &&
                !submitting,
            ),
        [siteId, imageFile, current.title, current.imageAlt, submitting, isEditMode],
    );

    useEffect(() => {
        if (!initialPortfolio) {
            setImagePreview('');
            setImageFile(null);
            setCategory('landing');
            setSize('normal');
            setHref('');
            setSortOrder('0');
            setIsActive(true);
            setLocale('en');
            setTranslations(emptyTranslations());
            setError('');
            return;
        }

        setImagePreview(initialPortfolio.imageUrl);
        setImageFile(null);
        setCategory(initialPortfolio.category);
        setSize(initialPortfolio.size);
        setHref(initialPortfolio.href ?? '');
        setSortOrder(String(initialPortfolio.sortOrder));
        setIsActive(initialPortfolio.isActive);
        setLocale('en');
        setTranslations(() => {
            const next = emptyTranslations();
            initialPortfolio.translations.forEach((item) => {
                next[item.locale] = {
                    title: item.title ?? '',
                    imageAlt: item.imageAlt ?? '',
                    description: item.description ?? '',
                };
            });
            return next;
        });
        setError('');
    }, [initialPortfolio]);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = '';
            }
        };
    }, []);

    const updateTranslation = (field: keyof Translation, value: string) => {
        setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
    };

    const handleImageFile = (file: File) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            setError(t('portfolios.form.invalidImage'));
            return;
        }

        if (file.size <= 0) {
            setError(t('portfolios.form.emptyImage'));
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError(t('portfolios.form.imageTooLarge'));
            return;
        }

        setError('');
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const previewUrl = URL.createObjectURL(file);
        previewUrlRef.current = previewUrl;
        setImageFile(file);
        setImagePreview(previewUrl);
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleImageFile(file);
        event.target.value = '';
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) handleImageFile(file);
    };

    const removeImage = () => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = '';
        }

        setImageFile(null);
        setImagePreview('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('siteId', siteId);
        formData.append('folder', 'portfolios');

        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        let data: UploadResponse;

        try {
            data = await response.json();
        } catch {
            throw new Error(t('portfolios.form.invalidUploadResponse'));
        }

        if (!response.ok || !data.success || !data.file?.url) {
            throw new Error(data.message || t('portfolios.form.uploadFailed'));
        }

        return data.file;
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!siteId) {
            setError(t('portfolios.form.noSite'));
            return;
        }

        if (!isEditMode && !imageFile) {
            setError(t('portfolios.form.imageRequired'));
            return;
        }

        if (!current.title.trim() || !current.imageAlt.trim()) {
            setError(
                t('portfolios.form.translationRequired').replace('{locale}', locale.toUpperCase()),
            );
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            let imageUrl = initialPortfolio?.imageUrl ?? '';

            if (imageFile) {
                const uploadedFile = await uploadImage(imageFile);
                imageUrl = uploadedFile.url ?? '';
            }

            if (!imageUrl) {
                throw new Error(t('portfolios.form.imageRequired'));
            }

            const payload = {
                siteId,
                imageUrl,
                category,
                size,
                href: href.trim() || null,
                sortOrder: Math.max(0, Number(sortOrder) || 0),
                isActive,
                translations: locales.map(({ value }) => ({
                    locale: value,
                    title: translations[value].title.trim(),
                    imageAlt: translations[value].imageAlt.trim(),
                    description: translations[value].description.trim() || null,
                })),
            };

            const response = await fetch(
                isEditMode
                    ? `/api/admin/portfolios/${initialPortfolio!.id}`
                    : '/api/admin/portfolios',
                {
                    method: isEditMode ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                },
            );
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ??
                        (isEditMode
                            ? t('portfolios.form.updateFailed')
                            : t('portfolios.form.createFailed')),
                );
            }

            modal.success(
                t('portfolios.modal.success'),
                isEditMode
                    ? t('portfolios.form.updatedSuccess')
                    : t('portfolios.form.createdSuccess'),
            );
            onSuccess?.(data.portfolio ?? data.item ?? data);
        } catch (err) {
            console.error('[AddPortfolioModal] Failed to submit portfolio', err);
            const message = err instanceof Error ? err.message : t('portfolios.form.saveFailed');
            setError(message);
            modal.error(t('portfolios.modal.saveFailed'), message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className={styles.overlay}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) onClose();
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="portfolio-modal-title"
            >
                <header className={styles.header}>
                    <div className={styles.heading}>
                        <div className={styles.headerIcon}>
                            <i className="bi bi-grid-3x3-gap-fill" />
                        </div>
                        <div className={styles.headerText}>
                            <h2 id="portfolio-modal-title">
                                {isEditMode
                                    ? t('portfolios.modal.editTitle')
                                    : t('portfolios.modal.addTitle')}
                            </h2>
                            <p>
                                {isEditMode
                                    ? t('portfolios.modal.editDescription')
                                    : t('portfolios.modal.addDescription')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={onClose}
                        disabled={submitting}
                        aria-label={t('common.close')}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </header>

                <form onSubmit={submit} className={styles.form}>
                    <div className={styles.body}>
                        {error && (
                            <div className={styles.error}>
                                <i className="bi bi-exclamation-circle" />
                                <span>{error}</span>
                            </div>
                        )}

                        <section className={styles.sectionInformation}>
                            <div>
                                <div className={styles.sectionTitle}>
                                    <h3>{t('portfolios.form.information')}</h3>
                                    <p>{t('portfolios.form.informationDescription')}</p>
                                </div>
                                <div className={styles.grid}>
                                    <Field label={t('portfolios.form.category')} required>
                                        <Select
                                            value={category}
                                            onChange={(v) => setCategory(v as PortfolioCategory)}
                                            options={[
                                                ['landing', t('portfolios.category.landing')],
                                                ['ecommerce', t('portfolios.category.ecommerce')],
                                                ['blog', t('portfolios.category.blog')],
                                                ['booking', t('portfolios.category.booking')],
                                                ['lms', t('portfolios.category.lms')],
                                            ]}
                                        />
                                    </Field>
                                    <Field label={t('portfolios.form.size')} required>
                                        <Select
                                            value={size}
                                            onChange={(v) => setSize(v as PortfolioSize)}
                                            options={[
                                                ['normal', t('portfolios.size.normal')],
                                                ['wide', t('portfolios.size.wide')],
                                                ['tall', t('portfolios.size.tall')],
                                            ]}
                                        />
                                    </Field>
                                    <Field label={t('portfolios.form.portfolioUrl')}>
                                        <div className={styles.inputIcon}>
                                            <i className="bi bi-link-45deg" />
                                            <input
                                                value={href}
                                                onChange={(e) => setHref(e.target.value)}
                                                placeholder={t('portfolios.form.urlPlaceholder')}
                                            />
                                        </div>
                                    </Field>
                                    <Field label={t('portfolios.form.sortOrder')}>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            min="0"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            placeholder={t('portfolios.form.sortOrderPlaceholder')}
                                        />
                                    </Field>
                                </div>
                            </div>
                            <Field label={t('portfolios.form.portfolioImage')} required>
                                <div
                                    className={`${styles.imageDropzone} ${isDragging ? styles.imageDropzoneDragging : ''} ${imagePreview ? styles.imageDropzoneHasImage : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className={styles.imageInput}
                                        onChange={handleImageChange}
                                    />

                                    {imagePreview ? (
                                        <div className={styles.imagePreview}>
                                            <img
                                                src={imagePreview}
                                                alt={t('portfolios.form.imagePreview')}
                                            />
                                            <div className={styles.imagePreviewOverlay}>
                                                <div className={styles.imagePreviewActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.imageAction}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            fileInputRef.current?.click();
                                                        }}
                                                    >
                                                        <i className="bi bi-arrow-repeat" />
                                                        Replace
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`${styles.imageAction} ${styles.imageActionDanger}`}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            removeImage();
                                                        }}
                                                    >
                                                        <i className="bi bi-trash3" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.imageDropContent}>
                                            <div className={styles.imageUploadIcon}>
                                                <i
                                                    className={
                                                        isDragging
                                                            ? 'bi bi-download'
                                                            : 'bi bi-cloud-arrow-up'
                                                    }
                                                />
                                            </div>
                                            <div className={styles.imageUploadText}>
                                                <strong>
                                                    {isDragging
                                                        ? t('portfolios.form.dropImage')
                                                        : t('portfolios.form.dropImage')}
                                                </strong>
                                                <span>
                                                    {t('portfolios.form.or')}{' '}
                                                    <b>{t('portfolios.form.browse')}</b>
                                                </span>
                                            </div>
                                            <div className={styles.imageUploadMeta}>
                                                <span>
                                                    <i className="bi bi-file-earmark-image" />
                                                    {t('portfolios.form.imageTypes')}
                                                </span>
                                                <span>
                                                    <i className="bi bi-hdd" />
                                                    {t('portfolios.form.maxImageSize')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {imageFile && (
                                    <div className={styles.fileInfo}>
                                        <div className={styles.fileInfoIcon}>
                                            <i className="bi bi-file-earmark-image" />
                                        </div>
                                        <div className={styles.fileInfoText}>
                                            <strong>{imageFile.name}</strong>
                                            <span>
                                                {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            aria-label="Remove image"
                                        >
                                            <i className="bi bi-x" />
                                        </button>
                                    </div>
                                )}
                            </Field>
                        </section>

                        <div className={styles.divider} />

                        <section className={styles.section}>
                            <div className={styles.sectionTab}>
                                <div className={styles.tabs}>
                                    {locales.map((item) => {
                                        const complete = Boolean(
                                            translations[item.value].title.trim() &&
                                            translations[item.value].imageAlt.trim(),
                                        );
                                        return (
                                            <button
                                                type="button"
                                                key={item.value}
                                                className={`${styles.tab} ${locale === item.value ? styles.tabActive : ''}`}
                                                onClick={() => setLocale(item.value)}
                                            >
                                                <b>{item.short}</b>
                                                {item.label}
                                                {complete && <i className="bi bi-check2" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Field label={t('portfolios.form.title')} required>
                                    <input
                                        className={styles.input}
                                        value={current.title}
                                        onChange={(e) => updateTranslation('title', e.target.value)}
                                        placeholder={t('portfolios.form.titlePlaceholder')}
                                    />
                                </Field>
                                <Field label={t('portfolios.form.imageAlt')} required>
                                    <input
                                        className={styles.input}
                                        value={current.imageAlt}
                                        onChange={(e) =>
                                            updateTranslation('imageAlt', e.target.value)
                                        }
                                        placeholder={t('portfolios.form.imageAltPlaceholder')}
                                    />
                                </Field>
                            </div>
                            <div>
                                <Field label={t('portfolios.form.description')}>
                                    <textarea
                                        className={styles.textarea}
                                        rows={4}
                                        value={current.description}
                                        onChange={(e) =>
                                            updateTranslation('description', e.target.value)
                                        }
                                        placeholder={t('portfolios.form.descriptionPlaceholder')}
                                    />
                                </Field>
                                <div className={styles.status}>
                                    <div>
                                        <h3>{t('portfolios.form.publicationStatus')}</h3>
                                        <p>{t('portfolios.form.publicationStatusDescription')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`${styles.switch} ${isActive ? styles.switchActive : ''}`}
                                        onClick={() => setIsActive((v) => !v)}
                                        aria-pressed={isActive}
                                    >
                                        <span />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancel}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className={styles.submit} disabled={!canSubmit}>
                            {submitting ? (
                                <>
                                    <span className={styles.spinner} />
                                    {t('portfolios.form.saving')}
                                </>
                            ) : (
                                <>
                                    <i
                                        className={isEditMode ? 'bi bi-check-lg' : 'bi bi-plus-lg'}
                                    />
                                    {isEditMode
                                        ? t('portfolios.form.update')
                                        : t('portfolios.form.create')}
                                </>
                            )}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div className={styles.field}>
            <label>
                {label}
                {required && <span>*</span>}
            </label>
            {children}
        </div>
    );
}

function Select({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: [string, string][];
}) {
    return (
        <div className={styles.select}>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map(([v, l]) => (
                    <option key={v} value={v}>
                        {l}
                    </option>
                ))}
            </select>
            <i className="bi bi-chevron-down" />
        </div>
    );
}
