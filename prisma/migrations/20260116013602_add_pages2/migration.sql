/*
  Warnings:

  - You are about to drop the column `locale` on the `page` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[siteId,slug]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - Made the column `noindex` on table `page` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nofollow` on table `page` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sitemapPriority` on table `page` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sitemapChangefreq` on table `page` required. This step will fail if there are existing NULL values in that column.
  - Made the column `twitterCard` on table `page` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `page` DROP FOREIGN KEY `Page_siteId_fkey`;

-- DropIndex
DROP INDEX `Page_siteId_locale_idx` ON `page`;

-- DropIndex
DROP INDEX `Page_siteId_locale_slug_key` ON `page`;

-- DropIndex
DROP INDEX `Page_siteId_locale_updatedAt_idx` ON `page`;

-- AlterTable
ALTER TABLE `page` DROP COLUMN `locale`,
    MODIFY `noindex` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `nofollow` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `sitemapPriority` DOUBLE NOT NULL DEFAULT 0.7,
    MODIFY `sitemapChangefreq` ENUM('ALWAYS', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NEVER') NOT NULL DEFAULT 'WEEKLY',
    MODIFY `twitterCard` ENUM('SUMMARY', 'SUMMARY_LARGE_IMAGE') NOT NULL DEFAULT 'SUMMARY_LARGE_IMAGE';

-- CreateIndex
CREATE INDEX `Page_siteId_idx` ON `Page`(`siteId`);

-- CreateIndex
CREATE INDEX `Page_siteId_updatedAt_idx` ON `Page`(`siteId`, `updatedAt`);

-- CreateIndex
CREATE UNIQUE INDEX `Page_siteId_slug_key` ON `Page`(`siteId`, `slug`);

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
