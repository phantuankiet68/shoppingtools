/*
  Warnings:

  - You are about to drop the `product_option_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variant_option_values` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_option_values" DROP CONSTRAINT "product_option_values_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variant_option_values" DROP CONSTRAINT "product_variant_option_values_option_value_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variant_option_values" DROP CONSTRAINT "product_variant_option_values_variant_id_fkey";

-- DropTable
DROP TABLE "product_option_values";

-- DropTable
DROP TABLE "product_variant_option_values";
