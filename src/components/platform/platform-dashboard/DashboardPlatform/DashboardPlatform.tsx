import styles from './dashboard-platform.module.css';
import DateStrip from '../DateStrip/DateStrip';
import KpiCards from '../KpiCards/KpiCards';
import ProjectOverview from '../ProjectOverview/ProjectOverview';
import ProjectTimeline from '../ProjectTimeline/ProjectTimeline';
import WebsiteStats from '../WebsiteStats/WebsiteStats';
import TodaySchedule from '../TodaySchedule/TodaySchedule';
import NewUsers from '../NewUsers/NewUsers';
import RecruitmentSchedule from '../RecruitmentSchedule/RecruitmentSchedule';

export default function DashboardPlatform() {
    return (
        <main className={styles.dashboard}>
            <header className={styles.header}>
                <DateStrip />
                <div className={styles.headerRight}>
                    <div className={styles.dateInfo}>
                        <div className={styles.dateIcon}>
                            <i className="bi bi-calendar3" />
                        </div>
                        <div>
                            <strong>Thứ Ba, 9 tháng 9, 2025</strong>
                            <span>Chúc bạn một ngày làm việc hiệu quả!</span>
                        </div>
                    </div>
                    <button type="button" className={styles.createButton}>
                        <i className="bi bi-plus-lg" />
                        <span>Tạo mới</span>
                        <i className="bi bi-chevron-down" />
                    </button>
                </div>
            </header>

            <section className={styles.contentGrid}>
                <div className={styles.mainColumn}>
                    <KpiCards />
                    <div className={styles.overviewGrid}>
                        <ProjectOverview />
                    </div>

                    <ProjectTimeline />

                    <NewUsers />
                </div>

                <aside className={styles.sideColumn}>
                    <WebsiteStats />
                    <TodaySchedule />
                    <RecruitmentSchedule />
                </aside>
            </section>
        </main>
    );
}
