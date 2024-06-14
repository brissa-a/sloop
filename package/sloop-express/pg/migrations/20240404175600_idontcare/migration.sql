/*
  Warnings:

  - You are about to drop the `TimelineElement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TimelineElement" DROP CONSTRAINT "TimelineElement_meetingId_fkey";

-- DropTable
DROP TABLE "TimelineElement";

-- CreateTable
CREATE TABLE "MeetingLog" (
    "id" VARCHAR(21) NOT NULL,
    "meetingId" VARCHAR(21) NOT NULL,
    "logId" VARCHAR(21) NOT NULL,

    CONSTRAINT "MeetingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" VARCHAR(21) NOT NULL,
    "type" TEXT NOT NULL,
    "meetingId" VARCHAR(21) NOT NULL,
    "misc" JSONB NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MeetingLog" ADD CONSTRAINT "MeetingLog_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingLog" ADD CONSTRAINT "MeetingLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
