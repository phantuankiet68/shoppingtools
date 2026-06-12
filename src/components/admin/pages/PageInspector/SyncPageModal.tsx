'use client';

import { API_ROUTES } from '@/constants/api';
import styles from '@/styles/admin/pages/PageInspector.module.css';

type Props = {
    open: boolean;

    syncing: boolean;

    siteId: string;
    siteName?: string;

    title: string;
    slug: string;
    path: string;

    t: (key: string) => string;

    onClose: () => void;

    onTitleChange: (value: string) => void;
    onSlugChange: (value: string) => void;
    onPathChange: (value: string) => void;

    onSubmit: () => void;
};

export default function SyncPageModal({
    open,

    syncing,

    siteId,
    siteName,

    title,
    slug,
    path,

    t,

    onClose,

    onTitleChange,
    onSlugChange,
    onPathChange,

    onSubmit,
}: Props) {
    if (!open) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.syncModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.syncHead}>
                    <h3 className={styles.syncTitle}>{t('pages.pageInspector.syncModalTitle')}</h3>

                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={onClose}
                        disabled={syncing}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.syncBody}>
                    <div className={styles.field}>
                        <label className={styles.label}>{t('pages.pageInspector.site')}</label>

                        <input disabled className={styles.input} value={siteName || siteId} />

                        <div className={styles.helper}>
                            {siteId
                                ? `Current Site: ${siteName || siteId}`
                                : t('pages.pageInspector.currentSiteNotFound')}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t('pages.pageInspector.title')}</label>

                        <input
                            className={styles.input}
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t('pages.pageInspector.slug')}</label>

                        <input
                            className={styles.input}
                            value={slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                        />

                        <div className={styles.helper}>{t('pages.pageInspector.slugHelper')}</div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t('pages.pageInspector.path')}</label>

                        <input
                            className={styles.input}
                            value={path}
                            onChange={(e) => onPathChange(e.target.value)}
                        />
                    </div>

                    <div className={styles.syncHint}>
                        <strong>API Preview</strong>

                        <pre className={styles.codeBlock}>
                            {`POST ${API_ROUTES.ADMIN_BUILDER_PAGE_SYNC}

{
  "siteId": "${siteId}",
  "items": [
    {
      "title": "${title}",
      "slug": "${slug}",
      "path": "${path}"
    }
  ]
}`}
                        </pre>
                    </div>
                </div>

                <div className={styles.syncFoot}>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={onClose}
                        disabled={syncing}
                    >
                        {t('common.cancel')}
                    </button>

                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={onSubmit}
                        disabled={syncing || !siteId}
                    >
                        {syncing
                            ? t('pages.pageInspector.syncing')
                            : t('pages.pageInspector.createAndSync')}
                    </button>
                </div>
            </div>
        </div>
    );
}
