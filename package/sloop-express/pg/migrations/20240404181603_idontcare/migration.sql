/*
  Warnings:

  - You are about to alter the column `parentId` on the `MeetingLogEntry` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(21)`.

*/
-- AlterTable
ALTER TABLE "MeetingLogEntry" ADD COLUMN     "meetingLogEntryId" VARCHAR(21),
ALTER COLUMN "parentId" SET DATA TYPE VARCHAR(21);

-- AddForeignKey
ALTER TABLE "MeetingLogEntry" ADD CONSTRAINT "MeetingLogEntry_meetingLogEntryId_fkey" FOREIGN KEY ("meetingLogEntryId") REFERENCES "MeetingLogEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
