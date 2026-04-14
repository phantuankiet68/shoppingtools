'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/platform/templates/NewGroupModal.module.css';

export type AccessTier = 'BASIC' | 'NORMAL' | 'PRO';

export type NewTemplateGroupForm = {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  minTier: AccessTier;
  minTierLevel: number;
};

type NewGroupModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const tierOptions: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

function createInitialForm(): NewTemplateGroupForm {
  return {
    code: '',
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true,
    minTier: 'BASIC',
    minTierLevel: 1,
  };
}

export default function NewGroupModal({
  open,
  onClose,
  onCreated,
}: NewGroupModalProps) {
  const [form, setForm] = useState<NewTemplateGroupForm>(createInitialForm());
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        handleClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, submitting]);

  const handleChange = <K extends keyof NewTemplateGroupForm>(
    key: K,
    value: NewTemplateGroupForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleClose = () => {
    if (submitting) return;

    setForm(createInitialForm());
    setErrorMessage('');
    onClose();
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Vui lòng nhập Group Name.';
    if (!form.code.trim()) return 'Vui lòng nhập Code.';
    if (form.minTierLevel < 1) return 'Min Tier Level phải lớn hơn hoặc bằng 1.';
    if (form.sortOrder < 0) return 'Sort Order phải lớn hơn hoặc bằng 0.';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
      minTier: form.minTier,
      minTierLevel: Number(form.minTierLevel),
    };

    try {
      setSubmitting(true);
      setErrorMessage('');

      const response = await fetch('/api/platform/templates/template-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          result?.message ||
          result?.errors?.[0] ||
          'Tạo Template Group thất bại.';
        setErrorMessage(message);
        return;
      }

      setForm(createInitialForm());
      onCreated?.();
      onClose();
    } catch (error) {
      console.error('Create template group failed:', error);
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
        aria-labelledby="new-group-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="new-group-title" className={styles.title}>
              New Template Group
            </h2>
          </div>

          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
            type="button"
            disabled={submitting}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label className={styles.label}>Group Name</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ví dụ: Agency"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Code</label>
              <input
                className={styles.input}
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="agency"
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Mô tả ngắn về group template này..."
              rows={4}
              disabled={submitting}
            />
          </div>

          <div className={styles.gridThree}>
            <div className={styles.field}>
              <label className={styles.label}>Min Tier</label>
              <select
                className={styles.select}
                value={form.minTier}
                onChange={(e) => handleChange('minTier', e.target.value as AccessTier)}
                disabled={submitting}
              >
                {tierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Min Tier Level</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                value={form.minTierLevel}
                onChange={(e) => handleChange('minTierLevel', Number(e.target.value))}
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Sort Order</label>
              <input
                className={styles.input}
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', Number(e.target.value))}
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.switchRow}>
            <label className={styles.switchItem}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                disabled={submitting}
              />
              <span>Active group</span>
            </label>
          </div>

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
        </div>

        <div className={styles.footer}>
          <button
            className={styles.secondaryButton}
            onClick={handleClose}
            type="button"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleSubmit}
            type="button"
            disabled={submitting}
          >
            <i className="bi bi-plus-lg" />
            {submitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}