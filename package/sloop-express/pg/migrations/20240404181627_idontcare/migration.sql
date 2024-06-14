/*
  Warnings:

  - You are about to drop the column `meetingLogEntryId` on the `MeetingLogEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeetingLogEntry" DROP CONSTRAINT "MeetingLogEntry_meetingLogEntryId_fkey";

-- AlterTable
ALTER TABLE "MeetingLogEntry" DROP COLUMN "meetingLogEntryId";

-- AddForeignKey
ALTER TABLE "MeetingLogEntry" ADD CONSTRAINT "MeetingLogEntry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MeetingLogEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
