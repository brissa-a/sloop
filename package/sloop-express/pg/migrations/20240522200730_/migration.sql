/*
  Warnings:

  - You are about to drop the column `votingGroupId` on the `Voting` table. All the data in the column will be lost.
  - You are about to drop the `Membership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VotingGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VotingGroupCopy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VotingGroupMembership` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `groupId` to the `Voting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_votingGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroup" DROP CONSTRAINT "VotingGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupCopy" DROP CONSTRAINT "VotingGroupCopy_copiedId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupCopy" DROP CONSTRAINT "VotingGroupCopy_copierId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupCopy" DROP CONSTRAINT "VotingGroupCopy_votingGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupMembership" DROP CONSTRAINT "VotingGroupMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupMembership" DROP CONSTRAINT "VotingGroupMembership_votingGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_validCopiedMembershipId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_validVoterMembershipId_fkey";

-- AlterTable
ALTER TABLE "Voting" DROP COLUMN "votingGroupId",
ADD COLUMN     "groupId" VARCHAR(21) NOT NULL;

-- DropTable
DROP TABLE "Membership";

-- DropTable
DROP TABLE "VotingGroup";

-- DropTable
DROP TABLE "VotingGroupCopy";

-- DropTable
DROP TABLE "VotingGroupMembership";

-- CreateTable
CREATE TABLE "AppMembership" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "transactionProof" TEXT,
    "note" TEXT,
    "archive" JSONB NOT NULL,
    "misc" JSONB NOT NULL,

    CONSTRAINT "AppMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupCopy" (
    "id" VARCHAR(21) NOT NULL,
    "copierId" VARCHAR(21) NOT NULL,
    "copiedId" VARCHAR(21) NOT NULL,
    "power" INTEGER NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "GroupCopy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupCopy_copierId_copiedId_groupId_key" ON "GroupCopy"("copierId", "copiedId", "groupId");

-- AddForeignKey
ALTER TABLE "AppMembership" ADD CONSTRAINT "AppMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupCopy" ADD CONSTRAINT "GroupCopy_copierId_fkey" FOREIGN KEY ("copierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupCopy" ADD CONSTRAINT "GroupCopy_copiedId_fkey" FOREIGN KEY ("copiedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupCopy" ADD CONSTRAINT "GroupCopy_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_validVoterMembershipId_fkey" FOREIGN KEY ("validVoterMembershipId") REFERENCES "GroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_validCopiedMembershipId_fkey" FOREIGN KEY ("validCopiedMembershipId") REFERENCES "GroupMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
