"use client";
import { useState } from "react";
import styles from "@/styles/admin/layouts/PagePricing.module.css";

export default function PagePricing() {
  const [active, setActive] = useState("pro");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "50.000đ",
      sites: 1,
      templates: 3,
      products: 10,
      categories: 5,
    },
    {
      id: "normal",
      name: "Normal",
      price: "100.000đ",
      sites: 2,
      templates: 5,
      products: 30,
      categories: 10,
    },
    {
      id: "pro",
      name: "Pro",
      price: "200.000đ",
      sites: 3,
      templates: 10,
      products: 100,
      categories: 30,
      highlight: true,
    },
    {
      id: "plus",
      name: "Plus",
      price: "500.000đ",
      sites: 5,
      templates: 15,
      products: 999,
      categories: 999,
    },
  ];

  return (
    <div className={styles.wrapper}>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`${styles.card} ${active === plan.id ? styles.active : ""} ${plan.highlight ? styles.highlight : ""}`}
          onClick={() => setActive(plan.id)}
        >
         <div className={styles.header}>
          <div className={styles.planInfo}>
            <div className={styles.iconBox}>
              {plan.name[0]}
            </div>

            <div>
              <div className={styles.name}>{plan.name}</div>
              <div className={styles.meta}>
                {plan.sites} site{plan.sites > 1 && "s"}
              </div>
            </div>
          </div>

          {plan.highlight && (
            <span className={styles.badge}>
              🔥 Popular
            </span>
          )}
        </div>

        <div className={`${styles.card} ${styles.cardBody}`}>
          {/* PRICE */}
          <div className={styles.priceWrapper}>
            <span className={styles.price}>{plan.price}</span>
            <span className={styles.period}>/month</span>
          </div>

          {/* FEATURES */}
          <ul className={styles.features}>
            <li><span>🎨</span>{plan.templates} Templates</li>
            <li><span>🌐</span>{plan.sites} Website</li>
            <li><span>📦</span>{plan.products} Products</li>
            <li><span>📁</span>{plan.categories} Categories</li>
            <li><span>⚡</span>Drag & Drop Builder</li>
            <li><span>📊</span>Analytics Dashboard</li>
          </ul>

          {/* CTA */}
          <button
            className={`${styles.btn} ${
              active === plan.id ? styles.active : ""
            }`}
          >
            {active === plan.id ? "Current Plan" : "Upgrade"}
          </button>
        </div>
        </div>
      ))}
    </div>
  );
}