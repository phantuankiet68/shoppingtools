import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { ProfileStatus } from "@/generated/prisma";

export const runtime = "nodejs";

const PROFILE_SELECT = {
  id: true,
  userId: true,
  workspaceId: true,

  firstName: true,
  lastName: true,
  username: true,

  avatar: true,
  banner: true,

  email: true,
  phone: true,
  gender: true,

  dobMonth: true,
  dobDay: true,
  dobYear: true,

  shopName: true,
  shopSlug: true,
  shopDescription: true,

  slogan: true,
  bio: true,

  address: true,
  ward: true,
  district: true,
  city: true,
  country: true,

  logo: true,
  cover: true,

  website: true,

  facebook: true,
  instagram: true,
  tiktok: true,
  youtube: true,
  linkedin: true,

  companyName: true,
  taxCode: true,
  businessLicense: true,

  isVerified: true,
  verifiedAt: true,

  status: true,

  totalProducts: true,
  totalOrders: true,
  totalSales: true,

  rating: true,
  reviewCount: true,

  locale: true,
  timezone: true,

  twoFA: true,

  createdAt: true,
  updatedAt: true,

  workspace: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function parseStatus(value?: string): ProfileStatus {
  switch (value?.toUpperCase()) {
    case "INACTIVE":
      return ProfileStatus.INACTIVE;

    case "SUSPENDED":
      return ProfileStatus.SUSPENDED;

    case "PENDING_VERIFICATION":
      return ProfileStatus.PENDING_VERIFICATION;

    default:
      return ProfileStatus.ACTIVE;
  }
}

export async function GET() {
  try {
    const authUser = await requireAdminAuthUser();

    const profile = await prisma.profile.findUnique({
      where: {
        userId: authUser.id,
      },
      select: PROFILE_SELECT,
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await requireAdminAuthUser();

    const body = await req.json();

    const workspaceId = typeof body.workspaceId === "string" && body.workspaceId.trim() ? body.workspaceId : null;

    if (workspaceId) {
      const workspace = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
        },
      });

      if (!workspace) {
        return NextResponse.json(
          {
            error: "WORKSPACE_NOT_FOUND",
          },
          {
            status: 400,
          },
        );
      }
    }

    const username = normalizeString(body.username);

    if (username) {
      const existing = await prisma.profile.findFirst({
        where: {
          username,
          NOT: {
            userId: authUser.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: "USERNAME_ALREADY_EXISTS",
          },
          {
            status: 400,
          },
        );
      }
    }
    const shopSlug = normalizeString(body.shopSlug);

    if (shopSlug) {
      const existing = await prisma.profile.findFirst({
        where: {
          shopSlug,
          NOT: {
            userId: authUser.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: "SHOP_SLUG_ALREADY_EXISTS",
          },
          {
            status: 400,
          },
        );
      }
    }

    const profileData = {
      workspaceId,

      firstName: normalizeString(body.firstName),
      lastName: normalizeString(body.lastName),
      username,

      avatar: normalizeString(body.avatar),
      banner: normalizeString(body.banner),

      email: normalizeString(body.email),
      phone: normalizeString(body.phone),
      gender: normalizeString(body.gender),

      dobMonth: normalizeString(body.dobMonth),
      dobDay: body.dobDay ?? null,
      dobYear: body.dobYear ?? null,

      shopName: normalizeString(body.shopName),
      shopSlug,
      shopDescription: normalizeString(body.shopDescription),

      slogan: normalizeString(body.slogan),
      bio: normalizeString(body.bio),

      address: normalizeString(body.address),
      ward: normalizeString(body.ward),
      district: normalizeString(body.district),
      city: normalizeString(body.city),
      country: normalizeString(body.country),

      logo: normalizeString(body.logo),
      cover: normalizeString(body.cover),

      website: normalizeString(body.website),

      facebook: normalizeString(body.facebook),
      instagram: normalizeString(body.instagram),
      tiktok: normalizeString(body.tiktok),
      youtube: normalizeString(body.youtube),
      linkedin: normalizeString(body.linkedin),

      companyName: normalizeString(body.companyName),

      taxCode: normalizeString(body.taxCode),

      businessLicense: normalizeString(body.businessLicense),

      locale: normalizeString(body.locale),
      timezone: normalizeString(body.timezone),

      twoFA: !!body.twoFA,

      status: parseStatus(body.status),
    };

    const profile = await prisma.profile.upsert({
      where: {
        userId: authUser.id,
      },

      create: {
        userId: authUser.id,
        ...profileData,
      },

      update: profileData,

      select: PROFILE_SELECT,
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE() {
  try {
    const authUser = await requireAdminAuthUser();

    await prisma.profile.deleteMany({
      where: {
        userId: authUser.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}
