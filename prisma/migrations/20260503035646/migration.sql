/*
  Warnings:

  - You are about to drop the column `userId` on the `EmailTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspace_id,user_id,site_id]` on the table `workspace_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('website', 'facebook', 'zalo', 'phone', 'walk_in');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AccessTier" AS ENUM ('BASIC', 'NORMAL', 'PRO');

-- AlterEnum
ALTER TYPE "EmailProvider" ADD VALUE 'MAILGUN';

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_userId_fkey";

-- DropIndex
DROP INDEX "EmailTemplate_userId_isActive_idx";

-- DropIndex
DROP INDEX "EmailTemplate_userId_key_key";

-- DropIndex
DROP INDEX "workspace_members_workspace_id_user_id_key";

-- AlterTable
ALTER TABLE "EmailRecipient" ADD COLUMN     "errorMessage" TEXT;

-- AlterTable
ALTER TABLE "EmailTemplate" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "site_id" TEXT,
ADD COLUMN     "tier" "AccessTier" NOT NULL DEFAULT 'BASIC';

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "source" "BookingSource" NOT NULL,
    "note" TEXT,
    "siteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "siteId" TEXT,
    "key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "fromEmail" TEXT,
    "fromName" TEXT,
    "replyToEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_groups" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_tier" "AccessTier" NOT NULL DEFAULT 'BASIC',
    "min_tier_level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "status" "TemplateStatus" NOT NULL DEFAULT 'PUBLISHED',
    "preview_image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "template_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_start_end_idx" ON "Booking"("start", "end");

-- CreateIndex
CREATE INDEX "Booking_siteId_idx" ON "Booking"("siteId");

-- CreateIndex
CREATE INDEX "SystemCredential_userId_isActive_idx" ON "SystemCredential"("userId", "isActive");

-- CreateIndex
CREATE INDEX "SystemCredential_siteId_isActive_idx" ON "SystemCredential"("siteId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SystemCredential_userId_key_key" ON "SystemCredential"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "template_groups_code_key" ON "template_groups"("code");

-- CreateIndex
CREATE INDEX "template_groups_is_active_sort_order_idx" ON "template_groups"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "template_groups_min_tier_level_idx" ON "template_groups"("min_tier_level");

-- CreateIndex
CREATE UNIQUE INDEX "template_catalog_code_key" ON "template_catalog"("code");

-- CreateIndex
CREATE INDEX "template_catalog_group_id_sort_order_idx" ON "template_catalog"("group_id", "sort_order");

-- CreateIndex
CREATE INDEX "template_catalog_status_is_active_idx" ON "template_catalog"("status", "is_active");

-- CreateIndex
CREATE INDEX "template_catalog_kind_idx" ON "template_catalog"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_key_key" ON "EmailTemplate"("key");

-- CreateIndex
CREATE INDEX "EmailTemplate_isActive_idx" ON "EmailTemplate"("isActive");

-- CreateIndex
CREATE INDEX "workspace_members_site_id_idx" ON "workspace_members"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_site_id_key" ON "workspace_members"("workspace_id", "user_id", "site_id");

-- AddForeignKey
ALTER TABLE "SystemCredential" ADD CONSTRAINT "SystemCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemCredential" ADD CONSTRAINT "SystemCredential_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_catalog" ADD CONSTRAINT "template_catalog_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "template_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
