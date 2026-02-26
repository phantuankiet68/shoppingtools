"use client";

import React, { FC, useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/footer/FooterBlue.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterBlueProps = Record<string, never>;

export const DEFAULT_FOOTER_BLUE_PROPS: FooterBlueProps = {};

const FooterBlue: FC<FooterBlueProps> = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      if (typeof window !== "undefined") {
        window.alert("Vui lòng nhập email của bạn trước khi đăng ký.");
      }
      return;
    }

    if (typeof window !== "undefined") {
      console.log("Newsletter email:", trimmed);
      window.alert("Cảm ơn bạn đã đăng ký nhận tin từ Aurora Wear!");
    }
    setEmail("");
  };

  const handleSocialClick = (social: string) => {
    if (typeof window !== "undefined") {
      console.log("Open social:", social);
    }
  };

  const handleLanguageChange = (value: string) => {
    if (typeof window !== "undefined") {
      console.log("Change language:", value);
    }
  };

  return (
    <footer className={styles.AuroraFooter}>
      <div className={styles.AfInner}>
        {/* Cột trái: brand / lợi ích / newsletter */}
        <div className={styles.AfLeft}>
          <div className={styles.AfLogoRow}>
            <div className={styles.AfLogoCircle}>
              <div className={styles.AfLogoInner}>AW</div>
            </div>
            <div className={styles.AfBrandName}>
              <div className={styles.AfBrandMain}>AURORA WEAR</div>
              <div className={styles.AfBrandSub}>
                <span className={styles.AfIconDot} />
                <span>Thời trang mỗi ngày • Phong cách của bạn</span>
              </div>
            </div>
          </div>

          <div className={styles.AfChipRow}>
            <div className={styles.AfChip}>
              <i className="bi bi-lightning-charge" aria-hidden="true" />
              Giao hàng nhanh 2H (HCM)
            </div>
            <div className={styles.AfChip}>
              <i className="bi bi-arrow-repeat" aria-hidden="true" />
              Đổi trả trong 30 ngày
            </div>
            <div className={`${styles.AfChip} ${styles.AfChipAccent}`}>
              <i className="bi bi-stars" aria-hidden="true" />
              Bộ sưu tập Aurora Blue 2025
            </div>
          </div>

          <div className={styles.AfTrustGrid}>
            <div className={styles.AfTrustCard}>
              <div className={styles.AfTrustTitle}>
                <i className="bi bi-shield-check" aria-hidden="true" />
                Thanh toán an toàn
              </div>
              <div className={styles.AfTrustDesc}>Hỗ trợ thẻ, ví điện tử và COD toàn quốc.</div>
            </div>
            <div className={styles.AfTrustCard}>
              <div className={styles.AfTrustTitle}>
                <i className="bi bi-bag-heart" aria-hidden="true" />
                Hàng chính hãng
              </div>
              <div className={styles.AfTrustDesc}>Sản phẩm được chọn lọc từ thương hiệu uy tín.</div>
            </div>
            <div className={styles.AfTrustCard}>
              <div className={styles.AfTrustTitle}>
                <i className="bi bi-people" aria-hidden="true" />
                Cộng đồng Aurora
              </div>
              <div className={styles.AfTrustDesc}>Chia sẻ tips phối đồ, review lookbook và ưu đãi riêng.</div>
            </div>
          </div>

          <div className={styles.AfNewsletter}>
            <div className={styles.AfNewsletterHeader}>
              <span>Nhận ưu đãi & xu hướng mới</span>
              <span className={styles.AfNewsletterTag}>
                <i className="bi bi-envelope-heart" aria-hidden="true" />
                -20% đơn đầu tiên
              </span>
            </div>
            <div className={styles.AfNewsletterRow}>
              <div className={styles.AfInput}>
                <span className={styles.AfInputIcon}>
                  <i className="bi bi-at" aria-hidden="true" />
                </span>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="button" className={styles.AfBtnPrimary} onClick={handleNewsletterSubmit}>
                Đăng ký
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </button>
            </div>
            <div className={styles.AfNewsNote}>
              Bằng việc đăng ký, bạn đồng ý với <strong>chính sách nhận tin khuyến mãi</strong> từ Aurora Wear.
            </div>
          </div>
        </div>

        {/* Cột phải: menu */}
        <div className={styles.AfCols}>
          <div>
            <div className={styles.AfColTitle}>Danh mục nổi bật</div>
            <ul className={styles.AfColList}>
              <li>
                <a href="#">Áo thun &amp; Polo</a>
              </li>
              <li>
                <a href="#">Sơ mi &amp; Áo kiểu</a>
              </li>
              <li>
                <a href="#">Quần jean &amp; quần dài</a>
              </li>
              <li>
                <a href="#">Đầm &amp; jumpsuit</a>
              </li>
              <li>
                <a href="#">Giày &amp; sneaker</a>
              </li>
              <li>
                <a href="#">Phụ kiện (túi, nón, thắt lưng)</a>
              </li>
              <li>
                <a href="#">Hàng mới về tuần này</a>
              </li>
            </ul>
          </div>

          <div>
            <div className={styles.AfColTitle}>Hỗ trợ khách hàng</div>
            <ul className={styles.AfColList}>
              <li>
                <a href="#">Trung tâm trợ giúp</a>
              </li>
              <li>
                <a href="#">Hướng dẫn đặt hàng</a>
              </li>
              <li>
                <a href="#">Chính sách vận chuyển</a>
              </li>
              <li>
                <a href="#">Đổi trả &amp; hoàn tiền</a>
              </li>
              <li>
                <a href="#">Câu hỏi thường gặp (FAQ)</a>
              </li>
              <li>
                <a href="#">Liên hệ CSKH</a>
              </li>
            </ul>
          </div>

          <div>
            <div className={styles.AfColTitle}>Về Aurora Wear</div>
            <ul className={styles.AfColList}>
              <li>
                <a href="#">Câu chuyện thương hiệu</a>
              </li>
              <li>
                <a href="#">Blog &amp; phong cách sống</a>
              </li>
              <li>
                <a href="#">Tuyển dụng</a>
              </li>
              <li>
                <a href="#">Hợp tác &amp; KOLs</a>
              </li>
              <li>
                <a href="#">Điều khoản &amp; Điều kiện</a>
              </li>
            </ul>

            <div className={styles.AfSocialRow}>
              <span>Kết nối với chúng tôi</span>
              <div className={styles.AfSocialBtns}>
                <button type="button" className={styles.AfBtnIcon} onClick={() => handleSocialClick("facebook")}>
                  <i className="bi bi-facebook" aria-hidden="true" />
                </button>
                <button type="button" className={styles.AfBtnIcon} onClick={() => handleSocialClick("instagram")}>
                  <i className="bi bi-instagram" aria-hidden="true" />
                </button>
                <button type="button" className={styles.AfBtnIcon} onClick={() => handleSocialClick("tiktok")}>
                  <i className="bi bi-tiktok" aria-hidden="true" />
                </button>
                <button type="button" className={styles.AfBtnIcon} onClick={() => handleSocialClick("youtube")}>
                  <i className="bi bi-youtube" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* PHƯƠNG THỨC THANH TOÁN – full width */}
          <div className={styles.AfPaymentWide}>
            <div className={styles.AfPaymentTitle}>PHƯƠNG THỨC THANH TOÁN</div>
            <div className={styles.AfPaymentLogos}>
              <span className={`${styles.PayLogo} ${styles.PayVisa}`}>VISA</span>
              <span className={`${styles.PayLogo} ${styles.PayMastercard}`}>Mastercard</span>
              <span className={`${styles.PayLogo} ${styles.PayNapas}`}>napas</span>
              <span className={`${styles.PayLogo} ${styles.PayCod}`}>COD</span>
              <span className={`${styles.PayLogo} ${styles.PayMomo}`}>momo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.AfBottom}>
        <div className={styles.AfBottomLeft}>
          <span>© 2025 Aurora Wear. Tất cả quyền được bảo lưu.</span>
          <div className={styles.AfBottomLinks}>
            <a href="#">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#">Chính sách bảo mật</a>
            <span>•</span>
            <a href="#">Theo dõi đơn hàng</a>
          </div>
        </div>

        <div className={styles.AfBottomRight}>
          <select className={styles.AfSelect} onChange={(e) => handleLanguageChange(e.target.value)}>
            <option>Tiếng Việt</option>
            <option>English</option>
            <option>日本語</option>
          </select>

          <span className={styles.AfStatusPill}>
            <i className="bi bi-check2-circle" aria-hidden="true" />
            Đang hoạt động • Hỗ trợ 8:00–22:00
          </span>
        </div>
      </div>
    </footer>
  );
};

export const FOOTER_BLUE_REGITEM: RegItem = {
  kind: "FooterBlue",
  label: "Footer Blue",
  defaults: DEFAULT_FOOTER_BLUE_PROPS,
  inspector: [],
  render: (p) => <FooterBlue {...(p as FooterBlueProps)} />,
};

export default FooterBlue;
