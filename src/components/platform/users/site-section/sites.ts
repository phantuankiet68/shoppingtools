export interface Site {
    id: number;
    name: string;
    domain: string;
    workspace: string;
    thumbnail: string;
    visitors: string;
    storage: string;
    status: 'Published' | 'Draft';
    ssl: boolean;
    created: string;
    updated: string;
}

export const SITES: Site[] = [
    {
        id: 1,
        name: 'Acme Website',
        domain: 'acme.com',
        workspace: 'Acme Studio',
        thumbnail: '/assets/images/blog-02.png',
        visitors: '12.4K',
        storage: '2.8 GB',
        status: 'Published',
        ssl: true,
        created: '12 Jan 2026',
        updated: '2 hours ago',
    },
    {
        id: 2,
        name: 'Next Builder',
        domain: 'nextbuilder.io',
        workspace: 'Next Digital',
        thumbnail: '/assets/images/blog-03.png',
        visitors: '8.1K',
        storage: '1.2 GB',
        status: 'Draft',
        ssl: true,
        created: '02 Feb 2026',
        updated: 'Yesterday',
    },
];
