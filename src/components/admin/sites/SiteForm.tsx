'use client';

import { memo } from 'react';

import styles from '@/styles/admin/sites/sites.module.css';

import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import SiteImageUploader from '@/components/admin/sites/SiteImageUploader';
import { MENU_TEMPLATES } from '@/constants/menus/menuConstants';
import { WEBSITE_CATEGORIES } from '@/constants/sites/siteConstants';
import { SiteFormMode, SiteFormState, SiteLike } from '@/features/sites/types';
import { useSiteForm } from '@/hooks/sites/useSiteForm';
import { formatDate } from '@/utils/sites/siteHelpers';

type Props = {
    active?: SiteLike | null;

    busy: boolean;

    mode: SiteFormMode;

    onSave: (payload: SiteFormState) => Promise<void>;

    onCreate: (payload: SiteFormState) => Promise<void>;
};

const SiteForm = memo(({ active, busy, mode, onSave, onCreate }: Props) => {
    const { t } = useAdminI18n();

    const { form, errors, updateField, resetForm, submit } = useSiteForm({
        active,
        mode,
        t,
        onCreate,
        onSave,
    });

    const categoryOptions = WEBSITE_CATEGORIES[form.type] || [];

    const menuPreview = MENU_TEMPLATES[form.type]?.[form.category] ?? [];

    return (
        <div className={styles.form}>
            {/* Site Name */}

            <div className={styles.formGroup}>
                <label htmlFor="site-name" className={styles.label}>
                    {t('sites.form.siteName')}
                </label>

                <div className={styles.inputWrap}>
                    <i className="bi bi-globe2" />

                    <input
                        id="site-name"
                        className={styles.input}
                        value={form.name}
                        disabled={busy}
                        placeholder={t('sites.form.siteName')}
                        onChange={(e) => updateField('name', e.target.value)}
                    />
                </div>

                {errors.name && <div className={styles.errorText}>{errors.name}</div>}
            </div>

            {/* Domain */}

            <div className={styles.formGroup}>
                <label htmlFor="site-domain" className={styles.label}>
                    {t('sites.form.domain')}
                </label>

                <div className={styles.inputWrap}>
                    <i className="bi bi-link-45deg" />

                    <input
                        id="site-domain"
                        className={styles.input}
                        value={form.domain}
                        disabled={busy}
                        placeholder="example.com"
                        onChange={(e) => updateField('domain', e.target.value)}
                    />
                </div>

                {errors.domain && <div className={styles.errorText}>{errors.domain}</div>}
            </div>

            {/* Website Type */}

            <div className={styles.formGroup}>
                <label className={styles.label}>{t('sites.form.websiteType')}</label>

                <div className={styles.selectWrap}>
                    <i className="bi bi-window-stack" />

                    <select
                        className={styles.select}
                        value={form.type}
                        disabled={busy}
                        onChange={(e) => updateField('type', e.target.value as any)}
                    >
                        <option value="landing">Landing</option>
                        <option value="blog">Blog</option>
                        <option value="ecommerce">Ecommerce</option>
                        <option value="booking">Booking</option>
                        <option value="lms">LMS</option>
                    </select>
                </div>
            </div>

            {/* Category */}

            <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>

                <div className={styles.selectWrap}>
                    <i className="bi bi-tags" />

                    <select
                        className={styles.select}
                        value={form.category}
                        onChange={(e) => updateField('category', e.target.value)}
                    >
                        <option value="">Select Category</option>

                        {categoryOptions.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Logo</label>
                <SiteImageUploader
                    type="logo"
                    value={form.logoUrl}
                    disabled={busy}
                    onUploaded={(file, preview) => {
                        updateField('logoFile', file);
                        updateField('logoUrl', preview);
                    }}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Favicon</label>

                <SiteImageUploader
                    type="favicon"
                    value={form.faviconUrl}
                    disabled={busy}
                    onUploaded={(file, preview) => {
                        updateField('faviconFile', file);
                        updateField('faviconUrl', preview);
                    }}
                />
            </div>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Contact Email</label>

                    <div className={styles.inputWrap}>
                        <i className="bi bi-envelope" />

                        <input
                            className={styles.input}
                            value={form.contactEmail}
                            disabled={busy}
                            placeholder="admin@example.com"
                            onChange={(e) => updateField('contactEmail', e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Contact Phone</label>

                    <div className={styles.inputWrap}>
                        <i className="bi bi-telephone" />

                        <input
                            className={styles.input}
                            value={form.contactPhone}
                            disabled={busy}
                            placeholder="+84..."
                            onChange={(e) => updateField('contactPhone', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>SEO Title</label>

                <div className={styles.inputWrap}>
                    <i className="bi bi-card-heading" />

                    <input
                        className={styles.input}
                        value={form.seoTitle}
                        disabled={busy}
                        onChange={(e) => updateField('seoTitle', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>SEO Description</label>

                <div className={styles.textareaWrap}>
                    <i className="bi bi-text-paragraph" />

                    <textarea
                        className={styles.textarea}
                        value={form.seoDescription}
                        disabled={busy}
                        rows={4}
                        onChange={(e) => updateField('seoDescription', e.target.value)}
                    />
                </div>
            </div>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('sites.form.status')}</label>

                    <div className={styles.selectWrap}>
                        <i className="bi bi-bookmark-star-fill" />

                        <select
                            className={styles.select}
                            value={form.status}
                            disabled={busy}
                            onChange={(e) => updateField('status', e.target.value as any)}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Published At</label>

                    <div className={styles.inputWrap}>
                        <i className="bi bi-calendar-event" />

                        <input
                            type="datetime-local"
                            className={styles.input}
                            value={form.publishedAt}
                            disabled={busy}
                            onChange={(e) => updateField('publishedAt', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.switchWrap}>
                <input
                    id="is-public"
                    type="checkbox"
                    checked={form.isPublic}
                    disabled={busy}
                    onChange={(e) => updateField('isPublic', e.target.checked)}
                />

                <label htmlFor="is-public">{t('sites.form.publicSite')}</label>
            </div>
            {mode === 'edit' && active && (
                <div className={styles.metaGrid}>
                    <div className={styles.metaBox}>
                        <span>{t('sites.form.created')}</span>

                        <strong>{formatDate(active.createdAt)}</strong>
                    </div>

                    <div className={styles.metaBox}>
                        <span>{t('sites.form.updated')}</span>

                        <strong>{formatDate(active.updatedAt)}</strong>
                    </div>
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Default Menus</label>

                <div className={styles.menuPreview}>
                    {menuPreview.map((menu) => (
                        <div key={menu.path} className={styles.menuPreviewItem}>
                            <i className={`bi ${menu.icon}`} />

                            <span>{menu.title}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.formActions}>
                <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={busy}
                    onClick={resetForm}
                >
                    <i className="bi bi-arrow-counterclockwise" />
                    {t('sites.form.reset')}
                </button>

                <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={busy}
                    onClick={submit}
                >
                    <i className={`bi ${mode === 'create' ? 'bi-plus-circle' : 'bi-floppy'}`} />

                    {mode === 'create' ? t('sites.form.createSite') : t('sites.form.saveChanges')}
                </button>
            </div>
        </div>
    );
});

SiteForm.displayName = 'SiteForm';

export default SiteForm;
