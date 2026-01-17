-- AlterTable
ALTER TABLE `productcategory` ADD COLUMN `coverImage` VARCHAR(191) NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL,
    ADD COLUMN `parentId` VARCHAR(191) NULL,
    ADD COLUMN `seoDesc` TEXT NULL,
    ADD COLUMN `seoTitle` VARCHAR(191) NULL,
    ADD COLUMN `sort` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `ProductCategory_userId_parentId_idx` ON `ProductCategory`(`userId`, `parentId`);

-- CreateIndex
CREATE INDEX `ProductCategory_userId_parentId_sort_idx` ON `ProductCategory`(`userId`, `parentId`, `sort`);

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ProductCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
