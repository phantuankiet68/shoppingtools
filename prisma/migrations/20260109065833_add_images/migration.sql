-- CreateTable
CREATE TABLE `ImageFolder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ImageFolder_userId_parentId_idx`(`userId`, `parentId`),
    UNIQUE INDEX `ImageFolder_userId_parentId_name_key`(`userId`, `parentId`, `name`),
    UNIQUE INDEX `ImageFolder_id_userId_key`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImageAsset` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `tag` ENUM('NEW', 'HDR', 'AI', 'FAVORITE', 'COVER', 'BANNER', 'AVATAR', 'PRODUCT') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ImageAsset_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `ImageAsset_userId_tag_idx`(`userId`, `tag`),
    UNIQUE INDEX `ImageAsset_fileName_key`(`fileName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImageFolder` ADD CONSTRAINT `ImageFolder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageFolder` ADD CONSTRAINT `ImageFolder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ImageFolder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageAsset` ADD CONSTRAINT `ImageAsset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageAsset` ADD CONSTRAINT `ImageAsset_folderId_userId_fkey` FOREIGN KEY (`folderId`, `userId`) REFERENCES `ImageFolder`(`id`, `userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
