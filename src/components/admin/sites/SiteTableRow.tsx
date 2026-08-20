'use client';

import styles from '@/styles/admin/sites/sites.module.css';
import { SiteLike } from '@/features/sites/types';

type Props = {
    site: SiteLike;
    activeId: string | null;
    t: (key: string) => string;
    setActiveId: (id: string) => void;
    setMode: (mode: 'create' | 'edit') => void;
    onDelete: (site: SiteLike) => void;
    onPayment: (site: SiteLike) => void;
    onPaymentHistory: (site: SiteLike) => void;
};

const formatBytes = (value: string | number | bigint | undefined, maxBytes: number) => {
    const bytes = Number(value ?? 0);

    if (!bytes) {
        return '0 B';
    }

    return `${(bytes / 1073741824).toFixed(1)} GB / ${maxBytes} GB`;
};

const formatDate = (value: string | Date | null | undefined) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
};

const formatTime = (value: string | Date | null | undefined) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const getStatusClass = (status: SiteLike['status'], styles: Record<string, string>) => {
    switch (status) {
        case 'PUBLISHED':
            return styles.publishedBadge;

        case 'SUSPENDED':
            return styles.suspendedBadge;

        case 'ARCHIVED':
            return styles.archivedBadge;

        default:
            return styles.draftBadge;
    }
};

const getStatusLabel = (status: SiteLike['status'], t: (key: string) => string) => {
    switch (status) {
        case 'PUBLISHED':
            return t('sites.status.published');

        case 'SUSPENDED':
            return t('sites.status.suspended');

        case 'ARCHIVED':
            return t('sites.status.archived');

        default:
            return t('sites.status.draft');
    }
};

const getWebsiteIcon = (type: SiteLike['type']) => {
    switch (type) {
        case 'ecommerce':
            return 'bi-cart3';

        case 'booking':
            return 'bi-calendar3';

        case 'lms':
            return 'bi-mortarboard';

        case 'blog':
            return 'bi-file-text';

        case 'landing':
        default:
            return 'bi-rocket';
    }
};

export default function SiteTableRow({
    site,
    activeId,
    t,
    setActiveId,
    setMode,
    onDelete,
    onPayment,
    onPaymentHistory,
}: Props) {
    const isActive = site.id === activeId;

    const storagePercent = Math.min(100, (Number(site.storageUsedBytes ?? 0) / 10737418240) * 100);

    const sslActive = site.sslStatus === 'ACTIVE';

    const domainVerified = site.domainVerificationStatus === 'VERIFIED';

    const deploymentSuccess = site.deploymentStatus === 'SUCCESS';

    /*
     * Payment history
     *
     * Chỉ cần PaymentSite tồn tại là site đã từng
     * tạo một giao dịch thanh toán.
     *
     * Không dùng:
     * latestPayment.status === 'SUCCESS'
     *
     * vì PENDING / FAILED / CANCELED cũng là
     * lịch sử payment hợp lệ.
     */
    const paymentSites = site.paymentSites ?? [];

    const hasPaymentHistory = paymentSites.length > 0;

    return (
        <div
            className={`${styles.tableRow} ${isActive ? styles.tableRowActive : ''}`}
            onClick={() => {
                setMode('edit');
                setActiveId(site.id);
            }}
        >
            {/* Site */}
            <div className={styles.siteCell}>
                <div className={styles.siteAvatar}>
                    {site.logoUrl ? (
                        <img src={site.logoUrl} alt="" />
                    ) : (
                        <i className="bi bi-globe2" />
                    )}

                    <span
                        className={`${styles.siteOnlineDot} ${
                            site.isPublic ? styles.siteOnline : ''
                        }`}
                    />
                </div>

                <div className={styles.siteInfo}>
                    <div className={styles.siteName}>{site.name}</div>

                    <div className={styles.siteDomain}>
                        {site.domain}

                        <i className="bi bi-box-arrow-up-right" />
                    </div>
                </div>
            </div>

            {/* Type */}
            <div className={styles.typeCell}>
                <span className={`${styles.typeBadge} ${styles[`type_${site.type}`]}`}>
                    <i className={`bi ${getWebsiteIcon(site.type)}`} />

                    {t(`sites.types.${site.type}`)}
                </span>
            </div>

            {/* Status */}
            <div className={styles.statusCell}>
                <span className={`${styles.statusBadge} ${getStatusClass(site.status, styles)}`}>
                    <span className={styles.statusDot} />

                    {getStatusLabel(site.status, t)}
                </span>

                <span className={styles.visibility}>
                    <i className={`bi ${site.isPublic ? 'bi-unlock' : 'bi-lock'}`} />

                    {site.isPublic ? t('sites.status.public') : t('sites.status.private')}
                </span>
            </div>

            {/* Domain / SSL */}
            <div className={styles.domainSslCell}>
                <div
                    className={`${styles.healthLine} ${
                        domainVerified ? styles.healthSuccess : styles.healthWarning
                    }`}
                >
                    <i className={`bi ${domainVerified ? 'bi-check-circle' : 'bi-clock'}`} />

                    {domainVerified ? t('sites.domain.verified') : t('sites.domain.pending')}
                </div>

                <div className={`${styles.metaLine} ${sslActive ? styles.sslActive : ''}`}>
                    <i className="bi bi-lock" />

                    {sslActive ? t('sites.ssl.active') : t('sites.ssl.pending')}
                </div>

                {site.sslExpiresAt && (
                    <div className={styles.metaLine}>
                        <i className="bi bi-calendar3" />

                        {formatDate(site.sslExpiresAt)}
                    </div>
                )}
            </div>

            {/* Deployment */}
            <div className={styles.deploymentCell}>
                <div
                    className={`${styles.healthLine} ${
                        deploymentSuccess
                            ? styles.healthSuccess
                            : site.deploymentStatus === 'FAILED'
                              ? styles.healthError
                              : styles.healthWarning
                    }`}
                >
                    <i
                        className={`bi ${
                            deploymentSuccess
                                ? 'bi-check-circle'
                                : site.deploymentStatus === 'FAILED'
                                  ? 'bi-x-circle'
                                  : 'bi-clock'
                        }`}
                    />

                    {t(`sites.deployment.${site.deploymentStatus.toLowerCase()}`)}
                </div>

                <div className={styles.metaLine}>
                    <i className="bi bi-cloud-arrow-up" />

                    {site.deployedAt
                        ? formatDate(site.deployedAt)
                        : t('sites.deployment.notDeployed')}
                </div>
            </div>

            {/* Usage */}
            <div className={styles.usageCell}>
                <div className={styles.usageCircle}>
                    <svg viewBox="0 0 44 44">
                        <circle className={styles.usageTrack} cx="22" cy="22" r="18" />

                        <circle
                            className={styles.usageProgress}
                            cx="22"
                            cy="22"
                            r="18"
                            style={{
                                strokeDashoffset: 113 - (113 * storagePercent) / 100,
                            }}
                        />
                    </svg>

                    <span>{Math.round(storagePercent)}%</span>
                </div>

                <div className={styles.usageInfo}>
                    <strong>{formatBytes(site.storageUsedBytes, 10)}</strong>

                    <span>{formatBytes(site.bandwidthUsedBytes, 100)}</span>
                </div>
            </div>

            {/* Visits */}
            <div className={styles.visitsCell}>
                <div className={styles.visitChart}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                <strong>{Number(site.totalVisits ?? 0).toLocaleString()}</strong>
            </div>

            {/* Updated */}
            <div className={styles.updatedCell}>
                <strong>{formatDate(site.updatedAt)}</strong>

                <span>{formatTime(site.updatedAt)}</span>
            </div>

            {/* Actions */}
            <div className={styles.actionCell} onClick={(event) => event.stopPropagation()}>
                {!hasPaymentHistory ? (
                    /*
                     * No payment history
                     * → Create first payment
                     */
                    <button
                        type="button"
                        className={styles.paymentBtn}
                        onClick={() => onPayment(site)}
                        aria-label={t('sites.table.payment')}
                    >
                        <i className="bi bi-credit-card-2-front" />

                        <span>{t('sites.table.payment')}</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onPaymentHistory(site)}
                        aria-label={t('sites.table.renew')}
                        title={t('sites.table.renew')}
                    >
                        <i className="bi bi-arrow-repeat" />
                    </button>
                )}
                <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onDelete(site)}
                    aria-label={t('sites.table.delete')}
                    title={t('sites.table.delete')}
                >
                    <i className="bi bi-trash3" />
                </button>
            </div>
        </div>
    );
}
