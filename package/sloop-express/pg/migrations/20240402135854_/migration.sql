/*
  Warnings:

  - The primary key for the `AccessTokenGenerated` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Delegation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Meeting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Meeting` table. All the data in the column will be lost.
  - The primary key for the `Membership` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PointAgenda` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TimelineElement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pic` on the `User` table. All the data in the column will be lost.
  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AccessTokenGenerated" DROP CONSTRAINT "AccessTokenGenerated_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_delegateeId_fkey";

-- DropForeignKey
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_delegatorId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "PointAgenda" DROP CONSTRAINT "PointAgenda_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "TimelineElement" DROP CONSTRAINT "TimelineElement_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_delegatedToId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pointAgendaId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voterId_fkey";

-- DropForeignKey
ALTER TABLE "_Attendee" DROP CONSTRAINT "_Attendee_A_fkey";

-- DropForeignKey
ALTER TABLE "_Attendee" DROP CONSTRAINT "_Attendee_B_fkey";

-- AlterTable
ALTER TABLE "AccessTokenGenerated" DROP CONSTRAINT "AccessTokenGenerated_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "sessionId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "AccessTokenGenerated_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AccessTokenGenerated_id_seq";

-- AlterTable
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "delegatorId" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "delegateeId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "Delegation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Delegation_id_seq";

-- AlterTable
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_pkey",
DROP COLUMN "name",
ADD COLUMN     "equipageId" VARCHAR(21),
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "creatorId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Meeting_id_seq";

-- AlterTable
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "Membership_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Membership_id_seq";

-- AlterTable
ALTER TABLE "PointAgenda" DROP CONSTRAINT "PointAgenda_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "meetingId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "PointAgenda_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PointAgenda_id_seq";

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Session_id_seq";

-- AlterTable
ALTER TABLE "TimelineElement" DROP CONSTRAINT "TimelineElement_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "meetingId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "TimelineElement_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TimelineElement_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "pic",
ADD COLUMN     "avatarUrl" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "voterId" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "meetingId" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "delegatedToId" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "pointAgendaId" SET DATA TYPE VARCHAR(21),
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Vote_id_seq";

-- AlterTable
ALTER TABLE "_Attendee" ALTER COLUMN "A" SET DATA TYPE VARCHAR(21),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(21);

-- DropTable
DROP TABLE "Role";

-- CreateTable
CREATE TABLE "Equipage" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Equipage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "meetingId" VARCHAR(21) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Invitee" (
    "A" VARCHAR(21) NOT NULL,
    "B" VARCHAR(21) NOT NULL
);

-- CreateTable
CREATE TABLE "_captains" (
    "A" VARCHAR(21) NOT NULL,
    "B" VARCHAR(21) NOT NULL
);

-- CreateTable
CREATE TABLE "_members" (
    "A" VARCHAR(21) NOT NULL,
    "B" VARCHAR(21) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipage_slug_key" ON "Equipage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_Invitee_AB_unique" ON "_Invitee"("A", "B");

-- CreateIndex
CREATE INDEX "_Invitee_B_index" ON "_Invitee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_captains_AB_unique" ON "_captains"("A", "B");

-- CreateIndex
CREATE INDEX "_captains_B_index" ON "_captains"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_members_AB_unique" ON "_members"("A", "B");

-- CreateIndex
CREATE INDEX "_members_B_index" ON "_members"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessTokenGenerated" ADD CONSTRAINT "AccessTokenGenerated_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delegation" ADD CONSTRAINT "Delegation_delegatorId_fkey" FOREIGN KEY ("delegatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delegation" ADD CONSTRAINT "Delegation_delegateeId_fkey" FOREIGN KEY ("delegateeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_equipageId_fkey" FOREIGN KEY ("equipageId") REFERENCES "Equipage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineElement" ADD CONSTRAINT "TimelineElement_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAgenda" ADD CONSTRAINT "PointAgenda_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_delegatedToId_fkey" FOREIGN KEY ("delegatedToId") REFERENCES "Vote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pointAgendaId_fkey" FOREIGN KEY ("pointAgendaId") REFERENCES "PointAgenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Invitee" ADD CONSTRAINT "_Invitee_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Invitee" ADD CONSTRAINT "_Invitee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Attendee" ADD CONSTRAINT "_Attendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Attendee" ADD CONSTRAINT "_Attendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_captains" ADD CONSTRAINT "_captains_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_captains" ADD CONSTRAINT "_captains_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_members" ADD CONSTRAINT "_members_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_members" ADD CONSTRAINT "_members_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
