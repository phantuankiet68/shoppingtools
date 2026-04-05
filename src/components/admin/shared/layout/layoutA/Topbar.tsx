"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import styles from "@/styles/admin/layouts/Topbar.module.css";
import { useAdminLayoutStore } from "@/store/layout/layouta/index";
import { FunctionKeyBar, type FunctionKeyCode } from "@/components/admin/shared/layout/function-keys";
import { useFunctionKeysContext } from "@/components/admin/shared/layout/function-keys/FunctionKeysProvider";

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

  const { items, actions } = useFunctionKeysContext();

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(t)) {
        setUserMenuOpen(false);
      }

      if (notiRef.current && !notiRef.current.contains(t)) {
        setNotiOpen(false);
      }
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

  const handleFunctionClick = (key: FunctionKeyCode) => {
    actions[key]?.();
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarShell}>
        <div className={styles.topbarLeft}>
          <button
            className={styles.sidebarToggle}
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            <i className={`bi ${sidebarOpen ? "bi-text-indent-right" : "bi-list"}`} />
          </button>

          <div className={styles.titleSection}>
            <div className={styles.titleRow}>
              <span className={styles.titleAccent} />
              <h1 className={styles.pageTitle}>{meta.title}</h1>
            </div>

            <div className={styles.breadcrumb}>Admin Panel / Dashboard</div>
          </div>
        </div>

        <div className={styles.topbarCenter}>
          <FunctionKeyBar items={items} onClick={handleFunctionClick} />
        </div>

        <div className={styles.topbarRight}>
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
              <span className={styles.notificationDot} />
            </button>

            {notiOpen && (
              <div className={styles.dropdownCard} role="menu" aria-label="Notifications menu">
                <div className={styles.dropdownHeader}>
                  <div>
                    <div className={styles.dropdownTitle}>Notifications</div>
                    <div className={styles.dropdownSubtitle}>You have 3 unread updates</div>
                  </div>

                  <button className={styles.textButton} type="button">
                    View all
                  </button>
                </div>

                <div className={styles.notiTabs}>
                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "all" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("all")}
                  >
                    All
                  </button>

                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "messages" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("messages")}
                  >
                    Messages
                  </button>

                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "tasks" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("tasks")}
                  >
                    Tasks
                  </button>

                  <button
                    type="button"
                    className={`${styles.notiTab} ${notiTab === "alerts" ? styles.notiTabActive : ""}`}
                    onClick={() => setNotiTab("alerts")}
                  >
                    Alerts
                  </button>
                </div>

                <div className={styles.notificationList}>
                  <button className={styles.notificationItem} type="button">
                    <span className={styles.notificationAccent} />
                    <span className={styles.notificationContent}>
                      <span className={styles.notificationTitle}>You have a new task assigned</span>
                      <span className={styles.notificationMeta}>Just now</span>
                    </span>
                  </button>

                  <button className={styles.notificationItem} type="button">
                    <span className={styles.notificationAccent} />
                    <span className={styles.notificationContent}>
                      <span className={styles.notificationTitle}>Naomi sent you a new message</span>
                      <span className={styles.notificationMeta}>1 hour ago</span>
                    </span>
                  </button>

                  <button className={styles.notificationItem} type="button">
                    <span className={styles.notificationAccent} />
                    <span className={styles.notificationContent}>
                      <span className={styles.notificationTitle}>Your account role was updated to Admin</span>
                      <span className={styles.notificationMeta}>3 days ago</span>
                    </span>
                  </button>
                </div>

                <div className={styles.dropdownFooter}>
                  <button className={styles.ghostInlineBtn} type="button">
                    <i className="bi bi-check2" />
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.userMenu} ref={userMenuRef}>
            <button
              className={styles.userTrigger}
              type="button"
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase() ?? "A"}</div>
                <span className={styles.onlineDot} />
              </div>

              <div className={styles.userInfo}>
                <div className={styles.userName}>{user?.name ?? "admin"}</div>
                <div className={styles.userRole}>{user?.role ?? "Admin"}</div>
              </div>

              <span className={styles.chevron}>
                <i className={`bi bi-chevron-down ${userMenuOpen ? styles.chevronOpen : ""}`} />
              </span>
            </button>

            {userMenuOpen && (
              <div className={styles.userDropdown} role="menu" aria-label="User options">
                <Link
                  className={styles.dropdownItem}
                  href="/admin/profile"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <i className="bi bi-person" />
                  <span>Profile</span>
                </Link>

                <Link
                  className={styles.dropdownItem}
                  href="/admin/settings"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <i className="bi bi-gear" />
                  <span>Settings</span>
                </Link>

                <div className={styles.dropdownDivider} />

                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  role="menuitem"
                  onClick={handleLogoutClick}
                >
                  <i className="bi bi-box-arrow-right" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
