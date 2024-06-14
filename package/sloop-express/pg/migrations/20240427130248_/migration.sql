/*
  Warnings:

  - You are about to drop the column `choiceId` on the `Voting` table. All the data in the column will be lost.
  - You are about to drop the column `meetingId` on the `VotingVote` table. All the data in the column will be lost.
  - Added the required column `score` to the `VotingVote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VotingMethod" AS ENUM ('BORDA', 'SCORE_VOTING', 'APPROVAL');

-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_choiceId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_meetingId_fkey";

-- AlterTable
ALTER TABLE "Voting" DROP COLUMN "choiceId";

-- AlterTable
ALTER TABLE "VotingProposal" ADD COLUMN     "votingMethod" "VotingMethod",
ADD COLUMN     "votingMethodParam" JSONB;

-- AlterTable
ALTER TABLE "VotingVote" DROP COLUMN "meetingId",
ADD COLUMN     "score" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_VotingToVotingChoice" (
    "A" VARCHAR(21) NOT NULL,
    "B" VARCHAR(21) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VotingToVotingChoice_AB_unique" ON "_VotingToVotingChoice"("A", "B");

-- CreateIndex
CREATE INDEX "_VotingToVotingChoice_B_index" ON "_VotingToVotingChoice"("B");

-- AddForeignKey
ALTER TABLE "_VotingToVotingChoice" ADD CONSTRAINT "_VotingToVotingChoice_A_fkey" FOREIGN KEY ("A") REFERENCES "Voting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VotingToVotingChoice" ADD CONSTRAINT "_VotingToVotingChoice_B_fkey" FOREIGN KEY ("B") REFERENCES "VotingChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
