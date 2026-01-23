/*
  Warnings:

  - Added the required column `userId` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Email_createdAt_idx` ON `email`;

-- DropIndex
DROP INDEX `Email_scheduledAt_idx` ON `email`;

-- DropIndex
DROP INDEX `Email_status_idx` ON `email`;

-- DropIndex
DROP INDEX `Email_type_idx` ON `email`;

-- AlterTable
ALTER TABLE `email` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Email_userId_idx` ON `Email`(`userId`);

-- CreateIndex
CREATE INDEX `Email_userId_status_idx` ON `Email`(`userId`, `status`);

-- CreateIndex
CREATE INDEX `Email_userId_type_idx` ON `Email`(`userId`, `type`);

-- CreateIndex
CREATE INDEX `Email_userId_scheduledAt_idx` ON `Email`(`userId`, `scheduledAt`);

-- CreateIndex
CREATE INDEX `Email_userId_createdAt_idx` ON `Email`(`userId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
