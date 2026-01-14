"use client";
import styles from "./quick-cats.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type Cat = { name: string; icon: string; href?: string };
export type QuickCatsProps = { title?: string; itemsJson?: string; preview?: boolean };

export default function QuickCategories({
  title = "Danh mục nhanh",
  itemsJson = `[{"name":"Sách mới","icon":"bi-stars"},{"name":"Best seller","icon":"bi-graph-up-arrow"},{"name":"Thiếu nhi","icon":"bi-emoji-smile"},{"name":"Kinh doanh","icon":"bi-briefcase"},{"name":"Kỹ năng sống","icon":"bi-lightbulb"},{"name":"Ngoại ngữ","icon":"bi-translate"}]`,
  preview = true,
}: QuickCatsProps) {
  const items: Cat[] = (() => {
    try {
      const a = JSON.parse(itemsJson);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  })();

  return (
    <section className={styles.wrap}>
      <div className={styles.container}>
        <header className={styles.head}>
          <h2>{title}</h2>
          <a className={styles.more} href={preview ? "#" : "/categories"} onClick={(e) => preview && e.preventDefault()}>
            Xem tất cả <i className="bi bi-arrow-right" />
          </a>
        </header>
        <div className={styles.row}>
          {items.map((c, i) => (
            <a key={i} className={styles.item} href={preview ? "#" : c.href || "#"} onClick={(e) => preview && e.preventDefault()}>
              <i className={`bi ${c.icon}`} />
              <span>{c.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export const QUICK_CATS: RegItem = {
  kind: "QuickCategories",
  label: "Quick Categories",
  defaults: {
    title: "Danh mục nhanh",
  },
  inspector: [
    { key: "title", label: "Tiêu đề", kind: "text" },
    { key: "itemsJson", label: "Items (JSON)", kind: "textarea" },
  ],
  render: (p) => <QuickCategories {...p} />,
};
