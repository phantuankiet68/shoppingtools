"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Voucher/VoucherOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import AccountSidebar from "@/components/admin/shared/templates/components/AccountSidebar";

export type VoucherSidebarItem = {
  icon: string;
  label: string;
  href: string;
  badge?: string;
  active?: boolean;
};

export type VoucherTabItem = {
  key: string;
  label: string;
};

export type VoucherStatItem = {
  icon: string;
  label: string;
  value: string;
  sub?: string;
};

export type VoucherCardItem = {
  id: string;
  brand?: string;
  stockLabel?: string;
  paymentLabel?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  startAt?: string;
  termsLabel?: string;
  useLabel?: string;
  href?: string;
  termsHref?: string;
  active?: boolean;
};

export type VoucherOneProps = {
  preview?: boolean;

  avatar?: string;
  customerName?: string;
  customerEmail?: string;
  customerEditHref?: string;
  customerRankText?: string;
  customerTagline?: string;

  sidebarItems?: VoucherSidebarItem[];
  tabs?: VoucherTabItem[];
  activeTab?: string;

  stats?: VoucherStatItem[];

  searchPlaceholder?: string;
  searchValue?: string;

  vouchers?: VoucherCardItem[];
};

const DEFAULT_AVATAR = "/assets/images/logo.jpg";

const DEFAULT_SIDEBAR: VoucherSidebarItem[] = [
  { icon: "bi-bell", label: "Notifications", href: "/account/notification" },
  { icon: "bi-person", label: "My Account", href: "/account/profile" },
  { icon: "bi-receipt", label: "My Orders", href: "/account" },
  { icon: "bi-ticket-perforated", label: "My Vouchers", href: "/account/voucher", active: true },
  { icon: "bi-shield-lock", label: "Security", href: "/account/security" },
];

const DEFAULT_TABS: VoucherTabItem[] = [
  { key: "all", label: "Tất cả voucher" },
  { key: "available", label: "Có thể dùng" },
  { key: "expiring", label: "Sắp hết hạn" },
  { key: "saved", label: "Đã lưu" },
];

const DEFAULT_STATS: VoucherStatItem[] = [
  { icon: "bi-ticket-perforated", label: "Voucher khả dụng", value: "12", sub: "Sẵn sàng áp dụng" },
  { icon: "bi-lightning-charge", label: "Flash deal", value: "04", sub: "Ưu đãi giới hạn" },
  { icon: "bi-clock-history", label: "Sắp hết hạn", value: "03", sub: "Trong 48 giờ tới" },
  { icon: "bi-coin", label: "Tiết kiệm dự kiến", value: "1.2tr", sub: "Nếu dùng tối ưu" },
];

const DEFAULT_VOUCHERS: VoucherCardItem[] = [
  {
    id: "voucher-1",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
    active: true,
  },
  {
    id: "voucher-2",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
  },
  {
    id: "voucher-3",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
  },
  {
    id: "voucher-4",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
  },
  {
    id: "voucher-5",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
  },
  {
    id: "voucher-6",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
  },
  {
    id: "voucher-7",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
  },
  {
    id: "voucher-8",
    brand: "Store",
    stockLabel: "Limited Stock",
    paymentLabel: "StorePay",
    title: "10% coins cashback",
    subtitle: "Min. Spend RM90 Capped at 9...",
    badge: "Mall & Preferred",
    startAt: "Start At 21.08.2020 00:00",
    termsLabel: "T&C",
    useLabel: "Use",
    href: "/checkout",
    termsHref: "/terms",
  },
];

function parseSidebarItems(raw?: string): VoucherSidebarItem[] {
  if (!raw) return DEFAULT_SIDEBAR;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_SIDEBAR;

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any) => ({
        icon: String(item?.icon ?? "bi-circle"),
        label: String(item?.label ?? ""),
        href: String(item?.href ?? "/"),
        badge: item?.badge ? String(item.badge) : undefined,
        active: Boolean(item?.active),
      }))
      .filter((item) => item.label);

    return cleaned.length ? cleaned : DEFAULT_SIDEBAR;
  } catch {
    return DEFAULT_SIDEBAR;
  }
}

function parseTabs(raw?: string): VoucherTabItem[] {
  if (!raw) return DEFAULT_TABS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TABS;

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any) => ({
        key: String(item?.key ?? ""),
        label: String(item?.label ?? ""),
      }))
      .filter((item) => item.key && item.label);

    return cleaned.length ? cleaned : DEFAULT_TABS;
  } catch {
    return DEFAULT_TABS;
  }
}

function parseStats(raw?: string): VoucherStatItem[] {
  if (!raw) return DEFAULT_STATS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_STATS;

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any) => ({
        icon: String(item?.icon ?? "bi-circle"),
        label: String(item?.label ?? ""),
        value: String(item?.value ?? ""),
        sub: item?.sub ? String(item.sub) : "",
      }))
      .filter((item) => item.label && item.value);

    return cleaned.length ? cleaned : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

function parseVouchers(raw?: string): VoucherCardItem[] {
  if (!raw) return DEFAULT_VOUCHERS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_VOUCHERS;

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any, index: number) => ({
        id: String(item?.id ?? `voucher-${index + 1}`),
        brand: String(item?.brand ?? "Store"),
        stockLabel: String(item?.stockLabel ?? "Limited Stock"),
        paymentLabel: String(item?.paymentLabel ?? "StorePay"),
        title: String(item?.title ?? ""),
        subtitle: item?.subtitle ? String(item.subtitle) : "",
        badge: item?.badge ? String(item.badge) : "",
        startAt: item?.startAt ? String(item.startAt) : "",
        termsLabel: item?.termsLabel ? String(item.termsLabel) : "T&C",
        useLabel: item?.useLabel ? String(item.useLabel) : "Use",
        href: item?.href ? String(item.href) : "/checkout",
        termsHref: item?.termsHref ? String(item.termsHref) : "/terms",
        active: Boolean(item?.active),
      }))
      .filter((item) => item.title);

    return cleaned.length ? cleaned : DEFAULT_VOUCHERS;
  } catch {
    return DEFAULT_VOUCHERS;
  }
}

type SmartLinkProps = {
  preview?: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
};

function SmartLink({ preview, href, className, children }: SmartLinkProps) {
  if (preview) {
    return (
      <a
        href="#"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={className}>
      {children}
    </Link>
  );
}

export function VoucherOne({
  preview = false,
  avatar = DEFAULT_AVATAR,
  customerName = "60pxxlr7cw",
  customerEmail = "tuankietity@gmail.com",
  customerEditHref = "/account/profile",
  customerRankText = "Voucher Hunter",
  customerTagline = "Manage saved deals, cashback offers, and limited-time benefits in one modern place.",
  sidebarItems = DEFAULT_SIDEBAR,
  tabs = DEFAULT_TABS,
  activeTab = "all",
  stats = DEFAULT_STATS,
  searchPlaceholder = "Search by voucher name, payment label, or tag",
  searchValue = "",
  vouchers = DEFAULT_VOUCHERS,
}: VoucherOneProps) {
  const [keyword, setKeyword] = useState(searchValue);

  const visibleVouchers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return vouchers;

    return vouchers.filter((voucher) => {
      const fields = [
        voucher.brand || "",
        voucher.stockLabel || "",
        voucher.paymentLabel || "",
        voucher.title || "",
        voucher.subtitle || "",
        voucher.badge || "",
        voucher.startAt || "",
      ]
        .join(" ")
        .toLowerCase();

      return fields.includes(q);
    });
  }, [keyword, vouchers]);

  return (
    <section className={cls.voucherOne}>
      <div className={cls.container}>
        <AccountSidebar
          preview={preview}
          avatar={avatar}
          customerName={customerName}
          customerEmail={customerEmail}
          customerEditHref={customerEditHref}
          customerRankText={customerRankText}
          customerTagline={customerTagline}
          sidebarItems={sidebarItems}
        />

        <div className={cls.main}>
          <div className={cls.heroPanel}>
            <div className={cls.heroRight}>
              {stats.map((item, index) => (
                <div key={`${item.label}-${index}`} className={cls.statCard}>
                  <span className={cls.statIcon}>
                    <i className={`bi ${item.icon}`} />
                  </span>

                  <div className={cls.statContent}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                    {!!item.sub && <small>{item.sub}</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cls.toolbar}>
            <div className={cls.tabsBar}>
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <button key={tab.key} type="button" className={`${cls.tabBtn} ${isActive ? cls.tabBtnActive : ""}`}>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className={cls.searchBar}>
              <span className={cls.searchIcon}>
                <i className="bi bi-search" />
              </span>

              <input
                type="text"
                value={keyword}
                placeholder={searchPlaceholder}
                onChange={(e) => setKeyword(e.target.value)}
                className={cls.searchInput}
              />
            </div>
          </div>

          <div className={cls.voucherGrid}>
            {visibleVouchers.map((voucher) => (
              <article key={voucher.id} className={`${cls.voucherCard} ${voucher.active ? cls.voucherCardActive : ""}`}>
                {!!voucher.stockLabel && <span className={cls.stockFlag}>{voucher.stockLabel}</span>}

                <div className={cls.voucherBrand}>
                  <div className={cls.brandInner}>
                    <span className={cls.brandIcon}>
                      <i className="bi bi-bag" />
                    </span>
                    <strong className={cls.brandName}>{voucher.brand || "Brand"}</strong>
                  </div>
                </div>

                <div className={cls.voucherBody}>
                  <div className={cls.voucherTop}>
                    <div className={cls.voucherHeadline}>
                      {!!voucher.paymentLabel && <span className={cls.paymentPill}>{voucher.paymentLabel}</span>}
                      <h3 className={cls.voucherTitle}>{voucher.title}</h3>
                      {!!voucher.subtitle && <p className={cls.voucherSubtitle}>{voucher.subtitle}</p>}
                    </div>

                    <SmartLink preview={preview} href={voucher.href || "/checkout"} className={cls.useLink}>
                      <span>{voucher.useLabel || "Use"}</span>
                      <i className="bi bi-chevron-right" />
                    </SmartLink>
                  </div>

                  <div className={cls.voucherMeta}>
                    {!!voucher.badge && <span className={cls.metaBadge}>{voucher.badge}</span>}
                    {!!voucher.startAt && <p className={cls.startAt}>{voucher.startAt}</p>}
                  </div>
                </div>
              </article>
            ))}

            {!visibleVouchers.length && (
              <div className={cls.emptyState}>
                <span className={cls.emptyIcon}>
                  <i className="bi bi-ticket-perforated" />
                </span>
                <strong>No matching vouchers found</strong>
                <p>Please try a different keyword or switch to another voucher tab.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const SHOP_VOUCHER_ONE: RegItem = {
  kind: "VoucherOne",
  label: "Voucher One",
  defaults: {
    avatar: DEFAULT_AVATAR,
    customerName: "60pxxlr7cw",
    customerEmail: "tuankietity@gmail.com",
    customerEditHref: "/account/profile",
    customerRankText: "Voucher Hunter",
    customerTagline: "Manage saved deals, cashback offers, and limited-time benefits in one modern place.",
    activeTab: "all",
    searchPlaceholder: "Search by voucher name, payment label, or tag",
    searchValue: "",
    sidebarItems: JSON.stringify(DEFAULT_SIDEBAR, null, 2),
    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
    stats: JSON.stringify(DEFAULT_STATS, null, 2),
    vouchers: JSON.stringify(DEFAULT_VOUCHERS, null, 2),
  },
  inspector: [
    { key: "avatar", label: "Avatar", kind: "text" },
    { key: "customerName", label: "Customer Name", kind: "text" },
    { key: "customerEmail", label: "Customer Email", kind: "text" },
    { key: "customerEditHref", label: "Customer Edit Href", kind: "text" },
    { key: "customerRankText", label: "Customer Rank Text", kind: "text" },
    { key: "customerTagline", label: "Customer Tagline", kind: "textarea", rows: 4 },
    { key: "activeTab", label: "Active Tab", kind: "text" },
    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "searchValue", label: "Search Value", kind: "text" },
    { key: "sidebarItems", label: "Sidebar Items (JSON)", kind: "textarea", rows: 12 },
    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 12 },
    { key: "stats", label: "Stats (JSON)", kind: "textarea", rows: 12 },
    { key: "vouchers", label: "Vouchers (JSON)", kind: "textarea", rows: 18 },
  ],
  render: (props) => {
    const data = props as Record<string, any>;

    return (
      <div aria-label="Voucher One">
        <VoucherOne
          preview={Boolean(data.preview)}
          avatar={data.avatar}
          customerName={data.customerName}
          customerEmail={data.customerEmail}
          customerEditHref={data.customerEditHref}
          customerRankText={data.customerRankText}
          customerTagline={data.customerTagline}
          activeTab={data.activeTab || "all"}
          searchPlaceholder={data.searchPlaceholder}
          searchValue={data.searchValue}
          sidebarItems={parseSidebarItems(data.sidebarItems)}
          tabs={parseTabs(data.tabs)}
          stats={parseStats(data.stats)}
          vouchers={parseVouchers(data.vouchers)}
        />
      </div>
    );
  },
};

export default VoucherOne;
