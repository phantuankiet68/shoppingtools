"use client";

import React, { FC, useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterFashion.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterFashionMode = "fashionGrid" | "boutiqueShell" | "minimalBar";
export type FooterFashionViewMode = "content" | "summary";

export type FooterFashionProps = {
  initialMode?: FooterFashionMode;
  initialViewMode?: FooterFashionViewMode;
};

export const DEFAULT_FOOTER_FASHION_PROPS: FooterFashionProps = {
  initialMode: "fashionGrid",
  initialViewMode: "content",
};

const FooterFashion: FC<FooterFashionProps> = ({ initialMode = "fashionGrid", initialViewMode = "content" }) => {
  const [mode, setMode] = useState<FooterFashionMode>(initialMode);
  const [viewMode, setViewMode] = useState<FooterFashionViewMode>(initialViewMode);
  const [email, setEmail] = useState("");

  const handleChangeMode = (next: FooterFashionMode) => {
    setMode(next);
  };

  const handleChangeViewMode = (next: FooterFashionViewMode) => {
    setViewMode(next);
    // Sau này nếu bạn muốn lọc nội dung thật thì gắn logic ở đây
  };

  const handleSubscribe = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      if (typeof window !== "undefined") {
        window.alert("Bạn vui lòng nhập email trước nhé ✨");
      }
      return;
    }

    if (typeof window !== "undefined") {
      window.alert(`Đã đăng ký nhận ưu đãi & lookbook Aurora Blue cho: ${trimmed}`);
    }
    setEmail("");
  };

  return (
    <div className={styles.AbTheme} data-mode={mode}>
      <footer className={styles.AbFooter}>
        <div className={styles.AbInner}>
          {/* MODE SWITCH */}
          <div className={styles.AbModeSwitch}>
            <button type="button" className={`${styles.AbModeBtn} ${mode === "fashionGrid" ? styles.IsActive : ""}`} onClick={() => handleChangeMode("fashionGrid")}>
              <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
              <span>Fashion Grid</span>
            </button>
            <button type="button" className={`${styles.AbModeBtn} ${mode === "boutiqueShell" ? styles.IsActive : ""}`} onClick={() => handleChangeMode("boutiqueShell")}>
              <i className="bi bi-layers" aria-hidden="true" />
              <span>Boutique Shell</span>
            </button>
            <button type="button" className={`${styles.AbModeBtn} ${mode === "minimalBar" ? styles.IsActive : ""}`} onClick={() => handleChangeMode("minimalBar")}>
              <i className="bi bi-sliders2" aria-hidden="true" />
              <span>Minimal Bar</span>
            </button>
          </div>

          {/* MAIN GRID */}
          <div className={styles.AbGrid}>
            {/* COL 1: BRAND / STORE INFO */}
            <section className={styles.AbBrand}>
              <div className={styles.AbBadge}>
                <span className={styles.AbBadgeIcon}>
                  <i className="bi bi-stars" aria-hidden="true" />
                </span>
                <span>Aurora Blue • Fashion Hub</span>
              </div>

              <div className={styles.AbBrandTitle}>
                <span>Aurora Blue Wardrobe</span>
                <span className={styles.AbBrandTag}>Outfit &amp; bộ sưu tập mới</span>
              </div>

              {/* METRICS */}
              <section className={styles.AbMetricsSection}>
                <div className={styles.AbMetrics}>
                  <div className={styles.AbMetricCard}>
                    <div className={styles.AbMetricLabel}>Sản phẩm đang hiển thị</div>
                    <div className={styles.AbMetricValue}>3.2k+</div>
                    <div className={styles.AbMetricChip}>Cập nhật mỗi giờ</div>
                  </div>
                  <div className={styles.AbMetricCard}>
                    <div className={styles.AbMetricLabel}>Outfit đã phối</div>
                    <div className={styles.AbMetricValue}>18.9k</div>
                    <div className={styles.AbMetricChip}>+240 look hôm nay</div>
                  </div>
                </div>
              </section>

              {/* STORE META */}
              <div className={styles.AbStoreMeta}>
                <div className={styles.AbStoreMetaItem}>
                  <i className="bi bi-telephone" aria-hidden="true" />
                  <div>
                    <span className={styles.AbStoreMetaLabel}>Hotline</span>
                    <br />
                    1900 1234 • 08:00 – 21:30
                  </div>
                </div>
                <div className={styles.AbStoreMetaItem}>
                  <i className="bi bi-envelope" aria-hidden="true" />
                  <div>
                    <span className={styles.AbStoreMetaLabel}>Email hỗ trợ</span>
                    <br />
                    support@aurorablue.vn
                  </div>
                </div>
                <div className={styles.AbStoreMetaItem}>
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  <div>
                    <span className={styles.AbStoreMetaLabel}>Showroom chính</span>
                    <br />
                    123 Nguyễn Huệ, Q.1, TP.HCM
                  </div>
                </div>
                <div className={styles.AbStoreMetaItem}>
                  <i className="bi bi-clock-history" aria-hidden="true" />
                  <div>
                    <span className={styles.AbStoreMetaLabel}>Thời gian giao hàng</span>
                    <br />
                    1–3 ngày nội thành • 3–7 ngày toàn quốc
                  </div>
                </div>
              </div>
            </section>

            {/* COL 2: LINKS GROUP (SHOP + SUPPORT) */}
            <section className={styles.AbLinksGroup}>
              {/* SHOP */}
              <div>
                <h4 className={styles.AbColTitle}>Mua sắm theo danh mục</h4>
                <div className={styles.AbLinks}>
                  <a href="#">
                    Nữ • Váy, đầm &amp; set đồ
                    <span className={styles.AbLinkBadge}>HOT</span>
                  </a>
                  <a href="#">Nam • Áo sơ mi, quần tây, áo khoác</a>
                  <a href="#">Unisex • Hoodie, jacket &amp; sweatpants</a>
                  <a href="#">Phụ kiện • Túi, giày, mũ, trang sức</a>
                  <a href="#">Bộ sưu tập theo mùa • Xuân / Hè / Thu / Đông</a>
                </div>
              </div>

              {/* SUPPORT / ACCOUNT */}
              <div>
                <h4 className={styles.AbColTitle}>Hỗ trợ &amp; tài khoản</h4>
                <div className={styles.AbLinks}>
                  <a href="#">Trung tâm trợ giúp khách hàng</a>
                  <a href="#">Theo dõi đơn hàng</a>
                  <a href="#">Chính sách đổi trả &amp; hoàn tiền</a>
                  <a href="#">Chính sách bảo hành &amp; bảo quản</a>
                  <a href="#">Hướng dẫn chọn size &amp; chất liệu</a>
                </div>
              </div>
            </section>

            {/* COL 3: NEWSLETTER + SOCIAL + PAYMENTS */}
            <section className={styles.AbNewsWrap}>
              <div className={styles.AbNews}>
                <h4 className={styles.AbColTitle}>Nhận trend &amp; ưu đãi sớm</h4>
                <p>Nhận lookbook, trend phối đồ, mã giảm giá giới hạn và thông báo flash sale qua email mỗi tuần.</p>
                <div className={styles.AbInputWrap}>
                  <i className="bi bi-envelope" aria-hidden="true" />
                  <input type="email" placeholder="Nhập email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button type="button" onClick={handleSubscribe}>
                    <span>Đăng ký</span>
                    <i className="bi bi-arrow-right-short" aria-hidden="true" />
                  </button>
                </div>

                {/* PAYMENTS */}
                <div className={styles.AbPaymentsWrap}>
                  <div className={styles.AbPaymentsLabel}>
                    <i className="bi bi-shield-check" aria-hidden="true" />
                    <span>Thanh toán an toàn &amp; đa dạng</span>
                  </div>
                  <div className={styles.AbPaymentsIcons}>
                    {/* Placeholder – sau này bạn thay logo thật */}
                    <img src="https://via.placeholder.com/80x46.png?text=VISA" alt="Thanh toán Visa" />
                    <img src="https://via.placeholder.com/80x46.png?text=MC" alt="Thanh toán Mastercard" />
                    <img src="https://via.placeholder.com/80x46.png?text=JCB" alt="Thanh toán JCB" />
                    <img src="https://via.placeholder.com/80x46.png?text=MOMO" alt="Thanh toán MoMo" />
                    <img src="https://via.placeholder.com/80x46.png?text=Zalo" alt="Thanh toán ZaloPay" />
                    <img src="https://via.placeholder.com/80x46.png?text=QR" alt="Thanh toán QR Bank" />
                  </div>
                </div>
              </div>

              {/* SOCIAL */}
              <div className={styles.AbSocial}>
                <span className={styles.AbColTitle}>Theo dõi Aurora Blue</span>
                <div className={styles.AbSocialIcons}>
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
              </div>
            </section>
          </div>

          {/* BOTTOM BAR */}
          <div className={styles.AbBottom}>
            <div className={styles.AbBottomLeft}>
              <div className={styles.AbStatusPill}>
                <span className={styles.AbStatusDot} />
                <span>Hệ thống ổn định • Thanh toán realtime</span>
              </div>
              <span>© 2026 Aurora Blue Wardrobe.</span>
              <div className={styles.AbBottomLinks}>
                <a href="#">Điều khoản sử dụng</a>
                <span>•</span>
                <a href="#">Chính sách bảo mật</a>
                <span>•</span>
                <a href="#">Chính sách cookie</a>
              </div>
            </div>

            <div className={styles.AbViewMode}>
              <i className="bi bi-columns-gap" aria-hidden="true" />
              <button type="button" className={`${styles.AbViewModeBtn} ${viewMode === "content" ? styles.IsActive : ""}`} onClick={() => handleChangeViewMode("content")}>
                Xem đầy đủ
              </button>
              <button type="button" className={`${styles.AbViewModeBtn} ${viewMode === "summary" ? styles.IsActive : ""}`} onClick={() => handleChangeViewMode("summary")}>
                Chỉ tóm tắt
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const FOOTER_FASHION_REGITEM: RegItem = {
  kind: "FooterFashion",
  label: "Footer Fashion",
  defaults: DEFAULT_FOOTER_FASHION_PROPS,
  inspector: [],
  render: (p) => <FooterFashion {...(p as FooterFashionProps)} />,
};

export default FooterFashion;
