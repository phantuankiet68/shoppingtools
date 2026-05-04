import styles from "@/styles/admin/layouts/DashboardA.module.css";
import PagePricing from "@/components/admin/layouts/PagePricing";
import Scarler from "@/components/admin/layouts/Scarler";
import Browser from "@/components/admin/layouts/Browser";
import TotalPage from "@/components/admin/layouts/TotalPage";

export default function DashboardA() {
  return (
    <div className={styles.dashboard}>
      {/* MAIN */}
      <section className={styles.mainGrid}>
        <TotalPage />
        <div className={styles.rightGrid}>
           <PagePricing />
           <div className={styles.headerTop}>
            <Browser /> 
            <Scarler />
          </div>
        </div>
      </section>

      {/* 🔥 NEW FOOTER */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span>© 2026 Scarlett System</span>
        </div>

        <div className={styles.footerRight}>
          <span>Status: Online</span>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
}