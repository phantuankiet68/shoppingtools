/*
  Warnings:

  - You are about to drop the column `vendor` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "vendor",
ADD COLUMN     "market_price" DECIMAL(12,2),
ADD COLUMN     "price" DECIMAL(12,2),
ADD COLUMN     "product_qty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saving_price" DECIMAL(12,2);
