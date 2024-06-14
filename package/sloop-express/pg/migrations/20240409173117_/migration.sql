/*
  Warnings:

  - You are about to drop the column `filter` on the `Delegation` table. All the data in the column will be lost.
  - You are about to drop the column `voteGroupId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `VoteGroup` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `votingGroupId` to the `Delegation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "GroupType" ADD VALUE 'CONSEIL';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_voteGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VoteGroup" DROP CONSTRAINT "VoteGroup_groupId_fkey";

-- AlterTable
ALTER TABLE "Delegation" DROP COLUMN "filter",
ADD COLUMN     "votingGroupId" VARCHAR(21) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "voteGroupId";

-- DropTable
DROP TABLE "VoteGroup";

-- CreateTable
CREATE TABLE "VotingGroup" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "groupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToVotingGroup" (
    "A" VARCHAR(21) NOT NULL,
    "B" VARCHAR(21) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserToVotingGroup_AB_unique" ON "_UserToVotingGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToVotingGroup_B_index" ON "_UserToVotingGroup"("B");

-- AddForeignKey
ALTER TABLE "Delegation" ADD CONSTRAINT "Delegation_votingGroupId_fkey" FOREIGN KEY ("votingGroupId") REFERENCES "VotingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingGroup" ADD CONSTRAINT "VotingGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToVotingGroup" ADD CONSTRAINT "_UserToVotingGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToVotingGroup" ADD CONSTRAINT "_UserToVotingGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "VotingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
