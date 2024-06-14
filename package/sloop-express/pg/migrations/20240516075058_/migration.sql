/*
  Warnings:

  - You are about to drop the column `doneById` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the column `doneByMembershipId` on the `VotingVote` table. All the data in the column will be lost.
  - You are about to drop the column `doneBySessionId` on the `VotingVote` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `VotingVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterId` to the `VotingVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterMembershipId` to the `VotingVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_doneById_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_doneByMembershipId_fkey";

-- DropForeignKey
ALTER TABLE "VotingVote" DROP CONSTRAINT "VotingVote_doneBySessionId_fkey";

-- AlterTable
ALTER TABLE "VotingVote" DROP COLUMN "doneById",
DROP COLUMN "doneByMembershipId",
DROP COLUMN "doneBySessionId",
ADD COLUMN     "createdById" VARCHAR(21) NOT NULL,
ADD COLUMN     "voterId" VARCHAR(21) NOT NULL,
ADD COLUMN     "voterMembershipId" VARCHAR(21) NOT NULL;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_voterMembershipId_fkey" FOREIGN KEY ("voterMembershipId") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
