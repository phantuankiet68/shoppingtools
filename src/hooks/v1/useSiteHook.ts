'use client';

import { useEffect, useState } from 'react';

export interface SiteInfo {
    id: string;
    name: string;
    domain?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    seoTitle?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
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
