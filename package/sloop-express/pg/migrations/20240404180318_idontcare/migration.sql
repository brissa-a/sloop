/*
  Warnings:

  - You are about to drop the `MeetingLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeetingLog" DROP CONSTRAINT "MeetingLog_meetingId_fkey";

-- DropTable
DROP TABLE "MeetingLog";

-- CreateTable
CREATE TABLE "MeetingLogEntry" (
    "id" VARCHAR(21) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meetingId" VARCHAR(21) NOT NULL,
    "type" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "misc" JSONB NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "MeetingLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingLogEntry_meetingId_idx" ON "MeetingLogEntry"("meetingId");

-- AddForeignKey
ALTER TABLE "MeetingLogEntry" ADD CONSTRAINT "MeetingLogEntry_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
