"use client";

import React, { FC, useState } from "react";

import styles from "@/styles/templates/ShopTemplate/footer/FooterGreen.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type LayoutMode = "classic" | "split" | "minimal";

export type FooterGreenProps = Record<string, never>;

export const DEFAULT_FOOTER_GREEN_PROPS: FooterGreenProps = {};

const FooterGreen: FC<FooterGreenProps> = (_props) => {
  const [layout, setLayout] = useState<LayoutMode>("classic");
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [email, setEmail] = useState("");

  const handleChangeLayout = (mode: LayoutMode) => {
    setLayout(mode);
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === "vi" ? "en" : "vi"));
  };

  const handleSubscribe = () => {
    if (typeof window !== "undefined") {
      window.alert("Cảm ơn bạn đã đăng ký nhận ưu đãi & tips phối đồ từ Aurora Green Wear 👗");
    }
    setEmail("");
  };

  return (
    <footer className={styles.AuroraFooter} data-layout={layout}>
      <div className={styles.AuroraFooterInner}>
        {/* Top strip */}
        <div className={styles.FtTop}>
          <div className={styles.FtBrand}>
            <div className={styles.FtBadge}>
              <i className="bi bi-hanger" aria-hidden="true" />
            </div>
            <div className={styles.FtTitleGroup}>
              <span className={styles.FtTitle}>Aurora Green Wear</span>
              <span className={styles.FtSubtitle}>Thời trang bền vững – đẹp từ gu đến hành tinh</span>
            </div>
          </div>

          <div className={styles.FtTopRight}>
            <div className={styles.FtTag}>
              <i className="bi bi-lightning-charge" aria-hidden="true" />
              <span>
                Đơn từ <strong>499K</strong> được <strong>miễn phí ship</strong>
              </span>
            </div>
            <div className={styles.FtTag}>
              <i className="bi bi-stars" aria-hidden="true" />
              <span>
                BST mới <strong>“Eco Street 2025”</strong> vừa cập bến
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={styles.FtMain}>
          {/* Col 1: about + metrics */}
          <section className={`${styles.FtCol} ${styles.FtColAbout}`}>
            <div>
              <h3 className={styles.FtColTitle}>Thời trang xanh – chuẩn gu, chuẩn chất</h3>
              <p className={styles.FtDesc}>
                Aurora Green Wear lựa chọn chất liệu hữu cơ, tái chế và quy trình sản xuất có trách nhiệm, để mỗi outfit
                bạn mặc đều nhẹ nhàng hơn với Trái Đất.
              </p>

              <div className={styles.FtBadgesRow}>
                <div className={styles.FtPill}>
                  <i className="bi bi-recycle" aria-hidden="true" />
                  <span>Vải tái chế &amp; organic</span>
                </div>
                <div className={styles.FtPill}>
                  <i className="bi bi-bag-heart" aria-hidden="true" />
                  <span>Đổi size miễn phí 7 ngày</span>
                </div>
                <div className={styles.FtPill}>
                  <i className="bi bi-box-seam" aria-hidden="true" />
                  <span>Đóng gói hạn chế plastic</span>
                </div>
              </div>

              <div className={styles.FtMetrics}>
                <div className={styles.FtMetricCard}>
                  <div className={styles.FtMetricLabel}>Thành viên Aurora Club</div>
                  <div className={styles.FtMetricNumber}>25.300+</div>
                </div>
                <div className={styles.FtMetricCard}>
                  <div className={styles.FtMetricLabel}>Sản phẩm được “cứu” khỏi bãi rác</div>
                  <div className={styles.FtMetricNumber}>31.7K+</div>
                </div>
              </div>
            </div>
          </section>

          {/* Col 2: customer care */}
          <section className={`${styles.FtCol} ${styles.FtColLinks1}`}>
            <h3 className={styles.FtColTitle}>Hỗ trợ mua sắm</h3>
            <ul className={styles.FtLinks}>
              <li>
                <a href="#">
                  <i className="bi bi-life-preserver" aria-hidden="true" />
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-arrow-left-right" aria-hidden="true" />
                  Chính sách đổi trả &amp; hoàn tiền
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-rulers" aria-hidden="true" />
                  Hướng dẫn chọn size &amp; chất liệu
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-credit-card" aria-hidden="true" />
                  Phương thức thanh toán &amp; giao hàng
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-headset" aria-hidden="true" />
                  Liên hệ stylist tư vấn outfit
                </a>
              </li>
            </ul>
          </section>

          {/* Col 3: explore */}
          <section className={`${styles.FtCol} ${styles.FtColLinks2}`}>
            <h3 className={styles.FtColTitle}>Khám phá bộ sưu tập</h3>
            <ul className={styles.FtLinks}>
              <li>
                <a href="#">
                  <i className="bi bi-gender-female" aria-hidden="true" />
                  Nữ · Váy, đầm &amp; set đồ xanh
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-gender-male" aria-hidden="true" />
                  Nam · Streetwear eco-friendly
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-emoji-smile" aria-hidden="true" />
                  Bé · Outfit dễ thương &amp; an toàn
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-bag" aria-hidden="true" />
                  Phụ kiện túi, nón, giày thân thiện môi trường
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-camera" aria-hidden="true" />
                  Lookbook &amp; gợi ý mix&amp;match
                </a>
              </li>
            </ul>
          </section>

          {/* Col 4: app + newsletter */}
          <section className={`${styles.FtCol} ${styles.FtColApps}`}>
            <h3 className={styles.FtColTitle}>Nhận ưu đãi &amp; ý tưởng phối đồ</h3>

            <div className={styles.FtNewsletter}>
              <p className={styles.FtDesc}>
                Đăng ký để nhận ưu đãi thành viên, gợi ý outfit theo phong cách của bạn &amp; tin tức về các BST xanh
                mới nhất.
              </p>

              <div className={styles.FtInputWrap}>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className={styles.FtBtn} type="button" onClick={handleSubscribe}>
                  <i className="bi bi-send" aria-hidden="true" />
                  Nhận ưu đãi
                </button>
              </div>
            </div>

            <div className={styles.FtStyleTags}>
              <span className={styles.FtStyleTag}>
                <i className="bi bi-droplet-half" aria-hidden="true" />
                Casual hằng ngày
              </span>
              <span className={styles.FtStyleTag}>
                <i className="bi bi-briefcase" aria-hidden="true" />
                Office &amp; công sở
              </span>
              <span className={styles.FtStyleTag}>
                <i className="bi bi-moon-stars" aria-hidden="true" />
                Party &amp; hẹn hò
              </span>
              <span className={styles.FtStyleTag}>
                <i className="bi bi-tree" aria-hidden="true" />
                Basic bền vững
              </span>
            </div>

            <div className={styles.FtApps}>
              <button className={styles.FtAppChip} type="button">
                <span>Shopping cùng Aurora</span>
                <span>
                  <i className="bi bi-apple" aria-hidden="true" />
                  App Store
                </span>
              </button>
              <button className={styles.FtAppChip} type="button">
                <span>Mua sắm mọi nơi</span>
                <span>
                  <i className="bi bi-google-play" aria-hidden="true" />
                  Google Play
                </span>
              </button>
            </div>

            <div className={styles.FtPayments}>
              <div className={styles.FtPayChip}>Visa</div>
              <div className={styles.FtPayChip}>Mastercard</div>
              <div className={styles.FtPayChip}>Momo</div>
              <div className={styles.FtPayChip}>ZaloPay</div>
            </div>
          </section>
        </div>

        {/* Bottom */}
        <div className={styles.FtBottom}>
          <div className={styles.FtBottomLeft}>
            <span>© 2025 Aurora Green Wear. Mỗi outfit là một lời cam kết với môi trường.</span>
            <div className={styles.FtBottomNav}>
              <a href="#">Điều khoản sử dụng</a>
              <a href="#">Chính sách bảo mật</a>
              <a href="#">Cookies</a>
            </div>
          </div>

          <div className={styles.FtStyleModes}>
            <div className={styles.FtSocial}>
              <button className={styles.FtSocialBtn} type="button" aria-label="Instagram">
                <i className="bi bi-instagram" aria-hidden="true" />
              </button>
              <button className={styles.FtSocialBtn} type="button" aria-label="Facebook">
                <i className="bi bi-facebook" aria-hidden="true" />
              </button>
              <button className={styles.FtSocialBtn} type="button" aria-label="TikTok">
                <i className="bi bi-tiktok" aria-hidden="true" />
              </button>
              <button className={styles.FtSocialBtn} type="button" aria-label="YouTube">
                <i className="bi bi-youtube" aria-hidden="true" />
              </button>
            </div>

            <button className={styles.FtLangSwitch} type="button" onClick={handleToggleLang}>
              <i className="bi bi-translate" aria-hidden="true" />
              <span>{lang === "vi" ? "VI / EN" : "EN / VI"}</span>
            </button>

            <button
              className={`${styles.FtStyleBtn} ${layout === "classic" ? styles.IsActive : ""}`}
              type="button"
              onClick={() => handleChangeLayout("classic")}
            >
              <i className="bi bi-grid-1x2" aria-hidden="true" />
              Full
            </button>
            <button
              className={`${styles.FtStyleBtn} ${layout === "split" ? styles.IsActive : ""}`}
              type="button"
              onClick={() => handleChangeLayout("split")}
            >
              <i className="bi bi-columns" aria-hidden="true" />
              Lookbook
            </button>
            <button
              className={`${styles.FtStyleBtn} ${layout === "minimal" ? styles.IsActive : ""}`}
              type="button"
              onClick={() => handleChangeLayout("minimal")}
            >
              <i className="bi bi-dash-lg" aria-hidden="true" />
              Compact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

/** RegItem để dùng trong UI Builder (giống FooterPro, TopbarGreen, ...) */
export const FOOTER_GREEN_REGITEM: RegItem = {
  kind: "FooterGreen",
  label: "Footer Green",
  defaults: DEFAULT_FOOTER_GREEN_PROPS,
  inspector: [],
  render: (p) => <FooterGreen {...(p as FooterGreenProps)} />,
};

export default FooterGreen;
