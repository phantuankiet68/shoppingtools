import RenderBlocksPublic from '@/components/v1/themeplate/RenderBlocksPublic';
import type { Block } from '@/lib/pages/types';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function normalizePath(input?: string | null) {
    if (!input) return '/';

    let value = input.trim().toLowerCase();

    if (!value.startsWith('/')) {
        value = `/${value}`;
    }

    if (value.length > 1 && value.endsWith('/')) {
        value = value.slice(0, -1);
    }

    return value || '/';
}

function isSamePath(value: string | null | undefined, ...candidates: string[]) {
    if (!value) return false;
    const current = normalizePath(value);
    return candidates.some((item) => normalizePath(item) === current);
}

export default async function PageByPath({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = await params;

    const segments = Array.isArray(slug) ? slug : [];

    let path = normalizePath(segments.join('/'));
    let productSlug: string | null = null;

    if (segments[0] === 'product-detail') {
        path = '/product-detail';
        productSlug = segments[1] ?? null;
    }

    const h = await headers();
    const hostHeader = h.get('x-site-domain') ?? h.get('host') ?? '';
    const domain = hostHeader.split(':')[0].toLowerCase();

    if (!domain) {
        notFound();
    }

    const site = await prisma.site.findUnique({
        where: { domain },
        select: {
            id: true,
            name: true,
            logoUrl: true,
            faviconUrl: true,
            domain: true,
        },
    });

    if (!site) {
        notFound();
    }

    const page =
        path === '/'
            ? await prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [{ path: '/' }],
                  },
                  select: {
                      id: true,
                      title: true,
                      path: true,
                      status: true,
                      blocks: true,

                      seo: {
                          select: {
                              metaTitle: true,
                              metaDescription: true,
                              canonicalUrl: true,

                              robots: true,

                              ogTitle: true,
                              ogDescription: true,
                              ogImage: true,
                              ogImageAlt: true,
                              ogType: true,

                              structuredData: true,
                          },
                      },
                  },
              })
            : await prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [{ path }, { path: path.replace(/^\//, '') }],
                  },
                  select: {
                      id: true,
                      title: true,
                      path: true,
                      status: true,
                      blocks: true,

                      seo: {
                          select: {
                              metaTitle: true,
                              metaDescription: true,
                              canonicalUrl: true,

                              robots: true,

                              ogTitle: true,
                              ogDescription: true,
                              ogImage: true,
                              ogImageAlt: true,
                              ogType: true,

                              structuredData: true,
                          },
                      },
                  },
              });

    if (!page) {
        notFound();
    }

    const currentPath = normalizePath(page.path || path);

    const isTopbarPage = isSamePath(currentPath, '/topbar', 'topbar');
    const isHeaderPage = isSamePath(currentPath, '/header', 'header');
    const isFooterPage = isSamePath(currentPath, '/footer', 'footer');
    const isWidgetPage = isSamePath(currentPath, '/widget', 'widget');

    const [topbarPage, headerPage, footerPage, widgetPage] = await Promise.all([
        isTopbarPage
            ? Promise.resolve(null)
            : prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [{ path: '/topbar' }, { path: 'topbar' }],
                  },
                  select: { blocks: true },
              }),

        isHeaderPage
            ? Promise.resolve(null)
            : prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [{ path: '/header' }, { path: 'header' }],
                  },
                  select: { blocks: true },
              }),

        isFooterPage
            ? Promise.resolve(null)
            : prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [{ path: '/footer' }, { path: 'footer' }],
                  },
                  select: { blocks: true },
              }),

        isWidgetPage
            ? Promise.resolve(null)
            : prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [{ path: '/widget' }, { path: 'widget' }],
                  },
                  select: { blocks: true },
              }),
    ]);

    const topbarBlocks = Array.isArray(topbarPage?.blocks) ? (topbarPage.blocks as Block[]) : [];

    const headerBlocks = Array.isArray(headerPage?.blocks) ? (headerPage.blocks as Block[]) : [];

    const pageBlocks = Array.isArray(page.blocks) ? (page.blocks as Block[]) : [];

    const footerBlocks = Array.isArray(footerPage?.blocks) ? (footerPage.blocks as Block[]) : [];

    const widgetBlocks = Array.isArray(widgetPage?.blocks) ? (widgetPage.blocks as Block[]) : [];

    let mergedBlocks: Block[] = [];

    if (isTopbarPage) {
        mergedBlocks = pageBlocks;
    } else if (isHeaderPage) {
        mergedBlocks = [...topbarBlocks, ...pageBlocks];
    } else if (isFooterPage) {
        mergedBlocks = [...topbarBlocks, ...headerBlocks, ...pageBlocks];
    } else if (isWidgetPage) {
        mergedBlocks = [...topbarBlocks, ...headerBlocks, ...footerBlocks, ...pageBlocks];
    } else {
        mergedBlocks = [
            ...topbarBlocks,
            ...headerBlocks,
            ...pageBlocks,
            ...footerBlocks,
            ...widgetBlocks,
        ];
    }

    return (
        <div suppressHydrationWarning>
            {page.seo?.structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(page.seo.structuredData),
                    }}
                />
            )}
            <RenderBlocksPublic
                blocks={mergedBlocks}
                siteId={site.id}
                productSlug={productSlug}
                currentPath={path}
                rawSegments={segments}
            />
        </div>
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const segments = Array.isArray(slug) ? slug : [];

    let path = normalizePath(segments.join('/'));

    if (segments[0] === 'product-detail') {
        path = '/product-detail';
    }

    const h = await headers();

    const hostHeader = h.get('x-site-domain') ?? h.get('host') ?? '';

    const domain = hostHeader.split(':')[0].toLowerCase();

    const site = await prisma.site.findUnique({
        where: {
            domain,
        },
        select: {
            id: true,
        },
    });

    if (!site) {
        return {};
    }

    const page =
        path === '/'
            ? await prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [{ path: '/' }],
                  },

                  select: {
                      title: true,
                      seo: true,
                  },
              })
            : await prisma.page.findFirst({
                  where: {
                      siteId: site.id,
                      status: 'PUBLISHED',
                      OR: [
                          { path },
                          {
                              path: path.replace(/^\//, ''),
                          },
                      ],
                  },

                  select: {
                      title: true,
                      seo: true,
                  },
              });

    if (!page) {
        return {};
    }

    const seo = page.seo;

    const robots = seo?.robots ?? 'index,follow';

    return {
        title: seo?.metaTitle ?? page.title,

        description: seo?.metaDescription ?? undefined,

        alternates: {
            canonical: seo?.canonicalUrl ?? undefined,
        },

        robots: {
            index: !robots.includes('noindex'),

            follow: !robots.includes('nofollow'),
        },

        openGraph: {
            title: seo?.ogTitle ?? seo?.metaTitle ?? page.title,

            description: seo?.ogDescription ?? seo?.metaDescription ?? undefined,

            images: seo?.ogImage
                ? [
                      {
                          url: seo.ogImage,

                          alt: seo?.ogImageAlt ?? page.title,
                      },
                  ]
                : [],
        },

        twitter: {
            card: 'summary_large_image',

            title: seo?.ogTitle ?? seo?.metaTitle ?? page.title,

            description: seo?.ogDescription ?? seo?.metaDescription ?? undefined,

            images: seo?.ogImage ? [seo.ogImage] : [],
        },
    };
}
