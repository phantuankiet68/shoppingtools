import { NextRequest } from 'next/server';
import { parseNotificationLimit } from '@/features/analytics/server/analytics.helper';
import { getAnalyticsNotifications } from '@/features/analytics/server/analytics.service';
import { apiError, apiSuccess } from '@/lib/api/api-response';
import { requireAdminAuthUser } from '@/lib/auth/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await requireAdminAuthUser();
        const limit = parseNotificationLimit(request.nextUrl.searchParams);

        return apiSuccess(await getAnalyticsNotifications(limit));
    } catch (error) {
        return apiError(error);
    }
}
