"use client";

import React, { FC, useState } from "react";
import styles from "@/styles/templates/ShopTemplate/footer/FooterYellow.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type FooterYellowLayout = "classic" | "split";

export type FooterYellowProps = Record<string, never>;

export const DEFAULT_FOOTER_YELLOW_PROPS: FooterYellowProps = {};

const FooterYellow: FC<FooterYellowProps> = (_props) => {
  const [layout, setLayout] = useState<FooterYellowLayout>("classic");
  const [email, setEmail] = useState("");

  const handleChangeLayout = (mode: FooterYellowLayout) => {
    setLayout(mode);
  };

  const handleSubscribe = () => {
    if (typeof window !== "undefined") {
      window.alert("Cảm ơn bạn đã đăng ký lookbook & ưu đãi từ Aurora Green Wear 💚");
    }
    setEmail("");
  };

  return (
    <footer className={styles.AgFooter} data-layout={layout}>
      <div className={styles.AgInner}>
        {/* Top strip */}
        <div className={styles.AgTop}>
          <div className={styles.AgBrand}>
            <div className={styles.AgLogoBadge} />
            <div className={styles.AgBrandText}>
              <span className={styles.AgBrandTitle}>Aurora Green Wear</span>
              <span className={styles.AgBrandSub}>Thời trang bền vững – Đẹp từ bên trong</span>
            </div>
          </div>

          <div className={styles.AgTopRight}>
            <div className={styles.AgChip}>
              <i className="bi bi-stars" aria-hidden="true" />
              <span>
                Ưu đãi hôm nay: <strong>−20% Eco Denim</strong>
              </span>
            </div>
            <div className={`${styles.AgChip} ${styles.AgChipHot}`}>
              <i className="bi bi-gift" aria-hidden="true" />
              <span>Aurora Club: tích điểm nhân 2</span>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className={styles.AgMain}>
          {/* Col 1: brand story */}
          <section className={`${styles.AgCol} ${styles.AgColAbout}`}>
            <h3 className={styles.AgColTitle}>Tủ đồ xanh cho thế hệ mới</h3>
            <p className={styles.AgDesc}>
              Aurora Green Wear mang đến các bộ sưu tập làm từ chất liệu tái chế, cotton hữu cơ và thiết kế tối giản,
              phù hợp đi làm, đi chơi và cả những chuyến du lịch cuối tuần.
            </p>

            <div className={styles.AgPillRow}>
              <div className={styles.AgPill}>
                <i className="bi bi-patch-check" aria-hidden="true" />
                Chất liệu đã chứng nhận
              </div>
              <div className={styles.AgPill}>
                <i className="bi bi-recycle" aria-hidden="true" />
                Quy trình sản xuất xanh
              </div>
              <div className={styles.AgPill}>
                <i className="bi bi-arrow-left-right" aria-hidden="true" />
                Đổi size trong 30 ngày
              </div>
            </div>

            <div className={styles.AgStats}>
              <div className={styles.AgStatCard}>
                <div className={styles.AgStatLabel}>% sản phẩm từ sợi tái chế</div>
                <div className={styles.AgStatValue}>65%</div>
              </div>
              <div className={styles.AgStatCard}>
                <div className={styles.AgStatLabel}>Khách hàng hài lòng</div>
                <div className={styles.AgStatValue}>48.200+</div>
              </div>
            </div>
          </section>

          {/* Col 2: hỗ trợ */}
          <section className={styles.AgCol}>
            <h3 className={styles.AgColTitle}>Hỗ trợ &amp; chăm sóc</h3>
            <ul className={styles.AgLinks}>
              <li>
                <a href="#">
                  <i className="bi bi-chat-dots" aria-hidden="true" />
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-rulers" aria-hidden="true" />
                  Hướng dẫn chọn size
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-box-seam" aria-hidden="true" />
                  Tra cứu đơn hàng
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-arrow-repeat" aria-hidden="true" />
                  Chính sách đổi &amp; trả hàng
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-telephone" aria-hidden="true" />
                  Liên hệ: 1900 xxxx
                </a>
              </li>
            </ul>
          </section>

          {/* Col 3: khám phá */}
          <section className={`${styles.AgCol} ${styles.AgColLinks2}`}>
            <h3 className={styles.AgColTitle}>Khám phá Aurora Wear</h3>
            <ul className={styles.AgLinks}>
              <li>
                <a href="#">
                  <i className="bi bi-sun" aria-hidden="true" />
                  BST Mùa Hè Xanh
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-moon-stars" aria-hidden="true" />
                  Aurora Night Outfits
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-heart" aria-hidden="true" />
                  Gợi ý mix &amp; match
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-journal-richtext" aria-hidden="true" />
                  Blog “Sống tối giản &amp; xanh”
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-people" aria-hidden="true" />
                  Cộng đồng Aurora Lovers
                </a>
              </li>
            </ul>
          </section>

          {/* Col 4: app + newsletter */}
          <section className={styles.AgCol}>
            <h3 className={styles.AgColTitle}>Nhận lookbook &amp; ưu đãi</h3>
            <div className={styles.AgNewsletter}>
              <p className={styles.AgDesc}>
                Đăng ký nhận email để cập nhật lookbook mới, ưu đãi độc quyền và tips phối đồ bền vững mỗi tuần.
              </p>
              <div className={styles.AgInputWrap}>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className={styles.AgBtn} type="button" onClick={handleSubscribe}>
                  <i className="bi bi-send" aria-hidden="true" />
                  Đăng ký ngay
                </button>
              </div>
            </div>

            <div className={styles.AgAppRow}>
              <button className={styles.AgAppChip} type="button">
                <span>Tải Aurora Wear trên</span>
                <span>
                  <i className="bi bi-apple" aria-hidden="true" />
                  App Store
                </span>
              </button>
              <button className={styles.AgAppChip} type="button">
                <span>Hoặc trên</span>
                <span>
                  <i className="bi bi-google-play" aria-hidden="true" />
                  Google Play
                </span>
              </button>
            </div>
          </section>
        </div>

        {/* Bottom bar */}
        <div className={styles.AgBottom}>
          <div className={styles.AgBottomLeft}>
            <span>© 2025 Aurora Green Wear. Mỗi chiếc áo bạn chọn là một lời cam kết với hành tinh.</span>
            <span className={styles.AgBadgeFast}>
              <i className="bi bi-truck" aria-hidden="true" />
              Miễn phí đổi size lần đầu
            </span>
          </div>

          <div className={styles.AgStyleSwitch}>
            <button
              className={`${styles.AgStyleBtn} ${layout === "classic" ? styles.IsActive : ""}`}
              type="button"
              onClick={() => handleChangeLayout("classic")}
            >
              <i className="bi bi-grid-1x2" aria-hidden="true" />
              Classic
            </button>
            <button
              className={`${styles.AgStyleBtn} ${layout === "split" ? styles.IsActive : ""}`}
              type="button"
              onClick={() => handleChangeLayout("split")}
            >
              <i className="bi bi-columns-gap" aria-hidden="true" />
              Split
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

/** RegItem để dùng trong UI Builder */
export const FOOTER_YELLOW_REGITEM: RegItem = {
  kind: "FooterYellow",
  label: "Footer Yellow",
  defaults: DEFAULT_FOOTER_YELLOW_PROPS,
  inspector: [],
  render: (p) => <FooterYellow {...(p as FooterYellowProps)} />,
};

export default FooterYellow;
