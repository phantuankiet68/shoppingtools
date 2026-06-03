import type { Profile } from "@/lib/types/profile";

export const EMPTY_PROFILE: Profile = {
  // Basic
  firstName: "",
  lastName: "",
  username: "",

  avatar: null,
  banner: null,

  email: "",
  phone: "",

  gender: "",

  dobMonth: "",
  dobDay: "",
  dobYear: "",

  // Store
  shopName: "",
  shopSlug: "",
  shopDescription: "",

  slogan: "",
  bio: "",

  // Address
  address: "",
  ward: "",
  district: "",
  city: "",
  country: "",

  // Branding
  logo: "",
  cover: "",

  // Social
  website: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  linkedin: "",

  // Business
  companyName: "",
  taxCode: "",
  businessLicense: "",

  // Verification
  isVerified: false,
  verifiedAt: null,

  status: "ACTIVE",

  // Metrics
  totalProducts: 0,
  totalOrders: 0,
  totalSales: 0,

  rating: 0,
  reviewCount: 0,

  // Preferences
  locale: "en",
  timezone: "Asia/Ho_Chi_Minh",

  // Security
  twoFA: false,
};
