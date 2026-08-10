'use client';
import { useState } from 'react';
import UserProfile from '@/components/platform/users/user-profile';
import UserSidebar from '@/components/platform/users/user-sidebar';
import WorkspaceSection from '@/components/platform/users/workspace-section';
import ProjectSection from '@/components/platform/users/project-section';
import BillingStatus from '@/components/platform/users/billing-status';
import SiteSection from '@/components/platform/users/site-section';
import styles from '@/styles/platform/users/user-layout/user-layout.module.css';

export default function UserLayout() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    return (
        <main className={styles.page}>
            <aside className={styles.sidebar}>
                <UserSidebar selectedUserId={selectedUserId} onSelect={setSelectedUserId} />
            </aside>

            <section className={styles.content}>
                <div className={styles.body}>
                    <UserProfile userId={selectedUserId} />

                    <WorkspaceSection userId={selectedUserId} />

                    <ProjectSection userId={selectedUserId} />

                    <SiteSection userId={selectedUserId} />

                    <BillingStatus userId={selectedUserId} />
                </div>
            </section>
        </main>
    );
}
