/*
  Warnings:

  - A unique constraint covering the columns `[userId,key]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `EmailTemplate_key_key` ON `emailtemplate`;

-- AlterTable
ALTER TABLE `emailtemplate` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `EmailTemplate_userId_idx` ON `EmailTemplate`(`userId`);

-- CreateIndex
CREATE INDEX `EmailTemplate_userId_isActive_idx` ON `EmailTemplate`(`userId`, `isActive`);

-- CreateIndex
CREATE UNIQUE INDEX `EmailTemplate_userId_key_key` ON `EmailTemplate`(`userId`, `key`);

-- AddForeignKey
ALTER TABLE `EmailTemplate` ADD CONSTRAINT `EmailTemplate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
