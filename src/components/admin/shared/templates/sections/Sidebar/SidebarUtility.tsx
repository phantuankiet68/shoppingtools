"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Sidebar/SidebarUtility.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SidebarUtilityNavChildItem = {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
};

export type SidebarUtilityNavItem = {
  label: string;
  href?: string;
  icon: string;
  badge?: string;
  active?: boolean;
  children?: SidebarUtilityNavChildItem[];
};

export type SidebarUtilityProfile = {
  name: string;
  email: string;
  avatarSrc: string;
};

export type SidebarUtilityBrand = {
  name: string;
  logoText?: string;
  dotColor?: string;
};

export type SidebarUtilityProps = {
  brand?: SidebarUtilityBrand;

  searchPlaceholder?: string;

  mainTitle?: string;
  mainItems?: SidebarUtilityNavItem[];

  otherTitle?: string;
  otherItems?: SidebarUtilityNavItem[];

  lightLabel?: string;
  darkLabel?: string;

  profile?: SidebarUtilityProfile;

  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: SidebarUtilityBrand = {
  name: "SalesPilot",
  logoText: "SP",
  dotColor: "#6d5dfc",
};

const DEFAULT_MAIN_ITEMS: SidebarUtilityNavItem[] = [
  { label: "Overview", href: "/overview", icon: "bi-grid-1x2", active: true },
  {
    label: "Orders",
    href: "/orders",
    icon: "bi-bag-check",
    badge: "18",
    children: [
      { label: "All Orders", href: "/orders/all", icon: "bi-list-ul", active: true },
      { label: "Pending", href: "/orders/pending", icon: "bi-hourglass-split" },
      { label: "Completed", href: "/orders/completed", icon: "bi-patch-check" },
    ],
  },
  { label: "Products", href: "/products", icon: "bi-box-seam" },
  { label: "Customers", href: "/customers", icon: "bi-people" },
  { label: "Campaigns", href: "/campaigns", icon: "bi-megaphone" },
];

const DEFAULT_OTHER_ITEMS: SidebarUtilityNavItem[] = [
  { label: "Analytics", href: "/analytics", icon: "bi-graph-up-arrow" },
  { label: "Support", href: "/support", icon: "bi-life-preserver" },
  { label: "Settings", href: "/settings", icon: "bi-gear" },
];

const DEFAULT_PROFILE: SidebarUtilityProfile = {
  name: "Sales Manager",
  email: "manager@store.com",
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
export function SidebarUtility({
  brand,
  searchPlaceholder = "Search products, orders, customers...",
  mainTitle = "Commerce",
  mainItems,
  otherTitle = "Workspace",
  otherItems,
  lightLabel = "Light",
  darkLabel = "Dark",
  profile,
  preview = false,
}: SidebarUtilityProps) {
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

  const renderLeafLink = (item: SidebarUtilityNavItem, className: string, labelClass: string, iconClass?: string) => {
    const content = (
      <>
        <span className={`${cls.navIcon} ${iconClass || ""}`}>
          <i className={item.icon} aria-hidden="true" />
        </span>

        {!collapsed ? <span className={labelClass}>{item.label}</span> : null}

        {!collapsed && item.badge ? <span className={cls.badge}>{item.badge}</span> : null}
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

  const renderChildLink = (item: SidebarUtilityNavChildItem, idx: number) => {
    const content = (
      <>
        <span className={cls.childIcon}>
          <i className={item.icon || "bi-dot"} aria-hidden="true" />
        </span>
        <span className={cls.childLabel}>{item.label}</span>
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
      className={`${cls.sidebar} ${collapsed ? cls.isCollapsed : ""} ${darkMode ? cls.isDark : ""}`}
      aria-label="Sidebar utility"
    >
      <div className={cls.topBar}>
        <div className={cls.brandWrap}>
          <div className={cls.brandMark} style={{ ["--brand-dot" as string]: bd.dotColor || "#6d5dfc" }}>
            <span className={cls.brandGlyph}>{bd.logoText || "SP"}</span>
          </div>

          {!collapsed ? (
            <div className={cls.brandMeta}>
              <div className={cls.brandName}>{bd.name}</div>
              <div className={cls.brandSub}>Sales Control Center</div>
            </div>
          ) : null}
        </div>

        <button type="button" className={cls.collapseBtn} aria-label="Toggle sidebar" onClick={toggleCollapse}>
          <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`} aria-hidden="true" />
        </button>
      </div>

      {!collapsed ? (
        <div className={cls.heroCard}>
          <div className={cls.heroBadge}>
            <i className="bi bi-stars" aria-hidden="true" />
            <span>Growth mode</span>
          </div>

          <div className={cls.heroTitle}>Sell smarter, scale faster</div>
          <div className={cls.heroText}>
            Centralize orders, inventory, campaigns and customer operations in one premium workspace.
          </div>

          <div className={cls.heroStats}>
            <div className={cls.heroStat}>
              <span className={cls.heroStatValue}>+24%</span>
              <span className={cls.heroStatLabel}>Revenue</span>
            </div>
            <div className={cls.heroStat}>
              <span className={cls.heroStatValue}>312</span>
              <span className={cls.heroStatLabel}>Orders</span>
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
              aria-label="Quick tools"
              onClick={preview ? onPreviewBlock : undefined}
            >
              <i className="bi bi-sliders" aria-hidden="true" />
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

                      {!collapsed ? <span className={cls.navLabel}>{item.label}</span> : null}

                      {!collapsed && item.badge ? <span className={cls.badge}>{item.badge}</span> : null}

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

                      {!collapsed ? <span className={cls.navLabel}>{item.label}</span> : null}

                      {!collapsed && item.badge ? <span className={cls.badge}>{item.badge}</span> : null}

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
                {renderLeafLink(item, `${cls.navItem} ${item.active ? cls.navItemActive : ""}`, cls.navLabel)}
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
            <i className="bi bi-brightness-high" aria-hidden="true" />
            {!collapsed ? <span>{lightLabel}</span> : null}
          </button>

          <button
            type="button"
            className={`${cls.themeBtn} ${darkMode ? cls.themeBtnActive : ""}`}
            onClick={() => toggleTheme(true)}
          >
            <i className="bi bi-moon-stars" aria-hidden="true" />
            {!collapsed ? <span>{darkLabel}</span> : null}
          </button>
        </div>

        {!collapsed ? (
          <div className={cls.utilityCard}>
            <div className={cls.utilityIcon}>
              <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
            </div>
            <div className={cls.utilityContent}>
              <div className={cls.utilityTitle}>Quick actions</div>
              <div className={cls.utilityText}>Create invoice, add product or launch promotion.</div>
            </div>
          </div>
        ) : null}

        <div className={cls.profileCard}>
          <div className={cls.profileMain}>
            <div className={cls.avatarWrap}>
              <Image src={pf.avatarSrc} alt={pf.name} width={40} height={40} className={cls.avatar} />
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
    </aside>
  );
}

/* ================= RegItem ================= */
export const SHOP_SIDEBAR_UTILITY: RegItem = {
  kind: "SidebarUtility",
  label: "Sidebar Utility",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),
    searchPlaceholder: "Search products, orders, customers...",
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
    const brand = safeJson<SidebarUtilityBrand>(p.brand);
    const mainItems = safeJson<SidebarUtilityNavItem[]>(p.mainItems);
    const otherItems = safeJson<SidebarUtilityNavItem[]>(p.otherItems);
    const profile = safeJson<SidebarUtilityProfile>(p.profile);

    return (
      <div className="sectionContainer" aria-label="Shop Sidebar Utility">
        <SidebarUtility
          brand={brand}
          searchPlaceholder={String(p.searchPlaceholder || "Search products, orders, customers...")}
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

export default SidebarUtility;
