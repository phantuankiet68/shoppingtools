export const API_ENDPOINTS = {
  ADMIN_USER: {
    CHANGE_PASSWORD: "/api/admin/user/change-password",
  },
  ADMIN: {
    PROFILE: "/api/admin/profile",
    GET_CLIENT_IP: "/api/admin/me/get-client-ip",
  },
} as const;

export const API_ROUTES = {
  ADMIN_LOGIN: "/api/admin/auth/login",
  ADMIN_ME: "/api/admin/auth/me",
  ADMIN_LOGOUT: "/api/admin/auth/logout",
  ADMIN_BUILDER_SITES: "/api/admin/builder/sites",
  ADMIN_BUILDER_SITE: (id: string) => `/api/admin/builder/sites/${id}`,
  ADMIN_BUILDER_MENUS: (id: string) => `/api/admin/builder/menus/${id}`,
  ADMIN_BUILDER_PAGE_SYNC: "/api/admin/builder/pages/sync-from-menu",
  ADMIN_BUILDER_MENUS_SAVE_TREE: "/api/admin/builder/menus/save-tree",
} as const;
