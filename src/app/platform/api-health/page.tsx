import type { Metadata } from 'next';

import ApiHealthManager from '@/components/platform/api-health/api-health-manager';

export const metadata: Metadata = {
    title: 'API Health',
    description:
        'Monitor platform API endpoints, validate responses, detect failures and troubleshoot issues.',
};

export default function ApiHealthPage() {
    return <ApiHealthManager />;
}
