export type WebsiteType = "landing" | "blog" | "company" | "ecommerce" | "booking" | "news" | "lms" | "directory";

export type MenuKey =
  | "dashboard"
  | "pages"
  | "posts"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "bookings"
  | "courses"
  | "students"
  | "media"
  | "templates"
  | "domain"
  | "analytics"
  | "settings";

export type StaffRole = "Teacher" | "Moderator" | "Manager";

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  avatar: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  qualification: string;
  bio: string;
  teachingProfile: boolean;
  verified?: boolean;
  image?: string | null;
  systemRole: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  status: "ACTIVE" | "SUSPENDED";
};

export type UsageMetric = {
  key: string;
  label: string;
  used: number;
  limit: number;
  summary: string;
};

export type TemplateItem = {
  id: string;
  name: string;
  category: string;
  tier: "Basic" | "Pro" | "Enterprise";
  enabled: boolean;
};

export type TenantAccessProfile = {
  planName: "Basic" | "Pro" | "Enterprise";
  customDomainEnabled: boolean;
  maxCustomDomains: number;
  platformSubdomain: string;
  customDomains: { domain: string; status: "Verified" | "Pending" | "Failed" }[];
  websiteTypes: { type: WebsiteType; enabled: boolean }[];
  menuAccess: { key: MenuKey; label: string; enabled: boolean }[];
  usage: UsageMetric[];
  templates: TemplateItem[];
};
