-- DropForeignKey
ALTER TABLE `refund` DROP FOREIGN KEY `Refund_originalPaymentId_fkey`;

-- DropForeignKey
ALTER TABLE `refund` DROP FOREIGN KEY `Refund_refundPaymentId_fkey`;

-- DropForeignKey
ALTER TABLE `storagelog` DROP FOREIGN KEY `StorageLog_integrationId_fkey`;

-- DropForeignKey
ALTER TABLE `storageobject` DROP FOREIGN KEY `StorageObject_integrationId_fkey`;

-- DropIndex
DROP INDEX `StorageLog_integrationId_at_idx` ON `storagelog`;

-- DropIndex
DROP INDEX `StorageObject_integrationId_updatedAt_idx` ON `storageobject`;

-- CreateTable
CREATE TABLE `Webhook` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `direction` ENUM('inbound', 'outbound') NOT NULL,
    `status` ENUM('active', 'paused', 'error') NOT NULL DEFAULT 'active',
    `eventKey` VARCHAR(191) NOT NULL,
    `endpointPath` VARCHAR(191) NULL,
    `destinationUrl` VARCHAR(191) NULL,
    `method` ENUM('POST', 'PUT', 'PATCH') NOT NULL DEFAULT 'POST',
    `security` JSON NULL,
    `mapping` JSON NULL,
    `retryPolicy` JSON NULL,
    `lastTriggeredAt` DATETIME(3) NULL,
    `success24h` INTEGER NOT NULL DEFAULT 0,
    `fail24h` INTEGER NOT NULL DEFAULT 0,

    INDEX `Webhook_userId_idx`(`userId`),
    INDEX `Webhook_userId_direction_status_idx`(`userId`, `direction`, `status`),
    INDEX `Webhook_userId_eventKey_idx`(`userId`, `eventKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebhookDelivery` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `webhookId` VARCHAR(191) NOT NULL,
    `status` ENUM('success', 'failed', 'retrying') NOT NULL DEFAULT 'success',
    `payload` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `StorageLog_integrationId_at_idx` ON `StorageLog`(`integrationId`, `at` DESC);

-- CreateIndex
CREATE INDEX `StorageObject_integrationId_updatedAt_idx` ON `StorageObject`(`integrationId`, `updatedAt` DESC);

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `fk_refund_original_payment` FOREIGN KEY (`originalPaymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `fk_refund_refund_payment` FOREIGN KEY (`refundPaymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `fk_refund_refund_payment` FOREIGN KEY (`refundPaymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundItem` ADD CONSTRAINT `RefundItem_refundId_fkey` FOREIGN KEY (`refundId`) REFERENCES `Refund`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WebhookDelivery` ADD CONSTRAINT `WebhookDelivery_webhookId_fkey` FOREIGN KEY (`webhookId`) REFERENCES `Webhook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
