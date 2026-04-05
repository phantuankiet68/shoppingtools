import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import RenderBlocksPublic from "@/components/v1/themeplate/RenderBlocksPublic";
import type { Block } from "@/lib/builder/pages/types";

export const dynamic = "force-dynamic";

function normalizePath(input?: string | null) {
  if (!input) return "/";

  let value = input.trim().toLowerCase();

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  if (value.length > 1 && value.endsWith("/")) {
    value = value.slice(0, -1);
  }

  return value || "/";
}

function isSamePath(value: string | null | undefined, ...candidates: string[]) {
  if (!value) return false;
  const current = normalizePath(value);
  return candidates.some((item) => normalizePath(item) === current);
}

export default async function PageByPath({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;

  const segments = Array.isArray(slug) ? slug : [];

  let path = normalizePath(segments.join("/"));
  let productSlug: string | null = null;

  if (segments[0] === "product-detail") {
    path = "/product-detail";
    productSlug = segments[1] ?? null;
  }

  const h = await headers();
  const hostHeader = h.get("x-site-domain") ?? h.get("host") ?? "";
  const domain = hostHeader.split(":")[0].toLowerCase();

  if (!domain) {
    notFound();
  }

  const site = await prisma.site.findUnique({
    where: { domain },
    select: { id: true },
  });

  if (!site) {
    notFound();
  }

  const page =
    path === "/"
      ? await prisma.page.findFirst({
          where: {
            siteId: site.id,
            status: "PUBLISHED",
            OR: [{ path: "/" }],
          },
          select: {
            id: true,
            title: true,
            path: true,
            status: true,
            blocks: true,
          },
        })
      : await prisma.page.findFirst({
          where: {
            siteId: site.id,
            status: "PUBLISHED",
            OR: [{ path }, { path: path.replace(/^\//, "") }],
          },
          select: {
            id: true,
            title: true,
            path: true,
            status: true,
            blocks: true,
          },
        });

  if (!page) {
    notFound();
  }

  const currentPath = normalizePath(page.path || path);

  const isTopbarPage = isSamePath(currentPath, "/topbar", "topbar");
  const isHeaderPage = isSamePath(currentPath, "/header", "header");
  const isFooterPage = isSamePath(currentPath, "/footer", "footer");
  const isWidgetPage = isSamePath(currentPath, "/widget", "widget");

  const [topbarPage, headerPage, footerPage, widgetPage] = await Promise.all([
    isTopbarPage
      ? Promise.resolve(null)
      : prisma.page.findFirst({
          where: {
            siteId: site.id,
            status: "PUBLISHED",
            OR: [{ path: "/topbar" }, { path: "topbar" }],
          },
          select: { blocks: true },
        }),

    isHeaderPage
      ? Promise.resolve(null)
      : prisma.page.findFirst({
          where: {
            siteId: site.id,
            status: "PUBLISHED",
            OR: [{ path: "/header" }, { path: "header" }],
          },
          select: { blocks: true },
        }),

    isFooterPage
      ? Promise.resolve(null)
      : prisma.page.findFirst({
          where: {
            siteId: site.id,
            status: "PUBLISHED",
            OR: [{ path: "/footer" }, { path: "footer" }],
          },
          select: { blocks: true },
        }),

    isWidgetPage
      ? Promise.resolve(null)
      : prisma.page.findFirst({
          where: {
            siteId: site.id,
            status: "PUBLISHED",
            OR: [{ path: "/widget" }, { path: "widget" }],
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
    mergedBlocks = [...topbarBlocks, ...headerBlocks, ...pageBlocks, ...footerBlocks, ...widgetBlocks];
  }

  return (
    <div suppressHydrationWarning>
      <RenderBlocksPublic blocks={mergedBlocks} productSlug={productSlug} currentPath={path} rawSegments={segments} />
    </div>
  );
}
