/*
  Warnings:

  - You are about to drop the `Choice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Delegation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserToVotingGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_delegatedById_fkey";

-- DropForeignKey
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_delegatedToId_fkey";

-- DropForeignKey
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_votingGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_delegatedToId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_ofChoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_ofVotingId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voterId_fkey";

-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_choiceId_fkey";

-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "_UserToVotingGroup" DROP CONSTRAINT "_UserToVotingGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToVotingGroup" DROP CONSTRAINT "_UserToVotingGroup_B_fkey";

-- DropTable
DROP TABLE "Choice";

-- DropTable
DROP TABLE "Delegation";

-- DropTable
DROP TABLE "Proposal";

-- DropTable
DROP TABLE "Vote";

-- DropTable
DROP TABLE "_UserToVotingGroup";

-- CreateTable
CREATE TABLE "VotingGroupMembership" (
    "id" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingGroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingGroupDelegation" (
    "id" VARCHAR(21) NOT NULL,
    "delegatedById" VARCHAR(21) NOT NULL,
    "delegatedToId" VARCHAR(21) NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "votingGroupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingGroupDelegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingProposal" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "groupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingChoice" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "proposalId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingVote" (
    "id" VARCHAR(21) NOT NULL,
    "ofVotingId" VARCHAR(21) NOT NULL,
    "voterId" VARCHAR(21) NOT NULL,
    "delegatedToId" VARCHAR(21),
    "ofChoiceId" VARCHAR(21),
    "weight" DOUBLE PRECISION NOT NULL,
    "meetingId" VARCHAR(21),

    CONSTRAINT "VotingVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VotingGroupDelegation_delegatedById_delegatedToId_votingGro_key" ON "VotingGroupDelegation"("delegatedById", "delegatedToId", "votingGroupId");

-- AddForeignKey
ALTER TABLE "VotingGroupMembership" ADD CONSTRAINT "VotingGroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupMembership" ADD CONSTRAINT "VotingGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "VotingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupDelegation" ADD CONSTRAINT "VotingGroupDelegation_delegatedById_fkey" FOREIGN KEY ("delegatedById") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupDelegation" ADD CONSTRAINT "VotingGroupDelegation_delegatedToId_fkey" FOREIGN KEY ("delegatedToId") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupDelegation" ADD CONSTRAINT "VotingGroupDelegation_votingGroupId_fkey" FOREIGN KEY ("votingGroupId") REFERENCES "VotingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingProposal" ADD CONSTRAINT "VotingProposal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "VotingProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "VotingChoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingChoice" ADD CONSTRAINT "VotingChoice_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "VotingProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_ofVotingId_fkey" FOREIGN KEY ("ofVotingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_delegatedToId_fkey" FOREIGN KEY ("delegatedToId") REFERENCES "VotingGroupMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_ofChoiceId_fkey" FOREIGN KEY ("ofChoiceId") REFERENCES "VotingChoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
