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
