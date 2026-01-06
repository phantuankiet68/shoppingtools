"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { usePathname } from "next/navigation";
import { useAdminTitle } from "@/components/admin/AdminTitleContext";

type AdminUser = { name: string; role: string };
type NotiTab = "all" | "messages" | "tasks" | "alerts";

export default function LayoutA({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notiTab, setNotiTab] = useState<NotiTab>("all");
  const notiRef = useRef<HTMLDivElement | null>(null);
  const { meta } = useAdminTitle();

  useEffect(() => {
    let alive = true;

    fetch("/api/admin/me", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        setUser(data?.user ?? null);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!userMenuRef.current) return;
      const target = e.target as Node;
      if (!userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setUserMenuOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!notiRef.current) return;
      const target = e.target as Node;
      if (!notiRef.current.contains(target)) setNotiOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setNotiOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const toggleNoti = () => setNotiOpen((v) => !v);

  return (
    <div className={`${styles.shell} ${sidebarOpen ? styles.shellSidebarOpen : styles.shellSidebarClosed}`}>
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
          <div className={styles.row1}>
            <div className={styles.left}>
              <button className={styles.burger} type="button" onClick={toggleSidebar} aria-label="Toggle sidebar" aria-expanded={sidebarOpen}>
                <i className={`bi ${sidebarOpen ? "bi-x" : "bi-list"}`} />
              </button>

              <div className={styles.titleBlock}>
                <h1 className={styles.pageTitle}>{meta.title}</h1>
                <span className={styles.pageSubtitle}>{meta.subtitle ?? ""}</span>
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.search}>
                <span className={styles.searchIcon}>
                  <i className="bi bi-search" />
                </span>
                <input className={styles.searchInput} placeholder="Search anything… (pages, users, orders)" />
                <span className={styles.kbd}>
                  <strong>Ctrl</strong> K
                </span>
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.row2}>
                <div className={styles.row2Right}>
                  <button className={styles.ghostBtn} type="button">
                    <i className="bi bi-funnel" />
                    Filters
                  </button>

                  <button className={styles.ghostBtn} type="button">
                    <i className="bi bi-download" />
                    Export
                  </button>

                  <button className={styles.ghostBtn} type="button">
                    <i className="bi bi-sliders" />
                    Customize
                  </button>
                </div>
              </div>
              <button className={styles.iconBtn} type="button" aria-label="Language">
                <i className="bi bi-globe2" />
              </button>

              <div className={styles.notiWrap} ref={notiRef}>
                <button className={styles.iconBtn} type="button" aria-label="Notifications" aria-haspopup="menu" aria-expanded={notiOpen} onClick={toggleNoti}>
                  <i className="bi bi-bell" />
                  <span className={styles.dot} />
                </button>

                {notiOpen && (
                  <div className={styles.notiDropdown} role="menu" aria-label="Notifications menu">
                    <div className={styles.notiHead}>
                      <div className={styles.notiTitle}>Notifications</div>
                      <button className={styles.notiLink} type="button">
                        VIEW ALL
                      </button>
                    </div>

                    <div className={styles.notiTabs}>
                      <button type="button" className={`${styles.notiTab} ${notiTab === "all" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("all")}>
                        All <span className={styles.notiBadge}>3</span>
                      </button>

                      <button type="button" className={`${styles.notiTab} ${notiTab === "messages" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("messages")}>
                        Messages <span className={styles.notiBadgeMuted}>2</span>
                      </button>

                      <button type="button" className={`${styles.notiTab} ${notiTab === "tasks" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("tasks")}>
                        Tasks <span className={styles.notiBadgeMuted}>1</span>
                      </button>

                      <button type="button" className={`${styles.notiTab} ${notiTab === "alerts" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("alerts")}>
                        Alerts
                      </button>
                    </div>

                    <div className={styles.notiList}>
                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>You have a new task</span>
                          <span className={styles.notiItemSub}>Just now</span>
                        </span>
                      </button>

                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>New message from Naomi</span>
                          <span className={styles.notiItemSub}>1 hour ago</span>
                        </span>
                      </button>

                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>Your role has been set to Admin</span>
                          <span className={styles.notiItemSub}>3 days ago</span>
                        </span>
                      </button>

                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>New message from Robert</span>
                          <span className={styles.notiItemSub}>2 weeks ago</span>
                        </span>
                      </button>
                    </div>

                    <div className={styles.notiFoot}>
                      <button className={styles.notiMark} type="button">
                        <i className="bi bi-check2" />
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <span className={styles.divider} />

              <div className={styles.userMenu} ref={userMenuRef}>
                <button className={styles.userBtn} type="button" aria-label="User menu" aria-haspopup="menu" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen((v) => !v)}>
                  <div className={styles.avatarWrap}>
                    <div className={styles.avatar}>A</div>
                    <span className={styles.status} />
                  </div>

                  <div className={styles.userText}>
                    <div className={styles.userName}>{user?.name ?? "—"}</div>
                    <div className={styles.userRole}>{user?.role ?? ""}</div>
                  </div>

                  <span className={styles.userChevron}>
                    <i className={`bi bi-chevron-down ${userMenuOpen ? styles.chevOpen : ""}`} />
                  </span>
                </button>

                {userMenuOpen && (
                  <div className={styles.userDropdown} role="menu" aria-label="User options">
                    <Link className={styles.menuItem} href="/admin/profile" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <span className={styles.menuIcon}>
                        <i className="bi bi-person" />
                      </span>
                      <span className={styles.menuText}>Profile</span>
                    </Link>

                    <Link className={styles.menuItem} href="/admin/settings" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <span className={styles.menuIcon}>
                        <i className="bi bi-gear" />
                      </span>
                      <span className={styles.menuText}>Settings</span>
                    </Link>

                    <div className={styles.userDropdownDivider} />

                    <Link className={`${styles.menuItem} ${styles.danger}`} href="/admin/logout" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <span className={styles.menuIcon}>
                        <i className="bi bi-box-arrow-right" />
                      </span>
                      <span className={styles.menuText}>Logout</span>
                    </Link>
                  </div>
                )}
              </div>
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
