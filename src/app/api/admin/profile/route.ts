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

    if (body.username) {
      const existing = await prisma.profile.findFirst({
        where: {
          username: body.username,
          NOT: {
            userId: authUser.id,
          },
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

    if (body.shopSlug) {
      const existing = await prisma.profile.findFirst({
        where: {
          shopSlug: body.shopSlug,
          NOT: {
            userId: authUser.id,
          },
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

    const profile = await prisma.profile.upsert({
      where: {
        userId: authUser.id,
      },

      create: {
        userId: authUser.id,

        workspaceId,

        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        username: body.username ?? null,

        avatar: body.avatar ?? null,
        banner: body.banner ?? null,

        email: body.email ?? null,
        phone: body.phone ?? null,
        gender: body.gender ?? null,

        dobMonth: body.dobMonth ?? null,
        dobDay: body.dobDay ?? null,
        dobYear: body.dobYear ?? null,

        shopName: body.shopName ?? null,
        shopSlug: body.shopSlug ?? null,
        shopDescription: body.shopDescription ?? null,

        slogan: body.slogan ?? null,
        bio: body.bio ?? null,

        address: body.address ?? null,
        ward: body.ward ?? null,
        district: body.district ?? null,
        city: body.city ?? null,
        country: body.country ?? null,

        logo: body.logo ?? null,
        cover: body.cover ?? null,

        website: body.website ?? null,

        facebook: body.facebook ?? null,
        instagram: body.instagram ?? null,
        tiktok: body.tiktok ?? null,
        youtube: body.youtube ?? null,
        linkedin: body.linkedin ?? null,

        companyName: body.companyName ?? null,

        taxCode: body.taxCode ?? null,

        businessLicense: body.businessLicense ?? null,

        locale: body.locale ?? null,
        timezone: body.timezone ?? null,

        twoFA: !!body.twoFA,

        status: parseStatus(body.status),
      },

      update: {
        ...body,

        workspaceId,

        status: body.status !== undefined ? parseStatus(body.status) : undefined,
      },

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
