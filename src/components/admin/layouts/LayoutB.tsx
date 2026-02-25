import type { ReactNode } from "react";
import styles from "@/styles/admin/layouts/LayoutB.module.css";
import { useEffect, useId, useRef, useState } from "react";

export default function LayoutB({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <Topbar />
        <Menubar />
      </div>
      <main className={`${styles.main} ${styles.mt100}`}>
        <div className={styles.content}>{children}</div>
        <footer className={styles.footer}>
          <span>© 2024 Multipurpose Themes. All Rights Reserved.</span>
          <a className={styles.footerLink} href="#">
            Purchase Now
          </a>
        </footer>
      </main>
    </div>
  );
}

/* ---------------- TOPBAR ---------------- */

function Topbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // click outside để đóng popup
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <span className={styles.dotA} />
          <span className={styles.dotB} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandCRM}>CRM</span> Hq Admin
        </div>
      </div>

      <div className={styles.search}>
        <i className={`bi bi-search ${styles.searchIcon}`} />
        <input className={styles.searchInput} placeholder="Search" />
      </div>

      <div className={styles.topActions}>
        <IconSquare icon="bi-brightness-high" />
        <IconSquare icon="bi-bell">
          <span className={styles.badge}>8</span>
        </IconSquare>
        <IconSquare icon="bi-chat-left-text" />
        <IconSquare icon="bi-flag-fill" />
        <IconSquare icon="bi-arrows-fullscreen" />
        <IconSquare icon="bi-sliders" />

        <div ref={ref} className={styles.userMenuWrap}>
          {/* USER CHIP BUTTON */}
          <button type="button" className={styles.userChip} onClick={() => setOpen((v) => !v)}>
            <div className={styles.userText}>
              <div className={styles.userName}>John Doe</div>
              <div className={styles.userStatus}>Available</div>
            </div>

            <div className={styles.userAvatar}>
              <img className={styles.userAvatarImg} src="/assets/images/avatar.png" alt="John Doe" />
            </div>
          </button>

          {/* POPUP */}
          {open && (
            <div className={styles.userPopup}>
              <a className={styles.popupItem}>
                <i className="bi bi-person" />
                Profile
              </a>
              <a className={styles.popupItem}>
                <i className="bi bi-wallet2" />
                My Wallet
              </a>
              <a className={styles.popupItem}>
                <i className="bi bi-gear" />
                Settings
              </a>
              <a className={styles.popupItem}>
                <i className="bi bi-lock" />
                Lock Screen
              </a>

              <div className={styles.popupDivider} />

              <button className={`${styles.popupItem} ${styles.logout}`}>
                <i className="bi bi-box-arrow-right" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconSquare({ icon, children }: { icon: string; children?: ReactNode }) {
  return (
    <button className={styles.iconSquare} type="button">
      <i className={`bi ${icon}`} />
      {children}
    </button>
  );
}

function Menubar() {
  const items = [
    ["Dashboard", "bi-house-door"],
    ["Apps", "bi-grid"],
    ["Widgets", "bi-box"],
    ["Login & Error", "bi-shield-lock"],
    ["UI", "bi-ui-checks"],
    ["Forms & Table", "bi-card-text"],
    ["Charts", "bi-bar-chart"],
    ["Pages", "bi-files"],
    ["Support", "bi-headset"],
    ["Emails", "bi-envelope"],
  ];

  return (
    <nav className={styles.menubar}>
      {items.map(([label, icon]) => (
        <a key={label} className={`${styles.menuItem} ${label === "Dashboard" ? styles.active : ""}`} href="#">
          <i className={`bi ${icon}`} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
export function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.avatarWrap}>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <span className={styles.avatarImg} aria-hidden="true" />
        <span className={styles.avatarOnline} aria-hidden="true" />
      </button>

      {open && (
        <div id={menuId} role="menu" className={styles.avatarMenu}>
          <a className={styles.menuItem} role="menuitem" href="#">
            <i className="bi bi-person" />
            <span>Profile</span>
          </a>

          <a className={styles.menuItem} role="menuitem" href="#">
            <i className="bi bi-wallet2" />
            <span>My Wallet</span>
          </a>

          <a className={styles.menuItem} role="menuitem" href="#">
            <i className="bi bi-gear" />
            <span>Settings</span>
            <span className={styles.menuBadge}>11</span>
          </a>

          <a className={styles.menuItem} role="menuitem" href="#">
            <i className="bi bi-lock" />
            <span>Lock screen</span>
          </a>

          <div className={styles.menuDivider} />

          <button className={`${styles.menuItem} ${styles.logout}`} role="menuitem" type="button">
            <i className="bi bi-box-arrow-right" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
