'use client';

import type { SiteItem } from '@/features/platform/types/sites/site';
import type { SiteAction } from '@/features/platform/types/sites/site-action';
import styles from '@/styles/platform/sites/site-card.module.css';

interface SiteCardProps {
    site: SiteItem;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    onAction: (action: SiteAction, site: SiteItem) => Promise<void>;
}

export default function SiteCard({ site, checked, onCheckedChange, onAction }: SiteCardProps) {
    const storageLimit = site.subscription?.plan.maxStorageBytes ?? 0;

    const storagePercent =
        storageLimit > 0 ? Math.min((site.storageUsedBytes / storageLimit) * 100, 100) : 0;

    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <div className={styles.site}>
                    <div className={styles.logo}>N</div>

                    <div>
                        <h3>{site.name}</h3>

                        <a
                            href={`https://${site.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {site.domain}
                        </a>
                    </div>
                </div>

                <span
                    className={`${styles.status} ${
                        styles[site.sslStatus.toLowerCase()] ?? styles.online
                    }`}
                >
                    <span className={styles.dot} />
                    {site.sslStatus}
                </span>
            </div>

            <div className={styles.tags}>
                <span>
                    <i className="bi bi-globe" />
                    {site.type}
                </span>

                <span>
                    <i className="bi bi-collection" />
                    {site.category ?? 'General'}
                </span>

                <span>
                    <i className="bi bi-credit-card" />
                    {site.subscription?.plan.name ?? 'Free'}
                </span>
            </div>

            <div className={styles.storage}>
                <div className={styles.storageHeader}>
                    <span>Storage</span>

                    <strong>
                        {(site.storageUsedBytes / 1024 / 1024 / 1024).toFixed(2)}
                        {' / '}
                        {storageLimit > 0 ? (storageLimit / 1024 / 1024 / 1024).toFixed(2) : '∞'} GB
                    </strong>
                </div>

                <div className={styles.progress}>
                    <div
                        className={styles.progressBar}
                        style={{
                            width: `${storagePercent}%`,
                        }}
                    />
                </div>
            </div>

            <div className={styles.stats}>
                <div>
                    <span>Visits</span>
                    <strong>{site.totalVisits.toLocaleString()}</strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>{site.status}</strong>
                </div>

                <div>
                    <span>Owner</span>
                    <strong>{site.owner.name}</strong>
                </div>

                <div>
                    <span>Plan</span>
                    <strong>{site.subscription?.plan.name ?? '-'}</strong>
                </div>
            </div>

            <footer className={styles.actions}>
                <button type="button" title="View" onClick={() => onAction('view', site)}>
                    <i className="bi bi-eye" />
                </button>

                <button type="button" title="Provision SSL" onClick={() => onAction('ssl', site)}>
                    <i className="bi bi-shield-lock" />
                </button>

                <button type="button" title="Deploy" onClick={() => onAction('deploy', site)}>
                    <i className="bi bi-cloud-upload" />
                </button>
                <button
                    type="button"
                    title={site.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    onClick={() =>
                        onAction(site.status === 'PUBLISHED' ? 'unpublish' : 'publish', site)
                    }
                >
                    <i
                        className={`bi ${
                            site.status === 'PUBLISHED' ? 'bi-eye-slash' : 'bi-send-check'
                        }`}
                    />
                </button>
            </footer>
        </article>
    );
}
