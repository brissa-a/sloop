/*
  Warnings:

  - You are about to drop the column `logId` on the `MeetingLog` table. All the data in the column will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "MeetingLog" DROP CONSTRAINT "MeetingLog_logId_fkey";

-- AlterTable
ALTER TABLE "MeetingLog" DROP COLUMN "logId";

-- DropTable
DROP TABLE "Log";
