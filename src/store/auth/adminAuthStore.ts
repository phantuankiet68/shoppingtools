import { create } from "zustand";

export type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN";
  status?: "ACTIVE" | "SUSPENDED";
} | null;

type AdminAuthState = {
  isAuthenticated: boolean;
  user: AdminUser;

  setAuthenticated: (v: boolean) => void;
  setUser: (u: AdminUser) => void;

  reset: () => void;
};

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  setAuthenticated: (v) => set({ isAuthenticated: v }),

  setUser: (u) =>
    set({
      user: u,
      isAuthenticated: !!u,
    }),

  reset: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
}));
