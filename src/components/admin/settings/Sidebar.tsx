'use client';

import styles from '@/styles/admin/settings/sidebar.module.css';
import type { SettingMenuItem, SettingTabKey } from '@/features/settings/types';

type SidebarProps = {
    items: SettingMenuItem[];
    activeTab: SettingTabKey;
    onChange: (tab: SettingTabKey) => void;
};

export default function Sidebar({ items, activeTab, onChange }: SidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.headerTopbar}>
                        <div className={styles.headerIcon}>
                            <i className="bi bi-sliders2"></i>
                        </div>

                        <div className={styles.headerContent}>
                            <span className={styles.badge}>Administration</span>

                            <h2 className={styles.title}>Settings</h2>
                        </div>
                    </div>
                    <p className={styles.description}>
                        Configure your account, security, domain, appearance and language
                        preferences for your workspace.
                    </p>
                </div>

                <nav className={styles.menu}>
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                disabled={item.disabled}
                                onClick={() => onChange(item.key)}
                                className={`${styles.item} ${
                                    activeTab === item.key ? styles.active : ''
                                }`}
                            >
                                <span className={styles.icon}>
                                    <Icon size={18} />
                                </span>

                                <span className={styles.content}>
                                    <span className={styles.label}>{item.title}</span>

                                    {item.description && (
                                        <span className={styles.subtitle}>{item.description}</span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
