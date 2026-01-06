"use client";

import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
import styles from "@/styles/admin/profile/ProfilePage.module.css";
import { useEffect, useMemo, useState, useRef } from "react";
import ProfileForm from "@/components/admin/profile/ProfileForm";
import ChangePassword from "@/components/admin/profile/ChangePassword";

const responsibilities = ["Security", "Encryption", "Keys and Secrets"];

type AdminUser = { name: string; role: string };

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeSection, setActiveSection] = useState<string>("profile");

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

  return (
    <div className={styles.page}>
      <AdminPageTitle title="Profile" subtitle="Manage Profile" />
      <aside className={styles.sidebar}>
        <div className={styles.profileBlock}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} />
            <button className={styles.addBtn}>
              <i className="bi bi-plus" />
            </button>
          </div>

          <h3 className={styles.personName}>{user?.name ?? "—"}</h3>
        </div>

        {/* Menu */}
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navTitle}>Account</div>

            <a className={`${styles.navItem} ${activeSection === "profile" ? styles.active : ""}`} onClick={() => setActiveSection("profile")}>
              <i className="bi bi-person-circle" />
              <span>Profile</span>
            </a>

            <a className={`${styles.navItem} ${activeSection === "changePassword" ? styles.active : ""}`} onClick={() => setActiveSection("changePassword")}>
              <i className="bi bi-shield-lock" />
              <span>Change password</span>
            </a>

            <a className={`${styles.navItem} ${activeSection === "message" ? styles.active : ""}`} onClick={() => setActiveSection("message")}>
              <i className="bi bi-file-earmark-person" />
              <span>Messages</span>
            </a>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navTitle}>Workspace</div>

            <a className={`${styles.navItem} ${activeSection === "task" ? styles.active : ""}`} onClick={() => setActiveSection("task")}>
              <i className="bi bi-check2-square" />
              <span>Tasks</span>
            </a>

            <a className={`${styles.navItem} ${activeSection === "calendar" ? styles.active : ""}`} onClick={() => setActiveSection("calendar")}>
              <i className="bi bi-calendar3" />
              <span>Calendar</span>
            </a>

            <a className={`${styles.navItem} ${activeSection === "file" ? styles.active : ""}`} onClick={() => setActiveSection("file")}>
              <i className="bi bi-folder2-open" />
              <span>Files</span>
            </a>

            <a className={`${styles.navItem} ${activeSection === "image" ? styles.active : ""}`} onClick={() => setActiveSection("image")}>
              <i className="bi bi-images" />
              <span>Images</span>
            </a>

            <a className={`${styles.navItem} ${activeSection === "spending" ? styles.active : ""}`} onClick={() => setActiveSection("spending")}>
              <i className="bi bi-credit-card" />
              <span>Spending</span>
              <span className={styles.badge}>NEW</span>
            </a>
          </div>

          <div className={styles.navFooter}>
            <a className={`${styles.navItem} ${activeSection === "privacy" ? styles.active : styles.danger}`} onClick={() => setActiveSection("privacy")}>
              <i className="bi bi-shield-lock" />
              <span>Privacy</span>
            </a>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {activeSection === "profile" && (
          <section id="profile">
            <ProfileForm />
          </section>
        )}

        {activeSection === "changePassword" && (
          <section id="changePassword">
            <ChangePassword />
          </section>
        )}

        {activeSection === "message" && (
          <section id="message">
            <h2>CV</h2>
          </section>
        )}

        {activeSection === "task" && (
          <section id="task">
            <h2>Tasks</h2>
          </section>
        )}

        {activeSection === "calendar" && (
          <section id="calendar">
            <h2>Calendar</h2>
          </section>
        )}

        {activeSection === "file" && (
          <section id="file">
            <h2>Files</h2>
          </section>
        )}

        {activeSection === "image" && (
          <section id="image">
            <h2>Images</h2>
          </section>
        )}

        {activeSection === "spending" && (
          <section id="spending">
            <h2>Spending</h2>
          </section>
        )}

        {activeSection === "privacy" && (
          <section id="privacy">
            <h2>Privacy</h2>
          </section>
        )}
      </main>

      <aside className={styles.right}>
        <div className={styles.mapBg} aria-hidden="true" />

        <div className={styles.rightInner}></div>
      </aside>
    </div>
  );
}
