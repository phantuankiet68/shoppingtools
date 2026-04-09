export const MENU_MESSAGES = {
  notice: {
    seoSavedTitle: "SEO Saved & Synchronized",
    seoSavedMsg: "Menus and pages (title/slug/path) have been synchronized (according to the selected site).",

    menuSavedTitle: "Menu saved",
    menuSavedMsg: "No changes have been made to SEO synchronization. The data has been reloaded.",

    saveFailedTitle: "Save failed",
    loadDbTitle: "Loaded from DB",
    loadDbMsg: "The menu has been loaded based on site and set.",

    jsonCopiedTitle: "JSON has been copied.",
    jsonCopiedMsg: "The current menu content has been copied to the clipboard.",

    copyFailedTitle: "Copy failed",
    copyFailedMsg: "The browser does not allow automatic copying.",

    importSuccessTitle: "Import successful",
    importSuccessMsg: "The menu has been updated according to the JSON that was just imported.",

    importErrorTitle: "Import error",
  },

  prompt: {
    pasteJson: "Paste JSON for the current set.",
  },

  error: {
    invalidJsonArray: "Invalid JSON: It must be an array",
    unknown: "Unknown error",
  },

  aria: {
    chooseSite: "Chọn Site",
    siteKind: "Loại website",
    selectMenuSet: "Select menu set",
  },

  btn: {
    loadFromDb: "Load from DB",
    loading: "Loading...",
    refreshing: "Refreshing...",
    saveDb: "Save DB",
    saving: "Saving...",
    copyJson: "Copy JSON",
    importJson: "Import JSON",
  },

  tooltip: {
    loadFromDb: "Load menu from database based on site and set.",
    saveDb: "Save the database; then synchronize the page according to the menu (current site).",
  },

  misc: {
    noSites: "No sites",
    exportImportPlaceholder: "Export/Import JSON for the current set",
  },
  menuStructure: {
    headerTitle: "Menu structure",

    searchPlaceholder: "Find the title or link…",
    searchAria: "Find it in the menu.",

    clearTitle: "Delete keywords",
    clearBtn: "Clear",

    depthMain: "Main",
    depthSub: "Sub",

    noTitle: "(No title)",

    deleteItemTitle: "Delete this item",

    submenuLabelPrefix: "Submenu with",

    emptyChildrenHelp: "Drag an item here to create a Submenu (Level 2)",

    emptyRootNoResults: "No results found",
    emptyRootDropHere: "Drop blocks here (Level 1)",

    confirmDeleteTitle: "Delete menu",
    confirmDeleting: "Deleting...",
    confirmDeleteMsg: "Are you sure you want to delete this item? This action will be saved.",

    deleteFailed: "Delete failed",
    untitled: "Untitled",
    defaultSlug: "untitled",
  },
  allowedBlocks: {
    addEmptyItem: "Add empty item",

    showingPrefix: "Showing:",
    tabDashboard: "Dashboard",
    tabHome: "Home",

    baseBlockTooltip: "Kéo thả hoặc nhấn để thêm vào Menu",

    suggestionsAria: "Suggestions for expanding the menu",
    noMoreSuggestions: "No more suggestions — you've got all the important points already. 🎉",

    suggestChipTooltip: "Click to add, or drag and drop into structure",
  },
} as const;
