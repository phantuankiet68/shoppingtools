import { NextRequest } from 'next/server';
import { parseAnalyticsQuery } from '@/features/analytics/server/analytics.helper';
import { getAnalyticsOverview } from '@/features/analytics/server/analytics.service';
import { apiError, apiSuccess } from '@/lib/api/api-response';
import { requireAdminAuthUser } from '@/lib/auth/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await requireAdminAuthUser();
        const query = parseAnalyticsQuery(request.nextUrl.searchParams);
        const data = await getAnalyticsOverview(query);
        return apiSuccess(data);
    } catch (error) {
        return apiError(error);
    }
}
