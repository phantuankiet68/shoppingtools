"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import styles from "@/styles/admin/layouts/Topbar.module.css";
import { useAdminLayoutStore } from "@/store/layout/layouta/index";

type Props = {
  meta: { title: string; subtitle?: string | null };
  onLogout: () => void | Promise<void>;
};

const functionKeys = [
  { key: "F1", label: "Help" },
  { key: "F2", label: "Rename" },
  { key: "F3", label: "Find" },
  { key: "F4", label: "Open" },
  { key: "F5", label: "Refresh" },
  { key: "F6", label: "Focus" },
  { key: "F7", label: "Report" },
  { key: "F8", label: "Analytics" },
  { key: "F9", label: "Users" },
  { key: "F10", label: "Logs" },
  { key: "F11", label: "Fullscreen" },
  { key: "F12", label: "Dev" },
];

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

  const handleFunctionClick = (key: string) => {
    // Tạm thời demo
    // Sau này bạn có thể map từng key sang route/action cụ thể
    console.log(`Function ${key} clicked`);
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
          <div className={styles.functionBar}>
            <div className={styles.functionGrid}>
              {functionKeys.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={styles.functionKey}
                  onClick={() => handleFunctionClick(item.key)}
                  title={`${item.key} - ${item.label}`}
                >
                  <span className={styles.functionKeyCode}>{item.key}</span>
                  <span className={styles.functionKeyLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <button className={styles.iconBtn} type="button" aria-label="Language">
            <i className="bi bi-chat-dots" />
            <span className={styles.notificationDot} />
          </button>
          <button className={styles.iconBtn} type="button" aria-label="Language">
            <i className="bi bi-globe2" />
            <span className={styles.notificationDot} />
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
