"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Account/AccountOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import AccountSidebar from "@/components/admin/shared/templates/components/AccountSidebar";

export type AccountSidebarItem = {
  icon: string;
  label: string;
  href: string;
  badge?: string;
  active?: boolean;
};

export type AccountOrderTab = "all" | "pending" | "shipping" | "delivering" | "done" | "cancelled" | "refund";

export type AccountTabItem = {
  key: AccountOrderTab;
  label: string;
};

export type AccountSummary = {
  all: number;
  pending: number;
  shipping: number;
  delivering: number;
  done: number;
  cancelled: number;
  refund: number;
};

export type AccountOrderProduct = {
  id: string;
  title: string;
  variant?: string;
  quantity?: number;
  image?: string;
  price?: string;
  originalPrice?: string;
  tag?: string;
};

export type AccountOrderCard = {
  id: string;
  code?: string;
  deliveryText?: string;
  statusLabel?: string;
  products: AccountOrderProduct[];
  totalLabel?: string;
  totalValue?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  detailActionLabel?: string;
  detailActionHref?: string;
  supportActionLabel?: string;
  supportActionHref?: string;
};

type AccountOrderPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AccountOrderApiResponse = {
  success: boolean;
  data?: {
    items: AccountOrderCard[];
    pagination: AccountOrderPagination;
    summary: AccountSummary;
  };
  message?: string;
};

export type AccountOneProps = {
  preview?: boolean;

  avatar?: string;
  customerName?: string;
  customerEmail?: string;
  customerEditHref?: string;
  customerRankText?: string;
  customerTagline?: string;

  siteId?: string;
  apiPath?: string;
  sidebarItems?: AccountSidebarItem[];
  tabs?: AccountTabItem[];
  activeTab?: AccountOrderTab;

  searchPlaceholder?: string;
  pageSize?: number;
};

const FALLBACK_IMAGE = "/assets/images/logo.jpg";
const DEFAULT_API_PATH = "/api/v1/account/order";
const DEFAULT_SITE_ID = "sitea01";

const DEFAULT_SIDEBAR: AccountSidebarItem[] = [
  { icon: "bi-bell", label: "Notifications", href: "/account/notification" },
  { icon: "bi-person", label: "My Account", href: "/account/profile" },
  { icon: "bi-receipt", label: "My Orders", href: "/account", active: true },
  { icon: "bi-ticket-perforated", label: "My Vouchers", href: "/account/voucher" },
  { icon: "bi-coin", label: "Change Password", href: "/account/security" },
];

const DEFAULT_TABS: AccountTabItem[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending Payment" },
  { key: "shipping", label: "Shipping" },
  { key: "delivering", label: "Out for Delivery" },
  { key: "done", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "refund", label: "Refunded" },
];

const EMPTY_SUMMARY: AccountSummary = {
  all: 0,
  pending: 0,
  shipping: 0,
  delivering: 0,
  done: 0,
  cancelled: 0,
  refund: 0,
};

function parseSidebarItems(raw?: string): AccountSidebarItem[] {
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

function parseTabs(raw?: string): AccountTabItem[] {
  if (!raw) return DEFAULT_TABS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TABS;

    const allowedKeys: AccountOrderTab[] = ["all", "pending", "shipping", "delivering", "done", "cancelled", "refund"];

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any) => ({
        key: String(item?.key ?? "") as AccountOrderTab,
        label: String(item?.label ?? ""),
      }))
      .filter((item) => allowedKeys.includes(item.key) && item.label);

    return cleaned.length ? cleaned : DEFAULT_TABS;
  } catch {
    return DEFAULT_TABS;
  }
}

function SmartLink({
  preview,
  href,
  className,
  children,
}: {
  preview?: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
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

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function getSummaryCount(summary: AccountSummary, tab: AccountOrderTab): number {
  return summary[tab] ?? 0;
}

export function AccountOne({
  preview = false,
  avatar = FALLBACK_IMAGE,
  customerName = "Customer",
  customerEmail = "",
  customerEditHref = "/account/profile",
  customerRankText = "Customer",
  customerTagline = "Manage your orders in one place.",
  siteId = DEFAULT_SITE_ID,
  apiPath = DEFAULT_API_PATH,
  sidebarItems = DEFAULT_SIDEBAR,
  tabs = DEFAULT_TABS,
  activeTab = "all",
  searchPlaceholder = "Search by order number or product name",
  pageSize = 10,
}: AccountOneProps) {
  const [selectedTab, setSelectedTab] = useState<AccountOrderTab>(activeTab);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 400);

  const [orders, setOrders] = useState<AccountOrderCard[]>([]);
  const [summary, setSummary] = useState<AccountSummary>(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState<AccountOrderPagination>({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(!preview);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (preview) {
      setIsLoading(false);
      setOrders([]);
      setSummary(EMPTY_SUMMARY);
      setPagination({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 0,
      });
      return;
    }

    const resolvedSiteId = String(siteId || DEFAULT_SITE_ID).trim();
    if (!resolvedSiteId) {
      setIsLoading(false);
      setOrders([]);
      setSummary(EMPTY_SUMMARY);
      setPagination({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 0,
      });
      setErrorMessage("Missing siteId.");
      return;
    }

    const controller = new AbortController();

    async function fetchOrders() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const params = new URLSearchParams({
          siteId: resolvedSiteId,
          tab: selectedTab,
          page: "1",
          limit: String(pageSize),
        });

        if (debouncedKeyword.trim()) {
          params.set("keyword", debouncedKeyword.trim());
        }

        const response = await fetch(`${apiPath}?${params.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const json = (await response.json()) as AccountOrderApiResponse;

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.message || "Failed to load orders.");
        }

        setOrders(Array.isArray(json.data.items) ? json.data.items : []);
        setSummary(json.data.summary ?? EMPTY_SUMMARY);
        setPagination(
          json.data.pagination ?? {
            page: 1,
            limit: pageSize,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        setOrders([]);
        setSummary(EMPTY_SUMMARY);
        setPagination({
          page: 1,
          limit: pageSize,
          total: 0,
          totalPages: 0,
        });
        setErrorMessage(error instanceof Error ? error.message : "Unable to load orders.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => controller.abort();
  }, [apiPath, debouncedKeyword, pageSize, preview, selectedTab, siteId]);

  const heroStats = useMemo(
    () => [
      {
        icon: "bi-receipt",
        label: "Total Orders",
        value: String(summary.all),
        sub: "All order records",
      },
      {
        icon: "bi-bag-check",
        label: "Completed",
        value: String(summary.done),
        sub: "Successfully finished",
      },
      {
        icon: "bi-clock-history",
        label: "Pending Payment",
        value: String(summary.pending),
        sub: "Waiting for payment",
      },
      {
        icon: "bi-arrow-counterclockwise",
        label: "Refunded",
        value: String(summary.refund),
        sub: "Refund-related orders",
      },
    ],
    [summary],
  );

  return (
    <section className={cls.accountOne}>
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
            <div className={cls.heroLeft}>
              <span className={cls.heroEyebrow}>Customer Dashboard</span>
            </div>

            <div className={cls.heroRight}>
              {heroStats.map((item, index) => (
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
                const isActive = tab.key === selectedTab;
                const count = getSummaryCount(summary, tab.key);

                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${cls.tabBtn} ${isActive ? cls.tabBtnActive : ""}`}
                    onClick={() => setSelectedTab(tab.key)}
                  >
                    <span>{tab.label}</span>
                    <small>{count}</small>
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

          {preview && (
            <div className={cls.emptyState}>
              <span className={cls.emptyIcon}>
                <i className="bi bi-eye" />
              </span>
              <strong>Preview mode</strong>
              <p>Live order data is disabled in preview mode.</p>
            </div>
          )}

          {!preview && isLoading && (
            <div className={cls.emptyState}>
              <span className={cls.emptyIcon}>
                <i className="bi bi-arrow-repeat" />
              </span>
              <strong>Loading orders...</strong>
              <p>Please wait while we fetch your latest order data.</p>
            </div>
          )}

          {!preview && !isLoading && !!errorMessage && (
            <div className={cls.emptyState}>
              <span className={cls.emptyIcon}>
                <i className="bi bi-exclamation-triangle" />
              </span>
              <strong>Unable to load orders</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          {!preview && !isLoading && !errorMessage && (
            <div className={cls.orderList}>
              {orders.map((order) => (
                <article key={order.id} className={cls.orderCard}>
                  <div className={cls.orderHead}>
                    <div className={cls.orderHeadLeft}>
                      <div className={cls.orderIdentity}>
                        <span className={cls.orderIdentityIcon}>
                          <i className="bi bi-receipt-cutoff" />
                        </span>

                        <div className={cls.orderIdentityText}>
                          <strong className={cls.orderLabel}>Your Order</strong>
                          {!!order.code && <span className={cls.orderCode}>{order.code}</span>}
                        </div>
                      </div>

                      <div className={cls.orderQuickActions}>
                        <SmartLink
                          preview={preview}
                          href={order.supportActionHref || "/support"}
                          className={cls.supportBtn}
                        >
                          <i className="bi bi-headset" />
                          <span>{order.supportActionLabel || "Contact Support"}</span>
                        </SmartLink>

                        <SmartLink
                          preview={preview}
                          href={order.detailActionHref || "/account/orders"}
                          className={cls.detailBtn}
                        >
                          <i className="bi bi-arrow-up-right" />
                          <span>{order.detailActionLabel || "View Details"}</span>
                        </SmartLink>
                      </div>
                    </div>

                    <div className={cls.orderStatus}>
                      {!!order.deliveryText && (
                        <span className={cls.deliveryBadge}>
                          <i className="bi bi-truck" />
                          {order.deliveryText}
                        </span>
                      )}

                      {!!order.statusLabel && <span className={cls.statusBadge}>{order.statusLabel}</span>}
                    </div>
                  </div>

                  <div className={cls.productsWrap}>
                    {order.products.map((product) => (
                      <div key={product.id} className={cls.productRow}>
                        <div className={cls.productMain}>
                          <div className={cls.productThumb}>
                            <Image
                              src={product.image || FALLBACK_IMAGE}
                              alt={product.title}
                              fill
                              sizes="96px"
                              className={cls.productThumbImg}
                            />
                          </div>

                          <div className={cls.productContent}>
                            <h3 className={cls.productTitle}>
                              {!!product.tag && <span className={cls.productTag}>{product.tag}</span>}
                              {product.title}
                            </h3>

                            {!!product.variant && <p className={cls.productVariant}>{product.variant}</p>}

                            <div className={cls.productMeta}>
                              <span className={cls.productQty}>Quantity: x{product.quantity || 1}</span>
                            </div>
                          </div>
                        </div>

                        <div className={cls.productPrice}>
                          {!!product.originalPrice && <span className={cls.oldPrice}>{product.originalPrice}</span>}
                          {!!product.price && <strong className={cls.newPrice}>{product.price}</strong>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={cls.orderFooter}>
                    <div className={cls.totalWrap}>
                      <span>{order.totalLabel || "Total"}</span>
                      <strong>{order.totalValue}</strong>
                    </div>

                    <div className={cls.footerActions}>
                      <SmartLink
                        preview={preview}
                        href={order.primaryActionHref || "/products"}
                        className={cls.primaryBtn}
                      >
                        {order.primaryActionLabel || "Buy Again"}
                      </SmartLink>

                      <SmartLink
                        preview={preview}
                        href={order.supportActionHref || "/support"}
                        className={cls.secondaryBtn}
                      >
                        {order.supportActionLabel || "Contact Support"}
                      </SmartLink>
                    </div>
                  </div>
                </article>
              ))}

              {!orders.length && (
                <div className={cls.emptyState}>
                  <span className={cls.emptyIcon}>
                    <i className="bi bi-inbox" />
                  </span>
                  <strong>No orders found</strong>
                  <p>Try a different keyword or switch to another order status tab.</p>
                </div>
              )}

              {!!orders.length && (
                <div className={cls.orderFooterMeta}>
                  <span>
                    Showing <strong>{orders.length}</strong> of <strong>{pagination.total}</strong> orders
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const SHOP_ACCOUNT_ONE: RegItem = {
  kind: "AccountOne",
  label: "Account One",
  defaults: {
    avatar: FALLBACK_IMAGE,
    customerName: "Customer",
    customerEmail: "",
    customerEditHref: "/account/profile",
    customerRankText: "Customer",
    customerTagline: "Manage your orders in a modern space.",
    siteId: DEFAULT_SITE_ID,
    apiPath: DEFAULT_API_PATH,
    activeTab: "all",
    searchPlaceholder: "Search by order number or product name",
    pageSize: 10,
    sidebarItems: JSON.stringify(DEFAULT_SIDEBAR, null, 2),
    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
  },
  inspector: [
    { key: "avatar", label: "Avatar", kind: "text" },
    { key: "customerName", label: "Customer Name", kind: "text" },
    { key: "customerEmail", label: "Customer Email", kind: "text" },
    { key: "customerEditHref", label: "Customer Edit Href", kind: "text" },
    { key: "customerRankText", label: "Customer Rank Text", kind: "text" },
    { key: "customerTagline", label: "Customer Tagline", kind: "textarea", rows: 4 },
    { key: "siteId", label: "Site ID", kind: "text" },
    { key: "apiPath", label: "API Path", kind: "text" },
    { key: "activeTab", label: "Active Tab", kind: "text" },
    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "pageSize", label: "Page Size", kind: "text" },
    { key: "sidebarItems", label: "Sidebar Items (JSON)", kind: "textarea", rows: 12 },
    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 12 },
  ],
  render: (props) => {
    const data = props as Record<string, any>;

    return (
      <div aria-label="Shop Account One">
        <AccountOne
          preview={Boolean(data.preview)}
          avatar={data.avatar}
          customerName={data.customerName}
          customerEmail={data.customerEmail}
          customerEditHref={data.customerEditHref}
          customerRankText={data.customerRankText}
          customerTagline={data.customerTagline}
          siteId={String(data.siteId || DEFAULT_SITE_ID)}
          apiPath={data.apiPath || DEFAULT_API_PATH}
          activeTab={(data.activeTab || "all") as AccountOrderTab}
          searchPlaceholder={data.searchPlaceholder}
          pageSize={Number(data.pageSize) > 0 ? Number(data.pageSize) : 10}
          sidebarItems={parseSidebarItems(data.sidebarItems)}
          tabs={parseTabs(data.tabs)}
        />
      </div>
    );
  },
};

export default AccountOne;
