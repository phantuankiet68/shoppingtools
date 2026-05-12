import styles from "@/styles/admin/dashboard/DashboardA.module.css";
import PagePricing from "@/components/admin/dashboard/PagePricing";
import AnalyticsCard from "@/components/admin/dashboard/AnalyticsCard";
import Browser from "@/components/admin/dashboard/Browser";
import TotalPage from "@/components/admin/dashboard/TotalPage";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import Image from "next/image";
import UserPlate from "@/components/admin/dashboard/UserPlate";

export default function DashboardA() {
  const { t } = useAdminI18n();
  return (
    <div className={styles.dashboard}>
      {/* MAIN */}
      <section className={styles.mainGrid}>
        <div className={styles.leftGrid}>
          <div className={styles.card}>
            <div className={styles.content}>
              <span className={styles.badge}>{t("welcome.badge")}</span>

              <h2 className={styles.title}>
                {t("welcome.titleStart")} <span>80%</span> {t("welcome.titleEnd")}
              </h2>

              <p className={styles.description}>{t("welcome.description")}</p>
            </div>
            <div className={styles.imageWrap}>
              <Image
                src="/assets/images/welcome-illustration.png"
                alt="Welcome"
                fill
                sizes="(max-width: 768px) 100vw, 260px"
                className={styles.image}
                priority
              />
            </div>

            <div className={styles.blurOne}></div>
            <div className={styles.blurTwo}></div>
          </div>
          <PagePricing />
          <TotalPage />
        </div>
        <div className={styles.rightGrid}>
          <div className={styles.headerTop}>
            <UserPlate />
            <AnalyticsCard />
            <Browser />
          </div>
        </div>
      </section>
    </div>
  );
}
