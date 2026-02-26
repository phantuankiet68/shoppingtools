// services/admin/auth.service.ts
import { API_ROUTES } from "@/constants/api";

export type AdminUser = { name: string; role: string };

export const adminAuthService = {
  async me(): Promise<{ user: AdminUser | null } | null> {
    const r = await fetch(API_ROUTES.ADMIN_ME, { credentials: "include" });
    if (!r.ok) return null;
    return r.json();
  },

  async logout(): Promise<void> {
    await fetch(API_ROUTES.ADMIN_LOGOUT, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  },
};
