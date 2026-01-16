"use client";
import React, { FC, useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterAurora.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type FooterAuroraVariant = "pill" | "grid" | "compact";

export type FooterAuroraProps = {
  initialVariant?: FooterAuroraVariant;
};

export const DEFAULT_FOOTER_AURORA_PROPS: FooterAuroraProps = {
  initialVariant: "pill",
};

const FooterAurora: FC<FooterAuroraProps> = ({ initialVariant = "pill" }) => {
  const [variant, setVariant] = useState<FooterAuroraVariant>(initialVariant);
  const [isFastFocus, setIsFastFocus] = useState(true);
  const [email, setEmail] = useState("");

  const handleChangeVariant = (v: FooterAuroraVariant) => {
    setVariant(v);
  };

  const handleToggleFocus = () => {
    setIsFastFocus((prev) => !prev);
  };

  const handleNewsletter = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      if (typeof window !== "undefined") {
        window.alert("Vui lòng nhập email trước nhé ✨");
      }
      return;
    }
    if (typeof window !== "undefined") {
      window.alert(`Cảm ơn bạn! Aurora Wear sẽ gửi inspo outfit tới: ${trimmed}`);
    }
    setEmail("");
  };

  const focusLabel = isFastFocus ? "Xử lý nhanh trong hôm nay" : "Xử lý theo thứ tự thông thường";

  return (
    <footer className={styles.AfFooter} data-variant={variant}>
      <div className={styles.AfInner}>
        {/* LEFT: BRAND / TAGS */}
        <div className={styles.AfBrand}>
          <div className={styles.AfBrandRow}>
            <div className={styles.AfLogoOrb}>
              <span>Aw</span>
            </div>
            <div className={styles.AfBrandInfo}>
              <h3>Aurora Wear</h3>
              <p>Nền tảng mua sắm thời trang thông minh, hợp mood mỗi ngày.</p>
            </div>
          </div>

          <div className={styles.AfChipRow}>
            <div className={styles.AfChip}>
              <i className="bi bi-magic" aria-hidden="true" />
              <span>Gợi ý outfit theo phong cách &amp; tâm trạng</span>
            </div>
            <div className={styles.AfChip}>
              <i className="bi bi-lightning-charge" aria-hidden="true" />
              <span>Flash sale mỗi ngày • Deal độc quyền</span>
            </div>
            <div className={styles.AfChip}>
              <i className="bi bi-arrow-repeat" aria-hidden="true" />
              <span>Miễn phí đổi trả trong 7 ngày</span>
            </div>
          </div>
        </div>

        {/* MIDDLE: LINKS */}
        <div className={styles.AfLinks}>
          <div>
            <h4>Mua sắm</h4>
            <ul>
              <li>
                <a href="#">
                  <i className="bi bi-stars" aria-hidden="true" />
                  <span>Sản phẩm mới về</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-heart" aria-hidden="true" />
                  <span>Best-seller yêu thích</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-bag" aria-hidden="true" />
                  <span>Bộ sưu tập theo mùa</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-gem" aria-hidden="true" />
                  <span>Thương hiệu nổi bật</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <ul>
              <li>
                <a href="#">
                  <i className="bi bi-headset" aria-hidden="true" />
                  <span>Trung tâm trợ giúp</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-box-seam" aria-hidden="true" />
                  <span>Theo dõi đơn hàng</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-arrow-left-right" aria-hidden="true" />
                  <span>Chính sách đổi trả</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                  <span>Bảo mật &amp; điều khoản</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT: CONTROLS / NEWSLETTER / VARIANT */}
        <div className={styles.AfRight}>
          {/* Switch variant */}
          <div className={styles.AfVariantSwitcher}>
            <button className={`${styles.AfVariantBtn} ${variant === "pill" ? styles.IsActive : ""}`} type="button" onClick={() => handleChangeVariant("pill")}>
              Capsule
            </button>
            <button className={`${styles.AfVariantBtn} ${variant === "grid" ? styles.IsActive : ""}`} type="button" onClick={() => handleChangeVariant("grid")}>
              Blocks
            </button>
            <button className={`${styles.AfVariantBtn} ${variant === "compact" ? styles.IsActive : ""}`} type="button" onClick={() => handleChangeVariant("compact")}>
              Compact
            </button>
          </div>

          <button className={styles.AfFocusPill} type="button" onClick={handleToggleFocus}>
            <i className="bi bi-lightning-fill" aria-hidden="true" />
            <span>Ưu tiên đơn hàng:</span>
            <strong>{focusLabel}</strong>
          </button>

          <div className={styles.AfNewsletter}>
            <div className={styles.AfNewsletterIcon}>
              <i className="bi bi-envelope-open-heart" aria-hidden="true" />
            </div>
            <div className={styles.AfNewsletterMain}>
              <strong>Nhận ý tưởng phối đồ mỗi tuần</strong>
              <span>Một email nhẹ nhàng với outfit gợi ý, trend &amp; ưu đãi dành riêng cho bạn.</span>
              <div className={styles.AfInputWrap}>
                <input type="email" placeholder="Nhập email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="button" onClick={handleNewsletter}>
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className={styles.AfBottomRow}>
        <div className={styles.AfBottomLeft}>
          <span>
            © 2025 <strong>Aurora Wear</strong>. Mua sắm thời trang nhanh, đẹp, hợp với bạn.
          </span>
          <span>Giao hàng toàn quốc • Đổi size dễ dàng • Hỗ trợ chat 09:00 – 22:00.</span>
        </div>

        <div className={styles.AfPayments}>
          <span>Thanh toán:</span>
          <div className={styles.AfPaymentsLogos}>
            {/* Thay các src này bằng logo thật trong dự án của bạn */}
            <img src="https://via.placeholder.com/56x24?text=Visa" alt="Visa" />
            <img src="https://via.placeholder.com/56x24?text=MC" alt="Mastercard" />
            <img src="https://via.placeholder.com/56x24?text=JCB" alt="JCB" />
            <img src="https://via.placeholder.com/56x24?text=MoMo" alt="MoMo" />
            <img src="https://via.placeholder.com/56x24?text=Zalo" alt="ZaloPay" />
          </div>
        </div>

        <div className={styles.AfSocial}>
          <span>Kết nối:</span>
          <a href="#" aria-label="Facebook">
            <i className="bi bi-facebook" aria-hidden="true" />
          </a>
          <a href="#" aria-label="Instagram">
            <i className="bi bi-instagram" aria-hidden="true" />
          </a>
          <a href="#" aria-label="TikTok">
            <i className="bi bi-tiktok" aria-hidden="true" />
          </a>
          <a href="#" aria-label="Discord">
            <i className="bi bi-discord" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
};

/** RegItem để dùng trong UI Builder */
export const FOOTER_AURORA_REGITEM: RegItem = {
  kind: "FooterAurora",
  label: "Footer Aurora",
  defaults: DEFAULT_FOOTER_AURORA_PROPS,
  inspector: [],
  render: (p) => <FooterAurora {...(p as FooterAuroraProps)} />,
};

export default FooterAurora;
