import styles from './project-overview.module.css';

type TaskStatus = {
    label: string;
    count: number;
    tone: 'blue' | 'orange' | 'green';
};

const taskStatuses: TaskStatus[] = [
    { label: 'On Going', count: 12, tone: 'blue' },
    { label: 'Under Review', count: 6, tone: 'orange' },
    { label: 'Finish', count: 4, tone: 'green' },
];

const trackData = [
    { month: 'Jan', values: [18, 28, 10] },
    { month: 'Feb', values: [23, 36, 16] },
    { month: 'Mar', values: [15, 25, 8] },
    { month: 'Apr', values: [30, 44, 20] },
    { month: 'May', values: [23, 39, 14] },
    { month: 'Jun', values: [36, 49, 24] },
];

function OverallTasks() {
    return (
        <article className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.headerIcon}>
                    <i className="bi bi-clipboard-check" />
                </div>

                <div className={styles.headerText}>
                    <h2>Overall Tasks</h2>
                    <p>Spread across 6 projects.</p>
                </div>

                <button type="button" className={styles.moreButton} aria-label="More">
                    <i className="bi bi-three-dots" />
                </button>
            </div>

            <div className={styles.taskSummary}>
                <span>Total Tasks</span>
                <strong>23</strong>
            </div>

            <div className={styles.progressBar}>
                <span className={styles.progressBlue} />
                <span className={styles.progressOrange} />
                <span className={styles.progressGreen} />
            </div>

            <div className={styles.taskList}>
                {taskStatuses.map((item) => (
                    <div key={item.label} className={styles.taskRow}>
                        <div className={styles.taskName}>
                            <span className={`${styles.dot} ${styles[item.tone]}`} />
                            <span>{item.label}</span>
                        </div>

                        <div className={styles.taskCount}>
                            <strong>{item.count}</strong>
                            <span>Task</span>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" className={styles.detailsButton}>
                <span>View details task</span>
                <i className="bi bi-arrow-right" />
            </button>
        </article>
    );
}

function ProjectTrack() {
    return (
        <article className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={`${styles.headerIcon} ${styles.trackIcon}`}>
                    <i className="bi bi-speedometer2" />
                </div>

                <div className={styles.headerText}>
                    <h2>Project Track</h2>
                    <p>Project performance status.</p>
                </div>

                <button type="button" className={styles.moreButton} aria-label="More">
                    <i className="bi bi-three-dots" />
                </button>
            </div>

            <div className={styles.trackTop}>
                <div className={styles.trackValue}>
                    <strong>4,892</strong>
                    <span>Referral</span>
                </div>

                <div className={styles.growth}>
                    <i className="bi bi-arrow-up" />
                    12.2%
                </div>
            </div>

            <div className={styles.chart}>
                <div className={styles.chartGrid}>
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                <div className={styles.chartYAxis}>
                    <span>80</span>
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                </div>

                <div className={styles.chartColumns}>
                    {trackData.map((item) => (
                        <div key={item.month} className={styles.chartColumn}>
                            <div className={styles.bars}>
                                <span
                                    className={styles.barBlue}
                                    style={{ height: `${item.values[0] * 1.5}px` }}
                                />
                                <span
                                    className={styles.barGreen}
                                    style={{ height: `${item.values[1] * 1.5}px` }}
                                />
                                <span
                                    className={styles.barLight}
                                    style={{ height: `${item.values[2] * 1.5}px` }}
                                />
                            </div>

                            <span className={styles.month}>{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}

function ProjectProgress() {
    return (
        <article className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={`${styles.headerIcon} ${styles.progressIcon}`}>
                    <i className="bi bi-globe2" />
                </div>

                <div className={styles.headerText}>
                    <h2>Project Progress</h2>
                    <p>Overall completion rate all projects.</p>
                </div>

                <button type="button" className={styles.moreButton} aria-label="More">
                    <i className="bi bi-three-dots" />
                </button>
            </div>

            <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                    <span>Performing Progress</span>

                    <div>
                        <small className={styles.growth}>
                            <i className="bi bi-arrow-up" />
                            10.2%
                        </small>
                        <strong>89%</strong>
                    </div>
                </div>

                <div className={styles.lineProgress}>
                    <span className={styles.greenProgress} style={{ width: '89%' }} />
                </div>
            </div>

            <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                    <span>Target Sales</span>

                    <div>
                        <small className={styles.growth}>
                            <i className="bi bi-arrow-up" />
                            2.2%
                        </small>
                        <strong>67%</strong>
                    </div>
                </div>

                <div className={styles.lineProgress}>
                    <span className={styles.blueProgress} style={{ width: '67%' }} />
                </div>
            </div>

            <div className={styles.momentum}>
                <i className="bi bi-graph-up-arrow" />
                <span>Up by 6% compared to last week, great momentum!</span>
                <i className="bi bi-arrow-right" />
            </div>
        </article>
    );
}

export default function ProjectOverview() {
    return (
        <div className={styles.overview}>
            <OverallTasks />
            <ProjectTrack />
            <ProjectProgress />
        </div>
    );
}
