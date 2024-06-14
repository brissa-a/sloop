/*
  Warnings:

  - Made the column `doneAt` on table `MeetingLogEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `doneById` on table `MeetingLogEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MeetingLogEntry" DROP CONSTRAINT "MeetingLogEntry_doneById_fkey";

-- AlterTable
ALTER TABLE "MeetingLogEntry" ALTER COLUMN "doneAt" SET NOT NULL,
ALTER COLUMN "doneById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MeetingLogEntry" ADD CONSTRAINT "MeetingLogEntry_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
