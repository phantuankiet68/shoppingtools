import AnalyticsCard from '@/components/admin/dashboard/AnalyticsCard';
import PagePricing from '@/components/admin/dashboard/PagePricing';
import TotalPage from '@/components/admin/dashboard/TotalPage';
import UserPlate from '@/components/admin/dashboard/UserPlate';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from '@/styles/admin/dashboard/DashboardA.module.css';
import Image from 'next/image';

export default function DashboardA() {
    const { user } = useAdminAuth();
    const { t } = useAdminI18n();
    const firstName = user?.name?.trim().split(' ')[0] || t('welcome.guest') || 'Guest';
    return (
        <div className={styles.dashboard}>
            {/* MAIN */}
            <section className={styles.mainGrid}>
                <div className={styles.leftGrid}>
                    <PagePricing />
                    <TotalPage />
                </div>
                <div className={styles.rightGrid}>
                    <div className={styles.headerTop}>
                        <div className={styles.card}>
                            <div className={styles.content}>
                                <span className={styles.badge}>{t('welcome.badge')}</span>

                                <h2 className={styles.title}>
                                    {t('welcome.titleStart')} <span>80%</span>{' '}
                                    {t('welcome.titleEnd')}
                                </h2>

                                <p className={styles.description}>{t('welcome.description')}</p>
                            </div>
                            <div className={styles.imageWrap}>
                                <Image
                                    src="/assets/images/welcome-illustration.png"
                                    alt="Welcome"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 260px"
                                    className={styles.image}
                                    priority
                                />
                            </div>

                            <div className={styles.blurOne}></div>
                            <div className={styles.blurTwo}></div>
                        </div>
                        <UserPlate />
                        <AnalyticsCard />
                    </div>
                </div>
            </section>
        </div>
    );
}
