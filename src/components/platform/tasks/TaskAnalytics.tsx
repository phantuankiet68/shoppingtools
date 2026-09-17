'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from '@/styles/platform/tasks/TaskAnalytics.module.css';
import { useEffect, useMemo, useState } from 'react';
type Task = {
    id: string;
    title: string;
    status: string;
    priority: string;
    category?: string;
};
type AnalyticsResponse = {
    month: {
        total: number;
        completed: number;
        inProgress: number;
        overdue: number;
        completionRate: number;
    };

    focus: {
        estimatedMinutes: number;
        actualMinutes: number;
        totalPauseMinutes: number;
        totalFocusMinutes: number;
        efficiency: number;
    };

    monthlyTasks: {
        month: string;
        total: number;
    }[];

    statusDistribution: {
        name: string;
        value: number;
    }[];
};

export default function TaskAnalytics() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');

    const ITEMS_PER_PAGE = 7;

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [analyticsRes, tasksRes] = await Promise.all([
                fetch('/api/platform/tasks/analytics', {
                    cache: 'no-store',
                }),
                fetch('/api/platform/tasks', {
                    cache: 'no-store',
                }),
            ]);

            const analyticsJson = await analyticsRes.json();

            const tasksJson = await tasksRes.json();

            setAnalytics(analyticsJson.data);

            setTasks(tasksJson.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));
    }, [tasks, search]);

    const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,

        currentPage * ITEMS_PER_PAGE,
    );

    if (loading) {
        return <div className={styles.loading}>Loading Analytics...</div>;
    }

    if (!analytics) {
        return <div className={styles.empty}>No analytics data found.</div>;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.dashboard}>
                {/* LEFT */}

                <aside className={styles.leftPanel}>
                    <div className={styles.workspaceHeader}>
                        <div className={styles.workspaceHeaderContent}>
                            <h3>Task Workspace</h3>

                            <div className={styles.workspaceMeta}>
                                <span>{tasks.length} Tasks</span>

                                <span>
                                    {tasks.filter((t) => t.status === 'DONE').length} Completed
                                </span>

                                <span>
                                    {tasks.length > 0
                                        ? Math.round(
                                              (tasks.filter((t) => t.status === 'DONE').length /
                                                  tasks.length) *
                                                  100,
                                          )
                                        : 0}
                                    % Done
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.searchWrapper}>
                        <i className={`bi bi-search ${styles.searchIcon}`}></i>

                        <input
                            type="text"
                            placeholder="Search task..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.taskList}>
                        {paginatedTasks.map((task) => (
                            <div key={task.id} className={styles.taskItem}>
                                <div>
                                    <h4>{task.title}</h4>

                                    <span>{task.status}</span>
                                </div>

                                <div className={styles.priority}>{task.priority}</div>
                            </div>
                        ))}
                        <div className={styles.pagination}>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className={styles.pageButton}
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={[
                                        styles.pageButton,

                                        currentPage === i + 1 ? styles.active : '',
                                    ].join(' ')}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className={styles.pageButton}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </aside>

                {/* RIGHT */}

                <section className={styles.rightPanel}>
                    <div className={styles.productivityCard}>
                        <div className={styles.productivityHeader}>
                            <div>
                                <span className={styles.productivityLabel}>Productivity Score</span>
                                <h2>{analytics.focus?.efficiency ?? 0}%</h2>
                            </div>
                            <div className={styles.productivityIcon}>
                                <i className="bi bi-lightning-charge-fill"></i>
                            </div>
                        </div>

                        <div className={styles.scoreStatus}>
                            {(analytics.focus?.efficiency ?? 0) >= 80
                                ? 'Excellent Performance'
                                : (analytics.focus?.efficiency ?? 0) >= 60
                                  ? 'Good Performance'
                                  : 'Needs Improvement'}
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${analytics.focus?.efficiency ?? 0}%`,
                                }}
                            />
                        </div>

                        <div className={styles.productivityFooter}>
                            <div className={styles.productivityFooterItem}>
                                <small>Focus Time</small>
                                <strong>{analytics.focus?.totalFocusMinutes ?? 0}m</strong>
                            </div>
                            <div className={styles.productivityFooterItem}>
                                <small>Actual Time</small>
                                <strong>{analytics.focus?.actualMinutes ?? 0}m</strong>
                            </div>
                            <div className={styles.productivityFooterItem}>
                                <small>Pause</small>
                                <strong>{analytics.focus?.totalPauseMinutes ?? 0}m</strong>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}

                    <div className={styles.chartGrid}>
                        <div className={styles.analyticsCard}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <span className={styles.cardLabel}>Performance</span>

                                    <h3>Monthly Tasks</h3>
                                </div>

                                <div className={styles.cardMetric}>
                                    <strong>{analytics.month.total}</strong>

                                    <small>Total</small>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={270}>
                                <BarChart data={analytics.monthlyTasks}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} />

                                    <XAxis dataKey="month" tickLine={false} axisLine={false} />

                                    <YAxis tickLine={false} axisLine={false} />

                                    <Tooltip />

                                    <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="#6366f1" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={styles.focusGrid}>
                        <div className={`${styles.focusCard} ${styles.focusPrimary}`}>
                            <div className={styles.focusHeader}>
                                <div className={styles.focusIcon}>
                                    <i className="bi bi-bullseye" />
                                </div>
                                <span className={styles.focusLabel}>Focus Time</span>
                            </div>

                            <div className={styles.focusValue}>
                                <h3>{analytics.focus.totalFocusMinutes}</h3>
                                <span>min</span>
                            </div>

                            <div className={styles.focusFooter}>
                                <i className="bi bi-clock-history" />
                                <span>Total focused time</span>
                            </div>
                        </div>

                        <div className={`${styles.focusCard} ${styles.focusSuccess}`}>
                            <div className={styles.focusHeader}>
                                <div className={styles.focusIcon}>
                                    <i className="bi bi-lightning-charge-fill" />
                                </div>
                                <span className={styles.focusLabel}>Actual Time</span>
                            </div>

                            <div className={styles.focusValue}>
                                <h3>{analytics.focus.actualMinutes}</h3>
                                <span>min</span>
                            </div>

                            <div className={styles.focusFooter}>
                                <i className="bi bi-check2-circle" />
                                <span>Completed focus</span>
                            </div>
                        </div>

                        <div className={`${styles.focusCard} ${styles.focusWarning}`}>
                            <div className={styles.focusHeader}>
                                <div className={styles.focusIcon}>
                                    <i className="bi bi-pause-circle-fill" />
                                </div>
                                <span className={styles.focusLabel}>Pause Time</span>
                            </div>

                            <div className={styles.focusValue}>
                                <h3>{analytics.focus.totalPauseMinutes}</h3>
                                <span>min</span>
                            </div>

                            <div className={styles.focusFooter}>
                                <i className="bi bi-hourglass-split" />
                                <span>Total paused time</span>
                            </div>
                        </div>

                        <div className={`${styles.focusCard} ${styles.focusInfo}`}>
                            <div className={styles.focusHeader}>
                                <div className={styles.focusIcon}>
                                    <i className="bi bi-calendar2-check-fill" />
                                </div>
                                <span className={styles.focusLabel}>Estimated</span>
                            </div>

                            <div className={styles.focusValue}>
                                <h3>{analytics.focus.estimatedMinutes}</h3>
                                <span>min</span>
                            </div>

                            <div className={styles.focusFooter}>
                                <i className="bi bi-graph-up-arrow" />
                                <span>Expected focus time</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
