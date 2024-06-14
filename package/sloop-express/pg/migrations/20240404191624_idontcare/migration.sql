-- AlterTable
ALTER TABLE "MeetingAttendee" ADD COLUMN     "inviteeId" TEXT;

-- AddForeignKey
ALTER TABLE "MeetingAttendee" ADD CONSTRAINT "MeetingAttendee_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "MeetingInvitee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
