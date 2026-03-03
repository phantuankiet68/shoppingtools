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
  ADMIN_BUILDER: {
    // Pages
    PAGES_LIST: "/api/admin/builder/pages/list",
    PAGE: (id: string) => `/api/admin/builder/pages/${id}`,
    PAGE_DUPLICATE: (id: string) => `/api/admin/builder/pages/${id}/duplicate`,
    PAGE_PUBLISH: "/api/admin/builder/pages/publish",
    PAGE_UNPUBLISH: "/api/admin/builder/pages/unpublish",

    // ✅ SEO
    PAGE_SEO: (id: string) => `/api/admin/builder/pages/${id}/seo`,
  },

  ADMIN_TEMPLATE_FILES: {
    LIST: "/api/admin/template-files/list",
    READ: "/api/admin/template-files/read",
    WRITE: "/api/admin/template-files/write",
    DELETE: "/api/admin/template-files/delete",
  },
} as const;
