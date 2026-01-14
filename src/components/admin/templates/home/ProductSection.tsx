"use client";
import styles from "./product-section.module.css";
import Image from "next/image";
import type { RegItem } from "@/lib/ui-builder/types";

export type Product = { id: string; title: string; price: number; img: string; rating?: number; tag?: "New" | "Hot" | "Sale" };
type Props = { title?: string; hint?: string; productsJson?: string; preview?: boolean };

const currency = (v: number) => v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

function Stars({ r = 0 }: { r?: number }) {
  const full = Math.floor(r);
  const half = r % 1 >= 0.5;
  return (
    <span className={styles.stars}>
      {Array.from({ length: full }).map((_, i) => (
        <i key={i} className="bi bi-star-fill" />
      ))}
      {half && <i className="bi bi-star-half" />}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
        <i key={`e${i}`} className="bi bi-star" />
      ))}
    </span>
  );
}

function ProductCard({ p }: { p: Product }) {
  return (
    <a className={styles.card} href="#">
      {p.tag && <span className={`${styles.ribbon} ${styles["r" + p.tag]}`}>{p.tag}</span>}
      <div className={styles.thumb}>
        <Image src={p.img} alt={p.title} width={420} height={560} unoptimized />
      </div>
      <div className={styles.info}>
        <h3>{p.title}</h3>
        <div className={styles.meta}>
          <Stars r={p.rating ?? 4} /> <span className={styles.price}>{currency(p.price)}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <i className="bi bi-bag-plus" />
        </button>
        <button className={styles.iconBtn}>
          <i className="bi bi-heart" />
        </button>
        <button className={styles.iconBtn}>
          <i className="bi bi-eye" />
        </button>
      </div>
    </a>
  );
}

export default function ProductSection({
  title = "Bán chạy nhất",
  hint = "Grid 2–4–6–8 card",
  productsJson = JSON.stringify(
    Array.from({ length: 8 }).map((_, i) => ({
      id: `p${i}`,
      title: `Tư duy nhanh và chậm ${i + 1}`,
      price: 189000 + i * 1000,
      img: `https://picsum.photos/seed/ps${i}/420/560`,
      rating: 4 + (i % 2 ? 0.5 : 0),
      tag: i % 3 === 0 ? "Hot" : undefined,
    }))
  ),
}: Props) {
  const products: Product[] = (() => {
    try {
      const a = JSON.parse(productsJson);
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
          {hint && (
            <div className={styles.hint}>
              <i className="bi bi-grid-3x3-gap" /> {hint}
            </div>
          )}
        </header>
        <div className={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* RegItem – tái dùng cho “Bán chạy nhất” hoặc “Vừa nhập” */
export const PRODUCT_SECTION: RegItem = {
  kind: "ProductSection",
  label: "Product Section",
  defaults: { title: "Bán chạy nhất", hint: "Grid 2–4–6–8 card" },
  inspector: [
    { key: "title", label: "Tiêu đề", kind: "text" },
    { key: "hint", label: "Gợi ý layout", kind: "text" },
    { key: "productsJson", label: "Products (JSON)", kind: "textarea" },
  ],
  render: (p) => <ProductSection {...p} />,
};
