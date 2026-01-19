-- AlterTable
ALTER TABLE `inventoryreceipt` MODIFY `receivedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `InventoryReceipt_userId_createdAt_idx` ON `InventoryReceipt`(`userId`, `createdAt`);

-- CreateIndex
CREATE INDEX `InventoryReceipt_userId_supplierId_idx` ON `InventoryReceipt`(`userId`, `supplierId`);

-- CreateIndex
CREATE INDEX `InventoryReceiptItem_productId_createdAt_idx` ON `InventoryReceiptItem`(`productId`, `createdAt`);

-- CreateIndex
CREATE INDEX `InventoryReceiptItem_variantId_createdAt_idx` ON `InventoryReceiptItem`(`variantId`, `createdAt`);
