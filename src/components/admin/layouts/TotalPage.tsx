"use client";

import styles from "@/styles/admin/layouts/TotalPage.module.css";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useDashboardStats } from "@/store/dashboard/useDashboardStats";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

// 🔥 PLAN CONFIG
const PLAN_LIMITS = {
  BASIC: { sites: 1, templates: 3, products: 10, users: 50 },
  NORMAL: { sites: 2, templates: 5, products: 30, users: 80 },
  PRO: { sites: 3, templates: 10, products: 100, users: 100 },
  PLUS: { sites: 5, templates: 15, products: 999, users: 999 },
};

const calcPercent = (value: number, max?: number) => {
  if (!max || max === 0) return 100;
  return Math.min(Math.round((value / max) * 100), 100);
};

const getColor = (percent: number) => {
  if (percent >= 90) return "rgb(68 190 239) 100%";
  if (percent >= 70) return "#e79b44ff";
  return "#22c55e";
};

export default function TotalPage() {
  const { user, site, memberships } = useAdminAuth();
  const { t } = useAdminI18n();

  const userId = user?.id ?? "";
  const siteId = site?.id ?? "";

  const { data, loading } = useDashboardStats(userId, siteId);

  const tier = memberships?.[0]?.tier || "BASIC";
  const limits = PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS];

  if (loading) {
    return (
      <div className={styles.loading}>
        {t("dashboard.loading")}
      </div>
    );
  }

  const stats = [
    {
      title: t("dashboard.sitesUsed"),
      value: data.totalSites,
      icon: "bi-globe",
      percent: calcPercent(data.totalSites, limits.sites),
      limit: limits.sites,
    },
    {
      title: t("dashboard.templatesUsed"),
      value: data.totalPages,
      icon: "bi-layout-text-window",
      percent: calcPercent(data.totalPages, limits.templates),
      limit: limits.templates,
    },
    {
      title: t("dashboard.productsCreated"),
      value: data.totalProducts,
      icon: "bi-box-seam",
      percent: calcPercent(data.totalProducts, limits.products),
      limit: limits.products,
    },
    {
      title: t("dashboard.productsSold"),
      value: data.productsSold,
      icon: "bi-cart-check",
      percent: 100,
      limit: null,
    },
    {
      title: t("dashboard.stockRemaining"),
      value: data.stockRemaining,
      icon: "bi-archive",
      percent: 100,
      limit: null,
    },
    {
      title: t("dashboard.usersMember"),
      value: data.totalUsers,
      icon: "bi-people",
      percent: calcPercent(data.totalUsers, limits.users),
      limit: limits.users,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {stats.map((item, index) => {
          const color = getColor(item.percent);

          return (
            <div key={index} className={styles.card}>
              <div className={styles.left}>
                <i className={`bi ${item.icon}`}></i>
                <span>{item.title}</span>
              </div>

              <div className={styles.rightBox}>
                <div
                  className={styles.circle}
                  style={{
                    background: `conic-gradient(${color} ${item.percent}%, #e5e7eb 0%)`,
                  }}
                >
                  <div className={styles.inner}>
                    {item.percent}%
                  </div>
                </div>

                <div className={styles.right}>
                  <span className={styles.value}>
                    {item.value}
                    {item.limit && (
                      <span className={styles.limit}>
                        {" "}
                        / {item.limit}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}