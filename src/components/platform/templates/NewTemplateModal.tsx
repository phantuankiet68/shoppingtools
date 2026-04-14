'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/platform/templates/NewTemplateModal.module.css';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AccessTier = 'BASIC' | 'NORMAL' | 'PRO';

export type TemplateGroup = {
  id: string;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  minTier: AccessTier;
  minTierLevel: number;
  createdAt: string;
  updatedAt: string;
};

export type NewTemplateForm = {
  code: string;
  name: string;
  kind: string;
  groupId: string;
  status: TemplateStatus;
  previewImageUrl: string;
  initialProps: string;
  blocks: string;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  minTier: AccessTier;
  minTierLevel: number;
};

export type CreateTemplatePayload = {
  code: string;
  name: string;
  kind: string;
  groupId: string;
  status: TemplateStatus;
  previewImageUrl: string | null;
  initialProps: Record<string, unknown> | null;
  blocks: Record<string, unknown> | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  minTier: AccessTier;
  minTierLevel: number;
};

type NewTemplateModalProps = {
  open: boolean;
  groups: TemplateGroup[];
  onClose: () => void;
  onCreated?: () => void;
};

const statusOptions: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const tierOptions: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

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

function createInitialForm(groups: TemplateGroup[]): NewTemplateForm {
  return {
    code: '',
    name: '',
    kind: '',
    groupId: groups[0]?.id || '',
    status: 'PUBLISHED',
    previewImageUrl: '',
    initialProps: '',
    blocks: '',
    isActive: true,
    isPublic: true,
    sortOrder: 0,
    minTier: 'BASIC',
    minTierLevel: 1,
  };
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;

  const parsed = JSON.parse(value) as unknown;

  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('JSON must be an object');
  }

  return parsed as Record<string, unknown>;
}

export default function NewTemplateModal({
  open,
  groups,
  onClose,
  onCreated,
}: NewTemplateModalProps) {
  const [form, setForm] = useState<NewTemplateForm>(() => createInitialForm(groups));
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

    setForm((prev) => {
      const nextGroupId =
        prev.groupId && groups.some((group) => group.id === prev.groupId)
          ? prev.groupId
          : (groups[0]?.id || '');

      return {
        ...prev,
        groupId: nextGroupId,
      };
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, groups, submitting]);

  const handleChange = <K extends keyof NewTemplateForm>(
    key: K,
    value: NewTemplateForm[K]
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

    setForm(createInitialForm(groups));
    setErrorMessage('');
    onClose();
  };

  const validateForm = () => {
    if (!form.code.trim()) return 'Vui lòng nhập Code.';
    if (!form.name.trim()) return 'Vui lòng nhập Name.';
    if (!form.kind.trim()) return 'Vui lòng nhập Kind.';
    if (!form.groupId) return 'Vui lòng chọn Group.';
    if (form.sortOrder < 0) return 'Sort Order phải lớn hơn hoặc bằng 0.';
    if (form.minTierLevel < 1) return 'Min Tier Level phải lớn hơn hoặc bằng 1.';
    return '';
  };

  const buildPayload = (): CreateTemplatePayload => {
    return {
      code: toSlug(form.code),
      name: form.name.trim(),
      kind: form.kind.trim(),
      groupId: form.groupId,
      status: form.status,
      previewImageUrl: form.previewImageUrl.trim() || null,
      initialProps: parseJsonObject(form.initialProps),
      blocks: parseJsonObject(form.blocks),
      isActive: form.isActive,
      isPublic: form.isPublic,
      sortOrder: Number(form.sortOrder),
      minTier: form.minTier,
      minTierLevel: Number(form.minTierLevel),
    };
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    let payload: CreateTemplatePayload;

    try {
      payload = buildPayload();
    } catch (error) {
      console.error('Invalid JSON:', error);
      setErrorMessage('Initial Props và Blocks phải là JSON object hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const response = await fetch('/api/platform/templates', {
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
          'Tạo template thất bại.';
        setErrorMessage(message);
        return;
      }

      setForm(createInitialForm(groups));
      onCreated?.();
      onClose();
    } catch (error) {
      console.error('Create template failed:', error);
      setErrorMessage('Có lỗi xảy ra khi kết nối tới server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="New Template"
      >
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>New Template</h3>
          </div>

          <button
            className={styles.modalClose}
            onClick={handleClose}
            aria-label="Close modal"
            type="button"
            disabled={submitting}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Code</label>
              <input
                className={styles.input}
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="landing-saas-pro"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Landing SaaS Pro"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Kind</label>
              <input
                className={styles.input}
                value={form.kind}
                onChange={(e) => handleChange('kind', e.target.value)}
                placeholder="TopbarAnnouncement"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Group</label>
              <select
                className={styles.input}
                value={form.groupId}
                onChange={(e) => handleChange('groupId', e.target.value)}
                disabled={submitting}
              >
                <option value="" disabled>
                  Chọn group
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} - {group.minTier}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as TemplateStatus)}
                disabled={submitting}
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {getStatusLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Preview Image URL</label>
              <input
                className={styles.input}
                value={form.previewImageUrl}
                onChange={(e) => handleChange('previewImageUrl', e.target.value)}
                placeholder="https://example.com/preview.jpg"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Min Tier</label>
              <select
                className={styles.input}
                value={form.minTier}
                onChange={(e) => handleChange('minTier', e.target.value as AccessTier)}
                disabled={submitting}
              >
                {tierOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Min Tier Level</label>
              <input
                className={styles.input}
                type="number"
                value={form.minTierLevel}
                onChange={(e) => handleChange('minTierLevel', Number(e.target.value))}
                min={1}
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Sort Order</label>
              <input
                className={styles.input}
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', Number(e.target.value))}
                min={0}
                disabled={submitting}
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Initial Props (JSON object)</label>
              <textarea
                className={styles.textareaCode}
                value={form.initialProps}
                onChange={(e) => handleChange('initialProps', e.target.value)}
                placeholder={`{
                "theme": "light",
                "title": "Landing page"
              }`}
                disabled={submitting}
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Blocks (JSON object)</label>
              <textarea
                className={styles.textareaCode}
                value={form.blocks}
                onChange={(e) => handleChange('blocks', e.target.value)}
                placeholder={`{
                  "items": [
                    {
                      "id": "topbar_001",
                      "kind": "TopbarAnnouncement",
                      "props": {
                        "hotline": "0867105900"
                      }
                    }
                  ]
                }`}
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
              <span>Is Active</span>
            </label>

            <label className={styles.switchItem}>
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                disabled={submitting}
              />
              <span>Is Public</span>
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

        <div className={styles.modalFooter}>
          <button
            className={styles.modalGhostButton}
            onClick={handleClose}
            type="button"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            className={styles.modalPrimaryButton}
            onClick={handleSubmit}
            type="button"
            disabled={submitting}
          >
            <i className="bi bi-plus-lg" />
            {submitting ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
}