'use client';

import { useState } from 'react';
import styles from '@/styles/admin/settings/page.module.css';

import { tabs } from '@/features/settings/tabs';
import { TabKey } from '@/features/settings/type';

import BillingsTab from '@/components/admin/settings/tabs/BillingsTab';
import EmailTab from '@/components/admin/settings/tabs/EmailTab';
import PlaceholderTab from '@/components/admin/settings/PlaceholderTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('billings');

  const renderContent = () => {
    switch (activeTab) {
      case 'billings':
        return <BillingsTab />;
      case 'email':
        return <EmailTab />;
      case 'my-details':
        return <PlaceholderTab title="My details" />;
      case 'profile':
        return <PlaceholderTab title="Profile" />;
      case 'password':
        return <PlaceholderTab title="Password" />;
      case 'team':
        return <PlaceholderTab title="Team" />;
      case 'plan':
        return <PlaceholderTab title="Plan" />;
      case 'notifications':
        return <PlaceholderTab title="Notifications" />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.mobileTabSelect}>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabKey)}
        >
          {tabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
                >
                  <span className={styles.sidebarIcon}>
                    <i className={`bi ${tab.icon}`} />
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main>{renderContent()}</main>
      </div>
    </div>
  );
}