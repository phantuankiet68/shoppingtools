"use client";

import React, { FC, useState } from "react";

import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterDarkOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
export type FooterDarkOneProps = Record<string, never>;

export const DEFAULT_FOOTER_DARK_ONE_PROPS: FooterDarkOneProps = {};

const FooterDarkOne: FC<FooterDarkOneProps> = () => {
  const [theme, setTheme] = useState<"blue" | "mint" | "peach">("blue");

  const handleThemeChange = (value: "blue" | "mint" | "peach") => {
    setTheme(value);
  };

  const handleSocialClick = (social: string) => {
    if (typeof window !== "undefined") {
      console.log("Open social:", social);
    }
  };

  return (
    <footer className={styles.awFooter} data-theme={theme}>
      <div className={styles.awWrap}>
        <div className={styles.awInner}>
          {/* LEFT */}
          <div className={styles.awLeft}>
            <div className={styles.awBrandRow}>
              <div className={styles.awLogo}>
                <i className="bi bi-bag-heart-fill" aria-hidden="true" />
              </div>
              <div className={styles.awBrandText}>
                <div className={styles.awBrandTitle}>Aurora Fashion</div>
                <div className={styles.awBrandSub}>Thời trang mỗi ngày • Giao nhanh • Đổi trả dễ dàng.</div>
              </div>
            </div>

            <div className={styles.awPillRow}>
              <div className={styles.awPill}>
                <i className="bi bi-stars" aria-hidden="true" />
                Hàng chính hãng 100%
              </div>
              <div className={styles.awPill}>
                <i className="bi bi-truck" aria-hidden="true" />
                Miễn phí giao từ 499K
              </div>
              <div className={`${styles.awPill} ${styles.awPillHot}`}>
                <i className="bi bi-heart-pulse-fill" aria-hidden="true" />
                Bộ sưu tập Xuân – Hè 2025
              </div>
            </div>

            {/* Newsletter */}
            <div className={styles.awNewsletter}>
              <div className={styles.awNewsletterHeader}>
                <div>
                  <div className={styles.awNewsletterTitle}>Nhận ưu đãi riêng cho thành viên</div>
                  <div className={styles.awNewsletterText}>Đăng ký email để nhận mã giảm giá, lookbook &amp; trend mới nhất mỗi tuần.</div>
                </div>
                <div className={styles.awNewsletterBadge}>
                  <i className="bi bi-envelope-heart" aria-hidden="true" />
                  -15% đơn đầu tiên
                </div>
              </div>
              <form className={styles.awNewsletterForm} onSubmit={(e) => e.preventDefault()}>
                <input type="email" className={styles.awInput} placeholder="Nhập email của bạn" />
                <button type="button" className={styles.awBtnPrimary}>
                  <i className="bi bi-send-fill" aria-hidden="true" />
                  Đăng ký ngay
                </button>
              </form>
              <span className={styles.awSmallNote}>
                Bằng cách đăng ký, bạn đồng ý với <strong>Chính sách bảo mật</strong> của chúng tôi.
              </span>
            </div>

            {/* Social */}
            <div className={styles.awSocialRow}>
              <span className={styles.awSocialLabel}>Kết nối với Aurora Fashion:</span>
              <div className={styles.awSocialIcons}>
                <button type="button" className={styles.awSocialBtn} aria-label="Facebook" onClick={() => handleSocialClick("facebook")}>
                  <i className="bi bi-facebook" aria-hidden="true" />
                </button>
                <button type="button" className={styles.awSocialBtn} aria-label="Instagram" onClick={() => handleSocialClick("instagram")}>
                  <i className="bi bi-instagram" aria-hidden="true" />
                </button>
                <button type="button" className={styles.awSocialBtn} aria-label="Tiktok" onClick={() => handleSocialClick("tiktok")}>
                  <i className="bi bi-tiktok" aria-hidden="true" />
                </button>
                <button type="button" className={styles.awSocialBtn} aria-label="Youtube" onClick={() => handleSocialClick("youtube")}>
                  <i className="bi bi-youtube" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.awRight}>
            <div className={styles.awCols}>
              <div>
                <div className={styles.awColTitle}>Mua sắm</div>
                <ul className={styles.awList}>
                  <li>
                    <a href="#">Nữ • Dresses &amp; Skirts</a>
                  </li>
                  <li>
                    <a href="#">Nam • Áo thun &amp; Hoodie</a>
                  </li>
                  <li>
                    <a href="#">Unisex • Streetwear</a>
                  </li>
                  <li>
                    <a href="#">Giày &amp; Phụ kiện</a>
                  </li>
                </ul>
              </div>
              <div>
                <div className={styles.awColTitle}>Hỗ trợ</div>
                <ul className={styles.awList}>
                  <li>
                    <a href="#">Trung tâm trợ giúp</a>
                  </li>
                  <li>
                    <a href="#">Chính sách đổi trả</a>
                  </li>
                  <li>
                    <a href="#">Giao hàng &amp; thanh toán</a>
                  </li>
                  <li>
                    <a href="#">Liên hệ Aurora</a>
                  </li>
                </ul>
              </div>
              <div>
                <div className={styles.awColTitle}>Về chúng tôi</div>
                <ul className={styles.awList}>
                  <li>
                    <a href="#">Câu chuyện thương hiệu</a>
                  </li>
                  <li>
                    <a href="#">Tuyển dụng</a>
                  </li>
                  <li>
                    <a href="#">Blog / Lookbook</a>
                  </li>
                  <li>
                    <a href="#">Chương trình đại lý</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.awStatusCard}>
              <div className={styles.awStatusTop}>
                <span className={styles.awStatusPill}>
                  <i className="bi bi-shield-check" aria-hidden="true" />
                  Mua sắm an toàn
                </span>
                <span className={styles.awUptime}>Đánh giá 4.9/5 từ khách hàng</span>
              </div>
              <div className={styles.awStatusText}>
                Đơn hàng <strong>được đóng gói kỹ</strong>, kiểm tra trước khi nhận. Hỗ trợ đổi size trong <strong>7 ngày</strong>.
              </div>
              <div className={styles.awMiniBadges}>
                <span className={styles.awMiniBadge}>
                  <i className="bi bi-box-seam" aria-hidden="true" />
                  Giao nhanh toàn quốc
                </span>
                <span className={styles.awMiniBadge}>
                  <i className="bi bi-arrow-repeat" aria-hidden="true" />
                  Đổi trả dễ dàng
                </span>
                <span className={styles.awMiniBadge}>
                  <i className="bi bi-headset" aria-hidden="true" />
                  CSKH 8:00–22:00
                </span>
              </div>

              {/* Payment methods */}
              <div className={styles.awPaymentBlock}>
                <div className={styles.awPaymentLabel}>
                  <i className="bi bi-credit-card-2-front" aria-hidden="true" />
                  Phương thức thanh toán
                </div>
                <div className={styles.awPaymentLogos}>
                  {/* Thay src bằng đường dẫn thực tế đến logo của bạn */}
                  <img src="images/payments-visa.png" alt="Visa" />
                  <img src="images/payments-mastercard.png" alt="Mastercard" />
                  <img src="images/payments-napas.png" alt="Napas" />
                  <img src="images/payments-cod.png" alt="Thanh toán COD" />
                  <img src="images/payments-momo.png" alt="MoMo" />
                </div>
              </div>
            </div>
          </div>
          {/* END RIGHT */}
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.awBottom}>
        <div className={styles.awBottomLeft}>
          <span>© 2025 Aurora Fashion. All rights reserved.</span>
          <div className={styles.awBottomLinks}>
            <a href="#">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#">Chính sách bảo mật</a>
            <span>•</span>
            <a href="#">Cài đặt cookie</a>
          </div>
        </div>

        <div className={styles.awBottomRight}>
          <div className={styles.awToggleGroup}>
            <button type="button" className={theme === "blue" ? `${styles.awToggleButton} ${styles.awToggleButtonActive}` : styles.awToggleButton} onClick={() => handleThemeChange("blue")}>
              Soft Blue
            </button>
            <button type="button" className={theme === "mint" ? `${styles.awToggleButton} ${styles.awToggleButtonActive}` : styles.awToggleButton} onClick={() => handleThemeChange("mint")}>
              Fresh Mint
            </button>
            <button type="button" className={theme === "peach" ? `${styles.awToggleButton} ${styles.awToggleButtonActive}` : styles.awToggleButton} onClick={() => handleThemeChange("peach")}>
              Warm Peach
            </button>
          </div>

          <div className={styles.awTicker}>
            <span className={styles.awTickerLabel}>NEWS</span>
            <span className={styles.awTickerTrack}>BST Xuân – Hè 2025 đã lên kệ • Giảm thêm 10% khi thanh toán bằng thẻ • Freeship đơn từ 499K •</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const FOOTER_DARK_ONE_REGITEM: RegItem = {
  kind: "FooterDarkOne",
  label: "Footer Dark One",
  defaults: DEFAULT_FOOTER_DARK_ONE_PROPS,
  inspector: [],
  render: (p) => <FooterDarkOne {...(p as FooterDarkOneProps)} />,
};

export default FooterDarkOne;
