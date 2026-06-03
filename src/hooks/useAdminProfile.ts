"use client";

import { useCallback, useEffect, useState } from "react";

import { EMPTY_PROFILE } from "@/constants/profile/profile";
import type { Profile } from "@/lib/types/profile";

import { getAdminProfile, patchAdminProfile } from "@/services/profile/getProfile.service";

import { mapProfile, mapProfilePayload } from "@/utils/profile.mapper";

import { useModal } from "@/components/admin/shared/common/modal";

type UseAdminProfileProps = {
  workspaceId?: string;
  userEmail?: string;
};

export function useAdminProfile({ workspaceId, userEmail }: UseAdminProfileProps) {
  const modal = useModal();

  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await getAdminProfile();

      if (!res.ok) {
        modal.error("Load Failed", "Unable to load profile information.");

        return;
      }

      const data = await res.json();

      const p = data?.profile;

      const mappedProfile = mapProfile(p);

      if (!mappedProfile.email && userEmail) {
        mappedProfile.email = userEmail;
      }

      setProfile(mappedProfile);
    } catch (error) {
      console.error(error);

      modal.error("Server Error", "Something went wrong while loading profile.");
    } finally {
      setLoading(false);
    }
  }, [userEmail, modal]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateField = useCallback(<K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);

      const payload = {
        workspaceId,
        ...mapProfilePayload(profile),
      };

      const { res, data } = await patchAdminProfile(payload);

      if (!res.ok) {
        modal.error("Update Failed", data?.error ?? "Unable to update profile.");

        return false;
      }

      modal.success("Profile Updated", "Your profile has been updated successfully.");

      return true;
    } catch (error) {
      console.error(error);

      modal.error("Server Error", "Something went wrong. Please try again later.");

      return false;
    } finally {
      setSaving(false);
    }
  }, [profile, workspaceId, modal]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner" | "cover") => {
      try {
        const file = e.target.files?.[0];

        if (!file) {
          return;
        }

        const fd = new FormData();

        fd.append("file", file);
        fd.append("type", type);

        const res = await fetch("/api/admin/profile/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();

        if (!res.ok) {
          modal.error("Upload Failed", data?.error ?? "Unable to upload image.");

          return;
        }

        updateField(type, data.image);

        modal.success("Upload Success", `${type} image uploaded successfully.`);
      } catch (error) {
        console.error(error);

        modal.error("Upload Error", "Something went wrong while uploading image.");
      }
    },
    [updateField, modal],
  );

  return {
    profile,
    setProfile,

    loading,
    saving,

    updateField,
    handleSave,
    handleUpload,

    reload: loadProfile,
  };
}
