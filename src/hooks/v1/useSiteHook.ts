'use client';

import { useEffect, useState } from 'react';

export interface SiteInfo {
    id: string;
    name: string;
    code?: string;
    domain?: string;
    logoUrl?: string;
    faviconUrl?: string;
    description?: string;
    siteType?: string;
}

export function useSite(siteId?: string) {
    const [site, setSite] = useState<SiteInfo | null>(null);

    useEffect(() => {
        if (!siteId) return;

        fetch(`/api/v1/sites?siteId=${siteId}`)
            .then((res) => res.json())
            .then((res) => {
                if (res?.success) {
                    setSite(res.data);
                }
            })
            .catch(console.error);
    }, [siteId]);

    return site;
}
