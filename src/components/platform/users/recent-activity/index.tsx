import styles from '@/styles/platform/users/recent-activity/recent-activity.module.css';
import { ACTIVITIES } from './activity';

export default function RecentActivity() {
    return (
        <section className={styles.card}>
            <header className={styles.header}>
                <div>
                    <h2>Recent Activity</h2>
                </div>

                <button className={styles.btnView}>View all</button>
            </header>

            <div className={styles.list}>
                {ACTIVITIES.map((item) => (
                    <article key={item.id} className={styles.item}>
                        <div
                            className={styles.icon}
                            style={
                                {
                                    '--color': item.color,
                                } as React.CSSProperties
                            }
                        >
                            <i className={`bi ${item.icon}`} />
                        </div>

                        <div className={styles.content}>
                            <h4>
                                <strong>{item.user}</strong> {item.title}
                            </h4>

                            <p>{item.description}</p>
                        </div>

                        <time>{item.time}</time>
                    </article>
                ))}
            </div>
        </section>
    );
}
