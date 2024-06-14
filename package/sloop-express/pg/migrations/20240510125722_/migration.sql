/*
  Warnings:

  - You are about to drop the column `delegatedToId` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the column `likeUserId` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the column `ofChoiceId` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the column `voterId` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the `ConfidentialSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VotingGroupDelegation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `doneById` to the `VotingVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doneByMembershipId` to the `VotingVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doneBySessionId` to the `VotingVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConfidentialSession" DROP CONSTRAINT "ConfidentialSession_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupDelegation" DROP CONSTRAINT "VotingGroupDelegation_givenById_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupDelegation" DROP CONSTRAINT "VotingGroupDelegation_receivedById_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupDelegation" DROP CONSTRAINT "VotingGroupDelegation_votingGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_delegatedToId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_likeUserId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_ofChoiceId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_voterId_fkey";

-- AlterTable
ALTER TABLE "VotingVote" DROP COLUMN "delegatedToId",
DROP COLUMN "likeUserId",
DROP COLUMN "ofChoiceId",
DROP COLUMN "score",
DROP COLUMN "voterId",
ADD COLUMN     "copiedId" VARCHAR(21),
ADD COLUMN     "copiedMembershipId" VARCHAR(21),
ADD COLUMN     "doneById" VARCHAR(21) NOT NULL,
ADD COLUMN     "doneByMembershipId" VARCHAR(21) NOT NULL,
ADD COLUMN     "doneBySessionId" VARCHAR(21) NOT NULL;

-- DropTable
DROP TABLE "ConfidentialSession";

-- DropTable
DROP TABLE "VotingGroupDelegation";

-- CreateTable
CREATE TABLE "VotingGroupCopy" (
    "id" VARCHAR(21) NOT NULL,
    "copierId" VARCHAR(21) NOT NULL,
    "copiedId" VARCHAR(21) NOT NULL,
    "power" INTEGER NOT NULL,
    "votingGroupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingGroupCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingVoteScore" (
    "id" VARCHAR(21) NOT NULL,
    "ofVoteId" VARCHAR(21) NOT NULL,
    "forChoiceId" VARCHAR(21) NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "VotingVoteScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VotingGroupCopy_copierId_copiedId_votingGroupId_key" ON "VotingGroupCopy"("copierId", "copiedId", "votingGroupId");

-- AddForeignKey
ALTER TABLE "VotingGroupCopy" ADD CONSTRAINT "VotingGroupCopy_copierId_fkey" FOREIGN KEY ("copierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupCopy" ADD CONSTRAINT "VotingGroupCopy_copiedId_fkey" FOREIGN KEY ("copiedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupCopy" ADD CONSTRAINT "VotingGroupCopy_votingGroupId_fkey" FOREIGN KEY ("votingGroupId") REFERENCES "VotingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_doneByMembershipId_fkey" FOREIGN KEY ("doneByMembershipId") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_doneBySessionId_fkey" FOREIGN KEY ("doneBySessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_copiedId_fkey" FOREIGN KEY ("copiedId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_copiedMembershipId_fkey" FOREIGN KEY ("copiedMembershipId") REFERENCES "VotingGroupMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVoteScore" ADD CONSTRAINT "VotingVoteScore_ofVoteId_fkey" FOREIGN KEY ("ofVoteId") REFERENCES "VotingVote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVoteScore" ADD CONSTRAINT "VotingVoteScore_forChoiceId_fkey" FOREIGN KEY ("forChoiceId") REFERENCES "VotingChoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
