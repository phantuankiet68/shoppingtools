'use client';

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import styles from './add-team-member-modal.module.css';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';

type Locale = 'vi' | 'en' | 'ja';
type TeamMemberColor = 'blue' | 'pink' | 'green' | 'orange';

type TeamMemberTranslation = {
    id?: string;
    locale: Locale;
    name: string;
    role: string;
    department: string | null;
    description: string | null;
};

type TeamMember = {
    id: string;
    siteId: string;
    name: string;
    email: string;
    role: string;
    department: string;
    description: string;
    imageUrl: string | null;
    icon: string | null;
    experience: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    sortOrder: number;
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    isActive: boolean;
    color: TeamMemberColor;
    translations: TeamMemberTranslation[];
};

type Translation = {
    name: string;
    role: string;
    department: string;
    description: string;
};

type Props = {
    siteId: string;
    member?: TeamMember | null;
    onClose: () => void;
    onSuccess?: (data: unknown) => void;
};

type UploadResponse = {
    success?: boolean;
    message?: string;
    file?: {
        url?: string;
    };
};

const locales: {
    value: Locale;
    label: string;
    short: string;
}[] = [
    {
        value: 'en',
        label: 'English',
        short: 'EN',
    },
    {
        value: 'vi',
        label: 'Vietnamese',
        short: 'VI',
    },
    {
        value: 'ja',
        label: 'Japanese',
        short: 'JA',
    },
];

const emptyTranslations = (): Record<Locale, Translation> => ({
    en: {
        name: '',
        role: '',
        department: '',
        description: '',
    },
    vi: {
        name: '',
        role: '',
        department: '',
        description: '',
    },
    ja: {
        name: '',
        role: '',
        department: '',
        description: '',
    },
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const createTranslationsFromMember = (member: TeamMember): Record<Locale, Translation> => {
    const translations = emptyTranslations();

    for (const locale of locales) {
        const translation = member.translations.find((item) => item.locale === locale.value);

        if (!translation) {
            continue;
        }

        translations[locale.value] = {
            name: translation.name ?? '',
            role: translation.role ?? '',
            department: translation.department ?? '',
            description: translation.description ?? '',
        };
    }

    return translations;
};

export default function AddTeamMemberModal({ siteId, member, onClose, onSuccess }: Props) {
    const { t } = useAdminI18n();
    const modal = useModal();

    const isEditMode = Boolean(member?.id);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewUrlRef = useRef('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [icon, setIcon] = useState('');
    const [experience, setExperience] = useState('');
    const [color, setColor] = useState<TeamMemberColor>('blue');

    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [email, setEmail] = useState('');

    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);

    const [locale, setLocale] = useState<Locale>('en');
    const [translations, setTranslations] = useState(emptyTranslations);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const current = translations[locale];

    const canSubmit = useMemo(() => {
        return Boolean(siteId && current.name.trim() && current.role.trim() && !submitting);
    }, [siteId, current.name, current.role, submitting]);

    /**
     * Initialize form when opening Add/Edit modal.
     */
    useEffect(() => {
        if (!member) {
            setImageFile(null);
            setImagePreview('');
            setCurrentImageUrl(null);
            setRemoveCurrentImage(false);

            setIcon('');
            setExperience('');
            setColor('blue');

            setLinkedinUrl('');
            setTwitterUrl('');
            setEmail('');

            setSortOrder('0');
            setIsActive(true);

            setLocale('en');
            setTranslations(emptyTranslations);
            setError('');

            return;
        }

        setImageFile(null);
        setImagePreview('');
        setCurrentImageUrl(member.imageUrl);
        setRemoveCurrentImage(false);

        setIcon(member.icon ?? '');
        setExperience(member.experience ?? '');
        setColor(member.color);

        setLinkedinUrl(member.linkedinUrl ?? '');
        setTwitterUrl(member.twitterUrl ?? '');
        setEmail(member.email ?? '');

        setSortOrder(String(member.sortOrder ?? 0));
        setIsActive(member.isActive);

        setLocale('en');
        setTranslations(createTranslationsFromMember(member));
        setError('');
    }, [member]);

    /**
     * Cleanup local preview.
     */
    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = '';
            }
        };
    }, []);

    /**
     * Update current locale translation.
     */
    const updateTranslation = (field: keyof Translation, value: string) => {
        setTranslations((prev) => ({
            ...prev,
            [locale]: {
                ...prev[locale],
                [field]: value,
            },
        }));
    };

    /**
     * Handle selected image.
     */
    const handleImageFile = (file: File) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            setError(
                t('teamMember.form.invalidImage') || 'Please select a PNG, JPG, or WEBP image.',
            );
            return;
        }

        if (file.size <= 0) {
            setError(t('teamMember.form.emptyImage') || 'The selected image is empty.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError(t('teamMember.form.imageTooLarge') || 'Image size must be smaller than 5MB.');
            return;
        }

        setError('');
        setRemoveCurrentImage(false);

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

        if (file) {
            handleImageFile(file);
        }

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

        const file = event.dataTransfer.files?.[0];

        if (file) {
            handleImageFile(file);
        }
    };

    /**
     * Remove selected/new image.
     */
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

    /**
     * Remove existing image from member.
     */
    const handleRemoveCurrentImage = () => {
        setCurrentImageUrl(null);
        setRemoveCurrentImage(true);
        removeImage();
    };

    /**
     * Upload a new image.
     */
    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) {
            return currentImageUrl;
        }

        const formData = new FormData();

        formData.append('file', imageFile);
        formData.append('siteId', siteId);
        formData.append('folder', 'team-members');

        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
        });

        const result = (await response.json().catch(() => ({}))) as UploadResponse;

        if (!response.ok || !result.file?.url) {
            throw new Error(
                result.message || t('teamMember.form.uploadFailed') || 'Failed to upload image.',
            );
        }

        return result.file.url;
    };

    /**
     * Submit Add / Update.
     */
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit || submitting) {
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const imageUrl = await uploadImage();

            const payload = {
                siteId,
                imageUrl: removeCurrentImage ? null : imageUrl,
                icon: icon.trim() || null,
                experience: experience.trim() || null,
                color,
                linkedinUrl: linkedinUrl.trim() || null,
                twitterUrl: twitterUrl.trim() || null,
                email: email.trim() || null,
                sortOrder: Number(sortOrder) || 0,
                isActive,
                translations: locales.map((item) => ({
                    locale: item.value,
                    name: translations[item.value].name.trim(),
                    role: translations[item.value].role.trim(),
                    department: translations[item.value].department.trim() || null,
                    description: translations[item.value].description.trim() || null,
                })),
            };

            const endpoint = isEditMode
                ? `/api/admin/team-member/${member!.id}`
                : '/api/admin/team-member';

            const response = await fetch(endpoint, {
                method: isEditMode ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.error ||
                        result.message ||
                        (isEditMode
                            ? t('teamMember.form.updateFailed')
                            : t('teamMember.form.createFailed')) ||
                        'Failed to save team member.',
                );
            }

            modal.success(
                t('teamMember.modal.success') || 'Success',
                isEditMode
                    ? t('teamMember.modal.updatedSuccess') || 'Team member updated successfully.'
                    : t('teamMember.modal.createdSuccess') || 'Team member created successfully.',
            );

            onSuccess?.(result);
            onClose();
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : isEditMode
                      ? t('teamMember.form.updateFailed') || 'Failed to update team member.'
                      : t('teamMember.form.createFailed') || 'Failed to create team member.';

            setError(message);

            modal.error(
                isEditMode
                    ? t('teamMember.modal.updateFailed') || 'Update team member failed'
                    : t('teamMember.modal.createFailed') || 'Create team member failed',
                message,
            );
        } finally {
            setSubmitting(false);
        }
    };

    const title = isEditMode
        ? t('teamMember.form.editTitle') || 'Edit team member'
        : t('teamMember.form.addTitle') || 'Add team member';

    const description = isEditMode
        ? t('teamMember.form.editDescription') ||
          'Update team member information and localized content.'
        : t('teamMember.form.addDescription') ||
          'Create a new team member profile and add localized information.';

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-member-modal-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    if (!submitting) {
                        onClose();
                    }
                }
            }}
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div>
                        <div className={styles.eyebrow}>
                            <i className="bi bi-people" />
                            Team
                        </div>

                        <h2 id="team-member-modal-title">{title}</h2>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>{t('teamMember.form.profile') || 'Profile'}</h3>

                                    <p>
                                        {t('teamMember.form.profileDescription') ||
                                            'Basic information and profile image.'}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.profileGrid}>
                                <div
                                    className={`${styles.uploadBox} ${
                                        isDragging ? styles.uploadBoxDragging : ''
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <div className={styles.previewWrapper}>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className={styles.preview}
                                            />

                                            <button
                                                type="button"
                                                className={styles.removeImage}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeImage();
                                                }}
                                            >
                                                <i className="bi bi-trash3" />
                                            </button>
                                        </div>
                                    ) : currentImageUrl && !removeCurrentImage ? (
                                        <div className={styles.previewWrapper}>
                                            <img
                                                src={currentImageUrl}
                                                alt={member?.name || 'Team member'}
                                                className={styles.preview}
                                            />

                                            <button
                                                type="button"
                                                className={styles.removeImage}
                                                onClick={(event) => {
                                                    event.stopPropagation();

                                                    handleRemoveCurrentImage();
                                                }}
                                                aria-label={t('teamMember.form.removeImage')}
                                            >
                                                <i className="bi bi-trash3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.uploadIcon}>
                                                <i className="bi bi-cloud-arrow-up" />
                                            </div>

                                            <strong>
                                                {t('teamMember.form.uploadAvatar') ||
                                                    'Upload avatar'}
                                            </strong>

                                            <span>
                                                {t('teamMember.form.dragDrop') ||
                                                    'Drag & drop or click to browse'}
                                            </span>

                                            <small>PNG, JPG, WEBP · Max 5MB</small>
                                        </>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleImageChange}
                                        hidden
                                    />
                                </div>

                                <div className={styles.fields}>
                                    <div className={styles.field}>
                                        <label>{t('teamMember.form.icon') || 'Icon'}</label>

                                        <div className={styles.inputWithIcon}>
                                            <i className="bi bi-stars" />

                                            <input
                                                value={icon}
                                                onChange={(event) => setIcon(event.target.value)}
                                                placeholder="bi-stars"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.twoColumns}>
                                        <div className={styles.field}>
                                            <label>
                                                {t('teamMember.form.experience') || 'Experience'}
                                            </label>

                                            <input
                                                value={experience}
                                                onChange={(event) =>
                                                    setExperience(event.target.value)
                                                }
                                                placeholder="5+ years"
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label>{t('teamMember.form.color') || 'Color'}</label>

                                            <select
                                                value={color}
                                                onChange={(event) =>
                                                    setColor(event.target.value as TeamMemberColor)
                                                }
                                            >
                                                <option value="blue">Blue</option>

                                                <option value="pink">Pink</option>

                                                <option value="green">Green</option>

                                                <option value="orange">Orange</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>{t('teamMember.form.translations') || 'Translations'}</h3>

                                    <p>
                                        {t('teamMember.form.translationsDescription') ||
                                            'Add localized content for each supported language.'}
                                    </p>
                                </div>

                                <div className={styles.localeTabs}>
                                    {locales.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            className={
                                                locale === item.value
                                                    ? styles.localeActive
                                                    : styles.localeButton
                                            }
                                            onClick={() => setLocale(item.value)}
                                        >
                                            {item.short}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.translationGrid}>
                                <div className={styles.field}>
                                    <label>
                                        {t('teamMember.form.name') || 'Name'}
                                        <span>*</span>
                                    </label>

                                    <input
                                        value={current.name}
                                        onChange={(event) =>
                                            updateTranslation('name', event.target.value)
                                        }
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        {t('teamMember.form.role') || 'Role'}
                                        <span>*</span>
                                    </label>

                                    <input
                                        value={current.role}
                                        onChange={(event) =>
                                            updateTranslation('role', event.target.value)
                                        }
                                        placeholder="Senior Developer"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>{t('teamMember.form.department') || 'Department'}</label>

                                    <input
                                        value={current.department}
                                        onChange={(event) =>
                                            updateTranslation('department', event.target.value)
                                        }
                                        placeholder="Engineering"
                                    />
                                </div>

                                <div className={`${styles.field} ${styles.fullWidth}`}>
                                    <label>
                                        {t('teamMember.form.description') || 'Description'}
                                    </label>

                                    <textarea
                                        value={current.description}
                                        onChange={(event) =>
                                            updateTranslation('description', event.target.value)
                                        }
                                        rows={4}
                                        placeholder={
                                            t('teamMember.form.descriptionPlaceholder') ||
                                            'Short introduction about this team member...'
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>
                                        {t('teamMember.form.contact') || 'Contact & visibility'}
                                    </h3>
                                </div>
                            </div>

                            <div className={styles.twoColumns}>
                                <div className={styles.field}>
                                    <label>
                                        <i className="bi bi-linkedin" />
                                        LinkedIn
                                    </label>

                                    <input
                                        type="url"
                                        value={linkedinUrl}
                                        onChange={(event) => setLinkedinUrl(event.target.value)}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        <i className="bi bi-twitter-x" />
                                        Twitter
                                    </label>

                                    <input
                                        type="url"
                                        value={twitterUrl}
                                        onChange={(event) => setTwitterUrl(event.target.value)}
                                        placeholder="https://x.com/..."
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        <i className="bi bi-envelope" />
                                        {t('teamMember.form.email') || 'Email'}
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="member@example.com"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>{t('teamMember.form.sortOrder') || 'Sort order'}</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={sortOrder}
                                        onChange={(event) => setSortOrder(event.target.value)}
                                    />
                                </div>
                            </div>

                            <label className={styles.switchRow}>
                                <span>
                                    <strong>
                                        {t('teamMember.form.active') || 'Active member'}
                                    </strong>

                                    <small>
                                        {t('teamMember.form.activeDescription') ||
                                            'Display this member on the website.'}
                                    </small>
                                </span>

                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(event) => setIsActive(event.target.checked)}
                                />

                                <span className={styles.switch} />
                            </label>
                        </section>

                        {error && (
                            <div className={styles.error}>
                                <i className="bi bi-exclamation-circle" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            {t('common.cancel') || 'Cancel'}
                        </button>

                        <button type="submit" className={styles.submitButton} disabled={!canSubmit}>
                            {submitting ? (
                                <>
                                    <span className={styles.spinner} />

                                    {t('common.saving') || 'Saving...'}
                                </>
                            ) : isEditMode ? (
                                <>
                                    <i className="bi bi-check-lg" />

                                    {t('teamMember.form.update') || 'Update member'}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-lg" />

                                    {t('teamMember.form.create') || 'Add member'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
