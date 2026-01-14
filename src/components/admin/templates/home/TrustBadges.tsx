"use client";
import styles from "./trust-badges.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type Badge = { icon: string; title: string; text: string };
export type TrustBadgesProps = { itemsJson?: string; preview?: boolean };

export default function TrustBadges({
  itemsJson = `[{"icon":"bi-shield-check","title":"Chính hãng","text":"Nguồn xuất bản uy tín"},{"icon":"bi-box-seam","title":"Đóng gói chuẩn","text":"Chống sốc – chống ẩm"},{"icon":"bi-cash-stack","title":"Giá tốt","text":"Nhiều mã giảm & combo"},{"icon":"bi-headset","title":"Hỗ trợ 24/7","text":"Tư vấn tận tâm"}]`,
}: TrustBadgesProps) {
  const items: Badge[] = (() => {
    try {
      const a = JSON.parse(itemsJson);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  })();

  return (
    <section className={styles.wrap}>
      <div className={`${styles.container} ${styles.grid}`}>
        {items.map((b, i) => (
          <div key={i} className={styles.card}>
            <i className={`bi ${b.icon}`} />
            <div>
              <strong>{b.title}</strong>
              <p>{b.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const TRUST_BADGES: RegItem = {
  kind: "TrustBadges",
  label: "Trust Badges",
  defaults: {
    itemsJson: `[{"icon":"bi-shield-check","title":"Chính hãng","text":"Nguồn xuất bản uy tín"},{"icon":"bi-box-seam","title":"Đóng gói chuẩn","text":"Chống sốc – chống ẩm"},{"icon":"bi-cash-stack","title":"Giá tốt","text":"Nhiều mã giảm & combo"},{"icon":"bi-headset","title":"Hỗ trợ 24/7","text":"Tư vấn tận tâm"}]`,
  },
  inspector: [{ key: "itemsJson", label: "Items (JSON)", kind: "textarea" }],
  render: (p) => <TrustBadges {...p} />,
};
