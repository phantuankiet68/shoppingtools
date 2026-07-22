'use client';

import { useState } from 'react';
import type { LocalizedText } from '@/lib/ui-builder/localization';
import styles from '@/styles/admin/shared/inspector.module.css';

type Props = {
    value?: LocalizedText;
    onChange: (value: LocalizedText) => void;
};

const LOCALES = [
    {
        value: 'en',
        label: 'English',
        flag: '🇺🇸',
    },
    {
        value: 'vi',
        label: 'Tiếng Việt',
        flag: '🇻🇳',
    },
    {
        value: 'ja',
        label: '日本語',
        flag: '🇯🇵',
    },
];

export default function LocalizedTextField({ value, onChange }: Props) {
    const [locale, setLocale] = useState(value?.sourceLocale ?? 'en');

    const localized: LocalizedText = value ?? {
        sourceLocale: 'en',
        default: '',
        translations: {},
    };

    const text =
        locale === localized.sourceLocale
            ? localized.default
            : (localized.translations?.[locale] ?? '');

    return (
        <div className={styles.wrapper}>
            <div className={styles.field}>
                <label className={styles.label}>Language</label>

                <select
                    className={styles.select}
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                >
                    {LOCALES.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.flag} {item.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Text</label>

                <input
                    className={styles.input}
                    placeholder="Enter text..."
                    value={text}
                    onChange={(e) => {
                        const next = e.target.value;

                        if (locale === localized.sourceLocale) {
                            onChange({
                                ...localized,
                                default: next,
                            });
                        } else {
                            onChange({
                                ...localized,
                                translations: {
                                    ...localized.translations,
                                    [locale]: next,
                                },
                            });
                        }
                    }}
                />
            </div>
        </div>
    );
}
