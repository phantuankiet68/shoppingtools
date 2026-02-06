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

  // URL path => "/a/b"
  const raw = (Array.isArray(slug) ? slug : []).join("/");
  const path = ensureLeadingSlash(raw);

  const h = await headers();
  const hostHeader = h.get("x-site-domain") ?? h.get("host") ?? "";
  const domain = hostHeader.split(":")[0].toLowerCase();

  const site = await prisma.site.findUnique({
    where: { domain },
    select: { id: true },
  });
  if (!site) notFound();
  const where =
    path === "/"
      ? {
          siteId: site.id,
          OR: [{ path: "/" }, { path: "home" }, { path: "/home" }],
        }
      : {
          siteId: site.id,
          path,
        };

  const page = await prisma.page.findFirst({ where });

  if (!page || page.status !== "PUBLISHED") notFound();

  return <RenderBlocksPublic blocks={(page.blocks as any) ?? []} />;
}
