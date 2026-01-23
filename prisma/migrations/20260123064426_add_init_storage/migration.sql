-- CreateTable
CREATE TABLE `StorageIntegration` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('LOCAL', 'S3', 'R2') NOT NULL DEFAULT 'R2',
    `status` ENUM('DISCONNECTED', 'CONNECTED', 'ERROR') NOT NULL DEFAULT 'DISCONNECTED',
    `publicBaseUrl` VARCHAR(191) NOT NULL,
    `rootPrefix` VARCHAR(191) NOT NULL DEFAULT 'uploads/',
    `privateByDefault` BOOLEAN NOT NULL DEFAULT true,
    `signedUrlEnabled` BOOLEAN NOT NULL DEFAULT true,
    `signedUrlTtlSeconds` INTEGER NOT NULL DEFAULT 900,
    `maxUploadMb` INTEGER NOT NULL DEFAULT 50,
    `allowedMime` VARCHAR(191) NOT NULL DEFAULT 'image/*,application/pdf',
    `enableImageOptimization` BOOLEAN NOT NULL DEFAULT true,
    `localDir` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `bucket` VARCHAR(191) NULL,
    `endpointUrl` VARCHAR(191) NULL,
    `accessKeyIdEnc` VARCHAR(191) NULL,
    `secretAccessKeyEnc` VARCHAR(191) NULL,
    `cacheControl` VARCHAR(191) NOT NULL DEFAULT 'public,max-age=31536000,immutable',
    `purgeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `lastTestedAt` DATETIME(3) NULL,
    `lastError` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StorageIntegration_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StorageBucket` (
    `id` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(191) NOT NULL,
    `provider` ENUM('LOCAL', 'S3', 'R2') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `endpointUrl` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `objectsCount` INTEGER NOT NULL DEFAULT 0,
    `sizeBytes` BIGINT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StorageBucket_integrationId_provider_idx`(`integrationId`, `provider`),
    UNIQUE INDEX `StorageBucket_integrationId_provider_name_key`(`integrationId`, `provider`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StorageObject` (
    `id` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(191) NOT NULL,
    `provider` ENUM('LOCAL', 'S3', 'R2') NOT NULL,
    `bucket` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `sizeBytes` BIGINT NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
    `etag` VARCHAR(191) NULL,
    `checksum` VARCHAR(191) NULL,
    `lastModifiedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StorageObject_integrationId_key_idx`(`integrationId`, `key`),
    INDEX `StorageObject_integrationId_visibility_idx`(`integrationId`, `visibility`),
    INDEX `StorageObject_integrationId_updatedAt_idx`(`integrationId`, `updatedAt` DESC),
    UNIQUE INDEX `StorageObject_integrationId_provider_bucket_key_key`(`integrationId`, `provider`, `bucket`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StorageLog` (
    `id` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(191) NOT NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `level` ENUM('INFO', 'WARN', 'ERROR') NOT NULL DEFAULT 'INFO',
    `action` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `meta` JSON NULL,

    INDEX `StorageLog_integrationId_at_idx`(`integrationId`, `at` DESC),
    INDEX `StorageLog_integrationId_level_idx`(`integrationId`, `level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StorageIntegration` ADD CONSTRAINT `StorageIntegration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StorageBucket` ADD CONSTRAINT `StorageBucket_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `StorageIntegration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StorageObject` ADD CONSTRAINT `StorageObject_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `StorageIntegration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StorageLog` ADD CONSTRAINT `StorageLog_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `StorageIntegration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
