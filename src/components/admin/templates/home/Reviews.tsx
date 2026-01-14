"use client";
import styles from "./reviews.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
type Rev = { name: string; rating: number; text: string };
export default function Reviews({
  itemsJson = JSON.stringify([
    { name: "Minh Anh", rating: 5, text: "Đóng gói đẹp, giao nhanh, sách mới 100%." },
    { name: "Quốc Việt", rating: 4.5, text: "Giá tốt, hay có mã giảm. Sẽ ủng hộ tiếp!" },
    { name: "Lan Phương", rating: 5, text: "CSKH nhiệt tình, tư vấn đúng nhu cầu." },
  ]),
  title = "Reviews",
}: {
  itemsJson?: string;
  title?: string;
}) {
  const items: Rev[] = (() => {
    try {
      const a = JSON.parse(itemsJson);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  })();
  const Stars = (r: number) => {
    const f = Math.floor(r),
      h = r % 1 >= 0.5;
    return (
      <span>
        {Array.from({ length: f }).map((_, i) => (
          <i key={i} className="bi bi-star-fill" />
        ))}
        {h && <i className="bi bi-star-half" />}
        {Array.from({ length: 5 - f - (h ? 1 : 0) }).map((_, i) => (
          <i key={`e${i}`} className="bi bi-star" />
        ))}
      </span>
    );
  };
  return (
    <section className={styles.wrap}>
      <div className={styles.container}>
        <header className={styles.head}>
          <h2>{title}</h2>
        </header>
        <div className={styles.grid}>
          {items.map((r, i) => (
            <figure key={i} className={styles.card}>
              <figcaption>
                <strong>{r.name}</strong>
                <span className={styles.stars}>{Stars(r.rating)}</span>
              </figcaption>
              <blockquote>{r.text}</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export const REVIEWS_PRO: RegItem = {
  kind: "Reviews",
  label: "Reviews",
  defaults: {},
  inspector: [
    { key: "title", label: "Tiêu đề", kind: "text" },
    { key: "itemsJson", label: "Items (JSON)", kind: "textarea" },
  ],
  render: (p) => <Reviews {...p} />,
};
