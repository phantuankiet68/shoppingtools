"use client";

import React, { FC, useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterWear.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterWearProps = Record<string, never>;

export const DEFAULT_FOOTER_WEAR_PROPS: FooterWearProps = {};

const FooterWear: FC<FooterWearProps> = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      if (typeof window !== "undefined") {
        window.alert("Bạn hãy nhập email trước nhé ✨");
      }
      return;
    }

    if (typeof window !== "undefined") {
      window.alert(`Cảm ơn bạn! Aurora Wear sẽ gửi ưu đãi tới: ${trimmed}`);
    }
    setEmail("");
  };

  return (
    <footer className={styles.AwFooter}>
      <div className={styles.AwInner}>
        <div className={styles.AwTop}>
          {/* BRAND / USP */}
          <section className={styles.AwBrand}>
            <div className={styles.AwBrandPill}>
              <div className={styles.AwBrandLeft}>
                <div className={styles.AwBrandLogo}>
                  <div className={styles.AwBrandLogoInner} />
                </div>
                <span>Aurora Wear • Fashion Store</span>
              </div>

              <div className={styles.AwBrandMainTitle}>
                <span className={styles.AwTag}>Everyday Fashion Hub</span>
              </div>
            </div>

            <p className={styles.AwBrandSub}>Nơi bạn tìm thấy mọi phong cách từ basic đến streetwear – mix &amp; match nhanh với gợi ý outfit thông minh, giao hàng toàn quốc.</p>

            <div className={styles.AwTagsRow}>
              <button className={styles.AwChip} type="button">
                <span className={styles.AwChipDot} />
                <span>New in hôm nay</span>
              </button>
              <button className={styles.AwChip} type="button">
                Gợi ý outfit AI
              </button>
              <button className={styles.AwChip} type="button">
                Lookbook mùa Hè
              </button>
              <button className={styles.AwChip} type="button">
                Ưu đãi thành viên
              </button>
            </div>
          </section>

          {/* RIGHT: MENUS + NEWSLETTER */}
          <section className={styles.AwRight}>
            {/* Menus */}
            <div className={styles.AwMenuGrid}>
              <div>
                <h4 className={styles.AwColTitle}>Mua sắm</h4>
                <nav className={styles.AwLinks}>
                  <a href="#">
                    <i className="bi bi-stars" aria-hidden="true" />
                    <span>Hàng mới về</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-lightning-charge" aria-hidden="true" />
                    <span>Flash sale hôm nay</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-bag-heart" aria-hidden="true" />
                    <span>Bộ sưu tập nổi bật</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-gem" aria-hidden="true" />
                    <span>Premium &amp; Limited</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-gift" aria-hidden="true" />
                    <span>Quà tặng &amp; combo</span>
                  </a>
                </nav>
              </div>

              <div>
                <h4 className={styles.AwColTitle}>Hỗ trợ &amp; Chính sách</h4>
                <nav className={styles.AwLinks}>
                  <a href="#">
                    <i className="bi bi-headset" aria-hidden="true" />
                    <span>Trung tâm trợ giúp</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-truck" aria-hidden="true" />
                    <span>Theo dõi đơn hàng</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-arrow-left-right" aria-hidden="true" />
                    <span>Đổi trả &amp; hoàn tiền</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-shield-check" aria-hidden="true" />
                    <span>Chính sách bảo mật</span>
                  </a>
                  <a href="#">
                    <i className="bi bi-file-earmark-text" aria-hidden="true" />
                    <span>Điều khoản sử dụng</span>
                  </a>
                </nav>
              </div>
            </div>

            {/* Newsletter + Social */}
            <div className={styles.AwNewsCard}>
              <div>
                <h4 className={styles.AwColTitle}>Nhận ưu đãi sớm</h4>
                <p>Đăng ký để nhận thông báo về flash sale, mã giảm giá độc quyền và các bộ sưu tập mới của Aurora Wear.</p>
              </div>

              <div className={styles.AwInputRow}>
                <i className="bi bi-envelope" aria-hidden="true" />
                <input type="email" placeholder="Nhập email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="button" onClick={handleSubscribe}>
                  <span>Đăng ký</span>
                  <i className="bi bi-arrow-right-short" aria-hidden="true" />
                </button>
              </div>

              <div className={styles.AwSocial}>
                <span className={styles.AwColTitle}>Kết nối với chúng tôi</span>
                <div className={styles.AwSocialRow}>
                  <a href="#" aria-label="Facebook">
                    <i className="bi bi-facebook" aria-hidden="true" />
                  </a>
                  <a href="#" aria-label="Instagram">
                    <i className="bi bi-instagram" aria-hidden="true" />
                  </a>
                  <a href="#" aria-label="TikTok">
                    <i className="bi bi-tiktok" aria-hidden="true" />
                  </a>
                  <a href="#" aria-label="Youtube">
                    <i className="bi bi-youtube" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM BAR */}
        <div className={styles.AwBottom}>
          <div className={styles.AwBottomLeft}>
            <div className={styles.AwPillSmall}>
              <span className={styles.AwPillDot} />
              <span>Ship nhanh 2–4 ngày • Đổi trả trong 7 ngày</span>
            </div>
            <span>© 2026 Aurora Wear. All rights reserved.</span>
          </div>

          {/* Payment methods */}
          <div className={styles.AwPayments}>
            <span className={styles.AwPayLabel}>Phương thức thanh toán</span>
            <div className={styles.AwPayLogos}>
              {/* Thay các src này bằng logo thật của bạn nếu cần */}
              <img src="https://via.placeholder.com/60x24?text=VISA" alt="Visa" />
              <img src="https://via.placeholder.com/60x24?text=MC" alt="Mastercard" />
              <img src="https://via.placeholder.com/70x24?text=NAPAS" alt="Napas" />
              <img src="https://via.placeholder.com/60x24?text=COD" alt="Thanh toán khi nhận" />
              <img src="https://via.placeholder.com/60x24?text=MoMo" alt="MoMo" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

/** RegItem để dùng trong UI Builder */
export const FOOTER_WEAR_REGITEM: RegItem = {
  kind: "FooterWear",
  label: "Footer Wear",
  defaults: DEFAULT_FOOTER_WEAR_PROPS,
  inspector: [],
  render: (p) => <FooterWear {...(p as FooterWearProps)} />,
};

export default FooterWear;
