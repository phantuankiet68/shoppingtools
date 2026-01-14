"use client";
import { useState } from "react";
import styles from "./newsletter-cta.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export default function NewsletterCTA({
  title = "Nhận tin mới & mã giảm đến 20%",
  desc = "Đăng ký newsletter để không bỏ lỡ ưu đãi.",
  placeholder = "Nhập email của bạn",
  btnLabel = "Đăng ký",
}: {
  title?: string;
  desc?: string;
  placeholder?: string;
  btnLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  return (
    <section className={styles.wrap}>
      <div className={`${styles.container} ${styles.inner}`}>
        <div className={styles.text}>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            setOk(true);
          }}>
          <i className="bi bi-envelope" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} />
          <button className={styles.btnPrimary}>{btnLabel}</button>
        </form>
        {ok && (
          <p className={styles.ok}>
            <i className="bi bi-check2-circle" /> Cảm ơn! Hãy kiểm tra hộp thư.
          </p>
        )}
      </div>
    </section>
  );
}

export const NEWSLETTER_CTA: RegItem = {
  kind: "NewsletterCTA",
  label: "Newsletter CTA",
  defaults: {},
  inspector: [
    { key: "title", label: "Tiêu đề", kind: "text" },
    { key: "desc", label: "Mô tả", kind: "textarea" },
    { key: "placeholder", label: "Placeholder", kind: "text" },
    { key: "btnLabel", label: "Nút", kind: "text" },
  ],
  render: (p) => <NewsletterCTA {...p} />,
};
