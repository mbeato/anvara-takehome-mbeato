-- AlterTable
ALTER TABLE "ad_slots" ADD COLUMN "bookedBySponsorId" TEXT;

-- AddForeignKey
ALTER TABLE "ad_slots" ADD CONSTRAINT "ad_slots_bookedBySponsorId_fkey" FOREIGN KEY ("bookedBySponsorId") REFERENCES "sponsors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
