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

import { getPageTemplate } from '@/utils/pages/pageHelpers';

type Props = {
    active?: SiteLike | null;

    busy: boolean;

    mode: SiteFormMode;

    onSave: (payload: SiteFormState) => Promise<void>;

    onCreate: (payload: SiteFormState) => Promise<void>;
};

const SiteForm = memo(({ active, busy, mode, onSave, onCreate }: Props) => {
    const { t, tf } = useAdminI18n();

    const { form, errors, updateField, resetForm, submit } = useSiteForm({
        active,
        mode,
        t,
        onCreate,
        onSave,
    });

    const categoryOptions = WEBSITE_CATEGORIES[form.type] || [];

    const menuPreview = MENU_TEMPLATES[form.type]?.[form.category] ?? [];

    const pagePreview = getPageTemplate(form.type, form.category);

    return (
        <div className={styles.form}>
            <div className={styles.formRow}>
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
                            <option value="landing">{t('sites.type.landing')}</option>

                            <option value="blog">{t('sites.type.blog')}</option>

                            <option value="ecommerce">{t('sites.type.ecommerce')}</option>

                            <option value="booking">{t('sites.type.booking')}</option>

                            <option value="lms">{t('sites.type.lms')}</option>
                        </select>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('sites.form.category')}</label>

                    <div className={styles.selectWrap}>
                        <i className="bi bi-tags" />

                        <select
                            className={styles.select}
                            value={form.category}
                            onChange={(e) => updateField('category', e.target.value)}
                        >
                            <option value="">{t('sites.form.selectCategory')}</option>

                            {categoryOptions.map((item) => (
                                <option key={item} value={item}>
                                    {t(`sites.category.${item}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('sites.form.contactEmail')}</label>

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
                        <label className={styles.label}>{t('sites.form.contactPhone')}</label>

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
                                    <option value="DRAFT">{t('sites.status.draft')}</option>

                                    <option value="ACTIVE">{t('sites.status.active')}</option>

                                    <option value="SUSPENDED">{t('sites.status.suspended')}</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('sites.form.publishedAt')}</label>

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
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('sites.form.seoTitle')}</label>

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
                    <label className={styles.label}>{t('sites.form.seoDescription')}</label>

                    <div className={styles.textareaWrap}>
                        <i className="bi bi-text-paragraph" />

                        <textarea
                            className={styles.textarea}
                            value={form.seoDescription}
                            disabled={busy}
                            rows={6}
                            onChange={(e) => updateField('seoDescription', e.target.value)}
                        />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('sites.form.logo')}</label>
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
                    <label className={styles.label}>{t('sites.form.favicon')}</label>

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
                {mode === 'edit' && active && (
                    <div className={styles.metaGrid}>
                        <div className={styles.metaBox}>
                            <span>{t('sites.form.created')}</span>
                            <strong>{formatDate(active.createdAt)}</strong>
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.formRow}>
                <div className={styles.formGrid}>
                    {/* Default Pages */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('sites.form.defaultPages')}</label>

                        <div className={styles.pagePreview}>
                            {pagePreview.map((page) => (
                                <div key={page.path} className={styles.menuPreviewItem}>
                                    <i className="bi bi-file-earmark-text" />

                                    <div className={styles.menuPreviewItemContent}>
                                        <span>{page.title}</span>

                                        <small>{page.path}</small>
                                    </div>
                                </div>
                            ))}
                            {menuPreview.map((menu) => (
                                <div key={menu.path} className={styles.menuPreviewItem}>
                                    <i className={`bi ${menu.icon}`} />

                                    <span>{t(menu.title)}</span>

                                    <small>{t(menu.path)}</small>
                                </div>
                            ))}
                        </div>
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

                        {mode === 'create'
                            ? t('sites.form.createSite')
                            : t('sites.form.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
});

SiteForm.displayName = 'SiteForm';

export default SiteForm;
