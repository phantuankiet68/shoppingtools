'use client';

import styles from '@/styles/admin/pages/PageInspector/PageInspectorHeader.module.css';

type Props = {
    title: string;
    path: string;
    status: string;
    updatedText?: string;

    hasPage: boolean;

    savingSEO?: boolean;

    onPreview: () => void;
    onEdit: () => void;

    onPublish: () => void;
    onUnpublish: () => void;

    onDelete: () => void;

    onAutoSEO: () => void;
    onSaveSEO: () => void;

    t: (key: string) => string;
};

export default function PageInspectorHeader({
    title,
    path,
    status,
    updatedText,

    hasPage,

    savingSEO = false,

    onPreview,
    onEdit,

    onPublish,
    onUnpublish,

    onDelete,

    onAutoSEO,
    onSaveSEO,

    t,
}: Props) {
    const isPublished = status === 'PUBLISHED';

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>
                        {title || t('pages.pageInspector.untitledPage')}
                    </h1>

                    <span
                        className={`${styles.badge} ${
                            isPublished ? styles.badgePublished : styles.badgeDraft
                        }`}
                    >
                        {status}
                    </span>
                </div>

                <div className={styles.meta}>
                    <span>{path}</span>

                    {updatedText && (
                        <>
                            <span className={styles.separator}>•</span>

                            <span>
                                {t('pages.pageInspector.updated')} {updatedText}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.group}>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={onPreview}
                        disabled={!hasPage}
                    >
                        <i className="bi bi-eye" />
                        {t('pages.pageInspector.preview')}
                    </button>

                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={onEdit}
                        disabled={!hasPage}
                    >
                        <i className="bi bi-pencil" />
                        {t('pages.pageInspector.edit')}
                    </button>
                </div>

                <div className={styles.group}>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={onAutoSEO}
                        disabled={!hasPage}
                    >
                        <i className="bi bi-stars" />
                        {t('pages.pageInspector.autoSeo')}
                    </button>

                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={onSaveSEO}
                        disabled={!hasPage || savingSEO}
                    >
                        <i className="bi bi-save" />

                        {savingSEO
                            ? t('pages.pageInspector.saving')
                            : t('pages.pageInspector.saveSeo')}
                    </button>

                    {isPublished ? (
                        <button type="button" className={styles.warningBtn} onClick={onUnpublish}>
                            <i className="bi bi-eye-slash" />
                            {t('pages.pageInspector.unpublish')}
                        </button>
                    ) : (
                        <button type="button" className={styles.successBtn} onClick={onPublish}>
                            <i className="bi bi-upload" />
                            {t('pages.pageInspector.publish')}
                        </button>
                    )}

                    <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={onDelete}
                        disabled={!hasPage}
                    >
                        <i className="bi bi-trash" />
                        {t('pages.pageInspector.delete')}
                    </button>
                </div>
            </div>
        </header>
    );
}
