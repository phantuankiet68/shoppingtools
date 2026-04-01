-- CreateTable
CREATE TABLE "MenuRolePermission" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "systemRole" "SystemRole" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuRolePermission_systemRole_enabled_idx" ON "MenuRolePermission"("systemRole", "enabled");

-- CreateIndex
CREATE INDEX "MenuRolePermission_menuId_idx" ON "MenuRolePermission"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuRolePermission_menuId_systemRole_key" ON "MenuRolePermission"("menuId", "systemRole");

-- AddForeignKey
ALTER TABLE "MenuRolePermission" ADD CONSTRAINT "MenuRolePermission_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
