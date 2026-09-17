import { NextRequest } from 'next/server';
import { parseExpiringSiteQuery } from '@/features/analytics/server/analytics.helper';
import { getExpiringSites } from '@/features/analytics/server/analytics.service';
import { apiError, apiSuccess } from '@/lib/api/api-response';
import { requireAdminAuthUser } from '@/lib/auth/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await requireAdminAuthUser();
        const query = parseExpiringSiteQuery(request.nextUrl.searchParams);

        return apiSuccess(await getExpiringSites(query));
    } catch (error) {
        return apiError(error);
    }
}
