import styles from './today-schedule.module.css';

type ScheduleTone = 'blue' | 'green' | 'orange' | 'purple';

type ScheduleItem = {
    id: string;
    time: string;
    title: string;
    description: string;
    type: string;
    icon: string;
    tone: ScheduleTone;
};

const schedules: ScheduleItem[] = [
    {
        id: 'schedule-01',
        time: '10:00',
        title: 'Phỏng vấn ứng viên',
        description: 'Phòng họp A - Tầng 3',
        type: 'Meeting',
        icon: 'bi-camera-video',
        tone: 'blue',
    },
    {
        id: 'schedule-02',
        time: '11:00',
        title: 'Review template mới',
        description: 'Kiểm tra và duyệt các mẫu template',
        type: 'Review',
        icon: 'bi-eye',
        tone: 'green',
    },
    {
        id: 'schedule-03',
        time: '14:00',
        title: 'Hỗ trợ khách hàng',
        description: 'Xử lý ticket và phản hồi',
        type: 'Support',
        icon: 'bi-headset',
        tone: 'orange',
    },
    {
        id: 'schedule-04',
        time: '16:00',
        title: 'Cập nhật hệ thống',
        description: 'Triển khai bản cập nhật',
        type: 'System',
        icon: 'bi-arrow-repeat',
        tone: 'purple',
    },
];

export default function TodaySchedule() {
    return (
        <section className={styles.card}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.icon}>
                        <i className="bi bi-calendar3" aria-hidden="true" />
                    </div>

                    <div>
                        <h3>Lịch trình hôm nay</h3>
                        <p>Today's Schedule</p>
                    </div>
                </div>

                <button type="button" className={styles.viewAll}>
                    <span>Xem tất cả</span>
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
            </header>

            <div className={styles.dateHeader}>
                <div>
                    <strong>Thứ Ba</strong>
                    <span>09 Tháng 09, 2025</span>
                </div>

                <span className={styles.todayBadge}>Hôm nay</span>
            </div>

            <div className={styles.scheduleList}>
                {schedules.map((item) => (
                    <article className={styles.scheduleItem} key={item.id}>
                        <time className={styles.time}>{item.time}</time>

                        <div className={`${styles.timeline} ${styles[item.tone]}`}>
                            <span className={styles.timelineDot} />
                        </div>

                        <div className={styles.scheduleContent}>
                            <div className={styles.titleRow}>
                                <div className={`${styles.itemIcon} ${styles[item.tone]}`}>
                                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                                </div>

                                <strong>{item.title}</strong>
                            </div>

                            <p>{item.description}</p>
                        </div>

                        <span className={`${styles.typeBadge} ${styles[item.tone]}`}>
                            {item.type}
                        </span>
                    </article>
                ))}
            </div>

            <footer className={styles.footer}>
                <div className={styles.summary}>
                    <span className={styles.summaryIcon}>
                        <i className="bi bi-check2-circle" aria-hidden="true" />
                    </span>

                    <div>
                        <strong>4 lịch trình</strong>
                        <span>được lên kế hoạch hôm nay</span>
                    </div>
                </div>

                <button type="button" className={styles.addButton}>
                    <i className="bi bi-plus-lg" aria-hidden="true" />
                    <span>Thêm</span>
                </button>
            </footer>
        </section>
    );
}
