"use client";

import React, { FC, useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/footer/FooterTop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type FooterTopVariant = "classic" | "split" | "minimal";

export type FooterTopProps = {
  initialVariant?: FooterTopVariant;
};

export const DEFAULT_FOOTER_TOP_PROPS: FooterTopProps = {
  initialVariant: "classic",
};

const FooterTop: FC<FooterTopProps> = ({ initialVariant = "classic" }) => {
  const [variant, setVariant] = useState<FooterTopVariant>(initialVariant);
  const [email, setEmail] = useState("");

  const handleChangeVariant = (v: FooterTopVariant) => {
    setVariant(v);
  };

  const handleSubscribe = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      if (typeof window !== "undefined") {
        window.alert("Vui lòng nhập email trước nhé 😊");
      }
      return;
    }

    if (typeof window !== "undefined") {
      window.alert(`Cảm ơn bạn! Aurora Wear sẽ gửi lookbook & ưu đãi tới: ${trimmed}`);
    }
    setEmail("");
  };

  return (
    <footer className={styles.BtFooter} data-variant={variant}>
      <div className={styles.BtInner}>
        {/* LEFT: Brand */}
        <section className={styles.BtBrand}>
          <div className={styles.BtBrandRow}>
            <div className={styles.BtLogo}>
              <span>AW</span>
            </div>
            <div className={styles.BtBrandInfo}>
              <h3>Aurora Wear</h3>
              <p>Thời trang &amp; phụ kiện – mix &amp; match outfit theo mood mỗi ngày.</p>
            </div>
          </div>

          <div className={styles.BtTagRow}>
            <div className={styles.BtTag}>
              <i className="bi bi-stars" aria-hidden="true" />
              <span>New drop mỗi tuần</span>
            </div>
            <div className={styles.BtTag}>
              <i className="bi bi-lightning-charge" aria-hidden="true" />
              <span>Flash sale giờ vàng</span>
            </div>
            <div className={styles.BtTag}>
              <i className="bi bi-bag-heart" aria-hidden="true" />
              <span>Wishlist &amp; lookbook cá nhân</span>
            </div>
          </div>
        </section>

        {/* MIDDLE: Links */}
        <section className={styles.BtLinks}>
          <div>
            <h4>Bộ sưu tập</h4>
            <ul>
              <li>
                <a href="#">
                  <i className="bi bi-sun" aria-hidden="true" />
                  <span>New Arrival &amp; Summer drop</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-droplet-half" aria-hidden="true" />
                  <span>Basic tee &amp; áo thun unisex</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-suit-heart" aria-hidden="true" />
                  <span>Đầm, váy &amp; jumpsuit</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-lightning-fill" aria-hidden="true" />
                  <span>Hot deal hôm nay</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Hỗ trợ &amp; dịch vụ</h4>
            <ul>
              <li>
                <a href="#">
                  <i className="bi bi-question-circle" aria-hidden="true" />
                  <span>Trung tâm trợ giúp</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-arrow-left-right" aria-hidden="true" />
                  <span>Đổi size &amp; đổi mẫu</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-truck" aria-hidden="true" />
                  <span>Vận chuyển &amp; theo dõi đơn</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-file-earmark-text" aria-hidden="true" />
                  <span>Điều khoản &amp; bảo mật</span>
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* RIGHT: Switcher + Hotline + Newsletter */}
        <section className={styles.BtRight}>
          <div className={styles.BtSwitcher}>
            <button
              type="button"
              className={`${styles.BtSwitchBtn} ${variant === "classic" ? styles.IsActive : ""}`}
              onClick={() => handleChangeVariant("classic")}
            >
              Classic
            </button>
            <button
              type="button"
              className={`${styles.BtSwitchBtn} ${variant === "split" ? styles.IsActive : ""}`}
              onClick={() => handleChangeVariant("split")}
            >
              Editorial
            </button>
            <button
              type="button"
              className={`${styles.BtSwitchBtn} ${variant === "minimal" ? styles.IsActive : ""}`}
              onClick={() => handleChangeVariant("minimal")}
            >
              Compact
            </button>
          </div>

          <div className={styles.BtHotlinePill}>
            <i className="bi bi-headset" aria-hidden="true" />
            <span>
              Hotline hỗ trợ: <strong>1900 6868</strong>
            </span>
          </div>

          <div className={styles.BtNewsletter}>
            <div className={styles.BtNewsIcon}>
              <i className="bi bi-envelope-paper-heart" aria-hidden="true" />
            </div>
            <div className={styles.BtNewsMain}>
              <strong>Nhận lookbook &amp; mã giảm giá</strong>
              <span>Gửi 1–2 email/tuần, đúng style bạn theo dõi.</span>
              <div className={styles.BtInputRow}>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="button" onClick={handleSubscribe}>
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom */}
      <div className={styles.BtBottom}>
        <div className={styles.BtBottomLeft}>
          <span>© 2025 Aurora Wear. Mặc đẹp, tự tin và là chính bạn mỗi ngày.</span>
        </div>

        <div className={styles.BtSocial}>
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
        </div>

        <div className={styles.BtPayments}>
          <span>Thanh toán an toàn:</span>
          <div className={styles.BtPayLogos}>
            {/* Thay bằng logo thật trong project của bạn */}
            <img src="https://via.placeholder.com/52x20?text=VISA" alt="Visa" />
            <img src="https://via.placeholder.com/52x20?text=MC" alt="Mastercard" />
            <img src="https://via.placeholder.com/52x20?text=MOMO" alt="Momo" />
            <img src="https://via.placeholder.com/52x20?text=ZaloPay" alt="ZaloPay" />
          </div>
        </div>
      </div>
    </footer>
  );
};

/** RegItem dùng trong UI Builder (nếu bạn có hệ thống giống mẫu) */
export const FOOTER_TOP_REGITEM: RegItem = {
  kind: "FooterTop",
  label: "Footer Top",
  defaults: DEFAULT_FOOTER_TOP_PROPS,
  inspector: [],
  render: (p) => <FooterTop {...(p as FooterTopProps)} />,
};

export default FooterTop;
