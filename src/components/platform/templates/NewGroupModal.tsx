'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/platform/templates/NewGroupModal.module.css';

export type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';

export type AccessTier = 'BASIC' | 'NORMAL' | 'PRO';

export type NewTemplateCategoryForm = {
    name: string;
    websiteType: WebsiteType;
    minTier: AccessTier;
    sortOrder: number;
    isActive: boolean;
};

type NewGroupModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

const WEBSITE_TYPES: WebsiteType[] = ['landing', 'blog', 'ecommerce', 'booking', 'lms'];

const ACCESS_TIERS: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

const createInitialForm = (): NewTemplateCategoryForm => ({
    name: '',
    websiteType: 'landing',
    minTier: 'BASIC',
    sortOrder: 0,
    isActive: true,
});

export default function NewGroupModal({ open, onClose, onCreated }: NewGroupModalProps) {
    const [form, setForm] = useState(createInitialForm);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submitting) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, submitting]);

    const handleClose = () => {
        if (submitting) return;

        setForm(createInitialForm());
        setErrorMessage('');
        onClose();
    };

    const updateField = <K extends keyof NewTemplateCategoryForm>(
        key: K,
        value: NewTemplateCategoryForm[K],
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (errorMessage) {
            setErrorMessage('');
        }
    };

    const validate = () => {
        if (!form.name.trim()) {
            return 'Vui lòng nhập Category Name.';
        }

        if (form.sortOrder < 0) {
            return 'Sort Order phải lớn hơn hoặc bằng 0.';
        }

        return null;
    };

    const handleSubmit = async () => {
        const error = validate();

        if (error) {
            setErrorMessage(error);
            return;
        }

        setSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/platform/templates/template-categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    websiteType: form.websiteType,
                    minTier: form.minTier,
                    sortOrder: form.sortOrder,
                    isActive: form.isActive,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                setErrorMessage(
                    result?.error ||
                        result?.message ||
                        result?.errors?.[0] ||
                        'Tạo Template Category thất bại.',
                );
                return;
            }

            setForm(createInitialForm());
            onCreated?.();
            onClose();
        } catch (error) {
            console.error('Create template category failed:', error);

            setErrorMessage('Có lỗi xảy ra khi kết nối tới server.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div
                className={styles.modal}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-category-title"
            >
                <div className={styles.header}>
                    <h2 id="new-category-title" className={styles.title}>
                        New Template Category
                    </h2>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Close"
                        disabled={submitting}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.gridTwo}>
                        {/* Category Name */}
                        <div className={styles.field}>
                            <label className={styles.label}>Category Name</label>

                            <input
                                className={styles.input}
                                value={form.name}
                                onChange={(event) => updateField('name', event.target.value)}
                                placeholder="Ví dụ: Company Profile"
                                disabled={submitting}
                                autoFocus
                            />
                        </div>

                        {/* Website Type */}
                        <div className={styles.field}>
                            <label className={styles.label}>Website Type</label>

                            <select
                                className={styles.select}
                                value={form.websiteType}
                                onChange={(event) =>
                                    updateField('websiteType', event.target.value as WebsiteType)
                                }
                                disabled={submitting}
                            >
                                {WEBSITE_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tier + Sort */}
                    <div className={styles.gridTwo}>
                        <div className={styles.field}>
                            <label className={styles.label}>Min Tier</label>

                            <select
                                className={styles.select}
                                value={form.minTier}
                                onChange={(event) =>
                                    updateField('minTier', event.target.value as AccessTier)
                                }
                                disabled={submitting}
                            >
                                {ACCESS_TIERS.map((tier) => (
                                    <option key={tier} value={tier}>
                                        {tier}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Sort Order</label>

                            <input
                                className={styles.input}
                                type="number"
                                min={0}
                                value={form.sortOrder}
                                onChange={(event) =>
                                    updateField(
                                        'sortOrder',
                                        Math.max(0, Number(event.target.value) || 0),
                                    )
                                }
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Active */}
                    <div className={styles.switchRow}>
                        <label className={styles.switchItem}>
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(event) => updateField('isActive', event.target.checked)}
                                disabled={submitting}
                            />

                            <span>Active Category</span>
                        </label>
                    </div>

                    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        <i className={submitting ? 'bi bi-arrow-repeat' : 'bi bi-plus-lg'} />

                        {submitting ? 'Creating...' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
    );
}
