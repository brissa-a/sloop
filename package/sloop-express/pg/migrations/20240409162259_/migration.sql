/*
  Warnings:

  - You are about to drop the `_captains` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_members` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('EQUIPAGE', 'EQUIPE', 'ASSEMBLEE_PERMANENTE');

-- CreateEnum
CREATE TYPE "GroupMembershipRole" AS ENUM ('CAPTAIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "_captains" DROP CONSTRAINT "_captains_A_fkey";

-- DropForeignKey
ALTER TABLE "_captains" DROP CONSTRAINT "_captains_B_fkey";

-- DropForeignKey
ALTER TABLE "_members" DROP CONSTRAINT "_members_A_fkey";

-- DropForeignKey
ALTER TABLE "_members" DROP CONSTRAINT "_members_B_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "type" "GroupType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "voteGroupId" VARCHAR(21);

-- DropTable
DROP TABLE "_captains";

-- DropTable
DROP TABLE "_members";

-- CreateTable
CREATE TABLE "VoteGroup" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "groupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VoteGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" VARCHAR(21) NOT NULL,
    "role" "GroupMembershipRole" NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembership_groupId_userId_role_startDate_key" ON "GroupMembership"("groupId", "userId", "role", "startDate");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_voteGroupId_fkey" FOREIGN KEY ("voteGroupId") REFERENCES "VoteGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteGroup" ADD CONSTRAINT "VoteGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
