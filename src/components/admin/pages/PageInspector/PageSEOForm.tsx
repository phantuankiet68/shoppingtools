'use client';

import { useCallback, useMemo } from 'react';

import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { SEO } from '@/lib/pages/types';
import styles from '@/styles/admin/pages/PageInspector/PageSEOForm.module.css';

type Props = {
    seo: SEO;
    onChange: (seo: SEO) => void;
};

export default function PageSEOForm({ seo, onChange }: Props) {
    const { t } = useAdminI18n();

    const update = useCallback(
        <K extends keyof SEO>(key: K, value: SEO[K]) => {
            onChange({
                ...seo,
                [key]: value,
            });
        },
        [seo, onChange],
    );

    const metaTitleLength = seo.metaTitle?.length ?? 0;
    const metaDescriptionLength = seo.metaDescription?.length ?? 0;

    const titlePercent = Math.min((metaTitleLength / 70) * 100, 100);
    const descPercent = Math.min((metaDescriptionLength / 500) * 100, 100);

    const seoScore = useMemo(() => {
        let score = 0;

        if (seo.metaTitle) score += 25;
        if (seo.metaDescription) score += 25;
        if (seo.focusKeyword) score += 15;
        if (seo.canonicalUrl) score += 15;
        if (seo.robots) score += 10;
        if (seo.structuredData) score += 10;

        return score;
    }, [seo]);

    const handlePriorityChange = (value: string) => {
        const parsed = parseFloat(value);

        update('sitemapPriority', Number.isNaN(parsed) ? 0.5 : Math.max(0, Math.min(parsed, 1)));
    };

    return (
        <div className={styles.seoCard}>
            <section className={styles.scoreCard}>
                <div>
                    <h2 className={styles.scoreTitle}>{t('seo.healthScore')}</h2>

                    <p className={styles.scoreSubtitle}>{t('seo.healthScoreDescription')}</p>
                </div>

                <div className={styles.scoreBadge}>{seoScore}/100</div>
            </section>

            <section className={styles.previewCard}>
                <h3 className={styles.sectionTitle}>{t('seo.googlePreview')}</h3>

                <div className={styles.googlePreview}>
                    <div className={styles.googlePreviewHeader}>
                        <div className={styles.googleTitle}>
                            {seo.metaTitle || t('seo.pageTitlePlaceholder')}
                        </div>

                        <div className={styles.googleUrl}>
                            {seo.canonicalUrl || 'https://example.com/page'}
                        </div>
                    </div>

                    <div className={styles.googleDescription}>
                        {seo.metaDescription || t('seo.metaDescriptionPlaceholder')}
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('seo.metaInformation')}</h3>

                <div className={styles.field}>
                    <div className={styles.fieldHeader}>
                        <label htmlFor="seo-meta-title">{t('seo.metaTitle')}</label>

                        <span>{metaTitleLength}/70</span>
                    </div>

                    <input
                        id="seo-meta-title"
                        type="text"
                        maxLength={70}
                        className={styles.input}
                        value={seo.metaTitle ?? ''}
                        onChange={(e) => update('metaTitle', e.target.value)}
                    />

                    <div className={styles.progress}>
                        <div
                            className={styles.progressBar}
                            style={{
                                width: `${titlePercent}%`,
                            }}
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <div className={styles.fieldHeader}>
                        <label htmlFor="seo-meta-description">{t('seo.metaDescription')}</label>

                        <span>{metaDescriptionLength}/500</span>
                    </div>

                    <textarea
                        id="seo-meta-description"
                        rows={5}
                        maxLength={500}
                        className={styles.textarea}
                        value={seo.metaDescription ?? ''}
                        onChange={(e) => update('metaDescription', e.target.value)}
                    />

                    <div className={styles.progress}>
                        <div
                            className={styles.progressBar}
                            style={{
                                width: `${descPercent}%`,
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('seo.searchEngine')}</h3>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label htmlFor="seo-focus-keyword">{t('seo.focusKeyword')}</label>

                        <input
                            id="seo-focus-keyword"
                            type="text"
                            className={styles.input}
                            value={seo.focusKeyword ?? ''}
                            onChange={(e) => update('focusKeyword', e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="seo-canonical-url">{t('seo.canonicalUrl')}</label>

                        <input
                            id="seo-canonical-url"
                            type="url"
                            className={styles.input}
                            value={seo.canonicalUrl ?? ''}
                            onChange={(e) => update('canonicalUrl', e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="seo-robots">{t('seo.robots')}</label>

                        <select
                            id="seo-robots"
                            className={styles.select}
                            value={seo.robots ?? 'index,follow'}
                            onChange={(e) => update('robots', e.target.value)}
                        >
                            <option value="index,follow">index,follow</option>

                            <option value="noindex,follow">noindex,follow</option>

                            <option value="noindex,nofollow">noindex,nofollow</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="seo-og-type">{t('seo.ogType')}</label>

                        <select
                            id="seo-og-type"
                            className={styles.select}
                            value={seo.ogType ?? 'website'}
                            onChange={(e) => update('ogType', e.target.value)}
                        >
                            <option value="website">{t('seo.website')}</option>

                            <option value="article">{t('seo.article')}</option>

                            <option value="profile">{t('seo.profile')}</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('seo.sitemap')}</h3>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label htmlFor="seo-sitemap-changefreq">{t('seo.changefreq')}</label>

                        <select
                            id="seo-sitemap-changefreq"
                            className={styles.select}
                            value={seo.sitemapChangefreq}
                            onChange={(e) =>
                                update(
                                    'sitemapChangefreq',
                                    e.target.value as SEO['sitemapChangefreq'],
                                )
                            }
                        >
                            <option value="always">{t('seo.always')}</option>

                            <option value="hourly">{t('seo.hourly')}</option>

                            <option value="daily">{t('seo.daily')}</option>

                            <option value="weekly">{t('seo.weekly')}</option>

                            <option value="monthly">{t('seo.monthly')}</option>

                            <option value="yearly">{t('seo.yearly')}</option>

                            <option value="never">{t('seo.never')}</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="seo-sitemap-priority">{t('seo.priority')}</label>

                        <input
                            id="seo-sitemap-priority"
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            className={styles.input}
                            value={seo.sitemapPriority}
                            onChange={(e) => handlePriorityChange(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('seo.structuredData')}</h3>

                <textarea
                    rows={8}
                    className={styles.codeEditor}
                    value={seo.structuredData ?? ''}
                    onChange={(e) => update('structuredData', e.target.value)}
                    placeholder={`{
  "@context": "https://schema.org",
  "@type": "WebPage"
}`}
                />
            </section>
        </div>
    );
}
