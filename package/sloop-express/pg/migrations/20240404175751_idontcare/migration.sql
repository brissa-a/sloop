/*
  Warnings:

  - You are about to drop the column `misc` on the `Log` table. All the data in the column will be lost.
  - Added the required column `input` to the `MeetingLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `misc` to the `MeetingLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `MeetingLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MeetingLog" DROP CONSTRAINT "MeetingLog_logId_fkey";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "misc";

-- AlterTable
ALTER TABLE "MeetingLog" ADD COLUMN     "input" JSONB NOT NULL,
ADD COLUMN     "misc" JSONB NOT NULL,
ADD COLUMN     "note" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "logId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MeetingLog" ADD CONSTRAINT "MeetingLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE SET NULL ON UPDATE CASCADE;
