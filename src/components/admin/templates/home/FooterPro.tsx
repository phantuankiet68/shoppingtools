"use client";
import styles from "./footer-pro.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import FooterProEditor from "@/components/admin/templates/editors/FooterProEditor";

type Link = { text: string; href?: string };
type Props = {
  addressHtml?: string;
  legalJson?: string; // Link[]
  payIcons?: string; // "credit-card,qr-code-scan,paypal,bank"
  socialsJson?: string; // Link[]
  preview?: boolean;
};

export default function FooterPro({
  addressHtml = "Bookly Co., Ltd<br/>123 Nguyễn Văn Cừ, Q.5, TP.HCM<br/><i class='bi bi-telephone'></i> 1900-1234",
  legalJson = JSON.stringify([{ text: "Pháp lý & Chính sách" }, { text: "Cộng tác viên • Đối tác" }, { text: "Về thương hiệu" }]),
  payIcons = "credit-card,qr-code-scan,paypal,bank",
  socialsJson = JSON.stringify([
    { text: "Facebook", href: "#" },
    { text: "Instagram", href: "#" },
    { text: "YouTube", href: "#" },
  ]),
  preview = true,
}: Props) {
  const legal: Link[] = (() => {
    try {
      const a = JSON.parse(legalJson);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  })();
  const socials: Link[] = (() => {
    try {
      const a = JSON.parse(socialsJson);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  })();
  const icons = payIcons
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.grid}`}>
        <div>
          <h4>Địa chỉ</h4>
          <p dangerouslySetInnerHTML={{ __html: addressHtml }} />
        </div>
        <div>
          <h4>Điều hướng phụ</h4>
          <ul className={styles.col}>
            {legal.map((l, i) => (
              <li key={i}>
                <a href={preview ? "#" : l.href || "#"} onClick={(e) => preview && e.preventDefault()}>
                  {l.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Thanh toán</h4>
          <div className={styles.pay}>
            {icons.map((k, i) => (
              <i key={i} className={`bi bi-${k}`} />
            ))}
          </div>
          <p>Hỗ trợ 4–6 cổng thanh toán phổ biến.</p>
        </div>
        <div>
          <h4>Theo dõi</h4>
          <ul className={styles.col}>
            {socials.map((l, i) => (
              <li key={i}>
                <a href={preview ? "#" : l.href || "#"} onClick={(e) => preview && e.preventDefault()}>
                  <i className="bi bi-link-45deg" /> {l.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.copy}>© {new Date().getFullYear()} Bookly • All rights reserved.</div>
    </footer>
  );
}

export const FOOTER_PRO: RegItem = {
  kind: "FooterPro",
  label: "Footer (Pro)",
  defaults: {
    addressHtml: "Bookly Co., Ltd<br/>123 Nguyễn Văn Cừ, Q.5, TP.HCM<br/><i class='bi bi-telephone'></i> 1900-1234",
    legalJson: JSON.stringify(
      [
        { text: "Pháp lý & Chính sách", href: "#" },
        { text: "Cộng tác viên • Đối tác", href: "#" },
        { text: "Về thương hiệu", href: "#" },
      ],
      null,
      2
    ),
    payIcons: "credit-card,qr-code-scan,paypal,bank",
    socialsJson: JSON.stringify(
      [
        { text: "Facebook", href: "#" },
        { text: "Instagram", href: "#" },
        { text: "YouTube", href: "#" },
      ],
      null,
      2
    ),
  },
  inspector: [],
  render: (p) => <FooterPro {...p} />,
};
