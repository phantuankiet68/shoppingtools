// lib/ui-builder/registry.ts
import type { RegItem } from "@/lib/ui-builder/types";

// ===== Web page Topbar  =====
import { SHOP_TOPBAR_ANNOUNCEMENT } from "@/components/admin/shared/templates/sections/Topbar/TopbarAnnouncement";
import { SHOP_TOPBAR_CENTERED } from "@/components/admin/shared/templates/sections/Topbar/TopbarCentered";
import { SHOP_TOPBAR_CLASSIC } from "@/components/admin/shared/templates/sections/Topbar/TopbarClassic";
import { SHOP_TOPBAR_COMPACT } from "@/components/admin/shared/templates/sections/Topbar/TopbarCompact";
import { SHOP_TOPBAR_DASHBOARD } from "@/components/admin/shared/templates/sections/Topbar/TopbarDashboard";
import { SHOP_TOPBAR_MINIMAL } from "@/components/admin/shared/templates/sections/Topbar/TopbarMinimal";
import { SHOP_TOPBAR_REGION } from "@/components/admin/shared/templates/sections/Topbar/TopbarRegion";
import { SHOP_TOPBAR_SPLIT } from "@/components/admin/shared/templates/sections/Topbar/TopbarSplit";
import { SHOP_TOPBAR_TICKER } from "@/components/admin/shared/templates/sections/Topbar/TopbarTicker";
import { SHOP_TOPBAR_UTILITY } from "@/components/admin/shared/templates/sections/Topbar/TopbarUtility";

// ===== Web page Header  =====
import { SHOP_HEADER_ANNOUNCEMENT } from "@/components/admin/shared/templates/sections/Header/HeaderAnnouncement";
import { SHOP_HEADER_CENTERED } from "@/components/admin/shared/templates/sections/Header/HeaderCentered";
import { SHOP_HEADER_CLASSIC } from "@/components/admin/shared/templates/sections/Header/HeaderClassic";
import { SHOP_HEADER_COMPACT } from "@/components/admin/shared/templates/sections/Header/HeaderCompact";
import { SHOP_HEADER_DASHBOARD } from "@/components/admin/shared/templates/sections/Header/HeaderDashboard";
import { SHOP_HEADER_MINIMAL } from "@/components/admin/shared/templates/sections/Header/HeaderMinimal";
import { SHOP_HEADER_REGION } from "@/components/admin/shared/templates/sections/Header/HeaderRegion";
import { SHOP_HEADER_SPLIT } from "@/components/admin/shared/templates/sections/Header/HeaderSplit";
import { SHOP_HEADER_TICKER } from "@/components/admin/shared/templates/sections/Header/HeaderTicker";
import { SHOP_HEADER_UTILITY } from "@/components/admin/shared/templates/sections/Header/HeaderUtility";

// ===== Web page Hero  =====
import { SHOP_HERO_ANNOUNCEMENT } from "@/components/admin/shared/templates/sections/Hero/HeroAnnouncement";
import { SHOP_HERO_CENTERED } from "@/components/admin/shared/templates/sections/Hero/HeroCentered";
import { SHOP_HERO_CLASSIC } from "@/components/admin/shared/templates/sections/Hero/HeroClassic";
import { SHOP_HERO_COMPACT } from "@/components/admin/shared/templates/sections/Hero/HeroCompact";
import { SHOP_HERO_DASHBOARD } from "@/components/admin/shared/templates/sections/Hero/HeroDashboard";
import { SHOP_HERO_MINIMAL } from "@/components/admin/shared/templates/sections/Hero/HeroMinimal";
import { SHOP_HERO_REGION } from "@/components/admin/shared/templates/sections/Hero/HeroRegion";
import { SHOP_HERO_SPLIT } from "@/components/admin/shared/templates/sections/Hero/HeroSplit";
import { SHOP_HERO_TICKER } from "@/components/admin/shared/templates/sections/Hero/HeroTicker";
import { SHOP_HERO_UTILITY } from "@/components/admin/shared/templates/sections/Hero/HeroUtility";

// ===== Web page Footer  =====
import { SHOP_FOOTER_ANNOUNCEMENT } from "@/components/admin/shared/templates/sections/Footer/FooterAnnouncement";
import { SHOP_FOOTER_CENTERED } from "@/components/admin/shared/templates/sections/Footer/FooterCentered";
import { SHOP_FOOTER_CLASSIC } from "@/components/admin/shared/templates/sections/Footer/FooterClassic";
import { SHOP_FOOTER_COMPACT } from "@/components/admin/shared/templates/sections/Footer/FooterCompact";
import { SHOP_FOOTER_DASHBOARD } from "@/components/admin/shared/templates/sections/Footer/FooterDashboard";
import { SHOP_FOOTER_MINIMAL } from "@/components/admin/shared/templates/sections/Footer/FooterMinimal";
import { SHOP_FOOTER_REGION } from "@/components/admin/shared/templates/sections/Footer/FooterRegion";
import { SHOP_FOOTER_SPLIT } from "@/components/admin/shared/templates/sections/Footer/FooterSplit";
import { SHOP_FOOTER_TICKER } from "@/components/admin/shared/templates/sections/Footer/FooterTicker";
import { SHOP_FOOTER_UTILITY } from "@/components/admin/shared/templates/sections/Footer/FooterUtility";

// ===== Web page Sidebar  =====
import { SHOP_SIDEBAR_ANNOUNCEMENT } from "@/components/admin/shared/templates/sections/Sidebar/SidebarAnnouncement";

// ===== Web page Section  =====
import { SHOP_SECTION_ANNOUNCEMENT } from "@/components/admin/shared/templates/sections/Section/SectionAnnouncement";
import { SHOP_SECTION_SALES } from "@/components/admin/shared/templates/sections/Section/SectionSales";
import { SHOP_SECTION_SALES_ONE } from "@/components/admin/shared/templates/sections/Section/SectionSalesOne";
import { SHOP_SECTION_SALES_TWO } from "@/components/admin/shared/templates/sections/Section/SectionSalesTwo";
import { SHOP_SECTION_SALES_THREE } from "@/components/admin/shared/templates/sections/Section/SectionSalesThree";
import { SHOP_SECTION_SALES_FOUR } from "@/components/admin/shared/templates/sections/Section/SectionSalesFour";
import { SHOP_SECTION_SALES_FIVE } from "@/components/admin/shared/templates/sections/Section/SectionSalesFive";
import { SHOP_SECTION_SALES_SIX } from "@/components/admin/shared/templates/sections/Section/SectionSalesSix";
import { SHOP_SECTION_SALES_SEVEN } from "@/components/admin/shared/templates/sections/Section/SectionSalesSeven";
import { SHOP_SECTION_SALES_EIGHT } from "@/components/admin/shared/templates/sections/Section/SectionSalesEight";
import { SHOP_SECTION_SALES_NINE } from "@/components/admin/shared/templates/sections/Section/SectionSalesNine";
import { SHOP_SECTION_SALES_TEN } from "@/components/admin/shared/templates/sections/Section/SectionSalesTen";
// ===== Web page Detail  =====
import { SHOP_DETAIL_ANNOUNCEMENT } from "@/components/admin/shared/templates/sections/Detail/DetailAnnouncement";
import { SHOP_DETAIL_CENTERED } from "@/components/admin/shared/templates/sections/Detail/DetailCentered";
import { SHOP_DETAIL_CLASSIC } from "@/components/admin/shared/templates/sections/Detail/DetailClassic";
// import { SHOP_DETAIL_COMPACT } from "@/components/admin/shared/templates/sections/Detail/DetailCompact";
// import { SHOP_DETAIL_DASHBOARD } from "@/components/admin/shared/templates/sections/Detail/DetailDashboard";
// import { SHOP_DETAIL_MINIMAL } from "@/components/admin/shared/templates/sections/Detail/DetailMinimal";
// import { SHOP_DETAIL_REGION } from "@/components/admin/shared/templates/sections/Detail/DetailRegion";
// import { SHOP_DETAIL_SPLIT } from "@/components/admin/shared/templates/sections/Detail/DetailSplit";
// import { SHOP_DETAIL_TICKER } from "@/components/admin/shared/templates/sections/Detail/DetailTicker";
// import { SHOP_DETAIL_UTILITY } from "@/components/admin/shared/templates/sections/Detail/DetailUtility";
// ===== Web page greens  =====
import { SHOP_TOPBAR_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/topbar/topbar1";
import { SHOP_HEADER_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/header/header1";
import { SHOP_HERO_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/hero/hero1";
import { SHOP_BEST_SELLER_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/bestSeller/bestSeller1";
import { SHOP_BRAND_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/brand/brand1";
import { SHOP_MAKEUP_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/makeup/makeup1";
import { SHOP_SKINCARE_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/skincare/skincare1";
import { SHOP_BODY_CARE_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/bodyCare/bodyCare1";
import { SHOP_KIDS_CARE_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/kidsCare/kidsCare1";
import { SHOP_MEN_CARE_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/menCare/menCare1";
import { SHOP_ACCESSORIES_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/accessories/accessories1";
import { SHOP_FOOTER_GREEN_ONE } from "@/components/admin/shared/templates/shopGreen/footer/footer1";

export const BASIC: RegItem[] = [];

export const REGISTRY_HOME: RegItem[] = [
  // ===== Web page Topbar  =====
  SHOP_TOPBAR_ANNOUNCEMENT,
  SHOP_TOPBAR_CENTERED,
  SHOP_TOPBAR_CLASSIC,
  SHOP_TOPBAR_COMPACT,
  SHOP_TOPBAR_DASHBOARD,
  SHOP_TOPBAR_MINIMAL,
  SHOP_TOPBAR_REGION,
  SHOP_TOPBAR_SPLIT,
  SHOP_TOPBAR_TICKER,
  SHOP_TOPBAR_UTILITY,
  // ===== Web page Header  =====
  SHOP_HEADER_ANNOUNCEMENT,
  SHOP_HEADER_CENTERED,
  SHOP_HEADER_CLASSIC,
  SHOP_HEADER_COMPACT,
  SHOP_HEADER_DASHBOARD,
  SHOP_HEADER_MINIMAL,
  SHOP_HEADER_REGION,
  SHOP_HEADER_SPLIT,
  SHOP_HEADER_TICKER,
  SHOP_HEADER_UTILITY,
  // ===== Web page Hero  =====
  SHOP_HERO_ANNOUNCEMENT,
  SHOP_HERO_CENTERED,
  SHOP_HERO_CLASSIC,
  SHOP_HERO_COMPACT,
  SHOP_HERO_DASHBOARD,
  SHOP_HERO_MINIMAL,
  SHOP_HERO_REGION,
  SHOP_HERO_SPLIT,
  SHOP_HERO_TICKER,
  SHOP_HERO_UTILITY,

  // ===== Web page Footer  =====
  SHOP_FOOTER_ANNOUNCEMENT,
  SHOP_FOOTER_CENTERED,
  SHOP_FOOTER_CLASSIC,
  SHOP_FOOTER_COMPACT,
  SHOP_FOOTER_DASHBOARD,
  SHOP_FOOTER_MINIMAL,
  SHOP_FOOTER_REGION,
  SHOP_FOOTER_SPLIT,
  SHOP_FOOTER_TICKER,
  SHOP_FOOTER_UTILITY,

  // ===== Web page Sidebar  =====
  SHOP_SIDEBAR_ANNOUNCEMENT,

  // ===== Web page Section  =====
  SHOP_SECTION_ANNOUNCEMENT,
  SHOP_SECTION_SALES,
  SHOP_SECTION_SALES_ONE,
  SHOP_SECTION_SALES_TWO,
  SHOP_SECTION_SALES_THREE,
  SHOP_SECTION_SALES_FOUR,
  SHOP_SECTION_SALES_FIVE,
  SHOP_SECTION_SALES_SIX,
  SHOP_SECTION_SALES_SEVEN,
  SHOP_SECTION_SALES_EIGHT,
  SHOP_SECTION_SALES_NINE,
  SHOP_SECTION_SALES_TEN,

  // ===== Web page Detail  =====
  SHOP_DETAIL_ANNOUNCEMENT,
  SHOP_DETAIL_CENTERED,
  SHOP_DETAIL_CLASSIC,
  // SHOP_DETAIL_COMPACT,
  // SHOP_DETAIL_DASHBOARD,
  // SHOP_DETAIL_MINIMAL,
  // SHOP_DETAIL_REGION,
  // SHOP_DETAIL_SPLIT,
  // SHOP_DETAIL_TICKER,
  // SHOP_DETAIL_UTILITY,
  // ===== Web page greens  =====
  SHOP_TOPBAR_GREEN_ONE,
  SHOP_HEADER_GREEN_ONE,
  SHOP_HERO_GREEN_ONE,
  SHOP_BEST_SELLER_GREEN_ONE,
  SHOP_BRAND_GREEN_ONE,
  SHOP_MAKEUP_GREEN_ONE,
  SHOP_SKINCARE_GREEN_ONE,
  SHOP_BODY_CARE_GREEN_ONE,
  SHOP_KIDS_CARE_GREEN_ONE,
  SHOP_MEN_CARE_GREEN_ONE,
  SHOP_ACCESSORIES_GREEN_ONE,
  SHOP_FOOTER_GREEN_ONE,
];

export const REGISTRY: RegItem[] = [...BASIC, ...REGISTRY_HOME];

export default REGISTRY;
