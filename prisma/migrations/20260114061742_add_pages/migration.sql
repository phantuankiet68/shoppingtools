-- CreateTable
CREATE TABLE `Section` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `data` JSON NOT NULL,
    `style` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Section_pageId_sort_idx`(`pageId`, `sort`),
    INDEX `Section_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
