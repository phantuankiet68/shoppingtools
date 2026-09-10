import styles from './website-stats.module.css';

type StatItem = {
    label: string;
    value: string;
    change: string;
    changeType: 'up' | 'down';
    icon: string;
    tone: 'blue' | 'green' | 'purple' | 'orange';
};

const stats: StatItem[] = [
    {
        label: 'Tổng Websites',
        value: '48',
        change: '+20%',
        changeType: 'up',
        icon: 'bi-globe2',
        tone: 'blue',
    },
    {
        label: 'Đang hoạt động',
        value: '42',
        change: '+12%',
        changeType: 'up',
        icon: 'bi-check-circle',
        tone: 'green',
    },
    {
        label: 'Bản nháp',
        value: '6',
        change: '-3%',
        changeType: 'down',
        icon: 'bi-file-earmark',
        tone: 'purple',
    },
    {
        label: 'Lượt truy cập',
        value: '24.8K',
        change: '+18%',
        changeType: 'up',
        icon: 'bi-bar-chart',
        tone: 'orange',
    },
];

const chartData = [38, 52, 45, 68, 58, 76, 70, 88, 82, 94, 86, 100];

export default function WebsiteStats() {
    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.titleIcon}>
                        <i className="bi bi-globe2" aria-hidden="true" />
                    </div>
                    <div>
                        <h2>Website Statistics</h2>
                        <p>Tổng quan hệ thống websites</p>
                    </div>
                </div>
                <button type="button" className={styles.moreButton} aria-label="Xem thêm">
                    <i className="bi bi-three-dots" aria-hidden="true" />
                </button>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((item) => (
                    <div key={item.label} className={styles.statItem}>
                        <div className={`${styles.statIcon} ${styles[item.tone]}`}>
                            <i className={`bi ${item.icon}`} aria-hidden="true" />
                        </div>
                        <div className={styles.statInfo}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                            <small className={item.changeType === 'up' ? styles.up : styles.down}>
                                <i
                                    className={`bi ${
                                        item.changeType === 'up'
                                            ? 'bi-arrow-up-right'
                                            : 'bi-arrow-down-right'
                                    }`}
                                    aria-hidden="true"
                                />
                                {item.change}
                            </small>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                    <div>
                        <span>Lượt truy cập</span>
                        <strong>24,892</strong>
                    </div>
                    <button type="button" className={styles.periodButton}>
                        7 ngày
                        <i className="bi bi-chevron-down" aria-hidden="true" />
                    </button>
                </div>

                <div className={styles.chart}>
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />

                    <div className={styles.bars}>
                        {chartData.map((height, index) => (
                            <div key={`${height}-${index}`} className={styles.barWrapper}>
                                <div
                                    className={styles.bar}
                                    style={{ height: `${height}%` }}
                                    title={`${height}%`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.chartLabels}>
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                    <span>CN</span>
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.status}>
                    <span className={styles.statusDot} />
                    <span>Hệ thống đang hoạt động ổn định</span>
                </div>
                <span className={styles.uptime}>99.9% uptime</span>
            </div>
        </section>
    );
}
