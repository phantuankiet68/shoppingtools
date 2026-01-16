-- AlterTable
ALTER TABLE `page` ADD COLUMN `menuItemId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Page_menuItemId_idx` ON `Page`(`menuItemId`);

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
