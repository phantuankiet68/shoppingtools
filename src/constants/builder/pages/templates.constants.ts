import { REGISTRY } from "@/lib/ui-builder/registry";

export type RegistryKind = (typeof REGISTRY)[number]["kind"];

export type BuilderTemplate = {
  id: string;
  label: string;
  children: RegistryKind[];
};

function tpl(id: string, label: string, children: RegistryKind[]): BuilderTemplate {
  return { id, label, children };
}

export const TEMPLATES: readonly BuilderTemplate[] = [
  tpl("tpl-topbar", "Topbar", [
    "TopbarAnnouncement",
    "TopbarCentered",
    "TopbarClassic",
    "TopbarCompact",
    "TopbarDashboard",
    "TopbarMinimal",
    "TopbarRegion",
    "TopbarSplit",
    "TopbarTicker",
    "TopbarUtility",
  ]),
    tpl("tpl-header", "Header", [
    "HeaderAnnouncement",
    "HeaderCentered",
    "Classic",
    "Compact",
    "Dashboard",
    "Minimal",
    "Region",
    "Split",
    "Ticker",
    "Utility",
  ]),
  tpl("tpl-shop-green-v2", "ShopGreen V2", [
    "Topbar1",
    "Header1",
    "Hero1",
    "BestSeller1",
    "Brand1",
    "Makeup1",
    "Skincare1",
    "BodyCare1",
    "KidsCare1",
    "MenCare1",
    "Accessories1",
    "Footer1",
  ]),
] as const;
