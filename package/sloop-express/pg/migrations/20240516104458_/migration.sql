/*
  Warnings:

  - You are about to drop the column `copiedMembershipId` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the column `voterMembershipId` on the `VotingVote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[voterId]` on the table `VotingVote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `validVoterMembershipId` to the `VotingVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_copiedMembershipId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_voterMembershipId_fkey";

-- AlterTable
ALTER TABLE "VotingVote" DROP COLUMN "copiedMembershipId",
DROP COLUMN "voterMembershipId",
ADD COLUMN     "validCopiedMembershipId" VARCHAR(21),
ADD COLUMN     "validVoterMembershipId" VARCHAR(21) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VotingVote_voterId_key" ON "VotingVote"("voterId");

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_validVoterMembershipId_fkey" FOREIGN KEY ("validVoterMembershipId") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_validCopiedMembershipId_fkey" FOREIGN KEY ("validCopiedMembershipId") REFERENCES "VotingGroupMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
