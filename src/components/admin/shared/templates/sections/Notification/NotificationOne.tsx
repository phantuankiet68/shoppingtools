"use client";

import React, { useMemo, useState } from "react";
import cls from "@/styles/templates/sections/Notification/NotificationOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import AccountSidebar from "@/components/admin/shared/templates/components/AccountSidebar";

export type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  message: string;
  time: string;
  category: "all" | "orders" | "promotions" | "security" | "system";
  unread?: boolean;
  highlighted?: boolean;
  ctaLabel?: string;
};

export type NotificationOneProps = {
  preview?: boolean;
  avatar?: string;
  customerName?: string;
  customerEmail?: string;
  customerRankText?: string;
  customerTagline?: string;

  headingEyebrow?: string;
  headingTitle?: string;
  headingDescription?: string;

  selectedTab?: string;
  successMessage?: string;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;

  emailEnabled?: boolean;
  pushEnabled?: boolean;
  promoEnabled?: boolean;
  securityEnabled?: boolean;

  notificationItems?: string;
};

const FALLBACK_AVATAR = "/assets/images/logo.jpg";

const DEFAULT_SIDEBAR_ITEMS = [
  { icon: "bi-bell", label: "Notifications", href: "/account/notifications", active: true },
  { icon: "bi-person", label: "My Account", href: "/account/profile" },
  { icon: "bi-receipt", label: "My Orders", href: "/account" },
  { icon: "bi-ticket-perforated", label: "My Vouchers", href: "/account/voucher" },
  { icon: "bi-shield-lock", label: "Security", href: "/account/security" },
];

const DEFAULT_TABS = [
  { key: "all", label: "All activity" },
  { key: "orders", label: "Orders" },
  { key: "promotions", label: "Promotions" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
];

const DEFAULT_ITEMS: NotificationItem[] = [
  {
    id: "n1",
    icon: "bi-bag-check",
    title: "Your order has been delivered",
    message: "Order #DH-10248 has arrived successfully. You can review your purchase experience and reorder anytime.",
    time: "2 minutes ago",
    category: "orders",
    unread: true,
    highlighted: true,
    ctaLabel: "View order",
  },
  {
    id: "n2",
    icon: "bi-shield-check",
    title: "Security alert detected",
    message:
      "A new login was detected from a recognized device. Review your account activity to make sure everything looks right.",
    time: "15 minutes ago",
    category: "security",
    unread: true,
    ctaLabel: "Review activity",
  },
  {
    id: "n3",
    icon: "bi-percent",
    title: "Exclusive voucher unlocked",
    message: "You received a limited-time 15% voucher for your next purchase. Apply it before the campaign ends.",
    time: "1 hour ago",
    category: "promotions",
    unread: false,
    ctaLabel: "Use voucher",
  },
  {
    id: "n4",
    icon: "bi-box-seam",
    title: "Shipment is on the way",
    message: "Your package is being transferred to the final delivery station. Expected arrival is tomorrow afternoon.",
    time: "3 hours ago",
    category: "orders",
    unread: false,
    ctaLabel: "Track shipment",
  },
  {
    id: "n5",
    icon: "bi-gear-wide-connected",
    title: "System preferences updated",
    message:
      "Your notification preferences were updated successfully. Email updates and security alerts remain active.",
    time: "Yesterday",
    category: "system",
    unread: false,
  },
  {
    id: "n6",
    icon: "bi-stars",
    title: "Recommended products for you",
    message:
      "Based on your recent interests, we curated a fresh collection of products that match your style and buying history.",
    time: "Yesterday",
    category: "promotions",
    unread: false,
    ctaLabel: "Explore now",
  },
];

function parseNotificationItems(raw?: string): NotificationItem[] {
  if (!raw) return DEFAULT_ITEMS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ITEMS;

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any, index: number) => ({
        id: String(item?.id ?? `notification-${index + 1}`),
        icon: String(item?.icon ?? "bi-bell"),
        title: String(item?.title ?? ""),
        message: String(item?.message ?? ""),
        time: String(item?.time ?? ""),
        category: ["all", "orders", "promotions", "security", "system"].includes(item?.category)
          ? item.category
          : "all",
        unread: Boolean(item?.unread),
        highlighted: Boolean(item?.highlighted),
        ctaLabel: item?.ctaLabel ? String(item.ctaLabel) : "",
      }))
      .filter((item) => item.title && item.message);

    return cleaned.length ? cleaned : DEFAULT_ITEMS;
  } catch {
    return DEFAULT_ITEMS;
  }
}

export function NotificationOne({
  preview = false,
  avatar = FALLBACK_AVATAR,
  customerName = "Saim Ansari",
  customerEmail = "saim@example.com",
  customerRankText = "Premium Customer",
  customerTagline = "Stay updated with account alerts, order activities and exclusive offers.",
  headingEyebrow = "Customer notification center",
  headingTitle = "A cleaner, smarter inbox for your account",
  headingDescription = "Review order updates, account alerts, promotions and system events in one modern dashboard.",
  selectedTab = "all",
  successMessage = "Your notification settings are synchronized successfully.",
  primaryButtonLabel = "Mark all as read",
  secondaryButtonLabel = "Notification settings",
  emailEnabled = true,
  pushEnabled = true,
  promoEnabled = true,
  securityEnabled = true,
  notificationItems = JSON.stringify(DEFAULT_ITEMS, null, 2),
}: NotificationOneProps) {
  const [activeTab, setActiveTab] = useState(selectedTab);
  const [emailState, setEmailState] = useState(emailEnabled);
  const [pushState, setPushState] = useState(pushEnabled);
  const [promoState, setPromoState] = useState(promoEnabled);
  const [securityState, setSecurityState] = useState(securityEnabled);

  const items = useMemo(() => parseNotificationItems(notificationItems), [notificationItems]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((item) => item.category === activeTab);
  }, [activeTab, items]);

  const unreadCount = useMemo(() => items.filter((item) => item.unread).length, [items]);
  const orderCount = useMemo(() => items.filter((item) => item.category === "orders").length, [items]);
  const promoCount = useMemo(() => items.filter((item) => item.category === "promotions").length, [items]);
  const securityCount = useMemo(() => items.filter((item) => item.category === "security").length, [items]);

  const statCards = [
    {
      icon: "bi-envelope-open",
      label: "Unread updates",
      value: String(unreadCount).padStart(2, "0"),
      meta: unreadCount > 0 ? "Needs your attention" : "Inbox is under control",
    },
    {
      icon: "bi-box-seam",
      label: "Order alerts",
      value: String(orderCount).padStart(2, "0"),
      meta: "Shipping, delivery and purchase status",
    },
    {
      icon: "bi-stars",
      label: "Promotions",
      value: String(promoCount).padStart(2, "0"),
      meta: "Vouchers, offers and recommendations",
    },
    {
      icon: "bi-shield-lock",
      label: "Security",
      value: String(securityCount).padStart(2, "0"),
      meta: "Login, device and account protection",
    },
  ];

  return (
    <section className={cls.notificationOne}>
      <div className={cls.container}>
        <div className={cls.layout}>
          <AccountSidebar
            preview={preview}
            avatar={avatar}
            customerName={customerName}
            customerEmail={customerEmail}
            customerEditHref="/account/profile"
            customerRankText={customerRankText}
            customerTagline={customerTagline}
            sidebarItems={DEFAULT_SIDEBAR_ITEMS}
          />

          <div className={cls.main}>
            <div className={cls.contentGrid}>
              <div className={cls.primaryColumn}>
                <section className={cls.feedCard}>
                  <div className={cls.feedHead}>
                    <div>
                      <span className={cls.sectionEyebrow}>Inbox categories</span>
                      <h3 className={cls.sectionTitle}>Notification Activity</h3>
                    </div>

                    <div className={cls.filterTabs}>
                      {DEFAULT_TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            className={`${cls.filterBtn} ${isActive ? cls.filterBtnActive : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={cls.notificationList}>
                    {filteredItems.map((item) => (
                      <article
                        key={item.id}
                        className={`${cls.notificationCard} ${item.unread ? cls.notificationUnread : ""} ${
                          item.highlighted ? cls.notificationHighlighted : ""
                        }`}
                      >
                        <div className={cls.notificationIcon}>
                          <i className={`bi ${item.icon}`} />
                        </div>

                        <div className={cls.notificationBody}>
                          <div className={cls.notificationTop}>
                            <div className={cls.notificationHeading}>
                              <h4>{item.title}</h4>
                              <span>{item.time}</span>
                            </div>

                            {item.unread ? <span className={cls.unreadDot} /> : null}
                          </div>

                          <p className={cls.notificationMessage}>{item.message}</p>

                          <div className={cls.notificationFooter}>
                            <span className={cls.categoryBadge}>{item.category}</span>

                            {item.ctaLabel ? (
                              <button type="button" className={cls.inlineAction}>
                                <span>{item.ctaLabel}</span>
                                <i className="bi bi-arrow-up-right" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}

                    {!filteredItems.length && (
                      <div className={cls.emptyState}>
                        <span className={cls.emptyIcon}>
                          <i className="bi bi-inbox" />
                        </span>
                        <strong>No notifications in this category</strong>
                        <p>Try another filter tab or enable more notification channels.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className={cls.sideColumn}>
                <section className={cls.sideCard}>
                  <div className={cls.preferenceList}>
                    <label className={cls.preferenceItem}>
                      <div className={cls.preferenceText}>
                        <strong>Email updates</strong>
                        <span>Order confirmation, vouchers and essential account news</span>
                      </div>
                      <button
                        type="button"
                        className={`${cls.toggle} ${emailState ? cls.toggleActive : ""}`}
                        onClick={() => setEmailState((prev) => !prev)}
                        aria-pressed={emailState}
                      >
                        <span className={cls.toggleThumb} />
                      </button>
                    </label>

                    <label className={cls.preferenceItem}>
                      <div className={cls.preferenceText}>
                        <strong>Push notifications</strong>
                        <span>Instant browser or mobile-style alerts for recent activities</span>
                      </div>
                      <button
                        type="button"
                        className={`${cls.toggle} ${pushState ? cls.toggleActive : ""}`}
                        onClick={() => setPushState((prev) => !prev)}
                        aria-pressed={pushState}
                      >
                        <span className={cls.toggleThumb} />
                      </button>
                    </label>

                    <label className={cls.preferenceItem}>
                      <div className={cls.preferenceText}>
                        <strong>Promotional campaigns</strong>
                        <span>Special discounts, launches and personalized shopping offers</span>
                      </div>
                      <button
                        type="button"
                        className={`${cls.toggle} ${promoState ? cls.toggleActive : ""}`}
                        onClick={() => setPromoState((prev) => !prev)}
                        aria-pressed={promoState}
                      >
                        <span className={cls.toggleThumb} />
                      </button>
                    </label>

                    <label className={cls.preferenceItem}>
                      <div className={cls.preferenceText}>
                        <strong>Security alerts</strong>
                        <span>Critical account events, sign-ins and device activity warnings</span>
                      </div>
                      <button
                        type="button"
                        className={`${cls.toggle} ${securityState ? cls.toggleActive : ""}`}
                        onClick={() => setSecurityState((prev) => !prev)}
                        aria-pressed={securityState}
                      >
                        <span className={cls.toggleThumb} />
                      </button>
                    </label>
                  </div>
                </section>

                <section className={cls.sideCard}>
                  <div className={cls.sideHead}>
                    <h3 className={cls.sideTitle}>Notification summary</h3>
                  </div>

                  <div className={cls.summaryList}>
                    <div className={cls.summaryRow}>
                      <span>Total updates</span>
                      <strong>{items.length}</strong>
                    </div>
                    <div className={cls.summaryRow}>
                      <span>Unread items</span>
                      <strong className={cls.summaryAccent}>{unreadCount}</strong>
                    </div>
                    <div className={cls.summaryRow}>
                      <span>Orders</span>
                      <strong>{orderCount}</strong>
                    </div>
                    <div className={cls.summaryRow}>
                      <span>Promotions</span>
                      <strong>{promoCount}</strong>
                    </div>
                    <div className={cls.summaryRow}>
                      <span>Security alerts</span>
                      <strong>{securityCount}</strong>
                    </div>
                  </div>
                </section>

                <section className={cls.sideCard}>
                  <div className={cls.sideHead}>
                    <h3 className={cls.sideTitle}>Account insight</h3>
                  </div>

                  <div className={cls.insightBox}>
                    <span className={cls.insightIcon}>
                      <i className="bi bi-stars" />
                    </span>
                    <div className={cls.insightContent}>
                      <strong>{successMessage}</strong>
                      <p>Keep order and security alerts enabled so customers never miss important account events.</p>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const SHOP_NOTIFICATION_ONE: RegItem = {
  kind: "NotificationOne",
  label: "Notification One",
  defaults: {
    avatar: FALLBACK_AVATAR,
    customerName: "Saim Ansari",
    customerEmail: "saim@example.com",
    customerRankText: "Premium Customer",
    customerTagline: "Stay updated with account alerts, order activities and exclusive offers.",
    headingEyebrow: "Customer notification center",
    headingTitle: "A cleaner, smarter inbox for your account",
    headingDescription: "Review order updates, account alerts, promotions and system events in one modern dashboard.",
    selectedTab: "all",
    successMessage: "Your notification settings are synchronized successfully.",
    primaryButtonLabel: "Mark all as read",
    secondaryButtonLabel: "Notification settings",
    emailEnabled: true,
    pushEnabled: true,
    promoEnabled: true,
    securityEnabled: true,
    notificationItems: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  inspector: [
    { key: "avatar", label: "Avatar", kind: "text" },
    { key: "customerName", label: "Customer Name", kind: "text" },
    { key: "customerEmail", label: "Customer Email", kind: "text" },
    { key: "customerRankText", label: "Customer Rank Text", kind: "text" },
    { key: "customerTagline", label: "Customer Tagline", kind: "textarea", rows: 4 },
    { key: "headingEyebrow", label: "Heading Eyebrow", kind: "text" },
    { key: "headingTitle", label: "Heading Title", kind: "text" },
    { key: "headingDescription", label: "Heading Description", kind: "textarea", rows: 4 },
    { key: "selectedTab", label: "Selected Tab", kind: "text" },
    { key: "successMessage", label: "Success Message", kind: "text" },
    { key: "primaryButtonLabel", label: "Primary Button Label", kind: "text" },
    { key: "secondaryButtonLabel", label: "Secondary Button Label", kind: "text" },
    { key: "notificationItems", label: "Notification Items (JSON)", kind: "textarea", rows: 18 },
  ],
  render: (props) => {
    const data = props as Record<string, any>;

    return (
      <div aria-label="Notification One">
        <NotificationOne
          preview={Boolean(data.preview)}
          avatar={data.avatar}
          customerName={data.customerName}
          customerEmail={data.customerEmail}
          customerRankText={data.customerRankText}
          customerTagline={data.customerTagline}
          headingEyebrow={data.headingEyebrow}
          headingTitle={data.headingTitle}
          headingDescription={data.headingDescription}
          selectedTab={data.selectedTab}
          successMessage={data.successMessage}
          primaryButtonLabel={data.primaryButtonLabel}
          secondaryButtonLabel={data.secondaryButtonLabel}
          emailEnabled={Boolean(data.emailEnabled ?? true)}
          pushEnabled={Boolean(data.pushEnabled ?? true)}
          promoEnabled={Boolean(data.promoEnabled ?? true)}
          securityEnabled={Boolean(data.securityEnabled ?? true)}
          notificationItems={data.notificationItems}
        />
      </div>
    );
  },
};

export default NotificationOne;
