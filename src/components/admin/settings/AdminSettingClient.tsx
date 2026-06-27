'use client';

import { useMemo, useState } from 'react';
import { Globe, Languages, LayoutDashboard, Lock, ShieldCheck } from 'lucide-react';

import Sidebar from '@/components/admin/settings/Sidebar';
import PasswordTab from '@/components/admin/settings/PasswordTab';
import DomainTab from '@/components/admin/settings/DomainTab';
import SecurityTab from '@/components/admin/settings/SecurityTab';
import LayoutTab from '@/components/admin/settings/LayoutTab';
import LanguageTab from '@/components/admin/settings/LanguageTab';

import type { SettingMenuItem, SettingTabKey } from '@/features/settings/types';

import styles from '@/styles/admin/settings/admin-setting.module.css';

export default function AdminSettingClient() {
    const [activeTab, setActiveTab] = useState<SettingTabKey>('domain');

    const menus = useMemo<SettingMenuItem[]>(
        () => [
            {
                key: 'domain',
                title: 'Domain',
                description: 'Configure custom domain',
                icon: Globe,
            },
            {
                key: 'password',
                title: 'Change Password',
                description: 'Update your account password',
                icon: Lock,
            },
            {
                key: 'security',
                title: 'Security',
                description: 'Security & authentication',
                icon: ShieldCheck,
            },
            {
                key: 'layout',
                title: 'Layout',
                description: 'Customize dashboard layout',
                icon: LayoutDashboard,
            },
            {
                key: 'language',
                title: 'Language',
                description: 'Select display language',
                icon: Languages,
            },
        ],
        [],
    );

    const content = useMemo(() => {
        switch (activeTab) {
            case 'domain':
                return <DomainTab />;
            case 'password':
                return <PasswordTab />;

            case 'security':
                return <SecurityTab />;

            case 'layout':
                return <LayoutTab />;

            case 'language':
                return <LanguageTab />;

            default:
                return <PasswordTab />;
        }
    }, [activeTab]);

    return (
        <div className={styles.wrapper}>
            <Sidebar items={menus} activeTab={activeTab} onChange={setActiveTab} />

            <main className={styles.content}>{content}</main>
        </div>
    );
}
