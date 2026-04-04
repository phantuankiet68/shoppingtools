import type { BuilderMenuItem, InternalPage, SiteKind } from "@/components/admin/builder/menus/state/useMenuStore";

export type TabKey = "home" | "dashboard";

export function isTabbedConfig(v: unknown): v is { home: string[]; dashboard?: string[] } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Array.isArray((v as any).home) &&
    ((v as any).dashboard === undefined || Array.isArray((v as any).dashboard))
  );
}

export function forcedTabFromSet(currentSet: "home" | "v1"): TabKey {
  return currentSet === "v1" ? "dashboard" : "home";
}

export function pickBaseNames(
  tpl: string[] | { home: string[]; dashboard?: string[] } | undefined,
  forcedTab: TabKey,
): string[] {
  if (!tpl) return [];
  if (Array.isArray(tpl)) return tpl;
  return forcedTab === "dashboard" ? (tpl.dashboard ?? []) : tpl.home;
}

export function buildExistingPagesSet(internalPages: InternalPage[]): Set<string> {
  const set = new Set<string>();

  (internalPages || []).forEach((p) => {
    if (p.label) set.add(p.label.toLowerCase().trim());
    if (p.labelVi) set.add(p.labelVi.toLowerCase().trim());
    (p.aliases || []).forEach((a) => set.add(a.toLowerCase().trim()));
  });

  return set;
}

export function buildExistingTitlesSet(activeMenu: BuilderMenuItem[]): Set<string> {
  const all: string[] = [];

  const walk = (arr: BuilderMenuItem[]) => {
    arr.forEach((n) => {
      if (n?.title) all.push(String(n.title).toLowerCase().trim());
      if (n?.children?.length) walk(n.children);
    });
  };

  walk(activeMenu || []);
  return new Set(all);
}

export function normalizeNameForMatch(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .trim();
}

export function findPageByName(internalPages: InternalPage[], name: string): InternalPage | undefined {
  const needle = normalizeNameForMatch(name);

  return internalPages.find((p) => {
    const pool = [p.label, p.labelVi, ...(p.aliases || [])]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim());

    return pool.includes(needle);
  });
}

export function makeNewMenuItem(params: { name: string; internalPages: InternalPage[] }): BuilderMenuItem {
  const page = findPageByName(params.internalPages, params.name);

  return {
    id: `s_${Math.random().toString(36).slice(2, 9)}`,
    title: params.name,
    icon: "",
    visible: true,
    linkType: "internal",
    externalUrl: "",
    internalPageId: page?.id ?? "home",
    rawPath: page?.path ?? "/",
    schedules: [],
    children: [],
  };
}

export function makeDragPayload(internalPages: InternalPage[], name: string) {
  const page = findPageByName(internalPages, name);

  return page
    ? { type: "new", name, linkType: "internal" as const, internalPageId: page.id, rawPath: page.path }
    : { type: "new", name, linkType: "internal" as const, internalPageId: "home", rawPath: "/" };
}

export function getSuggestBySite(siteKind: SiteKind): Record<string, string[]> {
  const out: Record<string, string[]> = {};

  if (siteKind === "ecommerce") {
    out["Product Experience"] = [
      "Product Detail",
      "Product Reviews",
      "Compare Products",
      "Recently Viewed",
      "Related Products",
    ];
    out["Trust & Conversion"] = [
      "Customer Reviews",
      "Testimonials",
      "Warranty Policy",
      "Return Process",
      "Payment Methods",
    ];
    out["Order & After Sale"] = ["Order Tracking", "Track My Order", "Order History", "Reorder"];
    out["Content & Growth"] = ["News", "Press", "Promotions Detail", "Campaigns"];
    out["Engagement"] = ["Notifications", "Subscriptions", "Newsletter", "Loyalty Program", "Reward Points"];
    out["Utilities"] = ["Store Locator", "Size Guide", "Help Center", "Live Chat"];
  }

  if (siteKind === "blog") {
    out["Content Discovery"] = [
      "Trending",
      "Popular Posts",
      "Editor's Pick",
      "Latest Posts",
      "Most Viewed",
    ];

    out["Content Types"] = [
      "Tutorials",
      "Guides",
      "News",
      "Reviews",
      "Case Studies",
    ];

    out["Publishing"] = [
      "Featured Posts",
      "Top Authors",
      "Series",
      "Author Profile",
      "Guest Posts",
    ];

    out["Engagement"] = [
      "Newsletter",
      "Bookmarks",
      "Reading List",
      "Comments",
      "Likes",
    ];

    out["Community"] = [
      "Community",
      "Discussions",
      "Write a Post",
      "Recommendations",
      "Contributor Program",
    ];
  }

  if (siteKind === "lms") {
    out["Learning"] = [
      "Course Progress",
      "Continue Learning",
      "Certificates",
      "Assignments",
      "Quizzes",
      "Exams",
    ];

    out["Courses"] = [
      "All Courses",
      "My Courses",
      "Enrolled Courses",
      "Recommended Courses",
      "Saved Courses",
    ];

    out["Instructor"] = [
      "Create Course",
      "Manage Courses",
      "Instructor Dashboard",
      "Course Analytics",
      "Earnings",
    ];

    out["Student Tools"] = [
      "Learning Path",
      "Achievements",
      "My Notes",
      "Discussions",
      "Study Planner",
    ];

    out["Community"] = [
      "Forums",
      "Q&A",
      "Study Groups",
      "Mentorship",
    ];
  }

  if (siteKind === "booking") {
    out["Booking Flow"] = [
      "Check Availability",
      "Book Now",
      "Modify Booking",
      "Cancel Booking",
      "Booking History",
    ];

    out["Offers & Deals"] = [
      "Special Offers",
      "Last Minute Deals",
      "Seasonal Promotions",
      "Packages",
      "Coupons",
    ];

    out["Stay Experience"] = [
      "Spa",
      "Dining",
      "Activities",
      "Wellness",
      "Local Experiences",
    ];

    out["Guest Services"] = [
      "Airport Transfer",
      "Late Check-out",
      "Early Check-in",
      "Travel Guide",
      "Concierge Service",
    ];

    out["Property Info"] = [
      "Room Types",
      "Amenities",
      "Gallery",
      "Location Map",
      "Guest Reviews",
    ];
  }

  if (siteKind === "company") {
    out["Company"] = [
      "Our Story",
      "Mission & Vision",
      "Leadership",
      "Our Team",
      "Careers",
    ];

    out["Business"] = [
      "Solutions",
      "Industries",
      "Products",
      "Services",
      "Pricing",
    ];

    out["Trust"] = [
      "Partners",
      "Clients",
      "Testimonials",
      "Awards",
      "Certifications",
    ];

    out["Resources"] = [
      "Blog",
      "Case Studies",
      "Whitepapers",
      "Ebooks",
      "Guides",
    ];

    out["Support"] = [
      "Help Center",
      "FAQ",
      "Contact Support",
      "System Status",
    ];
  }

  if (siteKind === "news") {
    out["News Sections"] = [
      "Breaking News",
      "Trending",
      "Latest News",
      "World",
      "Business",
      "Technology",
      "Science",
      "Health",
      "Sports",
      "Entertainment",
      "Lifestyle",
    ];

    out["Editorial"] = [
      "Opinions",
      "Editorial",
      "Investigations",
      "Analysis",
      "Columns",
    ];

    out["Media"] = [
      "Videos",
      "Podcasts",
      "Photo Gallery",
      "Live TV",
      "Infographics",
    ];

    out["Content Depth"] = [
      "Features",
      "Special Reports",
      "Interviews",
      "Long Reads",
    ];

    out["User & Engagement"] = [
      "Newsletter",
      "Saved Articles",
      "Comments",
      "Notifications",
    ];
  }
  if (siteKind === "directory") {
    out["Discovery"] = [
      "Nearby",
      "Top Rated",
      "Featured Listings",
      "Popular Listings",
      "Recently Added",
    ];

    out["Search & Filters"] = [
      "Advanced Search",
      "Filter by Category",
      "Filter by Location",
      "Open Now",
      "Deals Near Me",
    ];

    out["Business"] = [
      "Add Listing",
      "Claim Your Business",
      "Pricing",
      "Plans",
      "Promote Listing",
    ];

    out["Engagement"] = [
      "Reviews",
      "Write a Review",
      "Bookmarks",
      "Favorites",
      "Messages",
    ];

    out["User"] = [
      "My Account",
      "Dashboard",
      "My Listings",
      "My Reviews",
      "Notifications",
    ];
  }

  if (siteKind === "landing") {
    out["Conversion"] = [
      "Contact Sales",
      "Start Free Trial",
      "Request a Quote",
      "Schedule Consultation",
      "Join Waitlist",
    ];

    out["Trust & Support"] = [
      "FAQ",
      "Documentation",
      "Help Center",
      "System Status",
      "Community",
    ];

    out["Company"] = [
      "Careers",
      "Press",
      "Partners",
      "Affiliate Program",
      "Media Kit",
    ];

    out["Legal & Compliance"] = [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "GDPR Compliance",
      "Accessibility",
    ];
  }

  return out;
}

export function filterSuggest(params: {
  suggest: Record<string, string[]>;
  baseNames: string[];
  existingTitles: Set<string>;
  existingPages: Set<string>;
}): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const baseSet = new Set(params.baseNames.map((s) => s.toLowerCase().trim()));

  Object.entries(params.suggest).forEach(([group, arr]) => {
    const seen = new Set<string>();

    const items = arr.filter((name) => {
      const key = name.toLowerCase().trim();

      if (seen.has(key)) return false;
      seen.add(key);

      return !baseSet.has(key) && !params.existingTitles.has(key);
    });

    if (items.length) out[group] = items;
  });

  return out;
}