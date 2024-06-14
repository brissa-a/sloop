/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MeetingLogEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MeetingLogEntry" DROP COLUMN "createdAt",
ADD COLUMN     "doneAt" TIMESTAMP(3),
ADD COLUMN     "doneById" VARCHAR(21);

-- AddForeignKey
ALTER TABLE "MeetingLogEntry" ADD CONSTRAINT "MeetingLogEntry_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
