// lib/ui-builder/registry.ts
import type { RegItem } from "@/lib/ui-builder/types";

// ===== Web page greens  =====
import { SHOP_TOPBAR_GREEN_ONE } from "@/components/admin/templates/shopGreen/topbar/topbar1";
import { SHOP_HEADER_GREEN_ONE } from "@/components/admin/templates/shopGreen/header/header1";
import { SHOP_HERO_GREEN_ONE } from "@/components/admin/templates/shopGreen/hero/hero1";
import { SHOP_BEST_SELLER_GREEN_ONE } from "@/components/admin/templates/shopGreen/bestSeller/bestSeller1";
import { SHOP_BRAND_GREEN_ONE } from "@/components/admin/templates/shopGreen/brand/brand1";
import { SHOP_MAKEUP_GREEN_ONE } from "@/components/admin/templates/shopGreen/makeup/makeup1";
import { SHOP_SKINCARE_GREEN_ONE } from "@/components/admin/templates/shopGreen/skincare/skincare1";
import { SHOP_BODY_CARE_GREEN_ONE } from "@/components/admin/templates/shopGreen/bodyCare/bodyCare1";
import { SHOP_KIDS_CARE_GREEN_ONE } from "@/components/admin/templates/shopGreen/kidsCare/kidsCare1";
import { SHOP_MEN_CARE_GREEN_ONE } from "@/components/admin/templates/shopGreen/menCare/menCare1";
import { SHOP_ACCESSORIES_GREEN_ONE } from "@/components/admin/templates/shopGreen/accessories/accessories1";
import { SHOP_FOOTER_GREEN_ONE } from "@/components/admin/templates/shopGreen/footer/footer1";

// ===== Blocks Topbar tách rời  =====
import { TOPBAR_PRO } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarMain";
import { AURORA_TOPBAR_PINK } from "@/components/admin/templates/ShopTemplate/Ui/topbar/AuroraTopbarPink";
import { TOPBAR_ORANGE_2025 } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarOrange2025";
import { TOPBAR_PRO_LANG_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarProLang";
import { AURORA_TOPBAR_GREEN_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/AuroraTopbarGreen";
import { TOPBAR_GREEN_YELLOW_GRADIENT_2025_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarGreenYellowGradient2025";
import { TOPBAR_BLUE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarBlue";
import { TOPBAR_BLUE_DARK_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarBlueDark";
import { TOPBAR_BRIGHT_AURORA_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarBrightAurora";
import { TOPBAR_BLUE_AURORA_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarBlueAurora";
import { TOPBAR_AURORA_2026_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarAurora2026";
import { TOPBAR_MULTI_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarMulti";

import { HEADER_PRO_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderPro";
import { HEADER_AURORA_PINK_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderAuroraPink";
import { HEADER_AURORA_ORANGE_NEO_2025_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderAuroraOrangeNeo2025";
import { HEADER_ORANGEWEAR_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderOrangeWear";
import { HEADER_GREEN_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderGreen";
import { HEADER_AURORA_FASHION_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderAuroraFashion";
import { HEADER_BLUE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderBlue";
import { HEADER_AURORA_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderAurora";
import { HEADER_FASHION_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderFashion";
import { HEADER_WEAR_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderWear";
import { HEADER_WHITE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderWhite";
import { HEADER_SIMPLE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderSimple";
import { HEADER_2025_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/header/Header2025";

import { FOOTER_AURORA_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterAurora";
import { FOOTER_BLUE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterBlue";
import { FOOTER_BRIGHT_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterBright";
import { FOOTER_DARK_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterDark";
import { FOOTER_DARK_ONE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterDarkOne";
import { FOOTER_FASHION_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterFashion";
import { FOOTER_GREEN_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterGreen";
import { FOOTER_ONE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterOne";
import { FOOTER_ORANGE_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterOrange";
import { FOOTER_PINK_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterPink";
import { FOOTER_PRO_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterPro";
import { FOOTER_TOP_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterTop";
import { FOOTER_WEAR_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterWear";
import { FOOTER_YELLOW_REGITEM } from "@/components/admin/templates/ShopTemplate/Ui/footer/FooterYellow";

export const BASIC: RegItem[] = [];

export const REGISTRY_HOME: RegItem[] = [
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
  // ===== end  =====
  TOPBAR_PRO,
  AURORA_TOPBAR_PINK,
  TOPBAR_ORANGE_2025,
  TOPBAR_PRO_LANG_REGITEM,
  AURORA_TOPBAR_GREEN_REGITEM,
  TOPBAR_GREEN_YELLOW_GRADIENT_2025_REGITEM,
  TOPBAR_BLUE_REGITEM,
  TOPBAR_BLUE_DARK_REGITEM,
  TOPBAR_BRIGHT_AURORA_REGITEM,
  TOPBAR_BLUE_AURORA_REGITEM,
  TOPBAR_AURORA_2026_REGITEM,
  TOPBAR_MULTI_REGITEM,

  HEADER_AURORA_PINK_REGITEM,
  HEADER_AURORA_ORANGE_NEO_2025_REGITEM,
  HEADER_ORANGEWEAR_REGITEM,
  HEADER_GREEN_REGITEM,
  HEADER_AURORA_FASHION_REGITEM,
  HEADER_BLUE_REGITEM,
  HEADER_AURORA_REGITEM,
  HEADER_FASHION_REGITEM,
  HEADER_WEAR_REGITEM,
  HEADER_WHITE_REGITEM,
  HEADER_SIMPLE_REGITEM,
  HEADER_2025_REGITEM,
  HEADER_PRO_REGITEM,

  FOOTER_AURORA_REGITEM,
  FOOTER_BLUE_REGITEM,
  FOOTER_BRIGHT_REGITEM,
  FOOTER_DARK_REGITEM,
  FOOTER_DARK_ONE_REGITEM,
  FOOTER_FASHION_REGITEM,
  FOOTER_GREEN_REGITEM,
  FOOTER_ONE_REGITEM,
  FOOTER_ORANGE_REGITEM,
  FOOTER_PINK_REGITEM,
  FOOTER_PRO_REGITEM,
  FOOTER_TOP_REGITEM,
  FOOTER_WEAR_REGITEM,
  FOOTER_YELLOW_REGITEM,
];

export const REGISTRY: RegItem[] = [...BASIC, ...REGISTRY_HOME];

export default REGISTRY;
