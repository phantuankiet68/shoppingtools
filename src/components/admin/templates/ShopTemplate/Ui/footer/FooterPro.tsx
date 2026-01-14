"use client";

import React, { useEffect, useState, FormEvent, MouseEvent } from "react";
import type { FC } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/footer/FooterPro.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterVariant = "default" | "soft" | "dark";

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
  key: FooterVariant;
  label: string;
  iconClass?: string;
};

export type FooterProProps = {
  // Brand / Topbar
  brandName?: string;
  brandTagline?: string;
  topbarDisplayLabel?: string;
  variantOptions?: VariantOption[];
  variant?: FooterVariant;

  // Newsletter
  newsletterTitle?: string;
  newsletterDescription?: string;
  emailPlaceholder?: string;
  subscribeButtonLabel?: string;
  newsletterEmptyMessage?: string;
  newsletterSuccessMessage?: string;
  chips?: string[];

  // Support & service
  supportTitle?: string;
  supportDescription?: string;
  supportLinks?: FooterLink[];

  // About
  aboutTitle?: string;
  aboutDescription?: string;
  aboutLinks?: FooterLink[];

  // App + Social
  appTitle?: string;
  appDescription?: string;
  appBadges?: StoreBadge[];
  socialLinks?: SocialLink[];

  // Bottom row
  bottomText?: string;
  shippingPillText?: string;

  // Preview mode (không cho click thật)
  preview?: boolean;
};

export const DEFAULT_FOOTER_PRO_PROPS: FooterProProps = {
  brandName: "Aurora Wear Mall",
  brandTagline: "Thời trang mỗi ngày, giao nhanh 2h",
  topbarDisplayLabel: "Chế độ hiển thị:",
  variant: "default",
  variantOptions: [
    {
      key: "default",
      label: "Default",
      iconClass: "bi bi-brightness-high",
    },
    {
      key: "soft",
      label: "Soft glow",
      iconClass: "bi bi-cloud-sun",
    },
    {
      key: "dark",
      label: "Dark night",
      iconClass: "bi bi-moon-stars",
    },
  ],

  newsletterTitle: "Nhận ưu đãi & lookbook mới",
  newsletterDescription: "Đăng ký email để nhận thông báo bộ sưu tập mới, voucher độc quyền và gợi ý mix & match theo phong cách của bạn.",
  emailPlaceholder: "Nhập email của bạn...",
  subscribeButtonLabel: "Theo dõi ưu đãi",
  newsletterEmptyMessage: "Vui lòng nhập email trước khi đăng ký nhé!",
  newsletterSuccessMessage: "Cảm ơn bạn đã đăng ký nhận ưu đãi thời trang từ Aurora Wear! 👗✨",
  chips: ["Flash Sale cuối tuần", "New Arrivals", "Ưu đãi thành viên", "Best Seller tháng này"],

  supportTitle: "Hỗ trợ & dịch vụ",
  supportDescription: "Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn trong quá trình mua sắm.",
  supportLinks: [
    {
      id: "help-center",
      label: "Trung tâm trợ giúp",
      href: "#",
      iconClass: "bi bi-chat-dots",
    },
    {
      id: "return-policy",
      label: "Chính sách đổi trả & hoàn tiền",
      href: "#",
      iconClass: "bi bi-arrow-repeat",
    },
    {
      id: "size-guide",
      label: "Hướng dẫn chọn size",
      href: "#",
      iconClass: "bi bi-rulers",
    },
    {
      id: "order-tracking",
      label: "Tra cứu đơn hàng",
      href: "#",
      iconClass: "bi bi-truck",
    },
    {
      id: "faq",
      label: "Câu hỏi thường gặp",
      href: "#",
      iconClass: "bi bi-question-circle",
    },
  ],

  aboutTitle: "Về Aurora Wear",
  aboutDescription: "Nền tảng thời trang kết nối các thương hiệu local & quốc tế.",
  aboutLinks: [
    {
      id: "about-brand",
      label: "Giới thiệu thương hiệu",
      href: "#",
      iconClass: "bi bi-people",
    },
    {
      id: "lookbook-blog",
      label: "Lookbook & blog phong cách",
      href: "#",
      iconClass: "bi bi-collection-play",
    },
    {
      id: "career",
      label: "Tuyển dụng",
      href: "#",
      iconClass: "bi bi-bag-check",
    },
    {
      id: "terms",
      label: "Điều khoản sử dụng",
      href: "#",
      iconClass: "bi bi-file-earmark-text",
    },
    {
      id: "privacy",
      label: "Chính sách bảo mật",
      href: "#",
      iconClass: "bi bi-shield-lock",
    },
  ],

  appTitle: "Tải app & kết nối",
  appDescription: "Mua sắm nhanh hơn, theo dõi đơn hàng realtime và xem ưu đãi chỉ có trên ứng dụng Aurora Wear.",
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
      id: "youtube",
      ariaLabel: "YouTube",
      iconClass: "bi bi-youtube",
      href: "#",
    },
    {
      id: "tiktok",
      ariaLabel: "TikTok",
      iconClass: "bi bi-tiktok",
      href: "#",
    },
  ],

  bottomText: "2025 Aurora Wear Mall. All rights reserved.",
  shippingPillText: "Giao hàng toàn quốc",

  preview: false,
};

const FooterPro: FC<FooterProProps> = (props) => {
  const {
    brandName = DEFAULT_FOOTER_PRO_PROPS.brandName,
    brandTagline = DEFAULT_FOOTER_PRO_PROPS.brandTagline,
    topbarDisplayLabel = DEFAULT_FOOTER_PRO_PROPS.topbarDisplayLabel,
    variantOptions = DEFAULT_FOOTER_PRO_PROPS.variantOptions,
    variant = DEFAULT_FOOTER_PRO_PROPS.variant,

    newsletterTitle = DEFAULT_FOOTER_PRO_PROPS.newsletterTitle,
    newsletterDescription = DEFAULT_FOOTER_PRO_PROPS.newsletterDescription,
    emailPlaceholder = DEFAULT_FOOTER_PRO_PROPS.emailPlaceholder,
    subscribeButtonLabel = DEFAULT_FOOTER_PRO_PROPS.subscribeButtonLabel,
    newsletterEmptyMessage = DEFAULT_FOOTER_PRO_PROPS.newsletterEmptyMessage,
    newsletterSuccessMessage = DEFAULT_FOOTER_PRO_PROPS.newsletterSuccessMessage,
    chips = DEFAULT_FOOTER_PRO_PROPS.chips,

    supportTitle = DEFAULT_FOOTER_PRO_PROPS.supportTitle,
    supportDescription = DEFAULT_FOOTER_PRO_PROPS.supportDescription,
    supportLinks = DEFAULT_FOOTER_PRO_PROPS.supportLinks,

    aboutTitle = DEFAULT_FOOTER_PRO_PROPS.aboutTitle,
    aboutDescription = DEFAULT_FOOTER_PRO_PROPS.aboutDescription,
    aboutLinks = DEFAULT_FOOTER_PRO_PROPS.aboutLinks,

    appTitle = DEFAULT_FOOTER_PRO_PROPS.appTitle,
    appDescription = DEFAULT_FOOTER_PRO_PROPS.appDescription,
    appBadges = DEFAULT_FOOTER_PRO_PROPS.appBadges,
    socialLinks = DEFAULT_FOOTER_PRO_PROPS.socialLinks,

    bottomText = DEFAULT_FOOTER_PRO_PROPS.bottomText,
    shippingPillText = DEFAULT_FOOTER_PRO_PROPS.shippingPillText,

    preview = DEFAULT_FOOTER_PRO_PROPS.preview,
  } = props;

  const [activeVariant, setActiveVariant] = useState<FooterVariant>(variant ?? "default");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    setActiveVariant(variant ?? "default");
  }, [variant]);

  const handleAnchorClick =
    (href?: string) =>
    (e: MouseEvent<HTMLAnchorElement>): void => {
      if (preview || !href || href === "#") {
        e.preventDefault();
        return;
      }
      // Hook router (Next.js) nếu cần
    };

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;

    const value = newsletterEmail.trim();
    if (!value) {
      if (typeof window !== "undefined" && newsletterEmptyMessage) {
        window.alert(newsletterEmptyMessage);
      }
      return;
    }

    if (typeof window !== "undefined" && newsletterSuccessMessage) {
      window.alert(newsletterSuccessMessage);
    }
    setNewsletterEmail("");
  };

  const handleVariantClick = (key: FooterVariant) => {
    setActiveVariant(key);
  };

  const footerClassNames = [styles.MallFooter, activeVariant === "soft" ? styles.VariantSoft : "", activeVariant === "dark" ? styles.VariantDark : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.MallFooterWrap}>
      <footer className={footerClassNames} aria-label="Aurora Wear mall footer">
        <div className={styles.MallFooterInner}>
          {/* Topbar: brand + variant switch */}
          <div className={styles.FooterTopbar}>
            <div className={styles.Brand}>
              <div className={styles.Logo}>
                <i className="bi bi-bag-heart" aria-hidden="true" />
              </div>
              <div className={styles.BrandText}>
                <span className={styles.BrandMain}>{brandName}</span>
                {brandTagline && <span className={styles.BrandSub}>{brandTagline}</span>}
              </div>
            </div>

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

          {/* Main grid */}
          <div className={styles.Grid}>
            {/* Col 1: Newsletter + chips */}
            <div className={styles.Col}>
              {newsletterTitle && <div className={styles.ColTitle}>{newsletterTitle}</div>}
              {newsletterDescription && <p className={styles.ColText}>{newsletterDescription}</p>}

              <form className={styles.NewsletterForm} onSubmit={handleNewsletterSubmit}>
                <div className={styles.InputWrap}>
                  <i className="bi bi-envelope" aria-hidden="true" />
                  <input className={styles.Input} type="email" placeholder={emailPlaceholder} value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} />
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
                      {idx === 0 && <i className="bi bi-lightning-charge" aria-hidden="true" />}
                      {idx === 1 && <i className="bi bi-stars" aria-hidden="true" />}
                      {idx === 2 && <i className="bi bi-gift" aria-hidden="true" />}
                      {idx === 3 && <i className="bi bi-heart" aria-hidden="true" />}
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2: Support & services */}
            <div className={styles.Col}>
              {supportTitle && <div className={styles.ColTitle}>{supportTitle}</div>}
              {supportDescription && <p className={styles.ColText}>{supportDescription}</p>}
              {supportLinks && supportLinks.length > 0 && (
                <ul className={styles.List}>
                  {supportLinks.map((item) => (
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

            {/* Col 4: App + Social */}
            <div className={styles.Col}>
              {appTitle && <div className={styles.ColTitle}>{appTitle}</div>}
              {appDescription && <p className={styles.ColText}>{appDescription}</p>}

              {appBadges && appBadges.length > 0 && (
                <div className={styles.Badges}>
                  {appBadges.map((badge) => (
                    <a key={badge.id} href={badge.href || "#"} onClick={handleAnchorClick(badge.href)} className={styles.BadgeStore}>
                      {badge.iconClass && <i className={badge.iconClass} aria-hidden="true" />}
                      <span>
                        <small>{badge.labelTop}</small>
                        <strong>{badge.labelBottom}</strong>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {socialLinks && socialLinks.length > 0 && (
                <div className={styles.SocialRow}>
                  {socialLinks.map((social) => (
                    <a key={social.id} href={social.href || "#"} aria-label={social.ariaLabel} onClick={handleAnchorClick(social.href)} className={styles.SocialButton}>
                      <i className={social.iconClass} aria-hidden="true" />
                    </a>
                  ))}
                </div>
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
            <div className={styles.LangCurrency}>
              {shippingPillText && (
                <div className={styles.Pill}>
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  {shippingPillText}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const FOOTER_PRO_REGITEM: RegItem = {
  kind: "FooterPro",
  label: "Footer Pro",
  defaults: DEFAULT_FOOTER_PRO_PROPS,
  inspector: [],
  render: (p) => <FooterPro {...(p as FooterProProps)} />,
};

export default FooterPro;
