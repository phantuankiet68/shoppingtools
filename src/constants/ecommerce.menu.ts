import type { InternalPage, SiteKind, TemplateAllowed } from "@/components/admin/menus/state/useMenuStore";

/* =========================================================
 * INTERNAL PAGES
 * ======================================================= */

export const ECOMMERCE_INTERNAL_PAGES: InternalPage[] = [
  { id: "home", path: "/", label: "Home", icon: "bi-house" },
  { id: "shop", path: "/shop", label: "Shop", icon: "bi-shop" },
  { id: "products", path: "/products", label: "Products", icon: "bi-box-seam" },
  { id: "categories", path: "/categories", label: "Categories", icon: "bi-grid" },
  { id: "collections", path: "/collections", label: "Collections", icon: "bi-collection" },
  { id: "brands", path: "/brands", label: "Brands", icon: "bi-award" },
  { id: "featured", path: "/featured", label: "Featured", icon: "bi-star" },
  { id: "trending", path: "/trending", label: "Trending", icon: "bi-graph-up" },
  { id: "newArrivals", path: "/new-arrivals", label: "New Arrivals", icon: "bi-lightning" },
  { id: "bestSellers", path: "/best-sellers", label: "Best Sellers", icon: "bi-trophy" },
  { id: "flashSale", path: "/flash-sale", label: "Flash Sale", icon: "bi-lightning-charge" },
  { id: "deals", path: "/deals", label: "Deals", icon: "bi-tags" },
  { id: "offers", path: "/offers", label: "Offers", icon: "bi-percent" },
  { id: "coupons", path: "/coupons", label: "Coupons", icon: "bi-ticket" },
  { id: "giftCards", path: "/gift-cards", label: "Gift Cards", icon: "bi-gift" },
  { id: "wishlist", path: "/wishlist", label: "Wishlist", icon: "bi-heart" },
  { id: "cart", path: "/cart", label: "Cart", icon: "bi-cart" },
  { id: "checkout", path: "/checkout", label: "Checkout", icon: "bi-credit-card" },
  { id: "account", path: "/account", label: "My Account", icon: "bi-person" },
  { id: "orders", path: "/orders", label: "My Orders", icon: "bi-receipt" },
  { id: "orderTracking", path: "/order-tracking", label: "Order Tracking", icon: "bi-truck" },
  { id: "addresses", path: "/addresses", label: "Addresses", icon: "bi-geo-alt" },
  { id: "about", path: "/about", label: "About Us", icon: "bi-info-circle" },
  { id: "contact", path: "/contact", label: "Contact", icon: "bi-envelope" },
  { id: "faq", path: "/faq", label: "FAQ", icon: "bi-question-circle" },
  { id: "blog", path: "/blog", label: "Blog", icon: "bi-journal-text" },
  { id: "shippingInfo", path: "/shipping-info", label: "Shipping Info", icon: "bi-box" },
  { id: "returnPolicy", path: "/return-policy", label: "Return Policy", icon: "bi-arrow-return-left" },
  { id: "sizeGuide", path: "/size-guide", label: "Size Guide", icon: "bi-rulers" },
  { id: "privacyPolicy", path: "/privacy-policy", label: "Privacy Policy", icon: "bi-shield-lock" },
  { id: "terms", path: "/terms", label: "Terms & Conditions", icon: "bi-file-earmark-text" },
];

/* =========================================================
 * HEADER BASIC
 * ======================================================= */


export const ECOMMERCE_HEADER_FULL = [
  "Home",
  "Shop",
  "Products",
  "Categories",
  "Collections",
  "Brands",
  "New Arrivals",
  "Best Sellers",
  "Featured",
  "Trending",
  "Flash Sale",
  "Deals",
  "Offers",
  "Coupons",
  "Gift Cards",
  "Wishlist",
  "Cart",
  "Checkout",
  "My Account",
  "My Orders",
  "Order Tracking",
  "Addresses",
  "About Us",
  "Contact",
  "FAQ",
  "Blog",
  "Shipping Info",
  "Return Policy",
  "Size Guide",
  "Privacy Policy",
  "Terms & Conditions",
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