'use client';

import Image from 'next/image';

import styles from '@/styles/platform/users/site-section/site-card.module.css';

import type { Site } from './sites';

interface Props {
    site: Site;
}

export default function SiteCard({ site }: Props) {
    const logo = site.logoUrl || '/assets/images/site-default.png';

    return (
        <article className={styles.card}>
            <div className={styles.thumbnail}>
                <Image
                    src={site.logoUrl || '/assets/images/blog-02.png'}
                    alt={site.name}
                    fill
                    sizes="(max-width: 768px) 100px, 100px"
                    className={styles.image}
                />

                <div className={styles.overlay}>
                    <span className={site.status === 'ACTIVE' ? styles.published : styles.draft}>
                        {site.status}
                    </span>

                    {site.isPublic && (
                        <span className={styles.ssl}>
                            <i className="bi bi-globe2" />
                            Public
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.heading}>
                    <div>
                        <h3>{site.name}</h3>

                        <p>{site.domain}</p>
                    </div>

                    <button type="button">
                        <i className="bi bi-three-dots" />
                    </button>
                </div>
                <div className={styles.webtype}>
                    <span className={styles.workspace}>
                        <i className="bi bi-window-stack" />
                        {site.type}
                    </span>

                    {site.category && (
                        <span className={styles.workspace}>
                            <i className="bi bi-tag" />
                            {site.category}
                        </span>
                    )}
                </div>

                <div className={styles.stats}>
                    <div>
                        <i className="bi bi-envelope" />
                        <span>{site.contactEmail || '-'}</span>
                    </div>

                    <div>
                        <i className="bi bi-telephone" />
                        <span>{site.contactPhone || '-'}</span>
                    </div>
                </div>

                <div className={styles.dates}>
                    <div>
                        <label>Created</label>

                        <strong>{new Date(site.createdAt).toLocaleDateString()}</strong>
                    </div>

                    <div>
                        <label>Updated</label>

                        <strong>{new Date(site.updatedAt).toLocaleDateString()}</strong>
                    </div>
                </div>
            </div>
        </article>
    );
}
