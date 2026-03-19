"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Sidebar/SidebarDashboard.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SidebarDashboardNavChildItem = {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  caption?: string;
};

export type SidebarDashboardNavItem = {
  label: string;
  href?: string;
  icon: string;
  badge?: string;
  active?: boolean;
  children?: SidebarDashboardNavChildItem[];
};

export type SidebarDashboardProfile = {
  name: string;
  email: string;
  avatarSrc: string;
};

export type SidebarDashboardBrand = {
  name: string;
  logoText?: string;
  dotColor?: string;
};

export type SidebarDashboardProps = {
  brand?: SidebarDashboardBrand;

  searchPlaceholder?: string;

  mainTitle?: string;
  mainItems?: SidebarDashboardNavItem[];

  otherTitle?: string;
  otherItems?: SidebarDashboardNavItem[];

  lightLabel?: string;
  darkLabel?: string;

  profile?: SidebarDashboardProfile;

  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: SidebarDashboardBrand = {
  name: "Sellmatic",
  logoText: "S",
  dotColor: "#4f46e5",
};

const DEFAULT_MAIN_ITEMS: SidebarDashboardNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "bi-grid-1x2-fill", active: true },
  { label: "Orders", href: "/orders", icon: "bi-bag-check-fill", badge: "28" },
  {
    label: "Products",
    href: "/products",
    icon: "bi-box-seam-fill",
    children: [
      { label: "All Products", href: "/products/all", icon: "bi-grid", active: true, caption: "Catalog center" },
      { label: "Collections", href: "/products/collections", icon: "bi-stars", caption: "Seasonal sets" },
      { label: "Inventory", href: "/products/inventory", icon: "bi-boxes", caption: "Stock control" },
    ],
  },
  { label: "Customers", href: "/customers", icon: "bi-people-fill" },
  { label: "Marketing", href: "/marketing", icon: "bi-megaphone-fill", badge: "New" },
];

const DEFAULT_OTHER_ITEMS: SidebarDashboardNavItem[] = [
  { label: "Analytics", href: "/analytics", icon: "bi-graph-up-arrow" },
  { label: "Inbox", href: "/inbox", icon: "bi-chat-left-dots-fill" },
  { label: "Settings", href: "/settings", icon: "bi-sliders2-vertical" },
];

const DEFAULT_PROFILE: SidebarDashboardProfile = {
  name: "Abdullaev Rustam",
  email: "rustam@gmail.com",
  avatarSrc: "/images/avatar-1.png",
};

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
export function SidebarDashboard({
  brand,
  searchPlaceholder = "Search orders, products, campaigns...",
  mainTitle = "Commerce",
  mainItems,
  otherTitle = "Workspace",
  otherItems,
  lightLabel = "Light",
  darkLabel = "Dark",
  profile,
  preview = false,
}: SidebarDashboardProps) {
  const bd = useMemo(() => brand ?? DEFAULT_BRAND, [brand]);
  const mains = useMemo(() => mainItems ?? DEFAULT_MAIN_ITEMS, [mainItems]);
  const others = useMemo(() => otherItems ?? DEFAULT_OTHER_ITEMS, [otherItems]);
  const pf = useMemo(() => profile ?? DEFAULT_PROFILE, [profile]);

  const initialExpanded = useMemo(
    () =>
      mains.find((item) => item.active && item.children?.length)?.label ??
      mains.find((item) => item.children?.length)?.label ??
      "",
    [mains],
  );

  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedKey, setExpandedKey] = useState(initialExpanded);

  const onPreviewBlock = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleCollapse = (e: React.SyntheticEvent) => {
    if (preview) {
      onPreviewBlock(e);
      return;
    }
    setCollapsed((v) => !v);
  };

  const toggleTheme = (value: boolean) => {
    if (preview) return;
    setDarkMode(value);
  };

  const renderLeafLink = (item: SidebarDashboardNavItem, className: string, labelClass: string, iconClass?: string) => {
    const content = (
      <>
        <span className={`${cls.navIcon} ${iconClass || ""}`}>
          <i className={item.icon} aria-hidden="true" />
        </span>

        {!collapsed ? (
          <span className={cls.navTextWrap}>
            <span className={labelClass}>{item.label}</span>
          </span>
        ) : null}

        {!collapsed && item.badge ? (
          <span className={item.badge === "New" ? cls.badgeAccent : cls.badge}>{item.badge}</span>
        ) : null}
      </>
    );

    if (preview) {
      return (
        <a href="#" className={className} onClick={onPreviewBlock}>
          {content}
        </a>
      );
    }

    return (
      <Link href={(item.href || "/") as Route} className={className}>
        {content}
      </Link>
    );
  };

  const renderChildLink = (item: SidebarDashboardNavChildItem, idx: number) => {
    const content = (
      <>
        <span className={cls.childIcon}>
          <i className={item.icon || "bi-dot"} aria-hidden="true" />
        </span>

        <span className={cls.childTextWrap}>
          <span className={cls.childLabel}>{item.label}</span>
          {item.caption ? <span className={cls.childCaption}>{item.caption}</span> : null}
        </span>
      </>
    );

    if (preview) {
      return (
        <a
          key={idx}
          href="#"
          className={`${cls.childItem} ${item.active ? cls.childItemActive : ""}`}
          onClick={onPreviewBlock}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={idx}
        href={(item.href || "/") as Route}
        className={`${cls.childItem} ${item.active ? cls.childItemActive : ""}`}
      >
        {content}
      </Link>
    );
  };

  return (
    <aside
      className={`${cls.sidebar} ${collapsed ? cls.isCollapsed : ""} ${darkMode ? cls.isDark : cls.isLight}`}
      aria-label="Sidebar dashboard"
      style={{ ["--brand-dot" as string]: bd.dotColor || "#4f46e5" }}
    >
      <div className={cls.inner}>
        <div className={cls.topBar}>
          <div className={cls.brandWrap}>
            <div className={cls.brandMark}>
              <span className={cls.brandGlyph}>{bd.logoText || "S"}</span>
            </div>

            {!collapsed ? (
              <div className={cls.brandText}>
                <div className={cls.brandName}>{bd.name}</div>
                <div className={cls.brandMeta}>Sales Dashboard</div>
              </div>
            ) : null}
          </div>

          <button type="button" className={cls.collapseBtn} aria-label="Toggle sidebar" onClick={toggleCollapse}>
            <i
              className={`bi ${collapsed ? "bi-layout-sidebar-inset-reverse" : "bi-layout-sidebar-inset"}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {!collapsed ? (
          <div className={cls.heroCard}>
            <div className={cls.heroTop}>
              <div className={cls.heroPill}>
                <i className="bi bi-stars" aria-hidden="true" />
                <span>Header Mode 2026</span>
              </div>

              <div className={cls.heroMetric}>
                <span className={cls.heroMetricValue}>+21%</span>
                <span className={cls.heroMetricLabel}>Growth</span>
              </div>
            </div>

            <div className={cls.heroTitle}>Premium control center for modern ecommerce teams.</div>

            <div className={cls.heroText}>
              Manage products, orders, campaigns and customer operations from one focused workspace.
            </div>

            <div className={cls.heroStats}>
              <div className={cls.heroStat}>
                <span className={cls.heroStatValue}>1,248</span>
                <span className={cls.heroStatLabel}>Orders</span>
              </div>
              <div className={cls.heroStat}>
                <span className={cls.heroStatValue}>$38.6k</span>
                <span className={cls.heroStatLabel}>Revenue</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className={cls.searchBar}>
          <button
            type="button"
            className={cls.searchIconBtn}
            aria-label="Search"
            onClick={preview ? onPreviewBlock : undefined}
          >
            <i className="bi bi-search" aria-hidden="true" />
          </button>

          {!collapsed ? (
            <>
              <input
                type="text"
                className={cls.searchInput}
                placeholder={searchPlaceholder}
                onChange={() => undefined}
                onClick={preview ? onPreviewBlock : undefined}
              />
              <button
                type="button"
                className={cls.filterBtn}
                aria-label="Filter"
                onClick={preview ? onPreviewBlock : undefined}
              >
                <i className="bi bi-sliders2" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>

        {!collapsed ? (
          <div className={cls.quickActions}>
            <button type="button" className={cls.quickAction} onClick={preview ? onPreviewBlock : undefined}>
              <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
              <span>Boost sale</span>
            </button>

            <button type="button" className={cls.quickAction} onClick={preview ? onPreviewBlock : undefined}>
              <i className="bi bi-receipt-cutoff" aria-hidden="true" />
              <span>Invoices</span>
            </button>

            <button type="button" className={cls.quickAction} onClick={preview ? onPreviewBlock : undefined}>
              <i className="bi bi-box2-heart" aria-hidden="true" />
              <span>Bundles</span>
            </button>
          </div>
        ) : null}

        <div className={cls.body}>
          <div className={cls.group}>
            {!collapsed ? (
              <div className={cls.groupHead}>
                <div className={cls.groupTitle}>{mainTitle}</div>
                <div className={cls.groupLine} />
              </div>
            ) : null}

            <nav className={cls.nav} aria-label={mainTitle}>
              {mains.map((item, index) => {
                const hasChildren = !!item.children?.length;
                const opened = expandedKey === item.label;

                if (!hasChildren) {
                  return (
                    <div key={index} className={cls.navBlock}>
                      {renderLeafLink(item, `${cls.navItem} ${item.active ? cls.navItemActive : ""}`, cls.navLabel)}
                    </div>
                  );
                }

                const handleParentClick = (e: React.SyntheticEvent) => {
                  if (preview) {
                    onPreviewBlock(e);
                    return;
                  }
                  e.preventDefault();
                  setExpandedKey((prev) => (prev === item.label ? "" : item.label));
                };

                return (
                  <div key={index} className={`${cls.navBlock} ${opened ? cls.navBlockOpen : ""}`}>
                    {preview ? (
                      <a
                        href="#"
                        className={`${cls.navItem} ${item.active ? cls.navItemActive : ""}`}
                        onClick={handleParentClick}
                      >
                        <span className={cls.navIcon}>
                          <i className={item.icon} aria-hidden="true" />
                        </span>

                        {!collapsed ? (
                          <span className={cls.navTextWrap}>
                            <span className={cls.navLabel}>{item.label}</span>
                          </span>
                        ) : null}

                        {!collapsed ? (
                          <span className={cls.caret}>
                            <i className={`bi ${opened ? "bi-dash-lg" : "bi-plus-lg"}`} aria-hidden="true" />
                          </span>
                        ) : null}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={`${cls.navItem} ${item.active ? cls.navItemActive : ""}`}
                        onClick={handleParentClick}
                      >
                        <span className={cls.navIcon}>
                          <i className={item.icon} aria-hidden="true" />
                        </span>

                        {!collapsed ? (
                          <span className={cls.navTextWrap}>
                            <span className={cls.navLabel}>{item.label}</span>
                          </span>
                        ) : null}

                        {!collapsed ? (
                          <span className={cls.caret}>
                            <i className={`bi ${opened ? "bi-dash-lg" : "bi-plus-lg"}`} aria-hidden="true" />
                          </span>
                        ) : null}
                      </button>
                    )}

                    {!collapsed && opened ? (
                      <div className={cls.childList}>{item.children?.map(renderChildLink)}</div>
                    ) : null}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className={cls.group}>
            {!collapsed ? (
              <div className={cls.groupHead}>
                <div className={cls.groupTitle}>{otherTitle}</div>
                <div className={cls.groupLine} />
              </div>
            ) : null}

            <nav className={cls.nav} aria-label={otherTitle}>
              {others.map((item, index) => (
                <div key={index} className={cls.navBlock}>
                  {renderLeafLink(item, cls.navItem, cls.navLabel)}
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className={cls.bottom}>
          <div className={cls.themeWrap}>
            {!collapsed ? <div className={cls.themeTitle}>Appearance</div> : null}

            <div className={cls.themeSwitch} role="tablist" aria-label="Theme mode">
              <button
                type="button"
                className={`${cls.themeBtn} ${!darkMode ? cls.themeBtnActive : ""}`}
                onClick={() => toggleTheme(false)}
              >
                <i className="bi bi-sun-fill" aria-hidden="true" />
                {!collapsed ? <span>{lightLabel}</span> : null}
              </button>

              <button
                type="button"
                className={`${cls.themeBtn} ${darkMode ? cls.themeBtnActive : ""}`}
                onClick={() => toggleTheme(true)}
              >
                <i className="bi bi-moon-stars-fill" aria-hidden="true" />
                {!collapsed ? <span>{darkLabel}</span> : null}
              </button>
            </div>
          </div>

          <div className={cls.profileCard}>
            <div className={cls.profileGlow} />

            <div className={cls.profileMain}>
              <div className={cls.avatarWrap}>
                <Image src={pf.avatarSrc} alt={pf.name} width={40} height={40} className={cls.avatar} />
                <span className={cls.avatarStatus} />
              </div>

              {!collapsed ? (
                <div className={cls.profileText}>
                  <div className={cls.profileName}>{pf.name}</div>
                  <div className={cls.profileEmail}>{pf.email}</div>
                </div>
              ) : null}
            </div>

            {!collapsed ? (
              <button
                type="button"
                className={cls.profileMore}
                aria-label="More options"
                onClick={preview ? onPreviewBlock : undefined}
              >
                <i className="bi bi-three-dots" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ================= RegItem ================= */
export const SHOP_SIDEBAR_DASHBOARD: RegItem = {
  kind: "SidebarDashboard",
  label: "Sidebar Dashboard",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),
    searchPlaceholder: "Search orders, products, campaigns...",
    mainTitle: "Commerce",
    mainItems: JSON.stringify(DEFAULT_MAIN_ITEMS, null, 2),
    otherTitle: "Workspace",
    otherItems: JSON.stringify(DEFAULT_OTHER_ITEMS, null, 2),
    lightLabel: "Light",
    darkLabel: "Dark",
    profile: JSON.stringify(DEFAULT_PROFILE, null, 2),
  },
  inspector: [
    { key: "brand", label: "Brand (JSON)", kind: "textarea", rows: 8 },
    { key: "searchPlaceholder", label: "Search placeholder", kind: "text" },

    { key: "mainTitle", label: "Main title", kind: "text" },
    { key: "mainItems", label: "Main items (JSON)", kind: "textarea", rows: 16 },

    { key: "otherTitle", label: "Other title", kind: "text" },
    { key: "otherItems", label: "Other items (JSON)", kind: "textarea", rows: 10 },

    { key: "lightLabel", label: "Light label", kind: "text" },
    { key: "darkLabel", label: "Dark label", kind: "text" },

    { key: "profile", label: "Profile (JSON)", kind: "textarea", rows: 8 },
  ],
  render: (p) => {
    const brand = safeJson<SidebarDashboardBrand>(p.brand);
    const mainItems = safeJson<SidebarDashboardNavItem[]>(p.mainItems);
    const otherItems = safeJson<SidebarDashboardNavItem[]>(p.otherItems);
    const profile = safeJson<SidebarDashboardProfile>(p.profile);

    return (
      <div className="sectionContainer" aria-label="Shop Sidebar Dashboard">
        <SidebarDashboard
          brand={brand}
          searchPlaceholder={String(p.searchPlaceholder || "Search orders, products, campaigns...")}
          mainTitle={String(p.mainTitle || "Commerce")}
          mainItems={mainItems}
          otherTitle={String(p.otherTitle || "Workspace")}
          otherItems={otherItems}
          lightLabel={String(p.lightLabel || "Light")}
          darkLabel={String(p.darkLabel || "Dark")}
          profile={profile}
          preview={true}
        />
      </div>
    );
  },
};

export default SidebarDashboard;
