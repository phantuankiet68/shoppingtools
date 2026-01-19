-- CreateTable
CREATE TABLE `StockMovement` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `type` ENUM('IN', 'OUT', 'ADJUST', 'RETURN_IN', 'VOID') NOT NULL,
    `source` ENUM('RECEIPT', 'ORDER', 'MANUAL') NOT NULL,
    `qtyDelta` INTEGER NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `receiptItemId` VARCHAR(191) NULL,
    `orderItemId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StockMovement_userId_occurredAt_idx`(`userId`, `occurredAt`),
    INDEX `StockMovement_productId_occurredAt_idx`(`productId`, `occurredAt`),
    INDEX `StockMovement_variantId_occurredAt_idx`(`variantId`, `occurredAt`),
    UNIQUE INDEX `StockMovement_receiptItemId_key`(`receiptItemId`),
    UNIQUE INDEX `StockMovement_orderItemId_key`(`orderItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
