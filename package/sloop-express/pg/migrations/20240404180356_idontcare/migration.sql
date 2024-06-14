/*
  Warnings:

  - You are about to drop the column `input` on the `MeetingLogEntry` table. All the data in the column will be lost.
  - Added the required column `data` to the `MeetingLogEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingLogEntry" DROP COLUMN "input",
ADD COLUMN     "data" JSONB NOT NULL;
