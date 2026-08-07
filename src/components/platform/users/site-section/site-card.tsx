import Image from 'next/image';

import styles from '@/styles/platform/users/site-section/site-card.module.css';

import { Site } from './sites';

interface Props {
    site: Site;
}

export default function SiteCard({ site }: Props) {
    return (
        <article className={styles.card}>
            <div className={styles.thumbnail}>
                <Image
                    src={site.thumbnail}
                    alt={site.name}
                    fill
                    sizes="(max-width: 768px) 100vw,
           (max-width: 1200px) 50vw,
           25vw"
                    className={styles.image}
                />

                <div className={styles.overlay}>
                    <span className={site.status === 'Published' ? styles.published : styles.draft}>
                        {site.status}
                    </span>

                    {site.ssl && (
                        <span className={styles.ssl}>
                            <i className="bi bi-shield-lock-fill" />
                            SSL
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

                    <button>
                        <i className="bi bi-three-dots" />
                    </button>
                </div>

                <span className={styles.workspace}>
                    <i className="bi bi-grid-1x2-fill" />

                    {site.workspace}
                </span>

                <div className={styles.stats}>
                    <div>
                        <i className="bi bi-eye" />

                        <span>{site.visitors}</span>
                    </div>

                    <div>
                        <i className="bi bi-hdd-stack" />

                        <span>{site.storage}</span>
                    </div>
                </div>

                <div className={styles.dates}>
                    <div>
                        <label>Created</label>

                        <strong>{site.created}</strong>
                    </div>

                    <div>
                        <label>Updated</label>

                        <strong>{site.updated}</strong>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.primary}>
                        <i className="bi bi-box-arrow-up-right" />
                        Dashboard
                    </button>

                    <button>Manage</button>
                </div>
            </div>
        </article>
    );
}
