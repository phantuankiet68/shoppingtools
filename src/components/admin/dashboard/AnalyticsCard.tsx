"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import styles from "@/styles/admin/dashboard/AnalyticsCard.module.css";

const data = [
  { month: "Jan", value: 18 },
  { month: "Feb", value: 42 },
  { month: "Mar", value: 28 },
  { month: "Apr", value: 52 },
  { month: "May", value: 40 },
  { month: "Jun", value: 78 },
  { month: "Jul", value: 58 },
  { month: "Aug", value: 72 },
  { month: "Sep", value: 44 },
  { month: "Oct", value: 66 },
  { month: "Nov", value: 38 },
  { month: "Dec", value: 58 },
];

export default function AnalyticsCard() {
  const { t } = useAdminI18n();
  return (
    <div className={styles.card}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <span className={styles.label}>{t("analytics.monthlyRecapReport")}</span>
        </div>
      </div>

      {/* CHART */}
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#362f1bff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#241d0bff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />

            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />

            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 10px 30px rgba(15,23,42,.08)",
                fontSize: 13,
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#86a6cd"
              strokeWidth={4}
              fill="url(#colorValue)"
              dot={{
                r: 4,
                strokeWidth: 3,
                fill: "#fff",
              }}
              activeDot={{
                r: 7,
                fill: "#fbbf24",
                stroke: "#fff",
                strokeWidth: 4,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* FLOAT CARD */}
        <div className={styles.floatingCard}>
          <span>{t("analytics.targetIncome")}</span>
          <strong>$84,000</strong>
        </div>
      </div>
    </div>
  );
}
