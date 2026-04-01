import { prisma } from "@/lib/prisma";

export class WorkspaceLimitError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "WORKSPACE_LIMIT", status = 409) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function getPolicy(workspaceId: string) {
  const policy = await prisma.workspaceAccessPolicy.findUnique({
    where: { workspaceId },
  });

  if (!policy) {
    throw new WorkspaceLimitError("Workspace access policy not found", "WORKSPACE_POLICY_MISSING", 400);
  }

  return policy;
}

export async function assertCanCreateSite(workspaceId: string) {
  const policy = await getPolicy(workspaceId);

  const totalSites = await prisma.site.count({
    where: { workspaceId },
  });

  if (totalSites >= policy.maxSites) {
    throw new WorkspaceLimitError(`Site limit reached (${policy.maxSites})`, "SITE_LIMIT_REACHED");
  }
}

export async function assertCanCreatePage(workspaceId: string) {
  const policy = await getPolicy(workspaceId);

  const totalPages = await prisma.page.count({
    where: {
      site: { workspaceId },
      deletedAt: null,
    },
  });

  if (totalPages >= policy.maxPages) {
    throw new WorkspaceLimitError(`Page limit reached (${policy.maxPages})`, "PAGE_LIMIT_REACHED");
  }
}

export async function assertCanCreateMenu(workspaceId: string) {
  const policy = await getPolicy(workspaceId);

  const totalMenus = await prisma.menuItem.count({
    where: {
      site: { workspaceId },
    },
  });

  if (totalMenus >= policy.maxMenus) {
    throw new WorkspaceLimitError(`Menu limit reached (${policy.maxMenus})`, "MENU_LIMIT_REACHED");
  }
}

export async function assertCanCreateProductCategory(workspaceId: string) {
  const policy = await getPolicy(workspaceId);

  const totalCategories = await prisma.productCategory.count({
    where: {
      site: { workspaceId },
    },
  });

  if (totalCategories >= policy.maxProductCategories) {
    throw new WorkspaceLimitError(
      `Product category limit reached (${policy.maxProductCategories})`,
      "CATEGORY_LIMIT_REACHED",
    );
  }
}

export async function assertCanCreateProduct(workspaceId: string) {
  const policy = await getPolicy(workspaceId);

  if (!policy.allowEcommerce) {
    throw new WorkspaceLimitError("Ecommerce is not enabled for this workspace", "ECOMMERCE_DISABLED", 403);
  }

  const totalProducts = await prisma.product.count({
    where: {
      site: { workspaceId },
      deletedAt: null,
    },
  });

  if (totalProducts >= policy.maxProducts) {
    throw new WorkspaceLimitError(`Product limit reached (${policy.maxProducts})`, "PRODUCT_LIMIT_REACHED");
  }
}
