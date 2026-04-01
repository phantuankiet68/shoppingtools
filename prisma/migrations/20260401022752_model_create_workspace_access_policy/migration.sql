-- CreateTable
CREATE TABLE "workspace_access_policies" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL DEFAULT 'BASIC',
    "max_sites" INTEGER NOT NULL DEFAULT 1,
    "max_pages" INTEGER NOT NULL DEFAULT 10,
    "max_menus" INTEGER NOT NULL DEFAULT 3,
    "max_product_categories" INTEGER NOT NULL DEFAULT 20,
    "max_products" INTEGER NOT NULL DEFAULT 100,
    "max_custom_domains" INTEGER NOT NULL DEFAULT 1,
    "allowBlog" BOOLEAN NOT NULL DEFAULT true,
    "allowEcommerce" BOOLEAN NOT NULL DEFAULT false,
    "allowBooking" BOOLEAN NOT NULL DEFAULT false,
    "allowNews" BOOLEAN NOT NULL DEFAULT false,
    "allowLms" BOOLEAN NOT NULL DEFAULT false,
    "allowDirectory" BOOLEAN NOT NULL DEFAULT false,
    "hiddenMenuKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_access_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_access_policies_workspace_id_key" ON "workspace_access_policies"("workspace_id");

-- AddForeignKey
ALTER TABLE "workspace_access_policies" ADD CONSTRAINT "workspace_access_policies_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
