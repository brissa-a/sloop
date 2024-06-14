/*
  Warnings:

  - You are about to drop the `VotingProposal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "VotingChoice" DROP CONSTRAINT "VotingChoice_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "VotingProposal" DROP CONSTRAINT "VotingProposal_groupId_fkey";

-- DropTable
DROP TABLE "VotingProposal";

-- CreateTable
CREATE TABLE "Proposal" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "groupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingChoice" ADD CONSTRAINT "VotingChoice_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
