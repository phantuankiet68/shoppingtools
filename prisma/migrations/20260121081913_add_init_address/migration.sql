-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,
    `type` ENUM('SHIPPING', 'BILLING') NOT NULL DEFAULT 'SHIPPING',
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `receiverName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NULL,
    `ward` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'VN',
    `postalCode` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `meta` JSON NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Address_userId_customerId_createdAt_idx`(`userId`, `customerId`, `createdAt`),
    INDEX `Address_customerId_type_isDefault_idx`(`customerId`, `type`, `isDefault`),
    INDEX `Address_status_updatedAt_idx`(`status`, `updatedAt`),
    INDEX `Address_country_city_idx`(`country`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Calendar` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Calendar_ownerId_idx`(`ownerId`),
    UNIQUE INDEX `Calendar_ownerId_name_key`(`ownerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CalendarEvent` (
    `id` VARCHAR(191) NOT NULL,
    `calendarId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `color` ENUM('BLUE', 'PURPLE', 'GREEN', 'AMBER', 'RED', 'TEAL') NOT NULL DEFAULT 'BLUE',
    `allDay` BOOLEAN NOT NULL DEFAULT false,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CalendarEvent_calendarId_startAt_idx`(`calendarId`, `startAt`),
    INDEX `CalendarEvent_creatorId_startAt_idx`(`creatorId`, `startAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `postal` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `tags` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Customer_userId_idx`(`userId`),
    INDEX `Customer_userId_name_idx`(`userId`, `name`),
    INDEX `Customer_userId_phone_idx`(`userId`, `phone`),
    INDEX `Customer_userId_email_idx`(`userId`, `email`),
    INDEX `Customer_isActive_idx`(`isActive`),
    UNIQUE INDEX `Customer_userId_phone_key`(`userId`, `phone`),
    UNIQUE INDEX `Customer_userId_email_key`(`userId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileFolder` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FileFolder_ownerId_parentId_idx`(`ownerId`, `parentId`),
    UNIQUE INDEX `FileFolder_ownerId_parentId_name_key`(`ownerId`, `parentId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoredFile` (
    `id` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StoredFile_storageKey_key`(`storageKey`),
    INDEX `StoredFile_ownerId_folderId_idx`(`ownerId`, `folderId`),
    INDEX `StoredFile_folderId_idx`(`folderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `Integration` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('payments', 'email', 'analytics', 'storage', 'ai', 'crm') NOT NULL,
    `description` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('disconnected', 'connected', 'error') NOT NULL DEFAULT 'disconnected',
    `config` JSON NOT NULL,
    `apiKeyEnc` VARCHAR(191) NULL,
    `apiSecretEnc` VARCHAR(191) NULL,
    `webhookUrlEnc` VARCHAR(191) NULL,
    `lastSyncAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Integration_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IntegrationLog` (
    `id` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(191) NOT NULL,
    `level` ENUM('info', 'warn', 'error') NOT NULL DEFAULT 'info',
    `message` VARCHAR(191) NOT NULL,
    `meta` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IntegrationLog_integrationId_createdAt_idx`(`integrationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MenuItem` (
    `id` VARCHAR(191) NOT NULL,
    `siteId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `path` VARCHAR(255) NULL,
    `icon` VARCHAR(100) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `locale` ENUM('vi', 'en', 'ja') NOT NULL DEFAULT 'vi',
    `setKey` ENUM('home', 'v1') NOT NULL DEFAULT 'home',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MenuItem_parentId_idx`(`parentId`),
    INDEX `MenuItem_siteId_locale_setKey_sortOrder_idx`(`siteId`, `locale`, `setKey`, `sortOrder`),
    INDEX `MenuItem_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('DIRECT', 'GROUP') NOT NULL DEFAULT 'DIRECT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastMessageAt` DATETIME(3) NULL,

    INDEX `Conversation_type_idx`(`type`),
    INDEX `Conversation_lastMessageAt_idx`(`lastMessageAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversationMember` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'MEMBER',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastReadAt` DATETIME(3) NULL,

    INDEX `ConversationMember_userId_idx`(`userId`),
    UNIQUE INDEX `ConversationMember_conversationId_userId_key`(`conversationId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FriendRequest` (
    `id` VARCHAR(191) NOT NULL,
    `fromId` VARCHAR(191) NOT NULL,
    `toId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `respondedAt` DATETIME(3) NULL,

    INDEX `FriendRequest_toId_status_idx`(`toId`, `status`),
    INDEX `FriendRequest_fromId_status_idx`(`fromId`, `status`),
    UNIQUE INDEX `FriendRequest_fromId_toId_key`(`fromId`, `toId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Block` (
    `id` VARCHAR(191) NOT NULL,
    `blockerId` VARCHAR(191) NOT NULL,
    `blockedId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Block_blockedId_idx`(`blockedId`),
    UNIQUE INDEX `Block_blockerId_blockedId_key`(`blockerId`, `blockedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `siteId` VARCHAR(191) NOT NULL,
    `menuItemId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `blocks` JSON NOT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDesc` VARCHAR(191) NULL,
    `coverImage` VARCHAR(191) NULL,
    `seoKeywords` VARCHAR(191) NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `noindex` BOOLEAN NOT NULL DEFAULT false,
    `nofollow` BOOLEAN NOT NULL DEFAULT false,
    `ogTitle` VARCHAR(191) NULL,
    `ogDescription` VARCHAR(191) NULL,
    `twitterCard` ENUM('SUMMARY', 'SUMMARY_LARGE_IMAGE') NOT NULL DEFAULT 'SUMMARY_LARGE_IMAGE',
    `sitemapChangefreq` ENUM('ALWAYS', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NEVER') NOT NULL DEFAULT 'WEEKLY',
    `sitemapPriority` DOUBLE NOT NULL DEFAULT 0.7,
    `structuredData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Page_siteId_idx`(`siteId`),
    INDEX `Page_siteId_updatedAt_idx`(`siteId`, `updatedAt`),
    INDEX `Page_menuItemId_idx`(`menuItemId`),
    UNIQUE INDEX `Page_siteId_slug_key`(`siteId`, `slug`),
    UNIQUE INDEX `Page_siteId_path_key`(`siteId`, `path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `direction` ENUM('CAPTURE', 'REFUND') NOT NULL DEFAULT 'CAPTURE',
    `status` ENUM('PENDING', 'PAID', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PAID',
    `method` ENUM('CARD', 'BANK', 'CASH', 'EWALLET', 'COD') NOT NULL DEFAULT 'CASH',
    `currency` ENUM('USD', 'VND') NOT NULL DEFAULT 'VND',
    `amountCents` INTEGER NOT NULL DEFAULT 0,
    `provider` ENUM('MANUAL', 'VNPAY', 'MOMO', 'ZALOPAY', 'STRIPE', 'PAYPAL', 'OTHER') NOT NULL DEFAULT 'MANUAL',
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idempotencyKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_idempotencyKey_key`(`idempotencyKey`),
    INDEX `Payment_userId_occurredAt_idx`(`userId`, `occurredAt`),
    INDEX `Payment_orderId_occurredAt_idx`(`orderId`, `occurredAt`),
    INDEX `Payment_status_idx`(`status`),
    INDEX `Payment_method_idx`(`method`),
    INDEX `Payment_reference_idx`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SpendCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('INVENTORY', 'SOFTWARE', 'MARKETING', 'OPS', 'TRAVEL', 'OFFICE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `SpendCategory_name_key`(`name`),
    INDEX `SpendCategory_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Merchant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `Merchant_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('EXPENSE', 'INCOME', 'ADJUSTMENT') NOT NULL DEFAULT 'EXPENSE',
    `status` ENUM('PENDING', 'PAID', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PAID',
    `method` ENUM('CARD', 'BANK', 'CASH', 'EWALLET', 'COD') NOT NULL DEFAULT 'CARD',
    `currency` ENUM('USD', 'VND') NOT NULL DEFAULT 'USD',
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `merchantId` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NULL,
    `subtotalCents` INTEGER NOT NULL DEFAULT 0,
    `taxCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL DEFAULT 0,
    `occurredAt` DATETIME(3) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `inventoryReceiptId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transaction_inventoryReceiptId_key`(`inventoryReceiptId`),
    INDEX `Transaction_userId_occurredAt_idx`(`userId`, `occurredAt`),
    INDEX `Transaction_status_idx`(`status`),
    INDEX `Transaction_categoryId_idx`(`categoryId`),
    INDEX `Transaction_merchantId_idx`(`merchantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionLine` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `qty` INTEGER NOT NULL DEFAULT 1,
    `unitPriceCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TransactionLine_transactionId_idx`(`transactionId`),
    INDEX `TransactionLine_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `parentId` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `icon` VARCHAR(191) NULL,
    `coverImage` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDesc` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductCategory_userId_idx`(`userId`),
    INDEX `ProductCategory_userId_parentId_idx`(`userId`, `parentId`),
    INDEX `ProductCategory_userId_parentId_sort_idx`(`userId`, `parentId`, `sort`),
    UNIQUE INDEX `ProductCategory_userId_slug_key`(`userId`, `slug`),
    UNIQUE INDEX `ProductCategory_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `priceCents` INTEGER NOT NULL DEFAULT 0,
    `costCents` INTEGER NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `hasVariants` BOOLEAN NOT NULL DEFAULT false,
    `displayPriceCents` INTEGER NOT NULL DEFAULT 0,
    `displayStock` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `categoryId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Product_userId_idx`(`userId`),
    INDEX `Product_userId_name_idx`(`userId`, `name`),
    INDEX `Product_userId_isActive_idx`(`userId`, `isActive`),
    INDEX `Product_userId_hasVariants_idx`(`userId`, `hasVariants`),
    INDEX `Product_userId_categoryId_isActive_idx`(`userId`, `categoryId`, `isActive`),
    UNIQUE INDEX `Product_userId_sku_key`(`userId`, `sku`),
    UNIQUE INDEX `Product_userId_slug_key`(`userId`, `slug`),
    UNIQUE INDEX `Product_userId_barcode_key`(`userId`, `barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Supplier_userId_idx`(`userId`),
    UNIQUE INDEX `Supplier_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryReceipt` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NULL,
    `poId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `currency` ENUM('USD', 'VND') NOT NULL DEFAULT 'USD',
    `receivedAt` DATETIME(3) NULL,
    `reference` VARCHAR(191) NULL,
    `subtotalCents` INTEGER NOT NULL DEFAULT 0,
    `taxCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `transactionId` VARCHAR(191) NULL,

    INDEX `InventoryReceipt_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `InventoryReceipt_userId_receivedAt_idx`(`userId`, `receivedAt`),
    INDEX `InventoryReceipt_status_idx`(`status`),
    INDEX `InventoryReceipt_supplierId_idx`(`supplierId`),
    INDEX `InventoryReceipt_userId_supplierId_idx`(`userId`, `supplierId`),
    INDEX `InventoryReceipt_poId_idx`(`poId`),
    INDEX `InventoryReceipt_userId_poId_idx`(`userId`, `poId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryReceiptItem` (
    `id` VARCHAR(191) NOT NULL,
    `receiptId` VARCHAR(191) NOT NULL,
    `poLineId` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `qty` INTEGER NOT NULL,
    `unitCostCents` INTEGER NOT NULL,
    `totalCents` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InventoryReceiptItem_receiptId_idx`(`receiptId`),
    INDEX `InventoryReceiptItem_productId_idx`(`productId`),
    INDEX `InventoryReceiptItem_variantId_idx`(`variantId`),
    INDEX `InventoryReceiptItem_productId_createdAt_idx`(`productId`, `createdAt`),
    INDEX `InventoryReceiptItem_variantId_createdAt_idx`(`variantId`, `createdAt`),
    INDEX `InventoryReceiptItem_poLineId_idx`(`poLineId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_idx`(`productId`),
    INDEX `ProductImage_productId_sort_idx`(`productId`, `sort`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductAttribute` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProductAttribute_productId_sort_idx`(`productId`, `sort`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'RETURNED') NOT NULL DEFAULT 'PENDING',
    `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'UNPAID',
    `fulfillmentStatus` ENUM('UNFULFILLED', 'PARTIAL', 'FULFILLED', 'CANCELLED', 'RETURNED') NOT NULL DEFAULT 'UNFULFILLED',
    `channel` ENUM('SHOP', 'MARKETPLACE', 'WHOLESALE') NOT NULL DEFAULT 'SHOP',
    `currency` ENUM('USD', 'VND') NOT NULL DEFAULT 'VND',
    `subtotalCents` INTEGER NOT NULL DEFAULT 0,
    `discountCents` INTEGER NOT NULL DEFAULT 0,
    `shippingCents` INTEGER NOT NULL DEFAULT 0,
    `taxCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL DEFAULT 0,
    `number` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `customerNameSnapshot` VARCHAR(191) NULL,
    `customerPhoneSnapshot` VARCHAR(191) NULL,
    `customerEmailSnapshot` VARCHAR(191) NULL,
    `shipToName` VARCHAR(191) NULL,
    `shipToPhone` VARCHAR(191) NULL,
    `shipToAddress1` VARCHAR(191) NULL,
    `shipToAddress2` VARCHAR(191) NULL,
    `shipToCity` VARCHAR(191) NULL,
    `shipToState` VARCHAR(191) NULL,
    `shipToPostal` VARCHAR(191) NULL,
    `shipToCountry` VARCHAR(191) NULL,
    `carrier` VARCHAR(191) NULL,
    `trackingCode` VARCHAR(191) NULL,
    `shippedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `returnedAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Order_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_paymentStatus_idx`(`paymentStatus`),
    INDEX `Order_fulfillmentStatus_idx`(`fulfillmentStatus`),
    INDEX `Order_userId_customerId_idx`(`userId`, `customerId`),
    UNIQUE INDEX `Order_userId_number_key`(`userId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `qty` INTEGER NOT NULL,
    `qtyReserved` INTEGER NOT NULL DEFAULT 0,
    `qtyShipped` INTEGER NOT NULL DEFAULT 0,
    `qtyReturned` INTEGER NOT NULL DEFAULT 0,
    `unitPriceCents` INTEGER NOT NULL,
    `subtotalCents` INTEGER NOT NULL DEFAULT 0,
    `discountCents` INTEGER NOT NULL DEFAULT 0,
    `taxCents` INTEGER NOT NULL DEFAULT 0,
    `totalCents` INTEGER NOT NULL DEFAULT 0,
    `skuSnapshot` VARCHAR(191) NULL,
    `productNameSnapshot` VARCHAR(191) NULL,
    `variantNameSnapshot` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_productId_idx`(`productId`),
    INDEX `OrderItem_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `beforeStock` INTEGER NULL,
    `afterStock` INTEGER NULL,
    `note` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `receiptItemId` VARCHAR(191) NULL,
    `orderItemId` VARCHAR(191) NULL,
    `idempotencyKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StockMovement_userId_occurredAt_idx`(`userId`, `occurredAt`),
    INDEX `StockMovement_productId_occurredAt_idx`(`productId`, `occurredAt`),
    INDEX `StockMovement_variantId_occurredAt_idx`(`variantId`, `occurredAt`),
    INDEX `StockMovement_orderItemId_occurredAt_idx`(`orderItemId`, `occurredAt`),
    UNIQUE INDEX `StockMovement_receiptItemId_key`(`receiptItemId`),
    UNIQUE INDEX `StockMovement_idempotencyKey_key`(`idempotencyKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `Profile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `backupEmail` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `role` ENUM('admin', 'staff', 'viewer') NOT NULL DEFAULT 'viewer',
    `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    `company` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `manager` VARCHAR(191) NULL,
    `hireDate` DATETIME(3) NULL,
    `gender` ENUM('male', 'female', 'other') NULL DEFAULT 'other',
    `locale` ENUM('vi', 'en', 'ja') NOT NULL DEFAULT 'vi',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    `dobMonth` VARCHAR(191) NULL,
    `dobDay` INTEGER NULL,
    `dobYear` INTEGER NULL,
    `twitter` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `github` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `slogan` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `twoFA` BOOLEAN NOT NULL DEFAULT false,
    `lastLoginAt` DATETIME(3) NULL,
    `lastLoginIp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Profile_userId_key`(`userId`),
    UNIQUE INDEX `Profile_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `originalPaymentId` VARCHAR(191) NULL,
    `refundPaymentId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `reason` ENUM('CUSTOMER_REQUEST', 'DAMAGED', 'WRONG_ITEM', 'NOT_RECEIVED', 'CANCELLED_ORDER', 'DUPLICATE_PAYMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `amountCents` INTEGER NOT NULL,
    `currency` ENUM('USD', 'VND') NOT NULL DEFAULT 'VND',
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `processedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Refund_refundPaymentId_key`(`refundPaymentId`),
    INDEX `Refund_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Refund_orderId_createdAt_idx`(`orderId`, `createdAt`),
    INDEX `Refund_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Refund_reason_createdAt_idx`(`reason`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefundItem` (
    `id` VARCHAR(191) NOT NULL,
    `refundId` VARCHAR(191) NOT NULL,
    `orderItemId` VARCHAR(191) NULL,
    `qty` INTEGER NOT NULL DEFAULT 1,
    `amountCents` INTEGER NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,

    INDEX `RefundItem_refundId_idx`(`refundId`),
    INDEX `RefundItem_orderItemId_idx`(`orderItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Site` (
    `id` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Site_domain_key`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `image` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `passwordUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `failedLoginCount` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `requireReauthAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_lockedUntil_idx`(`lockedUntil`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `tokenHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `revokedAt` DATETIME(3) NULL,
    `revokeReason` VARCHAR(191) NULL,

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_type_idx`(`userId`, `type`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    INDEX `Session_revokedAt_idx`(`revokedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TwoFactor` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `secretEnc` VARCHAR(191) NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `enabledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TwoFactor_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BackupCode` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BackupCode_userId_usedAt_idx`(`userId`, `usedAt`),
    UNIQUE INDEX `BackupCode_userId_codeHash_key`(`userId`, `codeHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoginAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NOT NULL,
    `fingerprint` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LoginAttempt_ip_createdAt_idx`(`ip`, `createdAt`),
    INDEX `LoginAttempt_email_createdAt_idx`(`email`, `createdAt`),
    INDEX `LoginAttempt_fingerprint_createdAt_idx`(`fingerprint`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` ENUM('ADMIN_LOGIN_SUCCESS', 'ADMIN_LOGIN_FAIL', 'ADMIN_LOGOUT', 'PASSWORD_CHANGE', 'TWOFA_ENABLED', 'TWOFA_DISABLED', 'TWOFA_CHALLENGE_FAIL', 'SESSION_REVOKED', 'SESSION_REVOKE_ALL', 'ADMIN_SENSITIVE_ACTION') NOT NULL,
    `result` ENUM('SUCCESS', 'FAIL') NOT NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `metaJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `AuditLog_action_createdAt_idx`(`action`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Calendar` ADD CONSTRAINT `Calendar_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_calendarId_fkey` FOREIGN KEY (`calendarId`) REFERENCES `Calendar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileFolder` ADD CONSTRAINT `FileFolder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `FileFolder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileFolder` ADD CONSTRAINT `FileFolder_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoredFile` ADD CONSTRAINT `StoredFile_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `FileFolder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoredFile` ADD CONSTRAINT `StoredFile_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageFolder` ADD CONSTRAINT `ImageFolder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageFolder` ADD CONSTRAINT `ImageFolder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ImageFolder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageAsset` ADD CONSTRAINT `ImageAsset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageAsset` ADD CONSTRAINT `ImageAsset_folderId_userId_fkey` FOREIGN KEY (`folderId`, `userId`) REFERENCES `ImageFolder`(`id`, `userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntegrationLog` ADD CONSTRAINT `IntegrationLog_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `Integration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `MenuItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMember` ADD CONSTRAINT `ConversationMember_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMember` ADD CONSTRAINT `ConversationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_blockerId_fkey` FOREIGN KEY (`blockerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_blockedId_fkey` FOREIGN KEY (`blockedId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SpendCategory` ADD CONSTRAINT `SpendCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Merchant` ADD CONSTRAINT `Merchant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `SpendCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionLine` ADD CONSTRAINT `TransactionLine_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionLine` ADD CONSTRAINT `TransactionLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ProductCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceipt` ADD CONSTRAINT `InventoryReceipt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceipt` ADD CONSTRAINT `InventoryReceipt_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceipt` ADD CONSTRAINT `InventoryReceipt_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceipt` ADD CONSTRAINT `InventoryReceipt_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceiptItem` ADD CONSTRAINT `InventoryReceiptItem_receiptId_fkey` FOREIGN KEY (`receiptId`) REFERENCES `InventoryReceipt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceiptItem` ADD CONSTRAINT `InventoryReceiptItem_poLineId_fkey` FOREIGN KEY (`poLineId`) REFERENCES `PurchaseOrderLine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceiptItem` ADD CONSTRAINT `InventoryReceiptItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReceiptItem` ADD CONSTRAINT `InventoryReceiptItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAttribute` ADD CONSTRAINT `ProductAttribute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantImage` ADD CONSTRAINT `ProductVariantImage_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_originalPaymentId_fkey` FOREIGN KEY (`originalPaymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_refundPaymentId_fkey` FOREIGN KEY (`refundPaymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundItem` ADD CONSTRAINT `RefundItem_refundId_fkey` FOREIGN KEY (`refundId`) REFERENCES `Refund`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundItem` ADD CONSTRAINT `RefundItem_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TwoFactor` ADD CONSTRAINT `TwoFactor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BackupCode` ADD CONSTRAINT `BackupCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
