-- AlterTable
ALTER TABLE `inventoryreceipt` ADD COLUMN `poId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `inventoryreceiptitem` ADD COLUMN `poLineId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stockmovement` ADD COLUMN `afterStock` INTEGER NULL,
    ADD COLUMN `beforeStock` INTEGER NULL;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'APPROVED', 'PARTIAL', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `supplierId` VARCHAR(191) NULL,
    `currency` ENUM('USD', 'VND') NOT NULL DEFAULT 'USD',
    `expectedAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `subtotalCents` INTEGER NOT NULL DEFAULT 0,
    `taxCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL DEFAULT 0,
    `approvedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PurchaseOrder_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `PurchaseOrder_status_idx`(`status`),
    INDEX `PurchaseOrder_supplierId_idx`(`supplierId`),
    UNIQUE INDEX `PurchaseOrder_userId_number_key`(`userId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrderLine` (
    `id` VARCHAR(191) NOT NULL,
    `poId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `skuSnapshot` VARCHAR(191) NULL,
    `nameSnapshot` VARCHAR(191) NULL,
    `qtyOrdered` INTEGER NOT NULL,
    `qtyReceived` INTEGER NOT NULL DEFAULT 0,
    `unitCostCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PurchaseOrderLine_poId_idx`(`poId`),
    INDEX `PurchaseOrderLine_productId_idx`(`productId`),
    INDEX `PurchaseOrderLine_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `InventoryReceipt_poId_idx` ON `InventoryReceipt`(`poId`);

-- CreateIndex
CREATE INDEX `InventoryReceipt_userId_poId_idx` ON `InventoryReceipt`(`userId`, `poId`);

-- CreateIndex
CREATE INDEX `InventoryReceiptItem_poLineId_idx` ON `InventoryReceiptItem`(`poLineId`);

-- AddForeignKey
ALTER TABLE `InventoryReceipt` ADD CONSTRAINT `InventoryReceipt_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceiptItem` ADD CONSTRAINT `InventoryReceiptItem_poLineId_fkey` FOREIGN KEY (`poLineId`) REFERENCES `PurchaseOrderLine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderLine` ADD CONSTRAINT `PurchaseOrderLine_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderLine` ADD CONSTRAINT `PurchaseOrderLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderLine` ADD CONSTRAINT `PurchaseOrderLine_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
