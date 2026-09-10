import styles from './kpi-cards.module.css';

type KpiTone = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

type KpiItem = {
    label: string;
    value: string;
    change: string;
    difference: string;
    description: string;
    icon: string;
    tone: KpiTone;
    trend: number[];
};

const kpiItems: KpiItem[] = [
    {
        label: 'Users (Admin)',
        value: '24',
        change: '12%',
        difference: '+3',
        description: 'Tài khoản quản trị',
        icon: 'bi-people',
        tone: 'blue',
        trend: [28, 40, 35, 58, 51, 67, 88],
    },
    {
        label: 'Menu Templates',
        value: '56',
        change: '8%',
        difference: '+4',
        description: 'Mẫu menu',
        icon: 'bi-layout-text-window-reverse',
        tone: 'purple',
        trend: [25, 39, 34, 56, 48, 67, 91],
    },
    {
        label: 'Page Templates',
        value: '132',
        change: '15%',
        difference: '+17',
        description: 'Mẫu trang',
        icon: 'bi-file-earmark-text',
        tone: 'green',
        trend: [28, 42, 38, 63, 55, 70, 94],
    },
    {
        label: 'Sites',
        value: '48',
        change: '20%',
        difference: '+8',
        description: 'Website đang hoạt động',
        icon: 'bi-globe2',
        tone: 'orange',
        trend: [24, 37, 32, 55, 48, 72, 94],
    },
];

function TrendChart({ values, tone }: { values: number[]; tone: KpiTone }) {
    const width = 90;
    const height = 38;
    const padding = 2;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const points = values
        .map((value, index) => {
            const x = padding + (index / (values.length - 1)) * (width - padding * 2);
            const y = height - padding - ((value - min) / range) * (height - padding * 2);

            return `${x},${y}`;
        })
        .join(' ');

    const lastPoint = points.split(' ').at(-1) ?? '';
    const [lastX, lastY] = lastPoint.split(',');
    const areaPoints = `${points} ${lastX},${height} 0,${height}`;

    return (
        <svg
            className={`${styles.trendChart} ${styles[tone]}`}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={`kpi-gradient-${tone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" className={styles.gradientStart} />
                    <stop offset="100%" className={styles.gradientEnd} />
                </linearGradient>
            </defs>

            <polygon points={areaPoints} fill={`url(#kpi-gradient-${tone})`} />

            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle
                cx={lastX}
                cy={lastY}
                r="3.5"
                fill="currentColor"
                stroke="#fff"
                strokeWidth="1.5"
            />
        </svg>
    );
}

export default function KpiCards() {
    return (
        <div className={styles.kpiGrid}>
            {kpiItems.map((item) => {
                const isNegative = item.difference.startsWith('-');

                return (
                    <article key={item.label} className={styles.card}>
                        <div className={`${styles.iconBox} ${styles[item.tone]}`}>
                            <i className={`bi ${item.icon}`} aria-hidden="true" />
                        </div>

                        <div className={styles.content}>
                            <div className={styles.topRow}>
                                <span className={styles.label}>{item.label}</span>

                                <button
                                    type="button"
                                    className={styles.arrowButton}
                                    aria-label={`Xem ${item.label}`}
                                >
                                    <i className="bi bi-chevron-right" aria-hidden="true" />
                                </button>
                            </div>

                            <div className={styles.valueRow}>
                                <strong className={styles.value}>{item.value}</strong>

                                <span
                                    className={`${styles.change} ${
                                        isNegative ? styles.negative : styles.positive
                                    }`}
                                >
                                    <i
                                        className={`bi ${
                                            isNegative ? 'bi-arrow-down' : 'bi-arrow-up'
                                        }`}
                                        aria-hidden="true"
                                    />
                                    {item.change}
                                </span>
                            </div>

                            <span className={styles.description}>{item.description}</span>
                        </div>

                        <div className={styles.bottomRow}>
                            <div className={styles.weekChange}>
                                <div className={`${styles.smallIcon} ${styles[item.tone]}`}>
                                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                                </div>

                                <div className={styles.weekInfo}>
                                    <strong>{item.difference}</strong>
                                    <span>tuần trước</span>
                                </div>
                            </div>

                            <TrendChart values={item.trend} tone={item.tone} />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
