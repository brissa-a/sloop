/*
  Warnings:

  - You are about to drop the column `data` on the `MeetingLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `doneAt` on the `MeetingLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `doneById` on the `MeetingLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `misc` on the `MeetingLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `MeetingLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `MeetingLogEntry` table. All the data in the column will be lost.
  - Added the required column `entryId` to the `MeetingLogEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MeetingLogEntry" DROP CONSTRAINT "MeetingLogEntry_doneById_fkey";

-- AlterTable
ALTER TABLE "MeetingLogEntry" DROP COLUMN "data",
DROP COLUMN "doneAt",
DROP COLUMN "doneById",
DROP COLUMN "misc",
DROP COLUMN "note",
DROP COLUMN "type",
ADD COLUMN     "entryId" VARCHAR(21) NOT NULL;

-- CreateTable
CREATE TABLE "MeetingMessage" (
    "id" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "reportedById" VARCHAR(21) NOT NULL,
    "meetingId" VARCHAR(21) NOT NULL,
    "agendaPointId" VARCHAR(21),
    "content" TEXT NOT NULL,
    "parentId" VARCHAR(21),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MeetingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLogEntry" (
    "id" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "entryId" VARCHAR(21) NOT NULL,

    CONSTRAINT "UserLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" VARCHAR(21) NOT NULL,
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doneById" VARCHAR(21) NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserLogEntry_userId_idx" ON "UserLogEntry"("userId");

-- AddForeignKey
ALTER TABLE "MeetingMessage" ADD CONSTRAINT "MeetingMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingMessage" ADD CONSTRAINT "MeetingMessage_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingMessage" ADD CONSTRAINT "MeetingMessage_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingMessage" ADD CONSTRAINT "MeetingMessage_agendaPointId_fkey" FOREIGN KEY ("agendaPointId") REFERENCES "PointAgenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingLogEntry" ADD CONSTRAINT "MeetingLogEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "LogEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLogEntry" ADD CONSTRAINT "UserLogEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLogEntry" ADD CONSTRAINT "UserLogEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "LogEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
