"use client";

import React, { FC, useEffect, useMemo, useState, FormEvent, MouseEvent } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterOrange.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterOrangeVariant = "aurora" | "glass" | "night";

export type FooterLink = {
  id: string;
  label: string;
  href?: string;
  iconClass?: string;
};

export type StoreBadge = {
  id: string;
  labelTop: string;
  labelBottom: string;
  iconClass?: string;
  href?: string;
};

export type SocialLink = {
  id: string;
  ariaLabel?: string;
  iconClass: string;
  href?: string;
};

export type VariantOption = {
  key: FooterOrangeVariant;
  label: string;
  iconClass?: string;
};

export type QuickNavItem = {
  id: string;
  label: string;
  iconClass?: string;
};

export type TrustPill = {
  id: string;
  label: string;
  iconClass?: string;
};

export type FooterOrangeProps = {
  // Brand / top row
  brandName?: string;
  brandTagline?: string;
  topbarDisplayLabel?: string;
  variantOptions?: VariantOption[];
  variant?: FooterOrangeVariant;

  // Quick nav buttons
  quickNavItems?: QuickNavItem[];

  // Newsletter
  newsletterTitle?: string;
  newsletterDescription?: string;
  emailPlaceholder?: string;
  subscribeButtonLabel?: string;
  newsletterEmptyMessage?: string;
  newsletterSuccessMessage?: string;

  // Chips dưới newsletter
  chips?: string[];

  // Column 2: shop / support
  shopTitle?: string;
  shopDescription?: string;
  shopLinks?: FooterLink[];

  // Column 3: about
  aboutTitle?: string;
  aboutDescription?: string;
  aboutLinks?: FooterLink[];

  // Column 4: app + social + trust + countdown
  appTitle?: string;
  appDescription?: string;
  appBadges?: StoreBadge[];
  socialLinks?: SocialLink[];
  trustPills?: TrustPill[];
  countdownLabel?: string;
  countdownSeconds?: number; // default 2h

  // Bottom row
  bottomText?: string;
  shippingText?: string;

  // Preview mode (không điều hướng / alert thật)
  preview?: boolean;
};

export const DEFAULT_FOOTER_ORANGE_PROPS: FooterOrangeProps = {
  brandName: "Aurora Wear • Orange",
  brandTagline: "Streetwear • Lifestyle • Flash sale",
  topbarDisplayLabel: "Chế độ footer:",
  variant: "aurora",
  variantOptions: [
    {
      key: "aurora",
      label: "Aurora",
      iconClass: "bi bi-stars",
    },
    {
      key: "glass",
      label: "Glass",
      iconClass: "bi bi-droplet-half",
    },
    {
      key: "night",
      label: "Night",
      iconClass: "bi bi-moon-stars",
    },
  ],

  quickNavItems: [
    {
      id: "new-collection",
      label: "Bộ sưu tập mới",
      iconClass: "bi bi-stars",
    },
    {
      id: "summer-lookbook",
      label: "Summer lookbook",
      iconClass: "bi bi-sun",
    },
    {
      id: "flash-sale",
      label: "Sale đến -60%",
      iconClass: "bi bi-lightning-charge",
    },
  ],

  newsletterTitle: "Nhận tin bộ sưu tập mới",
  newsletterDescription: "Đăng ký email để không bỏ lỡ drop áo thun, hoodie, sneaker mới & ưu đãi thành viên.",
  emailPlaceholder: "Nhập email của bạn...",
  subscribeButtonLabel: "Nhận thông báo",
  newsletterEmptyMessage: "Vui lòng nhập email trước khi đăng ký nhé 🔔",
  newsletterSuccessMessage: "Đã đăng ký nhận tin drop mới từ Aurora Wear! ✨",

  chips: ["Drop áo thun mỗi tuần", "Miễn phí đổi size", "Ưu đãi thành viên"],

  shopTitle: "Mua sắm & hỗ trợ",
  shopDescription: "Đội ngũ Aurora Support luôn sẵn sàng hỗ trợ bạn từ lúc chọn size đến khi nhận hàng.",
  shopLinks: [
    {
      id: "size-guide",
      label: "Hướng dẫn chọn size",
      href: "#",
      iconClass: "bi bi-rulers",
    },
    {
      id: "help-center",
      label: "Trung tâm trợ giúp",
      href: "#",
      iconClass: "bi bi-chat-dots",
    },
    {
      id: "order-tracking",
      label: "Theo dõi đơn hàng",
      href: "#",
      iconClass: "bi bi-truck",
    },
    {
      id: "return-30",
      label: "Đổi trả trong 30 ngày",
      href: "#",
      iconClass: "bi bi-arrow-repeat",
    },
  ],

  aboutTitle: "Về Aurora Wear",
  aboutDescription: "Thương hiệu thời trang urban, tập trung vào trải nghiệm mua sắm online & flash sale.",
  aboutLinks: [
    {
      id: "story",
      label: "Câu chuyện thương hiệu",
      href: "#",
      iconClass: "bi bi-info-circle",
    },
    {
      id: "stores",
      label: "Cửa hàng & showroom",
      href: "#",
      iconClass: "bi bi-shop-window",
    },
    {
      id: "recruit",
      label: "Tuyển dụng stylist",
      href: "#",
      iconClass: "bi bi-people",
    },
    {
      id: "terms",
      label: "Điều khoản & bảo mật",
      href: "#",
      iconClass: "bi bi-shield-lock",
    },
  ],

  appTitle: "Tải app & theo dõi",
  appDescription: "Mua nhanh hơn, lưu outfit yêu thích & săn flash sale mọi lúc, mọi nơi.",
  appBadges: [
    {
      id: "google-play",
      labelTop: "Tải trên",
      labelBottom: "Google Play",
      iconClass: "bi bi-google-play",
      href: "#",
    },
    {
      id: "app-store",
      labelTop: "Tải trên",
      labelBottom: "App Store",
      iconClass: "bi bi-apple",
      href: "#",
    },
  ],
  socialLinks: [
    {
      id: "facebook",
      ariaLabel: "Facebook",
      iconClass: "bi bi-facebook",
      href: "#",
    },
    {
      id: "instagram",
      ariaLabel: "Instagram",
      iconClass: "bi bi-instagram",
      href: "#",
    },
    {
      id: "tiktok",
      ariaLabel: "TikTok",
      iconClass: "bi bi-tiktok",
      href: "#",
    },
    {
      id: "youtube",
      ariaLabel: "YouTube",
      iconClass: "bi bi-youtube",
      href: "#",
    },
  ],

  trustPills: [
    {
      id: "secure-pay",
      label: "Thanh toán an toàn",
      iconClass: "bi bi-shield-check",
    },
    {
      id: "nice-package",
      label: "Gói hàng cẩn thận",
      iconClass: "bi bi-box-seam",
    },
  ],

  countdownLabel: "Flash sale tiếp theo sau:",
  countdownSeconds: 2 * 60 * 60, // 2 giờ

  bottomText: "2025 Aurora Wear. All rights reserved.",
  shippingText: "Giao hàng toàn quốc",

  preview: false,
};

const FooterOrange: FC<FooterOrangeProps> = (props) => {
  const {
    brandName = DEFAULT_FOOTER_ORANGE_PROPS.brandName,
    brandTagline = DEFAULT_FOOTER_ORANGE_PROPS.brandTagline,
    topbarDisplayLabel = DEFAULT_FOOTER_ORANGE_PROPS.topbarDisplayLabel,
    variantOptions = DEFAULT_FOOTER_ORANGE_PROPS.variantOptions,
    variant = DEFAULT_FOOTER_ORANGE_PROPS.variant,

    quickNavItems = DEFAULT_FOOTER_ORANGE_PROPS.quickNavItems,

    newsletterTitle = DEFAULT_FOOTER_ORANGE_PROPS.newsletterTitle,
    newsletterDescription = DEFAULT_FOOTER_ORANGE_PROPS.newsletterDescription,
    emailPlaceholder = DEFAULT_FOOTER_ORANGE_PROPS.emailPlaceholder,
    subscribeButtonLabel = DEFAULT_FOOTER_ORANGE_PROPS.subscribeButtonLabel,
    newsletterEmptyMessage = DEFAULT_FOOTER_ORANGE_PROPS.newsletterEmptyMessage,
    newsletterSuccessMessage = DEFAULT_FOOTER_ORANGE_PROPS.newsletterSuccessMessage,
    chips = DEFAULT_FOOTER_ORANGE_PROPS.chips,

    shopTitle = DEFAULT_FOOTER_ORANGE_PROPS.shopTitle,
    shopDescription = DEFAULT_FOOTER_ORANGE_PROPS.shopDescription,
    shopLinks = DEFAULT_FOOTER_ORANGE_PROPS.shopLinks,

    aboutTitle = DEFAULT_FOOTER_ORANGE_PROPS.aboutTitle,
    aboutDescription = DEFAULT_FOOTER_ORANGE_PROPS.aboutDescription,
    aboutLinks = DEFAULT_FOOTER_ORANGE_PROPS.aboutLinks,

    appTitle = DEFAULT_FOOTER_ORANGE_PROPS.appTitle,
    appDescription = DEFAULT_FOOTER_ORANGE_PROPS.appDescription,
    appBadges = DEFAULT_FOOTER_ORANGE_PROPS.appBadges,
    socialLinks = DEFAULT_FOOTER_ORANGE_PROPS.socialLinks,
    trustPills = DEFAULT_FOOTER_ORANGE_PROPS.trustPills,

    countdownLabel = DEFAULT_FOOTER_ORANGE_PROPS.countdownLabel,
    countdownSeconds = DEFAULT_FOOTER_ORANGE_PROPS.countdownSeconds,

    bottomText = DEFAULT_FOOTER_ORANGE_PROPS.bottomText,
    shippingText = DEFAULT_FOOTER_ORANGE_PROPS.shippingText,

    preview = DEFAULT_FOOTER_ORANGE_PROPS.preview,
  } = props;

  const [activeVariant, setActiveVariant] = useState<FooterOrangeVariant>(variant ?? "aurora");
  const [email, setEmail] = useState("");
  const [remaining, setRemaining] = useState<number>(countdownSeconds || 0);

  useEffect(() => {
    setActiveVariant(variant ?? "aurora");
  }, [variant]);

  // Countdown
  useEffect(() => {
    setRemaining(countdownSeconds || 0);
  }, [countdownSeconds]);

  useEffect(() => {
    if (!remaining) return;
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const formattedCountdown = useMemo(() => {
    const sec = remaining;
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [remaining]);

  const handleAnchorClick =
    (href?: string) =>
    (e: MouseEvent<HTMLAnchorElement>): void => {
      if (preview || !href || href === "#") {
        e.preventDefault();
        return;
      }
      // dùng router nếu cần
    };

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;

    const val = email.trim();
    if (!val) {
      if (typeof window !== "undefined" && newsletterEmptyMessage) {
        window.alert(newsletterEmptyMessage);
      }
      return;
    }

    if (typeof window !== "undefined" && newsletterSuccessMessage) {
      window.alert(newsletterSuccessMessage);
    }
    setEmail("");
  };

  const handleVariantClick = (key: FooterOrangeVariant) => {
    setActiveVariant(key);
  };

  const footerClassNames = [styles.Footer, activeVariant === "glass" ? styles.FooterGlass : "", activeVariant === "night" ? styles.FooterNight : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.FooterWrap}>
      <footer className={footerClassNames} aria-label="Aurora Orange footer">
        <div className={styles.FooterInner}>
          {/* Top row */}
          <div className={styles.TopRow}>
            <div>
              <div className={styles.Brand}>
                <div className={styles.Logo}>
                  <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
                </div>
                <div>
                  <div className={styles.BrandMain}>{brandName}</div>
                  {brandTagline && <div className={styles.BrandSub}>{brandTagline}</div>}
                </div>
              </div>

              {quickNavItems && quickNavItems.length > 0 && (
                <div className={styles.QuickNavRow}>
                  {quickNavItems.map((item) => (
                    <button key={item.id} type="button" className={styles.QuickNavButton}>
                      {item.iconClass && <i className={item.iconClass} aria-hidden="true" />}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Variants */}
            {variantOptions && variantOptions.length > 0 && (
              <div className={styles.Variants}>
                {topbarDisplayLabel && <span className={styles.VariantsLabel}>{topbarDisplayLabel}</span>}
                {variantOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`${styles.VariantButton} ${activeVariant === opt.key ? styles.VariantButtonActive : ""}`}
                    data-variant={opt.key}
                    onClick={() => handleVariantClick(opt.key)}>
                    {opt.iconClass && <i className={opt.iconClass} aria-hidden="true" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          <div className={styles.Grid}>
            {/* Col 1: Newsletter + chips */}
            <div className={styles.Col}>
              {newsletterTitle && <div className={styles.ColTitle}>{newsletterTitle}</div>}
              {newsletterDescription && <p className={styles.ColText}>{newsletterDescription}</p>}

              <form className={styles.NewsForm} onSubmit={handleNewsletterSubmit}>
                <div className={styles.InputWrap}>
                  <i className="bi bi-envelope" aria-hidden="true" />
                  <input type="email" className={styles.Input} placeholder={emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button type="submit" className={styles.PrimaryButton}>
                  <i className="bi bi-bell" aria-hidden="true" />
                  {subscribeButtonLabel}
                </button>
              </form>

              {chips && chips.length > 0 && (
                <div className={styles.ChipRow}>
                  {chips.map((chip, idx) => (
                    <button key={`${chip}-${idx}`} type="button" className={styles.Chip}>
                      {idx === 0 && <i className="bi bi-tshirt" aria-hidden="true" />}
                      {idx === 1 && <i className="bi bi-arrows-angle-expand" aria-hidden="true" />}
                      {idx === 2 && <i className="bi bi-gem" aria-hidden="true" />}
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2: Shop & support */}
            <div className={styles.Col}>
              {shopTitle && <div className={styles.ColTitle}>{shopTitle}</div>}
              {shopDescription && <p className={styles.ColText}>{shopDescription}</p>}
              {shopLinks && shopLinks.length > 0 && (
                <ul className={styles.List}>
                  {shopLinks.map((item) => (
                    <li key={item.id}>
                      <a href={item.href || "#"} onClick={handleAnchorClick(item.href)}>
                        {item.iconClass && <i className={item.iconClass} aria-hidden="true" />}
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Col 3: About */}
            <div className={styles.Col}>
              {aboutTitle && <div className={styles.ColTitle}>{aboutTitle}</div>}
              {aboutDescription && <p className={styles.ColText}>{aboutDescription}</p>}
              {aboutLinks && aboutLinks.length > 0 && (
                <ul className={styles.List}>
                  {aboutLinks.map((item) => (
                    <li key={item.id}>
                      <a href={item.href || "#"} onClick={handleAnchorClick(item.href)}>
                        {item.iconClass && <i className={item.iconClass} aria-hidden="true" />}
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Col 4: App + social + trust + countdown */}
            <div className={styles.Col}>
              {appTitle && <div className={styles.ColTitle}>{appTitle}</div>}
              {appDescription && <p className={styles.ColText}>{appDescription}</p>}

              {appBadges && appBadges.length > 0 && (
                <div className={styles.Badges}>
                  {appBadges.map((badge) => (
                    <button key={badge.id} type="button" className={styles.BadgeStore}>
                      {badge.iconClass && <i className={badge.iconClass} aria-hidden="true" />}
                      <span>
                        <small>{badge.labelTop}</small>
                        <strong>{badge.labelBottom}</strong>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {socialLinks && socialLinks.length > 0 && (
                <div className={styles.SocialRow}>
                  {socialLinks.map((social) => (
                    <button key={social.id} type="button" className={styles.SocialButton} aria-label={social.ariaLabel}>
                      <i className={social.iconClass} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}

              {trustPills && trustPills.length > 0 && (
                <div className={styles.TrustRow}>
                  {trustPills.map((pill) => (
                    <div key={pill.id} className={styles.TrustPill}>
                      {pill.iconClass && <i className={pill.iconClass} aria-hidden="true" />}
                      {pill.label}
                    </div>
                  ))}
                </div>
              )}

              {countdownLabel && (
                <p className={styles.CountdownRow}>
                  <i className="bi bi-hourglass-split" aria-hidden="true" />
                  {countdownLabel}
                  <strong className={styles.CountdownValue}>{formattedCountdown}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className={styles.BottomRow}>
            <div className={styles.BottomLeft}>
              {bottomText && (
                <span>
                  <i className="bi bi-c-circle" aria-hidden="true" />
                  {bottomText}
                </span>
              )}
            </div>
            <div className={styles.LangRow}>
              {shippingText && (
                <div className={styles.Pill}>
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  {shippingText}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const FOOTER_ORANGE_REGITEM: RegItem = {
  kind: "FooterOrange",
  label: "Footer Orange",
  defaults: DEFAULT_FOOTER_ORANGE_PROPS,
  inspector: [],
  render: (p) => <FooterOrange {...(p as FooterOrangeProps)} />,
};

export default FooterOrange;
