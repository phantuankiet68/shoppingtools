/*
  Warnings:

  - You are about to drop the column `setKey` on the `MenuItem` table. All the data in the column will be lost.
  - Added the required column `area` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MenuArea" AS ENUM ('PLATFORM', 'ADMIN', 'SITE');

-- DropIndex
DROP INDEX "MenuItem_siteId_setKey_sortOrder_idx";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "setKey",
ADD COLUMN     "area" "MenuArea" NOT NULL;

-- DropEnum
DROP TYPE "MenuSetKey";

-- CreateIndex
CREATE INDEX "MenuItem_siteId_area_sortOrder_idx" ON "MenuItem"("siteId", "area", "sortOrder");

-- CreateIndex
CREATE INDEX "MenuItem_siteId_area_visible_idx" ON "MenuItem"("siteId", "area", "visible");
