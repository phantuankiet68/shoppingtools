import { NextRequest } from 'next/server';
import {
    parseAnalyticsPaymentType,
    parseAnalyticsQuery,
} from '@/features/analytics/server/analytics.helper';
import { getAnalyticsPayments } from '@/features/analytics/server/analytics.service';
import { apiError, apiSuccess } from '@/lib/api/api-response';
import { requireAdminAuthUser } from '@/lib/auth/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await requireAdminAuthUser();
        const query = parseAnalyticsQuery(request.nextUrl.searchParams);
        const type = parseAnalyticsPaymentType(request.nextUrl.searchParams.get('type'));

        return apiSuccess(await getAnalyticsPayments(query, type));
    } catch (error) {
        return apiError(error);
    }
}
