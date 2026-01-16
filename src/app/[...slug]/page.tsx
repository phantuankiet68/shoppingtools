import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import RenderBlocksPublic from "@/components/v1/themeplate/RenderBlocksPublic";

export const dynamic = "force-dynamic";

function ensureLeadingSlash(p: string) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

export default async function PageByPath({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;

  const path = ensureLeadingSlash((Array.isArray(slug) ? slug : []).join("/"));

  const h = await headers();
  const hostHeader = h.get("x-site-domain") ?? h.get("host") ?? "";
  const domain = hostHeader.split(":")[0].toLowerCase();

  const site = await prisma.site.findUnique({
    where: { domain },
    select: { id: true },
  });
  if (!site) notFound();

  const page = await prisma.page.findFirst({
    where: { siteId: site.id, path },
  });

  if (!page || page.status !== "PUBLISHED") notFound();

  return <RenderBlocksPublic blocks={(page.blocks as any) ?? []} />;
}
