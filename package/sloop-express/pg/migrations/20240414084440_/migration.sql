/*
  Warnings:

  - You are about to drop the column `delegatedById` on the `VotingGroupDelegation` table. All the data in the column will be lost.
  - You are about to drop the column `delegatedToId` on the `VotingGroupDelegation` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `VotingGroupMembership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[givenById,receivedById,votingGroupId]` on the table `VotingGroupDelegation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `givenById` to the `VotingGroupDelegation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedById` to the `VotingGroupDelegation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `votingGroupId` to the `VotingGroupMembership` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VotingGroupDelegation" DROP CONSTRAINT "VotingGroupDelegation_delegatedById_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupDelegation" DROP CONSTRAINT "VotingGroupDelegation_delegatedToId_fkey";

-- DropForeignKey
ALTER TABLE "VotingGroupMembership" DROP CONSTRAINT "VotingGroupMembership_groupId_fkey";

-- DropIndex
DROP INDEX "VotingGroupDelegation_delegatedById_delegatedToId_votingGro_key";

-- AlterTable
ALTER TABLE "VotingGroupDelegation" DROP COLUMN "delegatedById",
DROP COLUMN "delegatedToId",
ADD COLUMN     "givenById" VARCHAR(21) NOT NULL,
ADD COLUMN     "receivedById" VARCHAR(21) NOT NULL;

-- AlterTable
ALTER TABLE "VotingGroupMembership" DROP COLUMN "groupId",
ADD COLUMN     "votingGroupId" VARCHAR(21) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VotingGroupDelegation_givenById_receivedById_votingGroupId_key" ON "VotingGroupDelegation"("givenById", "receivedById", "votingGroupId");

-- AddForeignKey
ALTER TABLE "VotingGroupMembership" ADD CONSTRAINT "VotingGroupMembership_votingGroupId_fkey" FOREIGN KEY ("votingGroupId") REFERENCES "VotingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupDelegation" ADD CONSTRAINT "VotingGroupDelegation_givenById_fkey" FOREIGN KEY ("givenById") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroupDelegation" ADD CONSTRAINT "VotingGroupDelegation_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "VotingGroupMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
