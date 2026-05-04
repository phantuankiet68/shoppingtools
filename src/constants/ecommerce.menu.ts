import type {
  InternalPage,
  SiteKind,
  TemplateAllowed,
} from "@/components/admin/menus/state/useMenuStore";

/* =========================================================
 * INTERNAL PAGES
 * ======================================================= */
export const ECOMMERCE_INTERNAL_PAGES: InternalPage[] = [
  {
    id: "home",
    paths: { en: "/", vi: "/", ja: "/" },
    labelKey: "pages.home",
    icon: "bi-house",
  },
  {
    id: "shop",
    paths: { en: "/shop", vi: "/cua-hang", ja: "/ショップ" },
    labelKey: "pages.shop",
    icon: "bi-shop",
  },
  {
    id: "products",
    paths: { en: "/products", vi: "/san-pham", ja: "/商品" },
    labelKey: "pages.products",
    icon: "bi-box-seam",
  },
  {
    id: "categories",
    paths: { en: "/categories", vi: "/danh-muc", ja: "/カテゴリー" },
    labelKey: "pages.categories",
    icon: "bi-grid",
  },
  {
    id: "collections",
    paths: { en: "/collections", vi: "/bo-suu-tap", ja: "/コレクション" },
    labelKey: "pages.collections",
    icon: "bi-collection",
  },
  {
    id: "brands",
    paths: { en: "/brands", vi: "/thuong-hieu", ja: "/ブランド" },
    labelKey: "pages.brands",
    icon: "bi-award",
  },
  {
    id: "featured",
    paths: { en: "/featured", vi: "/noi-bat", ja: "/注目" },
    labelKey: "pages.featured",
    icon: "bi-star",
  },
  {
    id: "trending",
    paths: { en: "/trending", vi: "/xu-huong", ja: "/トレンド" },
    labelKey: "pages.trending",
    icon: "bi-graph-up",
  },
  {
    id: "newArrivals",
    paths: { en: "/new-arrivals", vi: "/hang-moi-ve", ja: "/新着商品" },
    labelKey: "pages.newArrivals",
    icon: "bi-lightning",
  },
  {
    id: "bestSellers",
    paths: { en: "/best-sellers", vi: "/ban-chay", ja: "/売れ筋" },
    labelKey: "pages.bestSellers",
    icon: "bi-trophy",
  },
  {
    id: "flashSale",
    paths: { en: "/flash-sale", vi: "/flash-sale", ja: "/タイムセール" },
    labelKey: "pages.flashSale",
    icon: "bi-lightning-charge",
  },
  {
    id: "deals",
    paths: { en: "/deals", vi: "/uu-dai", ja: "/お得情報" },
    labelKey: "pages.deals",
    icon: "bi-tags",
  },
  {
    id: "offers",
    paths: { en: "/offers", vi: "/khuyen-mai", ja: "/オファー" },
    labelKey: "pages.offers",
    icon: "bi-percent",
  },
  {
    id: "coupons",
    paths: { en: "/coupons", vi: "/ma-giam-gia", ja: "/クーポン" },
    labelKey: "pages.coupons",
    icon: "bi-ticket",
  },
  {
    id: "giftCards",
    paths: { en: "/gift-cards", vi: "/the-qua-tang", ja: "/ギフトカード" },
    labelKey: "pages.giftCards",
    icon: "bi-gift",
  },
  {
    id: "wishlist",
    paths: { en: "/wishlist", vi: "/yeu-thich", ja: "/お気に入り" },
    labelKey: "pages.wishlist",
    icon: "bi-heart",
  },
  {
    id: "cart",
    paths: { en: "/cart", vi: "/gio-hang", ja: "/カート" },
    labelKey: "pages.cart",
    icon: "bi-cart",
  },
  {
    id: "checkout",
    paths: { en: "/checkout", vi: "/thanh-toan", ja: "/チェックアウト" },
    labelKey: "pages.checkout",
    icon: "bi-credit-card",
  },
  {
    id: "account",
    paths: { en: "/account", vi: "/tai-khoan", ja: "/マイアカウント" },
    labelKey: "pages.account",
    icon: "bi-person",
  },
  {
    id: "orders",
    paths: { en: "/orders", vi: "/don-hang", ja: "/注文一覧" },
    labelKey: "pages.orders",
    icon: "bi-receipt",
  },
  {
    id: "orderTracking",
    paths: { en: "/order-tracking", vi: "/theo-doi-don-hang", ja: "/注文追跡" },
    labelKey: "pages.orderTracking",
    icon: "bi-truck",
  },
  {
    id: "addresses",
    paths: { en: "/addresses", vi: "/dia-chi", ja: "/住所" },
    labelKey: "pages.addresses",
    icon: "bi-geo-alt",
  },
  {
    id: "about",
    paths: { en: "/about", vi: "/gioi-thieu", ja: "/会社概要" },
    labelKey: "pages.about",
    icon: "bi-info-circle",
  },
  {
    id: "contact",
    paths: { en: "/contact", vi: "/lien-he", ja: "/お問い合わせ" },
    labelKey: "pages.contact",
    icon: "bi-envelope",
  },
  {
    id: "faq",
    paths: { en: "/faq", vi: "/cau-hoi-thuong-gap", ja: "/よくある質問" },
    labelKey: "pages.faq",
    icon: "bi-question-circle",
  },
  {
    id: "blog",
    paths: { en: "/blog", vi: "/blog", ja: "/ブログ" },
    labelKey: "pages.blog",
    icon: "bi-journal-text",
  },
  {
    id: "shippingInfo",
    paths: { en: "/shipping-info", vi: "/thong-tin-giao-hang", ja: "/配送情報" },
    labelKey: "pages.shippingInfo",
    icon: "bi-box",
  },
  {
    id: "returnPolicy",
    paths: { en: "/return-policy", vi: "/chinh-sach-doi-tra", ja: "/返品ポリシー" },
    labelKey: "pages.returnPolicy",
    icon: "bi-arrow-return-left",
  },
  {
    id: "sizeGuide",
    paths: { en: "/size-guide", vi: "/huong-dan-kich-thuoc", ja: "/サイズガイド" },
    labelKey: "pages.sizeGuide",
    icon: "bi-rulers",
  },
  {
    id: "privacyPolicy",
    paths: { en: "/privacy-policy", vi: "/chinh-sach-bao-mat", ja: "/プライバシーポリシー" },
    labelKey: "pages.privacyPolicy",
    icon: "bi-shield-lock",
  },
  {
    id: "terms",
    paths: { en: "/terms", vi: "/dieu-khoan", ja: "/利用規約" },
    labelKey: "pages.terms",
    icon: "bi-file-earmark-text",
  },

  // Allowed Blocks items
  {
    id: "productDetail",
    paths: { en: "/product-detail", vi: "/chi-tiet-san-pham", ja: "/商品詳細" },
    labelKey: "menus.allowedBlocks.items.productDetail",
    icon: "bi-box",
  },
  {
    id: "productReviews",
    paths: { en: "/product-reviews", vi: "/danh-gia-san-pham", ja: "/商品レビュー" },
    labelKey: "menus.allowedBlocks.items.productReviews",
    icon: "bi-chat-square-text",
  },
  {
    id: "compareProducts",
    paths: { en: "/compare-products", vi: "/so-sanh-san-pham", ja: "/商品比較" },
    labelKey: "menus.allowedBlocks.items.compareProducts",
    icon: "bi-columns-gap",
  },
  {
    id: "recentlyViewed",
    paths: { en: "/recently-viewed", vi: "/da-xem-gan-day", ja: "/最近見た商品" },
    labelKey: "menus.allowedBlocks.items.recentlyViewed",
    icon: "bi-clock-history",
  },
  {
    id: "relatedProducts",
    paths: { en: "/related-products", vi: "/san-pham-lien-quan", ja: "/関連商品" },
    labelKey: "menus.allowedBlocks.items.relatedProducts",
    icon: "bi-diagram-3",
  },
  {
    id: "customerReviews",
    paths: { en: "/customer-reviews", vi: "/danh-gia-khach-hang", ja: "/お客様レビュー" },
    labelKey: "menus.allowedBlocks.items.customerReviews",
    icon: "bi-star",
  },
  {
    id: "testimonials",
    paths: { en: "/testimonials", vi: "/phan-hoi-khach-hang", ja: "/お客様の声" },
    labelKey: "menus.allowedBlocks.items.testimonials",
    icon: "bi-chat-quote",
  },
  {
    id: "warrantyPolicy",
    paths: { en: "/warranty-policy", vi: "/chinh-sach-bao-hanh", ja: "/保証ポリシー" },
    labelKey: "menus.allowedBlocks.items.warrantyPolicy",
    icon: "bi-shield-check",
  },
  {
    id: "returnProcess",
    paths: { en: "/return-process", vi: "/quy-trinh-doi-tra", ja: "/返品手続き" },
    labelKey: "menus.allowedBlocks.items.returnProcess",
    icon: "bi-arrow-repeat",
  },
  {
    id: "paymentMethods",
    paths: { en: "/payment-methods", vi: "/phuong-thuc-thanh-toan", ja: "/支払い方法" },
    labelKey: "menus.allowedBlocks.items.paymentMethods",
    icon: "bi-credit-card-2-front",
  },
  {
    id: "trackMyOrder",
    paths: { en: "/track-my-order", vi: "/kiem-tra-don-hang", ja: "/注文確認" },
    labelKey: "menus.allowedBlocks.items.trackMyOrder",
    icon: "bi-truck",
  },
  {
    id: "orderHistory",
    paths: { en: "/order-history", vi: "/lich-su-don-hang", ja: "/注文履歴" },
    labelKey: "menus.allowedBlocks.items.orderHistory",
    icon: "bi-clock",
  },
  {
    id: "reorder",
    paths: { en: "/reorder", vi: "/dat-lai", ja: "/再注文" },
    labelKey: "menus.allowedBlocks.items.reorder",
    icon: "bi-arrow-counterclockwise",
  },
  {
    id: "news",
    paths: { en: "/news", vi: "/tin-tuc", ja: "/ニュース" },
    labelKey: "menus.allowedBlocks.items.news",
    icon: "bi-newspaper",
  },
  {
    id: "press",
    paths: { en: "/press", vi: "/bao-chi", ja: "/プレス" },
    labelKey: "menus.allowedBlocks.items.press",
    icon: "bi-megaphone",
  },
  {
    id: "promotionsDetail",
    paths: { en: "/promotions-detail", vi: "/chi-tiet-khuyen-mai", ja: "/キャンペーン詳細" },
    labelKey: "menus.allowedBlocks.items.promotionsDetail",
    icon: "bi-tags",
  },
  {
    id: "campaigns",
    paths: { en: "/campaigns", vi: "/chien-dich", ja: "/キャンペーン" },
    labelKey: "menus.allowedBlocks.items.campaigns",
    icon: "bi-bullseye",
  },
  {
    id: "notifications",
    paths: { en: "/notifications", vi: "/thong-bao", ja: "/お知らせ" },
    labelKey: "menus.allowedBlocks.items.notifications",
    icon: "bi-bell",
  },
  {
    id: "subscriptions",
    paths: { en: "/subscriptions", vi: "/dang-ky", ja: "/サブスクリプション" },
    labelKey: "menus.allowedBlocks.items.subscriptions",
    icon: "bi-bookmark-check",
  },
  {
    id: "newsletter",
    paths: { en: "/newsletter", vi: "/ban-tin", ja: "/ニュースレター" },
    labelKey: "menus.allowedBlocks.items.newsletter",
    icon: "bi-envelope-paper",
  },
  {
    id: "loyaltyProgram",
    paths: { en: "/loyalty-program", vi: "/chuong-trinh-khach-hang-than-thiet", ja: "/ロイヤルティプログラム" },
    labelKey: "menus.allowedBlocks.items.loyaltyProgram",
    icon: "bi-award",
  },
  {
    id: "rewardPoints",
    paths: { en: "/reward-points", vi: "/diem-thuong", ja: "/ポイント特典" },
    labelKey: "menus.allowedBlocks.items.rewardPoints",
    icon: "bi-gift",
  },
  {
    id: "storeLocator",
    paths: { en: "/store-locator", vi: "/tim-cua-hang", ja: "/店舗検索" },
    labelKey: "menus.allowedBlocks.items.storeLocator",
    icon: "bi-geo-alt",
  },
  {
    id: "helpCenter",
    paths: { en: "/help-center", vi: "/trung-tam-tro-giup", ja: "/ヘルプセンター" },
    labelKey: "menus.allowedBlocks.items.helpCenter",
    icon: "bi-life-preserver",
  },
  {
    id: "liveChat",
    paths: { en: "/live-chat", vi: "/chat-truc-tuyen", ja: "/ライブチャット" },
    labelKey: "menus.allowedBlocks.items.liveChat",
    icon: "bi-chat-dots",
  },
];

export const LANDING_INTERNAL_PAGES: InternalPage[] = [
  // ===== CORE =====
  {
    id: "home",
    paths: { en: "/", vi: "/", ja: "/" },
    labelKey: "menus.landing.home",
    icon: "bi-house",
  },
  {
    id: "about",
    paths: { en: "/about", vi: "/gioi-thieu", ja: "/会社概要" },
    labelKey: "menus.landing.about",
    icon: "bi-info-circle",
  },
  {
    id: "contact",
    paths: { en: "/contact", vi: "/lien-he", ja: "/お問い合わせ" },
    labelKey: "menus.landing.contact",
    icon: "bi-envelope",
  },

  // ===== MARKETING =====
  {
    id: "services",
    paths: { en: "/services", vi: "/dich-vu", ja: "/サービス" },
    labelKey: "menus.landing.services",
    icon: "bi-briefcase",
  },
  {
    id: "pricing",
    paths: { en: "/pricing", vi: "/bang-gia", ja: "/料金" },
    labelKey: "menus.landing.pricing",
    icon: "bi-cash-stack",
  },
  {
    id: "features",
    paths: { en: "/features", vi: "/tinh-nang", ja: "/機能" },
    labelKey: "menus.landing.features",
    icon: "bi-stars",
  },
  {
    id: "testimonials",
    paths: { en: "/testimonials", vi: "/danh-gia", ja: "/お客様の声" },
    labelKey: "menus.landing.testimonials",
    icon: "bi-chat-quote",
  },
  {
    id: "faq",
    paths: { en: "/faq", vi: "/cau-hoi-thuong-gap", ja: "/よくある質問" },
    labelKey: "menus.landing.faq",
    icon: "bi-question-circle",
  },

  // ===== CONVERSION =====
  {
    id: "signup",
    paths: { en: "/signup", vi: "/dang-ky", ja: "/登録" },
    labelKey: "menus.landing.signup",
    icon: "bi-person-plus",
  },
  {
    id: "login",
    paths: { en: "/login", vi: "/dang-nhap", ja: "/ログイン" },
    labelKey: "menus.landing.login",
    icon: "bi-box-arrow-in-right",
  },
  {
    id: "cta",
    paths: { en: "/get-started", vi: "/bat-dau", ja: "/始める" },
    labelKey: "menus.landing.cta",
    icon: "bi-rocket",
  },

  // ===== CONTENT =====
  {
    id: "blog",
    paths: { en: "/blog", vi: "/blog", ja: "/ブログ" },
    labelKey: "menus.landing.blog",
    icon: "bi-journal-text",
  },
  {
    id: "blogDetail",
    paths: { en: "/blog-detail", vi: "/chi-tiet-bai-viet", ja: "/記事詳細" },
    labelKey: "menus.landing.blogDetail",
    icon: "bi-file-text",
  },

  // ===== COMPANY =====
  {
    id: "team",
    paths: { en: "/team", vi: "/doi-ngu", ja: "/チーム" },
    labelKey: "menus.landing.team",
    icon: "bi-people",
  },
  {
    id: "careers",
    paths: { en: "/careers", vi: "/tuyen-dung", ja: "/採用情報" },
    labelKey: "menus.landing.careers",
    icon: "bi-briefcase",
  },
  {
    id: "portfolio",
    paths: { en: "/portfolio", vi: "/du-an", ja: "/実績" },
    labelKey: "menus.landing.portfolio",
    icon: "bi-grid",
  },

  // ===== SUPPORT =====
  {
    id: "helpCenter",
    paths: { en: "/help-center", vi: "/tro-giup", ja: "/ヘルプ" },
    labelKey: "menus.landing.helpCenter",
    icon: "bi-life-preserver",
  },
  {
    id: "liveChat",
    paths: { en: "/live-chat", vi: "/chat", ja: "/チャット" },
    labelKey: "menus.landing.liveChat",
    icon: "bi-chat-dots",
  },

  // ===== LEGAL =====
  {
    id: "privacyPolicy",
    paths: { en: "/privacy-policy", vi: "/bao-mat", ja: "/プライバシー" },
    labelKey: "menus.landing.privacyPolicy",
    icon: "bi-shield-lock",
  },
  {
    id: "terms",
    paths: { en: "/terms", vi: "/dieu-khoan", ja: "/利用規約" },
    labelKey: "menus.landing.terms",
    icon: "bi-file-earmark-text",
  },

  // ===== EXTRA (UX / SEO) =====
  {
    id: "404",
    paths: { en: "/404", vi: "/404", ja: "/404" },
    labelKey: "menus.landing.notFound",
    icon: "bi-exclamation-triangle",
  },
];

/* =========================================================
 * HEADER BASIC
 * ======================================================= */

export const ECOMMERCE_HEADER_FULL = [
  "home",
  "shop",
  "products",
  "categories",
  "collections",
  "brands",
  "newArrivals",
  "bestSellers",
  "featured",
  "trending",
  "flashSale",
  "deals",
  "offers",
  "coupons",
  "giftCards",
  "wishlist",
  "cart",
  "checkout",
  "account",
  "orders",
  "orderTracking",
  "addresses",
  "about",
  "contact",
  "faq",
  "blog",
  "shippingInfo",
  "returnPolicy",
  "sizeGuide",
  "privacyPolicy",
  "terms",
] as const;

export const LANDING_PAGE_IDS = [
  "home",
  "about",
  "contact",

  "services",
  "pricing",
  "features",
  "testimonials",
  "faq",

  "signup",
  "login",
  "cta",

  "blog",
  "blogDetail",

  "team",
  "careers",
  "portfolio",

  "helpCenter",
  "liveChat",

  "privacyPolicy",
  "terms",

  "404",
] as const;

/* =========================================================
 * MAPS
 * ======================================================= */

export const INTERNAL_PAGE_SETS: Record<SiteKind, InternalPage[]> = {
  ecommerce: ECOMMERCE_INTERNAL_PAGES,
  landing: LANDING_INTERNAL_PAGES,
};

export const TEMPLATE_ALLOWED_BY_SITE: Record<SiteKind, TemplateAllowed> = {
  ecommerce: {
    header: {
      home: [...ECOMMERCE_HEADER_FULL],
    },
  },
  landing: {
    header: {
      home: [...LANDING_PAGE_IDS],
    },
  }
};