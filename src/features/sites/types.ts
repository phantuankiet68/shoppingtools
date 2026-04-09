// features/builder/sites/types.ts

export type LocaleDefault = "en";

export type SiteRow = {
  id: string;
  domain: string;
  name: string;
  localeDefault: LocaleDefault;
};

export type SitesListResponse = {
  items: SiteRow[];
};

export type SelectedSiteStorageKey = "ui.selectedSiteId";
export const SELECTED_SITE_STORAGE_KEY: SelectedSiteStorageKey = "ui.selectedSiteId";
