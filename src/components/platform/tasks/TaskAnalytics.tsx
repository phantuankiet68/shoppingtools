'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { useEffect, useState } from 'react';

import styles from '@/styles/platform/tasks/TaskAnalytics.module.css';

type AnalyticsResponse = {
    today: {
        total: number;
        completed: number;
        inProgress: number;
        overdue: number;
        completionRate: number;
    };

    week: {
        total: number;
        completed: number;
        completionRate: number;
    };

    month: {
        total: number;
        completed: number;
        completionRate: number;
    };
};

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

export default function TaskAnalytics() {
    const [data, setData] = useState<AnalyticsResponse | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/platform/tasks/analytics', {
                    cache: 'no-store',
                });

                const result = await res.json();

                setData(result.data);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div>Loading analytics...</div>;
    }

    if (!data) {
        return <div>No analytics data</div>;
    }

    const pieData = [
        {
            name: 'Completed',
            value: data.today.completed,
        },
        {
            name: 'In Progress',
            value: data.today.inProgress,
        },
        {
            name: 'Overdue',
            value: data.today.overdue,
        },
    ];

    const totalPie = pieData.reduce((sum, item) => sum + item.value, 0);

    const chartData =
        totalPie === 0
            ? [
                  {
                      name: 'No Data',
                      value: 1,
                  },
              ]
            : pieData;

    const barData = [
        {
            name: 'Today',
            completion: data.today.completionRate,
        },
        {
            name: 'Week',
            completion: data.week.completionRate,
        },
        {
            name: 'Month',
            completion: data.month.completionRate,
        },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.statsGrid}>
                <div className={styles.card}>
                    <h4>Today's Tasks</h4>

                    <h2>{data.today.total}</h2>
                </div>

                <div className={styles.card}>
                    <h4>Completed</h4>

                    <h2>{data.today.completed}</h2>
                </div>

                <div className={styles.card}>
                    <h4>In Progress</h4>

                    <h2>{data.today.inProgress}</h2>
                </div>

                <div className={styles.card}>
                    <h4>Completion</h4>

                    <h2>{data.today.completionRate}%</h2>
                </div>
            </div>

            <div className={styles.chartGrid}>
                <div className={styles.chartCard}>
                    <h3>Task Status</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" />

                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                    <h3>Completion Rate</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="name" />

                            <YAxis />

                            <Tooltip />

                            <Bar dataKey="completion" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
