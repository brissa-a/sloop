/*
  Warnings:

  - A unique constraint covering the columns `[currentAgendaPointId]` on the table `Meeting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inviteeId]` on the table `MeetingAttendee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "currentAgendaPointId" VARCHAR(21);

-- AlterTable
ALTER TABLE "MeetingInvitee" ADD COLUMN     "invitedAs" TEXT,
ALTER COLUMN "invitationMailSentAt" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PointAgenda" ADD COLUMN     "parentId" VARCHAR(21);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "meetingId" VARCHAR(21);

-- CreateTable
CREATE TABLE "MeetingPresider" (
    "id" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "meetingId" VARCHAR(21) NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "MeetingPresider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_currentAgendaPointId_key" ON "Meeting"("currentAgendaPointId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAttendee_inviteeId_key" ON "MeetingAttendee"("inviteeId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_currentAgendaPointId_fkey" FOREIGN KEY ("currentAgendaPointId") REFERENCES "PointAgenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingPresider" ADD CONSTRAINT "MeetingPresider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingPresider" ADD CONSTRAINT "MeetingPresider_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAgenda" ADD CONSTRAINT "PointAgenda_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PointAgenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
