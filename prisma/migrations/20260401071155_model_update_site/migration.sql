-- AlterTable
ALTER TABLE "sites" ADD COLUMN     "type" "WebsiteType" NOT NULL DEFAULT 'ecommerce';

-- CreateIndex
CREATE INDEX "sites_type_idx" ON "sites"("type");
