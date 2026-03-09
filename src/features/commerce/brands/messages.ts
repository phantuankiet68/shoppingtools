export const BRANDS_MESSAGES = {
  common: {
    successTitle: "Success",
    editModeTitle: "Edit mode",
    invalidFileTitle: "Invalid file",
    loadFailedTitle: "Load failed",
    createFailedTitle: "Create failed",
    updateFailedTitle: "Update failed",
    deleteFailedTitle: "Delete failed",
    publishFailedTitle: "Publish failed",
    missingBrandTitle: "Missing brand",
  },

  validation: {
    selectBrandFirst: "Please select a brand first.",
    invalidImageFile: "Chỉ chấp nhận file hình ảnh.",
  },

  modal: {
    deleteTitle: "Delete brand?",
    deleteDescription: (brandName: string) => `Delete “${brandName}”? This action cannot be undone.`,
    editModeDescription: (brandName: string) => `Editing “${brandName}”.`,
  },

  success: {
    created: (brandName: string) => `Created “${brandName}” successfully.`,
    updated: (brandName: string) => `Updated “${brandName}” successfully.`,
    deleted: (brandName: string) => `Deleted “${brandName}” successfully.`,
    published: (brandName: string) => `Published “${brandName}” successfully.`,
  },

  helper: {
    sitePlaceholder: "Chọn site để tạo brand",
    noDescription: "Chưa có mô tả cho thương hiệu này.",
  },
} as const;
