'use client';

import type { TemplateCatalog, TemplateCategory, TemplateStatus } from '@/features/template/types';
import styles from '@/styles/platform/templates/NewTemplateModal.module.css';
import { useEffect, useMemo, useState } from 'react';

type TemplateFormData = Pick<
    TemplateCatalog,
    | 'code'
    | 'name'
    | 'kind'
    | 'categoryId'
    | 'status'
    | 'previewImageUrl'
    | 'isActive'
    | 'isPublic'
    | 'sortOrder'
>;

type NewTemplateModalProps = {
    open: boolean;
    categories: TemplateCategory[];
    mode?: 'create' | 'edit';
    initialData?: TemplateCatalog | null;
    loading?: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

const statusOptions: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

function getStatusLabel(status: TemplateStatus) {
    switch (status) {
        case 'DRAFT':
            return 'Draft';
        case 'PUBLISHED':
            return 'Published';
        case 'ARCHIVED':
            return 'Archived';
        default:
            return status;
    }
}
function createInitialForm(categories: TemplateCategory[] = []): TemplateFormData {
    return {
        code: '',
        name: '',
        kind: '',
        categoryId: categories[0]?.id ?? '',
        status: 'PUBLISHED',
        previewImageUrl: '',
        isActive: true,
        isPublic: true,
        sortOrder: 0,
    };
}
function createFormFromTemplate(
    template: TemplateCatalog,
    categories: TemplateCategory[],
): TemplateFormData {
    const validCategoryId = categories.some((category) => category.id === template.categoryId)
        ? template.categoryId
        : (categories[0]?.id ?? '');

    return {
        code: template.code ?? '',
        name: template.name ?? '',
        kind: template.kind ?? '',

        categoryId: validCategoryId,

        status: template.status ?? 'PUBLISHED',

        previewImageUrl: template.previewImageUrl ?? '',

        isActive: template.isActive ?? true,

        isPublic: template.isPublic ?? true,

        sortOrder: template.sortOrder ?? 0,
    };
}

function toSlug(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
}

export default function NewTemplateModal({
    open,
    categories,
    mode = 'create',
    initialData = null,
    loading = false,
    onClose,
    onCreated,
}: NewTemplateModalProps) {
    const [form, setForm] = useState<TemplateFormData>(() => createInitialForm(categories));
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedPreviewFileName, setSelectedPreviewFileName] = useState('');

    const [categoryKeyword, setCategoryKeyword] = useState('');
    const [categoryOpen, setCategoryOpen] = useState(false);

    const selectedCategory = useMemo(
        () => categories.find((item) => item.id === form.categoryId) || null,
        [categories, form.categoryId],
    );

    const filteredCategories = useMemo(() => {
        const keyword = categoryKeyword.trim().toLowerCase();

        if (!keyword) return categories;

        return categories.filter(
            (item) =>
                item.name.toLowerCase().includes(keyword) ||
                item.minTier.toLowerCase().includes(keyword),
        );
    }, [categories, categoryKeyword]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submitting && !loading) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, submitting, loading]);

    useEffect(() => {
        if (!open) return;

        setErrorMessage('');
        setUploadProgress(0);
        setSelectedPreviewFileName('');

        if (mode === 'edit' && initialData) {
            setForm(createFormFromTemplate(initialData, categories));
            return;
        }

        setForm((prev) => {
            const nextGroupId =
                prev.categoryId && categories.some((group) => group.id === prev.categoryId)
                    ? prev.categoryId
                    : categories[0]?.id || '';

            return {
                ...createInitialForm(categories),
                categoryId: nextGroupId,
            };
        });
    }, [open, mode, initialData, categories]);

    function handleChange<K extends keyof TemplateFormData>(key: K, value: TemplateFormData[K]) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (errorMessage) {
            setErrorMessage('');
        }
    }

    const handleClose = () => {
        if (submitting || loading) return;

        setForm(createInitialForm(categories));
        setErrorMessage('');
        setUploadProgress(0);
        setSelectedPreviewFileName('');
        onClose();
    };

    const validateForm = () => {
        if (!form.code.trim()) return 'Vui lòng nhập Code.';
        if (!form.name.trim()) return 'Vui lòng nhập Name.';
        if (!form.kind.trim()) return 'Vui lòng nhập Kind.';
        if (!form.categoryId) return 'Vui lòng chọn Group.';
        if (form.sortOrder < 0) return 'Sort Order phải lớn hơn hoặc bằng 0.';
        return '';
    };

    const payload = {
        ...form,
        code: form.code?.trim(),
        name: form.name?.trim(),
        kind: form.kind?.trim(),
    };

    const handleSubmit = async () => {
        const validationError = validateForm();

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        try {
            setSubmitting(true);
            setErrorMessage('');

            const isEditMode = mode === 'edit' && Boolean(initialData?.id);

            const response = await fetch(
                isEditMode
                    ? `/api/platform/templates/${initialData?.id}`
                    : '/api/platform/templates',
                {
                    method: isEditMode ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                },
            );

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    result?.message ||
                    result?.errors?.[0] ||
                    (isEditMode ? 'Cập nhật template thất bại.' : 'Tạo template thất bại.');
                setErrorMessage(message);
                return;
            }

            setForm(createInitialForm(categories));
            setSelectedPreviewFileName('');
            setUploadProgress(0);
            onCreated?.();
            onClose();
        } catch (error) {
            console.error(`${mode === 'edit' ? 'Update' : 'Create'} template failed:`, error);
            setErrorMessage('Có lỗi xảy ra khi kết nối tới server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePreviewFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedPreviewFileName(file.name);
        setUploading(true);
        setUploadProgress(0);
        setErrorMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            setUploadProgress(30);

            const response = await fetch('/api/platform/templates/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json().catch(() => null);

            setUploadProgress(70);

            if (!response.ok || !result?.url) {
                throw new Error(result?.message || result?.error || 'Upload failed');
            }

            setUploadProgress(100);

            setForm((prev) => ({
                ...prev,
                previewImageUrl: result.url,
            }));
        } catch (error) {
            console.error('Upload preview failed:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Upload ảnh thất bại.');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleRemovePreviewImage = () => {
        setForm((prev) => ({
            ...prev,
            previewImageUrl: '',
        }));
        setSelectedPreviewFileName('');
        setUploadProgress(0);
    };

    if (!open) return null;

    const isBusy = submitting || loading;
    const isEditMode = mode === 'edit';

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div
                className={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={isEditMode ? 'Edit Template' : 'New Template'}
            >
                <div className={styles.modalHeader}>
                    <div>
                        <h3 className={styles.modalTitle}>
                            {isEditMode ? 'Edit Template' : 'New Template'}
                        </h3>
                    </div>

                    <button
                        className={styles.modalClose}
                        onClick={handleClose}
                        aria-label="Close modal"
                        type="button"
                        disabled={isBusy}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {loading ? (
                        <div
                            style={{
                                padding: '24px 0',
                                textAlign: 'center',
                                fontSize: 14,
                                color: '#64748b',
                            }}
                        >
                            Đang tải dữ liệu template...
                        </div>
                    ) : (
                        <>
                            <div className={styles.modalGrid}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Code</label>
                                    <input
                                        className={styles.input}
                                        value={form.code}
                                        onChange={(e) => handleChange('code', e.target.value)}
                                        placeholder="landing-saas-pro"
                                        disabled={isBusy}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Name</label>
                                    <input
                                        className={styles.input}
                                        value={form.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Landing SaaS Pro"
                                        disabled={isBusy}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Kind</label>
                                    <input
                                        className={styles.input}
                                        value={form.kind}
                                        onChange={(e) => handleChange('kind', e.target.value)}
                                        placeholder="HeroBanner"
                                        disabled={isBusy}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Category</label>

                                    <div className={styles.comboBox}>
                                        <input
                                            className={styles.input}
                                            placeholder="Tìm category..."
                                            value={categoryKeyword}
                                            onFocus={() => setCategoryOpen(true)}
                                            onChange={(e) => setCategoryKeyword(e.target.value)}
                                        />

                                        {categoryOpen && (
                                            <div className={styles.dropdown}>
                                                {filteredCategories.map((category) => (
                                                    <button
                                                        key={category.id}
                                                        type="button"
                                                        className={styles.dropdownItem}
                                                        onClick={() => {
                                                            handleChange('categoryId', category.id);

                                                            setCategoryKeyword(
                                                                `${category.name} (${category.minTier})`,
                                                            );

                                                            setCategoryOpen(false);
                                                        }}
                                                    >
                                                        {category.name}
                                                        <span>({category.minTier})</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Status</label>
                                    <select
                                        className={styles.input}
                                        value={form.status}
                                        onChange={(e) =>
                                            handleChange('status', e.target.value as TemplateStatus)
                                        }
                                        disabled={isBusy}
                                    >
                                        {statusOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {getStatusLabel(item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Sort Order</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) =>
                                            handleChange('sortOrder', Number(e.target.value))
                                        }
                                        min={0}
                                        disabled={isBusy}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Preview Image</label>

                                <div className={styles.uploadCard}>
                                    <div className={styles.uploadTop}>
                                        <label className={styles.uploadButton}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className={styles.hiddenInput}
                                                disabled={isBusy || uploading}
                                                onChange={handlePreviewFileChange}
                                            />
                                            Select image
                                        </label>

                                        <div className={styles.uploadStatus}>
                                            {uploading
                                                ? 'Uploading...'
                                                : form.previewImageUrl
                                                  ? 'Uploaded'
                                                  : 'No file selected'}
                                        </div>
                                    </div>

                                    {selectedPreviewFileName ? (
                                        <div className={styles.fileRow}>
                                            <div className={styles.fileInfo}>
                                                <span className={styles.fileIcon}>🖼️</span>
                                                <div className={styles.fileMeta}>
                                                    <span className={styles.fileName}>
                                                        {selectedPreviewFileName}
                                                    </span>
                                                    {uploading ? (
                                                        <span className={styles.fileSubtext}>
                                                            {uploadProgress}%
                                                        </span>
                                                    ) : (
                                                        <span className={styles.fileSubtext}>
                                                            {form.previewImageUrl
                                                                ? 'Upload completed'
                                                                : 'Ready to upload'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {form.previewImageUrl && !uploading ? (
                                                <button
                                                    type="button"
                                                    className={styles.removeButton}
                                                    onClick={handleRemovePreviewImage}
                                                    disabled={isBusy}
                                                >
                                                    Remove
                                                </button>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    {uploading ? (
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressValue}
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    ) : null}

                                    {form.previewImageUrl ? (
                                        <div className={styles.previewBox}>
                                            <img
                                                src={form.previewImageUrl}
                                                alt="Preview"
                                                className={styles.previewImage}
                                            />
                                        </div>
                                    ) : null}
                                </div>

                                <span className={styles.hint}>
                                    Tải ảnh preview lên để hệ thống tự gán URL vào template.
                                </span>
                            </div>

                            <div className={styles.switchRow}>
                                <label className={styles.switchItem}>
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => handleChange('isActive', e.target.checked)}
                                        disabled={isBusy}
                                    />
                                    <span>Is Active</span>
                                </label>

                                <label className={styles.switchItem}>
                                    <input
                                        type="checkbox"
                                        checked={form.isPublic}
                                        onChange={(e) => handleChange('isPublic', e.target.checked)}
                                        disabled={isBusy}
                                    />
                                    <span>Is Public</span>
                                </label>
                            </div>

                            {selectedCategory ? (
                                <div
                                    style={{
                                        marginTop: 12,
                                        fontSize: 13,
                                        color: '#64748b',
                                    }}
                                >
                                    Group hiện tại: <strong>{selectedCategory.name}</strong>
                                </div>
                            ) : null}

                            {errorMessage ? (
                                <div
                                    style={{
                                        marginTop: 16,
                                        padding: '12px 14px',
                                        borderRadius: 12,
                                        border: '1px solid rgba(239, 68, 68, 0.25)',
                                        background: 'rgba(239, 68, 68, 0.08)',
                                        color: '#b91c1c',
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {errorMessage}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={styles.modalGhostButton}
                        onClick={handleClose}
                        type="button"
                        disabled={isBusy}
                    >
                        Cancel
                    </button>

                    <button
                        className={styles.modalPrimaryButton}
                        onClick={handleSubmit}
                        type="button"
                        disabled={isBusy || loading}
                    >
                        <i className={`bi ${isEditMode ? 'bi-save' : 'bi-plus-lg'}`} />
                        {submitting
                            ? isEditMode
                                ? 'Saving...'
                                : 'Creating...'
                            : isEditMode
                              ? 'Save Template'
                              : 'Create Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}
