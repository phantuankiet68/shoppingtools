import UserHeader from '@/components/platform/users/user-header';
import UserProfile from '@/components/platform/users/user-profile';
import UserSidebar from '@/components/platform/users/user-sidebar';
import WorkspaceSection from '@/components/platform/users/workspace-section';
import BillingStatus from '@/components/platform/users/billing-status';
import SiteSection from '@/components/platform/users/site-section';
import RecentActivity from '@/components/platform/users/recent-activity';
import styles from '@/styles/platform/users/user-layout/user-layout.module.css';

export default function UserLayout() {
    return (
        <main className={styles.page}>
            <aside className={styles.sidebar}>
                <UserSidebar />
            </aside>

            <section className={styles.content}>
                <UserHeader />

                <div className={styles.body}>
                    <UserProfile />
                    <WorkspaceSection />
                    <SiteSection />
                    <BillingStatus />
                    <RecentActivity />
                </div>
            </section>
        </main>
    );
}
