-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "site_id" TEXT;

-- CreateIndex
CREATE INDEX "idx_profiles_site_id" ON "profiles"("site_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
