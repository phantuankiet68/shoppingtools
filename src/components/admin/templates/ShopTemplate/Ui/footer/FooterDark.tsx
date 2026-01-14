"use client";

import React, { FC, useState } from "react";

import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterDark.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterDarkProps = Record<string, never>;

export const DEFAULT_FOOTER_DARK_PROPS: FooterDarkProps = {};

const FooterDark: FC<FooterDarkProps> = () => {
  const [layout, setLayout] = useState<"default" | "compact" | "minimal">("default");
  const [theme, setTheme] = useState<"cyan" | "magenta" | "emerald">("cyan");

  const handleSocialClick = (social: string) => {
    if (typeof window !== "undefined") {
      console.log("Open social:", social);
    }
  };

  const handleLayoutChange = (value: "default" | "compact" | "minimal") => {
    setLayout(value);
  };

  const handleThemeChange = (value: "cyan" | "magenta" | "emerald") => {
    setTheme(value);
  };

  return (
    <footer className={styles.abFooter} data-layout={layout} data-theme={theme}>
      <div className={styles.abWrap}>
        {/* LEFT */}
        <div className={styles.abLeft}>
          <div className={styles.abBrandRow}>
            <div className={styles.abLogo}>
              <div className={styles.abLogoInner}>
                <i className="bi bi-lightning-charge" aria-hidden="true" />
              </div>
            </div>
            <div className={styles.abBrandText}>
              <div className={styles.abBrandTitle}>AURORA WEAR</div>
              <div className={styles.abBrandSub}>Nền tảng thời trang trực tuyến với trải nghiệm mua sắm nhanh, đẹp và thông minh.</div>
            </div>
          </div>

          <div className={styles.abChipRow}>
            <div className={styles.abChip}>
              <i className="bi bi-truck" aria-hidden="true" />
              Giao nhanh trong 2h tại nội thành
            </div>
            <div className={styles.abChip}>
              <i className="bi bi-arrow-repeat" aria-hidden="true" />
              Miễn phí đổi trả trong 30 ngày
            </div>
            <div className={`${styles.abChip} ${styles.abChipHot}`}>
              <i className="bi bi-stars" aria-hidden="true" />
              Aurora Club – Thành viên nhận ưu đãi riêng
            </div>
          </div>

          <div className={styles.abCtaRow}>
            <button type="button" className={styles.abBtnPrimary}>
              <i className="bi bi-bag-heart" aria-hidden="true" />
              Bắt đầu mua sắm ngay
            </button>
            <button type="button" className={styles.abBtnOutline}>
              <i className="bi bi-gift" aria-hidden="true" />
              Xem ưu đãi hôm nay
            </button>
            <span className={styles.abSmallNote}>Miễn phí vận chuyển cho đơn từ 499k • Hỗ trợ đổi size nếu không vừa</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.abRight}>
          <div className={styles.abCols}>
            <div>
              <div className={styles.abColTitle}>Mua sắm</div>
              <ul className={styles.abList}>
                <li>
                  <a href="#">Thời trang nữ</a>
                </li>
                <li>
                  <a href="#">Thời trang nam</a>
                </li>
                <li>
                  <a href="#">Đồ thể thao</a>
                </li>
                <li>
                  <a href="#">Giày &amp; phụ kiện</a>
                </li>
              </ul>
            </div>
            <div>
              <div className={styles.abColTitle}>Dịch vụ khách hàng</div>
              <ul className={styles.abList}>
                <li>
                  <a href="#">Trung tâm hỗ trợ</a>
                </li>
                <li>
                  <a href="#">Hướng dẫn đặt hàng</a>
                </li>
                <li>
                  <a href="#">Chính sách đổi trả</a>
                </li>
                <li>
                  <a href="#">Liên hệ &amp; góp ý</a>
                </li>
              </ul>
            </div>
            <div>
              <div className={styles.abColTitle}>Về Aurora Wear</div>
              <ul className={styles.abList}>
                <li>
                  <a href="#">Câu chuyện thương hiệu</a>
                </li>
                <li>
                  <a href="#">Tuyển dụng</a>
                </li>
                <li>
                  <a href="#">Blog xu hướng</a>
                </li>
                <li>
                  <a href="#">Đối tác &amp; hợp tác</a>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.abStatusCard}>
            <div className={styles.abStatusHeader}>
              <span className={styles.abStatusPill}>
                <span className={styles.abDot} />
                Săn sale đang diễn ra
              </span>
              <span className={styles.abUptime}>Đã bán 1.203 sản phẩm hôm nay</span>
            </div>
            <div className={styles.abBar}>
              <div className={styles.abBarFill} />
            </div>
            <div className={styles.abStatusFooter}>
              <span>
                Số suất ưu đãi còn lại: <strong>37/1.240</strong>
              </span>
              <div className={styles.abMiniActions}>
                <button type="button" className={styles.abMiniBtn}>
                  <i className="bi bi-lightning" aria-hidden="true" />
                  Xem Flash Sale
                </button>
                <button type="button" className={styles.abMiniBtn}>
                  <i className="bi bi-bell" aria-hidden="true" />
                  Nhận thông báo
                </button>
              </div>
            </div>
            <div className={styles.abSocialRow}>
              <button type="button" className={styles.abSocialBtn} aria-label="Facebook" onClick={() => handleSocialClick("facebook")}>
                <i className="bi bi-facebook" aria-hidden="true" />
              </button>
              <button type="button" className={styles.abSocialBtn} aria-label="Instagram" onClick={() => handleSocialClick("instagram")}>
                <i className="bi bi-instagram" aria-hidden="true" />
              </button>
              <button type="button" className={styles.abSocialBtn} aria-label="TikTok" onClick={() => handleSocialClick("tiktok")}>
                <i className="bi bi-tiktok" aria-hidden="true" />
              </button>
              <button type="button" className={styles.abSocialBtn} aria-label="YouTube" onClick={() => handleSocialClick("youtube")}>
                <i className="bi bi-youtube" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={styles.abPaymentRow}>
            <span className={styles.abPaymentLabel}>PHƯƠNG THỨC THANH TOÁN</span>
            <div className={styles.abPaymentLogos}>
              <span className={`${styles.abPaymentLogo} ${styles.payVisa}`}>VISA</span>
              <span className={`${styles.abPaymentLogo} ${styles.payMastercard}`}>Mastercard</span>
              <span className={`${styles.abPaymentLogo} ${styles.payNapas}`}>NAPAS</span>
              <span className={`${styles.abPaymentLogo} ${styles.payCod}`}>COD</span>
              <span className={`${styles.abPaymentLogo} ${styles.payMomo}`}>MoMo</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM LINE */}
      <div className={styles.abBottom}>
        <div className={styles.abBottomLeft}>
          <span>© 2025 Aurora Wear Commerce.</span>
          <div className={styles.abBottomLinks}>
            <a href="#">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#">Chính sách bảo mật</a>
            <span>•</span>
            <a href="#">Trạng thái hệ thống</a>
          </div>
        </div>

        <div className={styles.abBottomRight}>
          {/* layout toggle */}
          <div className={styles.abToggleGroup}>
            <button type="button" className={layout === "default" ? `${styles.abToggleButton} ${styles.abToggleButtonActive}` : styles.abToggleButton} onClick={() => handleLayoutChange("default")}>
              Default
            </button>
            <button type="button" className={layout === "compact" ? `${styles.abToggleButton} ${styles.abToggleButtonActive}` : styles.abToggleButton} onClick={() => handleLayoutChange("compact")}>
              Compact
            </button>
            <button type="button" className={layout === "minimal" ? `${styles.abToggleButton} ${styles.abToggleButtonActive}` : styles.abToggleButton} onClick={() => handleLayoutChange("minimal")}>
              Minimal
            </button>
          </div>

          {/* theme toggle */}
          <div className={styles.abToggleGroup}>
            <button type="button" className={theme === "cyan" ? `${styles.abToggleButton} ${styles.abToggleButtonActive}` : styles.abToggleButton} onClick={() => handleThemeChange("cyan")}>
              Cyan
            </button>
            <button type="button" className={theme === "magenta" ? `${styles.abToggleButton} ${styles.abToggleButtonActive}` : styles.abToggleButton} onClick={() => handleThemeChange("magenta")}>
              Magenta
            </button>
            <button type="button" className={theme === "emerald" ? `${styles.abToggleButton} ${styles.abToggleButtonActive}` : styles.abToggleButton} onClick={() => handleThemeChange("emerald")}>
              Emerald
            </button>
          </div>

          {/* ticker */}
          <div className={styles.abTicker}>
            <span className={styles.abTickerLabel}>Aurora Updates</span>
            <span className={styles.abTickerTrack}>Deal 12.12 • Giảm đến 70% toàn bộ áo khoác • Miễn phí vận chuyển đơn từ 499k • Thành viên Aurora Club nhận voucher độc quyền mỗi tuần •</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const FOOTER_DARK_REGITEM: RegItem = {
  kind: "FooterDark",
  label: "Footer Dark",
  defaults: DEFAULT_FOOTER_DARK_PROPS,
  inspector: [],
  render: (p) => <FooterDark {...(p as FooterDarkProps)} />,
};

export default FooterDark;
