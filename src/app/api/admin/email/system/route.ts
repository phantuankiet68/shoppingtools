import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/admin/get-admin-auth';
import {
  encryptSystemCredential,
  maskSecret,
} from '@/lib/crypto/system-credential';

const saveSystemCredentialSchema = z.object({
  key: z.string().min(1),
  provider: z.string().min(1),
  apiKeyEncrypted: z.string().min(1),
  fromEmail: z.string().email().optional().nullable(),
  fromName: z.string().optional().nullable(),
  replyToEmail: z.string().email().optional().nullable(),
  isActive: z.boolean().optional(),
  siteId: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedSiteId = searchParams.get('siteId');
    const key = searchParams.get('key') ?? 'resend_main';

    const adminAuth = await getAdminAuth();
    const userId = adminAuth.user.id;
    const currentSiteId = requestedSiteId ?? adminAuth.site?.id ?? null;

    let credential = null;

    if (currentSiteId) {
      credential = await prisma.systemCredential.findFirst({
        where: {
          siteId: currentSiteId,
          key,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }

    if (!credential) {
      credential = await prisma.systemCredential.findFirst({
        where: {
          userId,
          key,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }

    if (!credential) {
      return NextResponse.json({
        ok: true,
        data: null,
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: credential.id,
        userId: credential.userId,
        siteId: credential.siteId,
        key: credential.key,
        provider: credential.provider,
        fromEmail: credential.fromEmail,
        fromName: credential.fromName,
        replyToEmail: credential.replyToEmail,
        isActive: credential.isActive,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
        hasApiKey: Boolean(credential.apiKeyEncrypted),
        apiKeyMasked: maskSecret(credential.apiKeyEncrypted),
        // intentionally DO NOT return apiKeyEncrypted raw value
        apiKeyEncrypted: '',
      },
    });
  } catch (error) {
    console.error('GET /api/email/system error', error);

    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load system credential',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuth();
    const userId = adminAuth.user.id;

    const body = await request.json();
    const parsed = saveSystemCredentialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Invalid payload',
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const resolvedSiteId = input.siteId ?? adminAuth.site?.id ?? null;
    const encryptedApiKey = encryptSystemCredential(input.apiKeyEncrypted);

    if (resolvedSiteId) {
      const existingSiteCredential = await prisma.systemCredential.findFirst({
        where: {
          siteId: resolvedSiteId,
          key: input.key,
        },
      });

      const saved = existingSiteCredential
        ? await prisma.systemCredential.update({
            where: {
              id: existingSiteCredential.id,
            },
            data: {
              provider: input.provider,
              apiKeyEncrypted: encryptedApiKey,
              fromEmail: input.fromEmail ?? null,
              fromName: input.fromName ?? null,
              replyToEmail: input.replyToEmail ?? null,
              isActive: input.isActive ?? true,
            },
          })
        : await prisma.systemCredential.create({
            data: {
              userId: null,
              siteId: resolvedSiteId,
              key: input.key,
              provider: input.provider,
              apiKeyEncrypted: encryptedApiKey,
              fromEmail: input.fromEmail ?? null,
              fromName: input.fromName ?? null,
              replyToEmail: input.replyToEmail ?? null,
              isActive: input.isActive ?? true,
            },
          });

      return NextResponse.json({
        ok: true,
        data: {
          ...saved,
          hasApiKey: true,
          apiKeyMasked: 'Saved securely',
          apiKeyEncrypted: '',
        },
      });
    }

    const saved = await prisma.systemCredential.upsert({
      where: {
        userId_key: {
          userId,
          key: input.key,
        },
      },
      update: {
        provider: input.provider,
        apiKeyEncrypted: encryptedApiKey,
        fromEmail: input.fromEmail ?? null,
        fromName: input.fromName ?? null,
        replyToEmail: input.replyToEmail ?? null,
        isActive: input.isActive ?? true,
      },
      create: {
        userId,
        siteId: null,
        key: input.key,
        provider: input.provider,
        apiKeyEncrypted: encryptedApiKey,
        fromEmail: input.fromEmail ?? null,
        fromName: input.fromName ?? null,
        replyToEmail: input.replyToEmail ?? null,
        isActive: input.isActive ?? true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...saved,
        hasApiKey: true,
        apiKeyMasked: 'Saved securely',
        apiKeyEncrypted: '',
      },
    });
  } catch (error) {
    console.error('POST /api/email/system error', error);

    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to save system credential',
      },
      { status: 500 },
    );
  }
}