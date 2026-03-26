"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Account/AccountOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type AccountStatItem = {
  label: string;
  value: string;
  icon: string;
};

export type AccountOrderItem = {
  id: string;
  code: string;
  date: string;
  total: string;
  status: string;
};

export type AccountOneProps = {
  preview?: boolean;

  coverImage?: string;
  avatar?: string;

  customerName?: string;
  customerCode?: string;
  email?: string;
  phone?: string;
  joinedDate?: string;
  membership?: string;
  bio?: string;

  completionRate?: number;
  rewardPoints?: number;

  stats?: AccountStatItem[];
  orders?: AccountOrderItem[];

  editProfileHref?: string;
  orderHistoryHref?: string;
  wishlistHref?: string;
  addressBookHref?: string;
  securityHref?: string;
};

const FALLBACK_IMAGE = "/assets/images/logo.jpg";

const DEFAULT_STATS: AccountStatItem[] = [
  { label: "Orders", value: "128", icon: "bi-bag-check" },
  { label: "Wishlist", value: "24", icon: "bi-heart" },
  { label: "Reviews", value: "16", icon: "bi-star" },
  { label: "Coupons", value: "08", icon: "bi-ticket-perforated" },
];

const DEFAULT_ORDERS: AccountOrderItem[] = [
  { id: "1", code: "#DH-100128", date: "26 Mar 2026", total: "1.250.000đ", status: "Delivered" },
  { id: "2", code: "#DH-100127", date: "22 Mar 2026", total: "890.000đ", status: "Shipping" },
  { id: "3", code: "#DH-100126", date: "18 Mar 2026", total: "540.000đ", status: "Processing" },
];

function parseStats(raw?: string): AccountStatItem[] {
  if (!raw) return DEFAULT_STATS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_STATS;

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any) => ({
        label: String(item?.label ?? ""),
        value: String(item?.value ?? ""),
        icon: String(item?.icon ?? "bi-circle"),
      }))
      .filter((item) => item.label && item.value);

    return cleaned.length ? cleaned : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

function parseOrders(raw?: string): AccountOrderItem[] {
  if (!raw) return DEFAULT_ORDERS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ORDERS;

    const cleaned = parsed
      .filter(Boolean)
      .map((item: any) => ({
        id: String(item?.id ?? crypto.randomUUID()),
        code: String(item?.code ?? ""),
        date: String(item?.date ?? ""),
        total: String(item?.total ?? ""),
        status: String(item?.status ?? "Processing"),
      }))
      .filter((item) => item.code);

    return cleaned.length ? cleaned : DEFAULT_ORDERS;
  } catch {
    return DEFAULT_ORDERS;
  }
}

function statusClass(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("deliver")) return cls.statusSuccess;
  if (normalized.includes("shipping")) return cls.statusInfo;
  if (normalized.includes("process")) return cls.statusWarning;
  return cls.statusMuted;
}

type ActionCardProps = {
  href: string;
  icon: string;
  title: string;
  desc: string;
};

function ActionCard({ href, icon, title, desc }: ActionCardProps) {
  return (
    <Link href={href as Route} className={cls.actionCard}>
      <span className={cls.actionIcon}>
        <i className={`bi ${icon}`} />
      </span>

      <span className={cls.actionContent}>
        <strong>{title}</strong>
        <small>{desc}</small>
      </span>

      <i className={`bi bi-arrow-right ${cls.actionArrow}`} />
    </Link>
  );
}

export function AccountOne({
  coverImage = FALLBACK_IMAGE,
  avatar = FALLBACK_IMAGE,
  customerName = "Phan Tuan Kiet",
  customerCode = "CUS-240326",
  email = "tuankietity@gmail.com",
  phone = "0901 234 567",
  joinedDate = "January 2024",
  membership = "Gold Member",
  bio = "Professional customer account profile with modern dashboard layout and premium shopping experience.",
  completionRate = 88,
  rewardPoints = 2480,
  stats = DEFAULT_STATS,
  orders = DEFAULT_ORDERS,
  editProfileHref = "/account/edit",
  orderHistoryHref = "/account/orders",
  wishlistHref = "/account/wishlist",
  addressBookHref = "/account/address-book",
  securityHref = "/account/security",
}: AccountOneProps) {
  return (
    <section className={cls.accountOne}>
      <div className={cls.container}>
        <div className={cls.hero}>
          <div className={cls.cover}>
            <Image src={coverImage || FALLBACK_IMAGE} alt={customerName} fill sizes="1200px" className={cls.coverImg} />
            <div className={cls.coverOverlay} />
          </div>

          <div className={cls.heroCard}>
            <div className={cls.avatarWrap}>
              <div className={cls.avatar}>
                <Image src={avatar || FALLBACK_IMAGE} alt={customerName} fill sizes="140px" className={cls.avatarImg} />
              </div>
              <span className={cls.onlineDot} />
            </div>

            <div className={cls.heroContent}>
              <div className={cls.heroTop}>
                <span className={cls.memberBadge}>
                  <i className="bi bi-patch-check-fill" />
                  {membership}
                </span>
                <span className={cls.customerCode}>{customerCode}</span>
              </div>

              <h2 className={cls.name}>{customerName}</h2>
              <p className={cls.bio}>{bio}</p>

              <div className={cls.meta}>
                <span>
                  <i className="bi bi-envelope" />
                  {email}
                </span>
                <span>
                  <i className="bi bi-telephone" />
                  {phone}
                </span>
                <span>
                  <i className="bi bi-calendar3" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>

            <div className={cls.heroActions}>
              <Link href={editProfileHref as Route} className={cls.primaryBtn}>
                <i className="bi bi-pencil-square" />
                <span>Edit Profile</span>
              </Link>

              <Link href={securityHref as Route} className={cls.secondaryBtn}>
                <i className="bi bi-shield-lock" />
                <span>Security</span>
              </Link>
            </div>
          </div>
        </div>

        <div className={cls.layout}>
          <div className={cls.main}>
            <div className={cls.statsGrid}>
              {stats.map((item, index) => (
                <article className={cls.statCard} key={`${item.label}-${index}`}>
                  <span className={cls.statIcon}>
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <div className={cls.statContent}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className={cls.sectionCard}>
              <div className={cls.sectionHead}>
                <div>
                  <h3>Personal Information</h3>
                  <p>Manage your account information and customer profile details.</p>
                </div>
                <Link href={editProfileHref as Route} className={cls.inlineLink}>
                  Update
                </Link>
              </div>

              <div className={cls.infoGrid}>
                <div className={cls.infoItem}>
                  <span>Full name</span>
                  <strong>{customerName}</strong>
                </div>
                <div className={cls.infoItem}>
                  <span>Email address</span>
                  <strong>{email}</strong>
                </div>
                <div className={cls.infoItem}>
                  <span>Phone number</span>
                  <strong>{phone}</strong>
                </div>
                <div className={cls.infoItem}>
                  <span>Customer ID</span>
                  <strong>{customerCode}</strong>
                </div>
                <div className={cls.infoItem}>
                  <span>Membership</span>
                  <strong>{membership}</strong>
                </div>
                <div className={cls.infoItem}>
                  <span>Joined date</span>
                  <strong>{joinedDate}</strong>
                </div>
              </div>
            </div>

            <div className={cls.sectionCard}>
              <div className={cls.sectionHead}>
                <div>
                  <h3>Recent Orders</h3>
                  <p>Track your latest orders and fulfillment status.</p>
                </div>
                <Link href={orderHistoryHref as Route} className={cls.inlineLink}>
                  View all
                </Link>
              </div>

              <div className={cls.tableWrap}>
                <table className={cls.orderTable}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link href={`${orderHistoryHref}/${item.id}` as Route} className={cls.orderLink}>
                            {item.code}
                          </Link>
                        </td>
                        <td>{item.date}</td>
                        <td>{item.total}</td>
                        <td>
                          <span className={`${cls.statusBadge} ${statusClass(item.status)}`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className={cls.sidebar}>
            <div className={`${cls.sectionCard} ${cls.loyaltyCard}`}>
              <div className={cls.loyaltyHead}>
                <span className={cls.loyaltyIcon}>
                  <i className="bi bi-gem" />
                </span>
                <div>
                  <h3>Loyalty Program</h3>
                  <p>Customer privileges and reward progress.</p>
                </div>
              </div>

              <div className={cls.pointsBox}>
                <span>Available points</span>
                <strong>{rewardPoints.toLocaleString("vi-VN")}</strong>
              </div>

              <div className={cls.progressWrap}>
                <div className={cls.progressTop}>
                  <span>Profile completion</span>
                  <strong>{completionRate}%</strong>
                </div>

                <div className={cls.progressBar}>
                  <span style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            </div>

            <div className={cls.sectionCard}>
              <div className={cls.sectionHead}>
                <div>
                  <h3>Quick Actions</h3>
                  <p>Fast access to important account features.</p>
                </div>
              </div>

              <div className={cls.actionList}>
                <ActionCard
                  href={editProfileHref}
                  icon="bi-person-gear"
                  title="Edit profile"
                  desc="Update avatar and personal information"
                />
                <ActionCard href={wishlistHref} icon="bi-heart" title="Wishlist" desc="Review saved products" />
                <ActionCard
                  href={addressBookHref}
                  icon="bi-geo-alt"
                  title="Address book"
                  desc="Manage shipping addresses"
                />
                <ActionCard
                  href={securityHref}
                  icon="bi-shield-lock"
                  title="Security"
                  desc="Protect your customer account"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export const SHOP_ACCOUNT_ONE: RegItem = {
  kind: "AccountOne",
  label: "Account One",
  defaults: {
    coverImage: FALLBACK_IMAGE,
    avatar: FALLBACK_IMAGE,
    customerName: "Phan Tuan Kiet",
    customerCode: "CUS-240326",
    email: "tuankietity@gmail.com",
    phone: "0901 234 567",
    joinedDate: "January 2024",
    membership: "Gold Member",
    bio: "Professional customer account profile with modern dashboard layout and premium shopping experience.",
    completionRate: 88,
    rewardPoints: 2480,
    stats: JSON.stringify(DEFAULT_STATS, null, 2),
    orders: JSON.stringify(DEFAULT_ORDERS, null, 2),
    editProfileHref: "/account/edit",
    orderHistoryHref: "/account/orders",
    wishlistHref: "/account/wishlist",
    addressBookHref: "/account/address-book",
    securityHref: "/account/security",
  },
  inspector: [
    { key: "coverImage", label: "Cover Image", kind: "text" },
    { key: "avatar", label: "Avatar", kind: "text" },
    { key: "customerName", label: "Customer Name", kind: "text" },
    { key: "customerCode", label: "Customer Code", kind: "text" },
    { key: "email", label: "Email", kind: "text" },
    { key: "phone", label: "Phone", kind: "text" },
    { key: "joinedDate", label: "Joined Date", kind: "text" },
    { key: "membership", label: "Membership", kind: "text" },
    { key: "bio", label: "Bio", kind: "textarea", rows: 4 },
    { key: "completionRate", label: "Completion Rate", kind: "number" },
    { key: "rewardPoints", label: "Reward Points", kind: "number" },
    { key: "editProfileHref", label: "Edit Profile Href", kind: "text" },
    { key: "orderHistoryHref", label: "Order History Href", kind: "text" },
    { key: "wishlistHref", label: "Wishlist Href", kind: "text" },
    { key: "addressBookHref", label: "Address Book Href", kind: "text" },
    { key: "securityHref", label: "Security Href", kind: "text" },
    { key: "stats", label: "Stats (JSON)", kind: "textarea", rows: 10 },
    { key: "orders", label: "Orders (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const data = props as Record<string, any>;

    return (
      <div aria-label="Shop Account One">
        <AccountOne
          preview={Boolean(data.preview)}
          coverImage={data.coverImage}
          avatar={data.avatar}
          customerName={data.customerName}
          customerCode={data.customerCode}
          email={data.email}
          phone={data.phone}
          joinedDate={data.joinedDate}
          membership={data.membership}
          bio={data.bio}
          completionRate={Number(data.completionRate ?? 88)}
          rewardPoints={Number(data.rewardPoints ?? 2480)}
          stats={parseStats(data.stats)}
          orders={parseOrders(data.orders)}
          editProfileHref={data.editProfileHref}
          orderHistoryHref={data.orderHistoryHref}
          wishlistHref={data.wishlistHref}
          addressBookHref={data.addressBookHref}
          securityHref={data.securityHref}
        />
      </div>
    );
  },
};

export default AccountOne;
