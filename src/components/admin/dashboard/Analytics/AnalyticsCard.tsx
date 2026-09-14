'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from './AnalyticsCard.module.css';

const data = [
    { month: 'Jan', value: 3500 },
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 2200 },
    { month: 'Apr', value: 3100 },
    { month: 'May', value: 2200 },
    { month: 'Jun', value: 4100 },
    { month: 'Jul', value: 2200 },
    { month: 'Aug', value: 2671 },
    { month: 'Sep', value: 1200 },
    { month: 'Oct', value: 2500 },
    { month: 'Nov', value: 2800 },
    { month: 'Dec', value: 1200 },
];

const activeMonth = 'Aug';

const formatValue = (value: number) => {
    return `$${value.toLocaleString('en-US')}`;
};

export default function AnalyticsCard() {
    const { t } = useAdminI18n();

    return (
        <section className={styles.card}>
            {/* HEADER */}
            <div className={styles.header}>
                <h3 className={styles.title}>{t('analytics.overview') || 'Overview'}</h3>

                <div className={styles.headerControls}>
                    {/* ACTIONS */}
                    <div className={styles.actionGroup}>
                        <button type="button" className={styles.iconButton} aria-label="Share">
                            <i className="bi bi-box-arrow-up" />
                        </button>

                        <button type="button" className={styles.iconButton} aria-label="Download">
                            <i className="bi bi-download" />
                        </button>

                        <span className={styles.actionLabel}>Both</span>
                    </div>

                    {/* PERIOD */}
                    <div className={styles.periodGroup}>
                        <button
                            type="button"
                            className={`${styles.periodButton} ${styles.periodActive}`}
                        >
                            Y
                        </button>

                        <button type="button" className={styles.periodButton}>
                            M
                        </button>

                        <button type="button" className={styles.periodButton}>
                            W
                        </button>

                        <button type="button" className={styles.periodButton}>
                            D
                        </button>

                        <button type="button" className={styles.periodButton}>
                            All
                        </button>
                    </div>
                </div>
            </div>

            {/* CHART */}
            <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 12,
                            right: 4,
                            left: 0,
                            bottom: 0,
                        }}
                        barCategoryGap="27%"
                    >
                        <CartesianGrid vertical={false} stroke="#eef2f6" strokeWidth={1} />

                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: '#8c99a8',
                                fontSize: 10,
                                fontWeight: 500,
                            }}
                            dy={8}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={42}
                            domain={[0, 4800]}
                            ticks={[0, 1200, 2400, 3600, 4800]}
                            tickFormatter={(value) => `$${value.toLocaleString('en-US')}`}
                            tick={{
                                fill: '#9ba6b2',
                                fontSize: 9,
                                fontWeight: 500,
                            }}
                        />

                        <Tooltip
                            cursor={false}
                            formatter={(value) => [`$${Number(value).toLocaleString('en-US')}`, '']}
                            labelFormatter={() => ''}
                            contentStyle={{
                                padding: '7px 10px',
                                border: 'none',
                                borderRadius: 6,
                                background: '#111827',
                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.16)',
                            }}
                            itemStyle={{
                                padding: 0,
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                            labelStyle={{
                                display: 'none',
                            }}
                        />

                        <Bar
                            dataKey="value"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={15}
                            animationDuration={700}
                        >
                            {data.map((item) => (
                                <Cell
                                    key={item.month}
                                    className={
                                        item.month === activeMonth ? styles.activeBar : styles.bar
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
