'use client';

import { useCallback, useEffect, useState } from 'react';

import styles from '@/styles/platform/users/site-section/site-section.module.css';

import SiteCard from './site-card';

export interface SiteItem {
    id: string;
    name: string;
    domain: string;
    type: string;
    category: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

interface SiteSectionProps {
    userId?: string | null;
}

export default function SiteSection({ userId }: SiteSectionProps) {
    const [sites, setSites] = useState<SiteItem[]>([]);
    const [loading, setLoading] = useState(false);

    const loadSites = useCallback(async () => {
        if (!userId) {
            setSites([]);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`/api/platform/users/${userId}/sites`, {
                cache: 'no-store',
            });

            const json = await response.json();

            if (!json.ok) {
                throw new Error(json.message);
            }

            setSites(json.data);
        } catch (error) {
            console.error('LOAD_SITES_ERROR', error);
            setSites([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadSites();
    }, [loadSites]);

    if (!userId) {
        return (
            <section className={styles.section}>
                <div className={styles.header}>
                    <h2>Sites</h2>
                </div>

                <div className={styles.empty}>Select a user to view sites.</div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <div className={styles.bgCircle1} />
                <div className={styles.bgCircle2} />
                <div className={styles.bgDotsTop} />
                <div className={styles.bgDotsBottom} />

                <div className={styles.left}>
                    <div className={styles.iconBox}>
                        <i className="bi bi-window-stack" />
                    </div>

                    <div className={styles.headerContent}>
                        <div className={styles.headerContent}>
                            <h2>Sites</h2>
                            <p>Create, manage and monitor all your websites in one place.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.button}>
                        <i className="bi bi-plus-lg" />
                        <span>Create Site</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={styles.empty}>Loading sites...</div>
            ) : sites.length === 0 ? (
                <div className={styles.empty}>No sites found.</div>
            ) : (
                <div className={styles.grid}>
                    {sites.map((site) => (
                        <SiteCard key={site.id} site={site} />
                    ))}
                </div>
            )}
        </section>
    );
}
