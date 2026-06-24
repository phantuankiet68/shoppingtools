import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const siteId = searchParams.get('siteId');
        const domain = searchParams.get('domain');

        if (!siteId && !domain) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'siteId hoặc domain là bắt buộc',
                },
                { status: 400 },
            );
        }

        const where = siteId
            ? {
                  id: siteId,
              }
            : {
                  domain: domain!,
              };

        const site = await prisma.site.findFirst({
            where,
            select: {
                id: true,
                name: true,
                domain: true,
                logoUrl: true,
                faviconUrl: true,
                seoTitle: true,
                contactEmail: true,
                contactPhone: true,
            },
        });

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Không tìm thấy website',
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: site,
        });
    } catch (error) {
        console.error('GET /api/v1/site error', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 },
        );
    }
}
