export type PageTemplate = {
    title: string;
    path: string;
    type: 'SYSTEM' | 'PAGE';
};

export const DEFAULT_PAGES: PageTemplate[] = [
    {
        title: 'Header',
        path: '/header',
        type: 'SYSTEM',
    },
    {
        title: 'Footer',
        path: '/footer',
        type: 'SYSTEM',
    },
    {
        title: '404',
        path: '/404',
        type: 'SYSTEM',
    },
];

export function getPageTemplate(type?: string, category?: string): PageTemplate[] {
    const pages = [...DEFAULT_PAGES];

    return pages;
}
