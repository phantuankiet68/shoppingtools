"use client";

import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
import styles from "@/styles/admin/profile/ProfilePage.module.css";
import { useEffect, useMemo, useState, useRef } from "react";
import ProfileForm from "@/components/admin/system/profile/ProfileForm";
import ChangePassword from "@/components/admin/system/profile/ChangePassword";
import AdminMessagesClient from "@/components/admin/system/profile/AdminMessagesClient";
import CalendarClient from "@/components/admin/system/profile/Calendar";
import AdminFilesClient from "@/components/admin/system/profile/AdminFilesClient";
import AdminImagesClient from "@/components/admin/system/profile/AdminImagesClient";
import AdminSpendingClient from "@/components/admin/system/profile/AdminSpendingClient";
import AdminPrivacyClient from "@/components/admin/system/profile/AdminPrivacyClient";
import AvatarUploadModal from "@/components/admin/system/profile/AvatarUploadModal";

const responsibilities = ["Security", "Encryption", "Keys and Secrets"];

type AdminUser = { name: string; role: string; image: string; email: string };

const LS_KEY = "admin_profile_active_section";

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [openAvatar, setOpenAvatar] = useState(false);

  function setSection(section: string) {
    setActiveSection(section);
    try {
      localStorage.setItem(LS_KEY, section);
    } catch {}
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      setActiveSection(saved ?? "profile");
    } catch {
      setActiveSection("profile");
    }
  }, []);

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
            <div className={styles.avatar}>
              {user?.image ? (
                <img src={user.image} alt={user.name ?? "User avatar"} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarFallback}>
                  {(user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
                </span>
              )}
            </div>

            <button
              className={styles.addBtn}
              type="button"
              aria-label="Change avatar"
              onClick={() => setOpenAvatar(true)}
            >
              <i className="bi bi-plus" />
            </button>
          </div>

          <h3 className={styles.personName}>{user?.name ?? "—"}</h3>
        </div>
        <AvatarUploadModal
          open={openAvatar}
          onClose={() => setOpenAvatar(false)}
          currentImage={user?.image}
          onUploaded={(newUrl) => setUser((u) => (u ? { ...u, image: newUrl } : u))}
        />
        {/* Menu */}
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navTitle}>Account</div>

            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "profile" ? styles.active : ""}`}
              onClick={() => setSection("profile")}
            >
              <i className="bi bi-person-circle" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "changePassword" ? styles.active : ""}`}
              onClick={() => setSection("changePassword")}
            >
              <i className="bi bi-shield-lock" />
              <span>Change password</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "message" ? styles.active : ""}`}
              onClick={() => setSection("message")}
            >
              <i className="bi bi-file-earmark-person" />
              <span>Messages</span>
            </button>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navTitle}>Workspace</div>

            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "calendar" ? styles.active : ""}`}
              onClick={() => setSection("calendar")}
            >
              <i className="bi bi-calendar3" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "file" ? styles.active : ""}`}
              onClick={() => setSection("file")}
            >
              <i className="bi bi-folder2-open" />
              <span>Files</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "image" ? styles.active : ""}`}
              onClick={() => setSection("image")}
            >
              <i className="bi bi-images" />
              <span>Images</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "spending" ? styles.active : ""}`}
              onClick={() => setSection("spending")}
            >
              <i className="bi bi-credit-card" />
              <span>Spending</span>
              <span className={styles.badge}>NEW</span>
            </button>
          </div>

          <div className={styles.navFooter}>
            <button
              type="button"
              className={`${styles.navItem} ${activeSection === "privacy" ? styles.active : styles.danger}`}
              onClick={() => setSection("privacy")}
            >
              <i className="bi bi-shield-lock" />
              <span>Privacy</span>
            </button>
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
            <AdminMessagesClient />
          </section>
        )}

        {activeSection === "calendar" && (
          <section id="calendar">
            <CalendarClient />
          </section>
        )}

        {activeSection === "file" && (
          <section id="file">
            <AdminFilesClient />
          </section>
        )}

        {activeSection === "image" && (
          <section id="image">
            <AdminImagesClient />
          </section>
        )}

        {activeSection === "spending" && (
          <section id="spending">
            <AdminSpendingClient />
          </section>
        )}

        {activeSection === "privacy" && (
          <section id="privacy">
            <AdminPrivacyClient />
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
