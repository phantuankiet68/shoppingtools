"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { useAdminLayoutStore } from "@/store/layout/layouta/index";

type Props = {
  meta: { title: string; subtitle?: string | null };
  onLogout: () => void | Promise<void>;
};

export default function Topbar({ meta, onLogout }: Props) {
  const {
    sidebarOpen,
    toggleSidebar,

    user,
    userMenuOpen,
    setUserMenuOpen,

    notiOpen,
    setNotiOpen,
    notiTab,
    setNotiTab,
  } = useAdminLayoutStore();

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notiRef = useRef<HTMLDivElement | null>(null);

  // close when click outside (để chuẩn như code gốc - tránh đóng khi click bên trong)
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(t)) setUserMenuOpen(false);
      if (notiRef.current && !notiRef.current.contains(t)) setNotiOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setUserMenuOpen(false);
      setNotiOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [setNotiOpen, setUserMenuOpen]);

  const handleLogoutClick = async () => {
    setUserMenuOpen(false);
    await onLogout();
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.row1}>
        <div className={styles.left}>
          <button
            className={styles.burger}
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            <i className={`bi ${sidebarOpen ? "bi-arrow-bar-left" : "bi-list"}`} />
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
            <input className={styles.searchInput} placeholder="Search anything…" />
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
            <button
              className={styles.iconBtn}
              type="button"
              aria-label="Notifications"
              aria-haspopup="menu"
              aria-expanded={notiOpen}
              onClick={() => setNotiOpen(!notiOpen)}
            >
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
                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "all" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("all")}
                  >
                    All <span className={styles.notiBadge}>3</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "messages" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("messages")}
                  >
                    Messages <span className={styles.notiBadgeMuted}>2</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "tasks" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("tasks")}
                  >
                    Tasks <span className={styles.notiBadgeMuted}>1</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "alerts" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("alerts")}
                  >
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
            <button
              className={styles.userBtn}
              type="button"
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
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
                <Link
                  className={styles.menuItem}
                  href="/admin/profile"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <span className={styles.menuIcon}>
                    <i className="bi bi-person" />
                  </span>
                  <span className={styles.menuText}>Profile</span>
                </Link>

                <Link
                  className={styles.menuItem}
                  href="/admin/settings"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <span className={styles.menuIcon}>
                    <i className="bi bi-gear" />
                  </span>
                  <span className={styles.menuText}>Settings</span>
                </Link>

                <div className={styles.userDropdownDivider} />

                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.danger}`}
                  role="menuitem"
                  onClick={handleLogoutClick}
                >
                  <span className={styles.menuIcon}>
                    <i className="bi bi-box-arrow-right" />
                  </span>
                  <span className={styles.menuText}>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
