"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Footer/FooterUtility.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type FooterUtilityInfoItem = { label: string; text: string };

export type FooterUtilityLinkItem = { label: string; href: string };

export type FooterUtilityHotlineItem = { label: string; phone: string; sub?: string };

export type FooterUtilitySocialItem = { label: string; href: string; icon: string };

export type FooterUtilityPaymentItem = {
  label: string;
  imageSrc: string;
};

export type FooterUtilityBrandLogoItem = {
  label: string;
  href: string;
  imageSrc: string;
};

export type FooterUtilityTagItem = {
  label: string;
  href: string;
};

export type FooterUtilityStoreItem = {
  label: string;
  href: string;
  imageSrc: string;
};

export type FooterUtilityCert = {
  imageSrc: string;
  title: string;
  sub?: string;
};

export type FooterUtilityBrand = {
  name: string;
  tag: string;
  info?: FooterUtilityInfoItem[];
  cert?: FooterUtilityCert;
};

export type FooterUtilityProps = {
  brand?: FooterUtilityBrand;

  supportTitle?: string;
  hotlines?: FooterUtilityHotlineItem[];
  supportLinks?: FooterUtilityLinkItem[];

  aboutTitle?: string;
  aboutLinks?: FooterUtilityLinkItem[];

  partnerTitle?: string;
  partnerLinks?: FooterUtilityLinkItem[];

  newsletterTitle?: string;
  newsletterDesc?: string;
  placeholderEmail?: string;
  submitLabel?: string;
  submitAriaLabel?: string;

  socials?: FooterUtilitySocialItem[];
  paymentsTitle?: string;
  payments?: FooterUtilityPaymentItem[];

  qrImageSrc?: string;
  stores?: FooterUtilityStoreItem[];

  brandLogos?: FooterUtilityBrandLogoItem[];

  tagTitle?: string;
  tags?: FooterUtilityTagItem[];

  certificationTitle?: string;
  certificationImageSrc?: string;

  copyrightText?: string;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: FooterUtilityBrand = {
  name: "HASAKI.VN",
  tag: "Mỹ phẩm chính hãng • Giá tốt mỗi ngày • Hệ sinh thái mua sắm hiện đại cho ngành beauty retail",
  info: [
    { label: "Địa chỉ", text: "Số 29/150 Giảng Võ, Phường Giảng Võ, Hà Nội" },
    { label: "Điện thoại", text: "1800 6324" },
    { label: "Email", text: "support@example.com" },
  ],
  cert: {
    imageSrc: "/images/bocongthuong.png",
    title: "Đã thông báo Bộ Công Thương",
    sub: "Doanh nghiệp đã được xác minh",
  },
};

const DEFAULT_SUPPORT_LINKS: FooterUtilityLinkItem[] = [
  { label: "Các câu hỏi thường gặp", href: "/faq" },
  { label: "Gửi yêu cầu hỗ trợ", href: "/support" },
  { label: "Hướng dẫn đặt hàng", href: "/guide" },
  { label: "Phương thức thanh toán", href: "/payment" },
  { label: "Phương thức vận chuyển", href: "/shipping" },
  { label: "Chính sách đổi trả", href: "/refund" },
];

const DEFAULT_ABOUT_LINKS: FooterUtilityLinkItem[] = [
  { label: "Giới thiệu", href: "/about" },
  { label: "Chính sách bảo mật", href: "/privacy" },
  { label: "Điều khoản sử dụng", href: "/terms" },
  { label: "Cẩm nang", href: "/blog" },
  { label: "Tuyển dụng", href: "/jobs" },
  { label: "Liên hệ", href: "/contact" },
];

const DEFAULT_PARTNER_LINKS: FooterUtilityLinkItem[] = [
  { label: "Hasaki Clinic", href: "/clinic" },
  { label: "Dermahair", href: "/dermahair" },
];

const DEFAULT_HOTLINES: FooterUtilityHotlineItem[] = [
  { label: "Hotline", phone: "1800 6324", sub: "(Miễn phí, 08-22h kể cả T7, CN)" },
];

const DEFAULT_SOCIALS: FooterUtilitySocialItem[] = [
  { label: "Facebook", href: "#", icon: "bi-facebook" },
  { label: "Instagram", href: "#", icon: "bi-instagram" },
  { label: "TikTok", href: "#", icon: "bi-tiktok" },
];

const DEFAULT_PAYMENTS: FooterUtilityPaymentItem[] = [
  { label: "Mastercard", imageSrc: "/images/pay-mastercard.png" },
  { label: "ATM", imageSrc: "/images/pay-atm.png" },
  { label: "Visa", imageSrc: "/images/pay-visa.png" },
];

const DEFAULT_STORES: FooterUtilityStoreItem[] = [
  { label: "App Store", href: "#", imageSrc: "/images/app-store.png" },
  { label: "Google Play", href: "#", imageSrc: "/images/google-play.png" },
];

const DEFAULT_BRAND_LOGOS: FooterUtilityBrandLogoItem[] = [
  { label: "Hasaki Clinic", href: "#", imageSrc: "/images/logo-1.png" },
  { label: "Dermahair", href: "#", imageSrc: "/images/logo-2.png" },
  { label: "Synctives", href: "#", imageSrc: "/images/logo-3.png" },
  { label: "Mastige", href: "#", imageSrc: "/images/logo-4.png" },
];

const DEFAULT_TAGS: FooterUtilityTagItem[] = [
  { label: "Kem Chống Nắng", href: "/tag/kem-chong-nang" },
  { label: "Nước Tẩy Trang", href: "/tag/nuoc-tay-trang" },
  { label: "Kem Dưỡng Ẩm", href: "/tag/kem-duong-am" },
  { label: "Sữa Rửa Mặt", href: "/tag/sua-rua-mat" },
  { label: "Bông Tẩy Trang", href: "/tag/bong-tay-trang" },
  { label: "Mặt Nạ", href: "/tag/mat-na" },
  { label: "LOREAL", href: "/brand/loreal" },
  { label: "LA ROCHE POSAY", href: "/brand/la-roche-posay" },
  { label: "Son", href: "/tag/son" },
  { label: "Obagi", href: "/brand/obagi" },
  { label: "VASELINE", href: "/brand/vaseline" },
  { label: "Carslan", href: "/brand/carslan" },
  { label: "cerave", href: "/brand/cerave" },
  { label: "olay", href: "/brand/olay" },
  { label: "toner klairs", href: "/tag/toner-klairs" },
];

/* ================= JSON Helpers ================= */
function safeJson<T>(raw?: unknown): T | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/* ================= Component ================= */
export function FooterUtility({
  brand,
  supportTitle = "HỖ TRỢ KHÁCH HÀNG",
  hotlines,
  supportLinks,

  aboutTitle = "VỀ HASAKI.VN",
  aboutLinks,

  partnerTitle = "HỢP TÁC & LIÊN KẾT",
  partnerLinks,

  newsletterTitle = "ĐĂNG KÝ NHẬN TIN ƯU ĐÃI",
  newsletterDesc = "Nhận thông tin deal mới, xu hướng làm đẹp và các chiến dịch bán hàng nổi bật mỗi tuần.",
  placeholderEmail = "Nhập email của bạn",
  submitLabel = "Đăng ký",
  submitAriaLabel = "Đăng ký nhận tin",

  socials,
  paymentsTitle = "THANH TOÁN",
  payments,

  qrImageSrc = "/images/qr-app.png",
  stores,

  brandLogos,

  tagTitle = "TÌM KIẾM PHỔ BIẾN",
  tags,

  certificationTitle = "Chứng nhận",
  certificationImageSrc = "/images/bocongthuong.png",

  copyrightText = "Bản quyền © {year} HASAKI.VN",
  preview = false,
}: FooterUtilityProps) {
  const bd = useMemo(() => brand ?? DEFAULT_BRAND, [brand]);
  const hls = useMemo(() => hotlines ?? DEFAULT_HOTLINES, [hotlines]);
  const spls = useMemo(() => supportLinks ?? DEFAULT_SUPPORT_LINKS, [supportLinks]);
  const abls = useMemo(() => aboutLinks ?? DEFAULT_ABOUT_LINKS, [aboutLinks]);
  const ptls = useMemo(() => partnerLinks ?? DEFAULT_PARTNER_LINKS, [partnerLinks]);
  const scs = useMemo(() => socials ?? DEFAULT_SOCIALS, [socials]);
  const pays = useMemo(() => payments ?? DEFAULT_PAYMENTS, [payments]);
  const sts = useMemo(() => stores ?? DEFAULT_STORES, [stores]);
  const blogs = useMemo(() => brandLogos ?? DEFAULT_BRAND_LOGOS, [brandLogos]);
  const tgs = useMemo(() => tags ?? DEFAULT_TAGS, [tags]);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  };

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

    if (!ok) {
      showToast("Vui lòng nhập email hợp lệ.");
      return;
    }

    setEmail("");
    showToast("Đăng ký thành công!");
  };

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const copy = useMemo(() => copyrightText.replace("{year}", String(year)), [copyrightText, year]);

  const renderNavLink = (item: FooterUtilityLinkItem, key: React.Key, className?: string) =>
    preview ? (
      <a key={key} href="#" className={className} onClick={onBlockClick}>
        {item.label}
      </a>
    ) : (
      <Link key={key} href={(item.href || "/") as Route} className={className}>
        {item.label}
      </Link>
    );

  return (
    <footer className={cls.footer} aria-label="Footer utility">
      <div className={cls.container}>
        <section className={cls.topBand}>
          <div className={cls.brandPanel}>
            <div className={cls.brandHeader}>
              <span className={cls.eyebrow}>Commerce Utility Footer</span>
              <h2 className={cls.brandName}>{bd.name}</h2>
              <p className={cls.brandTag}>{bd.tag}</p>
            </div>

            {bd.info?.length ? (
              <div className={cls.infoGrid}>
                {bd.info.map((item, i) => (
                  <div key={i} className={cls.infoItem}>
                    <span className={cls.infoLabel}>{item.label}</span>
                    <span className={cls.infoText}>{item.text}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={cls.socialRow} aria-label="Social links">
              {scs.map((item, i) =>
                preview ? (
                  <a key={i} href="#" className={cls.socialBtn} onClick={onBlockClick} aria-label={item.label}>
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </a>
                ) : (
                  <a key={i} href={item.href} className={cls.socialBtn} aria-label={item.label} rel="noreferrer">
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </a>
                ),
              )}
            </div>
          </div>

          <div className={cls.newsPanel}>
            <div className={cls.newsHead}>
              <h3 className={cls.newsTitle}>{newsletterTitle}</h3>
              <p className={cls.newsDesc}>{newsletterDesc}</p>
            </div>

            <form className={cls.form} onSubmit={onSubmit} noValidate>
              <label className={cls.srOnly} htmlFor="footerUtilityEmail">
                Email
              </label>

              <input
                id="footerUtilityEmail"
                type="email"
                name="email"
                className={cls.input}
                placeholder={placeholderEmail}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                className={cls.submit}
                aria-label={submitAriaLabel}
                onClick={preview ? onBlockClick : undefined}
              >
                {submitLabel}
              </button>
            </form>
          </div>

          <div className={cls.quickGrid}>
            <div className={cls.quickCard}>
              <div className={cls.quickTitle}>Hotline hỗ trợ</div>
              <div className={cls.hotlineList}>
                {hls.map((item, i) => {
                  const telHref = `tel:${item.phone.replace(/[^\d+]/g, "")}`;
                  return preview ? (
                    <a key={i} href="#" className={cls.hotlineItem} onClick={onBlockClick}>
                      <span className={cls.hotlineLabel}>{item.label}</span>
                      <span className={cls.hotlinePhone}>{item.phone}</span>
                      {item.sub ? <span className={cls.hotlineSub}>{item.sub}</span> : null}
                    </a>
                  ) : (
                    <a key={i} href={telHref} className={cls.hotlineItem}>
                      <span className={cls.hotlineLabel}>{item.label}</span>
                      <span className={cls.hotlinePhone}>{item.phone}</span>
                      {item.sub ? <span className={cls.hotlineSub}>{item.sub}</span> : null}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className={cls.quickCard}>
              <div className={cls.quickTitle}>{paymentsTitle}</div>
              <div className={cls.paymentList}>
                {pays.map((item, i) => (
                  <div key={i} className={cls.paymentCard} title={item.label}>
                    <Image src={item.imageSrc} alt={item.label} width={64} height={28} className={cls.paymentImg} />
                  </div>
                ))}
              </div>
            </div>

            <div className={cls.quickCard}>
              <div className={cls.quickTitle}>Tải ứng dụng</div>
              <div className={cls.appRow}>
                <div className={cls.qrCard}>
                  <Image src={qrImageSrc} alt="QR App" width={96} height={96} className={cls.qrImg} />
                </div>

                <div className={cls.storeList}>
                  {sts.map((item, i) =>
                    preview ? (
                      <a key={i} href="#" className={cls.storeBtn} onClick={onBlockClick} aria-label={item.label}>
                        <Image
                          src={item.imageSrc}
                          alt={item.label}
                          width={140}
                          height={42}
                          className={cls.storeImg}
                        />
                      </a>
                    ) : (
                      <a key={i} href={item.href} className={cls.storeBtn} aria-label={item.label} rel="noreferrer">
                        <Image
                          src={item.imageSrc}
                          alt={item.label}
                          width={140}
                          height={42}
                          className={cls.storeImg}
                        />
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className={cls.quickCard}>
              <div className={cls.quickTitle}>{certificationTitle}</div>
              <div className={cls.certWrap}>
                <div className={cls.certCard}>
                  <Image
                    src={certificationImageSrc}
                    alt={certificationTitle}
                    width={170}
                    height={64}
                    className={cls.certImg}
                  />
                </div>
                <div className={cls.certNote}>
                  <span className={cls.certNoteTitle}>Báo cáo / xác thực Bộ Công Thương</span>
                  <span className={cls.certNoteSub}>
                    Khu vực chừa sẵn cho chứng nhận doanh nghiệp và thông tin xác minh.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cls.mainGrid}>
          <div className={cls.linkCard}>
            <h3 className={cls.cardTitle}>{supportTitle}</h3>
            <div className={cls.linkList}>
              {spls.map((item, i) => (
                <div key={i} className={cls.linkRow}>
                  {renderNavLink(item, i, cls.linkItem)}
                </div>
              ))}
            </div>
          </div>

          <div className={cls.linkCard}>
            <h3 className={cls.cardTitle}>{aboutTitle}</h3>
            <div className={cls.linkList}>
              {abls.map((item, i) => (
                <div key={i} className={cls.linkRow}>
                  {renderNavLink(item, i, cls.linkItem)}
                </div>
              ))}
            </div>
          </div>

          <div className={cls.linkCard}>
            <h3 className={cls.cardTitle}>{partnerTitle}</h3>
            <div className={cls.linkList}>
              {ptls.map((item, i) => (
                <div key={i} className={cls.linkRow}>
                  {renderNavLink(item, i, cls.linkItem)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cls.brandRailSection}>
          <div className={cls.sectionHead}>
            <h3 className={cls.sectionTitle}>Hệ sinh thái thương hiệu</h3>
          </div>

          <div className={cls.brandRail}>
            {blogs.map((item, i) =>
              preview ? (
                <a key={i} href="#" className={cls.logoItem} onClick={onBlockClick} aria-label={item.label}>
                  <Image src={item.imageSrc} alt={item.label} width={120} height={56} className={cls.logoImg} />
                </a>
              ) : (
                <a key={i} href={item.href} className={cls.logoItem} aria-label={item.label} rel="noreferrer">
                  <Image src={item.imageSrc} alt={item.label} width={120} height={56} className={cls.logoImg} />
                </a>
              ),
            )}
          </div>
        </section>

        <section className={cls.tagsSection}>
          <div className={cls.sectionHead}>
            <h3 className={cls.sectionTitle}>{tagTitle}</h3>
          </div>

          <div className={cls.tagList}>
            {tgs.map((item, i) =>
              preview ? (
                <a key={i} href="#" className={cls.tag} onClick={onBlockClick}>
                  {item.label}
                </a>
              ) : (
                <Link key={i} href={(item.href || "/") as Route} className={cls.tag}>
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </section>

        <section className={cls.bottomBar}>
          <div className={cls.bottomLeft}>
            <div className={cls.copy}>{copy}</div>
          </div>

          <div className={cls.bottomRight}>
            {bd.cert ? (
              <div className={cls.miniCert}>
                <Image src={bd.cert.imageSrc} alt={bd.cert.title} width={44} height={44} className={cls.miniCertImg} />
                <div className={cls.miniCertText}>
                  <span className={cls.miniCertTitle}>{bd.cert.title}</span>
                  {bd.cert.sub ? <span className={cls.miniCertSub}>{bd.cert.sub}</span> : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <button className={cls.toTop} type="button" aria-label="Back to top" onClick={goTop}>
        <i className="bi bi-chevron-up" aria-hidden="true" />
      </button>

      <div className={`${cls.toast} ${toast ? cls.isShow : ""}`} role="status" aria-live="polite" aria-atomic="true">
        {toast}
      </div>
    </footer>
  );
}

/* ================= RegItem ================= */
export const SHOP_FOOTER_UTILITY: RegItem = {
  kind: "FooterUtility",
  label: "Footer Utility",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),

    supportTitle: "HỖ TRỢ KHÁCH HÀNG",
    hotlines: JSON.stringify(DEFAULT_HOTLINES, null, 2),
    supportLinks: JSON.stringify(DEFAULT_SUPPORT_LINKS, null, 2),

    aboutTitle: "VỀ HASAKI.VN",
    aboutLinks: JSON.stringify(DEFAULT_ABOUT_LINKS, null, 2),

    partnerTitle: "HỢP TÁC & LIÊN KẾT",
    partnerLinks: JSON.stringify(DEFAULT_PARTNER_LINKS, null, 2),

    newsletterTitle: "ĐĂNG KÝ NHẬN TIN ƯU ĐÃI",
    newsletterDesc: "Nhận thông tin deal mới, xu hướng làm đẹp và các chiến dịch bán hàng nổi bật mỗi tuần.",
    placeholderEmail: "Nhập email của bạn",
    submitLabel: "Đăng ký",
    submitAriaLabel: "Đăng ký nhận tin",

    socials: JSON.stringify(DEFAULT_SOCIALS, null, 2),
    paymentsTitle: "THANH TOÁN",
    payments: JSON.stringify(DEFAULT_PAYMENTS, null, 2),

    qrImageSrc: "/images/qr-app.png",
    stores: JSON.stringify(DEFAULT_STORES, null, 2),

    brandLogos: JSON.stringify(DEFAULT_BRAND_LOGOS, null, 2),

    tagTitle: "TÌM KIẾM PHỔ BIẾN",
    tags: JSON.stringify(DEFAULT_TAGS, null, 2),

    certificationTitle: "Chứng nhận",
    certificationImageSrc: "/images/bocongthuong.png",

    copyrightText: "Bản quyền © {year} HASAKI.VN",
  },
  inspector: [
    { key: "brand", label: "Brand (JSON)", kind: "textarea", rows: 10 },

    { key: "supportTitle", label: "Support title", kind: "text" },
    { key: "hotlines", label: "Hotlines (JSON)", kind: "textarea", rows: 8 },
    { key: "supportLinks", label: "Support links (JSON)", kind: "textarea", rows: 12 },

    { key: "aboutTitle", label: "About title", kind: "text" },
    { key: "aboutLinks", label: "About links (JSON)", kind: "textarea", rows: 12 },

    { key: "partnerTitle", label: "Partner title", kind: "text" },
    { key: "partnerLinks", label: "Partner links (JSON)", kind: "textarea", rows: 8 },

    { key: "newsletterTitle", label: "Newsletter title", kind: "text" },
    { key: "newsletterDesc", label: "Newsletter desc", kind: "text" },
    { key: "placeholderEmail", label: "Email placeholder", kind: "text" },
    { key: "submitLabel", label: "Submit label", kind: "text" },
    { key: "submitAriaLabel", label: "Submit aria label", kind: "text" },

    { key: "socials", label: "Socials (JSON)", kind: "textarea", rows: 8 },
    { key: "paymentsTitle", label: "Payments title", kind: "text" },
    { key: "payments", label: "Payments (JSON)", kind: "textarea", rows: 8 },

    { key: "qrImageSrc", label: "QR image src", kind: "text" },
    { key: "stores", label: "Stores (JSON)", kind: "textarea", rows: 8 },

    { key: "brandLogos", label: "Brand logos (JSON)", kind: "textarea", rows: 10 },

    { key: "tagTitle", label: "Tag title", kind: "text" },
    { key: "tags", label: "Tags (JSON)", kind: "textarea", rows: 12 },

    { key: "certificationTitle", label: "Certification title", kind: "text" },
    { key: "certificationImageSrc", label: "Certification image src", kind: "text" },

    { key: "copyrightText", label: "Copyright text (use {year})", kind: "text" },
  ],
  render: (p) => {
    const brand = safeJson<FooterUtilityBrand>(p.brand);
    const hotlines = safeJson<FooterUtilityHotlineItem[]>(p.hotlines);
    const supportLinks = safeJson<FooterUtilityLinkItem[]>(p.supportLinks);
    const aboutLinks = safeJson<FooterUtilityLinkItem[]>(p.aboutLinks);
    const partnerLinks = safeJson<FooterUtilityLinkItem[]>(p.partnerLinks);
    const socials = safeJson<FooterUtilitySocialItem[]>(p.socials);
    const payments = safeJson<FooterUtilityPaymentItem[]>(p.payments);
    const stores = safeJson<FooterUtilityStoreItem[]>(p.stores);
    const brandLogos = safeJson<FooterUtilityBrandLogoItem[]>(p.brandLogos);
    const tags = safeJson<FooterUtilityTagItem[]>(p.tags);

    return (
      <div className="sectionContainer" aria-label="Shop Footer Utility">
        <FooterUtility
          brand={brand}
          supportTitle={String(p.supportTitle || "HỖ TRỢ KHÁCH HÀNG")}
          hotlines={hotlines}
          supportLinks={supportLinks}
          aboutTitle={String(p.aboutTitle || "VỀ HASAKI.VN")}
          aboutLinks={aboutLinks}
          partnerTitle={String(p.partnerTitle || "HỢP TÁC & LIÊN KẾT")}
          partnerLinks={partnerLinks}
          newsletterTitle={String(p.newsletterTitle || "ĐĂNG KÝ NHẬN TIN ƯU ĐÃI")}
          newsletterDesc={String(
            p.newsletterDesc ||
              "Nhận thông tin deal mới, xu hướng làm đẹp và các chiến dịch bán hàng nổi bật mỗi tuần.",
          )}
          placeholderEmail={String(p.placeholderEmail || "Nhập email của bạn")}
          submitLabel={String(p.submitLabel || "Đăng ký")}
          submitAriaLabel={String(p.submitAriaLabel || "Đăng ký nhận tin")}
          socials={socials}
          paymentsTitle={String(p.paymentsTitle || "THANH TOÁN")}
          payments={payments}
          qrImageSrc={String(p.qrImageSrc || "/images/qr-app.png")}
          stores={stores}
          brandLogos={brandLogos}
          tagTitle={String(p.tagTitle || "TÌM KIẾM PHỔ BIẾN")}
          tags={tags}
          certificationTitle={String(p.certificationTitle || "Chứng nhận")}
          certificationImageSrc={String(p.certificationImageSrc || "/images/bocongthuong.png")}
          copyrightText={String(p.copyrightText || "Bản quyền © {year} HASAKI.VN")}
          preview={true}
        />
      </div>
    );
  },
};

export default FooterUtility;