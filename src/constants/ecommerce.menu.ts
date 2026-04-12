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
    paths: { en: "/shop", vi: "/cua-hang", ja: "/shop" },
    labelKey: "pages.shop",
    icon: "bi-shop",
  },
  {
    id: "products",
    paths: { en: "/products", vi: "/san-pham", ja: "/products" },
    labelKey: "pages.products",
    icon: "bi-box-seam",
  },
  {
    id: "categories",
    paths: { en: "/categories", vi: "/danh-muc", ja: "/categories" },
    labelKey: "pages.categories",
    icon: "bi-grid",
  },
  {
    id: "collections",
    paths: { en: "/collections", vi: "/bo-suu-tap", ja: "/collections" },
    labelKey: "pages.collections",
    icon: "bi-collection",
  },
  {
    id: "brands",
    paths: { en: "/brands", vi: "/thuong-hieu", ja: "/brands" },
    labelKey: "pages.brands",
    icon: "bi-award",
  },
  {
    id: "featured",
    paths: { en: "/featured", vi: "/noi-bat", ja: "/featured" },
    labelKey: "pages.featured",
    icon: "bi-star",
  },
  {
    id: "trending",
    paths: { en: "/trending", vi: "/xu-huong", ja: "/trending" },
    labelKey: "pages.trending",
    icon: "bi-graph-up",
  },
  {
    id: "newArrivals",
    paths: { en: "/new-arrivals", vi: "/hang-moi-ve", ja: "/new-arrivals" },
    labelKey: "pages.newArrivals",
    icon: "bi-lightning",
  },
  {
    id: "bestSellers",
    paths: { en: "/best-sellers", vi: "/ban-chay", ja: "/best-sellers" },
    labelKey: "pages.bestSellers",
    icon: "bi-trophy",
  },
  {
    id: "flashSale",
    paths: { en: "/flash-sale", vi: "/flash-sale", ja: "/flash-sale" },
    labelKey: "pages.flashSale",
    icon: "bi-lightning-charge",
  },
  {
    id: "deals",
    paths: { en: "/deals", vi: "/uu-dai", ja: "/deals" },
    labelKey: "pages.deals",
    icon: "bi-tags",
  },
  {
    id: "offers",
    paths: { en: "/offers", vi: "/khuyen-mai", ja: "/offers" },
    labelKey: "pages.offers",
    icon: "bi-percent",
  },
  {
    id: "coupons",
    paths: { en: "/coupons", vi: "/ma-giam-gia", ja: "/coupons" },
    labelKey: "pages.coupons",
    icon: "bi-ticket",
  },
  {
    id: "giftCards",
    paths: { en: "/gift-cards", vi: "/the-qua-tang", ja: "/gift-cards" },
    labelKey: "pages.giftCards",
    icon: "bi-gift",
  },
  {
    id: "wishlist",
    paths: { en: "/wishlist", vi: "/yeu-thich", ja: "/wishlist" },
    labelKey: "pages.wishlist",
    icon: "bi-heart",
  },
  {
    id: "cart",
    paths: { en: "/cart", vi: "/gio-hang", ja: "/cart" },
    labelKey: "pages.cart",
    icon: "bi-cart",
  },
  {
    id: "checkout",
    paths: { en: "/checkout", vi: "/thanh-toan", ja: "/checkout" },
    labelKey: "pages.checkout",
    icon: "bi-credit-card",
  },
  {
    id: "account",
    paths: { en: "/account", vi: "/tai-khoan", ja: "/account" },
    labelKey: "pages.account",
    icon: "bi-person",
  },
  {
    id: "orders",
    paths: { en: "/orders", vi: "/don-hang", ja: "/orders" },
    labelKey: "pages.orders",
    icon: "bi-receipt",
  },
  {
    id: "orderTracking",
    paths: { en: "/order-tracking", vi: "/theo-doi-don-hang", ja: "/order-tracking" },
    labelKey: "pages.orderTracking",
    icon: "bi-truck",
  },
  {
    id: "addresses",
    paths: { en: "/addresses", vi: "/dia-chi", ja: "/addresses" },
    labelKey: "pages.addresses",
    icon: "bi-geo-alt",
  },
  {
    id: "about",
    paths: { en: "/about", vi: "/gioi-thieu", ja: "/about" },
    labelKey: "pages.about",
    icon: "bi-info-circle",
  },
  {
    id: "contact",
    paths: { en: "/contact", vi: "/lien-he", ja: "/contact" },
    labelKey: "pages.contact",
    icon: "bi-envelope",
  },
  {
    id: "faq",
    paths: { en: "/faq", vi: "/cau-hoi-thuong-gap", ja: "/faq" },
    labelKey: "pages.faq",
    icon: "bi-question-circle",
  },
  {
    id: "blog",
    paths: { en: "/blog", vi: "/blog", ja: "/blog" },
    labelKey: "pages.blog",
    icon: "bi-journal-text",
  },
  {
    id: "shippingInfo",
    paths: { en: "/shipping-info", vi: "/thong-tin-giao-hang", ja: "/shipping-info" },
    labelKey: "pages.shippingInfo",
    icon: "bi-box",
  },
  {
    id: "returnPolicy",
    paths: { en: "/return-policy", vi: "/chinh-sach-doi-tra", ja: "/return-policy" },
    labelKey: "pages.returnPolicy",
    icon: "bi-arrow-return-left",
  },
  {
    id: "sizeGuide",
    paths: { en: "/size-guide", vi: "/huong-dan-kich-thuoc", ja: "/size-guide" },
    labelKey: "pages.sizeGuide",
    icon: "bi-rulers",
  },
  {
    id: "privacyPolicy",
    paths: { en: "/privacy-policy", vi: "/chinh-sach-bao-mat", ja: "/privacy-policy" },
    labelKey: "pages.privacyPolicy",
    icon: "bi-shield-lock",
  },
  {
    id: "terms",
    paths: { en: "/terms", vi: "/dieu-khoan", ja: "/terms" },
    labelKey: "pages.terms",
    icon: "bi-file-earmark-text",
  },

  // Allowed Blocks items
  {
    id: "productDetail",
    paths: { en: "/product-detail", vi: "/chi-tiet-san-pham", ja: "/product-detail" },
    labelKey: "menus.allowedBlocks.items.productDetail",
    icon: "bi-box",
  },
  {
    id: "productReviews",
    paths: { en: "/product-reviews", vi: "/danh-gia-san-pham", ja: "/product-reviews" },
    labelKey: "menus.allowedBlocks.items.productReviews",
    icon: "bi-chat-square-text",
  },
  {
    id: "compareProducts",
    paths: { en: "/compare-products", vi: "/so-sanh-san-pham", ja: "/compare-products" },
    labelKey: "menus.allowedBlocks.items.compareProducts",
    icon: "bi-columns-gap",
  },
  {
    id: "recentlyViewed",
    paths: { en: "/recently-viewed", vi: "/da-xem-gan-day", ja: "/recently-viewed" },
    labelKey: "menus.allowedBlocks.items.recentlyViewed",
    icon: "bi-clock-history",
  },
  {
    id: "relatedProducts",
    paths: { en: "/related-products", vi: "/san-pham-lien-quan", ja: "/related-products" },
    labelKey: "menus.allowedBlocks.items.relatedProducts",
    icon: "bi-diagram-3",
  },
  {
    id: "customerReviews",
    paths: { en: "/customer-reviews", vi: "/danh-gia-khach-hang", ja: "/customer-reviews" },
    labelKey: "menus.allowedBlocks.items.customerReviews",
    icon: "bi-star",
  },
  {
    id: "testimonials",
    paths: { en: "/testimonials", vi: "/phan-hoi-khach-hang", ja: "/testimonials" },
    labelKey: "menus.allowedBlocks.items.testimonials",
    icon: "bi-chat-quote",
  },
  {
    id: "warrantyPolicy",
    paths: { en: "/warranty-policy", vi: "/chinh-sach-bao-hanh", ja: "/warranty-policy" },
    labelKey: "menus.allowedBlocks.items.warrantyPolicy",
    icon: "bi-shield-check",
  },
  {
    id: "returnProcess",
    paths: { en: "/return-process", vi: "/quy-trinh-doi-tra", ja: "/return-process" },
    labelKey: "menus.allowedBlocks.items.returnProcess",
    icon: "bi-arrow-repeat",
  },
  {
    id: "paymentMethods",
    paths: { en: "/payment-methods", vi: "/phuong-thuc-thanh-toan", ja: "/payment-methods" },
    labelKey: "menus.allowedBlocks.items.paymentMethods",
    icon: "bi-credit-card-2-front",
  },
  {
    id: "trackMyOrder",
    paths: { en: "/track-my-order", vi: "/kiem-tra-don-hang", ja: "/track-my-order" },
    labelKey: "menus.allowedBlocks.items.trackMyOrder",
    icon: "bi-truck",
  },
  {
    id: "orderHistory",
    paths: { en: "/order-history", vi: "/lich-su-don-hang", ja: "/order-history" },
    labelKey: "menus.allowedBlocks.items.orderHistory",
    icon: "bi-clock",
  },
  {
    id: "reorder",
    paths: { en: "/reorder", vi: "/dat-lai", ja: "/reorder" },
    labelKey: "menus.allowedBlocks.items.reorder",
    icon: "bi-arrow-counterclockwise",
  },
  {
    id: "news",
    paths: { en: "/news", vi: "/tin-tuc", ja: "/news" },
    labelKey: "menus.allowedBlocks.items.news",
    icon: "bi-newspaper",
  },
  {
    id: "press",
    paths: { en: "/press", vi: "/bao-chi", ja: "/press" },
    labelKey: "menus.allowedBlocks.items.press",
    icon: "bi-megaphone",
  },
  {
    id: "promotionsDetail",
    paths: { en: "/promotions-detail", vi: "/chi-tiet-khuyen-mai", ja: "/promotions-detail" },
    labelKey: "menus.allowedBlocks.items.promotionsDetail",
    icon: "bi-tags",
  },
  {
    id: "campaigns",
    paths: { en: "/campaigns", vi: "/chien-dich", ja: "/campaigns" },
    labelKey: "menus.allowedBlocks.items.campaigns",
    icon: "bi-bullseye",
  },
  {
    id: "notifications",
    paths: { en: "/notifications", vi: "/thong-bao", ja: "/notifications" },
    labelKey: "menus.allowedBlocks.items.notifications",
    icon: "bi-bell",
  },
  {
    id: "subscriptions",
    paths: { en: "/subscriptions", vi: "/dang-ky", ja: "/subscriptions" },
    labelKey: "menus.allowedBlocks.items.subscriptions",
    icon: "bi-bookmark-check",
  },
  {
    id: "newsletter",
    paths: { en: "/newsletter", vi: "/ban-tin", ja: "/newsletter" },
    labelKey: "menus.allowedBlocks.items.newsletter",
    icon: "bi-envelope-paper",
  },
  {
    id: "loyaltyProgram",
    paths: { en: "/loyalty-program", vi: "/chuong-trinh-khach-hang-than-thiet", ja: "/loyalty-program" },
    labelKey: "menus.allowedBlocks.items.loyaltyProgram",
    icon: "bi-award",
  },
  {
    id: "rewardPoints",
    paths: { en: "/reward-points", vi: "/diem-thuong", ja: "/reward-points" },
    labelKey: "menus.allowedBlocks.items.rewardPoints",
    icon: "bi-gift",
  },
  {
    id: "storeLocator",
    paths: { en: "/store-locator", vi: "/tim-cua-hang", ja: "/store-locator" },
    labelKey: "menus.allowedBlocks.items.storeLocator",
    icon: "bi-geo-alt",
  },
  {
    id: "helpCenter",
    paths: { en: "/help-center", vi: "/trung-tam-tro-giup", ja: "/help-center" },
    labelKey: "menus.allowedBlocks.items.helpCenter",
    icon: "bi-life-preserver",
  },
  {
    id: "liveChat",
    paths: { en: "/live-chat", vi: "/chat-truc-tuyen", ja: "/live-chat" },
    labelKey: "menus.allowedBlocks.items.liveChat",
    icon: "bi-chat-dots",
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

/* =========================================================
 * MAPS
 * ======================================================= */

export const INTERNAL_PAGE_SETS: Record<SiteKind, InternalPage[]> = {
  ecommerce: ECOMMERCE_INTERNAL_PAGES,
};

export const TEMPLATE_ALLOWED_BY_SITE: Record<SiteKind, TemplateAllowed> = {
  ecommerce: {
    header: {
      home: [...ECOMMERCE_HEADER_FULL],
    },
  },
};