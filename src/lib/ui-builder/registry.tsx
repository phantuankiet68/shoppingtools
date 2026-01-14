// lib/ui-builder/registry.ts
import type { RegItem } from "@/lib/ui-builder/types";

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

// ===== Blocks tách rời =====
import { HEADER_SHOP_FLEX } from "@/components/admin/templates/header/HeaderFlex";
import { HEADER_PRO_LIGHT } from "@/components/admin/templates/header/HeaderProLight";
import { HEADER_ACCOUNT_NOVA } from "@/components/admin/templates/header/HeaderAccountNova";
import { HEADER_EDU_BIZ } from "@/components/admin/templates/header/HeaderEduBiz";
import { HEADER_LUXE_GEMS } from "@/components/admin/templates/header/HeaderLuxeGems";
import { HEADER_AURORA } from "@/components/admin/templates/header/HeaderAurora";
import { HEADER_SKYLINE_DUSK } from "@/components/admin/templates/header/HeaderSkylineDusk";
import { HEADER_PULSE_DAILY } from "@/components/admin/templates/header/HeaderPulseDaily";
import { HEADER_MOTORTECH } from "@/components/admin/templates/header/HeaderMotorTech";
import { HEADER_SKYSTACK } from "@/components/admin/templates/header/HeaderSkyStack";
import { HEADER_PORTFOLIO_FLUX } from "@/components/admin/templates/header/HeaderPortfolioFlux";
import { HEADER_BOOK_VERSE } from "@/components/admin/templates/header/HeaderBookVerse";
import { HEADER_TRUST_CREST } from "@/components/admin/templates/header/HeaderTrustCrest";
import { HEADER_VOYAGE_WAVE } from "@/components/admin/templates/header/HeaderVoyageWave";
import { HEADER_FARMIFY } from "@/components/admin/templates/header/HeaderFarmify";

import { BANNER_PRO } from "@/components/admin/templates/banner/BannerPro";
import { TRUST_BADGES } from "@/components/admin/templates/home/TrustBadges";
import { QUICK_CATS } from "@/components/admin/templates/home/QuickCategories";
import { PRODUCT_SECTION } from "@/components/admin/templates/home/ProductSection";
import { BLOG_PREVIEW } from "@/components/admin/templates/home/BlogPreview";
import { REVIEWS_PRO } from "@/components/admin/templates/home/Reviews";
import { NEWSLETTER_CTA } from "@/components/admin/templates/home/NewsletterCTA";
import { FOOTER_PRO } from "@/components/admin/templates/home/FooterPro";

export const BASIC: RegItem[] = [];

export const REGISTRY_HOME: RegItem[] = [
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

  HEADER_SHOP_FLEX,
  HEADER_PRO_LIGHT,
  HEADER_ACCOUNT_NOVA,
  HEADER_EDU_BIZ,
  HEADER_LUXE_GEMS,
  HEADER_AURORA,
  HEADER_SKYLINE_DUSK,
  HEADER_PULSE_DAILY,
  HEADER_MOTORTECH,
  HEADER_SKYSTACK,
  HEADER_PORTFOLIO_FLUX,
  HEADER_BOOK_VERSE,
  HEADER_TRUST_CREST,
  HEADER_VOYAGE_WAVE,
  HEADER_FARMIFY,

  TRUST_BADGES,
  QUICK_CATS,
  PRODUCT_SECTION,
  BLOG_PREVIEW,
  REVIEWS_PRO,
  NEWSLETTER_CTA,
  FOOTER_PRO,
];

export const REGISTRY: RegItem[] = [...BASIC, HEADER_SHOP_FLEX, BANNER_PRO, ...REGISTRY_HOME];

export default REGISTRY;
