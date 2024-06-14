/*
  Warnings:

  - You are about to drop the column `parentId` on the `MeetingLogEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeetingLogEntry" DROP CONSTRAINT "MeetingLogEntry_parentId_fkey";

-- AlterTable
ALTER TABLE "MeetingLogEntry" DROP COLUMN "parentId";
