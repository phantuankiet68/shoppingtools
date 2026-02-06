-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 06, 2026 at 02:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shoppingtool`
--

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `customerId` varchar(191) NOT NULL,
  `label` varchar(191) DEFAULT NULL,
  `type` enum('SHIPPING','BILLING') NOT NULL DEFAULT 'SHIPPING',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `receiverName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `line1` varchar(191) NOT NULL,
  `line2` varchar(191) DEFAULT NULL,
  `ward` varchar(191) DEFAULT NULL,
  `district` varchar(191) DEFAULT NULL,
  `city` varchar(191) NOT NULL,
  `region` varchar(191) DEFAULT NULL,
  `country` varchar(191) NOT NULL DEFAULT 'VN',
  `postalCode` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` enum('ADMIN_LOGIN_SUCCESS','ADMIN_LOGIN_FAIL','ADMIN_LOGOUT','PASSWORD_CHANGE','TWOFA_ENABLED','TWOFA_DISABLED','TWOFA_CHALLENGE_FAIL','SESSION_REVOKED','SESSION_REVOKE_ALL','ADMIN_SENSITIVE_ACTION') NOT NULL,
  `result` enum('SUCCESS','FAIL') NOT NULL,
  `ip` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `metaJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metaJson`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auditlog`
--

INSERT INTO `auditlog` (`id`, `userId`, `action`, `result`, `ip`, `userAgent`, `metaJson`, `createdAt`) VALUES
('cmkqoo71g00047kqw8enz08zh', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN_LOGIN_SUCCESS', 'SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, '2026-01-23 09:33:37.058'),
('cmkulezpd00047krscmdmd6nf', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN_LOGIN_SUCCESS', 'SUCCESS', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, '2026-01-26 03:13:33.502'),
('cmkw17zm9000g7kmonz05t1c3', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN_LOGIN_SUCCESS', 'SUCCESS', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, '2026-01-27 03:23:46.831'),
('cmkxgpthi00047kacu5cqrcbz', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN_LOGIN_SUCCESS', 'SUCCESS', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, '2026-01-28 03:25:19.107'),
('cmla7c4sa00047k3w53dwxztx', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN_LOGIN_SUCCESS', 'SUCCESS', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, '2026-02-06 01:23:44.311');

-- --------------------------------------------------------

--
-- Table structure for table `backupcode`
--

CREATE TABLE `backupcode` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `codeHash` varchar(191) NOT NULL,
  `usedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `block`
--

CREATE TABLE `block` (
  `id` varchar(191) NOT NULL,
  `blockerId` varchar(191) NOT NULL,
  `blockedId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calendar`
--

CREATE TABLE `calendar` (
  `id` varchar(191) NOT NULL,
  `ownerId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `calendar`
--

INSERT INTO `calendar` (`id`, `ownerId`, `name`, `isDefault`, `createdAt`, `updatedAt`) VALUES
('cmkqooct000067kqw5wb3cay5', 'cmkqmpwry00007kgcqywncr0e', 'Default', 1, '2026-01-23 09:33:44.532', '2026-01-23 09:33:44.532');

-- --------------------------------------------------------

--
-- Table structure for table `calendarevent`
--

CREATE TABLE `calendarevent` (
  `id` varchar(191) NOT NULL,
  `calendarId` varchar(191) NOT NULL,
  `creatorId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `color` enum('BLUE','PURPLE','GREEN','AMBER','RED','TEAL') NOT NULL DEFAULT 'BLUE',
  `allDay` tinyint(1) NOT NULL DEFAULT 0,
  `startAt` datetime(3) NOT NULL,
  `endAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `calendarevent`
--

INSERT INTO `calendarevent` (`id`, `calendarId`, `creatorId`, `title`, `description`, `location`, `color`, `allDay`, `startAt`, `endAt`, `createdAt`, `updatedAt`) VALUES
('cmkqooo8v00087kqw8sf7zvyu', 'cmkqooct000067kqw5wb3cay5', 'cmkqmpwry00007kgcqywncr0e', 'hoc them', 'aaa', 'dddd', 'BLUE', 0, '2025-04-08 09:00:00.000', '2025-04-08 10:00:00.000', '2026-01-23 09:33:59.359', '2026-01-23 09:33:59.359'),
('cmkqooua6000a7kqw9almxy5r', 'cmkqooct000067kqw5wb3cay5', 'cmkqmpwry00007kgcqywncr0e', 'ssss', 'sdasdsa', 'sddd', 'BLUE', 0, '2025-04-09 09:00:00.000', '2025-04-09 10:00:00.000', '2026-01-23 09:34:07.182', '2026-01-23 09:34:07.182'),
('cmkqop3xq000c7kqwalz4bvsv', 'cmkqooct000067kqw5wb3cay5', 'cmkqmpwry00007kgcqywncr0e', 'sdsadsad', NULL, NULL, 'AMBER', 0, '2025-04-09 12:00:00.000', '2025-04-09 13:00:00.000', '2026-01-23 09:34:19.694', '2026-01-23 09:34:19.694'),
('cmkqopocl000e7kqwst4sb7r7', 'cmkqooct000067kqw5wb3cay5', 'cmkqmpwry00007kgcqywncr0e', 'ssdd sad', 'sad sa', 'sad sa', 'TEAL', 0, '2025-04-09 09:00:00.000', '2025-04-09 10:00:00.000', '2026-01-23 09:34:46.149', '2026-01-23 09:34:46.149');

-- --------------------------------------------------------

--
-- Table structure for table `conversation`
--

CREATE TABLE `conversation` (
  `id` varchar(191) NOT NULL,
  `type` enum('DIRECT','GROUP') NOT NULL DEFAULT 'DIRECT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastMessageAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversationmember`
--

CREATE TABLE `conversationmember` (
  `id` varchar(191) NOT NULL,
  `conversationId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'MEMBER',
  `joinedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `lastReadAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address1` varchar(191) DEFAULT NULL,
  `address2` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `state` varchar(191) DEFAULT NULL,
  `postal` varchar(191) DEFAULT NULL,
  `country` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `tags` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email`
--

CREATE TABLE `email` (
  `id` varchar(191) NOT NULL,
  `type` enum('SYSTEM','MARKETING','TRANSACTIONAL','INTERNAL') NOT NULL DEFAULT 'SYSTEM',
  `status` enum('DRAFT','QUEUED','SENDING','SENT','FAILED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `subject` varchar(191) NOT NULL,
  `previewText` varchar(191) DEFAULT NULL,
  `htmlContent` longtext DEFAULT NULL,
  `textContent` text DEFAULT NULL,
  `templateKey` varchar(191) DEFAULT NULL,
  `templateData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`templateData`)),
  `fromName` varchar(191) DEFAULT NULL,
  `fromEmail` varchar(191) DEFAULT NULL,
  `scheduledAt` datetime(3) DEFAULT NULL,
  `sentAt` datetime(3) DEFAULT NULL,
  `totalRecipients` int(11) NOT NULL DEFAULT 0,
  `successCount` int(11) NOT NULL DEFAULT 0,
  `failedCount` int(11) NOT NULL DEFAULT 0,
  `lastError` text DEFAULT NULL,
  `createdBy` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emailrecipient`
--

CREATE TABLE `emailrecipient` (
  `id` varchar(191) NOT NULL,
  `emailId` varchar(191) NOT NULL,
  `toEmail` varchar(191) NOT NULL,
  `toName` varchar(191) DEFAULT NULL,
  `status` enum('DRAFT','QUEUED','SENDING','SENT','FAILED','CANCELLED') NOT NULL DEFAULT 'QUEUED',
  `sentAt` datetime(3) DEFAULT NULL,
  `error` text DEFAULT NULL,
  `openedAt` datetime(3) DEFAULT NULL,
  `clickedAt` datetime(3) DEFAULT NULL,
  `providerMessageId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emailtemplate`
--

CREATE TABLE `emailtemplate` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `htmlContent` longtext DEFAULT NULL,
  `textContent` text DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `filefolder`
--

CREATE TABLE `filefolder` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `ownerId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friendrequest`
--

CREATE TABLE `friendrequest` (
  `id` varchar(191) NOT NULL,
  `fromId` varchar(191) NOT NULL,
  `toId` varchar(191) NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `respondedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `imageasset`
--

CREATE TABLE `imageasset` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `folderId` varchar(191) DEFAULT NULL,
  `originalName` varchar(191) NOT NULL,
  `fileName` varchar(191) NOT NULL,
  `mimeType` varchar(191) NOT NULL,
  `sizeBytes` int(11) NOT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `tag` enum('NEW','HDR','AI','FAVORITE','COVER','BANNER','AVATAR','PRODUCT') DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `imagefolder`
--

CREATE TABLE `imagefolder` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `integration`
--

CREATE TABLE `integration` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` enum('payments','email','analytics','storage','ai','crm') NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('disconnected','connected','error') NOT NULL DEFAULT 'disconnected',
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`config`)),
  `apiKeyEnc` varchar(191) DEFAULT NULL,
  `apiSecretEnc` varchar(191) DEFAULT NULL,
  `webhookUrlEnc` varchar(191) DEFAULT NULL,
  `lastSyncAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `integrationlog`
--

CREATE TABLE `integrationlog` (
  `id` varchar(191) NOT NULL,
  `integrationId` varchar(191) NOT NULL,
  `level` enum('info','warn','error') NOT NULL DEFAULT 'info',
  `message` varchar(191) NOT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`meta`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventoryreceipt`
--

CREATE TABLE `inventoryreceipt` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `supplierId` varchar(191) DEFAULT NULL,
  `poId` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','RECEIVED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `currency` enum('USD','VND') NOT NULL DEFAULT 'USD',
  `receivedAt` datetime(3) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `subtotalCents` int(11) NOT NULL DEFAULT 0,
  `taxCents` int(11) NOT NULL DEFAULT 0,
  `totalCents` int(11) NOT NULL DEFAULT 0,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `transactionId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventoryreceiptitem`
--

CREATE TABLE `inventoryreceiptitem` (
  `id` varchar(191) NOT NULL,
  `receiptId` varchar(191) NOT NULL,
  `poLineId` varchar(191) DEFAULT NULL,
  `productId` varchar(191) NOT NULL,
  `variantId` varchar(191) DEFAULT NULL,
  `qty` int(11) NOT NULL,
  `unitCostCents` int(11) NOT NULL,
  `totalCents` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loginattempt`
--

CREATE TABLE `loginattempt` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `ip` varchar(191) NOT NULL,
  `fingerprint` varchar(191) DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loginattempt`
--

INSERT INTO `loginattempt` (`id`, `email`, `ip`, `fingerprint`, `success`, `createdAt`) VALUES
('cmkqoo6vu00007kqw1qll00x8', 'admin@example.com', '::1', NULL, 0, '2026-01-23 09:33:36.859'),
('cmkuleze300007krsf0wpvcku', 'admin@example.com', '::ffff:192.168.100.10', NULL, 0, '2026-01-26 03:13:33.098'),
('cmkw17zer000c7kmoqwqzr9r6', 'admin@example.com', '::ffff:192.168.100.10', NULL, 0, '2026-01-27 03:23:46.563'),
('cmkxgptb500007kacjudh9ned', 'admin@example.com', '::ffff:192.168.100.10', NULL, 0, '2026-01-28 03:25:18.879'),
('cmla7c4lj00007k3wksnwqs1e', 'admin@example.com', '::ffff:192.168.100.10', NULL, 0, '2026-02-06 01:23:44.070');

-- --------------------------------------------------------

--
-- Table structure for table `menuitem`
--

CREATE TABLE `menuitem` (
  `id` varchar(191) NOT NULL,
  `siteId` varchar(191) NOT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  `locale` enum('vi','en','ja') NOT NULL DEFAULT 'vi',
  `setKey` enum('home','v1') NOT NULL DEFAULT 'home',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menuitem`
--

INSERT INTO `menuitem` (`id`, `siteId`, `parentId`, `title`, `path`, `icon`, `sortOrder`, `visible`, `locale`, `setKey`, `createdAt`, `updatedAt`) VALUES
('182hwp1uhyy', 'sitea01', 'vi8140e', 'Theme', '/admin/builder/theme', 'bi bi-credit-card-2-front', 4, 1, 'en', 'v1', '2026-01-27 06:14:05.620', '2026-01-27 06:25:20.697'),
('1mgdsgpegjf', 'sitea01', 'vi8140e', 'Pages', '/admin/builder/pages', 'bi bi-file-break-fill', 1, 1, 'en', 'v1', '2026-01-27 06:09:21.405', '2026-01-27 06:25:20.692'),
('1ye4b7h77fb', 'sitea01', 'vi8140e', 'Blocks', '/admin/builder/blocks', 'bi bi-blockquote-left', 3, 1, 'en', 'v1', '2026-01-27 06:14:05.609', '2026-01-27 06:25:20.695'),
('2lyhu4wlivf', 'sitea01', 'bw4ry1m', 'Product', '/admin/products/product', 'bi bi-cast', 1, 1, 'en', 'v1', '2026-01-27 06:20:55.625', '2026-01-27 06:25:20.707'),
('8ip8hgnsiqe', 'sitea01', 'vi8140e', 'Integrations', '/admin/builder/integrations', 'bi bi-droplet-fill', 7, 1, 'en', 'v1', '2026-01-27 06:18:05.058', '2026-01-27 06:25:20.704'),
('bw4ry1m', 'sitea01', NULL, 'Products', '/admin/products', 'bi bi-cast', 3, 1, 'en', 'v1', '2026-01-27 06:20:55.623', '2026-01-27 06:25:20.706'),
('cir4qxrrl87', 'sitea01', 'vi8140e', 'Assets', '/admin/builder/assets', 'bi bi-filetype-sass', 5, 1, 'en', 'v1', '2026-01-27 06:14:05.622', '2026-01-27 06:25:20.699'),
('ipb1qkx04us', 'sitea01', 'vi8140e', 'Sections', '/admin/builder/sections', 'bi bi-sign-intersection-side', 2, 1, 'en', 'v1', '2026-01-27 06:09:21.413', '2026-01-27 06:25:20.693'),
('s_bw8ilet', 'sitea01', NULL, 'Home', '/home', '', 1, 1, 'en', 'home', '2026-01-26 09:31:39.027', '2026-01-26 09:50:50.829'),
('s_i7b6m2i', 'sitea01', NULL, 'Dashboard', '/admin', 'bi bi-speedometer2', 1, 1, 'en', 'v1', '2026-01-27 06:06:15.681', '2026-01-27 06:25:20.682'),
('tkbo9q5cxti', 'sitea01', 'bw4ry1m', 'Category', '/admin/products/category', 'bi bi-bookmark', 2, 1, 'en', 'v1', '2026-01-27 06:24:47.119', '2026-01-27 06:25:20.709'),
('txa1v9j5rbm', 'sitea01', 'bw4ry1m', 'Variants', '/admin/products/variants', 'bi bi-receipt', 3, 1, 'en', 'v1', '2026-01-27 06:24:47.127', '2026-01-27 06:25:20.711'),
('vi8140e', 'sitea01', NULL, 'Builder', '/admin/builder', 'bi bi-building', 2, 1, 'en', 'v1', '2026-01-27 06:07:48.293', '2026-01-27 06:25:20.690'),
('wdlp6ylujrr', 'sitea02', NULL, 'Home', '/home', '', 1, 1, 'en', 'home', '2026-01-28 05:20:28.460', '2026-01-28 05:20:28.460'),
('zwpn26v8kyi', 'sitea01', 'vi8140e', 'Menu', '/admin/builder/menu', 'bi bi-menu-app-fill', 6, 1, 'en', 'v1', '2026-01-27 06:17:18.129', '2026-01-27 06:25:20.702');

-- --------------------------------------------------------

--
-- Table structure for table `merchant`
--

CREATE TABLE `merchant` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `website` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` varchar(191) NOT NULL,
  `conversationId` varchar(191) NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `text` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `customerId` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','DELIVERING','DELIVERED','CANCELLED','RETURNED') NOT NULL DEFAULT 'PENDING',
  `paymentStatus` enum('UNPAID','PARTIAL','PAID','REFUNDED','CANCELLED') NOT NULL DEFAULT 'UNPAID',
  `fulfillmentStatus` enum('UNFULFILLED','PARTIAL','FULFILLED','CANCELLED','RETURNED') NOT NULL DEFAULT 'UNFULFILLED',
  `channel` enum('SHOP','MARKETPLACE','WHOLESALE') NOT NULL DEFAULT 'SHOP',
  `currency` enum('USD','VND') NOT NULL DEFAULT 'VND',
  `subtotalCents` int(11) NOT NULL DEFAULT 0,
  `discountCents` int(11) NOT NULL DEFAULT 0,
  `shippingCents` int(11) NOT NULL DEFAULT 0,
  `taxCents` int(11) NOT NULL DEFAULT 0,
  `totalCents` int(11) NOT NULL DEFAULT 0,
  `number` varchar(191) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `customerNameSnapshot` varchar(191) DEFAULT NULL,
  `customerPhoneSnapshot` varchar(191) DEFAULT NULL,
  `customerEmailSnapshot` varchar(191) DEFAULT NULL,
  `shipToName` varchar(191) DEFAULT NULL,
  `shipToPhone` varchar(191) DEFAULT NULL,
  `shipToAddress1` varchar(191) DEFAULT NULL,
  `shipToAddress2` varchar(191) DEFAULT NULL,
  `shipToCity` varchar(191) DEFAULT NULL,
  `shipToState` varchar(191) DEFAULT NULL,
  `shipToPostal` varchar(191) DEFAULT NULL,
  `shipToCountry` varchar(191) DEFAULT NULL,
  `carrier` varchar(191) DEFAULT NULL,
  `trackingCode` varchar(191) DEFAULT NULL,
  `shippedAt` datetime(3) DEFAULT NULL,
  `deliveredAt` datetime(3) DEFAULT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `returnedAt` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `tags` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orderitem`
--

CREATE TABLE `orderitem` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `variantId` varchar(191) DEFAULT NULL,
  `qty` int(11) NOT NULL,
  `qtyReserved` int(11) NOT NULL DEFAULT 0,
  `qtyShipped` int(11) NOT NULL DEFAULT 0,
  `qtyReturned` int(11) NOT NULL DEFAULT 0,
  `unitPriceCents` int(11) NOT NULL,
  `subtotalCents` int(11) NOT NULL DEFAULT 0,
  `discountCents` int(11) NOT NULL DEFAULT 0,
  `taxCents` int(11) NOT NULL DEFAULT 0,
  `totalCents` int(11) NOT NULL DEFAULT 0,
  `skuSnapshot` varchar(191) DEFAULT NULL,
  `productNameSnapshot` varchar(191) DEFAULT NULL,
  `variantNameSnapshot` varchar(191) DEFAULT NULL,
  `note` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `page`
--

CREATE TABLE `page` (
  `id` varchar(191) NOT NULL,
  `siteId` varchar(191) NOT NULL,
  `menuItemId` varchar(191) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `path` varchar(191) NOT NULL,
  `status` enum('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `blocks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`blocks`)),
  `seoTitle` varchar(191) DEFAULT NULL,
  `seoDesc` varchar(191) DEFAULT NULL,
  `coverImage` varchar(191) DEFAULT NULL,
  `seoKeywords` varchar(191) DEFAULT NULL,
  `canonicalUrl` varchar(191) DEFAULT NULL,
  `noindex` tinyint(1) NOT NULL DEFAULT 0,
  `nofollow` tinyint(1) NOT NULL DEFAULT 0,
  `ogTitle` varchar(191) DEFAULT NULL,
  `ogDescription` varchar(191) DEFAULT NULL,
  `twitterCard` enum('SUMMARY','SUMMARY_LARGE_IMAGE') NOT NULL DEFAULT 'SUMMARY_LARGE_IMAGE',
  `sitemapChangefreq` enum('ALWAYS','HOURLY','DAILY','WEEKLY','MONTHLY','YEARLY','NEVER') NOT NULL DEFAULT 'WEEKLY',
  `sitemapPriority` double NOT NULL DEFAULT 0.7,
  `structuredData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`structuredData`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `page`
--

INSERT INTO `page` (`id`, `siteId`, `menuItemId`, `title`, `slug`, `path`, `status`, `blocks`, `seoTitle`, `seoDesc`, `coverImage`, `seoKeywords`, `canonicalUrl`, `noindex`, `nofollow`, `ogTitle`, `ogDescription`, `twitterCard`, `sitemapChangefreq`, `sitemapPriority`, `structuredData`, `createdAt`, `updatedAt`) VALUES
('cmkqotwur000f7kqwyfhgusc0', 'sitea01', NULL, 'Home', 'home', '/home', 'PUBLISHED', '[{\"kind\":\"TopbarPro\",\"props\":{\"logoText\":\"BookStore\",\"phoneNumber\":\"1900 1234\",\"email\":\"support@example.com\",\"socialLinks\":[{\"icon\":\"facebook\",\"href\":\"#\"},{\"icon\":\"tiktok\",\"href\":\"#\"},{\"icon\":\"youtube\",\"href\":\"#\"}],\"sticky\":false,\"preview\":false,\"message\":\"Freeship toàn quốc cho đơn từ 299.000₫\",\"regionLabel\":\"KV: Hồ Chí Minh\",\"backgroundColor\":\"#fff8ed\"}},{\"kind\":\"TopbarOrange2025\",\"props\":{\"brandTitle\":\"Aurora Orange\",\"brandSubtitle\":\"Topbar 2025 – màu cam nổi bật\",\"regionPrefix\":\"KV:\",\"regionValue\":\"Hồ Chí Minh\",\"newsLabel\":\"News\",\"tickerItems\":[{\"text\":\"Ưu đãi tháng này giảm đến 50%.\",\"tag\":\"Hot\"},{\"text\":\"Hỗ trợ khách hàng 24/7 – phản hồi nhanh.\",\"tag\":\"Support\"},{\"text\":\"Thêm nhiều sản phẩm mới vừa cập nhật.\",\"tag\":\"New\"}],\"links\":[{\"label\":\"Hỗ trợ\",\"href\":\"#\",\"icon\":\"bi-life-preserver\"},{\"label\":\"Theo dõi đơn\",\"href\":\"#\",\"icon\":\"bi-truck\"},{\"label\":\"Tài khoản\",\"href\":\"#\",\"icon\":\"bi-person-circle\"}],\"showStatus\":true,\"statusText\":\"Online\",\"backgroundColor\":\"#f97316\"}}]', 'Home', 'Page \"Home\" – information, description, and detailed content.', 'http://localhost:3000/og-default.jpg', 'home, zento, ui, builder, form, bootstrap', 'http://localhost:3000/home', 0, 0, 'Home', 'Page \"Home\" – information, description, and detailed content.', 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, '{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\",\"name\":\"Home\",\"description\":\"Page \\\"Home\\\" – information, description, and detailed content.\",\"url\":\"http://localhost:3000/home\",\"isPartOf\":{\"@type\":\"WebSite\",\"url\":\"http://localhost:3000\"}}', '2026-01-23 09:38:03.792', '2026-01-26 07:43:04.372'),
('cmkuuzu0a00007kgwpfz6dyqc', 'sitea01', NULL, 'Dashboard', 'admin', '/admin', 'DRAFT', '[]', 'Dashboard', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-26 07:41:42.438', '2026-01-27 06:25:20.727'),
('cmkuuzu1e00017kgwpbnv2197', 'sitea01', NULL, 'Pages', 'pages', '/admin/builder/pages', 'DRAFT', '[]', 'Pages', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-26 07:41:42.482', '2026-01-27 06:25:20.747'),
('cmkuv1l8i00037kgwclc9uvpd', 'sitea01', NULL, 'Login', 'login', '/login', 'DRAFT', '[]', 'Login', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-26 07:43:04.386', '2026-01-26 09:31:39.084'),
('cmkuv39p900047kgwbxmqzi4k', 'sitea01', NULL, 'Dashboard', 'dashboard', '/dashboard', 'DRAFT', '[]', 'Dashboard', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-26 07:44:22.749', '2026-01-26 07:46:19.486'),
('cmkuv5rsr00087kgw9n0xzz8q', 'sitea01', NULL, 'Assets', 'assets', '/admin/builder/assets', 'DRAFT', '[]', 'Assets', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-26 07:46:19.515', '2026-01-27 06:25:20.770'),
('cmkuv5rsx00097kgwv7xoaang', 'sitea01', NULL, 'Category', 'category', '/admin/products/category', 'DRAFT', '[]', 'Category', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-26 07:46:19.522', '2026-01-27 06:25:20.791'),
('cmkuzloal000c7kgw98uq8ghn', 'sitea01', NULL, 'Home', 'blog', '/blog', 'DRAFT', '[]', 'Home', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-26 09:50:39.934', '2026-01-26 09:50:39.934'),
('cmkw72xd500517kmoz0cochu2', 'sitea01', NULL, 'Builder', 'builder', '/admin/builder', 'DRAFT', '[]', 'Builder', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:07:48.330', '2026-01-27 06:25:20.732'),
('cmkw74x7t00557kmo3znd1cnf', 'sitea01', NULL, 'Sections', 'sections', '/admin/builder/sections', 'DRAFT', '[]', 'Sections', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:09:21.449', '2026-01-27 06:25:20.755'),
('cmkw7b0j8005a7kmo0392bs5e', 'sitea01', NULL, 'Blocks', 'blocks', '/admin/builder/blocks', 'DRAFT', '[]', 'Blocks', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:14:05.684', '2026-01-27 06:25:20.760'),
('cmkw7b0jd005b7kmo7w5up80f', 'sitea01', NULL, 'Theme', 'theme', '/admin/builder/theme', 'DRAFT', '[]', 'Theme', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:14:05.690', '2026-01-27 06:25:20.766'),
('cmkw7f52g005r7kmo95879t68', 'sitea01', NULL, 'Menu', 'menu', '/admin/builder/menu', 'DRAFT', '[]', 'Menu', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:17:18.184', '2026-01-27 06:25:20.774'),
('cmkw7g59y00607kmo550pv6uh', 'sitea01', NULL, 'Integrations', 'integrations', '/admin/builder/integrations', 'DRAFT', '[]', 'Integrations', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:18:05.110', '2026-01-27 06:25:20.779'),
('cmkw7jsw8006a7kmo72h5wowb', 'sitea01', NULL, 'Products', 'products', '/admin/products', 'DRAFT', '[]', 'Products', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:20:55.688', '2026-01-27 06:25:20.783'),
('cmkw7jswc006b7kmok3tdhec6', 'sitea01', NULL, 'Product', 'product', '/admin/products/product', 'DRAFT', '[]', 'Product', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:20:55.693', '2026-01-27 06:25:20.787'),
('cmkw7oriw00707kmom5by8ihb', 'sitea01', NULL, 'Inventory', 'inventory', '/admin/products/inventory', 'DRAFT', '[]', 'Inventory', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:24:47.192', '2026-01-27 06:24:47.192'),
('cmkw7phgb007d7kmo4i1lrha3', 'sitea01', NULL, 'Variants', 'variants', '/admin/products/variants', 'DRAFT', '[]', 'Variants', '', NULL, NULL, NULL, 0, 0, NULL, NULL, 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, NULL, '2026-01-27 06:25:20.795', '2026-01-27 06:25:20.795'),
('cmkxktwz500007kpoj64urwky', 'sitea02', NULL, 'Home', 'home', '/home', 'PUBLISHED', '[{\"kind\":\"TopbarPro\",\"props\":{\"logoText\":\"BookStore\",\"phoneNumber\":\"1900 1234\",\"email\":\"support@example.com\",\"socialLinks\":[{\"icon\":\"facebook\",\"href\":\"#\"},{\"icon\":\"tiktok\",\"href\":\"#\"},{\"icon\":\"youtube\",\"href\":\"#\"}],\"sticky\":false,\"preview\":false,\"message\":\"Freeship toàn quốc cho đơn từ 299.000₫\",\"regionLabel\":\"KV: Hồ Chí Minh\",\"backgroundColor\":\"#fff8ed\"}},{\"kind\":\"Topbar2026\",\"props\":{\"logoIconClass\":\"bi bi-sparkles\",\"brandTitle\":\"Aurora Hub\",\"brandSubtitle\":\"Nền tảng Mua sắm thế hệ mới.\",\"showRegionButton\":true,\"regionLabel\":\"KV: Hồ Chí Minh\",\"regionIconClass\":\"bi bi-geo-alt\",\"regionChevronIconClass\":\"bi bi-chevron-down\",\"showTicker\":true,\"tickerLabel\":\"UPDATES\",\"tickerItems\":[{\"text\":\"AI gợi ý danh mục sách dựa trên tâm trạng đọc hôm nay.\",\"badge\":\"AI Mode\"},{\"text\":\"Không gian đọc ảo 3D – đồng bộ tiến độ giữa mobile và web trong thời gian thực.\",\"badge\":\"Space Room\"},{\"text\":\"Chế độ Focus 25 phút – hệ thống tự ẩn thông báo và ghi lại lịch sử tập trung.\",\"badge\":\"Focus 25\'\"}],\"showStatus\":true,\"statusText\":\"Trực tuyến 24/7\",\"statusDotColor\":\"#22c55e\",\"links\":[{\"label\":\"Trung tâm hỗ trợ\",\"href\":\"#\",\"iconClass\":\"bi bi-life-preserver\"},{\"label\":\"Theo dõi đơn\",\"href\":\"#\",\"iconClass\":\"bi bi-truck\"},{\"label\":\"Tài khoản\",\"href\":\"#\",\"iconClass\":\"bi bi-person-circle\"}],\"preview\":false}},{\"kind\":\"TopbarMultiKind\",\"props\":{\"logoIconClass\":\"bi bi-stars\",\"brandTitle\":\"Aurora Neo\",\"brandSubtitle\":\"Trải nghiệm mua sắm đa vũ trụ 2026.\",\"showRegionButton\":true,\"regionLabel\":\"KV: Hồ Chí Minh\",\"regionIconClass\":\"bi bi-geo-alt\",\"regionChevronIconClass\":\"bi bi-chevron-down\",\"showTicker\":true,\"tickerLabel\":\"LIVE UPDATE\",\"tickerItems\":[{\"text\":\"Giao nhanh 2H + gợi ý AI theo lịch sử đọc của bạn.\",\"badge\":\"Smart Shipping\"},{\"text\":\"Freeship đơn từ 200.000₫ – áp dụng toàn quốc.\",\"badge\":\"Freeship 2026\"},{\"text\":\"Chế độ \'Mood Mode\' – chọn sách theo tâm trạng trong ngày.\",\"badge\":\"Mood Reading\"}],\"showStatus\":false,\"statusText\":\"Online\",\"statusDotColor\":\"#22c55e\",\"links\":[{\"label\":\"Hỗ trợ\",\"href\":\"#\",\"iconClass\":\"bi bi-life-preserver\"},{\"label\":\"Theo dõi đơn\",\"href\":\"#\",\"iconClass\":\"bi bi-truck\"},{\"label\":\"Tài khoản\",\"href\":\"#\",\"iconClass\":\"bi bi-person-circle\"}],\"preview\":false}}]', 'Home', 'Page \"Home\" – information, description, and detailed content.', 'http://192.168.100.10:3000/og-default.jpg', 'home, zento, ui, builder, form, bootstrap', 'http://192.168.100.10:3000/home', 0, 0, 'Home', 'Page \"Home\" – information, description, and detailed content.', 'SUMMARY_LARGE_IMAGE', 'WEEKLY', 0.7, '{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\",\"name\":\"Home\",\"description\":\"Page \\\"Home\\\" – information, description, and detailed content.\",\"url\":\"http://192.168.100.10:3000/home\",\"isPartOf\":{\"@type\":\"WebSite\",\"url\":\"http://192.168.100.10:3000\"}}', '2026-01-28 05:20:28.722', '2026-01-28 05:21:00.102');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `direction` enum('CAPTURE','REFUND') NOT NULL DEFAULT 'CAPTURE',
  `status` enum('PENDING','PAID','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PAID',
  `method` enum('CARD','BANK','CASH','EWALLET','COD') NOT NULL DEFAULT 'CASH',
  `currency` enum('USD','VND') NOT NULL DEFAULT 'VND',
  `amountCents` int(11) NOT NULL DEFAULT 0,
  `provider` enum('MANUAL','VNPAY','MOMO','ZALOPAY','STRIPE','PAYPAL','OTHER') NOT NULL DEFAULT 'MANUAL',
  `reference` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `occurredAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `idempotencyKey` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `sku` varchar(191) NOT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `priceCents` int(11) NOT NULL DEFAULT 0,
  `costCents` int(11) NOT NULL DEFAULT 0,
  `stock` int(11) NOT NULL DEFAULT 0,
  `hasVariants` tinyint(1) NOT NULL DEFAULT 0,
  `displayPriceCents` int(11) NOT NULL DEFAULT 0,
  `displayStock` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `categoryId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `userId`, `name`, `slug`, `description`, `sku`, `barcode`, `priceCents`, `costCents`, `stock`, `hasVariants`, `displayPriceCents`, `displayStock`, `isActive`, `categoryId`, `createdAt`, `updatedAt`) VALUES
('cmkvwi9t200017kmo65ka4o1b', 'cmkqmpwry00007kgcqywncr0e', '[DEAL MỞ BÁN] Áo Khoác Hoodie Zip Form Boxy In Lụa Viralwear Unisex Chất Nỉ 2 Da Mặc Được 4 Mùa', 'deal-mo-ban-ao-khoac-hoodie-zip-form-boxy-in-lua-viralwear-unisex-chat-ni-2-da-mac-duoc-4-mua', '<p>* Áo khoác hoodie zip form boxy in lụa Viralwear unisex. Thiết kế đơn giản, phù hợp cho cả nam và nữ. Chất liệu nỉ 2 da, mặc được 4 mùa.</p><p>Có 4 phối màu: Đen, Xám Tiêu, Xanh Navi, Nâu. Bạn có thể chọn màu yêu thích để</p><p>phù hợp với phong cách cá nhân.</p><p>Áo khoác này là lựa chọn lý tưởng cho mọi mùa trong năm. Chất liệu nỉ 2 da</p><p>mang lại sự ấm áp và thoải mái. Phù hợp cho nhiều hoạt động hàng ngày.</p>', 'SP_001', 'SP_001', 300000, 200000, 50, 0, 0, 0, 1, 'cmkw3hs82001v7kmoap3csxbx', '2026-01-27 01:11:48.516', '2026-01-27 04:59:15.163');

-- --------------------------------------------------------

--
-- Table structure for table `productattribute`
--

CREATE TABLE `productattribute` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` varchar(191) NOT NULL,
  `sort` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productcategory`
--

CREATE TABLE `productcategory` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `parentId` varchar(191) DEFAULT NULL,
  `sort` int(11) NOT NULL DEFAULT 0,
  `icon` varchar(191) DEFAULT NULL,
  `coverImage` varchar(191) DEFAULT NULL,
  `seoTitle` varchar(191) DEFAULT NULL,
  `seoDesc` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productcategory`
--

INSERT INTO `productcategory` (`id`, `userId`, `name`, `slug`, `isActive`, `parentId`, `sort`, `icon`, `coverImage`, `seoTitle`, `seoDesc`, `createdAt`, `updatedAt`) VALUES
('cmkw29q2b000j7kmobivitqzj', 'cmkqmpwry00007kgcqywncr0e', 'Skincare', 'skincare', 1, NULL, 10, NULL, NULL, NULL, NULL, '2026-01-27 03:53:07.379', '2026-01-27 04:05:11.173'),
('cmkw29wmi000l7kmom57dqm8g', 'cmkqmpwry00007kgcqywncr0e', 'Makeup', 'makeup', 1, NULL, 20, NULL, NULL, NULL, NULL, '2026-01-27 03:53:15.882', '2026-01-27 03:53:15.882'),
('cmkw2a6kk000n7kmow2j5j8pp', 'cmkqmpwry00007kgcqywncr0e', 'Hair Care', 'hair-care', 1, NULL, 30, NULL, NULL, NULL, NULL, '2026-01-27 03:53:28.773', '2026-01-27 03:53:28.773'),
('cmkw2acfh000p7kmoqzabfa24', 'cmkqmpwry00007kgcqywncr0e', 'Body Care', 'body-care', 1, NULL, 40, NULL, NULL, NULL, NULL, '2026-01-27 03:53:36.366', '2026-01-27 03:53:36.366'),
('cmkw2ak7y000r7kmoae6lffp5', 'cmkqmpwry00007kgcqywncr0e', 'Personal Care', 'personal-care', 1, NULL, 50, NULL, NULL, NULL, NULL, '2026-01-27 03:53:46.462', '2026-01-27 03:53:46.462'),
('cmkw2aqwk000t7kmom6d3cvez', 'cmkqmpwry00007kgcqywncr0e', 'Tools & Accessories', 'tools-accessories', 1, NULL, 60, NULL, NULL, NULL, NULL, '2026-01-27 03:53:55.125', '2026-01-27 03:53:55.125'),
('cmkw2b9ls000v7kmo3vyh5z5p', 'cmkqmpwry00007kgcqywncr0e', 'Cosmetics by target audience', 'cosmetics-by-target-audience', 1, NULL, 70, NULL, NULL, NULL, NULL, '2026-01-27 03:54:19.360', '2026-01-27 03:54:19.360'),
('cmkw2brdl000x7kmozrhxvejf', 'cmkqmpwry00007kgcqywncr0e', 'customer needs', 'customer-needs', 1, NULL, 80, NULL, NULL, NULL, NULL, '2026-01-27 03:54:42.393', '2026-01-27 03:54:42.393'),
('cmkw2cdp7000z7kmoli840jv9', 'cmkqmpwry00007kgcqywncr0e', 'Trademark', 'trademark', 1, NULL, 90, NULL, NULL, NULL, NULL, '2026-01-27 03:55:11.324', '2026-01-27 03:55:11.324'),
('cmkw2csuy00117kmotvhfqrob', 'cmkqmpwry00007kgcqywncr0e', 'New product', 'new-product', 1, NULL, 100, NULL, NULL, NULL, NULL, '2026-01-27 03:55:30.970', '2026-01-27 03:55:30.970'),
('cmkw2ullk00137kmoo3s4rcd6', 'cmkqmpwry00007kgcqywncr0e', 'Cleansing', 'cleansing', 1, 'cmkw29q2b000j7kmobivitqzj', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:09:21.368', '2026-01-27 04:09:21.368'),
('cmkw2urxh00157kmor1aege09', 'cmkqmpwry00007kgcqywncr0e', 'Facial Cleanser', 'facial-cleanser', 1, 'cmkw2ullk00137kmoo3s4rcd6', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:09:29.574', '2026-01-27 04:09:29.574'),
('cmkw2v42u00177kmowklllo8e', 'cmkqmpwry00007kgcqywncr0e', 'Makeup Remover', 'makeup-remover', 1, 'cmkw2ullk00137kmoo3s4rcd6', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:09:45.318', '2026-01-27 04:09:45.318'),
('cmkw2vavc00197kmozrgegfqe', 'cmkqmpwry00007kgcqywncr0e', 'Exfoliator', 'exfoliator', 1, 'cmkw2ullk00137kmoo3s4rcd6', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:09:54.121', '2026-01-27 04:09:54.121'),
('cmkw2yiao001b7kmoiujgqxvu', 'cmkqmpwry00007kgcqywncr0e', 'Balancing & Treatment', 'balancing-treatment', 1, 'cmkw29q2b000j7kmobivitqzj', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:12:23.712', '2026-01-27 04:12:23.712'),
('cmkw2youx001d7kmoxb3b2mgf', 'cmkqmpwry00007kgcqywncr0e', 'Toner', 'toner', 1, 'cmkw2yiao001b7kmoiujgqxvu', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:12:32.218', '2026-01-27 04:12:32.218'),
('cmkw2yx0g001f7kmomoyqqa14', 'cmkqmpwry00007kgcqywncr0e', 'Essence / Serum', 'essence-serum', 1, 'cmkw2yiao001b7kmoiujgqxvu', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:12:42.785', '2026-01-27 04:12:42.785'),
('cmkw2z4xm001h7kmociwydbmc', 'cmkqmpwry00007kgcqywncr0e', 'Ampoule', 'ampoule', 1, 'cmkw2yiao001b7kmoiujgqxvu', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:12:53.050', '2026-01-27 04:12:53.050'),
('cmkw3cf7z001j7kmoi4gbmmra', 'cmkqmpwry00007kgcqywncr0e', 'Moisturizing', 'moisturizing', 1, 'cmkw29q2b000j7kmobivitqzj', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:23:12.911', '2026-01-27 04:23:12.911'),
('cmkw3cmxm001l7kmo1civwpd4', 'cmkqmpwry00007kgcqywncr0e', 'Moisturizer / Gel Cream', 'moisturizer-gel-cream', 1, 'cmkw3cf7z001j7kmoi4gbmmra', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:23:22.906', '2026-01-27 04:23:22.906'),
('cmkw3d4wi001p7kmo24xcecju', 'cmkqmpwry00007kgcqywncr0e', 'Lotion / Emulsion', 'lotion-emulsion', 1, 'cmkw3cf7z001j7kmoi4gbmmra', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:23:46.194', '2026-01-27 04:23:46.194'),
('cmkw3he3d001r7kmo5quwvnyz', 'cmkqmpwry00007kgcqywncr0e', 'Targeted Treatment', 'targeted-treatment', 1, 'cmkw29q2b000j7kmobivitqzj', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:27:04.729', '2026-01-27 04:27:04.729'),
('cmkw3hkp0001t7kmodkyrw8wy', 'cmkqmpwry00007kgcqywncr0e', 'Sun Care', 'sun-care', 1, 'cmkw29q2b000j7kmobivitqzj', 50, NULL, NULL, NULL, NULL, '2026-01-27 04:27:13.284', '2026-01-27 04:27:13.284'),
('cmkw3hs82001v7kmoap3csxbx', 'cmkqmpwry00007kgcqywncr0e', 'Acne Treatment', 'acne-treatment', 1, 'cmkw3he3d001r7kmo5quwvnyz', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:27:23.042', '2026-01-27 04:27:23.042'),
('cmkw3hyzv001x7kmoe6y8q93x', 'cmkqmpwry00007kgcqywncr0e', 'Brightening / Dark Spot Treatment', 'brightening-dark-spot-treatment', 1, 'cmkw3he3d001r7kmo5quwvnyz', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:27:31.819', '2026-01-27 04:27:31.819'),
('cmkw3i6fd001z7kmo7k1xnnyr', 'cmkqmpwry00007kgcqywncr0e', 'Anti-aging', 'anti-aging', 1, 'cmkw3he3d001r7kmo5quwvnyz', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:27:41.450', '2026-01-27 04:27:41.450'),
('cmkw3jw0200217kmoezg1r493', 'cmkqmpwry00007kgcqywncr0e', 'Sunscreen', 'sunscreen', 1, 'cmkw3hkp0001t7kmodkyrw8wy', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:29:01.250', '2026-01-27 04:29:01.250'),
('cmkw3k31r00237kmomffc95ik', 'cmkqmpwry00007kgcqywncr0e', 'Sun Spray', 'sun-spray', 1, 'cmkw3hkp0001t7kmodkyrw8wy', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:29:10.384', '2026-01-27 04:29:10.384'),
('cmkw3u85l00257kmol6c4tc4g', 'cmkqmpwry00007kgcqywncr0e', 'Face Makeup', 'face-makeup', 1, 'cmkw29wmi000l7kmom57dqm8g', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:37:03.562', '2026-01-27 04:37:03.562'),
('cmkw3ugdh00277kmo42mmcik4', 'cmkqmpwry00007kgcqywncr0e', 'Eye Makeup', 'eye-makeup', 1, 'cmkw29wmi000l7kmom57dqm8g', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:37:14.213', '2026-01-27 04:37:14.213'),
('cmkw3upay00297kmoewhtwe2d', 'cmkqmpwry00007kgcqywncr0e', 'Lip Makeup', 'lip-makeup', 1, 'cmkw29wmi000l7kmom57dqm8g', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:37:25.786', '2026-01-27 04:37:25.786'),
('cmkw3uus2002b7kmofya86fo1', 'cmkqmpwry00007kgcqywncr0e', 'Cheek Makeup', 'cheek-makeup', 1, 'cmkw29wmi000l7kmom57dqm8g', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:37:32.882', '2026-01-27 04:37:32.882'),
('cmkw3v9ro002d7kmo4gnwmqx8', 'cmkqmpwry00007kgcqywncr0e', 'Foundation / Cushion', 'foundation-cushion', 1, 'cmkw3u85l00257kmol6c4tc4g', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:37:52.308', '2026-01-27 04:37:52.308'),
('cmkw3vmt4002f7kmogowozgu4', 'cmkqmpwry00007kgcqywncr0e', 'Loose Powder / Pressed Powder', 'loose-powder-pressed-powder', 1, 'cmkw3u85l00257kmol6c4tc4g', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:38:09.208', '2026-01-27 04:38:09.208'),
('cmkw3vt87002h7kmoe1unxy9k', 'cmkqmpwry00007kgcqywncr0e', 'Concealer', 'concealer', 1, 'cmkw3u85l00257kmol6c4tc4g', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:38:17.527', '2026-01-27 04:38:17.527'),
('cmkw3vyql002j7kmonwe5i1hs', 'cmkqmpwry00007kgcqywncr0e', 'Mascara', 'mascara', 1, 'cmkw3ugdh00277kmo42mmcik4', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:38:24.669', '2026-01-27 04:38:24.669'),
('cmkw3wq2p002n7kmozbtycvb7', 'cmkqmpwry00007kgcqywncr0e', 'Eyeliner', 'eyeliner', 1, 'cmkw3ugdh00277kmo42mmcik4', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:39:00.097', '2026-01-27 04:39:00.097'),
('cmkw3wwms002p7kmofa8dj7j3', 'cmkqmpwry00007kgcqywncr0e', 'Eyeshadow', 'eyeshadow', 1, 'cmkw3ugdh00277kmo42mmcik4', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:39:08.597', '2026-01-27 04:39:08.597'),
('cmkw3x6w1002r7kmojf1h3hty', 'cmkqmpwry00007kgcqywncr0e', 'Eyebrow Products', 'eyebrow-products', 1, 'cmkw3ugdh00277kmo42mmcik4', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:39:21.890', '2026-01-27 04:39:21.890'),
('cmkw3xjdw002t7kmopgq5z1pw', 'cmkqmpwry00007kgcqywncr0e', 'Lipstick', 'lipstick', 1, 'cmkw3upay00297kmoewhtwe2d', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:39:38.084', '2026-01-27 04:39:38.084'),
('cmkw3xptv002v7kmocn5t01bz', 'cmkqmpwry00007kgcqywncr0e', 'Lip Tint', 'lip-tint', 1, 'cmkw3upay00297kmoewhtwe2d', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:39:46.436', '2026-01-27 04:39:46.436'),
('cmkw3xvgj002x7kmo3cd0kjdu', 'cmkqmpwry00007kgcqywncr0e', 'Lip Balm', 'lip-balm', 1, 'cmkw3upay00297kmoewhtwe2d', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:39:53.731', '2026-01-27 04:39:53.731'),
('cmkw3y3ee002z7kmo3x45nwrk', 'cmkqmpwry00007kgcqywncr0e', 'Blush', 'blush', 1, 'cmkw3uus2002b7kmofya86fo1', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:40:04.023', '2026-01-27 04:40:04.023'),
('cmkw3yban00317kmok28sz9oh', 'cmkqmpwry00007kgcqywncr0e', 'Contour / Highlighter', 'contour-highlighter', 1, 'cmkw3uus2002b7kmofya86fo1', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:40:14.256', '2026-01-27 04:40:14.256'),
('cmkw3ynog00337kmorzdu3o9g', 'cmkqmpwry00007kgcqywncr0e', 'Shampoo', 'shampoo', 1, 'cmkw2a6kk000n7kmow2j5j8pp', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:40:30.304', '2026-01-27 04:40:30.304'),
('cmkw3yx0100357kmork6oydki', 'cmkqmpwry00007kgcqywncr0e', 'Conditioner', 'conditioner', 1, 'cmkw2a6kk000n7kmow2j5j8pp', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:40:42.385', '2026-01-27 04:40:42.385'),
('cmkw3z6jd00377kmonqisil0v', 'cmkqmpwry00007kgcqywncr0e', 'Hair Mask', 'hair-mask', 1, 'cmkw2a6kk000n7kmow2j5j8pp', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:40:54.745', '2026-01-27 04:40:54.745'),
('cmkw3zdfc00397kmorloqtpo8', 'cmkqmpwry00007kgcqywncr0e', 'Hair Treatment', 'hair-treatment', 1, 'cmkw2a6kk000n7kmow2j5j8pp', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:41:03.672', '2026-01-27 04:41:03.672'),
('cmkw3zpec003b7kmoqyj0jh67', 'cmkqmpwry00007kgcqywncr0e', 'Hair Oil', 'hair-oil', 1, 'cmkw2a6kk000n7kmow2j5j8pp', 50, NULL, NULL, NULL, NULL, '2026-01-27 04:41:19.188', '2026-01-27 04:41:19.188'),
('cmkw3zuut003d7kmovdpq0n0j', 'cmkqmpwry00007kgcqywncr0e', 'Hair Serum', 'hair-serum', 1, 'cmkw2a6kk000n7kmow2j5j8pp', 60, NULL, NULL, NULL, NULL, '2026-01-27 04:41:26.262', '2026-01-27 04:41:26.262'),
('cmkw400rm003f7kmoshg9s828', 'cmkqmpwry00007kgcqywncr0e', 'Styling Products', 'styling-products', 1, 'cmkw2a6kk000n7kmow2j5j8pp', 70, NULL, NULL, NULL, NULL, '2026-01-27 04:41:33.922', '2026-01-27 04:41:33.922'),
('cmkw40e0g003h7kmotynyt8vg', 'cmkqmpwry00007kgcqywncr0e', 'Body Wash', 'body-wash', 1, 'cmkw2acfh000p7kmoqzabfa24', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:41:51.088', '2026-01-27 04:41:51.088'),
('cmkw40ivw003j7kmo69sryqdb', 'cmkqmpwry00007kgcqywncr0e', 'Body Scrub', 'body-scrub', 1, 'cmkw2acfh000p7kmoqzabfa24', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:41:57.404', '2026-01-27 04:41:57.404'),
('cmkw40pn7003l7kmo8y0xm312', 'cmkqmpwry00007kgcqywncr0e', 'Body Lotion', 'body-lotion', 1, 'cmkw2acfh000p7kmoqzabfa24', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:42:06.163', '2026-01-27 04:42:06.163'),
('cmkw40uf7003n7kmovxbjd9i3', 'cmkqmpwry00007kgcqywncr0e', 'Body Cream', 'body-cream', 1, 'cmkw2acfh000p7kmoqzabfa24', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:42:12.356', '2026-01-27 04:42:12.356'),
('cmkw41049003p7kmo7mfdy6ju', 'cmkqmpwry00007kgcqywncr0e', 'Deodorant', 'deodorant', 1, 'cmkw2acfh000p7kmoqzabfa24', 50, NULL, NULL, NULL, NULL, '2026-01-27 04:42:19.737', '2026-01-27 04:42:19.737'),
('cmkw416k7003r7kmo3iurjl58', 'cmkqmpwry00007kgcqywncr0e', 'Hand & Foot Care', 'hand-foot-care', 1, 'cmkw2acfh000p7kmoqzabfa24', 60, NULL, NULL, NULL, NULL, '2026-01-27 04:42:28.087', '2026-01-27 04:42:28.087'),
('cmkw41oip003t7kmo0qtztoh3', 'cmkqmpwry00007kgcqywncr0e', 'Oral Care', 'oral-care', 1, 'cmkw2ak7y000r7kmoae6lffp5', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:42:51.361', '2026-01-27 04:42:51.361'),
('cmkw41tj8003v7kmotb78hjqy', 'cmkqmpwry00007kgcqywncr0e', 'Feminine Care', 'feminine-care', 1, 'cmkw2ak7y000r7kmoae6lffp5', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:42:57.860', '2026-01-27 04:42:57.860'),
('cmkw41z50003x7kmoxglosw9u', 'cmkqmpwry00007kgcqywncr0e', 'Hair Removal', 'hair-removal', 1, 'cmkw2ak7y000r7kmoae6lffp5', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:43:05.125', '2026-01-27 04:43:05.125'),
('cmkw4244s003z7kmo9nztw70q', 'cmkqmpwry00007kgcqywncr0e', 'Shaving', 'shaving', 1, 'cmkw2ak7y000r7kmoae6lffp5', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:43:11.596', '2026-01-27 04:43:11.596'),
('cmkw42ds000417kmomvj8nsnk', 'cmkqmpwry00007kgcqywncr0e', 'Perfume', 'perfume', 1, 'cmkw2ak7y000r7kmoae6lffp5', 50, NULL, NULL, NULL, NULL, '2026-01-27 04:43:24.097', '2026-01-27 04:43:24.097'),
('cmkw42ij200437kmoud8nf0o2', 'cmkqmpwry00007kgcqywncr0e', 'Fragrance', 'fragrance', 1, 'cmkw2ak7y000r7kmoae6lffp5', 60, NULL, NULL, NULL, NULL, '2026-01-27 04:43:30.255', '2026-01-27 04:43:30.255'),
('cmkw42plw00457kmork3sx3rj', 'cmkqmpwry00007kgcqywncr0e', 'Makeup Brushes', 'makeup-brushes', 1, 'cmkw2aqwk000t7kmom6d3cvez', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:43:39.428', '2026-01-27 04:43:39.428'),
('cmkw42z5500477kmo72tw849k', 'cmkqmpwry00007kgcqywncr0e', 'Cotton Pads', 'cotton-pads', 1, 'cmkw2aqwk000t7kmom6d3cvez', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:43:51.785', '2026-01-27 04:43:51.785'),
('cmkw434fe00497kmoqiovb7w9', 'cmkqmpwry00007kgcqywncr0e', 'Facial Cleansing Devices', 'facial-cleansing-devices', 1, 'cmkw2aqwk000t7kmom6d3cvez', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:43:58.635', '2026-01-27 04:43:58.635'),
('cmkw439z8004b7kmo1wf4s6r2', 'cmkqmpwry00007kgcqywncr0e', 'Facial Massagers', 'facial-massagers', 1, 'cmkw2aqwk000t7kmom6d3cvez', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:44:05.828', '2026-01-27 04:44:05.828'),
('cmkw43leb004d7kmodphcal1w', 'cmkqmpwry00007kgcqywncr0e', 'Products for Oily / Dry', 'products-for-oily-dry', 1, 'cmkw2b9ls000v7kmo3vyh5z5p', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:44:20.627', '2026-01-27 04:44:20.627'),
('cmkw43r5p004f7kmojn7rflon', 'cmkqmpwry00007kgcqywncr0e', 'Sensitive Skin', 'sensitive-skin', 1, 'cmkw2b9ls000v7kmo3vyh5z5p', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:44:28.093', '2026-01-27 04:44:28.093'),
('cmkw43y5b004h7kmom6k0zenu', 'cmkqmpwry00007kgcqywncr0e', 'Men’s Skincare & Grooming', 'mens-skincare-grooming', 1, 'cmkw2b9ls000v7kmo3vyh5z5p', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:44:37.152', '2026-01-27 04:44:37.152'),
('cmkw444ua004j7kmo2n3mst3n', 'cmkqmpwry00007kgcqywncr0e', 'Pregnancy-safe Cosmetics', 'pregnancy-safe-cosmetics', 1, 'cmkw2b9ls000v7kmo3vyh5z5p', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:44:45.827', '2026-01-27 04:44:45.827'),
('cmkw44arb004l7kmouub9hc9x', 'cmkqmpwry00007kgcqywncr0e', 'Vegan', 'vegan', 1, 'cmkw2b9ls000v7kmo3vyh5z5p', 50, NULL, NULL, NULL, NULL, '2026-01-27 04:44:53.495', '2026-01-27 04:44:53.495'),
('cmkw44hua004n7kmorcf6rjeu', 'cmkqmpwry00007kgcqywncr0e', 'Organic Beauty Products', 'organic-beauty-products', 1, 'cmkw2b9ls000v7kmo3vyh5z5p', 60, NULL, NULL, NULL, NULL, '2026-01-27 04:45:02.674', '2026-01-27 04:45:02.674'),
('cmkw44xn2004p7kmo9jy5a3vp', 'cmkqmpwry00007kgcqywncr0e', 'Korean Beauty Brands', 'korean-beauty-brands', 1, 'cmkw2cdp7000z7kmoli840jv9', 10, NULL, NULL, NULL, NULL, '2026-01-27 04:45:23.150', '2026-01-27 04:45:23.150'),
('cmkw452x2004r7kmolmwei36a', 'cmkqmpwry00007kgcqywncr0e', 'Japanese Beauty Brands', 'japanese-beauty-brands', 1, 'cmkw2cdp7000z7kmoli840jv9', 20, NULL, NULL, NULL, NULL, '2026-01-27 04:45:29.991', '2026-01-27 04:45:29.991'),
('cmkw459bl004t7kmotxbfadry', 'cmkqmpwry00007kgcqywncr0e', 'European & American Brands', 'european-american-brands', 1, 'cmkw2cdp7000z7kmoli840jv9', 30, NULL, NULL, NULL, NULL, '2026-01-27 04:45:38.289', '2026-01-27 04:45:38.289'),
('cmkw45gek004v7kmofosuvbcx', 'cmkqmpwry00007kgcqywncr0e', 'Local / Domestic Brands', 'local-domestic-brands', 1, 'cmkw2cdp7000z7kmoli840jv9', 40, NULL, NULL, NULL, NULL, '2026-01-27 04:45:47.468', '2026-01-27 04:45:47.468');

-- --------------------------------------------------------

--
-- Table structure for table `productimage`
--

CREATE TABLE `productimage` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `sort` int(11) NOT NULL DEFAULT 0,
  `isCover` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productimage`
--

INSERT INTO `productimage` (`id`, `productId`, `url`, `fileName`, `sort`, `isCover`, `createdAt`) VALUES
('cmkw4ghv2004w7kmor5ad1v1o', 'cmkvwi9t200017kmo65ka4o1b', '/uploads/2026-01/b954cc182a63f4ed081fe739a704df47.png', NULL, 0, 1, '2026-01-27 04:54:22.574');

-- --------------------------------------------------------

--
-- Table structure for table `productvariant`
--

CREATE TABLE `productvariant` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `sku` varchar(191) NOT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `priceCents` int(11) NOT NULL DEFAULT 0,
  `costCents` int(11) NOT NULL DEFAULT 0,
  `stock` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `option1` varchar(191) DEFAULT NULL,
  `value1` varchar(191) DEFAULT NULL,
  `option2` varchar(191) DEFAULT NULL,
  `value2` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productvariant`
--

INSERT INTO `productvariant` (`id`, `productId`, `name`, `sku`, `barcode`, `priceCents`, `costCents`, `stock`, `isActive`, `option1`, `value1`, `option2`, `value2`, `createdAt`, `updatedAt`) VALUES
('cmkw4mrmb004y7kmony03wzw8', 'cmkvwi9t200017kmo65ka4o1b', 'New variant', 'SP-001-NEW', NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, '2026-01-27 04:59:15.155', '2026-01-27 04:59:15.155');

-- --------------------------------------------------------

--
-- Table structure for table `productvariantimage`
--

CREATE TABLE `productvariantimage` (
  `id` varchar(191) NOT NULL,
  `variantId` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `sort` int(11) NOT NULL DEFAULT 0,
  `isCover` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `firstName` varchar(191) DEFAULT NULL,
  `lastName` varchar(191) DEFAULT NULL,
  `username` varchar(191) DEFAULT NULL,
  `backupEmail` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `country` varchar(191) DEFAULT NULL,
  `role` enum('admin','staff','viewer') NOT NULL DEFAULT 'viewer',
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `company` varchar(191) DEFAULT NULL,
  `department` varchar(191) DEFAULT NULL,
  `jobTitle` varchar(191) DEFAULT NULL,
  `manager` varchar(191) DEFAULT NULL,
  `hireDate` datetime(3) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `locale` enum('vi','en','ja') NOT NULL DEFAULT 'vi',
  `timezone` varchar(191) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  `dobMonth` varchar(191) DEFAULT NULL,
  `dobDay` int(11) DEFAULT NULL,
  `dobYear` int(11) DEFAULT NULL,
  `twitter` varchar(191) DEFAULT NULL,
  `linkedin` varchar(191) DEFAULT NULL,
  `facebook` varchar(191) DEFAULT NULL,
  `github` varchar(191) DEFAULT NULL,
  `website` varchar(191) DEFAULT NULL,
  `slogan` varchar(191) DEFAULT NULL,
  `bio` varchar(191) DEFAULT NULL,
  `twoFA` tinyint(1) NOT NULL DEFAULT 0,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `lastLoginIp` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorder`
--

CREATE TABLE `purchaseorder` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `number` varchar(191) NOT NULL,
  `status` enum('DRAFT','APPROVED','PARTIAL','RECEIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `supplierId` varchar(191) DEFAULT NULL,
  `currency` enum('USD','VND') NOT NULL DEFAULT 'USD',
  `expectedAt` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `subtotalCents` int(11) NOT NULL DEFAULT 0,
  `taxCents` int(11) NOT NULL DEFAULT 0,
  `totalCents` int(11) NOT NULL DEFAULT 0,
  `approvedAt` datetime(3) DEFAULT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorderline`
--

CREATE TABLE `purchaseorderline` (
  `id` varchar(191) NOT NULL,
  `poId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `variantId` varchar(191) DEFAULT NULL,
  `skuSnapshot` varchar(191) DEFAULT NULL,
  `nameSnapshot` varchar(191) DEFAULT NULL,
  `qtyOrdered` int(11) NOT NULL,
  `qtyReceived` int(11) NOT NULL DEFAULT 0,
  `unitCostCents` int(11) NOT NULL DEFAULT 0,
  `totalCents` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refund`
--

CREATE TABLE `refund` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `originalPaymentId` varchar(191) DEFAULT NULL,
  `refundPaymentId` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','PROCESSING','SUCCEEDED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `reason` enum('CUSTOMER_REQUEST','DAMAGED','WRONG_ITEM','NOT_RECEIVED','CANCELLED_ORDER','DUPLICATE_PAYMENT','OTHER') NOT NULL DEFAULT 'OTHER',
  `amountCents` int(11) NOT NULL,
  `currency` enum('USD','VND') NOT NULL DEFAULT 'VND',
  `reference` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `requestedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approvedAt` datetime(3) DEFAULT NULL,
  `processedAt` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refunditem`
--

CREATE TABLE `refunditem` (
  `id` varchar(191) NOT NULL,
  `refundId` varchar(191) NOT NULL,
  `orderItemId` varchar(191) DEFAULT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `amountCents` int(11) NOT NULL DEFAULT 0,
  `notes` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `section`
--

CREATE TABLE `section` (
  `id` varchar(191) NOT NULL,
  `pageId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort` int(11) NOT NULL DEFAULT 0,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `style` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`style`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` enum('ADMIN','USER') NOT NULL DEFAULT 'USER',
  `tokenHash` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL,
  `lastSeenAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `ip` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `country` varchar(191) DEFAULT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `revokeReason` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`id`, `userId`, `type`, `tokenHash`, `createdAt`, `expiresAt`, `lastSeenAt`, `ip`, `userAgent`, `country`, `revokedAt`, `revokeReason`) VALUES
('cmkqoo71g00027kqw5v5tdktf', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN', '83fadb3897afa8f38dfdee90954bcbad65cd1cd4be30fdbb20a0d51bba9fa9af', '2026-01-23 09:33:37.058', '2026-01-24 09:33:37.051', '2026-01-23 09:50:20.723', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, '2026-01-26 03:13:33.495', 'rotated_on_login'),
('cmkulezpd00027krshmgn7phb', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN', '30380adaf4fbdf0f70eea114efdb1bb3a4d1a0a73efa196531c622873d310cc4', '2026-01-26 03:13:33.502', '2026-01-27 03:13:33.494', '2026-01-27 02:59:15.263', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, '2026-01-27 03:23:46.823', 'rotated_on_login'),
('cmkw17zm9000e7kmoy159n045', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN', '82cdbaac3b721d1a6203c3eeda61f8356ce9a644c0a1db70c53a3ceceee20cce', '2026-01-27 03:23:46.831', '2026-01-28 03:23:46.823', '2026-01-28 02:57:55.538', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, '2026-01-28 03:25:19.099', 'rotated_on_login'),
('cmkxgpthi00027kacirosk8ws', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN', '51effcfd7320c1dca41a1d33434eb52d60478b9744acbae5174ab004ad99d1c2', '2026-01-28 03:25:19.107', '2026-01-29 03:25:19.099', '2026-01-28 05:41:26.583', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, '2026-02-06 01:23:44.303', 'rotated_on_login'),
('cmla7c4s900027k3wmqy492l8', 'cmkqmpwry00007kgcqywncr0e', 'ADMIN', '1123364d363536c2ac39e6bcf730cc32e77c560255407eb814be0a5dcf9d1594', '2026-02-06 01:23:44.311', '2026-02-07 01:23:44.303', '2026-02-06 01:24:16.957', '::ffff:192.168.100.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `site`
--

CREATE TABLE `site` (
  `id` varchar(191) NOT NULL,
  `domain` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site`
--

INSERT INTO `site` (`id`, `domain`, `name`, `createdAt`, `updatedAt`) VALUES
('sitea01', 'sitea.local', 'sitea.local', '2026-01-23 08:42:46.256', '2026-01-28 04:46:24.349'),
('sitea02', 'siteb.local', 'siteb.local', '2026-01-28 05:20:10.320', '2026-01-28 05:20:10.320');

-- --------------------------------------------------------

--
-- Table structure for table `spendcategory`
--

CREATE TABLE `spendcategory` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` enum('INVENTORY','SOFTWARE','MARKETING','OPS','TRAVEL','OFFICE','OTHER') NOT NULL DEFAULT 'OTHER',
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockmovement`
--

CREATE TABLE `stockmovement` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `variantId` varchar(191) DEFAULT NULL,
  `type` enum('IN','OUT','ADJUST','RETURN_IN','VOID') NOT NULL,
  `source` enum('RECEIPT','ORDER','MANUAL') NOT NULL,
  `qtyDelta` int(11) NOT NULL,
  `occurredAt` datetime(3) NOT NULL,
  `beforeStock` int(11) DEFAULT NULL,
  `afterStock` int(11) DEFAULT NULL,
  `note` varchar(191) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `receiptItemId` varchar(191) DEFAULT NULL,
  `orderItemId` varchar(191) DEFAULT NULL,
  `idempotencyKey` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storagebucket`
--

CREATE TABLE `storagebucket` (
  `id` varchar(191) NOT NULL,
  `integrationId` varchar(191) NOT NULL,
  `provider` enum('LOCAL','S3','R2') NOT NULL,
  `name` varchar(191) NOT NULL,
  `region` varchar(191) DEFAULT NULL,
  `endpointUrl` varchar(191) DEFAULT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `objectsCount` int(11) NOT NULL DEFAULT 0,
  `sizeBytes` bigint(20) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storageintegration`
--

CREATE TABLE `storageintegration` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `provider` enum('LOCAL','S3','R2') NOT NULL DEFAULT 'R2',
  `status` enum('DISCONNECTED','CONNECTED','ERROR') NOT NULL DEFAULT 'DISCONNECTED',
  `publicBaseUrl` varchar(191) NOT NULL,
  `rootPrefix` varchar(191) NOT NULL DEFAULT 'uploads/',
  `privateByDefault` tinyint(1) NOT NULL DEFAULT 1,
  `signedUrlEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `signedUrlTtlSeconds` int(11) NOT NULL DEFAULT 900,
  `maxUploadMb` int(11) NOT NULL DEFAULT 50,
  `allowedMime` varchar(191) NOT NULL DEFAULT 'image/*,application/pdf',
  `enableImageOptimization` tinyint(1) NOT NULL DEFAULT 1,
  `localDir` varchar(191) DEFAULT NULL,
  `region` varchar(191) DEFAULT NULL,
  `bucket` varchar(191) DEFAULT NULL,
  `endpointUrl` varchar(191) DEFAULT NULL,
  `accessKeyIdEnc` varchar(191) DEFAULT NULL,
  `secretAccessKeyEnc` varchar(191) DEFAULT NULL,
  `cacheControl` varchar(191) NOT NULL DEFAULT 'public,max-age=31536000,immutable',
  `purgeEnabled` tinyint(1) NOT NULL DEFAULT 0,
  `lastTestedAt` datetime(3) DEFAULT NULL,
  `lastError` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storagelog`
--

CREATE TABLE `storagelog` (
  `id` varchar(191) NOT NULL,
  `integrationId` varchar(191) NOT NULL,
  `at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `level` enum('INFO','WARN','ERROR') NOT NULL DEFAULT 'INFO',
  `action` varchar(191) NOT NULL,
  `message` varchar(191) NOT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storageobject`
--

CREATE TABLE `storageobject` (
  `id` varchar(191) NOT NULL,
  `integrationId` varchar(191) NOT NULL,
  `provider` enum('LOCAL','S3','R2') NOT NULL,
  `bucket` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `sizeBytes` bigint(20) NOT NULL,
  `mimeType` varchar(191) NOT NULL,
  `visibility` enum('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PRIVATE',
  `etag` varchar(191) DEFAULT NULL,
  `checksum` varchar(191) DEFAULT NULL,
  `lastModifiedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storedfile`
--

CREATE TABLE `storedfile` (
  `id` varchar(191) NOT NULL,
  `folderId` varchar(191) DEFAULT NULL,
  `ownerId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `mimeType` varchar(191) NOT NULL,
  `sizeBytes` int(11) NOT NULL,
  `storageKey` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` enum('EXPENSE','INCOME','ADJUSTMENT') NOT NULL DEFAULT 'EXPENSE',
  `status` enum('PENDING','PAID','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PAID',
  `method` enum('CARD','BANK','CASH','EWALLET','COD') NOT NULL DEFAULT 'CARD',
  `currency` enum('USD','VND') NOT NULL DEFAULT 'USD',
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `merchantId` varchar(191) DEFAULT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `subtotalCents` int(11) NOT NULL DEFAULT 0,
  `taxCents` int(11) NOT NULL DEFAULT 0,
  `totalCents` int(11) NOT NULL DEFAULT 0,
  `occurredAt` datetime(3) NOT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `inventoryReceiptId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactionline`
--

CREATE TABLE `transactionline` (
  `id` varchar(191) NOT NULL,
  `transactionId` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `unitPriceCents` int(11) NOT NULL DEFAULT 0,
  `totalCents` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `twofactor`
--

CREATE TABLE `twofactor` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `secretEnc` varchar(191) DEFAULT NULL,
  `lastUsedAt` datetime(3) DEFAULT NULL,
  `enabledAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `emailVerifiedAt` datetime(3) DEFAULT NULL,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `image` varchar(191) DEFAULT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `passwordUpdatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `failedLoginCount` int(11) NOT NULL DEFAULT 0,
  `lockedUntil` datetime(3) DEFAULT NULL,
  `requireReauthAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `emailVerifiedAt`, `role`, `isActive`, `image`, `passwordHash`, `passwordUpdatedAt`, `failedLoginCount`, `lockedUntil`, `requireReauthAt`, `createdAt`, `updatedAt`) VALUES
('cmkqmpwry00007kgcqywncr0e', 'admin@example.com', NULL, 'ADMIN', 1, NULL, '$2b$12$w5UzAM8TRyJd.XFGWZvNrujE7cwv1WYj7sIAL3m2WKhTRAWXk9pvG', '2026-01-23 08:38:57.838', 0, NULL, NULL, '2026-01-23 08:38:57.838', '2026-02-06 01:23:44.311');

-- --------------------------------------------------------

--
-- Table structure for table `webhook`
--

CREATE TABLE `webhook` (
  `id` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `direction` enum('inbound','outbound') NOT NULL,
  `status` enum('active','paused','error') NOT NULL DEFAULT 'active',
  `eventKey` varchar(191) NOT NULL,
  `endpointPath` varchar(191) DEFAULT NULL,
  `destinationUrl` varchar(191) DEFAULT NULL,
  `method` enum('POST','PUT','PATCH') NOT NULL DEFAULT 'POST',
  `security` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`security`)),
  `mapping` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mapping`)),
  `retryPolicy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`retryPolicy`)),
  `lastTriggeredAt` datetime(3) DEFAULT NULL,
  `success24h` int(11) NOT NULL DEFAULT 0,
  `fail24h` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `webhookdelivery`
--

CREATE TABLE `webhookdelivery` (
  `id` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `webhookId` varchar(191) NOT NULL,
  `status` enum('success','failed','retrying') NOT NULL DEFAULT 'success',
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('337e3fc2-7230-473b-a430-9e4b263d8ce9', 'aedbdbd73342fa2c8b8289588f55808b5e8aa00070b8a9aa17b5b44f16d93e10', '2026-01-23 08:38:56.063', '20260123044848_add_init_email3', NULL, NULL, '2026-01-23 08:38:55.866', 1),
('788c381e-9aa7-430a-b538-5bf9c4bb8912', '4cb4dffbbaee123335ec010c915a75daa057a7741af467de7dd591cbb1c003cb', NULL, '20260123083938_add_init_webhook', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260123083938_add_init_webhook\n\nDatabase error code: 1005\n\nDatabase error:\nCan\'t create table `shoppingtool`.`refund` (errno: 121 \"Duplicate key on write or update\")\n\nPlease check the query number 13 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260123083938_add_init_webhook\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260123083938_add_init_webhook\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260', NULL, '2026-01-23 08:39:38.354', 0),
('8dd6f0ef-9876-40cb-a525-ff79ffa35bc1', '57adb53a9654864493f195ed5970e914da1b7669d9d7839a1c01b580e47d7801', '2026-01-23 08:38:55.233', '20260121081913_add_init_address', NULL, NULL, '2026-01-23 08:38:41.155', 1),
('a32faee4-9e07-4a55-aa1e-b8e7827d6a25', 'a4a4d2c74de42dc405fdac93caf38dd892eb1ae699805e555570cfcccd13f06c', '2026-01-23 08:38:55.518', '20260121100859_add_init_email', NULL, NULL, '2026-01-23 08:38:55.239', 1),
('b0c9ab86-b3c3-460b-bc70-75465479a84d', '4b304646ce1885bb54a89d4a13020954c444cd6d535dd4736ef5e7a599a38f79', '2026-01-23 08:38:57.275', '20260123064426_add_init_storage', NULL, NULL, '2026-01-23 08:38:56.066', 1),
('e13ba91f-b015-42e6-b486-c10af2ad28b4', 'b81abeca02055a58f8e82e53af656b4cababb576638b39cf8bb1dbd3a8589459', '2026-01-23 08:38:55.863', '20260123044238_add_init_email2', NULL, NULL, '2026-01-23 08:38:55.522', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Address_userId_customerId_createdAt_idx` (`userId`,`customerId`,`createdAt`),
  ADD KEY `Address_customerId_type_isDefault_idx` (`customerId`,`type`,`isDefault`),
  ADD KEY `Address_status_updatedAt_idx` (`status`,`updatedAt`),
  ADD KEY `Address_country_city_idx` (`country`,`city`);

--
-- Indexes for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AuditLog_userId_createdAt_idx` (`userId`,`createdAt`),
  ADD KEY `AuditLog_action_createdAt_idx` (`action`,`createdAt`);

--
-- Indexes for table `backupcode`
--
ALTER TABLE `backupcode`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `BackupCode_userId_codeHash_key` (`userId`,`codeHash`),
  ADD KEY `BackupCode_userId_usedAt_idx` (`userId`,`usedAt`);

--
-- Indexes for table `block`
--
ALTER TABLE `block`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Block_blockerId_blockedId_key` (`blockerId`,`blockedId`),
  ADD KEY `Block_blockedId_idx` (`blockedId`);

--
-- Indexes for table `calendar`
--
ALTER TABLE `calendar`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Calendar_ownerId_name_key` (`ownerId`,`name`),
  ADD KEY `Calendar_ownerId_idx` (`ownerId`);

--
-- Indexes for table `calendarevent`
--
ALTER TABLE `calendarevent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CalendarEvent_calendarId_startAt_idx` (`calendarId`,`startAt`),
  ADD KEY `CalendarEvent_creatorId_startAt_idx` (`creatorId`,`startAt`);

--
-- Indexes for table `conversation`
--
ALTER TABLE `conversation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Conversation_type_idx` (`type`),
  ADD KEY `Conversation_lastMessageAt_idx` (`lastMessageAt`);

--
-- Indexes for table `conversationmember`
--
ALTER TABLE `conversationmember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ConversationMember_conversationId_userId_key` (`conversationId`,`userId`),
  ADD KEY `ConversationMember_userId_idx` (`userId`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Customer_userId_phone_key` (`userId`,`phone`),
  ADD UNIQUE KEY `Customer_userId_email_key` (`userId`,`email`),
  ADD KEY `Customer_userId_idx` (`userId`),
  ADD KEY `Customer_userId_name_idx` (`userId`,`name`),
  ADD KEY `Customer_userId_phone_idx` (`userId`,`phone`),
  ADD KEY `Customer_userId_email_idx` (`userId`,`email`),
  ADD KEY `Customer_isActive_idx` (`isActive`);

--
-- Indexes for table `email`
--
ALTER TABLE `email`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Email_userId_idx` (`userId`),
  ADD KEY `Email_userId_status_idx` (`userId`,`status`),
  ADD KEY `Email_userId_type_idx` (`userId`,`type`),
  ADD KEY `Email_userId_scheduledAt_idx` (`userId`,`scheduledAt`),
  ADD KEY `Email_userId_createdAt_idx` (`userId`,`createdAt`);

--
-- Indexes for table `emailrecipient`
--
ALTER TABLE `emailrecipient`
  ADD PRIMARY KEY (`id`),
  ADD KEY `EmailRecipient_emailId_idx` (`emailId`),
  ADD KEY `EmailRecipient_toEmail_idx` (`toEmail`),
  ADD KEY `EmailRecipient_status_idx` (`status`);

--
-- Indexes for table `emailtemplate`
--
ALTER TABLE `emailtemplate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `EmailTemplate_userId_key_key` (`userId`,`key`),
  ADD KEY `EmailTemplate_userId_idx` (`userId`),
  ADD KEY `EmailTemplate_userId_isActive_idx` (`userId`,`isActive`);

--
-- Indexes for table `filefolder`
--
ALTER TABLE `filefolder`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `FileFolder_ownerId_parentId_name_key` (`ownerId`,`parentId`,`name`),
  ADD KEY `FileFolder_ownerId_parentId_idx` (`ownerId`,`parentId`),
  ADD KEY `FileFolder_parentId_fkey` (`parentId`);

--
-- Indexes for table `friendrequest`
--
ALTER TABLE `friendrequest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `FriendRequest_fromId_toId_key` (`fromId`,`toId`),
  ADD KEY `FriendRequest_toId_status_idx` (`toId`,`status`),
  ADD KEY `FriendRequest_fromId_status_idx` (`fromId`,`status`);

--
-- Indexes for table `imageasset`
--
ALTER TABLE `imageasset`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ImageAsset_fileName_key` (`fileName`),
  ADD KEY `ImageAsset_userId_createdAt_idx` (`userId`,`createdAt`),
  ADD KEY `ImageAsset_userId_tag_idx` (`userId`,`tag`),
  ADD KEY `ImageAsset_folderId_userId_fkey` (`folderId`,`userId`);

--
-- Indexes for table `imagefolder`
--
ALTER TABLE `imagefolder`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ImageFolder_id_userId_key` (`id`,`userId`),
  ADD UNIQUE KEY `ImageFolder_userId_parentId_name_key` (`userId`,`parentId`,`name`),
  ADD KEY `ImageFolder_userId_parentId_idx` (`userId`,`parentId`),
  ADD KEY `ImageFolder_parentId_fkey` (`parentId`);

--
-- Indexes for table `integration`
--
ALTER TABLE `integration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Integration_key_key` (`key`);

--
-- Indexes for table `integrationlog`
--
ALTER TABLE `integrationlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IntegrationLog_integrationId_createdAt_idx` (`integrationId`,`createdAt`);

--
-- Indexes for table `inventoryreceipt`
--
ALTER TABLE `inventoryreceipt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `InventoryReceipt_userId_createdAt_idx` (`userId`,`createdAt`),
  ADD KEY `InventoryReceipt_userId_receivedAt_idx` (`userId`,`receivedAt`),
  ADD KEY `InventoryReceipt_status_idx` (`status`),
  ADD KEY `InventoryReceipt_supplierId_idx` (`supplierId`),
  ADD KEY `InventoryReceipt_userId_supplierId_idx` (`userId`,`supplierId`),
  ADD KEY `InventoryReceipt_poId_idx` (`poId`),
  ADD KEY `InventoryReceipt_userId_poId_idx` (`userId`,`poId`),
  ADD KEY `InventoryReceipt_transactionId_fkey` (`transactionId`);

--
-- Indexes for table `inventoryreceiptitem`
--
ALTER TABLE `inventoryreceiptitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `InventoryReceiptItem_receiptId_idx` (`receiptId`),
  ADD KEY `InventoryReceiptItem_productId_idx` (`productId`),
  ADD KEY `InventoryReceiptItem_variantId_idx` (`variantId`),
  ADD KEY `InventoryReceiptItem_productId_createdAt_idx` (`productId`,`createdAt`),
  ADD KEY `InventoryReceiptItem_variantId_createdAt_idx` (`variantId`,`createdAt`),
  ADD KEY `InventoryReceiptItem_poLineId_idx` (`poLineId`);

--
-- Indexes for table `loginattempt`
--
ALTER TABLE `loginattempt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `LoginAttempt_ip_createdAt_idx` (`ip`,`createdAt`),
  ADD KEY `LoginAttempt_email_createdAt_idx` (`email`,`createdAt`),
  ADD KEY `LoginAttempt_fingerprint_createdAt_idx` (`fingerprint`,`createdAt`);

--
-- Indexes for table `menuitem`
--
ALTER TABLE `menuitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MenuItem_parentId_idx` (`parentId`),
  ADD KEY `MenuItem_siteId_locale_setKey_sortOrder_idx` (`siteId`,`locale`,`setKey`,`sortOrder`),
  ADD KEY `MenuItem_title_idx` (`title`);

--
-- Indexes for table `merchant`
--
ALTER TABLE `merchant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Merchant_name_key` (`name`),
  ADD KEY `Merchant_userId_fkey` (`userId`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Message_conversationId_createdAt_idx` (`conversationId`,`createdAt`),
  ADD KEY `Message_senderId_fkey` (`senderId`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Order_userId_number_key` (`userId`,`number`),
  ADD KEY `Order_userId_createdAt_idx` (`userId`,`createdAt`),
  ADD KEY `Order_status_idx` (`status`),
  ADD KEY `Order_paymentStatus_idx` (`paymentStatus`),
  ADD KEY `Order_fulfillmentStatus_idx` (`fulfillmentStatus`),
  ADD KEY `Order_userId_customerId_idx` (`userId`,`customerId`),
  ADD KEY `Order_customerId_fkey` (`customerId`);

--
-- Indexes for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_idx` (`orderId`),
  ADD KEY `OrderItem_productId_idx` (`productId`),
  ADD KEY `OrderItem_variantId_idx` (`variantId`);

--
-- Indexes for table `page`
--
ALTER TABLE `page`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Page_siteId_slug_key` (`siteId`,`slug`),
  ADD UNIQUE KEY `Page_siteId_path_key` (`siteId`,`path`),
  ADD KEY `Page_siteId_idx` (`siteId`),
  ADD KEY `Page_siteId_updatedAt_idx` (`siteId`,`updatedAt`),
  ADD KEY `Page_menuItemId_idx` (`menuItemId`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Payment_idempotencyKey_key` (`idempotencyKey`),
  ADD KEY `Payment_userId_occurredAt_idx` (`userId`,`occurredAt`),
  ADD KEY `Payment_orderId_occurredAt_idx` (`orderId`,`occurredAt`),
  ADD KEY `Payment_status_idx` (`status`),
  ADD KEY `Payment_method_idx` (`method`),
  ADD KEY `Payment_reference_idx` (`reference`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Product_userId_sku_key` (`userId`,`sku`),
  ADD UNIQUE KEY `Product_userId_slug_key` (`userId`,`slug`),
  ADD UNIQUE KEY `Product_userId_barcode_key` (`userId`,`barcode`),
  ADD KEY `Product_userId_idx` (`userId`),
  ADD KEY `Product_userId_name_idx` (`userId`,`name`),
  ADD KEY `Product_userId_isActive_idx` (`userId`,`isActive`),
  ADD KEY `Product_userId_hasVariants_idx` (`userId`,`hasVariants`),
  ADD KEY `Product_userId_categoryId_isActive_idx` (`userId`,`categoryId`,`isActive`),
  ADD KEY `Product_categoryId_fkey` (`categoryId`);

--
-- Indexes for table `productattribute`
--
ALTER TABLE `productattribute`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductAttribute_productId_sort_idx` (`productId`,`sort`);

--
-- Indexes for table `productcategory`
--
ALTER TABLE `productcategory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ProductCategory_userId_slug_key` (`userId`,`slug`),
  ADD UNIQUE KEY `ProductCategory_userId_name_key` (`userId`,`name`),
  ADD KEY `ProductCategory_userId_idx` (`userId`),
  ADD KEY `ProductCategory_userId_parentId_idx` (`userId`,`parentId`),
  ADD KEY `ProductCategory_userId_parentId_sort_idx` (`userId`,`parentId`,`sort`),
  ADD KEY `ProductCategory_parentId_fkey` (`parentId`);

--
-- Indexes for table `productimage`
--
ALTER TABLE `productimage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductImage_productId_idx` (`productId`),
  ADD KEY `ProductImage_productId_sort_idx` (`productId`,`sort`);

--
-- Indexes for table `productvariant`
--
ALTER TABLE `productvariant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ProductVariant_productId_sku_key` (`productId`,`sku`),
  ADD KEY `ProductVariant_productId_idx` (`productId`),
  ADD KEY `ProductVariant_productId_isActive_idx` (`productId`,`isActive`);

--
-- Indexes for table `productvariantimage`
--
ALTER TABLE `productvariantimage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductVariantImage_variantId_idx` (`variantId`),
  ADD KEY `ProductVariantImage_variantId_sort_idx` (`variantId`,`sort`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Profile_userId_key` (`userId`),
  ADD UNIQUE KEY `Profile_username_key` (`username`);

--
-- Indexes for table `purchaseorder`
--
ALTER TABLE `purchaseorder`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PurchaseOrder_userId_number_key` (`userId`,`number`),
  ADD KEY `PurchaseOrder_userId_createdAt_idx` (`userId`,`createdAt`),
  ADD KEY `PurchaseOrder_status_idx` (`status`),
  ADD KEY `PurchaseOrder_supplierId_idx` (`supplierId`);

--
-- Indexes for table `purchaseorderline`
--
ALTER TABLE `purchaseorderline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `PurchaseOrderLine_poId_idx` (`poId`),
  ADD KEY `PurchaseOrderLine_productId_idx` (`productId`),
  ADD KEY `PurchaseOrderLine_variantId_idx` (`variantId`);

--
-- Indexes for table `refund`
--
ALTER TABLE `refund`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Refund_refundPaymentId_key` (`refundPaymentId`),
  ADD KEY `Refund_userId_createdAt_idx` (`userId`,`createdAt`),
  ADD KEY `Refund_orderId_createdAt_idx` (`orderId`,`createdAt`),
  ADD KEY `Refund_status_createdAt_idx` (`status`,`createdAt`),
  ADD KEY `Refund_reason_createdAt_idx` (`reason`,`createdAt`),
  ADD KEY `fk_refund_original_payment` (`originalPaymentId`);

--
-- Indexes for table `refunditem`
--
ALTER TABLE `refunditem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `RefundItem_refundId_idx` (`refundId`),
  ADD KEY `RefundItem_orderItemId_idx` (`orderItemId`);

--
-- Indexes for table `section`
--
ALTER TABLE `section`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Section_pageId_sort_idx` (`pageId`,`sort`),
  ADD KEY `Section_type_idx` (`type`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Session_tokenHash_key` (`tokenHash`),
  ADD KEY `Session_userId_type_idx` (`userId`,`type`),
  ADD KEY `Session_expiresAt_idx` (`expiresAt`),
  ADD KEY `Session_revokedAt_idx` (`revokedAt`);

--
-- Indexes for table `site`
--
ALTER TABLE `site`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Site_domain_key` (`domain`);

--
-- Indexes for table `spendcategory`
--
ALTER TABLE `spendcategory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SpendCategory_name_key` (`name`),
  ADD KEY `SpendCategory_type_idx` (`type`),
  ADD KEY `SpendCategory_userId_fkey` (`userId`);

--
-- Indexes for table `stockmovement`
--
ALTER TABLE `stockmovement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StockMovement_receiptItemId_key` (`receiptItemId`),
  ADD UNIQUE KEY `StockMovement_idempotencyKey_key` (`idempotencyKey`),
  ADD KEY `StockMovement_userId_occurredAt_idx` (`userId`,`occurredAt`),
  ADD KEY `StockMovement_productId_occurredAt_idx` (`productId`,`occurredAt`),
  ADD KEY `StockMovement_variantId_occurredAt_idx` (`variantId`,`occurredAt`),
  ADD KEY `StockMovement_orderItemId_occurredAt_idx` (`orderItemId`,`occurredAt`);

--
-- Indexes for table `storagebucket`
--
ALTER TABLE `storagebucket`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StorageBucket_integrationId_provider_name_key` (`integrationId`,`provider`,`name`),
  ADD KEY `StorageBucket_integrationId_provider_idx` (`integrationId`,`provider`);

--
-- Indexes for table `storageintegration`
--
ALTER TABLE `storageintegration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StorageIntegration_userId_key` (`userId`);

--
-- Indexes for table `storagelog`
--
ALTER TABLE `storagelog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StorageLog_integrationId_level_idx` (`integrationId`,`level`),
  ADD KEY `StorageLog_integrationId_at_idx` (`integrationId`,`at`);

--
-- Indexes for table `storageobject`
--
ALTER TABLE `storageobject`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StorageObject_integrationId_provider_bucket_key_key` (`integrationId`,`provider`,`bucket`,`key`),
  ADD KEY `StorageObject_integrationId_key_idx` (`integrationId`,`key`),
  ADD KEY `StorageObject_integrationId_visibility_idx` (`integrationId`,`visibility`),
  ADD KEY `StorageObject_integrationId_updatedAt_idx` (`integrationId`,`updatedAt`);

--
-- Indexes for table `storedfile`
--
ALTER TABLE `storedfile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StoredFile_storageKey_key` (`storageKey`),
  ADD KEY `StoredFile_ownerId_folderId_idx` (`ownerId`,`folderId`),
  ADD KEY `StoredFile_folderId_idx` (`folderId`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Supplier_userId_name_key` (`userId`,`name`),
  ADD KEY `Supplier_userId_idx` (`userId`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Transaction_inventoryReceiptId_key` (`inventoryReceiptId`),
  ADD KEY `Transaction_userId_occurredAt_idx` (`userId`,`occurredAt`),
  ADD KEY `Transaction_status_idx` (`status`),
  ADD KEY `Transaction_categoryId_idx` (`categoryId`),
  ADD KEY `Transaction_merchantId_idx` (`merchantId`);

--
-- Indexes for table `transactionline`
--
ALTER TABLE `transactionline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `TransactionLine_transactionId_idx` (`transactionId`),
  ADD KEY `TransactionLine_productId_idx` (`productId`);

--
-- Indexes for table `twofactor`
--
ALTER TABLE `twofactor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TwoFactor_userId_key` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_role_idx` (`role`),
  ADD KEY `User_lockedUntil_idx` (`lockedUntil`);

--
-- Indexes for table `webhook`
--
ALTER TABLE `webhook`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Webhook_userId_idx` (`userId`),
  ADD KEY `Webhook_userId_direction_status_idx` (`userId`,`direction`,`status`),
  ADD KEY `Webhook_userId_eventKey_idx` (`userId`,`eventKey`);

--
-- Indexes for table `webhookdelivery`
--
ALTER TABLE `webhookdelivery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `address`
--
ALTER TABLE `address`
  ADD CONSTRAINT `Address_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `backupcode`
--
ALTER TABLE `backupcode`
  ADD CONSTRAINT `BackupCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `block`
--
ALTER TABLE `block`
  ADD CONSTRAINT `Block_blockedId_fkey` FOREIGN KEY (`blockedId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Block_blockerId_fkey` FOREIGN KEY (`blockerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calendar`
--
ALTER TABLE `calendar`
  ADD CONSTRAINT `Calendar_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calendarevent`
--
ALTER TABLE `calendarevent`
  ADD CONSTRAINT `CalendarEvent_calendarId_fkey` FOREIGN KEY (`calendarId`) REFERENCES `calendar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CalendarEvent_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `conversationmember`
--
ALTER TABLE `conversationmember`
  ADD CONSTRAINT `ConversationMember_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ConversationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `email`
--
ALTER TABLE `email`
  ADD CONSTRAINT `Email_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `emailrecipient`
--
ALTER TABLE `emailrecipient`
  ADD CONSTRAINT `EmailRecipient_emailId_fkey` FOREIGN KEY (`emailId`) REFERENCES `email` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `emailtemplate`
--
ALTER TABLE `emailtemplate`
  ADD CONSTRAINT `EmailTemplate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `filefolder`
--
ALTER TABLE `filefolder`
  ADD CONSTRAINT `FileFolder_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FileFolder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `filefolder` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `friendrequest`
--
ALTER TABLE `friendrequest`
  ADD CONSTRAINT `FriendRequest_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FriendRequest_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `imageasset`
--
ALTER TABLE `imageasset`
  ADD CONSTRAINT `ImageAsset_folderId_userId_fkey` FOREIGN KEY (`folderId`,`userId`) REFERENCES `imagefolder` (`id`, `userId`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ImageAsset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `imagefolder`
--
ALTER TABLE `imagefolder`
  ADD CONSTRAINT `ImageFolder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `imagefolder` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ImageFolder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `integrationlog`
--
ALTER TABLE `integrationlog`
  ADD CONSTRAINT `IntegrationLog_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `integration` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventoryreceipt`
--
ALTER TABLE `inventoryreceipt`
  ADD CONSTRAINT `InventoryReceipt_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `purchaseorder` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryReceipt_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryReceipt_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryReceipt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventoryreceiptitem`
--
ALTER TABLE `inventoryreceiptitem`
  ADD CONSTRAINT `InventoryReceiptItem_poLineId_fkey` FOREIGN KEY (`poLineId`) REFERENCES `purchaseorderline` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryReceiptItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryReceiptItem_receiptId_fkey` FOREIGN KEY (`receiptId`) REFERENCES `inventoryreceipt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryReceiptItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `menuitem`
--
ALTER TABLE `menuitem`
  ADD CONSTRAINT `MenuItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `menuitem` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `MenuItem_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `site` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `merchant`
--
ALTER TABLE `merchant`
  ADD CONSTRAINT `Merchant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `page`
--
ALTER TABLE `page`
  ADD CONSTRAINT `Page_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menuitem` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Page_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `site` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `productcategory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productattribute`
--
ALTER TABLE `productattribute`
  ADD CONSTRAINT `ProductAttribute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productcategory`
--
ALTER TABLE `productcategory`
  ADD CONSTRAINT `ProductCategory_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `productcategory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productimage`
--
ALTER TABLE `productimage`
  ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productvariant`
--
ALTER TABLE `productvariant`
  ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productvariantimage`
--
ALTER TABLE `productvariantimage`
  ADD CONSTRAINT `ProductVariantImage_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profile`
--
ALTER TABLE `profile`
  ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchaseorder`
--
ALTER TABLE `purchaseorder`
  ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchaseorderline`
--
ALTER TABLE `purchaseorderline`
  ADD CONSTRAINT `PurchaseOrderLine_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `purchaseorder` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseOrderLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseOrderLine_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `refund`
--
ALTER TABLE `refund`
  ADD CONSTRAINT `Refund_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Refund_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_refund_original_payment` FOREIGN KEY (`originalPaymentId`) REFERENCES `payment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_refund_refund_payment` FOREIGN KEY (`refundPaymentId`) REFERENCES `payment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `refunditem`
--
ALTER TABLE `refunditem`
  ADD CONSTRAINT `RefundItem_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `orderitem` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `RefundItem_refundId_fkey` FOREIGN KEY (`refundId`) REFERENCES `refund` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `section`
--
ALTER TABLE `section`
  ADD CONSTRAINT `Section_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `spendcategory`
--
ALTER TABLE `spendcategory`
  ADD CONSTRAINT `SpendCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stockmovement`
--
ALTER TABLE `stockmovement`
  ADD CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `StockMovement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `StockMovement_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `storagebucket`
--
ALTER TABLE `storagebucket`
  ADD CONSTRAINT `StorageBucket_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `storageintegration` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `storageintegration`
--
ALTER TABLE `storageintegration`
  ADD CONSTRAINT `StorageIntegration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `storedfile`
--
ALTER TABLE `storedfile`
  ADD CONSTRAINT `StoredFile_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `filefolder` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `StoredFile_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supplier`
--
ALTER TABLE `supplier`
  ADD CONSTRAINT `Supplier_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `Transaction_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `spendcategory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactionline`
--
ALTER TABLE `transactionline`
  ADD CONSTRAINT `TransactionLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `TransactionLine_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transaction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `twofactor`
--
ALTER TABLE `twofactor`
  ADD CONSTRAINT `TwoFactor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
