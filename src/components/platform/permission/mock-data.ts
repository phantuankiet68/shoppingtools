import { MenuKey, StaffMember, TenantAccessProfile, WebsiteType } from "./types";

const ALL_WEBSITE_TYPES: WebsiteType[] = [
  "landing",
  "blog",
  "company",
  "ecommerce",
  "booking",
  "news",
  "lms",
  "directory",
];

const ALL_MENUS: { key: MenuKey; label: string }[] = [];

function buildWebsiteTypes(enabled: WebsiteType[]) {
  return ALL_WEBSITE_TYPES.map((type) => ({ type, enabled: enabled.includes(type) }));
}

function buildMenus(enabled: MenuKey[]) {
  return ALL_MENUS.map((menu) => ({ ...menu, enabled: enabled.includes(menu.key) }));
}

export function getAccessProfile(staff: StaffMember): TenantAccessProfile {
  const isEnterprise = staff.systemRole === "SUPER_ADMIN";
  const isPro = staff.systemRole === "ADMIN";

  return {
    planName: isEnterprise ? "Enterprise" : isPro ? "Pro" : "Basic",
    customDomainEnabled: true,
    maxCustomDomains: isEnterprise ? 10 : isPro ? 3 : 1,
    platformSubdomain: `${staff.name.toLowerCase().replace(/\s+/g, "-")}.yourplatform.com`,
    customDomains: isEnterprise
      ? [
          { domain: "academy.client-enterprise.com", status: "Verified" },
          { domain: "portal.client-enterprise.com", status: "Pending" },
        ]
      : [{ domain: `${staff.name.toLowerCase().replace(/\s+/g, "")}.com`, status: "Verified" }],
    websiteTypes: buildWebsiteTypes(
      isEnterprise
        ? ["landing", "blog", "company", "ecommerce", "booking", "news", "lms", "directory"]
        : isPro
          ? ["landing", "blog", "company", "ecommerce", "booking"]
          : ["landing", "blog", "company"],
    ),
    menuAccess: buildMenus(isEnterprise ? [] : isPro ? [] : []),
    usage: [
      {
        key: "pages",
        label: "Pages",
        used: isEnterprise ? 18 : isPro ? 9 : 4,
        limit: isEnterprise ? 999 : isPro ? 30 : 10,
        summary: "Total website pages allowed for this tenant.",
      },
      {
        key: "menus",
        label: "Menus",
        used: isEnterprise ? 8 : isPro ? 4 : 2,
        limit: isEnterprise ? 100 : isPro ? 10 : 3,
        summary: "Navigation structures available in the site builder.",
      },
      {
        key: "categories",
        label: "Product Categories",
        used: isEnterprise ? 42 : isPro ? 18 : 5,
        limit: isEnterprise ? 999 : isPro ? 100 : 20,
        summary: "Catalog category capacity for commerce websites.",
      },
      {
        key: "images",
        label: "Images",
        used: isEnterprise ? 321 : isPro ? 86 : 19,
        limit: isEnterprise ? 5000 : isPro ? 1000 : 100,
        summary: "Uploaded media assets available across websites.",
      },
      {
        key: "templates",
        label: "Templates",
        used: isEnterprise ? 12 : isPro ? 5 : 2,
        limit: isEnterprise ? 100 : isPro ? 15 : 3,
        summary: "Template packs enabled for the tenant.",
      },
    ],
    templates: [
      { id: "t1", name: "Edu Starter", category: "LMS", tier: "Basic", enabled: true },
      { id: "t2", name: "Startup Launch", category: "Landing", tier: "Basic", enabled: true },
      { id: "t3", name: "Shop Modern", category: "Ecommerce", tier: "Pro", enabled: isPro || isEnterprise },
      { id: "t4", name: "Booking Studio", category: "Booking", tier: "Pro", enabled: isPro || isEnterprise },
      { id: "t5", name: "Newsroom Max", category: "News", tier: "Enterprise", enabled: isEnterprise },
    ],
  };
}
