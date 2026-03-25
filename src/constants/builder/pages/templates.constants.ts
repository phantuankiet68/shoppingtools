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

  tpl("tpl-widget", "widget", [
    "SocialWidgetOne",
    "SocialWidgetTwo",
    "SocialWidgetThree",
    "SocialWidgetFour",
    "SocialWidgetFive",
    "SocialWidgetSix",
    "SocialWidgetSeven",
    "SocialWidgetEight",
    "SocialWidgetNine",
    "SocialWidgetTen",
  ]),

  tpl("tpl-header", "Header", [
    "HeaderAnnouncement",
    "HeaderCentered",
    "HeaderClassic",
    "HeaderCompact",
    "HeaderDashboard",
    "HeaderMinimal",
    "HeaderRegion",
    "HeaderSplit",
    "HeaderTicker",
    "HeaderUtility",
  ]),
  tpl("tpl-hero", "Hero", [
    "HeroAnnouncement",
    "HeroCentered",
    "HeroClassic",
    "HeroCompact",
    "HeroDashboard",
    "HeroMinimal",
    "HeroRegion",
    "HeroSplit",
    "HeroTicker",
    "HeroUtility",
  ]),
  tpl("tpl-footer", "Footer", [
    "FooterAnnouncement",
    "FooterCentered",
    "FooterClassic",
    "FooterCompact",
    "FooterDashboard",
    "FooterMinimal",
    "FooterRegion",
    "FooterSplit",
    "FooterTicker",
    "FooterUtility",
    "Accessories1",
    "Footer1",
  ]),
  tpl("tpl-sidebar", "Sidebar", [
    "SidebarAnnouncement",
    "HeroCentered",
    "HeroClassic",
    "HeroCompact",
    "Brand1",
    "Makeup1",
    "Skincare1",
    "BodyCare1",
    "KidsCare1",
    "MenCare1",
    "Accessories1",
  ]),
  tpl("tpl-section", "Section", [
    "SectionAnnouncement",
    "SectionSales",
    "SectionSalesOne",
    "SectionSalesTwo",
    "SectionSalesThree",
    "SectionSalesFour",
    "SectionSalesFive",
    "SectionSalesSix",
    "SectionSalesSeven",
    "SectionSalesEight",
    "SectionSalesNine",
    "SectionSalesTen",
  ]),
  tpl("tpl-product", "Product", ["ProductOne"]),
  tpl("tpl-related-products", "Related Products", ["RelatedProducts"]),
  tpl("tpl-popular-products", "Popular Product", ["PopularProductOne"]),
  tpl("tpl-new-products", "Product New", ["ProductNewOne"]),
  tpl("tpl-hot-products", "Product Hot", ["HotProductOne"]),
  tpl("tpl-detail", "Detail", [
    "DetailAnnouncement",
    "DetailCentered",
    "DetailClassic",
    "DetailCompact",
    "DetailDashboard",
    "DetailMinimal",
    "DetailRegion",
    "DetailSplit",
    "DetailTicker",
    "DetailUtility",
  ]),
] as const;
