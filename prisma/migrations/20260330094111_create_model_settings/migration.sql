-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('light', 'dark', 'auto');

-- CreateEnum
CREATE TYPE "FontSize" AS ENUM ('sm', 'md', 'lg');

-- CreateEnum
CREATE TYPE "Density" AS ENUM ('comfortable', 'compact');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('VND', 'USD');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('vi', 'en', 'ja');

-- CreateEnum
CREATE TYPE "Timezone" AS ENUM ('Asia_Ho_Chi_Minh', 'UTC', 'Asia_Tokyo', 'Europe_London', 'America_Los_Angeles');

-- CreateEnum
CREATE TYPE "WebsiteType" AS ENUM ('landing', 'blog', 'company', 'ecommerce', 'booking', 'news', 'lms', 'directory');

-- CreateEnum
CREATE TYPE "AdminPreset" AS ENUM ('minimal_admin', 'content_admin', 'commerce_admin', 'booking_admin');

-- CreateEnum
CREATE TYPE "LocaleOption" AS ENUM ('vi', 'en', 'ja');

-- CreateEnum
CREATE TYPE "SortOption" AS ENUM ('newest', 'oldest', 'name_asc', 'name_desc');

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "siteName" VARCHAR(191) NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'vi',
    "timezone" "Timezone" NOT NULL DEFAULT 'Asia_Ho_Chi_Minh',
    "currency" "Currency" NOT NULL DEFAULT 'VND',
    "theme" "ThemeMode" NOT NULL DEFAULT 'auto',
    "accent" VARCHAR(20) NOT NULL DEFAULT '#6f42c1',
    "fontSize" "FontSize" NOT NULL DEFAULT 'md',
    "radius" INTEGER NOT NULL DEFAULT 18,
    "density" "Density" NOT NULL DEFAULT 'comfortable',
    "websiteType" "WebsiteType" NOT NULL DEFAULT 'landing',
    "adminPreset" "AdminPreset" NOT NULL DEFAULT 'minimal_admin',
    "defaultLocale" "LocaleOption" NOT NULL DEFAULT 'vi',
    "enabledLocales" JSONB NOT NULL,
    "enableMultilingual" BOOLEAN NOT NULL DEFAULT false,
    "pageSize" INTEGER NOT NULL DEFAULT 20,
    "defaultSort" "SortOption" NOT NULL DEFAULT 'newest',
    "showSku" BOOLEAN NOT NULL DEFAULT true,
    "showBarcode" BOOLEAN NOT NULL DEFAULT false,
    "dataModules" JSONB NOT NULL,
    "integrations" JSONB NOT NULL,
    "security" JSONB NOT NULL,
    "advanced" JSONB NOT NULL,
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "confirmBeforeDelete" BOOLEAN NOT NULL DEFAULT true,
    "autoRefresh" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnChange" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_ownerUserId_key" ON "Setting"("ownerUserId");

-- CreateIndex
CREATE INDEX "Setting_ownerUserId_idx" ON "Setting"("ownerUserId");
