export type ProfileStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface Profile {
  // Basic
  firstName: string;
  lastName: string;
  username: string;

  avatar: string | null;
  banner: string | null;

  email: string;
  phone: string;

  gender: string;

  dobMonth: string;
  dobDay: string;
  dobYear: string;

  // Store
  shopName: string;
  shopSlug: string;
  shopDescription: string;

  slogan: string;
  bio: string;

  // Address
  address: string;
  ward: string;
  district: string;
  city: string;
  country: string;

  // Branding
  logo: string;
  cover: string;

  // Social
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  linkedin: string;

  // Business
  companyName: string;
  taxCode: string;
  businessLicense: string;

  // Verification
  isVerified: boolean;
  verifiedAt: string | null;

  status: ProfileStatus;

  // Metrics
  totalProducts: number;
  totalOrders: number;
  totalSales: number;

  rating: number;
  reviewCount: number;

  // Preferences
  locale: string;
  timezone: string;

  // Security
  twoFA: boolean;
}
