"use client";

import { useState } from "react";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import AvatarUploadModal from "@/components/admin/profile/AvatarUploadModal";

import { useAdminProfile } from "@/hooks/useAdminProfile";

import HeroSection from "@/components/admin/profile/HeroSection";
import PersonalInfoSection from "@/components/admin/profile/PersonalInfoSection";
import StoreInfoSection from "@/components/admin/profile/StoreInfoSection";
import AddressInfoSection from "@/components/admin/profile/AddressInfoSection";

import styles from "@/styles/admin/profile/ProfilePage.module.css";

export default function AdminProfileClient() {
  const [openAvatar, setOpenAvatar] = useState(false);

  const { t } = useAdminI18n();

  const { user, currentWorkspace } = useAdminAuth();

  const { profile, setProfile, loading, saving, updateField, handleSave, handleUpload } = useAdminProfile({
    workspaceId: currentWorkspace?.id,
    userEmail: user?.email,
  });

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">{t("profile.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <HeroSection profile={profile} saving={saving} onSave={handleSave} onOpenAvatar={() => setOpenAvatar(true)} />

        <PersonalInfoSection
          profile={profile}
          updateField={updateField}
          userName={user?.name}
          userEmail={user?.email}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.divider}>
          <StoreInfoSection profile={profile} updateField={updateField} handleUpload={handleUpload} />

          <AddressInfoSection profile={profile} updateField={updateField} />
        </div>
      </div>

      <AvatarUploadModal
        open={openAvatar}
        onClose={() => setOpenAvatar(false)}
        currentImage={profile.avatar}
        onUploaded={(newUrl) =>
          setProfile((prev) => ({
            ...prev,
            avatar: newUrl,
          }))
        }
      />
    </div>
  );
}
