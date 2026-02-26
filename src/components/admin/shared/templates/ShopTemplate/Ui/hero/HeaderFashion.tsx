/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/hero/HeaderFashion.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export interface HeaderFashionProps {
  preview?: boolean;
}

export const DEFAULT_HEADER_FASHION_PROPS: HeaderFashionProps = {
  preview: false,
};

const categories = [
  { icon: "👗", title: "Dresses", subtitle: "42 items" },
  { icon: "🧥", title: "Jackets", subtitle: "30 items" },
  { icon: "👕", title: "T-Shirts", subtitle: "65 items" },
  { icon: "👖", title: "Jeans", subtitle: "28 items" },
  { icon: "👟", title: "Sneakers", subtitle: "40 items" },
  { icon: "🎒", title: "Accessories", subtitle: "22 items" },
];

export const HeaderFashion: React.FC<HeaderFashionProps> = () => {
  return (
    <section className={styles.fsHero}>
      <div className={styles.fsHeroInner}>
        {/* CATEGORY STRIP */}
        <div className={styles.fsCats}>
          {categories.map((cat) => (
            <button key={cat.title} type="button" className={styles.fsCatItem}>
              <div className={styles.fsCatIcon}>{cat.icon}</div>
              <div className={styles.fsCatText}>
                <strong>{cat.title}</strong>
                <span>{cat.subtitle}</span>
              </div>
            </button>
          ))}
        </div>

        {/* GRID HERO */}
        <div className={styles.fsGrid}>
          {/* LEFT BIG HERO */}
          <article className={styles.fsMainHero}>
            <div className={styles.fsMainLeft}>
              <div className={styles.fsMainBadge}>
                <span className={styles.fsMainBadgeTag}>New Collection</span>
                <span>Summer Streetwear</span>
              </div>

              <h1 className={styles.fsMainTitle}>
                <span>Fresh</span>
                <span className={styles.fsMainTitleHighlight}>Street Style</span>
                <span>For Everyone</span>
              </h1>

              <p className={styles.fsMainSub}>Bộ sưu tập áo thun, jeans và sneaker cho mùa hè – mix &amp; match nhanh, lên outfit đẹp ngay.</p>

              <div className={styles.fsMainPrice}>From 499K</div>

              <div className={styles.fsMainCtaRow}>
                <button type="button" className={styles.fsBtnMain}>
                  <i className="bi bi-bag-check" />
                  Shop Now
                </button>
                <span className={styles.fsMainNote}>Free ship đơn hàng từ 499K.</span>
              </div>
            </div>

            <div className={styles.fsMainRight}>
              <div className={styles.fsMainImage}>
                {/* Thay bằng ảnh thật của bạn nếu cần */}
                <img src="https://images.pexels.com/photos/9945235/pexels-photo-9945235.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Streetwear collection" />
              </div>
            </div>
          </article>

          {/* RIGHT SMALL CARDS */}
          <div className={styles.fsRightGrid}>
            <div className={styles.fsRightTop}>
              {/* Card 1 */}
              <article className={styles.fsCard}>
                <div>
                  <h3>Premium Hoodie Set</h3>
                  <p>Hoodie + jogger unisex, 4 màu basic.</p>
                  <div className={styles.fsCardPrice}>799K</div>
                  <div className={styles.fsCardLink}>
                    Shop Now
                    <i className="bi bi-arrow-right" />
                  </div>
                </div>
                <div className={styles.fsCardImg}>
                  <img src="https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Hoodie set" />
                </div>
              </article>
            </div>

            <div className={styles.fsRightBottom}>
              {/* Card 2 */}
              <article className={`${styles.fsCard} ${styles.fsCardBlue}`}>
                <div>
                  <h3>New Baby Tee</h3>
                  <p>Croptop baby tee cho mùa hè, chất cotton dày.</p>
                  <div className={styles.fsCardLink}>
                    Shop Now
                    <i className="bi bi-arrow-right" />
                  </div>
                </div>
                <div className={styles.fsCardImg}>
                  <img src="https://images.pexels.com/photos/7671247/pexels-photo-7671247.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Baby tee" />
                </div>
              </article>

              {/* Card 3 */}
              <article className={`${styles.fsCard} ${styles.fsCardPink}`}>
                <div>
                  <h3>Sneaker Flash Deal</h3>
                  <p>Tất cả dòng sneaker trắng giảm thêm hôm nay.</p>
                  <div className={styles.fsCardLink}>
                    Shop Now
                    <i className="bi bi-arrow-right" />
                  </div>
                </div>
                <div className={styles.fsCardImg}>
                  <img src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sneaker" />
                </div>
                <div className={styles.fsDiscount}>
                  <span className={styles.fsDiscountOff}>15% OFF</span>
                  <span>Today</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ========= RegItem cho UI Builder ========= */

export const HEADER_FASHION_REGITEM: RegItem = {
  kind: "HeaderFashion",
  label: "Header Fashion",
  defaults: DEFAULT_HEADER_FASHION_PROPS,
  inspector: [],
  render: (p) => <HeaderFashion {...(p as HeaderFashionProps)} />,
};

export default HeaderFashion;
