import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { createSite } from '@/features/sites/createSite';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const {
            name,
            domain,
            type,
            category,
            contactEmail,
            contactPhone,
            seoTitle,
            seoDescription,
            status,
            isPublic,
            publishedAt,
            workspaceId,
            logoUrl,
            faviconUrl,
        } = body;

        if (!name || !domain || !workspaceId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'name, domain and workspaceId are required.',
                },
                { status: 400 },
            );
        }
        let normalizedPublishedAt: Date | null = null;

        if (publishedAt) {
            const parsedPublishedAt = new Date(publishedAt);

            if (Number.isNaN(parsedPublishedAt.getTime())) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid publishedAt datetime.',
                    },
                    { status: 400 },
                );
            }

            normalizedPublishedAt = parsedPublishedAt;
        }

        const site = await createSite({
            name,
            domain,
            type,
            category,
            contactEmail,
            contactPhone,
            seoTitle,
            seoDescription,
            status,
            isPublic,
            publishedAt: normalizedPublishedAt,
            workspaceId,
            ownerUserId: session.user.id,
            createdByUserId: session.user.id,
            logoUrl,
            faviconUrl,
        });

        const serializedSite = {
            ...site,
            storageUsedBytes: site.storageUsedBytes.toString(),
            bandwidthUsedBytes: site.bandwidthUsedBytes.toString(),
            totalVisits: site.totalVisits.toString(),
        };

        return NextResponse.json({
            success: true,
            data: {
                siteId: site.id,
                site: serializedSite,
            },
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/create]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create site.',
            },
            { status: 500 },
        );
    }
}
