export const CATEGORY_MESSAGES = {
  pageTitle: "Categories",
  pageSubtitle: "Tree · Sort order · Parent linking",
  pageHint: "Tip: drag to reorder within parent",

  loadingSite: "Loading site...",
  loadingCategories: "Loading categories...",
  noSiteSelected: "No site selected.",
  noCategories: "No categories.",
  selectCategory: "Select a category",
  selectCategoryDescription: "Click a category to edit.",
  noCategoriesHere: "No categories here",

  searchPlaceholder: "Search categories...",
  siblingSearchPlaceholder: "Search in current level...",
  loadingSitesOption: "Loading sites...",
  selectSiteOption: "Select site",

  syncing: "Syncing",
  refresh: "Refresh",
  reload: "Reload",
  addSibling: "Add sibling",
  addChild: "Add child",
  createCategory: "Create category",
  cancel: "Cancel",
  create: "Create",
  autoSlug: "Auto",

  orderWithinParent: "Order within parent",
  orderWithinParentDesc: "Drag to sort within the same parent",
  dragTip: "Tip: Drag sort is applied in order within parent.",

  showing: "Showing",
  page: "Page",
  of: "of",
  prev: "Prev",
  next: "Next",

  name: "Name",
  slug: "Slug",
  parent: "Parent",
  sortOrder: "Sort order",
  noParent: "(no parent)",

  slugPreviewPrefix: "Slug will be generated:",
  createPlaceholder: "e.g. Accessories",

  successTitle: "Success",
  errorTitle: "Error",
  missingSiteTitle: "Missing site",
  missingSiteDescription: "Please select a site first.",
  createFailedTitle: "Create failed",
  deleteFailedTitle: "Delete failed",
  reorderFailedTitle: "Reorder failed",
  saveFailedTitle: "Save failed",

  createSuccess: (name: string) => `Created “${name}”.`,
  deleteSuccess: (name: string) => `Deleted “${name}” successfully.`,
  reorderSuccess: "Reordered successfully.",

  deleteConfirmTitle: "Delete category?",
  deleteConfirmDescription: (name: string) => `Delete “${name}”? This action cannot be undone.`,

  dbHint: "Recommended DB indexes: parentId, sortOrder for faster tree loading.",

  productsCount: (count: number) => `${count} products`,
  slugPath: (slug: string) => `/${slug}`,
  sortOrderText: (value: number) => `sortOrder ${value}`,

  functionKeys: {
    delete: "Delete selected category",
    createChild: "Create child category",
    refresh: "Refresh category tree",
    focusSearch: "Focus search input",
    saveOrReload: "Reload current data",
  },
} as const;
