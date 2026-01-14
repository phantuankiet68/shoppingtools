"use client";

import React, { FC, useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterBright.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterBrightMode = "storeClassic" | "highlightBrand" | "ultraMinimal";

export type FooterBrightProps = {
  /** Style khởi tạo cho footer */
  initialMode?: FooterBrightMode;
};

export const DEFAULT_FOOTER_BRIGHT_PROPS: FooterBrightProps = {
  initialMode: "storeClassic",
};

const FooterBright: FC<FooterBrightProps> = ({ initialMode = "storeClassic" }) => {
  const [mode, setMode] = useState<FooterBrightMode>(initialMode);
  const [email, setEmail] = useState("");

  const handleChangeMode = (next: FooterBrightMode) => {
    setMode(next);
  };

  const handleSubscribe = () => {
    const trimmed = email.trim();

    if (!trimmed) {
      if (typeof window !== "undefined") {
        window.alert("Bạn vui lòng nhập email nhé ✨");
      }
      return;
    }

    if (typeof window !== "undefined") {
      window.alert(`Cảm ơn bạn! Aurora Wear sẽ gửi ưu đãi & lookbook tới: ${trimmed}`);
    }
    setEmail("");
  };

  return (
    <div className={styles.AwTheme} data-mode={mode}>
      <footer className={styles.AwFooter}>
        <div className={styles.AwInner}>
          {/* MODE SWITCH */}
          <div className={styles.AwModeSwitch}>
            <button className={`${styles.AwModeBtn} ${mode === "storeClassic" ? styles.IsActive : ""}`} type="button" onClick={() => handleChangeMode("storeClassic")}>
              <i className="bi bi-grid-3x3-gap-fill" aria-hidden="true" />
              <span>Store Classic</span>
            </button>
            <button className={`${styles.AwModeBtn} ${mode === "highlightBrand" ? styles.IsActive : ""}`} type="button" onClick={() => handleChangeMode("highlightBrand")}>
              <i className="bi bi-stars" aria-hidden="true" />
              <span>Highlight Brand</span>
            </button>
            <button className={`${styles.AwModeBtn} ${mode === "ultraMinimal" ? styles.IsActive : ""}`} type="button" onClick={() => handleChangeMode("ultraMinimal")}>
              <i className="bi bi-dash-lg" aria-hidden="true" />
              <span>Ultra Minimal</span>
            </button>
          </div>

          {/* TOP AREA */}
          <div className={styles.AwTop}>
            {/* Brand / Mood */}
            <section className={styles.AwBrandBlock}>
              <div className={styles.AwBadge}>
                <span className={styles.AwBadgeIcon}>
                  <i className="bi bi-stars" aria-hidden="true" />
                </span>
                <span>Aurora Wear • Fashion Everyday</span>
              </div>

              <div className={styles.AwBrandName}>
                <span>Aurora Wear</span>
                <span className={styles.AwTagline}>• Thời trang pastel 2026</span>
              </div>

              <p className={styles.AwBrandDesc}>Cửa hàng thời trang với tông màu dịu, thiết kế clean – giúp bạn mix đồ nhanh, lên outfit đẹp cho mọi mood trong tuần.</p>
            </section>

            {/* Newsletter */}
            <section className={styles.AwNewsletter}>
              <div className={styles.AwNewsletterTitle}>Nhận ưu đãi &amp; lookbook</div>
              <p>Nhập email để nhận mã giảm giá, gợi ý phối đồ và tin mới từ Aurora Wear.</p>
              <div className={styles.AwInputWrap}>
                <i className="bi bi-envelope" aria-hidden="true" />
                <input type="email" placeholder="Nhập email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="button" onClick={handleSubscribe}>
                  <span>Đăng ký</span>
                  <i className="bi bi-arrow-right-short" aria-hidden="true" />
                </button>
              </div>
            </section>
          </div>

          {/* TRUST BAR */}
          <div className={styles.AwTrust}>
            <div className={styles.AwTrustItem}>
              <span className={styles.AwTrustIcon}>
                <i className="bi bi-arrow-repeat" aria-hidden="true" />
              </span>
              <div>
                <strong>Đổi trả 7 ngày</strong>
                <span>Miễn phí 1 lần đổi size / màu</span>
              </div>
            </div>
            <div className={styles.AwTrustItem}>
              <span className={styles.AwTrustIcon}>
                <i className="bi bi-truck" aria-hidden="true" />
              </span>
              <div>
                <strong>Freeship từ 499K</strong>
                <span>Giao nhanh 2–4 ngày toàn quốc</span>
              </div>
            </div>
            <div className={styles.AwTrustItem}>
              <span className={styles.AwTrustIcon}>
                <i className="bi bi-headset" aria-hidden="true" />
              </span>
              <div>
                <strong>Hỗ trợ 8:00 – 22:00</strong>
                <span>Hotline &amp; chat trực tuyến</span>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className={styles.AwGrid}>
            {/* Col 1: about */}
            <section>
              <h4 className={styles.AwColTitle}>Về Aurora Wear</h4>
              <div className={styles.AwLinks}>
                <a href="#">Câu chuyện thương hiệu</a>
                <a href="#">Showroom &amp; cửa hàng</a>
                <a href="#">Blog phối đồ</a>
                <a href="#">Tuyển dụng</a>
              </div>
            </section>

            {/* Col 2: customer care */}
            <section>
              <h4 className={styles.AwColTitle}>Hỗ trợ khách hàng</h4>
              <div className={styles.AwLinks}>
                <a href="#">Trung tâm trợ giúp</a>
                <a href="#">Hướng dẫn mua hàng</a>
                <a href="#">Chính sách đổi trả</a>
                <a href="#">Chính sách bảo hành</a>
                <a href="#">Liên hệ hỗ trợ</a>
              </div>
            </section>

            {/* Col 3: shopping policies */}
            <section>
              <h4 className={styles.AwColTitle}>Mua sắm &amp; chính sách</h4>
              <div className={styles.AwTags}>
                <button type="button">Ưu đãi thành viên</button>
                <button type="button">Giao hàng &amp; thanh toán</button>
                <button type="button">Điều khoản sử dụng</button>
                <button type="button">Bảo mật thông tin</button>
              </div>
            </section>

            {/* Col 4: social + app */}
            <section>
              <div className={styles.AwSocial}>
                <div className={styles.AwColTitle}>Kết nối với Aurora Wear</div>
                <div className={styles.AwSocialIcons}>
                  <a href="#" aria-label="Facebook">
                    <i className="bi bi-facebook" aria-hidden="true" />
                  </a>
                  <a href="#" aria-label="Instagram">
                    <i className="bi bi-instagram" aria-hidden="true" />
                  </a>
                  <a href="#" aria-label="TikTok">
                    <i className="bi bi-tiktok" aria-hidden="true" />
                  </a>
                  <a href="#" aria-label="YouTube">
                    <i className="bi bi-youtube" aria-hidden="true" />
                  </a>
                </div>

                <div className={styles.AwAppBadge}>
                  <span className={styles.AwAppIcon}>
                    <i className="bi bi-phone" aria-hidden="true" />
                  </span>
                  <div>
                    <div>Tải app Aurora Wear</div>
                    <small>Android • iOS (sắp ra mắt)</small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* BOTTOM BAR */}
          <div className={styles.AwBottom}>
            {/* Left */}
            <div className={styles.AwBottomLeft}>
              <div className={styles.AwMiniPill}>
                <span className={styles.AwMiniDot} />
                <small>Hôm nay: freeship đơn từ 499K</small>
              </div>
              <span className={styles.AwBottomCopy}>© 2026 Aurora Wear. All rights reserved.</span>
            </div>

            {/* Center: payment */}
            <div className={styles.AwPayment}>
              <span className={styles.AwPaymentLabel}>Phương thức thanh toán:</span>
              <div className={styles.AwPaymentPill}>
                <div className={styles.AwPaymentIcons}>
                  {/* Thay src bằng đường dẫn hình thực tế */}
                  <img src="payment-visa.png" alt="Visa" />
                  <img src="payment-mastercard.png" alt="Mastercard" />
                  <img src="payment-napas.png" alt="Napas" />
                  <img src="payment-cod.png" alt="COD" />
                  <img src="payment-momo.png" alt="Momo" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/** RegItem để dùng trong UI Builder */
export const FOOTER_BRIGHT_REGITEM: RegItem = {
  kind: "FooterBright",
  label: "Footer Bright",
  defaults: DEFAULT_FOOTER_BRIGHT_PROPS,
  inspector: [],
  render: (p) => <FooterBright {...(p as FooterBrightProps)} />,
};

export default FooterBright;
