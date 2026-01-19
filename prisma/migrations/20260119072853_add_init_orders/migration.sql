/*
  Warnings:

  - You are about to drop the column `priceCents` on the `orderitem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,number]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `StockMovement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unitPriceCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `StockMovement_orderItemId_key` ON `stockmovement`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `carrier` VARCHAR(191) NULL,
    ADD COLUMN `channel` ENUM('SHOP', 'MARKETPLACE', 'WHOLESALE') NOT NULL DEFAULT 'SHOP',
    ADD COLUMN `customerEmailSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `customerNameSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `customerPhoneSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `deliveredAt` DATETIME(3) NULL,
    ADD COLUMN `discountCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `fulfillmentStatus` ENUM('UNFULFILLED', 'PARTIAL', 'FULFILLED', 'CANCELLED', 'RETURNED') NOT NULL DEFAULT 'UNFULFILLED',
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `number` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `returnedAt` DATETIME(3) NULL,
    ADD COLUMN `shipToAddress1` VARCHAR(191) NULL,
    ADD COLUMN `shipToAddress2` VARCHAR(191) NULL,
    ADD COLUMN `shipToCity` VARCHAR(191) NULL,
    ADD COLUMN `shipToCountry` VARCHAR(191) NULL,
    ADD COLUMN `shipToName` VARCHAR(191) NULL,
    ADD COLUMN `shipToPhone` VARCHAR(191) NULL,
    ADD COLUMN `shipToPostal` VARCHAR(191) NULL,
    ADD COLUMN `shipToState` VARCHAR(191) NULL,
    ADD COLUMN `shippedAt` DATETIME(3) NULL,
    ADD COLUMN `tags` VARCHAR(191) NULL,
    ADD COLUMN `taxCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `trackingCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `priceCents`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `discountCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `productNameSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `qtyReserved` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `qtyReturned` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `qtyShipped` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `skuSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `subtotalCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `taxCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `unitPriceCents` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `variantNameSnapshot` VARCHAR(191) NULL,
    MODIFY `totalCents` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `stockmovement` ADD COLUMN `idempotencyKey` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `orderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Order_paymentStatus_idx` ON `Order`(`paymentStatus`);

-- CreateIndex
CREATE INDEX `Order_fulfillmentStatus_idx` ON `Order`(`fulfillmentStatus`);

-- CreateIndex
CREATE INDEX `Order_userId_customerId_idx` ON `Order`(`userId`, `customerId`);

-- CreateIndex
CREATE UNIQUE INDEX `Order_userId_number_key` ON `Order`(`userId`, `number`);

-- CreateIndex
CREATE INDEX `StockMovement_orderItemId_occurredAt_idx` ON `StockMovement`(`orderItemId`, `occurredAt`);

-- CreateIndex
CREATE UNIQUE INDEX `StockMovement_idempotencyKey_key` ON `StockMovement`(`idempotencyKey`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
