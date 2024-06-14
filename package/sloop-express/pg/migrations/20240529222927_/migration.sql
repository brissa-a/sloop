/*
  Warnings:

  - You are about to drop the column `proposalId` on the `VotingChoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VotingChoice" DROP CONSTRAINT "VotingChoice_proposalId_fkey";

-- AlterTable
ALTER TABLE "VotingChoice" DROP COLUMN "proposalId";

-- CreateTable
CREATE TABLE "ProposalUnseen" (
    "id" VARCHAR(21) NOT NULL,
    "proposalId" VARCHAR(21) NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,

    CONSTRAINT "ProposalUnseen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteUnseen" (
    "id" VARCHAR(21) NOT NULL,
    "votingId" VARCHAR(21) NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VoteUnseen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingUnseen" (
    "id" VARCHAR(21) NOT NULL,
    "meetingId" VARCHAR(21) NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,

    CONSTRAINT "MeetingUnseen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProposalUnseen" ADD CONSTRAINT "ProposalUnseen_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalUnseen" ADD CONSTRAINT "ProposalUnseen_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalUnseen" ADD CONSTRAINT "ProposalUnseen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteUnseen" ADD CONSTRAINT "VoteUnseen_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteUnseen" ADD CONSTRAINT "VoteUnseen_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteUnseen" ADD CONSTRAINT "VoteUnseen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingUnseen" ADD CONSTRAINT "MeetingUnseen_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingUnseen" ADD CONSTRAINT "MeetingUnseen_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingUnseen" ADD CONSTRAINT "MeetingUnseen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
