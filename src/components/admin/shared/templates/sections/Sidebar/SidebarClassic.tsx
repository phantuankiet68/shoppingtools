"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Sidebar/SidebarClassic.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SidebarClassicNavChildItem = {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  caption?: string;
};

export type SidebarClassicNavItem = {
  label: string;
  href?: string;
  icon: string;
  badge?: string;
  active?: boolean;
  children?: SidebarClassicNavChildItem[];
};

export type SidebarClassicProfile = {
  name: string;
  email: string;
  avatarSrc: string;
};

export type SidebarClassicBrand = {
  name: string;
  logoText?: string;
  dotColor?: string;
};

export type SidebarClassicProps = {
  brand?: SidebarClassicBrand;

  searchPlaceholder?: string;

  mainTitle?: string;
  mainItems?: SidebarClassicNavItem[];

  otherTitle?: string;
  otherItems?: SidebarClassicNavItem[];

  lightLabel?: string;
  darkLabel?: string;

  profile?: SidebarClassicProfile;

  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: SidebarClassicBrand = {
  name: "Mercato",
  logoText: "M",
  dotColor: "#2563eb",
};

const DEFAULT_MAIN_ITEMS: SidebarClassicNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "bi-grid-1x2-fill", active: true },
  { label: "Orders", href: "/orders", icon: "bi-bag-check-fill", badge: "18" },
  {
    label: "Products",
    href: "/products",
    icon: "bi-box-seam-fill",
    children: [
      { label: "All Products", href: "/products/all", icon: "bi-grid", active: true, caption: "Catalog" },
      { label: "Categories", href: "/products/categories", icon: "bi-tags", caption: "Store groups" },
      { label: "Inventory", href: "/products/inventory", icon: "bi-boxes", caption: "Stock status" },
    ],
  },
  { label: "Customers", href: "/customers", icon: "bi-people-fill" },
  { label: "Marketing", href: "/marketing", icon: "bi-megaphone-fill", badge: "New" },
];

const DEFAULT_OTHER_ITEMS: SidebarClassicNavItem[] = [
  { label: "Analytics", href: "/analytics", icon: "bi-graph-up-arrow" },
  { label: "Messages", href: "/messages", icon: "bi-chat-left-dots-fill" },
  { label: "Settings", href: "/settings", icon: "bi-sliders2-vertical" },
];

const DEFAULT_PROFILE: SidebarClassicProfile = {
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
export function SidebarClassic({
  brand,
  searchPlaceholder = "Search products, orders, customers...",
  mainTitle = "Store Management",
  mainItems,
  otherTitle = "Workspace",
  otherItems,
  lightLabel = "Light",
  darkLabel = "Dark",
  profile,
  preview = false,
}: SidebarClassicProps) {
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
  const [darkMode, setDarkMode] = useState(false);
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

  const renderLeafLink = (item: SidebarClassicNavItem, className: string, labelClass: string, iconClass?: string) => {
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

  const renderChildLink = (item: SidebarClassicNavChildItem, idx: number) => {
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
      aria-label="Sidebar classic"
      style={{ ["--brand-dot" as string]: bd.dotColor || "#2563eb" }}
    >
      <div className={cls.inner}>
        <div className={cls.topBar}>
          <div className={cls.brandWrap}>
            <div className={cls.brandMark}>
              <span className={cls.brandGlyph}>{bd.logoText || "M"}</span>
            </div>

            {!collapsed ? (
              <div className={cls.brandText}>
                <div className={cls.brandName}>{bd.name}</div>
                <div className={cls.brandSub}>Sales Commerce</div>
              </div>
            ) : null}
          </div>

          <button type="button" className={cls.collapseBtn} aria-label="Toggle sidebar" onClick={toggleCollapse}>
            <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`} aria-hidden="true" />
          </button>
        </div>

        {!collapsed ? (
          <div className={cls.summaryCard}>
            <div className={cls.summaryHead}>
              <span className={cls.summaryDot} />
              <span className={cls.summaryLabel}>Today overview</span>
            </div>

            <div className={cls.summaryTitle}>Professional store control panel for sales operations</div>

            <div className={cls.summaryStats}>
              <div className={cls.summaryStat}>
                <span className={cls.summaryValue}>$24.8k</span>
                <span className={cls.summaryMeta}>Revenue</span>
              </div>
              <div className={cls.summaryStat}>
                <span className={cls.summaryValue}>326</span>
                <span className={cls.summaryMeta}>Orders</span>
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

        <div className={cls.body}>
          <div className={cls.group}>
            {!collapsed ? <div className={cls.groupTitle}>{mainTitle}</div> : null}

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
            {!collapsed ? <div className={cls.groupTitle}>{otherTitle}</div> : null}

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

          <div className={cls.profileCard}>
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
                <i className="bi bi-three-dots-vertical" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ================= RegItem ================= */
export const SHOP_SIDEBAR_CLASSIC: RegItem = {
  kind: "SidebarClassic",
  label: "Sidebar Classic",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),
    searchPlaceholder: "Search products, orders, customers...",
    mainTitle: "Store Management",
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
    const brand = safeJson<SidebarClassicBrand>(p.brand);
    const mainItems = safeJson<SidebarClassicNavItem[]>(p.mainItems);
    const otherItems = safeJson<SidebarClassicNavItem[]>(p.otherItems);
    const profile = safeJson<SidebarClassicProfile>(p.profile);

    return (
      <div className="sectionContainer" aria-label="Shop Sidebar Classic">
        <SidebarClassic
          brand={brand}
          searchPlaceholder={String(p.searchPlaceholder || "Search products, orders, customers...")}
          mainTitle={String(p.mainTitle || "Store Management")}
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

export default SidebarClassic;
