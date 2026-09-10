import styles from './recruitment-schedule.module.css';

type CalendarDay = {
    weekday: string;
    date: number;
    active?: boolean;
};

type ScheduleItem = {
    time: string;
    title: string;
    description: string;
    type: 'interview' | 'birthday' | 'meeting' | 'onboarding';
    status?: 'passed' | 'pending';
    people?: string;
};

const calendarDays: CalendarDay[] = [
    { weekday: 'T2', date: 26 },
    { weekday: 'T3', date: 27 },
    { weekday: 'T4', date: 28 },
    { weekday: 'T5', date: 29, active: true },
    { weekday: 'T6', date: 30 },
    { weekday: 'T7', date: 31 },
    { weekday: 'CN', date: 1 },
];

const schedules: ScheduleItem[] = [
    {
        time: '10:00',
        title: '初试 | 面试官：杨超',
        description: '电话面试',
        type: 'interview',
        status: 'passed',
    },
    {
        time: '10:00',
        title: '提醒事项：杨继荣过生日',
        description: '记得发送祝福邮件',
        type: 'birthday',
    },
    {
        time: '14:00',
        title: '初试 | 面试官：杨小贝',
        description: '小组面试：PaaS高级设计师',
        type: 'meeting',
    },
    {
        time: '16:00',
        title: '初试 | 面试官：杨小贝、张皓皓',
        description: '现场面试',
        type: 'interview',
    },
];

const typeIcons: Record<ScheduleItem['type'], string> = {
    interview: 'bi-person-video3',
    birthday: 'bi-gift',
    meeting: 'bi-people',
    onboarding: 'bi-person-check',
};

export default function RecruitmentSchedule() {
    return (
        <section className={styles.card}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <span className={styles.titleIndicator} />
                    <div>
                        <h3>招聘日程</h3>
                        <p>Recruitment Schedule</p>
                    </div>
                </div>

                <label className={styles.filter}>
                    <input type="checkbox" defaultChecked />
                    <span>仅看我安排的面试</span>
                </label>

                <button type="button" className={styles.moreButton} aria-label="更多招聘日程选项">
                    <i className="bi bi-three-dots" aria-hidden="true" />
                </button>
            </header>

            <div className={styles.calendar}>
                <button type="button" className={styles.calendarArrow} aria-label="Tuần trước">
                    <i className="bi bi-chevron-left" aria-hidden="true" />
                </button>

                <div className={styles.days}>
                    {calendarDays.map((day) => (
                        <button
                            key={`${day.weekday}-${day.date}`}
                            type="button"
                            className={`${styles.day} ${day.active ? styles.activeDay : ''}`}
                        >
                            <span>{day.weekday}</span>
                            <strong>{day.date}</strong>
                        </button>
                    ))}
                </div>

                <button type="button" className={styles.calendarArrow} aria-label="Tuần sau">
                    <i className="bi bi-chevron-right" aria-hidden="true" />
                </button>
            </div>

            <div className={styles.todayNotice}>
                <span className={styles.noticeIcon}>
                    <i className="bi bi-bell-fill" aria-hidden="true" />
                </span>

                <span>
                    <strong>杨继荣、杨小贝、吴建明</strong>
                    <small>3 人今日入职</small>
                </span>

                <i className="bi bi-arrow-right" aria-hidden="true" />
            </div>

            <div className={styles.scheduleList}>
                {schedules.map((item, index) => (
                    <article
                        className={styles.scheduleItem}
                        key={`${item.time}-${item.title}-${index}`}
                    >
                        <time>{item.time}</time>

                        <div className={`${styles.scheduleIcon} ${styles[item.type]}`}>
                            <i className={`bi ${typeIcons[item.type]}`} aria-hidden="true" />
                        </div>

                        <div className={styles.scheduleContent}>
                            <div className={styles.scheduleTitle}>
                                <strong>{item.title}</strong>

                                {item.status === 'passed' && (
                                    <span className={styles.passed}>
                                        <i className="bi bi-check2" aria-hidden="true" />
                                        通过
                                    </span>
                                )}
                            </div>

                            <span className={styles.description}>{item.description}</span>
                        </div>

                        <button
                            type="button"
                            className={styles.itemMore}
                            aria-label={`更多 ${item.title}`}
                        >
                            <i className="bi bi-three-dots" aria-hidden="true" />
                        </button>
                    </article>
                ))}
            </div>

            <footer className={styles.footer}>
                <button type="button" className={styles.addButton}>
                    <i className="bi bi-plus-lg" aria-hidden="true" />
                    <span>添加日程</span>
                </button>

                <button type="button" className={styles.viewButton}>
                    查看全部
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
            </footer>
        </section>
    );
}
