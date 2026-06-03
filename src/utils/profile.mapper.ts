import type { Profile } from "@/lib/types/profile";

export interface ProfileApiResponse {
  success: boolean;
  profile: Partial<Profile> | null;
}

export function mapProfile(profile?: Partial<Profile> | null): Profile {
  return {
    // Basic
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    username: profile?.username ?? "",

    avatar: profile?.avatar ?? null,
    banner: profile?.banner ?? null,

    email: profile?.email ?? "",
    phone: profile?.phone ?? "",

    gender: profile?.gender ?? "",

    dobMonth: profile?.dobMonth ?? "",
    dobDay: profile?.dobDay ? String(profile.dobDay) : "",
    dobYear: profile?.dobYear ? String(profile.dobYear) : "",

    // Store
    shopName: profile?.shopName ?? "",
    shopSlug: profile?.shopSlug ?? "",
    shopDescription: profile?.shopDescription ?? "",

    slogan: profile?.slogan ?? "",
    bio: profile?.bio ?? "",

    // Address
    address: profile?.address ?? "",
    ward: profile?.ward ?? "",
    district: profile?.district ?? "",
    city: profile?.city ?? "",
    country: profile?.country ?? "",

    // Branding
    logo: profile?.logo ?? "",
    cover: profile?.cover ?? "",

    // Social
    website: profile?.website ?? "",
    facebook: profile?.facebook ?? "",
    instagram: profile?.instagram ?? "",
    tiktok: profile?.tiktok ?? "",
    youtube: profile?.youtube ?? "",
    linkedin: profile?.linkedin ?? "",

    // Business
    companyName: profile?.companyName ?? "",
    taxCode: profile?.taxCode ?? "",
    businessLicense: profile?.businessLicense ?? "",

    // Verification
    isVerified: profile?.isVerified ?? false,
    verifiedAt: profile?.verifiedAt ?? null,

    status: profile?.status ?? "ACTIVE",

    // Metrics
    totalProducts: profile?.totalProducts ?? 0,
    totalOrders: profile?.totalOrders ?? 0,
    totalSales: profile?.totalSales ?? 0,

    rating: profile?.rating ?? 0,
    reviewCount: profile?.reviewCount ?? 0,

    // Preferences
    locale: profile?.locale ?? "en",
    timezone: profile?.timezone ?? "Asia/Ho_Chi_Minh",

    // Security
    twoFA: profile?.twoFA ?? false,
  };
}

export function mapProfilePayload(profile: Profile) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,

    phone: profile.phone,
    gender: profile.gender,

    dobMonth: profile.dobMonth,
    dobDay: profile.dobDay ? Number(profile.dobDay) : null,
    dobYear: profile.dobYear ? Number(profile.dobYear) : null,

    shopName: profile.shopName,
    shopSlug: profile.shopSlug,
    shopDescription: profile.shopDescription,

    slogan: profile.slogan,
    bio: profile.bio,

    address: profile.address,
    ward: profile.ward,
    district: profile.district,
    city: profile.city,
    country: profile.country,

    website: profile.website,
    facebook: profile.facebook,
    instagram: profile.instagram,
    tiktok: profile.tiktok,
    youtube: profile.youtube,
    linkedin: profile.linkedin,

    companyName: profile.companyName,
    taxCode: profile.taxCode,
    businessLicense: profile.businessLicense,

    locale: profile.locale,
    timezone: profile.timezone,

    twoFA: profile.twoFA,
  };
}
