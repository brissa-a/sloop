/*
  Warnings:

  - Added the required column `startDate` to the `VotingGroupMembership` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VotingGroupDelegation" DROP CONSTRAINT "VotingGroupDelegation_givenById_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupDelegation" DROP CONSTRAINT "VotingGroupDelegation_receivedById_fkey";

-- AlterTable
ALTER TABLE "VotingGroupMembership" ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "VotingGroupDelegation" ADD CONSTRAINT "VotingGroupDelegation_givenById_fkey" FOREIGN KEY ("givenById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupDelegation" ADD CONSTRAINT "VotingGroupDelegation_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
