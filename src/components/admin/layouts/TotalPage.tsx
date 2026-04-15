"use client";
import styles from "@/styles/admin/layouts/TotalPage.module.css";

const stats = [
  {
    title: "Sites Used",
    value: 12,
    icon: "bi-globe",
    percent: 65,
    trend: "+12%",
  },
  {
    title: "Templates Used",
    value: 34,
    icon: "bi-layout-text-window",
    percent: 45,
    trend: "+8%",
  },
  {
    title: "Products Created",
    value: 120,
    icon: "bi-box-seam",
    percent: 70,
    trend: "+15%",
  },
  {
    title: "Products Sold",
    value: 89,
    icon: "bi-cart-check",
    percent: 80,
    trend: "+21%",
  },
  {
    title: "Stock Remaining",
    value: 31,
    icon: "bi-archive",
    percent: 30,
    trend: "-5%",
  },
  {
    title: "Users Member",
    value: 542,
    icon: "bi-people",
    percent: 60,
    trend: "+18%",
  },
];

export default function TotalPage() {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {stats.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.left}>
              <i className={`bi ${item.icon}`}></i>
              <span>{item.title}</span>
            </div>
            <div className={styles.rightBox}>
              <div
                className={styles.circle}
                style={{
                  background: `conic-gradient(#71d1ff ${item.percent}%, #e5e7eb 0%)`,
                }}
              >
                <div className={styles.inner}>
                  {item.percent}%
                </div>
              </div>
              <div className={styles.right}>
                <span className={styles.value}>{item.value}</span>
                <span
                  className={`${styles.trend} ${
                    item.trend.includes("-")
                      ? styles.down
                      : styles.up
                  }`}
                >
                  {item.trend}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}