"use client";

import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
import styles from "@/styles/admin/system/profile/ProfilePage.module.css";
import { useCallback, useEffect, useState } from "react";

import ProfileForm from "@/components/admin/system/profile/ProfileForm";
import ChangePassword from "@/components/admin/system/profile/ChangePassword";
import AdminMessagesClient from "@/components/admin/system/profile/AdminMessagesClient";
import CalendarClient from "@/components/admin/system/profile/Calendar";
import AdminFilesClient from "@/components/admin/system/profile/AdminFilesClient";
import AdminImagesClient from "@/components/admin/system/profile/AdminImagesClient";
import AdminSpendingClient from "@/components/admin/system/profile/AdminSpendingClient";
import AdminPrivacyClient from "@/components/admin/system/profile/AdminPrivacyClient";
import AvatarUploadModal from "@/components/admin/system/profile/AvatarUploadModal";

type AdminUser = {
  name: string;
  role: string;
  email: string;
  image?: string | null;
};

const LS_KEY = "admin_profile_active_section";

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [openAvatar, setOpenAvatar] = useState(false);

  // ✅ init từ localStorage ngay lần render đầu (không cần useEffect)
  const [activeSection, setActiveSection] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_KEY) ?? "profile";
    } catch {
      return "profile";
    }
  });

  // ✅ stable handler
  const setSection = useCallback((section: string) => {
    setActiveSection(section);
    try {
      localStorage.setItem(LS_KEY, section);
    } catch {}
  }, []);

  // ✅ fetch me với AbortController (đúng chuẩn, tránh request treo)
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const r = await fetch("/api/admin/auth/me", {
          credentials: "include",
          signal: controller.signal,
          cache: "no-store",
        });
        if (!r.ok) return;

        const data = await r.json();
        setUser(data?.user ?? null);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    })();

    return () => controller.abort();
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
