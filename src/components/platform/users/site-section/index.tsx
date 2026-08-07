import styles from '@/styles/platform/users/site-section/site-section.module.css';

import SiteCard from './site-card';
import { SITES } from './sites';

export default function SiteSection() {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h2>Sites</h2>
                </div>

                <button className={styles.createButton}>
                    <i className="bi bi-plus-lg" />
                    Create Site
                </button>
            </div>

            <div className={styles.grid}>
                {SITES.map((site) => (
                    <SiteCard key={site.id} site={site} />
                ))}
            </div>
        </section>
    );
}
