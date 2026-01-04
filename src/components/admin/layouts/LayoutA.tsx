"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { usePathname } from "next/navigation";

export default function LayoutA({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      {sidebarOpen && <button className={styles.backdrop} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" type="button" />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brandWrap}>
          <Link href="/admin" className={styles.brandLink}>
            <div className={styles.brandLogo}>
              <span className={styles.brandLogoText}>D</span>
              <span className={styles.brandGlow} />
            </div>

            <div className={styles.brandText}>
              <div className={styles.brandTop}>
                <div className={styles.brandName}>Dabang</div>
                <span className={styles.brandBadge}>Admin</span>
              </div>
              <div className={styles.brandSub}>
                <i className="bi bi-shield-lock" />
                <span>Dashboard Panel</span>
              </div>
            </div>

            <div className={styles.brandChevron} aria-hidden="true">
              <i className="bi bi-chevron-right" />
            </div>
          </Link>
        </div>

        <nav className={styles.nav}>
          <NavItem href="/admin" icon="bi-speedometer2" label="Dashboard" />

          <NavGroup
            icon="bi-bag"
            label="Orders"
            items={[
              { href: "/admin/orders", label: "All Orders" },
              { href: "/admin/orders/pending", label: "Pending" },
              { href: "/admin/orders/completed", label: "Completed" },
            ]}
          />

          <NavGroup
            icon="bi-box-seam"
            label="Products"
            items={[
              { href: "/admin/products", label: "All Products" },
              { href: "/admin/products/create", label: "Add Product" },
              { href: "/admin/categories", label: "Categories" },
              { href: "/admin/brands", label: "Brands" },
            ]}
          />

          <NavGroup
            icon="bi-graph-up"
            label="Reports"
            items={[
              { href: "/admin/reports/sales", label: "Sales Report" },
              { href: "/admin/reports/customers", label: "Customers" },
              { href: "/admin/reports/inventory", label: "Inventory" },
            ]}
          />

          <NavItem href="/admin/messages" icon="bi-chat-dots" label="Messages" />
          <NavItem href="/admin/settings" icon="bi-gear" label="Settings" />

          <div className={styles.navDivider} />

          <NavItem href="/admin/logout" icon="bi-box-arrow-right" label="Sign Out" />
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          {/* NEW: hamburger */}
          <button className={styles.burger} type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <i className="bi bi-list" />
          </button>

          <div className={styles.pageTitleWrap}>
            <span className={styles.pageTitleText}>Dashboard</span>
          </div>

          <div className={styles.btnF}>
            <div className={styles.shortcutCard}>
              <div className={styles.shortcutKey}>F1</div>
              <div className={styles.shortcutLabel}>Back</div>
            </div>
            <div className={styles.shortcutCard}>
              <div className={styles.shortcutKey}>F12</div>
              <div className={styles.shortcutLabel}>Dashboard</div>
            </div>
          </div>

          <div className={styles.search}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input className={styles.searchInput} placeholder="Search here..." />
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconBtn} type="button" aria-label="Language">
              <i className="bi bi-globe2" />
            </button>
            <button className={styles.iconBtn} type="button" aria-label="Notifications">
              <i className="bi bi-bell" />
              <span className={styles.dot} />
            </button>

            <div className={styles.user}>
              <div className={styles.avatar}>M</div>
              <div className={styles.userText}>
                <div className={styles.userName}>Musfiq</div>
                <div className={styles.userRole}>Admin</div>
              </div>
              <i className={`bi bi-chevron-down ${styles.userChevron}`} />
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link href={href} className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}>
      <span className={styles.navIcon}>
        <i className={`bi ${icon}`} />
      </span>
      <span className={styles.navLabel}>{label}</span>
      <span className={styles.singleDot} />
    </Link>
  );
}

function NavGroup({ icon, label, items }: { icon: string; label: string; items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  // Active nếu đang ở 1 route con
  const isChildActive = useMemo(() => items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/")), [items, pathname]);

  const [open, setOpen] = useState(isChildActive);

  // Nếu user vào 1 route con trực tiếp => tự mở group
  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  return (
    <div className={styles.navGroup}>
      <button type="button" className={`${styles.navItem} ${isChildActive ? styles.navItemActive : ""} ${styles.navGroupBtn}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={styles.navIcon}>
          <i className={`bi ${icon}`} />
        </span>

        <span className={styles.navLabel}>{label}</span>

        <span className={`${styles.chev} ${open ? styles.chevOpen : ""}`}>
          <i className="bi bi-chevron-down" />
        </span>
      </button>

      <div className={`${styles.submenu} ${open ? styles.submenuOpen : ""}`}>
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} className={`${styles.subItem} ${active ? styles.subItemActive : ""}`}>
              <span className={styles.subDot} />
              <span className={styles.subLabel}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
