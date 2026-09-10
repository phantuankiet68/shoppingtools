import styles from './project-timeline.module.css';

type TimelineItem = {
    id: string;
    title: string;
    start: number;
    end: number;
    tone: 'blue' | 'purple' | 'green' | 'orange';
    icon: string;
    avatars?: string[];
};

const timeLabels = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
];

const timelineItems: TimelineItem[] = [
    {
        id: 'schedule-01',
        title: 'Meeting Brief Project',
        start: 0.4,
        end: 2.2,
        tone: 'blue',
        icon: 'bi-calendar-event',
        avatars: ['NT', 'LH'],
    },
    {
        id: 'schedule-02',
        title: 'Research Analyze Content',
        start: 1.5,
        end: 4.2,
        tone: 'purple',
        icon: 'bi-search',
        avatars: ['TP', 'VA'],
    },
    {
        id: 'schedule-03',
        title: 'Build Website & Mobile Responsive',
        start: 0.8,
        end: 4.8,
        tone: 'green',
        icon: 'bi-phone',
        avatars: ['NT', 'TT'],
    },
    {
        id: 'schedule-04',
        title: 'Review & Feedback',
        start: 3.9,
        end: 5.9,
        tone: 'orange',
        icon: 'bi-chat-left-text',
        avatars: ['LH', 'TP'],
    },
    {
        id: 'schedule-05',
        title: 'Internal Meeting',
        start: 5.1,
        end: 7.2,
        tone: 'blue',
        icon: 'bi-people',
        avatars: ['VA', 'TT'],
    },
    {
        id: 'schedule-06',
        title: 'Review & Feedback',
        start: 6.2,
        end: 8.1,
        tone: 'orange',
        icon: 'bi-chat-left-text',
        avatars: ['NT', 'LH'],
    },
    {
        id: 'schedule-07',
        title: 'Design System',
        start: 6.8,
        end: 9.1,
        tone: 'green',
        icon: 'bi-palette',
        avatars: ['TP', 'VA'],
    },
    {
        id: 'schedule-08',
        title: 'Branding Project',
        start: 7.8,
        end: 9.8,
        tone: 'green',
        icon: 'bi-stars',
        avatars: ['TT', 'NT'],
    },
    {
        id: 'schedule-09',
        title: 'Animation',
        start: 8.3,
        end: 10.1,
        tone: 'green',
        icon: 'bi-play-circle',
        avatars: ['LH', 'VA'],
    },
    {
        id: 'schedule-10',
        title: 'Reporting',
        start: 9.2,
        end: 10.8,
        tone: 'orange',
        icon: 'bi-file-earmark-bar-graph',
        avatars: ['TP', 'TT'],
    },
];

export default function ProjectTimeline() {
    return (
        <section className={styles.timeline}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.icon}>
                        <i className="bi bi-clock-history" aria-hidden="true" />
                    </div>

                    <div>
                        <h3>Project Timeline</h3>
                        <p>
                            Visualize your project schedule, key milestones, and deadlines in a
                            chronological view.
                        </p>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.dateButton}>
                        <i className="bi bi-calendar3" aria-hidden="true" />
                        <span>12/Feb/2025</span>
                        <i className="bi bi-chevron-down" aria-hidden="true" />
                    </button>

                    <button type="button" className={styles.filterButton}>
                        <i className="bi bi-funnel" aria-hidden="true" />
                        <span>Filter</span>
                    </button>

                    <button type="button" className={styles.addButton}>
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                        <span>Add Schedule</span>
                    </button>

                    <button type="button" className={styles.moreButton} aria-label="More options">
                        <i className="bi bi-three-dots" aria-hidden="true" />
                    </button>
                </div>
            </header>

            <div className={styles.timelineWrapper}>
                <div className={styles.timeHeader}>
                    <div className={styles.taskHeader}>Task / Schedule</div>

                    <div className={styles.timeScale}>
                        {timeLabels.map((time) => (
                            <span key={time}>{time}</span>
                        ))}
                    </div>
                </div>

                <div className={styles.timelineContent}>
                    <div className={styles.taskColumn}>
                        {timelineItems.map((item) => (
                            <div className={styles.taskRow} key={item.id}>
                                <span className={`${styles.taskIndicator} ${styles[item.tone]}`} />
                                <span className={styles.taskName}>{item.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.scheduleColumn}>
                        <div className={styles.verticalLines}>
                            {timeLabels.map((time) => (
                                <span key={time} />
                            ))}
                        </div>

                        <div className={styles.currentTime}>
                            <span>10:42</span>
                        </div>

                        {timelineItems.map((item, index) => {
                            const left = `${(item.start / 10.8) * 100}%`;
                            const width = `${((item.end - item.start) / 10.8) * 100}%`;

                            return (
                                <div
                                    key={item.id}
                                    className={`${styles.scheduleBar} ${styles[item.tone]}`}
                                    style={{
                                        left,
                                        width,
                                        top: `${index * 38 + 12}px`,
                                    }}
                                >
                                    <div className={styles.barIcon}>
                                        <i className={`bi ${item.icon}`} aria-hidden="true" />
                                    </div>

                                    <span className={styles.barTitle}>{item.title}</span>

                                    <div className={styles.avatars}>
                                        {item.avatars?.slice(0, 2).map((avatar) => (
                                            <span key={avatar}>{avatar}</span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.legend}>
                    <span>
                        <i className={`${styles.legendDot} ${styles.blue}`} />
                        Meeting
                    </span>

                    <span>
                        <i className={`${styles.legendDot} ${styles.purple}`} />
                        Research
                    </span>

                    <span>
                        <i className={`${styles.legendDot} ${styles.green}`} />
                        Development
                    </span>

                    <span>
                        <i className={`${styles.legendDot} ${styles.orange}`} />
                        Review
                    </span>
                </div>

                <span className={styles.total}>10 schedules</span>
            </footer>
        </section>
    );
}
