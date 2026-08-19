'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import styles from './page-template-modal.module.css';

type AccessTier = 'BASIC' | 'NORMAL' | 'PRO';
type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';

type TemplateCategory = {
    id: string;
    name: string;
    websiteType: WebsiteType;
    minTier: AccessTier;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: PageTemplateFormData) => Promise<void> | void;
};

export type PageTemplateFormData = {
    title: string;
    key: string;
    categoryId: string;
    websiteType: WebsiteType | '';
    minTier: AccessTier;
    status: TemplateStatus;
    path: string;
    previewImageUrl: string;
    sortOrder: number;
    isActive: boolean;
    isPublic: boolean;
    blocks: string;
};

type CategoryResponse = {
    success: boolean;
    data?: {
        categories: TemplateCategory[];
        count: number;
    };
    error?: string;
};

type UploadResponse = {
    success: boolean;
    data?: {
        url: string;
        fileName: string;
        originalName: string;
        size: number;
        type: string;
    };
    error?: string;
};

const INITIAL_FORM: PageTemplateFormData = {
    title: '',
    key: '',
    categoryId: '',
    websiteType: '',
    minTier: 'BASIC',
    status: 'DRAFT',
    path: '',
    previewImageUrl: '',
    sortOrder: 0,
    isActive: true,
    isPublic: true,
    blocks: '',
};
const WEBSITE_TYPES: Array<{
    value: WebsiteType;
    label: string;
}> = [
    {
        value: 'landing',
        label: 'Landing',
    },
    {
        value: 'blog',
        label: 'Blog',
    },
    {
        value: 'ecommerce',
        label: 'Ecommerce',
    },
    {
        value: 'booking',
        label: 'Booking',
    },
    {
        value: 'lms',
        label: 'LMS',
    },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function PageTemplateModal({ open, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<PageTemplateFormData>(INITIAL_FORM);

    const [categories, setCategories] = useState<TemplateCategory[]>([]);

    const [categoriesLoading, setCategoriesLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [uploadingImage, setUploadingImage] = useState(false);

    const [preview, setPreview] = useState<string | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) return;

        setForm(INITIAL_FORM);
        setCategories([]);
        setPreview(null);
        setErrors({});
        setSubmitting(false);
        setUploadingImage(false);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submitting && !uploadingImage) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose, submitting, uploadingImage]);

    useEffect(() => {
        if (!open || !form.websiteType) {
            return;
        }

        let cancelled = false;

        const loadCategories = async () => {
            try {
                setCategoriesLoading(true);

                setErrors((current) => {
                    const next = {
                        ...current,
                    };

                    delete next.categoryId;

                    return next;
                });

                const params = new URLSearchParams();

                params.set('websiteType', form.websiteType);

                const response = await fetch(
                    `/api/platform/template-categories?${params.toString()}`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    },
                );

                const result = (await response.json()) as CategoryResponse;

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to load template categories.');
                }

                if (cancelled) {
                    return;
                }

                const nextCategories = result.data?.categories ?? [];

                setCategories(nextCategories);

                setForm((current) => {
                    const categoryStillValid = nextCategories.some(
                        (category) => category.id === current.categoryId,
                    );

                    return {
                        ...current,
                        categoryId: categoryStillValid ? current.categoryId : '',
                    };
                });
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error('[PageTemplateModal] loadCategories', error);

                setCategories([]);

                setErrors((current) => ({
                    ...current,
                    categoryId:
                        error instanceof Error ? error.message : 'Failed to load categories.',
                }));
            } finally {
                if (!cancelled) {
                    setCategoriesLoading(false);
                }
            }
        };

        void loadCategories();

        return () => {
            cancelled = true;
        };
    }, [open, form.websiteType]);

    const updateField = <K extends keyof PageTemplateFormData>(
        field: K,
        value: PageTemplateFormData[K],
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => {
            if (!current[field]) {
                return current;
            }

            const next = {
                ...current,
            };

            delete next[field];

            return next;
        });
    };

    const handleTitleChange = (value: string) => {
        setForm((current) => ({
            ...current,
            title: value,
            key: current.key ? current.key : normalizeKey(value),
        }));

        setErrors((current) => {
            if (!current.title) {
                return current;
            }

            const next = {
                ...current,
            };

            delete next.title;

            return next;
        });
    };

    const handleWebsiteTypeChange = (value: WebsiteType) => {
        setForm((current) => ({
            ...current,
            websiteType: value,
            categoryId: '',
        }));

        setErrors((current) => {
            const next = {
                ...current,
            };

            delete next.websiteType;
            delete next.categoryId;

            return next;
        });
    };

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrors((current) => ({
                ...current,
                previewImageUrl: 'Please select an image file.',
            }));

            event.target.value = '';

            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setErrors((current) => ({
                ...current,
                previewImageUrl: 'Image size must be smaller than 5MB.',
            }));

            event.target.value = '';

            return;
        }

        let localUrl: string | null = null;

        try {
            setUploadingImage(true);

            setErrors((current) => {
                const next = {
                    ...current,
                };

                delete next.previewImageUrl;
                delete next.submit;

                return next;
            });

            /*
             * Local preview while the image is being uploaded.
             */
            localUrl = URL.createObjectURL(file);

            setPreview((current) => {
                if (current) {
                    URL.revokeObjectURL(current);
                }

                return localUrl;
            });

            const formData = new FormData();

            formData.append('file', file);

            const response = await fetch('/api/platform/page-templates/upload', {
                method: 'POST',
                body: formData,
            });

            const result = (await response.json()) as UploadResponse;

            if (!response.ok || !result.success || !result.data?.url) {
                throw new Error(result.error || 'Failed to upload preview image.');
            }

            /*
             * Store the real public URL.
             *
             * Example:
             * /assets/page-templates/home-modern-01-abc123.png
             */
            updateField('previewImageUrl', result.data.url);
        } catch (error) {
            console.error('[PageTemplateModal] uploadPreviewImage', error);

            setPreview(null);

            updateField('previewImageUrl', '');

            setErrors((current) => ({
                ...current,
                previewImageUrl:
                    error instanceof Error ? error.message : 'Failed to upload preview image.',
            }));
        } finally {
            setUploadingImage(false);

            event.target.value = '';

            if (localUrl) {
                /*
                 * Keep the URL alive while it is displayed.
                 * It will be revoked when another image is selected
                 * or when the component is unmounted.
                 */
            }
        }
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!form.title.trim()) {
            nextErrors.title = 'Template name is required.';
        }

        if (!form.key.trim()) {
            nextErrors.key = 'Template key is required.';
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.key)) {
            nextErrors.key = 'Use lowercase letters, numbers and hyphens only.';
        }

        if (!form.websiteType) {
            nextErrors.websiteType = 'Website type is required.';
        }

        if (!form.categoryId) {
            nextErrors.categoryId = 'Category is required.';
        }

        if (form.websiteType && form.categoryId) {
            const category = categories.find((item) => item.id === form.categoryId);

            if (!category) {
                nextErrors.categoryId = 'Please select a valid category.';
            } else if (category.websiteType !== form.websiteType) {
                nextErrors.categoryId = 'Category does not belong to the selected website type.';
            }
        }

        if (form.path.trim() && !form.path.startsWith('/')) {
            nextErrors.path = 'Path must start with /.';
        }

        if (!form.previewImageUrl.trim()) {
            nextErrors.previewImageUrl = 'Preview image is required.';
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (submitting || uploadingImage) {
            return;
        }

        if (!validate()) {
            return;
        }

        try {
            setSubmitting(true);

            const payload: PageTemplateFormData = {
                ...form,
                title: form.title.trim(),
                key: normalizeKey(form.key),
                categoryId: form.categoryId.trim(),
                websiteType: form.websiteType,
                minTier: form.minTier,
                status: form.status,
                path: form.path.trim(),
                previewImageUrl: form.previewImageUrl.trim(),
                sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
                blocks: form.blocks ?? [],
            };

            await onSubmit?.(payload);
        } catch (error) {
            console.error('[PageTemplateModal] submit', error);

            setErrors({
                submit: error instanceof Error ? error.message : 'Failed to create page template.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="page-template-modal-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting && !uploadingImage) {
                    onClose();
                }
            }}
        >
            <div className={styles.modal}>
                <header className={styles.header}>
                    <div className={styles.headerIdentity}>
                        <div className={styles.headerIcon}>
                            <i className="bi bi-layout-text-window-reverse" />
                        </div>

                        <div>
                            <h2 id="page-template-modal-title">Create Page Template</h2>

                            <p>Create a reusable page template for your platform.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={submitting || uploadingImage}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </header>

                <div className={styles.steps}>
                    <div className={`${styles.step} ${styles.stepActive}`}>
                        <span>1</span>
                        <strong>Basic Info</strong>
                    </div>

                    <div className={styles.stepLine} />

                    <div className={styles.step}>
                        <span>2</span>
                        <strong>Content</strong>
                    </div>

                    <div className={styles.stepLine} />

                    <div className={styles.step}>
                        <span>3</span>
                        <strong>Review</strong>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formContent}>
                        <section className={styles.mainColumn}>
                            <div className={styles.fieldsGrid}>
                                <div className={styles.fieldsGridLeft}>
                                    <Field label="Template Name" required error={errors.title}>
                                        <input
                                            value={form.title}
                                            onChange={(event) =>
                                                handleTitleChange(event.target.value)
                                            }
                                            placeholder="e.g. Home Modern 01"
                                        />
                                    </Field>

                                    <Field
                                        label="Template Key"
                                        required
                                        error={errors.key}
                                        hint="Unique key used in the system."
                                    >
                                        <input
                                            value={form.key}
                                            onChange={(event) =>
                                                updateField('key', normalizeKey(event.target.value))
                                            }
                                            placeholder="e.g. home-modern-01"
                                        />
                                    </Field>

                                    <Field label="Website Type" required error={errors.websiteType}>
                                        <select
                                            value={form.websiteType}
                                            onChange={(event) =>
                                                handleWebsiteTypeChange(
                                                    event.target.value as WebsiteType,
                                                )
                                            }
                                        >
                                            <option value="">Select website type</option>

                                            {WEBSITE_TYPES.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Category" required error={errors.categoryId}>
                                        <select
                                            value={form.categoryId}
                                            disabled={!form.websiteType || categoriesLoading}
                                            onChange={(event) =>
                                                updateField('categoryId', event.target.value)
                                            }
                                        >
                                            <option value="">
                                                {categoriesLoading
                                                    ? 'Loading categories...'
                                                    : !form.websiteType
                                                      ? 'Select website type first'
                                                      : 'Select category'}
                                            </option>

                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                                <section className={styles.contentSection}>
                                    <div className={styles.blockEditor}>
                                        <div className={styles.blockEditorHeader}>
                                            <div>
                                                <span className={styles.blockEditorLabel}>
                                                    Page Blocks
                                                </span>
                                            </div>

                                            <span className={styles.jsonBadge}>JSON</span>
                                        </div>

                                        <textarea
                                            className={styles.blocksTextarea}
                                            value={form.blocks}
                                            onChange={(event) =>
                                                updateField('blocks', event.target.value)
                                            }
                                            placeholder={`[
                                            {
                                                "id": "hero-01",
                                                "area": "content",
                                                "kind": "HeroService01",
                                                "props": {}
                                            },
                                            {
                                                "id": "showcase-01",
                                                "area": "content",
                                                "kind": "ShowcaseService01",
                                                "props": {}
                                            }
                                            ]`}
                                            spellCheck={false}
                                        />

                                        <div className={styles.blockEditorFooter}>
                                            <span>
                                                <i className="bi bi-info-circle" />
                                                Paste a valid JSON array of blocks.
                                            </span>

                                            <span>{form.blocks.length} characters</span>
                                        </div>
                                    </div>

                                    {errors.blocks && (
                                        <small className={styles.error}>{errors.blocks}</small>
                                    )}
                                </section>
                            </div>

                            <div className={styles.fieldBlock}>
                                <label className={styles.label}>
                                    Access Tier <span>*</span>
                                </label>

                                <div className={styles.optionGrid}>
                                    <TierOption
                                        value="BASIC"
                                        current={form.minTier}
                                        icon="bi-shield-check"
                                        title="Basic"
                                        description="For basic websites"
                                        onChange={(value) => updateField('minTier', value)}
                                    />

                                    <TierOption
                                        value="NORMAL"
                                        current={form.minTier}
                                        icon="bi-people"
                                        title="Normal"
                                        description="For growing businesses"
                                        onChange={(value) => updateField('minTier', value)}
                                    />

                                    <TierOption
                                        value="PRO"
                                        current={form.minTier}
                                        icon="bi-gem"
                                        title="Pro"
                                        description="For professional use"
                                        onChange={(value) => updateField('minTier', value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.fieldBlock}>
                                <label className={styles.label}>
                                    Status <span>*</span>
                                </label>

                                <div className={styles.optionGrid}>
                                    <StatusOption
                                        value="PUBLISHED"
                                        current={form.status}
                                        title="Published"
                                        description="Make this template available"
                                        color="green"
                                        onChange={(value) => updateField('status', value)}
                                    />

                                    <StatusOption
                                        value="DRAFT"
                                        current={form.status}
                                        title="Draft"
                                        description="Keep as draft"
                                        color="yellow"
                                        onChange={(value) => updateField('status', value)}
                                    />

                                    <StatusOption
                                        value="ARCHIVED"
                                        current={form.status}
                                        title="Archived"
                                        description="Not available"
                                        color="gray"
                                        onChange={(value) => updateField('status', value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <aside className={styles.sideColumn}>
                            <section className={styles.previewSection}>
                                <div className={styles.sideHeader}>
                                    <h3>Template Preview</h3>

                                    <p>Upload an image to showcase your template.</p>
                                </div>

                                <label
                                    className={`${styles.upload} ${
                                        uploadingImage ? styles.uploading : ''
                                    }`}
                                >
                                    {preview ? (
                                        <div className={styles.previewImage}>
                                            <img src={preview} alt="Template preview" />

                                            <div className={styles.previewOverlay}>
                                                <span>
                                                    {uploadingImage ? (
                                                        <>
                                                            <i className="bi bi-arrow-repeat" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-arrow-repeat" />
                                                            Change image
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.uploadIcon}>
                                                <i className="bi bi-image" />
                                                <span>+</span>
                                            </div>

                                            <strong>
                                                {uploadingImage
                                                    ? 'Uploading...'
                                                    : 'Upload Preview Image'}
                                            </strong>

                                            <span>PNG, JPG or WebP · Max size 5MB</span>

                                            <span className={styles.chooseButton}>Choose File</span>
                                        </>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        onChange={handleImageChange}
                                        disabled={submitting || uploadingImage}
                                    />
                                </label>

                                {errors.previewImageUrl && (
                                    <span className={styles.error}>{errors.previewImageUrl}</span>
                                )}

                                {form.previewImageUrl && !errors.previewImageUrl && (
                                    <small className={styles.uploadSuccess}>
                                        <i className="bi bi-check-circle-fill" />
                                        Preview image uploaded
                                    </small>
                                )}
                            </section>

                            <section className={styles.settingsSection}>
                                <Field
                                    label="Default Sort Order"
                                    hint="Lower numbers appear first."
                                >
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(event) =>
                                            updateField('sortOrder', Number(event.target.value))
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Template Path"
                                    hint="Optional. Example: /home-modern-01"
                                    error={errors.path}
                                >
                                    <input
                                        value={form.path}
                                        onChange={(event) =>
                                            updateField('path', event.target.value)
                                        }
                                        placeholder="/home-modern-01"
                                    />
                                </Field>
                            </section>

                            {errors.submit && (
                                <div className={styles.submitError}>
                                    <i className="bi bi-exclamation-triangle" />
                                    <span>{errors.submit}</span>
                                </div>
                            )}
                            <div className={styles.toggleGrid}>
                                <Toggle
                                    checked={form.isActive}
                                    label="Is Active"
                                    onChange={(value) => updateField('isActive', value)}
                                />

                                <Toggle
                                    checked={form.isPublic}
                                    label="Is Public"
                                    onChange={(value) => updateField('isPublic', value)}
                                />
                            </div>
                        </aside>
                    </div>

                    <footer className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={submitting || uploadingImage}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={submitting || uploadingImage}
                        >
                            {uploadingImage ? (
                                <>
                                    <i className="bi bi-cloud-arrow-up" />
                                    Uploading Image...
                                </>
                            ) : submitting ? (
                                <>
                                    <i className="bi bi-arrow-repeat" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create Page Template
                                    <i className="bi bi-arrow-right" />
                                </>
                            )}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function normalizeKey(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className={styles.field}>
            <label className={styles.label}>
                {label}

                {required && <span> *</span>}
            </label>

            {children}

            {error ? (
                <small className={styles.error}>{error}</small>
            ) : hint ? (
                <small className={styles.hint}>{hint}</small>
            ) : null}
        </div>
    );
}

function TierOption({
    value,
    current,
    icon,
    title,
    description,
    onChange,
}: {
    value: AccessTier;
    current: AccessTier;
    icon: string;
    title: string;
    description: string;
    onChange: (value: AccessTier) => void;
}) {
    const active = current === value;

    return (
        <button
            type="button"
            className={`${styles.optionCard} ${active ? styles.optionActive : ''}`}
            onClick={() => onChange(value)}
        >
            <span className={`${styles.optionIcon} ${styles[`tier${value}`]}`}>
                <i className={`bi ${icon}`} />
            </span>

            <span className={styles.optionText}>
                <strong>{title}</strong>

                <small>{description}</small>
            </span>

            {active && (
                <span className={styles.check}>
                    <i className="bi bi-check-lg" />
                </span>
            )}
        </button>
    );
}

function StatusOption({
    value,
    current,
    title,
    description,
    color,
    onChange,
}: {
    value: TemplateStatus;
    current: TemplateStatus;
    title: string;
    description: string;
    color: 'green' | 'yellow' | 'gray';
    onChange: (value: TemplateStatus) => void;
}) {
    const active = current === value;

    return (
        <button
            type="button"
            className={`${styles.statusOption} ${active ? styles.statusOptionActive : ''}`}
            onClick={() => onChange(value)}
        >
            <span className={`${styles.statusDot} ${styles[`dot${color}`]}`} />

            <span>
                <strong>{title}</strong>

                <small>{description}</small>
            </span>

            {active && <i className="bi bi-check-circle-fill" />}
        </button>
    );
}

function Toggle({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (value: boolean) => void;
}) {
    return (
        <button type="button" className={styles.toggleItem} onClick={() => onChange(!checked)}>
            <span className={`${styles.switch} ${checked ? styles.switchOn : ''}`}>
                <span />
            </span>

            <span>
                <strong>{label}</strong>
            </span>
        </button>
    );
}
