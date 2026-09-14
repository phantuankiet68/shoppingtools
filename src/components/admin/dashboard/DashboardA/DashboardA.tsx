'use client';

import Image from 'next/image';

import AnalyticsCard from '@/components/admin/dashboard/Analytics/AnalyticsCard';
import TotalPage from '@/components/admin/dashboard/TotalPage/TotalPage';
import UserPlate from '@/components/admin/dashboard/UserPlate/UserPlate';
import RecentUsers from '@/components/admin/dashboard/RecentUsers/RecentUsers';
import StorageBreakdown from '@/components/admin/dashboard/StorageBreakdown/StorageBreakdown';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';

import styles from './DashboardA.module.css';

export default function DashboardA() {
    const { user } = useAdminAuth();
    const { t } = useAdminI18n();

    const firstName = user?.name?.trim().split(' ')[0] || t('welcome.guest') || 'Guest';

    return (
        <main className={styles.dashboard}>
            <div className={styles.container}>
                <div className={styles.containerTop}>
                    {/* =========================================
                    HERO
                ========================================= */}
                    <section className={styles.hero}>
                        <div className={styles.heroBackground}>
                            <div className={styles.heroGlowBlue} />
                            <div className={styles.heroGlowPurple} />
                            <div className={styles.heroGlowGreen} />
                            <div className={styles.heroGrid} />
                        </div>

                        <div className={styles.heroContent}>
                            <div className={styles.heroEyebrow}>
                                <span className={styles.statusDot} />
                                <span>WORKSPACE OVERVIEW</span>
                                <i className="bi bi-arrow-up-right" />
                            </div>

                            <h1 className={styles.heroTitle}>
                                {t('welcome.titleStart')}
                                <span>{firstName}</span>
                            </h1>

                            <p className={styles.heroDescription}>{t('welcome.description')}</p>

                            <div className={styles.heroActions}>
                                <button type="button" className={styles.primaryAction}>
                                    <span className={styles.actionIcon}>
                                        <i className="bi bi-plus-lg" />
                                    </span>

                                    <span>Create website</span>

                                    <i className={`bi bi-arrow-up-right ${styles.actionArrow}`} />
                                </button>

                                <button type="button" className={styles.secondaryAction}>
                                    <span className={styles.secondaryIcon}>
                                        <i className="bi bi-grid-1x2" />
                                    </span>

                                    <span>View workspace</span>
                                </button>
                            </div>
                        </div>

                        {/* =========================================
                        HERO IMAGE
                    ========================================= */}
                        <div className={styles.heroVisual}>
                            <div className={styles.imageGlow} />

                            <div className={styles.imageFrame}>
                                <img
                                    src="/assets/images/admin-dashboard-hero.png"
                                    alt="KBuilder workspace dashboard"
                                    className={styles.heroImage}
                                />
                            </div>

                            <div className={styles.imageDecoration}>
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    </section>

                    {/* =========================================
                    STATISTICS
                ========================================= */}
                    <section className={styles.statsSection}>
                        <div className={styles.statsCard}>
                            <TotalPage />
                        </div>
                    </section>
                </div>

                {/* =========================================
                    MAIN ANALYTICS
                ========================================= */}
                <section className={styles.analyticsGrid}>
                    <div className={styles.analyticsLarge}>
                        <AnalyticsCard />
                    </div>

                    <div className={styles.quickCard}>
                        <UserPlate />
                    </div>
                </section>
                <div className={styles.bottomGrid}>
                    <RecentUsers />
                    <StorageBreakdown />
                </div>
            </div>
        </main>
    );
}
