'use client';

import styles from '@/styles/admin/settings/layout.module.css';
import { LayoutDashboard } from 'lucide-react';
import type { SettingTabProps } from '@/features/settings/types';

export default function LayoutTab({ className }: SettingTabProps) {
    return (
        <div className={`${styles.wrapper} ${className ?? ''}`}>
            <div className={styles.header}>
                <div className={styles.icon}>
                    <LayoutDashboard size={22} />
                </div>

                <div>
                    <h2 className={styles.title}>Layout Settings</h2>

                    <p className={styles.description}>
                        Customize the appearance of the administration interface.
                    </p>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.group}>
                    <label className={styles.label}>Sidebar Position</label>

                    <div className={styles.options}>
                        <label className={styles.option}>
                            <input type="radio" name="sidebar" value="left" defaultChecked />
                            <span>Left</span>
                        </label>

                        <label className={styles.option}>
                            <input type="radio" name="sidebar" value="right" />
                            <span>Right</span>
                        </label>
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Header Style</label>

                    <div className={styles.options}>
                        <label className={styles.option}>
                            <input type="radio" name="header" value="fixed" defaultChecked />
                            <span>Fixed</span>
                        </label>

                        <label className={styles.option}>
                            <input type="radio" name="header" value="static" />
                            <span>Static</span>
                        </label>
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Container Width</label>

                    <div className={styles.options}>
                        <label className={styles.option}>
                            <input type="radio" name="container" value="wide" defaultChecked />
                            <span>Wide</span>
                        </label>

                        <label className={styles.option}>
                            <input type="radio" name="container" value="boxed" />
                            <span>Boxed</span>
                        </label>
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Theme</label>

                    <select className={styles.select} defaultValue="light">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                    </select>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.button}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
