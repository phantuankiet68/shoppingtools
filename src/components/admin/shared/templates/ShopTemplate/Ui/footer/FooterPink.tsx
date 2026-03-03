"use client";

import React, { useEffect, useState, FormEvent, MouseEvent } from "react";
import type { FC } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/footer/FooterPink.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FooterPinkVariant = "aurora" | "glass" | "dusk";

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
  key: FooterPinkVariant;
  label: string;
  iconClass?: string;
};

export type MetricChip = {
  id: string;
  label: string;
  iconClass?: string;
};

export type ContactItem = {
  id: string;
  text: string;
  iconClass?: string;
};

export type FooterPinkProps = {
  // Brand / top row
  brandName?: string;
  brandTagline?: string;
  topbarDisplayLabel?: string;
  variantOptions?: VariantOption[];
  variant?: FooterPinkVariant;

  // Metrics (chips hàng trên)
  metrics?: MetricChip[];

  // Newsletter
  newsletterTitle?: string;
  newsletterDescription?: string;
  emailPlaceholder?: string;
  subscribeButtonLabel?: string;
  newsletterEmptyMessage?: string;
  newsletterSuccessMessage?: string;
  chips?: string[];

  // Shop / quick links
  shopTitle?: string;
  shopDescription?: string;
  shopLinks?: FooterLink[];

  // Policy / support
  policyTitle?: string;
  policyDescription?: string;
  policyLinks?: FooterLink[];

  // About / contact
  aboutTitle?: string;
  contactItems?: ContactItem[];

  // App + Social
  appBadges?: StoreBadge[];
  socialLinks?: SocialLink[];

  // Bottom row
  bottomText?: string;
  langCurrencyText?: string;

  // Preview mode (không cho điều hướng thật / alert thật)
  preview?: boolean;
};

export const DEFAULT_FOOTER_PINK_PROPS: FooterPinkProps = {
  brandName: "Aurora Pink Studio",
  brandTagline: "Boutique thời trang nữ pastel • 2025",
  topbarDisplayLabel: "Chế độ footer:",
  variant: "aurora",
  variantOptions: [
    {
      key: "aurora",
      label: "Aurora Pink",
      iconClass: "bi bi-stars",
    },
    {
      key: "glass",
      label: "Glass",
      iconClass: "bi bi-droplet-half",
    },
    {
      key: "dusk",
      label: "Dusk",
      iconClass: "bi bi-moon-stars",
    },
  ],

  metrics: [
    {
      id: "ship",
      label: "Giao nhanh 2h tại HCM & HN",
      iconClass: "bi bi-truck",
    },
    {
      id: "exchange",
      label: "Đổi size trong 7 ngày",
      iconClass: "bi bi-arrow-repeat",
    },
    {
      id: "secure",
      label: "Thanh toán an toàn",
      iconClass: "bi bi-shield-check",
    },
    {
      id: "rating",
      label: "5.000+ đánh giá 5★",
      iconClass: "bi bi-star",
    },
  ],

  newsletterTitle: "Nhận bản tin outfit",
  newsletterDescription:
    "Mỗi tuần một email: outfit gợi ý cho từng mood, ưu đãi bí mật & thông báo drop bộ sưu tập giới hạn.",
  emailPlaceholder: "Nhập email để nhận ưu đãi 50K...",
  subscribeButtonLabel: "Đăng ký ngay",
  newsletterEmptyMessage: "Bạn vui lòng nhập email trước khi đăng ký nha 💌",
  newsletterSuccessMessage: "Đã đăng ký nhận bản tin outfit thành công! ✨",
  chips: ["New in tuần này", "Bộ sưu tập Summer Pastel", "Best seller văn phòng"],

  shopTitle: "Mua sắm nhanh",
  shopDescription: "Chọn nhanh theo dòng sản phẩm bạn yêu thích.",
  shopLinks: [
    {
      id: "dress-pastel",
      label: "Váy & đầm pastel",
      href: "#",
      iconClass: "bi bi-flower3",
    },
    {
      id: "blouse",
      label: "Áo sơ mi & blouse",
      href: "#",
      iconClass: "bi bi-blush",
    },
    {
      id: "pants-skirt",
      label: "Quần, chân váy",
      href: "#",
      iconClass: "bi bi-badge-cc",
    },
    {
      id: "pre-set",
      label: "Set đồ phối sẵn",
      href: "#",
      iconClass: "bi bi-stars",
    },
    {
      id: "accessories",
      label: "Phụ kiện & túi ví",
      href: "#",
      iconClass: "bi bi-gem",
    },
  ],

  policyTitle: "Chính sách & hỗ trợ",
  policyDescription: "Đội ngũ Aurora Care luôn ở đây khi bạn cần.",
  policyLinks: [
    {
      id: "help-center",
      label: "Trung tâm trợ giúp",
      href: "#",
      iconClass: "bi bi-chat-dots",
    },
    {
      id: "return",
      label: "Chính sách đổi trả & hoàn tiền",
      href: "#",
      iconClass: "bi bi-arrow-repeat",
    },
    {
      id: "shipping",
      label: "Giao hàng & phí vận chuyển",
      href: "#",
      iconClass: "bi bi-truck",
    },
    {
      id: "payment",
      label: "Hướng dẫn thanh toán",
      href: "#",
      iconClass: "bi bi-credit-card",
    },
    {
      id: "member",
      label: "Chương trình thành viên",
      href: "#",
      iconClass: "bi bi-person-heart",
    },
  ],

  aboutTitle: "Về Aurora Pink",
  contactItems: [
    {
      id: "hotline",
      text: "Hotline: 1900 1234 (8:00 – 21:00)",
      iconClass: "bi bi-telephone",
    },
    {
      id: "email",
      text: "support@aurorapink.vn",
      iconClass: "bi bi-envelope",
    },
    {
      id: "showroom",
      text: "Showroom: Q.1, TP. HCM & Quận Hoàn Kiếm, Hà Nội",
      iconClass: "bi bi-geo-alt",
    },
  ],

  appBadges: [
    {
      id: "google-play",
      labelTop: "Tải app trên",
      labelBottom: "Google Play",
      iconClass: "bi bi-google-play",
      href: "#",
    },
    {
      id: "app-store",
      labelTop: "Tải app trên",
      labelBottom: "App Store",
      iconClass: "bi bi-apple",
      href: "#",
    },
  ],

  socialLinks: [
    {
      id: "instagram",
      ariaLabel: "Instagram",
      iconClass: "bi bi-instagram",
      href: "#",
    },
    {
      id: "facebook",
      ariaLabel: "Facebook",
      iconClass: "bi bi-facebook",
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

  bottomText: "2025 Aurora Pink Studio. All rights reserved.",
  langCurrencyText: "VN & Toàn quốc",

  preview: false,
};

const FooterPink: FC<FooterPinkProps> = (props) => {
  const {
    brandName = DEFAULT_FOOTER_PINK_PROPS.brandName,
    brandTagline = DEFAULT_FOOTER_PINK_PROPS.brandTagline,
    topbarDisplayLabel = DEFAULT_FOOTER_PINK_PROPS.topbarDisplayLabel,
    variantOptions = DEFAULT_FOOTER_PINK_PROPS.variantOptions,
    variant = DEFAULT_FOOTER_PINK_PROPS.variant,

    metrics = DEFAULT_FOOTER_PINK_PROPS.metrics,

    newsletterTitle = DEFAULT_FOOTER_PINK_PROPS.newsletterTitle,
    newsletterDescription = DEFAULT_FOOTER_PINK_PROPS.newsletterDescription,
    emailPlaceholder = DEFAULT_FOOTER_PINK_PROPS.emailPlaceholder,
    subscribeButtonLabel = DEFAULT_FOOTER_PINK_PROPS.subscribeButtonLabel,
    newsletterEmptyMessage = DEFAULT_FOOTER_PINK_PROPS.newsletterEmptyMessage,
    newsletterSuccessMessage = DEFAULT_FOOTER_PINK_PROPS.newsletterSuccessMessage,
    chips = DEFAULT_FOOTER_PINK_PROPS.chips,

    shopTitle = DEFAULT_FOOTER_PINK_PROPS.shopTitle,
    shopDescription = DEFAULT_FOOTER_PINK_PROPS.shopDescription,
    shopLinks = DEFAULT_FOOTER_PINK_PROPS.shopLinks,

    policyTitle = DEFAULT_FOOTER_PINK_PROPS.policyTitle,
    policyDescription = DEFAULT_FOOTER_PINK_PROPS.policyDescription,
    policyLinks = DEFAULT_FOOTER_PINK_PROPS.policyLinks,

    aboutTitle = DEFAULT_FOOTER_PINK_PROPS.aboutTitle,
    contactItems = DEFAULT_FOOTER_PINK_PROPS.contactItems,

    appBadges = DEFAULT_FOOTER_PINK_PROPS.appBadges,
    socialLinks = DEFAULT_FOOTER_PINK_PROPS.socialLinks,

    bottomText = DEFAULT_FOOTER_PINK_PROPS.bottomText,
    langCurrencyText = DEFAULT_FOOTER_PINK_PROPS.langCurrencyText,

    preview = DEFAULT_FOOTER_PINK_PROPS.preview,
  } = props;

  const [activeVariant, setActiveVariant] = useState<FooterPinkVariant>(variant ?? "aurora");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setActiveVariant(variant ?? "aurora");
  }, [variant]);

  const handleAnchorClick =
    (href?: string) =>
    (e: MouseEvent<HTMLAnchorElement>): void => {
      if (preview || !href || href === "#") {
        e.preventDefault();
        return;
      }
      // gắn router nếu cần
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

  const handleVariantClick = (key: FooterPinkVariant) => {
    setActiveVariant(key);
  };

  const footerClassNames = [
    styles.Footer,
    activeVariant === "glass" ? styles.FooterGlass : "",
    activeVariant === "dusk" ? styles.FooterDusk : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.FooterWrap}>
      <footer className={footerClassNames} aria-label="Aurora Pink footer">
        <div className={styles.FooterInner}>
          {/* Top row: brand + variants */}
          <div className={styles.TopRow}>
            <div className={styles.Brand}>
              <div className={styles.Logo}>
                <i className="bi bi-heart" aria-hidden="true" />
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
                    onClick={() => handleVariantClick(opt.key)}
                    data-variant={opt.key}
                  >
                    {opt.iconClass && <i className={opt.iconClass} aria-hidden="true" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metrics */}
          {metrics && metrics.length > 0 && (
            <div className={styles.MetricsRow}>
              {metrics.map((m) => (
                <div key={m.id} className={styles.MetricChip}>
                  {m.iconClass && <i className={m.iconClass} aria-hidden="true" />}
                  {m.label}
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className={styles.Grid}>
            {/* Col 1: Newsletter + tags */}
            <div className={styles.Col}>
              {newsletterTitle && <div className={styles.ColTitle}>{newsletterTitle}</div>}
              {newsletterDescription && <p className={styles.ColText}>{newsletterDescription}</p>}

              <form className={styles.NewsForm} onSubmit={handleNewsletterSubmit}>
                <div className={styles.InputWrap}>
                  <i className="bi bi-envelope-heart" aria-hidden="true" />
                  <input
                    type="email"
                    className={styles.Input}
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                      {idx === 0 && <i className="bi bi-fire" aria-hidden="true" />}
                      {idx === 1 && <i className="bi bi-sun" aria-hidden="true" />}
                      {idx === 2 && <i className="bi bi-heart-pulse" aria-hidden="true" />}
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2: Shop */}
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

            {/* Col 3: Policy & support */}
            <div className={styles.Col}>
              {policyTitle && <div className={styles.ColTitle}>{policyTitle}</div>}
              {policyDescription && <p className={styles.ColText}>{policyDescription}</p>}
              {policyLinks && policyLinks.length > 0 && (
                <ul className={styles.List}>
                  {policyLinks.map((item) => (
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

            {/* Col 4: About + contact + app + social */}
            <div className={styles.Col}>
              {aboutTitle && <div className={styles.ColTitle}>{aboutTitle}</div>}

              {contactItems && contactItems.length > 0 && (
                <ul className={styles.ContactList}>
                  {contactItems.map((c) => (
                    <li key={c.id} className={styles.ContactItem}>
                      {c.iconClass && <i className={c.iconClass} aria-hidden="true" />}
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ul>
              )}

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
                  {socialLinks.map((s) => (
                    <button key={s.id} type="button" className={styles.SocialButton} aria-label={s.ariaLabel}>
                      <i className={s.iconClass} aria-hidden="true" />
                    </button>
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
              {langCurrencyText && (
                <div className={styles.Pill}>
                  <i className="bi bi-globe2" aria-hidden="true" />
                  {langCurrencyText}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const FOOTER_PINK_REGITEM: RegItem = {
  kind: "FooterPink",
  label: "Footer Pink",
  defaults: DEFAULT_FOOTER_PINK_PROPS,
  inspector: [],
  render: (p) => <FooterPink {...(p as FooterPinkProps)} />,
};

export default FooterPink;
