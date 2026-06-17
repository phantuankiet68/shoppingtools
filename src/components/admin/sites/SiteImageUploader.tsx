'use client';

import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from '@/styles/admin/sites/sites.module.css';
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';

type Props = {
    type: 'logo' | 'favicon';

    value?: string;

    disabled?: boolean;

    onUploaded: (file: File, preview: string) => void;
};

export default function SiteImageUploader({ type, value, disabled, onUploaded }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [preview, setPreview] = useState(value || '');

    const { t } = useAdminI18n();

    useEffect(() => {
        setPreview(value || '');
    }, [value]);

    const handleFile = (file: File) => {
        const previewUrl = URL.createObjectURL(file);

        setPreview(previewUrl);

        onUploaded(file, previewUrl);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        handleFile(file);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const file = event.dataTransfer.files?.[0];

        if (!file) {
            return;
        }

        handleFile(file);
    };

    return (
        <div className={styles.imageUploader}>
            <input ref={inputRef} type="file" hidden accept="image/*" onChange={handleChange} />

            {!preview ? (
                <div
                    className={styles.uploadBox}
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <i className="bi bi-cloud-arrow-up" />

                    <h4>
                        {t('sites.upload.upload')}{' '}
                        {type === 'logo' ? t('sites.form.logo') : t('sites.form.favicon')}
                    </h4>

                    <p>{t('sites.upload.dragAndDrop')}</p>
                </div>
            ) : (
                <div className={styles.previewCard}>
                    <div className={styles.previewThumb}>
                        <img src={preview} alt={type} className={styles.previewImage} />
                    </div>

                    <div className={styles.previewContent}>
                        <span className={styles.previewLabel}>
                            {type === 'logo' ? t('sites.form.logo') : t('sites.form.favicon')}
                        </span>

                        <span className={styles.previewFile}>{t('sites.upload.success')}</span>

                        <div className={styles.previewActions}>
                            <button
                                type="button"
                                className={styles.changeBtn}
                                onClick={() => inputRef.current?.click()}
                            >
                                <i className="bi bi-pencil-square" />

                                {t('sites.upload.change')}
                            </button>

                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => setPreview('')}
                            >
                                <i className="bi bi-trash3" />

                                {t('sites.upload.remove')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
