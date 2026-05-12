"use client";

import styles from "@/styles/admin/dashboard/PagePricing.module.css";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

export default function PagePricing() {
  const { memberships } = useAdminAuth();
  const { t } = useAdminI18n();

  const tier = memberships?.[0]?.tier || "BASIC";
  const activePlan = tier.toLowerCase();

  const plans = [
    {
      id: "basic",
      name: t("pricing.basic"),
      price: "50.000đ",
      sites: 1,
      templates: 3,
      products: 10,
      categories: 5,
    },
    {
      id: "normal",
      name: t("pricing.normal"),
      price: "100.000đ",
      sites: 2,
      templates: 5,
      products: 30,
      categories: 10,
    },
    {
      id: "pro",
      name: t("pricing.pro"),
      price: "200.000đ",
      sites: 3,
      templates: 10,
      products: 100,
      categories: 30,
      highlight: true,
    },
  ];

  return (
    <div className={styles.wrapper}>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`${styles.card} 
            ${activePlan === plan.id ? styles.active : ""} 
            ${plan.highlight ? styles.highlight : ""}`}
        >
          {/* HEADER */}
          <div className={styles.header}>
            <div className={styles.planInfo}>
              <div className={styles.iconBox}>{plan.name[0]}</div>

              <div>
                <div className={styles.name}>{plan.name}</div>
                <div className={styles.meta}>
                  {plan.sites} {t("pricing.websites")}
                </div>
              </div>
            </div>

            {plan.highlight && <span className={styles.badge}>🔥 {t("pricing.popular")}</span>}
          </div>

          {/* BODY */}
          <div className={styles.cardBody}>
            {/* PRICE */}
            <div className={styles.priceWrapper}>
              <span className={styles.price}>{plan.price}</span>
              <span className={styles.period}>/{t("pricing.month")}</span>
            </div>

            {/* FEATURES */}
            <ul className={styles.features}>
              <li>
                <span>🎨</span>
                {plan.templates} {t("pricing.templates")}
              </li>
              <li>
                <span>🌐</span>
                {plan.sites} {t("pricing.websites")}
              </li>
              <li>
                <span>📦</span>
                {plan.products} {t("pricing.products")}
              </li>
              <li>
                <span>📁</span>
                {plan.categories} {t("pricing.categories")}
              </li>
              <li>
                <span>⚡</span>
                {t("pricing.dragDrop")}
              </li>
              <li>
                <span>📊</span>
                {t("pricing.analytics")}
              </li>
            </ul>

            {/* CTA */}
            <button className={`${styles.btn} ${activePlan === plan.id ? styles.active : ""}`}>
              {activePlan === plan.id ? t("pricing.currentPlan") : t("pricing.upgrade")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
