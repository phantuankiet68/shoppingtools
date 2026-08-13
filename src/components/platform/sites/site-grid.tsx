'use client';

import SiteCard from './site-card';
import type { SiteAction } from '@/features/platform/types/sites/site-action';
import type { SiteItem } from '@/features/platform/types/sites/site';

import styles from '@/styles/platform/sites/site-grid.module.css';

interface SiteGridProps {
    loading: boolean;
    sites: SiteItem[];
    selectedIds: string[];
    onSelectedChange: (id: string, checked: boolean) => void;
    onAction: (action: SiteAction, site: SiteItem) => Promise<void>;
}

export default function SiteGrid({
    loading,
    sites,
    selectedIds,
    onSelectedChange,
    onAction,
}: SiteGridProps) {
    if (loading) {
        return (
            <section className={styles.empty}>
                <h3>Loading...</h3>
            </section>
        );
    }

    if (!sites.length) {
        return (
            <section className={styles.empty}>
                <h3>No websites found</h3>
                <p>Create your first website to start managing it.</p>
            </section>
        );
    }

    return (
        <section className={styles.grid}>
            {sites.map((site) => (
                <SiteCard
                    key={site.id}
                    site={site}
                    checked={selectedIds.includes(site.id)}
                    onCheckedChange={(checked) => onSelectedChange(site.id, checked)}
                    onAction={onAction}
                />
            ))}
        </section>
    );
}
