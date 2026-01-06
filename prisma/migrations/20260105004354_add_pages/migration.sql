/*
  Warnings:

  - A unique constraint covering the columns `[siteId,locale,slug]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[siteId,path]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locale` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `menuitem` ADD COLUMN `locale` ENUM('vi', 'en', 'ja') NOT NULL DEFAULT 'vi';

-- AlterTable
ALTER TABLE `page` ADD COLUMN `locale` ENUM('vi', 'en', 'ja') NOT NULL,
    ADD COLUMN `sitemapChangefreq` ENUM('ALWAYS', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NEVER') NULL DEFAULT 'WEEKLY',
    ADD COLUMN `twitterCard` ENUM('SUMMARY', 'SUMMARY_LARGE_IMAGE') NULL DEFAULT 'SUMMARY_LARGE_IMAGE';

-- AlterTable
ALTER TABLE `site` ADD COLUMN `localeDefault` ENUM('vi', 'en', 'ja') NOT NULL DEFAULT 'vi';

-- CreateIndex
CREATE INDEX `MenuItem_siteId_locale_setKey_sortOrder_idx` ON `MenuItem`(`siteId`, `locale`, `setKey`, `sortOrder`);

-- CreateIndex
CREATE INDEX `Page_siteId_locale_idx` ON `Page`(`siteId`, `locale`);

-- CreateIndex
CREATE INDEX `Page_siteId_locale_updatedAt_idx` ON `Page`(`siteId`, `locale`, `updatedAt`);

-- CreateIndex
CREATE UNIQUE INDEX `Page_siteId_locale_slug_key` ON `Page`(`siteId`, `locale`, `slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Page_siteId_path_key` ON `Page`(`siteId`, `path`);
