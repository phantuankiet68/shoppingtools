-- AlterTable
ALTER TABLE `inventoryreceiptitem` ADD COLUMN `variantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `variantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `displayPriceCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `displayStock` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `hasVariants` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `priceCents` INTEGER NOT NULL DEFAULT 0,
    `costCents` INTEGER NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `option1` VARCHAR(191) NULL,
    `value1` VARCHAR(191) NULL,
    `option2` VARCHAR(191) NULL,
    `value2` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariant_productId_idx`(`productId`),
    INDEX `ProductVariant_productId_isActive_idx`(`productId`, `isActive`),
    UNIQUE INDEX `ProductVariant_productId_sku_key`(`productId`, `sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantImage` (
    `id` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductVariantImage_variantId_idx`(`variantId`),
    INDEX `ProductVariantImage_variantId_sort_idx`(`variantId`, `sort`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `InventoryReceiptItem_variantId_idx` ON `InventoryReceiptItem`(`variantId`);

-- CreateIndex
CREATE INDEX `OrderItem_variantId_idx` ON `OrderItem`(`variantId`);

-- CreateIndex
CREATE INDEX `Product_userId_isActive_idx` ON `Product`(`userId`, `isActive`);

-- CreateIndex
CREATE INDEX `Product_userId_hasVariants_idx` ON `Product`(`userId`, `hasVariants`);

-- CreateIndex
CREATE INDEX `Product_userId_categoryId_isActive_idx` ON `Product`(`userId`, `categoryId`, `isActive`);

-- AddForeignKey
ALTER TABLE `InventoryReceiptItem` ADD CONSTRAINT `InventoryReceiptItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantImage` ADD CONSTRAINT `ProductVariantImage_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
