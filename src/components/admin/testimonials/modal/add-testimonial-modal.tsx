'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from './add-testimonial-modal.module.css';

type LocaleCode = 'en' | 'vi' | 'ja';

type TranslationForm = {
    name: string;
    role: string;
    websiteLabel: string;
    quote: string;
};

type TestimonialTranslationData = {
    locale: LocaleCode;
    name: string;
    role: string;
    websiteLabel: string | null;
    quote: string;
};

export type TestimonialEditData = {
    id: string;
    avatar: string;
    website: string | null;
    accentColor: string | null;
    rating: number;
    sortOrder: number;
    isActive: boolean;
    translations: TestimonialTranslationData[];
};

interface Props {
    open: boolean;
    testimonial?: TestimonialEditData | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const LOCALES: Array<{ code: LocaleCode; label: string; short: string }> = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'vi', label: 'Vietnamese', short: 'VI' },
    { code: 'ja', label: 'Japanese', short: 'JA' },
];

const EMPTY_TRANSLATION: TranslationForm = {
    name: '',
    role: '',
    websiteLabel: '',
    quote: '',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_FOLDER = 'media';

function normalizeWebsite(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function validateUrl(value: string) {
    if (!value.trim()) return true;
    try {
        const url = new URL(normalizeWebsite(value));
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function AddTestimonialModal({
    open,
    testimonial = null,
    onClose,
    onSuccess,
}: Props) {
    const { currentSite } = useAdminAuth();
    const { t } = useAdminI18n();
    const siteId = currentSite?.id ?? '';
    const isEditMode = Boolean(testimonial?.id);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeLocale, setActiveLocale] = useState<LocaleCode>('en');
    const [translations, setTranslations] = useState<Record<LocaleCode, TranslationForm>>({
        en: { ...EMPTY_TRANSLATION },
        vi: { ...EMPTY_TRANSLATION },
        ja: { ...EMPTY_TRANSLATION },
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [website, setWebsite] = useState('');
    const [rating, setRating] = useState(5);
    const [sortOrder, setSortOrder] = useState(0);
    const [accentColor, setAccentColor] = useState('#0EA5E9');
    const [isActive, setIsActive] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentTranslation = translations[activeLocale];

    const completedLocales = useMemo(
        () =>
            LOCALES.filter((locale) => {
                const value = translations[locale.code];
                return Boolean(value.name.trim() && value.role.trim() && value.quote.trim());
            }).map((locale) => locale.code),
        [translations],
    );

    const canSubmit = Boolean(
        siteId &&
        translations.en.name.trim() &&
        translations.en.role.trim() &&
        translations.en.quote.trim() &&
        rating >= 1 &&
        rating <= 5 &&
        !submitting &&
        (!website.trim() || validateUrl(website)),
    );

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submitting) onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onClose, submitting]);

    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreview(testimonial?.avatar ?? '');
            return;
        }

        const url = URL.createObjectURL(avatarFile);
        setAvatarPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [avatarFile, testimonial?.avatar]);

    useEffect(() => {
        if (!open) return;

        setError(null);
        setActiveLocale('en');

        if (testimonial) {
            const nextTranslations: Record<LocaleCode, TranslationForm> = {
                en: { ...EMPTY_TRANSLATION },
                vi: { ...EMPTY_TRANSLATION },
                ja: { ...EMPTY_TRANSLATION },
            };

            for (const translation of testimonial.translations ?? []) {
                nextTranslations[translation.locale] = {
                    name: translation.name ?? '',
                    role: translation.role ?? '',
                    websiteLabel: translation.websiteLabel ?? '',
                    quote: translation.quote ?? '',
                };
            }

            setTranslations(nextTranslations);
            setAvatarFile(null);
            setAvatarPreview(testimonial.avatar ?? '');
            setWebsite(testimonial.website ?? '');
            setRating(Math.max(1, Math.min(5, Number(testimonial.rating) || 5)));
            setSortOrder(
                Number.isInteger(testimonial.sortOrder) ? Math.max(0, testimonial.sortOrder) : 0,
            );
            setAccentColor(testimonial.accentColor || '#0EA5E9');
            setIsActive(testimonial.isActive ?? true);
            setIsDragging(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return;
        }

        resetForm();
    }, [open, testimonial]);

    const resetForm = () => {
        setActiveLocale('en');
        setTranslations({
            en: { ...EMPTY_TRANSLATION },
            vi: { ...EMPTY_TRANSLATION },
            ja: { ...EMPTY_TRANSLATION },
        });
        setAvatarFile(null);
        setAvatarPreview('');
        setWebsite('');
        setRating(5);
        setSortOrder(0);
        setAccentColor('#0EA5E9');
        setIsActive(true);
        setIsDragging(false);
        setSubmitting(false);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const updateTranslation = (field: keyof TranslationForm, value: string) => {
        setTranslations((current) => ({
            ...current,
            [activeLocale]: {
                ...current[activeLocale],
                [field]: value,
            },
        }));
    };

    const selectFile = (file: File | undefined) => {
        if (!file) return;
        setError(null);

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Please select a JPG, PNG, or WEBP image.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('Avatar image must be 5MB or smaller.');
            return;
        }

        setAvatarFile(file);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        setError(null);

        if (!siteId) {
            setError(t('testimonials.modal.noActiveSite'));
            return;
        }

        if (
            !translations.en.name.trim() ||
            !translations.en.role.trim() ||
            !translations.en.quote.trim()
        ) {
            setActiveLocale('en');
            setError(t('testimonials.modal.englishRequired'));
            return;
        }

        if (!validateUrl(website)) {
            setError(t('testimonials.modal.invalidWebsite'));
            return;
        }

        setSubmitting(true);

        try {
            let avatarUrl = testimonial?.avatar ?? '';

            if (avatarFile) {
                const uploadForm = new FormData();
                uploadForm.append('file', avatarFile);
                uploadForm.append('siteId', siteId);
                uploadForm.append('folder', UPLOAD_FOLDER);

                const uploadResponse = await fetch('/api/admin/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: uploadForm,
                });

                const uploadPayload = await uploadResponse.json().catch(() => null);

                if (!uploadResponse.ok || !uploadPayload?.success) {
                    const message =
                        uploadPayload?.message ||
                        uploadPayload?.error ||
                        uploadPayload?.details ||
                        t('testimonials.modal.uploadFailed');

                    throw new Error(message);
                }

                avatarUrl =
                    uploadPayload.file?.url ??
                    uploadPayload.url ??
                    uploadPayload.data?.file?.url ??
                    '';

                if (!avatarUrl) {
                    throw new Error(t('testimonials.modal.uploadNoUrl'));
                }
            }

            if (!avatarUrl) {
                throw new Error(t('testimonials.modal.avatarRequired'));
            }

            const payload = {
                ...(isEditMode ? {} : { siteId }),
                avatar: avatarUrl,
                website: website.trim() ? normalizeWebsite(website) : null,
                accentColor: accentColor.trim() || null,
                rating,
                sortOrder: Number.isFinite(sortOrder) ? Math.max(0, sortOrder) : 0,
                isActive,
                translations: LOCALES.filter((locale) => {
                    const value = translations[locale.code];

                    return Boolean(
                        value.name.trim() ||
                        value.role.trim() ||
                        value.quote.trim() ||
                        value.websiteLabel.trim(),
                    );
                }).map((locale) => {
                    const value = translations[locale.code];

                    return {
                        locale: locale.code,
                        name: value.name.trim(),
                        role: value.role.trim(),
                        websiteLabel: value.websiteLabel.trim() || null,
                        quote: value.quote.trim(),
                    };
                }),
            };

            const endpoint = isEditMode
                ? `/api/admin/testimonials/${encodeURIComponent(testimonial!.id)}`
                : '/api/admin/testimonials';

            const response = await fetch(endpoint, {
                method: isEditMode ? 'PATCH' : 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.error ||
                        (isEditMode
                            ? t('testimonials.modal.updateFailed')
                            : t('testimonials.modal.createFailed')),
                );
            }

            resetForm();
            onSuccess?.();
            onClose();
        } catch (submitError) {
            console.error(
                `[AddTestimonialModal] ${isEditMode ? 'update' : 'create'} failed`,
                submitError,
            );

            setError(
                submitError instanceof Error
                    ? submitError.message
                    : isEditMode
                      ? t('testimonials.modal.updateFailed')
                      : t('testimonials.modal.createFailed'),
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className={styles.overlay}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) handleClose();
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-testimonial-title"
            >
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <i className="bi bi-chat-square-quote" />
                    </div>
                    <div className={styles.headerContent}>
                        <h2 id="add-testimonial-title">
                            {isEditMode
                                ? t('testimonials.modal.editTitle')
                                : t('testimonials.modal.addTitle')}
                        </h2>
                        <p>
                            {isEditMode
                                ? t('testimonials.modal.editDescription')
                                : t('testimonials.modal.addDescription')}
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.body}>
                        {error && (
                            <div className={styles.error} role="alert">
                                <i className="bi bi-exclamation-circle" />
                                <span>{error}</span>
                            </div>
                        )}

                        <section className={styles.sectionTop}>
                            <div>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h3>Customer</h3>
                                    </div>
                                </div>

                                <div className={styles.avatarField}>
                                    <button
                                        type="button"
                                        className={`${styles.avatarDropzone} ${isDragging ? styles.dragging : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(event) => {
                                            event.preventDefault();
                                            setIsDragging(false);
                                            selectFile(event.dataTransfer.files?.[0]);
                                        }}
                                    >
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar preview" />
                                        ) : (
                                            <span>
                                                <i className="bi bi-person-plus" />
                                            </span>
                                        )}
                                        <strong>
                                            {avatarPreview
                                                ? t('testimonials.form.changePhoto')
                                                : t('testimonials.form.uploadPhoto')}
                                        </strong>
                                        <small>{t('testimonials.form.imageHint')}</small>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className={styles.hiddenInput}
                                        onChange={(event) => selectFile(event.target.files?.[0])}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className={styles.twoColumns}>
                                    <label className={styles.field}>
                                        <span>{t('testimonials.form.website')}</span>
                                        <div className={styles.inputWithIcon}>
                                            <i className="bi bi-globe2" />
                                            <input
                                                type="text"
                                                value={website}
                                                onChange={(event) => setWebsite(event.target.value)}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </label>

                                    <label className={styles.field}>
                                        <span>{t('testimonials.form.sortOrder')}</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={sortOrder}
                                            onChange={(event) =>
                                                setSortOrder(
                                                    Math.max(0, Number(event.target.value) || 0),
                                                )
                                            }
                                        />
                                    </label>
                                </div>

                                <div className={styles.twoColumns}>
                                    <div className={styles.field}>
                                        <span>{t('testimonials.form.rating')}</span>
                                        <div className={styles.ratingPicker} aria-label="Rating">
                                            {Array.from({ length: 5 }, (_, index) => {
                                                const value = index + 1;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className={
                                                            value <= rating
                                                                ? styles.starActive
                                                                : styles.starButton
                                                        }
                                                        onClick={() => setRating(value)}
                                                        aria-label={`${value} star${value > 1 ? 's' : ''}`}
                                                    >
                                                        <i
                                                            className={
                                                                value <= rating
                                                                    ? 'bi bi-star-fill'
                                                                    : 'bi bi-star'
                                                            }
                                                        />
                                                    </button>
                                                );
                                            })}
                                            <strong>{rating}.0</strong>
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <span>{t('testimonials.form.status')}</span>
                                        <button
                                            type="button"
                                            className={`${styles.statusToggle} ${isActive ? styles.statusToggleActive : ''}`}
                                            onClick={() => setIsActive((value) => !value)}
                                        >
                                            <span className={styles.toggleDot} />
                                            {isActive
                                                ? t('testimonials.status.active')
                                                : t('testimonials.status.inactive')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>{t('testimonials.form.content')}</h3>
                                    <p>{t('testimonials.form.contentDescription')}</p>
                                </div>
                                <span className={styles.requiredNote}>
                                    {t('testimonials.form.enRequired')}
                                </span>
                            </div>

                            <div
                                className={styles.localeTabs}
                                role="tablist"
                                aria-label="Testimonial languages"
                            >
                                {LOCALES.map((locale) => {
                                    const completed = completedLocales.includes(locale.code);
                                    return (
                                        <button
                                            key={locale.code}
                                            type="button"
                                            role="tab"
                                            aria-selected={activeLocale === locale.code}
                                            className={
                                                activeLocale === locale.code
                                                    ? styles.localeActive
                                                    : styles.localeTab
                                            }
                                            onClick={() => setActiveLocale(locale.code)}
                                        >
                                            <span>{locale.short}</span>
                                            {locale.label}
                                            {completed && <i className="bi bi-check-circle-fill" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.translationPanel}>
                                <div className={styles.twoColumns}>
                                    <label className={styles.field}>
                                        <span>
                                            {t('testimonials.form.name')} <em>*</em>
                                        </span>
                                        <input
                                            type="text"
                                            value={currentTranslation.name}
                                            onChange={(event) =>
                                                updateTranslation('name', event.target.value)
                                            }
                                            placeholder="Michael Chen"
                                            maxLength={120}
                                        />
                                    </label>
                                    <label className={styles.field}>
                                        <span>
                                            {t('testimonials.form.role')} <em>*</em>
                                        </span>
                                        <input
                                            type="text"
                                            value={currentTranslation.role}
                                            onChange={(event) =>
                                                updateTranslation('role', event.target.value)
                                            }
                                            placeholder="Manager, Chen & Associates"
                                            maxLength={160}
                                        />
                                    </label>
                                </div>

                                <label className={styles.field}>
                                    <span>{t('testimonials.form.websiteLabel')}</span>
                                    <input
                                        type="text"
                                        value={currentTranslation.websiteLabel}
                                        onChange={(event) =>
                                            updateTranslation('websiteLabel', event.target.value)
                                        }
                                        placeholder="chenassociates.com"
                                        maxLength={120}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>
                                        {t('testimonials.form.testimonial')} <em>*</em>
                                    </span>
                                    <textarea
                                        value={currentTranslation.quote}
                                        onChange={(event) =>
                                            updateTranslation('quote', event.target.value)
                                        }
                                        placeholder="Write the customer's testimonial..."
                                        rows={5}
                                        maxLength={500}
                                    />
                                    <small className={styles.characterCount}>
                                        {currentTranslation.quote.length} / 500
                                    </small>
                                </label>
                            </div>
                        </section>

                        <section className={styles.sectionCompact}>
                            <div className={styles.accentHeader}>
                                <div>
                                    <h3>{t('testimonials.form.cardAccent')}</h3>
                                    <p>{t('testimonials.form.cardAccentDescription')}</p>
                                </div>
                                <div className={styles.colorPicker}>
                                    <input
                                        type="color"
                                        value={accentColor}
                                        onChange={(event) => setAccentColor(event.target.value)}
                                        aria-label="Accent color"
                                    />
                                    <input
                                        type="text"
                                        value={accentColor}
                                        onChange={(event) => setAccentColor(event.target.value)}
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className={styles.footer}>
                        <span className={styles.footerHint}>
                            <i className="bi bi-info-circle" />
                            {t('testimonials.form.translationHint')}
                        </span>
                        <div className={styles.footerActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={!canSubmit}
                            >
                                {submitting ? (
                                    <>
                                        <span className={styles.spinner} />{' '}
                                        {isEditMode
                                            ? t('testimonials.actions.saving')
                                            : t('testimonials.actions.creating')}
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-lg" />{' '}
                                        {isEditMode
                                            ? t('testimonials.actions.saveChanges')
                                            : t('testimonials.actions.create')}
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
