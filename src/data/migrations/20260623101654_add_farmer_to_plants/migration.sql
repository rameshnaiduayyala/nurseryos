/*
  Warnings:

  - Added the required column `farmer_id` to the `plants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plants" ADD COLUMN     "farmer_id" TEXT;

-- Backfill existing plants with the farmer user's ID
UPDATE "plants" SET "farmer_id" = (SELECT "id" FROM "users" WHERE "email" = 'farmer@nurseryos.com' LIMIT 1) WHERE "farmer_id" IS NULL;

-- Make column required
ALTER TABLE "plants" ALTER COLUMN "farmer_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
