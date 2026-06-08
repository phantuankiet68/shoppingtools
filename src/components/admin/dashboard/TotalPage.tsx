'use client';

import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useDashboardStats } from '@/store/dashboard/useDashboardStats';
import styles from '@/styles/admin/dashboard/TotalPage.module.css';

const calcPercent = (value: number, max?: number | null) => {
    if (!max || max === 0) return 100;
    return Math.min(Math.round((value / max) * 100), 100);
};

const getColor = (percent: number) => {
    if (percent >= 90) return 'rgb(253 217 162) 100%';
    if (percent >= 70) return '#e79b44ff';
    return '#22c55e';
};

export default function TotalPage() {
    const { user, currentSite, currentWorkspace } = useAdminAuth();
    const { t } = useAdminI18n();

    const userId = user?.id ?? '';
    const siteId = currentSite?.id ?? '';

    const { data, loading } = useDashboardStats(userId, siteId);

    const limits = currentWorkspace?.accessPolicy;

    if (loading) {
        return <div className={styles.loading}>{t('dashboard.loading')}</div>;
    }

    const stats = [
        {
            title: t('dashboard.sitesUsed'),
            value: data.totalSites,
            icon: 'bi-globe',
            percent: calcPercent(data.totalSites, limits?.maxSites),
            limit: limits?.maxSites ?? null,
        },
        {
            title: t('dashboard.pagesUsed'),
            value: data.totalPages,
            icon: 'bi-file-earmark-text',
            percent: calcPercent(data.totalPages, limits?.maxPages),
            limit: limits?.maxPages ?? null,
        },
        {
            title: t('dashboard.menusUsed'),
            value: data.totalMenus,
            icon: 'bi-list',
            percent: calcPercent(data.totalMenus, limits?.maxMenus),
            limit: limits?.maxMenus ?? null,
        },
        {
            title: t('dashboard.categoriesUsed'),
            value: data.totalCategories,
            icon: 'bi-folder',
            percent: calcPercent(data.totalCategories, limits?.maxCategories),
            limit: limits?.maxCategories ?? null,
        },
        {
            title: t('dashboard.brandsUsed'),
            value: data.totalBrands,
            icon: 'bi-bookmark',
            percent: calcPercent(data.totalBrands, limits?.maxBrands),
            limit: limits?.maxBrands ?? null,
        },
        {
            title: t('dashboard.productsCreated'),
            value: data.totalProducts,
            icon: 'bi-box-seam',
            percent: calcPercent(data.totalProducts, limits?.maxProducts),
            limit: limits?.maxProducts ?? null,
        },
        {
            title: t('dashboard.usersMember'),
            value: data.totalUsers,
            icon: 'bi-people',
            percent: calcPercent(data.totalUsers, limits?.maxUsers),
            limit: limits?.maxUsers ?? null,
        },
        {
            title: t('dashboard.templatesUsed'),
            value: 10,
            icon: 'bi-layout-text-window',
            percent: calcPercent(data.totalPages, limits?.maxPages),
            limit: limits?.maxPages ?? null,
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {stats.map((item, index) => {
                    const color = getColor(item.percent);

                    return (
                        <div key={index} className={styles.card}>
                            <div className={styles.left}>
                                <i className={`bi ${item.icon}`}></i>
                                <span>{item.title}</span>
                            </div>

                            <div className={styles.rightBox}>
                                <div
                                    className={styles.circle}
                                    style={{
                                        background: `conic-gradient(${color} ${item.percent}%, #e5e7eb 0%)`,
                                    }}
                                >
                                    <div className={styles.inner}>{item.percent}%</div>
                                </div>

                                <div className={styles.right}>
                                    <span className={styles.value}>
                                        {item.value}
                                        {item.limit !== null && (
                                            <span className={styles.limit}> / {item.limit}</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
