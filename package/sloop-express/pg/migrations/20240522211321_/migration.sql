-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_meetingId_fkey";

-- AlterTable
ALTER TABLE "Voting" ALTER COLUMN "meetingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
