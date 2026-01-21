-- CreateTable
CREATE TABLE `Email` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SYSTEM', 'MARKETING', 'TRANSACTIONAL', 'INTERNAL') NOT NULL DEFAULT 'SYSTEM',
    `status` ENUM('DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `subject` VARCHAR(191) NOT NULL,
    `previewText` VARCHAR(191) NULL,
    `htmlContent` LONGTEXT NULL,
    `textContent` TEXT NULL,
    `templateKey` VARCHAR(191) NULL,
    `templateData` JSON NULL,
    `fromName` VARCHAR(191) NULL,
    `fromEmail` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `totalRecipients` INTEGER NOT NULL DEFAULT 0,
    `successCount` INTEGER NOT NULL DEFAULT 0,
    `failedCount` INTEGER NOT NULL DEFAULT 0,
    `lastError` TEXT NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Email_status_idx`(`status`),
    INDEX `Email_type_idx`(`type`),
    INDEX `Email_scheduledAt_idx`(`scheduledAt`),
    INDEX `Email_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailRecipient` (
    `id` VARCHAR(191) NOT NULL,
    `emailId` VARCHAR(191) NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `toName` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    `sentAt` DATETIME(3) NULL,
    `error` TEXT NULL,
    `openedAt` DATETIME(3) NULL,
    `clickedAt` DATETIME(3) NULL,
    `providerMessageId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmailRecipient_emailId_idx`(`emailId`),
    INDEX `EmailRecipient_toEmail_idx`(`toEmail`),
    INDEX `EmailRecipient_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `htmlContent` LONGTEXT NULL,
    `textContent` TEXT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailTemplate_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmailRecipient` ADD CONSTRAINT `EmailRecipient_emailId_fkey` FOREIGN KEY (`emailId`) REFERENCES `Email`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
