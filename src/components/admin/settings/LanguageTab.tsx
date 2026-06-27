'use client';

import styles from '@/styles/admin/settings/language.module.css';
import { Languages } from 'lucide-react';
import type { SettingTabProps } from '@/features/settings/types';

export default function LanguageTab({ className }: SettingTabProps) {
    return (
        <div className={`${styles.wrapper} ${className ?? ''}`}>
            <div className={styles.header}>
                <div className={styles.icon}>
                    <Languages size={22} />
                </div>

                <div>
                    <h2 className={styles.title}>Language</h2>

                    <p className={styles.description}>
                        Choose the language used throughout the administration panel.
                    </p>
                </div>
            </div>

            <div className={styles.card}>
                <label className={styles.label} htmlFor="language">
                    Display Language
                </label>

                <select id="language" className={styles.select} defaultValue="en">
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="ja">🇯🇵 日本語</option>
                    <option value="ko">🇰🇷 한국어</option>
                    <option value="zh">🇨🇳 中文</option>
                </select>

                <p className={styles.helper}>
                    Changes will take effect after saving your settings.
                </p>

                <div className={styles.actions}>
                    <button type="button" className={styles.button}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
