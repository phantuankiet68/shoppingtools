"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import styles from "./hero-pro.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import type { Route } from "next";

export type HeroProps = {
  kicker?: string;
  title?: string;
  bulletsJson?: string; // ["điểm 1","điểm 2",...]
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  image?: string;
  preview?: boolean; // chặn điều hướng khi ở canvas
};

export default function HeroPro({
  kicker = "Ưu đãi tháng này",
  title = "Khơi mở trí tuệ — Chọn đúng cuốn sách cho hành trình của bạn",
  bulletsJson = `["Sách chính hãng • Bảo quản tốt","Giao nhanh 2–24h nội thành","Thanh toán an toàn, đa kênh"]`,
  ctaPrimaryLabel = "Bán chạy nhất",
  ctaPrimaryHref = "/#best",
  ctaSecondaryLabel = "Vừa nhập",
  ctaSecondaryHref = "/#new",
  image = "https://picsum.photos/seed/hero/840/600",
  preview = false,
}: HeroProps) {
  const bullets = useMemo<string[]>(() => {
    try {
      const a = JSON.parse(bulletsJson);
      return Array.isArray(a) ? a.slice(0, 6) : [];
    } catch {
      return [];
    }
  }, [bulletsJson]);

  const Stop = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const Primary = preview ? (
    <button className={styles.btnPrimary} onClick={Stop} type="button">
      {ctaPrimaryLabel}
    </button>
  ) : (
    <Link className={styles.btnPrimary} href={(ctaPrimaryHref || "/") as Route}>
      {ctaPrimaryLabel}
    </Link>
  );

  const Secondary = preview ? (
    <button className={styles.btnGhost} onClick={Stop} type="button">
      {ctaSecondaryLabel}
    </button>
  ) : (
    <Link className={styles.btnGhost} href={(ctaSecondaryHref || "/") as Route}>
      {ctaSecondaryLabel}
    </Link>
  );

  return (
    <section className={styles.hero}>
      <div className={`${styles.container} ${styles.heroInner}`}>
        <div className={styles.heroText}>
          {kicker && <p className={styles.kicker}>{kicker}</p>}
          <h1 className={styles.h1}>{title}</h1>
          {!!bullets.length && (
            <ul className={styles.bullets}>
              {bullets.map((b, i) => (
                <li key={i}>
                  <i className="bi bi-patch-check" /> {b}
                </li>
              ))}
            </ul>
          )}
          <div className={styles.heroCtas}>
            {Primary}
            {Secondary}
          </div>
        </div>
        <div className={styles.heroImg} aria-hidden>
          <Image src={image} alt="" width={840} height={600} unoptimized />
        </div>
      </div>
    </section>
  );
}

/* ===== RegItem ===== */
export const HERO_PRO: RegItem = {
  kind: "HeroPro",
  label: "Hero (Pro)",
  defaults: {
    kicker: "Ưu đãi tháng này",
    title: "Khơi mở trí tuệ — Chọn đúng cuốn sách cho hành trình của bạn",
    bulletsJson: `["Sách chính hãng • Bảo quản tốt","Giao nhanh 2–24h nội thành","Thanh toán an toàn, đa kênh"]`,
    ctaPrimaryLabel: "Bán chạy nhất",
    ctaPrimaryHref: "/#best",
    ctaSecondaryLabel: "Vừa nhập",
    ctaSecondaryHref: "/#new",
    image: "https://picsum.photos/seed/hero/840/600",
  },
  inspector: [
    { key: "kicker", label: "Kicker", kind: "text" },
    { key: "title", label: "Tiêu đề (H1)", kind: "textarea" },
    { key: "bulletsJson", label: "Bullets (JSON array)", kind: "textarea" },
    { key: "ctaPrimaryLabel", label: "CTA 1 Label", kind: "text" },
    { key: "ctaPrimaryHref", label: "CTA 1 Href", kind: "text" },
    { key: "ctaSecondaryLabel", label: "CTA 2 Label", kind: "text" },
    { key: "ctaSecondaryHref", label: "CTA 2 Href", kind: "text" },
    { key: "image", label: "Hero Image URL", kind: "text" },
  ],
  render: (p) => <HeroPro {...p} preview />,
};
