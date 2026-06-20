import { NextRequest } from 'next/server';

export interface CustomerSession {
    customerId: string | null;
    siteId?: string | null;
}

export async function getCustomerFromSession(
    _req: NextRequest,
    _siteId?: string,
): Promise<CustomerSession | null> {
    /**
     * TODO:
     * Implement customer authentication.
     *
     * Current auth system only supports:
     * - ADMIN
     * - SUPER_ADMIN
     */

    return null;
}
